import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../config/database.js';

const router = express.Router();

/**
 * Doctor requests access to patient data
 * POST /api/sharing/request
 */
router.post('/request', authenticateToken, async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const { patientId } = req.body;

    if (!patientId) {
      return res.status(400).json({ message: 'patientId is required' });
    }

    // Verify both users exist
    const [doctor] = await db.query('SELECT * FROM users WHERE id = ? AND user_type = ?', [doctorId, 'doctor']);
    const [patient] = await db.query('SELECT * FROM users WHERE id = ? AND user_type = ?', [patientId, 'patient']);

    if (doctor.length === 0) {
      return res.status(403).json({ message: 'Only doctors can request access' });
    }

    if (patient.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check if request already exists
    const [existing] = await db.query(
      `SELECT * FROM sharing_requests 
       WHERE doctor_id = ? AND patient_id = ? AND status = 'pending'`,
      [doctorId, patientId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Pending request already exists' });
    }

    // Create request
    await db.query(
      `INSERT INTO sharing_requests (doctor_id, patient_id, status, created_at) 
       VALUES (?, ?, 'pending', NOW())`,
      [doctorId, patientId]
    );

    res.status(201).json({
      message: 'Access request sent to patient',
      success: true
    });
  } catch (error) {
    console.error('Request share error:', error);
    res.status(500).json({ message: 'Error creating request', error: error.message });
  }
});

/**
 * Patient accepts sharing request
 * POST /api/sharing/:requestId/accept
 */
router.post('/:requestId/accept', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.userId;

    const [requests] = await db.query(
      'SELECT * FROM sharing_requests WHERE id = ? AND patient_id = ?',
      [requestId, userId]
    );

    if (requests.length === 0) {
      return res.status(404).json({ message: 'Request not found or not authorized' });
    }

    await db.query(
      `UPDATE sharing_requests 
       SET status = 'accepted', updated_at = NOW() 
       WHERE id = ?`,
      [requestId]
    );

    res.json({ message: 'Access request approved', success: true });
  } catch (error) {
    console.error('Accept share error:', error);
    res.status(500).json({ message: 'Error accepting request', error: error.message });
  }
});

/**
 * Patient rejects sharing request
 * POST /api/sharing/:requestId/reject
 */
router.post('/:requestId/reject', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.userId;

    await db.query(
      `UPDATE sharing_requests 
       SET status = 'rejected', updated_at = NOW() 
       WHERE id = ? AND patient_id = ?`,
      [requestId, userId]
    );

    res.json({ message: 'Access request rejected', success: true });
  } catch (error) {
    console.error('Reject share error:', error);
    res.status(500).json({ message: 'Error rejecting request', error: error.message });
  }
});

/**
 * Get sharing requests for logged in patient
 * GET /api/sharing/requests
 */
router.get('/requests', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const [requests] = await db.query(
      `SELECT 
        sr.id, sr.status, sr.created_at, sr.updated_at,
        u.id as doctor_id, u.full_name as provider_name, u.email as provider_email,
        'General Practice' as facility,
        'General Medicine' as specialization
       FROM sharing_requests sr
       JOIN users u ON sr.doctor_id = u.id
       WHERE sr.patient_id = ? AND sr.status = 'pending'
       ORDER BY sr.created_at DESC`,
      [userId]
    );

    res.json({ requests });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ message: 'Error fetching requests', error: error.message });
  }
});

/**
 * Get connected patients for logged in doctor
 * GET /api/sharing/my-patients
 */
router.get('/my-patients', authenticateToken, async (req, res) => {
  try {
    const doctorId = req.user.userId;

    const [patients] = await db.query(
      `SELECT 
        u.id, u.full_name as name, u.email, u.date_of_birth, u.gender,
        sr.id as sharing_id, sr.status, sr.created_at as shared_since
       FROM sharing_requests sr
       JOIN users u ON sr.patient_id = u.id
       WHERE sr.doctor_id = ? AND sr.status = 'accepted'
       ORDER BY sr.created_at DESC`,
      [doctorId]
    );

    // Add sample biometrics for demo (in real app, fetch from biometrics table)
    const patientsWithData = patients.map(p => ({
      ...p,
      age: p.date_of_birth ? new Date().getFullYear() - new Date(p.date_of_birth).getFullYear() : 32,
      height: '5\'10" (178 cm)',
      weight: '165 lbs (75 kg)',
      bloodType: 'O+',
      conditions: ['Hypertension', 'Type 2 Diabetes'],
      currentBiometrics: {
        heartRate: 72,
        bloodPressure: '120/80',
        o2Level: 98,
        steps: 8500,
        stressScore: 45
      }
    }));

    res.json({ patients: patientsWithData });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ message: 'Error fetching patients', error: error.message });
  }
});

/**
 * Get all patients in system (for connect tab)
 * GET /api/users/patients
 */
router.get('/all-patients', authenticateToken, async (req, res) => {
  try {
    const doctorId = req.user.userId;

    // Get all patients except ones already connected
    const [patients] = await db.query(
      `SELECT 
        u.id, u.full_name as name, u.email
       FROM users u
       WHERE u.user_type = 'patient'
       AND u.id NOT IN (
         SELECT patient_id FROM sharing_requests 
         WHERE doctor_id = ? AND status IN ('pending', 'accepted')
       )
       ORDER BY u.full_name ASC`,
      [doctorId]
    );

    res.json({ patients });
  } catch (error) {
    console.error('Get all patients error:', error);
    res.status(500).json({ message: 'Error fetching patients', error: error.message });
  }
});

/**
 * Patient gets list of connected healthcare providers
 * GET /api/sharing/my-providers
 */
router.get('/my-providers', authenticateToken, async (req, res) => {
  try {
    const patientId = req.user.userId;

    const [providers] = await db.query(
      `SELECT 
        u.id, u.full_name as name, u.email, u.phone,
        sr.id as sharing_id, sr.status, sr.created_at as connected_since
       FROM sharing_requests sr
       JOIN users u ON sr.doctor_id = u.id
       WHERE sr.patient_id = ? AND sr.status = 'accepted'
       ORDER BY sr.created_at DESC`,
      [patientId]
    );

    res.json({ providers });
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({ message: 'Error fetching providers', error: error.message });
  }
});

/**
 * Patient disconnects from a healthcare provider
 * DELETE /api/sharing/:sharingId/disconnect
 */
router.delete('/:sharingId/disconnect', authenticateToken, async (req, res) => {
  try {
    const { sharingId } = req.params;
    const patientId = req.user.userId;

    // Verify the patient owns this sharing request
    const [sharing] = await db.query(
      'SELECT * FROM sharing_requests WHERE id = ? AND patient_id = ?',
      [sharingId, patientId]
    );

    if (sharing.length === 0) {
      return res.status(404).json({ message: 'Sharing request not found or not authorized' });
    }

    // Delete the sharing request
    await db.query(
      'DELETE FROM sharing_requests WHERE id = ?',
      [sharingId]
    );

    res.json({ message: 'Successfully disconnected from healthcare provider', success: true });
  } catch (error) {
    console.error('Disconnect provider error:', error);
    res.status(500).json({ message: 'Error disconnecting from provider', error: error.message });
  }
});

export default router;
