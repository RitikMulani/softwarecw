import db from '../config/database.js';
import BiometricValidator from '../utils/BiometricValidator.js';

/**
 * Store device reading with validation
 */
export async function storeReading(req, res) {
  try {
    const { heart_rate, blood_pressure_sys, blood_pressure_dia, spo2, body_temp, hrv, steps } = req.body;
    const userId = req.user.userId;

    // Validate the incoming data
    const validation = BiometricValidator.validateReading(req.body);

    if (!validation.valid) {
      // Data is invalid - return error
      return res.status(400).json({
        message: 'Invalid biometric data received',
        errors: validation.errors,
        warnings: validation.warnings
      });
    }

    // Check if data contains anomalies (warnings)
    const isAnomaly = validation.isAnomaly;

    // Store the reading in database (if your DB exists)
    // For now, we'll just return success and store the data
    const readingData = {
      heart_rate,
      blood_pressure_sys,
      blood_pressure_dia,
      spo2,
      body_temp,
      hrv,
      steps,
      is_anomaly: isAnomaly
    };

    // TODO: Insert into device_readings table when DB schema is ready
    // const [result] = await db.query(
    //   `INSERT INTO device_readings (user_id, heart_rate, blood_pressure_sys, blood_pressure_dia, spo2, body_temp, hrv, steps, is_anomaly)
    //    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    //   [userId, heart_rate, blood_pressure_sys, blood_pressure_dia, spo2, body_temp, hrv, steps, isAnomaly]
    // );

    res.status(201).json({
      message: 'Reading stored successfully',
      data: readingData,
      isAnomalous: isAnomaly,
      warnings: validation.warnings
    });
  } catch (error) {
    console.error('Error storing reading:', error);
    res.status(500).json({ message: 'Error storing reading', error: error.message });
  }
}

/**
 * Get latest reading
 */
export async function getLatestReading(req, res) {
  try {
    const userId = req.user.userId;

    // TODO: Query from device_readings table when DB schema is ready
    // const [reading] = await db.query(
    //   `SELECT * FROM device_readings WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
    //   [userId]
    // );

    // For now, return mock data
    const mockReading = {
      heart_rate: 72,
      blood_pressure_sys: 120,
      blood_pressure_dia: 80,
      spo2: 98,
      body_temp: 36.8,
      hrv: 55,
      steps: 8500,
      created_at: new Date()
    };

    res.json({
      reading: mockReading
    });
  } catch (error) {
    console.error('Error fetching reading:', error);
    res.status(500).json({ message: 'Error fetching reading', error: error.message });
  }
}

/**
 * Get readings with validation status
 */
export async function getReadingsWithValidation(req, res) {
  try {
    const userId = req.user.userId;
    const { days = 7 } = req.query;

    // TODO: Query from device_readings table when DB schema is ready
    // const [readings] = await db.query(
    //   `SELECT * FROM device_readings 
    //    WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    //    ORDER BY created_at DESC`,
    //   [userId, days]
    // );

    // For now, return mock data with validation
    const mockReadings = [
      { heart_rate: 72, spo2: 98, steps: 8500, created_at: new Date(), is_valid: true },
      { heart_rate: 1000, spo2: 98, steps: 8500, created_at: new Date(), is_valid: false, reason: 'Heart rate unrealistic' }
    ];

    const validatedReadings = mockReadings.map(reading => {
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
      readings: validatedReadings.filter(r => r.is_valid), // Only return valid readings
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
