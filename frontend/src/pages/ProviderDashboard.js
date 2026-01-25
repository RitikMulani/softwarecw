import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

function ProviderDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('requests');
  const [patients, setPatients] = useState([]);
  const [accessRequests, setAccessRequests] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestEmail, setRequestEmail] = useState('');

  useEffect(() => {
    if (activeView === 'requests') {
      fetchAccessRequests();
    } else if (activeView === 'patients') {
      fetchPatients();
    }
  }, [activeView]);

  const fetchAccessRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get('/provider/requests');
      setAccessRequests(response.data.requests || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
    setLoading(false);
  };

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await api.get('/provider/patients');
      setPatients(response.data.patients || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
    setLoading(false);
  };

  const handleRequestAccess = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/provider/request-access', { patientEmail: requestEmail });
      alert('Access request sent successfully!');
      setShowRequestModal(false);
      setRequestEmail('');
      fetchAccessRequests();
    } catch (error) {
      console.error('Error requesting access:', error);
      alert(error.response?.data?.message || 'Failed to send access request');
    }
    setLoading(false);
  };

  const handleViewPatient = async (patient) => {
    setSelectedPatient(patient);
    setLoading(true);
    try {
      const [readingsRes, summaryRes] = await Promise.all([
        api.get(`/provider/patients/${patient.id}/readings`),
        api.get(`/provider/patients/${patient.id}/summary`)
      ]);
      
      setPatientData({
        readings: readingsRes.data.readings || [],
        summary: summaryRes.data.summary || null
      });
      setActiveView('patient-detail');
    } catch (error) {
      console.error('Error fetching patient data:', error);
      alert('Failed to fetch patient data');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const createChartData = (data, color) => ({
    labels: Array(data.length).fill(''),
    datasets: [{
      data: data,
      fill: true,
      backgroundColor: `${color}20`,
      borderColor: color,
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 0,
    }],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: { display: false },
      y: { display: true, beginAtZero: true },
    },
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'rejected': return '#F44336';
      default: return '#666';
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ fontSize: '2rem', margin: 0 }}>🐢 TurtleHealth Provider</h1>
            <span style={{ color: '#666' }}>Welcome, {user?.name || 'Provider'}</span>
          </div>
          <button 
            onClick={handleLogout}
            style={{
              background: 'white',
              border: '2px solid #667eea',
              color: '#667eea',
              padding: '8px 20px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Sidebar */}
        <div style={{ 
          width: '250px', 
          background: 'white', 
          minHeight: 'calc(100vh - 80px)',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
          padding: '2rem 0'
        }}>
          <nav>
            <button
              onClick={() => setActiveView('requests')}
              style={{
                width: '100%',
                padding: '1rem 2rem',
                background: activeView === 'requests' ? '#667eea' : 'transparent',
                color: activeView === 'requests' ? 'white' : '#333',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              📋 Access Requests
            </button>
            <button
              onClick={() => setActiveView('patients')}
              style={{
                width: '100%',
                padding: '1rem 2rem',
                background: activeView === 'patients' ? '#667eea' : 'transparent',
                color: activeView === 'patients' ? 'white' : '#333',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              👥 My Patients
            </button>
            {selectedPatient && activeView === 'patient-detail' && (
              <button
                onClick={() => {
                  setActiveView('patients');
                  setSelectedPatient(null);
                  setPatientData(null);
                }}
                style={{
                  width: '100%',
                  padding: '1rem 2rem',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
              >
                👤 {selectedPatient.name}
              </button>
            )}
          </nav>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: '2rem' }}>
          {activeView === 'requests' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0 }}>Access Requests</h2>
                <button
                  onClick={() => setShowRequestModal(true)}
                  style={{
                    background: '#2196F3',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '1rem'
                  }}
                >
                  ➕ Request Patient Access
                </button>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>
              ) : accessRequests.length > 0 ? (
                <div className="dashboard-card">
                  {accessRequests.map((req) => (
                    <div key={req.id} style={{
                      padding: '1.5rem',
                      borderBottom: '1px solid #f0f0f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h3 style={{ margin: '0 0 0.5rem 0' }}>{req.patient_name}</h3>
                        <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>{req.patient_email}</p>
                        <span style={{
                          background: getStatusColor(req.status),
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.85rem',
                          fontWeight: '600'
                        }}>
                          {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                          Requested: {new Date(req.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dashboard-card" style={{ textAlign: 'center', padding: '3rem' }}>
                  <p style={{ color: '#666', fontSize: '1.1rem' }}>No access requests yet</p>
                </div>
              )}
            </>
          )}

          {activeView === 'patients' && (
            <>
              <h2 style={{ marginBottom: '2rem' }}>My Patients</h2>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>
              ) : patients.length > 0 ? (
                <div className="row">
                  {patients.map((patient) => (
                    <div key={patient.id} className="col-md-6 mb-4">
                      <div className="dashboard-card">
                        <h3 style={{ marginBottom: '1rem' }}>{patient.name}</h3>
                        <p style={{ color: '#666', marginBottom: '0.5rem' }}>{patient.email}</p>
                        <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem' }}>
                          Access granted: {new Date(patient.access_granted).toLocaleDateString()}
                        </p>
                        <button
                          onClick={() => handleViewPatient(patient)}
                          style={{
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            width: '100%'
                          }}
                        >
                          View Patient Data & History
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dashboard-card" style={{ textAlign: 'center', padding: '3rem' }}>
                  <p style={{ color: '#666', fontSize: '1.1rem' }}>No patients with approved access yet</p>
                </div>
              )}
            </>
          )}

          {activeView === 'patient-detail' && selectedPatient && patientData && (
            <>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '0.5rem' }}>{selectedPatient.name}'s Health Data</h2>
                <p style={{ color: '#666' }}>{selectedPatient.email}</p>
              </div>

              {/* Summary Stats */}
              {patientData.summary && (
                <div className="row mb-4">
                  <div className="col-md-3 mb-3">
                    <div className="dashboard-card" style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>❤️</div>
                      <h3 style={{ fontSize: '2rem', color: '#F44336', margin: '0.5rem 0' }}>
                        {Math.round(patientData.summary.avg_heart_rate)}
                      </h3>
                      <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>Avg Heart Rate</p>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="dashboard-card" style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👟</div>
                      <h3 style={{ fontSize: '2rem', color: '#4CAF50', margin: '0.5rem 0' }}>
                        {Math.round(patientData.summary.avg_steps)}
                      </h3>
                      <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>Avg Daily Steps</p>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="dashboard-card" style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>😰</div>
                      <h3 style={{ fontSize: '2rem', color: '#FF9800', margin: '0.5rem 0' }}>
                        {Math.round(patientData.summary.avg_stress)}
                      </h3>
                      <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>Avg Stress Level</p>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="dashboard-card" style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💓</div>
                      <h3 style={{ fontSize: '2rem', color: '#9C27B0', margin: '0.5rem 0' }}>
                        {Math.round(patientData.summary.avg_hrv)}
                      </h3>
                      <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>Avg HRV</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Readings History */}
              {patientData.readings && patientData.readings.length > 0 && (
                <>
                  <h3 style={{ marginBottom: '1.5rem' }}>Health History (Last 7 Days)</h3>
                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <div className="dashboard-card">
                        <h4 className="card-title mb-3">Heart Rate Trend</h4>
                        <div className="chart-container" style={{ height: '200px' }}>
                          <Line 
                            data={createChartData(
                              patientData.readings.slice(-20).map(r => r.heart_rate),
                              '#F44336'
                            )} 
                            options={chartOptions} 
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-4">
                      <div className="dashboard-card">
                        <h4 className="card-title mb-3">Steps Trend</h4>
                        <div className="chart-container" style={{ height: '200px' }}>
                          <Line 
                            data={createChartData(
                              patientData.readings.slice(-20).map(r => r.steps),
                              '#4CAF50'
                            )} 
                            options={chartOptions} 
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-4">
                      <div className="dashboard-card">
                        <h4 className="card-title mb-3">Stress Level Trend</h4>
                        <div className="chart-container" style={{ height: '200px' }}>
                          <Line 
                            data={createChartData(
                              patientData.readings.slice(-20).map(r => r.stress_level),
                              '#FF9800'
                            )} 
                            options={chartOptions} 
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-4">
                      <div className="dashboard-card">
                        <h4 className="card-title mb-3">HRV Trend</h4>
                        <div className="chart-container" style={{ height: '200px' }}>
                          <Line 
                            data={createChartData(
                              patientData.readings.slice(-20).map(r => r.hrv),
                              '#9C27B0'
                            )} 
                            options={chartOptions} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Readings Table */}
                  <div className="dashboard-card mt-4">
                    <h4 className="card-title mb-3">Detailed Readings</h4>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Date</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>Heart Rate</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>Steps</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>Stress</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>HRV</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>SpO2</th>
                          </tr>
                        </thead>
                        <tbody>
                          {patientData.readings.slice(0, 10).map((reading, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                              <td style={{ padding: '1rem' }}>
                                {new Date(reading.timestamp).toLocaleString()}
                              </td>
                              <td style={{ padding: '1rem', textAlign: 'center' }}>{reading.heart_rate} bpm</td>
                              <td style={{ padding: '1rem', textAlign: 'center' }}>{reading.steps}</td>
                              <td style={{ padding: '1rem', textAlign: 'center' }}>{reading.stress_level}</td>
                              <td style={{ padding: '1rem', textAlign: 'center' }}>{reading.hrv} ms</td>
                              <td style={{ padding: '1rem', textAlign: 'center' }}>{reading.spo2}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Request Access Modal */}
      {showRequestModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Request Patient Access</h2>
            <form onSubmit={handleRequestAccess}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Patient Email
                </label>
                <input
                  type="email"
                  required
                  value={requestEmail}
                  onChange={(e) => setRequestEmail(e.target.value)}
                  placeholder="patient@example.com"
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    borderRadius: '8px', 
                    border: '2px solid #e0e0e0',
                    fontSize: '1rem'
                  }}
                />
                <small style={{ color: '#666', display: 'block', marginTop: '0.5rem' }}>
                  The patient will receive a notification to approve your access request.
                </small>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowRequestModal(false);
                    setRequestEmail('');
                  }}
                  style={{
                    flex: 1,
                    background: '#e0e0e0',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    background: '#2196F3',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProviderDashboard;
