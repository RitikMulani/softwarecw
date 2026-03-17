import express from 'express';
import * as prescriptionController from '../controllers/prescription.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Get current user's prescriptions
 */
router.get('/', authenticateToken, prescriptionController.getMyPrescriptions);

/**
 * Get specific prescription
 */
router.get('/:id', authenticateToken, prescriptionController.getPrescriptionById);

/**
 * Get patient's prescriptions (doctor only)
 */
router.get('/patient/:patientId', authenticateToken, prescriptionController.getPatientPrescriptions);

/**
 * Create prescription (doctor only)
 */
router.post('/', authenticateToken, prescriptionController.createPrescription);

/**
 * Update prescription (doctor only)
 */
router.put('/:id', authenticateToken, prescriptionController.updatePrescription);

/**
 * Delete prescription (doctor only)
 */
router.delete('/:id', authenticateToken, prescriptionController.deletePrescription);

export default router;
