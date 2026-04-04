import db from '../config/database.js';
import BiometricValidator from '../utils/BiometricValidator.js';

/**
 * Store device reading with biometric validation
 * Validates data against realistic ranges before storing
 * Flags anomalous readings for further review
 */
export async function storeReading(req, res) {
  try {
    const { heart_rate, blood_pressure_sys, blood_pressure_dia, spo2, body_temp, hrv, steps } = req.body;
    const userId = req.user.userId;

    const validation = BiometricValidator.validateReading(req.body);

    if (!validation.valid) {
      return res.status(400).json({
        message: 'Invalid biometric data received',
        errors: validation.errors,
        warnings: validation.warnings
      });
    }

    const isAnomaly = validation.isAnomaly;

    const [result] = await db.query(
      `INSERT INTO device_readings (user_id, heart_rate, blood_pressure_sys, blood_pressure_dia, spo2, body_temp, hrv, steps, is_anomaly, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP) RETURNING id`,
      [userId, heart_rate, blood_pressure_sys, blood_pressure_dia, spo2, body_temp, hrv, steps, isAnomaly]
    );

    res.status(201).json({
      message: 'Reading stored successfully',
      data: {
        id: result[0]?.id || result?.id,
        heart_rate,
        blood_pressure_sys,
        blood_pressure_dia,
        spo2,
        body_temp,
        hrv,
        steps,
        is_anomaly: isAnomaly
      },
      isAnomalous: isAnomaly,
      warnings: validation.warnings
    });
  } catch (error) {
    console.error('Error storing reading:', error);
    res.status(500).json({ message: 'Error storing reading', error: error.message });
  }
}

/**
 * Retrieve the latest biometric reading for the user
 */
export async function getLatestReading(req, res) {
  try {
    const userId = req.user.userId;

    const [reading] = await db.query(
      `SELECT * FROM device_readings WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    if (reading.length === 0) {
      return res.json({
        message: 'No readings found',
        reading: null
      });
    }

    res.json({
      reading: reading[0]
    });
  } catch (error) {
    console.error('Error fetching reading:', error);
    res.status(500).json({ message: 'Error fetching reading', error: error.message });
  }
}

/**
 * Get validated readings from the past N days
 * Re-validates each reading against current standards
 */
export async function getReadingsWithValidation(req, res) {
  try {
    const userId = req.user.userId;
    const { days = 7 } = req.query;

    const [readings] = await db.query(
      `SELECT * FROM device_readings 
       WHERE user_id = $1 AND created_at >= NOW() - (CAST($2 as int) * INTERVAL '1 day')
       ORDER BY created_at DESC`,
      [userId, days]
    );

    const validatedReadings = (readings || []).map(reading => {
      const validation = BiometricValidator.validateReading(reading);
      return {
        ...reading,
        is_valid: validation.valid,
        is_anomaly: validation.isAnomaly,
        errors: validation.errors,
        warnings: validation.warnings
      };
    });

    res.json({
      readings: validatedReadings.filter(r => r.is_valid),
      rejected: validatedReadings.filter(r => !r.is_valid),
      total: validatedReadings.length,
      validCount: validatedReadings.filter(r => r.is_valid).length,
      rejectedCount: validatedReadings.filter(r => !r.is_valid).length
    });
  } catch (error) {
    console.error('Error fetching readings:', error);
    res.status(500).json({ message: 'Error fetching readings', error: error.message });
  }
}
