import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

/**
 * Get all users (patients and doctors)
 */
router.get('/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    // Get all patients
    const [patients] = await db.query(
      `SELECT id, email, full_name, phone, date_of_birth, gender, created_at 
       FROM users 
       WHERE user_type = 'patient' 
       ORDER BY created_at DESC`
    );

    // Get all doctors
    const [doctors] = await db.query(
      `SELECT id, email, full_name, phone, date_of_birth, gender, created_at 
       FROM users 
       WHERE user_type = 'doctor' 
       ORDER BY created_at DESC`
    );

    res.json({
      users: patients,
      doctors: doctors
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

/**
 * Create a new doctor account (admin only)
 */
router.post('/create-doctor', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { email, password, full_name, phone, date_of_birth, gender, specialization, qualification, experience_years, consultation_fee } = req.body;

    // Validate required fields
    if (!email || !password || !full_name) {
      return res.status(400).json({ message: 'Email, password, and full name are required' });
    }

    // Check if email already exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create doctor user account
    const [result] = await db.query(
      `INSERT INTO users (email, password, user_type, full_name, phone, date_of_birth, gender, created_at) 
       VALUES ($1, $2, 'doctor', $3, $4, $5, $6, CURRENT_TIMESTAMP) RETURNING id`,
      [email, hashedPassword, full_name, phone || null, date_of_birth || null, gender || null]
    );

    const userId = result[0]?.id || result?.id;

    // Create doctor details entry
    if (userId) {
      await db.query(
        `INSERT INTO doctors (user_id, specialization, qualification, experience_years, consultation_fee) 
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, specialization || null, qualification || null, experience_years || null, consultation_fee || null]
      );
    }

    res.status(201).json({
      message: 'Doctor account created successfully',
      doctorId: userId
    });
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({ message: 'Error creating doctor account', error: error.message });
  }
});

/**
 * Delete a user (patient or doctor)
 */
router.delete('/users/:userId', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists and is not an admin
    const [user] = await db.query('SELECT user_type FROM users WHERE id = $1', [userId]);
    
    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user[0].user_type === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin accounts' });
    }

    // Delete user (cascade will handle related records)
    await db.query('DELETE FROM users WHERE id = $1', [userId]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

export default router;
