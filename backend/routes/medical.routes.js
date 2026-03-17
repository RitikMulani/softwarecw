import express from 'express';
import * as medicalController from '../controllers/medical.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Get current user's medical records
 */
router.get('/', authenticateToken, medicalController.getMyMedicalRecords);

/**
 * Get specific medical record
 */
router.get('/:id', authenticateToken, medicalController.getMedicalRecordById);

/**
 * Get patient's medical records (doctor only)
 */
router.get('/patient/:patientId', authenticateToken, medicalController.getPatientMedicalRecords);

/**
 * Create medical record (doctor only)
 */
router.post('/', authenticateToken, medicalController.createMedicalRecord);

/**
 * Update medical record
 */
router.put('/:id', authenticateToken, medicalController.updateMedicalRecord);

export default router;
