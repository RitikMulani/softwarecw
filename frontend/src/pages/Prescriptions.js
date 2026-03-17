import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { prescriptionsAPI, usersAPI } from '../services/api';

const Prescriptions = () => {
  const { user, isPatient, isDoctor } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    patient_id: '',
    medication_name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    prescribed_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchPrescriptions();
    if (isDoctor) {
      fetchPatients();
    }
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await prescriptionsAPI.getMyPrescriptions();
      setPrescriptions(response.data.prescriptions || []);
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
      await prescriptionsAPI.createPrescription(formData);
      setMessage({ type: 'success', text: 'Prescription created successfully!' });
      setShowForm(false);
      setFormData({
        patient_id: '',
        medication_name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
        prescribed_date: new Date().toISOString().split('T')[0]
      });
      fetchPrescriptions();
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error creating prescription' 
      });
    }
  };

  const handleEditPrescription = (prescription) => {
    setEditingId(prescription.id);
    setEditFormData({
      medication_name: prescription.medication_name || '',
      dosage: prescription.dosage || '',
      frequency: prescription.frequency || '',
      duration: prescription.duration || '',
      instructions: prescription.instructions || '',
      prescribed_date: prescription.prescribed_date ? prescription.prescribed_date.split('T')[0] : ''
    });
  };

  const handleEditFormChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleSavePrescription = async () => {
    setIsSaving(true);
    try {
      await prescriptionsAPI.updatePrescription(editingId, editFormData);
      setMessage({ type: 'success', text: 'Prescription updated successfully!' });
      setEditingId(null);
      fetchPrescriptions();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error updating prescription' 
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
        <h2>Prescriptions</h2>
        {isDoctor && (
          <button 
            className="btn btn-success" 
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Create New Prescription'}
          </button>
        )}
      </div>

      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>
          {message.text}
        </div>
      )}

      {/* Prescription Form (Doctors Only) */}
      {isDoctor && showForm && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Create New Prescription</h5>
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

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="medication_name" className="form-label">Medication Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="medication_name"
                    value={formData.medication_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="dosage" className="form-label">Dosage</label>
                  <input
                    type="text"
                    className="form-control"
                    name="dosage"
                    value={formData.dosage}
                    onChange={handleChange}
                    placeholder="e.g., 500mg"
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="frequency" className="form-label">Frequency</label>
                  <input
                    type="text"
                    className="form-control"
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleChange}
                    placeholder="e.g., Twice daily"
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="duration" className="form-label">Duration</label>
                  <input
                    type="text"
                    className="form-control"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="e.g., 7 days"
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="prescribed_date" className="form-label">Prescribed Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    name="prescribed_date"
                    value={formData.prescribed_date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="instructions" className="form-label">Instructions</label>
                <textarea
                  className="form-control"
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Additional instructions for the patient"
                />
              </div>

              <button type="submit" className="btn btn-success">
                Create Prescription
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Prescriptions List */}
      <div className="row">
        {prescriptions.length === 0 ? (
          <div className="col-12">
            <div className="alert alert-info">
              No prescriptions found.
            </div>
          </div>
        ) : (
          prescriptions.map(prescription => {
            const isEditing = editingId === prescription.id;

            if (isEditing) {
              // Edit mode
              return (
                <div key={prescription.id} className="col-md-12 mb-3">
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title">Edit Prescription</h5>
                      
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Medication Name</label>
                          <input
                            type="text"
                            className="form-control"
                            name="medication_name"
                            value={editFormData.medication_name}
                            onChange={handleEditFormChange}
                          />
                        </div>

                        <div className="col-md-6 mb-3">
                          <label className="form-label">Dosage</label>
                          <input
                            type="text"
                            className="form-control"
                            name="dosage"
                            value={editFormData.dosage}
                            onChange={handleEditFormChange}
                          />
                        </div>

                        <div className="col-md-6 mb-3">
                          <label className="form-label">Frequency</label>
                          <input
                            type="text"
                            className="form-control"
                            name="frequency"
                            value={editFormData.frequency}
                            onChange={handleEditFormChange}
                          />
                        </div>

                        <div className="col-md-6 mb-3">
                          <label className="form-label">Duration</label>
                          <input
                            type="text"
                            className="form-control"
                            name="duration"
                            value={editFormData.duration}
                            onChange={handleEditFormChange}
                          />
                        </div>

                        <div className="col-md-6 mb-3">
                          <label className="form-label">Prescribed Date</label>
                          <input
                            type="date"
                            className="form-control"
                            name="prescribed_date"
                            value={editFormData.prescribed_date}
                            onChange={handleEditFormChange}
                          />
                        </div>

                        <div className="col-md-12 mb-3">
                          <label className="form-label">Instructions</label>
                          <textarea
                            className="form-control"
                            name="instructions"
                            value={editFormData.instructions}
                            onChange={handleEditFormChange}
                            rows="2"
                          />
                        </div>
                      </div>

                      <button 
                        className="btn btn-primary me-2"
                        onClick={handleSavePrescription}
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
              <div key={prescription.id} className="col-md-6 mb-3">
                <div className="card prescription-card">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="card-title">{prescription.medication_name}</h5>
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleEditPrescription(prescription)}
                      >
                        ✏️
                      </button>
                    </div>
                    
                    <p className="card-text mb-1">
                      <strong>{isPatient ? 'Doctor' : 'Patient'}:</strong>{' '}
                      {isPatient ? prescription.doctor_name : prescription.patient_name}
                    </p>
                    
                    {isPatient && prescription.specialization && (
                      <p className="card-text mb-1">
                        <strong>Specialization:</strong> {prescription.specialization}
                      </p>
                    )}
                    
                    {prescription.dosage && (
                      <p className="card-text mb-1">
                        <strong>Dosage:</strong> {prescription.dosage}
                      </p>
                    )}
                    
                    {prescription.frequency && (
                      <p className="card-text mb-1">
                        <strong>Frequency:</strong> {prescription.frequency}
                      </p>
                    )}
                    
                    {prescription.duration && (
                      <p className="card-text mb-1">
                        <strong>Duration:</strong> {prescription.duration}
                      </p>
                    )}
                    
                    <p className="card-text mb-1">
                      <strong>Prescribed Date:</strong>{' '}
                      {new Date(prescription.prescribed_date).toLocaleDateString()}
                    </p>
                    
                    {prescription.instructions && (
                      <div className="mt-2">
                        <strong>Instructions:</strong>
                        <p className="card-text">{prescription.instructions}</p>
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

export default Prescriptions;
