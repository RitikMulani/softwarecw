import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Dashboard.css';

function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('patients');
  const [connectedPatients, setConnectedPatients] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchConnectedPatients();
    fetchAllPatients();
  }, []);

  const fetchConnectedPatients = async () => {
    try {
      // Fetch patients the doctor has access to
      const response = await api.get('/sharing/my-patients');
      setConnectedPatients(response.data.patients || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching connected patients:', error);
      // Fallback to sample data for demo
      setConnectedPatients([
        {
          id: 1,
          name: 'John Doe',
          email: 'patient@test.com',
          age: 32,
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
        }
      ]);
      setLoading(false);
    }
  };

  const fetchAllPatients = async () => {
    try {
      const response = await api.get('/sharing/all-patients');
      setAllPatients(response.data.patients || []);
    } catch (error) {
      console.error('Error fetching all patients:', error);
      // Fallback to sample data
      setAllPatients([
        { id: 2, name: 'Jane Smith', email: 'jane.smith@email.com' },
        { id: 3, name: 'Bob Johnson', email: 'bob.j@email.com' },
        { id: 4, name: 'Sarah Williams', email: 'sarah.w@email.com' }
      ]);
    }
  };

  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  const handleRequestAccess = async (patientId) => {
    try {
      await api.post('/sharing/request', { patientId });
      alert('Access request sent to patient!');
    } catch (error) {
      console.error('Error requesting access:', error);
      alert('Failed to send access request');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStressLevel = (score) => {
    if (score < 30) return { level: 'Low', color: '#4CAF50' };
    if (score < 60) return { level: 'Moderate', color: '#FFC107' };
    return { level: 'High', color: '#F44336' };
  };

  const filteredPatients = allPatients.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderPatientsView = () => (
    <div className="dashboard-card">
      <h3 className="card-title">👥 My Connected Patients</h3>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : connectedPatients.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>No connected patients yet</p>
          <button 
            className="btn btn-primary"
            onClick={() => setActiveView('connect')}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '10px',
              padding: '0.75rem 2rem'
            }}
          >
            Connect with Patients
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {connectedPatients.map((patient) => {
            const stress = getStressLevel(patient.currentBiometrics?.stressScore || 45);
            return (
              <div
                key={patient.id}
                onClick={() => handlePatientClick(patient)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1.5rem',
                  background: '#f8f9fa',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: '2px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e9ecef';
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f8f9fa';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #a8d5e2 0%, #d4f1f4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  marginRight: '1.5rem',
                  flexShrink: 0
                }}>
                  👤
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, marginBottom: '0.25rem', fontSize: '1.2rem', fontWeight: '600' }}>
                    {patient.name || 'Patient'}
                  </h4>
                  <p style={{ margin: 0, color: '#666', fontSize: '0.95rem' }}>
                    {patient.email}
                  </p>
                </div>
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'center'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#667eea' }}>
                      {patient.currentBiometrics?.heartRate || '--'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>BPM</div>
                  </div>
                  <div style={{
                    padding: '0.5rem 1rem',
                    background: stress.color + '20',
                    borderRadius: '20px',
                    color: stress.color,
                    fontWeight: '600',
                    fontSize: '0.9rem'
                  }}>
                    {stress.level} Stress
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderConnectView = () => (
    <div className="dashboard-card">
      <h3 className="card-title">🔗 Connect with New Patients</h3>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          className="form-control"
          placeholder="Search patients by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            fontSize: '1rem',
            borderRadius: '10px',
            border: '2px solid #e0e0e0'
          }}
        />
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {filteredPatients.map((patient) => (
          <div
            key={patient.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '1.5rem',
              background: '#f8f9fa',
              borderRadius: '15px',
              transition: 'background 0.2s ease'
            }}
          >
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #a8d5e2 0%, #d4f1f4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              marginRight: '1.5rem'
            }}>
              👤
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: 0, marginBottom: '0.25rem', fontSize: '1.1rem', fontWeight: '600' }}>
                {patient.name || 'Patient'}
              </h4>
              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                {patient.email}
              </p>
            </div>
            <button
              onClick={() => handleRequestAccess(patient.id)}
              className="btn btn-primary"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '10px',
                padding: '0.5rem 1.5rem'
              }}
            >
              Request Access
            </button>
          </div>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <p>No patients found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="dashboard-container">
      {/* Navigation Bar */}
      <nav style={{
        background: 'white',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        padding: '1rem 0',
        marginBottom: '2rem',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '2rem' }}>🐢</div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>TurtleHealth</h1>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setActiveView('patients')}
                style={{
                  background: activeView === 'patients' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                  color: activeView === 'patients' ? 'white' : '#666',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '10px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                My Patients
              </button>
              <button
                onClick={() => setActiveView('connect')}
                style={{
                  background: activeView === 'connect' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                  color: activeView === 'connect' ? 'white' : '#666',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '10px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Connect
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: '#f8f9fa',
                borderRadius: '10px'
              }}>
                <span style={{ fontSize: '1.2rem' }}>👨‍⚕️</span>
                <span style={{ fontWeight: '600' }}>Dr. {user?.name || 'Doctor'}</span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-outline-danger"
                style={{ borderRadius: '10px' }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container">
        {activeView === 'patients' && renderPatientsView()}
        {activeView === 'connect' && renderConnectView()}
      </div>

      {/* Patient Details Modal */}
      {showPatientModal && selectedPatient && (
        <div
          onClick={() => setShowPatientModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '2rem',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
            }}
          >
            {/* Patient Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '2rem',
              paddingBottom: '1rem',
              borderBottom: '2px solid #e0e0e0'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #a8d5e2 0%, #d4f1f4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                marginRight: '1.5rem'
              }}>
                👤
              </div>
              <div>
                <h2 style={{ margin: 0, marginBottom: '0.25rem' }}>{selectedPatient.name}</h2>
                <p style={{ margin: 0, color: '#666' }}>{selectedPatient.email}</p>
              </div>
              <button
                onClick={() => setShowPatientModal(false)}
                style={{
                  marginLeft: 'auto',
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ✕
              </button>
            </div>

            {/* Patient Information */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#333' }}>📋 Basic Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontWeight: '600', color: '#666', fontSize: '0.9rem' }}>Age</label>
                  <p style={{ margin: 0, fontSize: '1.1rem' }}>{selectedPatient.age || '--'} years</p>
                </div>
                <div>
                  <label style={{ fontWeight: '600', color: '#666', fontSize: '0.9rem' }}>Blood Type</label>
                  <p style={{ margin: 0, fontSize: '1.1rem' }}>{selectedPatient.bloodType || '--'}</p>
                </div>
                <div>
                  <label style={{ fontWeight: '600', color: '#666', fontSize: '0.9rem' }}>Height</label>
                  <p style={{ margin: 0, fontSize: '1.1rem' }}>{selectedPatient.height || '--'}</p>
                </div>
                <div>
                  <label style={{ fontWeight: '600', color: '#666', fontSize: '0.9rem' }}>Weight</label>
                  <p style={{ margin: 0, fontSize: '1.1rem' }}>{selectedPatient.weight || '--'}</p>
                </div>
              </div>
            </div>

            {/* Medical Conditions */}
            {selectedPatient.conditions && selectedPatient.conditions.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#333' }}>🏥 Medical Conditions</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {selectedPatient.conditions.map((condition, index) => (
                    <span
                      key={index}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#fff3cd',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        color: '#856404'
                      }}
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Current Biometrics */}
            {selectedPatient.currentBiometrics && (
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#333' }}>💓 Current Biometrics</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div style={{
                    padding: '1rem',
                    background: '#f8f9fa',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>❤️</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#667eea' }}>
                      {selectedPatient.currentBiometrics.heartRate} bpm
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>Heart Rate</div>
                  </div>
                  
                  <div style={{
                    padding: '1rem',
                    background: '#f8f9fa',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🩸</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#F44336' }}>
                      {selectedPatient.currentBiometrics.bloodPressure}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>Blood Pressure</div>
                  </div>
                  
                  <div style={{
                    padding: '1rem',
                    background: '#f8f9fa',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💨</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2196F3' }}>
                      {selectedPatient.currentBiometrics.o2Level}%
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>O₂ Level</div>
                  </div>
                  
                  <div style={{
                    padding: '1rem',
                    background: '#f8f9fa',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚶</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#4CAF50' }}>
                      {selectedPatient.currentBiometrics.steps}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>Steps Today</div>
                  </div>
                </div>

                {/* Stress Level */}
                {selectedPatient.currentBiometrics.stressScore !== undefined && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '1.5rem',
                    background: getStressLevel(selectedPatient.currentBiometrics.stressScore).color + '20',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🧘</div>
                    <div style={{
                      fontSize: '1.3rem',
                      fontWeight: '700',
                      color: getStressLevel(selectedPatient.currentBiometrics.stressScore).color
                    }}>
                      {getStressLevel(selectedPatient.currentBiometrics.stressScore).level} Stress Level
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>
                      Score: {selectedPatient.currentBiometrics.stressScore}/100
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorDashboard;
