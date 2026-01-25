import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentsAPI, prescriptionsAPI, medicalRecordsAPI } from '../services/api';
import SmartwatchIntegration from '../components/SmartwatchIntegration';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    appointments: 0,
    prescriptions: 0,
    medicalRecords: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch appointments
      const appointmentsRes = await appointmentsAPI.getMyAppointments();
      const appointments = appointmentsRes.data.appointments || [];
      
      // Fetch prescriptions
      const prescriptionsRes = await prescriptionsAPI.getMyPrescriptions();
      const prescriptions = prescriptionsRes.data.prescriptions || [];
      
      // Fetch medical records
      const recordsRes = await medicalRecordsAPI.getMyMedicalRecords();
      const records = recordsRes.data.medicalRecords || [];

      setStats({
        appointments: appointments.length,
        prescriptions: prescriptions.length,
        medicalRecords: records.length
      });

      // Get recent appointments (upcoming ones)
      const upcoming = appointments
        .filter(apt => apt.status === 'scheduled')
        .slice(0, 5);
      setRecentAppointments(upcoming);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
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
      <div className="dashboard-header">
        <h2 className="dashboard-title">Dashboard</h2>
        <p className="dashboard-subtitle">Welcome back, {user?.full_name}! 👋</p>
      </div>

      {/* Smartwatch Integration Component */}
      <SmartwatchIntegration userId={user?.id} />

      <div className="row">
        {/* Left Column - Main Content */}
        <div className="col-lg-8">
          {/* Heart Rate Card */}
          <div className="health-metric-card">
            <div className="metric-header">
              <div className="metric-icon heart">
                ❤️
              </div>
              <h3 className="metric-title">BPM</h3>
            </div>
            <div className="chart-container">
              <svg width="100%" height="80" viewBox="0 0 400 80" style={{overflow: 'visible'}}>
                <path
                  d="M0,40 Q20,20 40,40 T80,40 T120,40 T160,40 T200,40 T240,40 T280,40 T320,40 T360,40 T400,40"
                  fill="none"
                  stroke="#7fb069"
                  strokeWidth="2"
                  opacity="0.6"
                />
              </svg>
            </div>
            <div className="metric-value">Heart Rate: 72 bpm</div>
            <div className="metric-subtitle">Normal range</div>
          </div>

          {/* Steps Card */}
          <div className="health-metric-card">
            <div className="metric-header">
              <div className="metric-icon steps">
                🚶
              </div>
              <div>
                <h3 className="metric-title">Steps</h3>
                <div className="metric-value">{stats.appointments * 850} Steps / 10000 Goal</div>
              </div>
            </div>
            <div className="progress-container">
              <div className="progress">
                <div 
                  className="progress-bar" 
                  role="progressbar" 
                  style={{width: `${(stats.appointments * 850 / 10000) * 100}%`}}
                  aria-valuenow={(stats.appointments * 850 / 10000) * 100} 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                />
              </div>
            </div>
          </div>

          {/* Wellness Points Card */}
          <div className="health-metric-card">
            <div className="metric-header">
              <div className="metric-icon points">
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6eb5d0 0%, #a8d5e2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '18px'
                }}>
                  {stats.appointments * 100 + stats.prescriptions * 50 + stats.medicalRecords * 75}
                </div>
              </div>
              <div>
                <h3 className="metric-title">Points</h3>
                <div className="metric-subtitle">Wellness Points</div>
              </div>
            </div>

            <div className="wellness-character">
              <div className="character-image">🐢</div>
              <div className="stress-level low">Stress Level: Low</div>
            </div>
          </div>
        </div>

        {/* Right Column - Statistics & Actions */}
        <div className="col-lg-4">
          {/* Statistics Cards */}
          <div className="stat-card mb-3">
            <div className="stat-number">{stats.appointments}</div>
            <div className="stat-label">Total Appointments</div>
          </div>

          <div className="stat-card mb-3">
            <div className="stat-number">{stats.prescriptions}</div>
            <div className="stat-label">Prescriptions</div>
          </div>

          <div className="stat-card mb-3">
            <div className="stat-number">{stats.medicalRecords}</div>
            <div className="stat-label">Medical Records</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mt-4">
        <div className="col-12">
          <h4 className="mb-3">Quick Actions</h4>
        </div>
        <div className="col-12">
          <div className="quick-actions">
            <Link to="/appointments" className="btn btn-primary quick-action-btn">
              <span>📅</span> Book Appointment
            </Link>
            <Link to="/prescriptions" className="btn btn-success quick-action-btn">
              <span>💊</span> View Prescriptions
            </Link>
            <Link to="/medical-records" className="btn btn-danger quick-action-btn">
              <span>📋</span> Medical Records
            </Link>
            <Link to="/profile" className="btn btn-info quick-action-btn">
              <span>👤</span> Update Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="row mt-4">
        <div className="col-12">
          <h4 className="mb-3">Upcoming Appointments</h4>
          {recentAppointments.length === 0 ? (
            <div className="alert alert-info">
              You have no upcoming appointments. <Link to="/appointments">Book one now</Link>
            </div>
          ) : (
            <div className="list-group">
              {recentAppointments.map(appointment => (
                <div key={appointment.id} className="list-group-item appointment-card mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-1">{appointment.doctor_name}</h5>
                      <p className="mb-1">{appointment.specialization}</p>
                      <small className="text-muted">
                        {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.appointment_time}
                      </small>
                    </div>
                    <span className="badge bg-primary">
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
