import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentsAPI, usersAPI } from '../services/api';

const Appointments = () => {
  const { user, isPatient, isDoctor } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    reason: ''
  });

  useEffect(() => {
    fetchAppointments();
    if (isPatient) {
      fetchDoctors();
    }
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentsAPI.getMyAppointments();
      setAppointments(response.data.appointments || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await usersAPI.getAllDoctors();
      setDoctors(response.data.doctors || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
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
      await appointmentsAPI.createAppointment(formData);
      setMessage({ type: 'success', text: 'Appointment booked successfully!' });
      setShowForm(false);
      setFormData({ doctor_id: '', appointment_date: '', appointment_time: '', reason: '' });
      fetchAppointments();
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error booking appointment' 
      });
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await appointmentsAPI.cancelAppointment(id);
        setMessage({ type: 'success', text: 'Appointment cancelled successfully!' });
        fetchAppointments();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        setMessage({ 
          type: 'error', 
          text: error.response?.data?.message || 'Error cancelling appointment' 
        });
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      scheduled: 'bg-primary',
      completed: 'bg-success',
      cancelled: 'bg-danger'
    };
    return statusColors[status] || 'bg-secondary';
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
        <h2>Appointments</h2>
        {isPatient && (
          <button 
            className="btn btn-primary" 
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Book New Appointment'}
          </button>
        )}
      </div>

      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>
          {message.text}
        </div>
      )}

      {/* Booking Form (Patients Only) */}
      {isPatient && showForm && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Book New Appointment</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="doctor_id" className="form-label">Select Doctor *</label>
                <select
                  className="form-control"
                  name="doctor_id"
                  value={formData.doctor_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Choose a doctor...</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.full_name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="appointment_date" className="form-label">Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    name="appointment_date"
                    value={formData.appointment_date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="appointment_time" className="form-label">Time *</label>
                  <input
                    type="time"
                    className="form-control"
                    name="appointment_time"
                    value={formData.appointment_time}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="reason" className="form-label">Reason for Visit</label>
                <textarea
                  className="form-control"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Book Appointment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Appointments List */}
      <div className="row">
        {appointments.length === 0 ? (
          <div className="col-12">
            <div className="alert alert-info">
              No appointments found.
            </div>
          </div>
        ) : (
          appointments.map(appointment => (
            <div key={appointment.id} className="col-md-6 mb-3">
              <div className="card appointment-card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title">
                      {isPatient ? appointment.doctor_name : appointment.patient_name}
                    </h5>
                    <span className={`badge ${getStatusBadge(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                  
                  {isPatient && (
                    <p className="card-text mb-1">
                      <strong>Specialization:</strong> {appointment.specialization}
                    </p>
                  )}
                  
                  {isDoctor && (
                    <p className="card-text mb-1">
                      <strong>Blood Group:</strong> {appointment.blood_group}
                    </p>
                  )}
                  
                  <p className="card-text mb-1">
                    <strong>Date:</strong> {new Date(appointment.appointment_date).toLocaleDateString()}
                  </p>
                  
                  <p className="card-text mb-1">
                    <strong>Time:</strong> {appointment.appointment_time}
                  </p>
                  
                  {appointment.reason && (
                    <p className="card-text mb-1">
                      <strong>Reason:</strong> {appointment.reason}
                    </p>
                  )}
                  
                  {appointment.notes && (
                    <p className="card-text mb-1">
                      <strong>Notes:</strong> {appointment.notes}
                    </p>
                  )}

                  {appointment.status === 'scheduled' && (
                    <button 
                      className="btn btn-sm btn-danger mt-2"
                      onClick={() => handleCancel(appointment.id)}
                    >
                      Cancel Appointment
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Appointments;
