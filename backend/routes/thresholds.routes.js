import express from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Get user's biometric thresholds
 * GET /api/thresholds
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const [thresholds] = await db.query(
      'SELECT * FROM biometric_thresholds WHERE user_id = ?',
      [userId]
    );

    if (thresholds.length === 0) {
      // Return default thresholds
      return res.json({
        thresholds: {
          user_id: userId,
          heart_rate_alert_above: 120,
          heart_rate_alert_below: 50,
          blood_pressure_sys_alert_above: 140,
          blood_pressure_sys_alert_below: 90,
          blood_pressure_dia_alert_above: 90,
          blood_pressure_dia_alert_below: 60,
          spo2_alert_above: 100,
          spo2_alert_below: 95,
          body_temp_alert_above: 38,
          body_temp_alert_below: 36,
          steps_alert_above: 15000,
          steps_alert_below: 1000,
          hrv_alert_above: 150,
          hrv_alert_below: 20
        }
      });
    }

    res.json({ thresholds: thresholds[0] });
  } catch (error) {
    console.error('Error fetching thresholds:', error);
    res.status(500).json({ message: 'Error fetching thresholds', error: error.message });
  }
});

/**
 * Update user's biometric thresholds
 * PUT /api/thresholds
 */
router.put('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      heart_rate_alert_above,
      heart_rate_alert_below,
      blood_pressure_sys_alert_above,
      blood_pressure_sys_alert_below,
      blood_pressure_dia_alert_above,
      blood_pressure_dia_alert_below,
      spo2_alert_above,
      spo2_alert_below,
      body_temp_alert_above,
      body_temp_alert_below,
      steps_alert_above,
      steps_alert_below,
      hrv_alert_above,
      hrv_alert_below
    } = req.body;

    // Check if thresholds exist
    const [existing] = await db.query(
      'SELECT id FROM biometric_thresholds WHERE user_id = ?',
      [userId]
    );

    if (existing.length > 0) {
      // Update existing
      await db.query(
        `UPDATE biometric_thresholds SET 
          heart_rate_alert_above = ?, heart_rate_alert_below = ?,
          blood_pressure_sys_alert_above = ?, blood_pressure_sys_alert_below = ?,
          blood_pressure_dia_alert_above = ?, blood_pressure_dia_alert_below = ?,
          spo2_alert_above = ?, spo2_alert_below = ?,
          body_temp_alert_above = ?, body_temp_alert_below = ?,
          steps_alert_above = ?, steps_alert_below = ?,
          hrv_alert_above = ?, hrv_alert_below = ?,
          updated_at = NOW()
         WHERE user_id = ?`,
        [
          heart_rate_alert_above,
          heart_rate_alert_below,
          blood_pressure_sys_alert_above,
          blood_pressure_sys_alert_below,
          blood_pressure_dia_alert_above,
          blood_pressure_dia_alert_below,
          spo2_alert_above,
          spo2_alert_below,
          body_temp_alert_above,
          body_temp_alert_below,
          steps_alert_above,
          steps_alert_below,
          hrv_alert_above,
          hrv_alert_below,
          userId
        ]
      );
    } else {
      // Create new
      await db.query(
        `INSERT INTO biometric_thresholds (
          user_id, heart_rate_alert_above, heart_rate_alert_below,
          blood_pressure_sys_alert_above, blood_pressure_sys_alert_below,
          blood_pressure_dia_alert_above, blood_pressure_dia_alert_below,
          spo2_alert_above, spo2_alert_below,
          body_temp_alert_above, body_temp_alert_below,
          steps_alert_above, steps_alert_below,
          hrv_alert_above, hrv_alert_below,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          userId,
          heart_rate_alert_above,
          heart_rate_alert_below,
          blood_pressure_sys_alert_above,
          blood_pressure_sys_alert_below,
          blood_pressure_dia_alert_above,
          blood_pressure_dia_alert_below,
          spo2_alert_above,
          spo2_alert_below,
          body_temp_alert_above,
          body_temp_alert_below,
          steps_alert_above,
          steps_alert_below,
          hrv_alert_above,
          hrv_alert_below
        ]
      );
    }

    res.json({ message: 'Thresholds updated successfully', success: true });
  } catch (error) {
    console.error('Error updating thresholds:', error);
    res.status(500).json({ message: 'Error updating thresholds', error: error.message });
  }
});

export default router;
