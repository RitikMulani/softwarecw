import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { medicalRecordsAPI, usersAPI } from '../services/api';

const MedicalRecords = () => {
  const { user, isPatient, isDoctor } = useAuth();
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    patient_id: '',
    diagnosis: '',
    symptoms: '',
    treatment: '',
    notes: '',
    record_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchMedicalRecords();
    if (isDoctor) {
      fetchPatients();
    }
  }, []);

  const fetchMedicalRecords = async () => {
    try {
      const response = await medicalRecordsAPI.getMyMedicalRecords();
      setMedicalRecords(response.data.medicalRecords || []);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await usersAPI.getAllPatients();
      setPatients(response.data.patients || []);
    } catch (error) {
      // Patients list unavailable
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await medicalRecordsAPI.createMedicalRecord(formData);
      setMessage({ type: 'success', text: 'Medical record created successfully!' });
      setShowForm(false);
      setFormData({
        patient_id: '',
        diagnosis: '',
        symptoms: '',
        treatment: '',
        notes: '',
        record_date: new Date().toISOString().split('T')[0]
      });
      fetchMedicalRecords();
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error creating medical record' 
      });
    }
  };

  const handleEditRecord = (record) => {
    setEditingId(record.id);
    setEditFormData({
      diagnosis: record.diagnosis || '',
      symptoms: record.symptoms || '',
      treatment: record.treatment || '',
      notes: record.notes || '',
      record_date: record.record_date ? record.record_date.split('T')[0] : ''
    });
  };

  const handleEditFormChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveRecord = async () => {
    setIsSaving(true);
    try {
      await medicalRecordsAPI.updateMedicalRecord(editingId, editFormData);
      setMessage({ type: 'success', text: 'Medical record updated successfully!' });
      setEditingId(null);
      fetchMedicalRecords();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error updating medical record' 
      });
    }
    setIsSaving(false);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Medical Records</h2>
        {isDoctor && (
          <button 
            className="btn btn-danger" 
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Create New Record'}
          </button>
        )}
      </div>

      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>
          {message.text}
        </div>
      )}

      {/* Medical Record Form (Doctors Only) */}
      {isDoctor && showForm && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Create New Medical Record</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="patient_id" className="form-label">Select Patient *</label>
                <select
                  className="form-control"
                  name="patient_id"
                  value={formData.patient_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Choose a patient...</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.full_name} - {patient.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="record_date" className="form-label">Record Date *</label>
                <input
                  type="date"
                  className="form-control"
                  name="record_date"
                  value={formData.record_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="symptoms" className="form-label">Symptoms</label>
                <textarea
                  className="form-control"
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Patient symptoms"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="diagnosis" className="form-label">Diagnosis</label>
                <textarea
                  className="form-control"
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Medical diagnosis"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="treatment" className="form-label">Treatment</label>
                <textarea
                  className="form-control"
                  name="treatment"
                  value={formData.treatment}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Treatment plan"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="notes" className="form-label">Additional Notes</label>
                <textarea
                  className="form-control"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Any additional notes"
                />
              </div>

              <button type="submit" className="btn btn-danger">
                Create Medical Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Medical Records List */}
      <div className="row">
        {medicalRecords.length === 0 ? (
          <div className="col-12">
            <div className="alert alert-info">
              No medical records found.
            </div>
          </div>
        ) : (
          medicalRecords.map(record => {
            const isEditing = editingId === record.id;
            
            if (isEditing) {
              // Edit mode
              return (
                <div key={record.id} className="col-md-12 mb-3">
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title">Edit Medical Record</h5>
                      
                      <div className="mb-3">
                        <label className="form-label">Record Date</label>
                        <input
                          type="date"
                          className="form-control"
                          name="record_date"
                          value={editFormData.record_date}
                          onChange={handleEditFormChange}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Symptoms</label>
                        <textarea
                          className="form-control"
                          name="symptoms"
                          value={editFormData.symptoms}
                          onChange={handleEditFormChange}
                          rows="2"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Diagnosis</label>
                        <textarea
                          className="form-control"
                          name="diagnosis"
                          value={editFormData.diagnosis}
                          onChange={handleEditFormChange}
                          rows="2"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Treatment</label>
                        <textarea
                          className="form-control"
                          name="treatment"
                          value={editFormData.treatment}
                          onChange={handleEditFormChange}
                          rows="2"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Notes</label>
                        <textarea
                          className="form-control"
                          name="notes"
                          value={editFormData.notes}
                          onChange={handleEditFormChange}
                          rows="2"
                        />
                      </div>

                      <button 
                        className="btn btn-primary me-2"
                        onClick={handleSaveRecord}
                        disabled={isSaving}
                      >
                        {isSaving ? 'Saving...' : '💾 Save'}
                      </button>
                      <button 
                        className="btn btn-secondary"
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            // View mode
            return (
              <div key={record.id} className="col-md-12 mb-3">
                <div className="card medical-record-card">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="card-title">
                        Record Date: {new Date(record.record_date).toLocaleDateString()}
                      </h5>
                      <div>
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEditRecord(record)}
                        >
                          ✏️ Edit
                        </button>
                      </div>
                    </div>
                    
                    <small className="text-muted d-block mb-2">
                      {isPatient ? `Dr. ${record.doctor_name}` : record.patient_name}
                    </small>
                    
                    {isPatient && record.specialization && (
                      <p className="card-text mb-1">
                        <strong>Specialization:</strong> {record.specialization}
                      </p>
                    )}
                    
                    {record.symptoms && (
                      <div className="mt-2">
                        <strong>Symptoms:</strong>
                        <p className="card-text">{record.symptoms}</p>
                      </div>
                    )}
                    
                    {record.diagnosis && (
                      <div className="mt-2">
                        <strong>Diagnosis:</strong>
                        <p className="card-text">{record.diagnosis}</p>
                      </div>
                    )}
                    
                    {record.treatment && (
                      <div className="mt-2">
                        <strong>Treatment:</strong>
                        <p className="card-text">{record.treatment}</p>
                      </div>
                    )}
                    
                    {record.notes && (
                      <div className="mt-2">
                        <strong>Notes:</strong>
                        <p className="card-text">{record.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MedicalRecords;
