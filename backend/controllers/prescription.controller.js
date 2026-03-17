import db from '../config/database.js';

/**
 * Get current user's prescriptions
 */
export async function getMyPrescriptions(req, res) {
  try {
    const userId = req.user.userId;

    // Get user role
    const [user] = await db.query('SELECT user_type FROM users WHERE id = ?', [userId]);

    let prescriptions = [];
    
    if (user && user[0].user_type === 'doctor') {
      // Doctors see prescriptions they created
      const [docs] = await db.query(
        `SELECT * FROM prescriptions WHERE doctor_id = ? ORDER BY prescribed_date DESC`,
        [userId]
      );
      prescriptions = docs || [];
    } else {
      // Patients see prescriptions prescribed to them
      const [patients] = await db.query(
        `SELECT * FROM prescriptions WHERE patient_id = ? ORDER BY prescribed_date DESC`,
        [userId]
      );
      prescriptions = patients || [];
    }

    res.json({
      prescriptions: prescriptions
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching prescriptions', error: error.message });
  }
}

/**
 * Get prescription by ID
 */
export async function getPrescriptionById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const [prescriptions] = await db.query(
      `SELECT * FROM prescriptions WHERE id = ? AND (patient_id = ? OR doctor_id = ?)`,
      [id, userId, userId]
    );

    if (prescriptions.length === 0) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.json(prescriptions[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching prescription', error: error.message });
  }
}

/**
 * Get prescriptions for a specific patient (for doctors)
 */
export async function getPatientPrescriptions(req, res) {
  try {
    const { patientId } = req.params;
    const userId = req.user.userId;

    // Only doctors can view patient prescriptions
    const [user] = await db.query('SELECT user_type FROM users WHERE id = ?', [userId]);
    
    if (!user || user[0].user_type !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can access patient prescriptions' });
    }

    const [prescriptions] = await db.query(
      `SELECT * FROM prescriptions WHERE patient_id = ? ORDER BY prescribed_date DESC`,
      [patientId]
    );

    res.json({
      prescriptions: prescriptions || []
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching prescriptions', error: error.message });
  }
}

/**
 * Create a new prescription
 */
export async function createPrescription(req, res) {
  try {
    const { patient_id, medication_name, dosage, frequency, duration, instructions, prescribed_date } = req.body;
    const doctorId = req.user.userId;

    // Verify doctor creating the prescription
    const [doctor] = await db.query('SELECT user_type FROM users WHERE id = ?', [doctorId]);
    
    if (!doctor || doctor[0].user_type !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can create prescriptions' });
    }

    const [result] = await db.query(
      `INSERT INTO prescriptions (patient_id, doctor_id, medication_name, dosage, frequency, duration, instructions, prescribed_date, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [patient_id, doctorId, medication_name, dosage, frequency, duration, instructions, prescribed_date]
    );

    res.status(201).json({
      message: 'Prescription created successfully',
      id: result[0]?.id
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating prescription', error: error.message });
  }
}

/**
 * Update prescription
 */
export async function updatePrescription(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { medication_name, dosage, frequency, duration, instructions } = req.body;

    // Check if prescription belongs to this doctor
    const [prescriptions] = await db.query(
      'SELECT * FROM prescriptions WHERE id = ? AND doctor_id = ?',
      [id, userId]
    );

    if (prescriptions.length === 0) {
      return res.status(404).json({ message: 'Prescription not found or not authorized' });
    }

    const updates = [];
    const values = [];

    if (medication_name !== undefined) {
      updates.push('medication_name = ?');
      values.push(medication_name);
    }
    if (dosage !== undefined) {
      updates.push('dosage = ?');
      values.push(dosage);
    }
    if (frequency !== undefined) {
      updates.push('frequency = ?');
      values.push(frequency);
    }
    if (duration !== undefined) {
      updates.push('duration = ?');
      values.push(duration);
    }
    if (instructions !== undefined) {
      updates.push('instructions = ?');
      values.push(instructions);
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      await db.query(`UPDATE prescriptions SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    res.json({ message: 'Prescription updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating prescription', error: error.message });
  }
}

/**
 * Delete prescription
 */
export async function deletePrescription(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if prescription belongs to this doctor
    const [prescriptions] = await db.query(
      'SELECT * FROM prescriptions WHERE id = ? AND doctor_id = ?',
      [id, userId]
    );

    if (prescriptions.length === 0) {
      return res.status(404).json({ message: 'Prescription not found or not authorized' });
    }

    await db.query('DELETE FROM prescriptions WHERE id = ?', [id]);

    res.json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting prescription', error: error.message });
  }
}

export default {
  getMyPrescriptions,
  getPrescriptionById,
  getPatientPrescriptions,
  createPrescription,
  updatePrescription,
  deletePrescription
};
