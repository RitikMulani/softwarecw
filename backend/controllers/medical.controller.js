import db from '../config/database.js';

/**
 * Get current user's medical records
 */
export async function getMyMedicalRecords(req, res) {
  try {
    const userId = req.user.userId;

    const [records] = await db.query(
      `SELECT * FROM medical_records WHERE patient_id = ? ORDER BY record_date DESC`,
      [userId]
    );

    res.json({
      medicalRecords: records || []
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching medical records', error: error.message });
  }
}

/**
 * Get specific medical record by ID
 */
export async function getMedicalRecordById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const [records] = await db.query(
      `SELECT * FROM medical_records WHERE id = ? AND (patient_id = ? OR doctor_id = ?)`,
      [id, userId, userId]
    );

    if (records.length === 0) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    res.json(records[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching medical record', error: error.message });
  }
}

/**
 * Get medical records for a specific patient (for doctors)
 */
export async function getPatientMedicalRecords(req, res) {
  try {
    const { patientId } = req.params;
    const userId = req.user.userId;

    // Only doctors can view patient records
    const [user] = await db.query('SELECT user_type FROM users WHERE id = ?', [userId]);
    
    if (!user || user[0].user_type !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can access patient records' });
    }

    const [records] = await db.query(
      `SELECT * FROM medical_records WHERE patient_id = ? ORDER BY record_date DESC`,
      [patientId]
    );

    res.json({
      medicalRecords: records || []
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching medical records', error: error.message });
  }
}

/**
 * Create a new medical record
 */
export async function createMedicalRecord(req, res) {
  try {
    const { patient_id, diagnosis, symptoms, treatment, notes, record_date } = req.body;
    const doctorId = req.user.userId;

    // Verify doctor creating the record
    const [doctor] = await db.query('SELECT user_type FROM users WHERE id = ?', [doctorId]);
    
    if (!doctor || doctor[0].user_type !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can create medical records' });
    }

    const [result] = await db.query(
      `INSERT INTO medical_records (patient_id, doctor_id, diagnosis, symptoms, treatment, notes, record_date, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [patient_id, doctorId, diagnosis, symptoms, treatment, notes, record_date]
    );

    res.status(201).json({
      message: 'Medical record created successfully',
      id: result[0]?.id
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating medical record', error: error.message });
  }
}

/**
 * Update a medical record
 */
export async function updateMedicalRecord(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { diagnosis, symptoms, treatment, notes, record_date } = req.body;

    // Check if record exists and user has permission
    const [records] = await db.query(
      'SELECT * FROM medical_records WHERE id = ? AND (patient_id = ? OR doctor_id = ?)',
      [id, userId, userId]
    );

    if (records.length === 0) {
      return res.status(404).json({ message: 'Medical record not found or not authorized' });
    }

    const updates = [];
    const values = [];

    if (diagnosis !== undefined) {
      updates.push('diagnosis = ?');
      values.push(diagnosis);
    }
    if (symptoms !== undefined) {
      updates.push('symptoms = ?');
      values.push(symptoms);
    }
    if (treatment !== undefined) {
      updates.push('treatment = ?');
      values.push(treatment);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      values.push(notes);
    }
    if (record_date !== undefined) {
      updates.push('record_date = ?');
      values.push(record_date);
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      await db.query(`UPDATE medical_records SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    res.json({ message: 'Medical record updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating medical record', error: error.message });
  }
}

export default {
  getMyMedicalRecords,
  getMedicalRecordById,
  getPatientMedicalRecords,
  createMedicalRecord,
  updateMedicalRecord
};
