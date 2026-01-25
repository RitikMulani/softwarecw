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
import TurtleAvatar from '../components/TurtleAvatar/TurtleAvatar';
import api from '../services/api';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard');
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showHeartRateDetails, setShowHeartRateDetails] = useState(false);
  const [showBloodPressureDetails, setShowBloodPressureDetails] = useState(false);
  const [showO2Details, setShowO2Details] = useState(false);
  const [showStepsDetails, setShowStepsDetails] = useState(false);
  const [heartRateData, setHeartRateData] = useState([72, 75, 71, 73, 70, 72, 74, 73, 71, 72, 75, 73, 72, 71, 73, 72, 74, 73, 72, 71]);
  const [bloodPressureData] = useState([120, 118, 122, 119, 121, 120, 118, 120, 119, 121, 120, 122, 119, 120, 121, 119, 120, 118, 121, 120]);
  const [o2Data] = useState([98, 97, 98, 99, 98, 97, 98, 98, 99, 97, 98, 98, 97, 99, 98, 97, 98, 99, 98, 97]);
  const [stepsData] = useState([100, 500, 1200, 2100, 3400, 4200, 5100, 5900, 6800, 7200, 7800, 8200, 8500]);
  const [hrvData] = useState([55, 58, 54, 56, 59, 57, 55, 58, 56, 59, 57, 55, 58, 56, 59, 57, 56, 58, 57, 55]);
  const [accessRequests, setAccessRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [biometricAlerts, setBiometricAlerts] = useState([
    {
      id: 1,
      type: 'anomaly',
      metric: 'Heart Rate',
      reading: 48,
      status: 'Low',
      message: 'Your heart rate is unusually low (48 bpm). This is lower than your typical range.',
      timestamp: new Date(Date.now() - 3600000),
      severity: 'warning'
    },
    {
      id: 2,
      type: 'anomaly',
      metric: 'SpO2',
      reading: 94,
      status: 'Low',
      message: 'Your oxygen saturation is lower than normal (94%). Normal range is 95-100%.',
      timestamp: new Date(Date.now() - 7200000),
      severity: 'warning'
    },
    {
      id: 3,
      type: 'alert',
      metric: 'Heart Rate',
      reading: 94,
      status: 'High',
      message: 'Your heart rate is elevated (194 bpm). Consider relaxing or consulting a doctor if this persists.',
      timestamp: new Date(Date.now() - 7200000),
      severity: 'warning'
    }
  ]);
  
  const [leaderboard] = useState([
    { rank: 1, name: 'Steven Merkel', stress: 35, trend: 'up' },
    { rank: 2, name: 'Jackson Mike', stress: 42, trend: 'down' },
    { rank: 3, name: 'Ashton Rob', stress: 48, trend: 'neutral' },
    { rank: 4, name: 'Bob Ashton', stress: 55, trend: 'up' },
    { rank: 5, name: 'Five Seven', stress: 62, trend: 'down' },
  ]);

  const heartRate = 72;
  const steps = 8500;
  const stressScore = 45;
  const bloodPressure = '120/80';
  const o2Level = 98;
  const hrv = 57;
  const stressLevel = stressScore < 30 ? 'Low' : stressScore < 60 ? 'Moderate' : 'High';
  const stressColor = stressScore < 30 ? '#4CAF50' : stressScore < 60 ? '#FFC107' : '#F44336';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEmergencyCall = () => {
    alert('Emergency services have been notified! Help is on the way.\n\nEmergency Contact: (911)\nYour location has been shared.');
    setShowEmergencyModal(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setHeartRateData(prev => {
        const newData = [...prev.slice(1), 70 + Math.random() * 10];
        return newData;
      });
    }, 3000);

    // Fetch access requests
    fetchAccessRequests();

    return () => clearInterval(interval);
  }, []);

  const fetchAccessRequests = async () => {
    try {
      const response = await api.get('/sharing/requests');
      const pending = response.data.requests?.filter(req => req.status === 'pending') || [];
      setAccessRequests(pending);
    } catch (error) {
      console.error('Error fetching access requests:', error);
    }
  };

  const handleApproveRequest = async (requestId) => {
    setLoading(true);
    try {
      await api.post(`/sharing/${requestId}/accept`);
      alert('Access request approved! The provider can now view your health data.');
      fetchAccessRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request');
    }
    setLoading(false);
  };

  const handleRejectRequest = async (requestId) => {
    setLoading(true);
    try {
      await api.post(`/sharing/${requestId}/reject`);
      alert('Access request rejected.');
      fetchAccessRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request');
    }
    setLoading(false);
  };

  const getTrendArrow = (trend) => {
    if (trend === 'up') return <span style={{ color: '#4CAF50' }}>↑</span>;
    if (trend === 'down') return <span style={{ color: '#F44336' }}>↓</span>;
    return <span style={{ color: '#9E9E9E' }}>→</span>;
  };

  const getHeartRateStatus = (hr) => {
    if (hr < 60) return { status: 'Low', color: '#2196F3', emoji: '📉' };
    if (hr > 100) return { status: 'High', color: '#F44336', emoji: '📈' };
    return { status: 'Normal', color: '#4CAF50', emoji: '✓' };
  };

  const getBloodPressureStatus = (bp) => {
    // Parse "120/80" format
    const [sys, dia] = bp.split('/').map(Number);
    if (sys < 90 || dia < 60) return { status: 'Low', color: '#2196F3', emoji: '📉' };
    if (sys >= 140 || dia >= 90) return { status: 'High', color: '#F44336', emoji: '📈' };
    return { status: 'Normal', color: '#4CAF50', emoji: '✓' };
  };

  const getO2Status = (o2) => {
    if (o2 < 95) return { status: 'Low', color: '#F44336', emoji: '⚠️' };
    if (o2 >= 95 && o2 <= 100) return { status: 'Normal', color: '#4CAF50', emoji: '✓' };
    return { status: 'Normal', color: '#4CAF50', emoji: '✓' };
  };

  const getStepsStatus = (steps, goal = 10000) => {
    const percentage = (steps / goal) * 100;
    if (percentage < 50) return { status: 'Keep Going', color: '#FF9800', emoji: '🚶' };
    if (percentage < 100) return { status: 'Almost There', color: '#FFC107', emoji: '💪' };
    return { status: 'Goal Reached!', color: '#4CAF50', emoji: '🎉' };
  };

  const chartData = {
    labels: Array(heartRateData.length).fill(''),
    datasets: [
      {
        data: heartRateData,
        fill: true,
        backgroundColor: 'rgba(99, 132, 255, 0.1)',
        borderColor: 'rgba(99, 132, 255, 1)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
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

  const stepsPercent = Math.min((steps / 10000) * 100, 100);

  const renderProfileView = () => (
    <div className="dashboard-card">
      <h3 className="card-title mb-4">👤 Profile</h3>
      <div style={{ display: 'flex', gap: '3rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: '600', color: '#666', display: 'block', marginBottom: '0.5rem' }}>Name</label>
            <p style={{ fontSize: '1.1rem', margin: 0 }}>{user?.name || 'User'}</p>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: '600', color: '#666', display: 'block', marginBottom: '0.5rem' }}>Email</label>
            <p style={{ fontSize: '1.1rem', margin: 0 }}>{user?.email || 'user@turtlehealth.com'}</p>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: '600', color: '#666', display: 'block', marginBottom: '0.5rem' }}>Age</label>
            <p style={{ fontSize: '1.1rem', margin: 0 }}>32 years</p>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: '600', color: '#666', display: 'block', marginBottom: '0.5rem' }}>Height</label>
            <p style={{ fontSize: '1.1rem', margin: 0 }}>5'10" (178 cm)</p>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: '600', color: '#666', display: 'block', marginBottom: '0.5rem' }}>Weight</label>
            <p style={{ fontSize: '1.1rem', margin: 0 }}>165 lbs (75 kg)</p>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: '600', color: '#666', display: 'block', marginBottom: '0.5rem' }}>Blood Type</label>
            <p style={{ fontSize: '1.1rem', margin: 0 }}>O+</p>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: '600', color: '#666', display: 'block', marginBottom: '0.5rem' }}>Emergency Contact</label>
            <p style={{ fontSize: '1.1rem', margin: 0 }}>Jane Doe - (555) 123-4567</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLeaderboardView = () => (
    <div className="dashboard-card">
      <h3 className="card-title mb-3">🏆 Leaderboard (Lowest Stress)</h3>
      {leaderboard.map((entry) => (
        <div key={entry.rank} className="leaderboard-row">
          <span className="leaderboard-rank">#{entry.rank}</span>
          <span className="leaderboard-name">{entry.name}</span>
          <div className="leaderboard-divider"></div>
          <span className="leaderboard-stress">
            Stress: {entry.stress}
            <span style={{ marginLeft: '0.5rem' }}>{getTrendArrow(entry.trend)}</span>
          </span>
        </div>
      ))}
    </div>
  );

  const renderMedicalView = () => (
    <div className="dashboard-card">
      <h3 className="card-title mb-4">💊 Medical Information</h3>
      
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ color: '#667eea', marginBottom: '1rem' }}>Current Medications</h4>
        <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '10px', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <strong>Lisinopril 10mg</strong>
            <span style={{ color: '#666' }}>1x daily</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>For blood pressure management</p>
        </div>
        <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '10px', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <strong>Vitamin D3 2000 IU</strong>
            <span style={{ color: '#666' }}>1x daily</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Supplement</p>
        </div>
        <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <strong>Aspirin 81mg</strong>
            <span style={{ color: '#666' }}>1x daily</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Preventive care</p>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ color: '#667eea', marginBottom: '1rem' }}>Conditions</h4>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ background: '#e3f2fd', color: '#1976d2', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem' }}>Hypertension (Controlled)</span>
          <span style={{ background: '#fff3e0', color: '#f57c00', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem' }}>Seasonal Allergies</span>
        </div>
      </div>

      <div>
        <h4 style={{ color: '#667eea', marginBottom: '1rem' }}>Allergies</h4>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ background: '#ffebee', color: '#c62828', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem' }}>Penicillin</span>
          <span style={{ background: '#ffebee', color: '#c62828', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem' }}>Pollen</span>
        </div>
      </div>
    </div>
  );

  const renderBiometricsView = () => (
    <>
      <div className="row mb-4">
        <div className="col-md-6 mb-4">
          <div className="dashboard-card" style={{ cursor: 'pointer' }} onClick={() => setShowHeartRateDetails(!showHeartRateDetails)}>
            <h3 className="card-title mb-3">❤️ Heart Rate {showHeartRateDetails && '▼'}</h3>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <strong style={{ fontSize: '2.5rem', color: '#6C63FF' }}>{Math.round(heartRateData[heartRateData.length - 1])}</strong>
              <span style={{ fontSize: '1.2rem', color: '#666', marginLeft: '0.5rem' }}>bpm</span>
            </div>
            <div className="chart-container" style={{ height: '150px' }}>
              <Line data={createChartData(heartRateData, '#6C63FF')} options={chartOptions} />
            </div>

            {showHeartRateDetails && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid #e0e0e0' }}>
                <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#333' }}>📊 Heart Rate Analysis</h4>
                
                <div style={{ marginBottom: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Today</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{getHeartRateStatus(Math.round(heartRateData[heartRateData.length - 1])).emoji}</span>
                    <span style={{ fontWeight: 'bold', color: getHeartRateStatus(Math.round(heartRateData[heartRateData.length - 1])).color }}>
                      {getHeartRateStatus(Math.round(heartRateData[heartRateData.length - 1])).status}
                    </span>
                    <span style={{ color: '#666' }}>({Math.round(heartRateData[heartRateData.length - 1])} bpm)</span>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Yesterday</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{getHeartRateStatus(Math.round(heartRateData[heartRateData.length - 5])).emoji}</span>
                    <span style={{ fontWeight: 'bold', color: getHeartRateStatus(Math.round(heartRateData[heartRateData.length - 5])).color }}>
                      {getHeartRateStatus(Math.round(heartRateData[heartRateData.length - 5])).status}
                    </span>
                    <span style={{ color: '#666' }}>({Math.round(heartRateData[heartRateData.length - 5])} bpm)</span>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Last Week Average</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>📈</span>
                    <span style={{ fontWeight: 'bold', color: '#FF9800' }}>
                      {Math.round(heartRateData.reduce((a, b) => a + b) / heartRateData.length)}
                    </span>
                    <span style={{ color: '#666' }}>bpm</span>
                  </div>
                </div>

                <div style={{ padding: '1rem', background: '#E3F2FD', borderRadius: '8px', borderLeft: '4px solid #2196F3' }}>
                  <div style={{ fontSize: '0.85rem', color: '#1565C0', lineHeight: '1.6' }}>
                    <strong>ℹ️ Normal Range:</strong> 60-100 bpm at rest. Your readings show a healthy pattern.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="dashboard-card" style={{ cursor: 'pointer' }} onClick={() => setShowBloodPressureDetails(!showBloodPressureDetails)}>
            <h3 className="card-title mb-3">🩸 Blood Pressure {showBloodPressureDetails && '▼'}</h3>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <strong style={{ fontSize: '2.5rem', color: '#E91E63' }}>{bloodPressure}</strong>
              <span style={{ fontSize: '1.2rem', color: '#666', marginLeft: '0.5rem' }}>mmHg</span>
            </div>
            <div className="chart-container" style={{ height: '150px' }}>
              <Line data={createChartData(bloodPressureData, '#E91E63')} options={chartOptions} />
            </div>

            {showBloodPressureDetails && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid #e0e0e0' }}>
                <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#333' }}>📊 Blood Pressure Analysis</h4>
                
                <div style={{ marginBottom: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Today</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{getBloodPressureStatus(bloodPressure).emoji}</span>
                    <span style={{ fontWeight: 'bold', color: getBloodPressureStatus(bloodPressure).color }}>
                      {getBloodPressureStatus(bloodPressure).status}
                    </span>
                    <span style={{ color: '#666' }}>({bloodPressure} mmHg)</span>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Yesterday</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{getBloodPressureStatus(`${bloodPressureData[bloodPressureData.length - 5]}/80`).emoji}</span>
                    <span style={{ fontWeight: 'bold', color: getBloodPressureStatus(`${bloodPressureData[bloodPressureData.length - 5]}/80`).color }}>
                      {getBloodPressureStatus(`${bloodPressureData[bloodPressureData.length - 5]}/80`).status}
                    </span>
                    <span style={{ color: '#666' }}>({bloodPressureData[bloodPressureData.length - 5]}/80 mmHg)</span>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Last Week Average</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>📊</span>
                    <span style={{ fontWeight: 'bold', color: '#FF9800' }}>
                      {Math.round(bloodPressureData.reduce((a, b) => a + b) / bloodPressureData.length)}/80
                    </span>
                    <span style={{ color: '#666' }}>mmHg</span>
                  </div>
                </div>

                <div style={{ padding: '1rem', background: '#FFF3E0', borderRadius: '8px', borderLeft: '4px solid #FF9800' }}>
                  <div style={{ fontSize: '0.85rem', color: '#E65100', lineHeight: '1.6' }}>
                    <strong>ℹ️ Normal Range:</strong> Systolic 120 or less, Diastolic 80 or less. Stay hydrated and manage stress.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6 mb-4">
          <div className="dashboard-card" style={{ cursor: 'pointer' }} onClick={() => setShowO2Details(!showO2Details)}>
            <h3 className="card-title mb-3">💨 Oxygen Level {showO2Details && '▼'}</h3>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <strong style={{ fontSize: '2.5rem', color: '#00BCD4' }}>{o2Level}</strong>
              <span style={{ fontSize: '1.2rem', color: '#666', marginLeft: '0.5rem' }}>%</span>
            </div>
            <div className="chart-container" style={{ height: '150px' }}>
              <Line data={createChartData(o2Data, '#00BCD4')} options={chartOptions} />
            </div>

            {showO2Details && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid #e0e0e0' }}>
                <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#333' }}>📊 Oxygen Saturation Analysis</h4>
                
                <div style={{ marginBottom: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Today</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{getO2Status(o2Level).emoji}</span>
                    <span style={{ fontWeight: 'bold', color: getO2Status(o2Level).color }}>
                      {getO2Status(o2Level).status}
                    </span>
                    <span style={{ color: '#666' }}>({o2Level}%)</span>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Yesterday</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{getO2Status(o2Data[o2Data.length - 5]).emoji}</span>
                    <span style={{ fontWeight: 'bold', color: getO2Status(o2Data[o2Data.length - 5]).color }}>
                      {getO2Status(o2Data[o2Data.length - 5]).status}
                    </span>
                    <span style={{ color: '#666' }}>({o2Data[o2Data.length - 5]}%)</span>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Last Week Average</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>📈</span>
                    <span style={{ fontWeight: 'bold', color: '#FF9800' }}>
                      {Math.round(o2Data.reduce((a, b) => a + b) / o2Data.length)}
                    </span>
                    <span style={{ color: '#666' }}>%</span>
                  </div>
                </div>

                <div style={{ padding: '1rem', background: '#E0F2F1', borderRadius: '8px', borderLeft: '4px solid #00BCD4' }}>
                  <div style={{ fontSize: '0.85rem', color: '#004D40', lineHeight: '1.6' }}>
                    <strong>ℹ️ Normal Range:</strong> 95-100%. If below 95%, consult a doctor. Ensure good ventilation and avoid strenuous activity.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="dashboard-card" style={{ cursor: 'pointer' }} onClick={() => setShowStepsDetails(!showStepsDetails)}>
            <h3 className="card-title mb-3">👟 Steps {showStepsDetails && '▼'}</h3>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <strong style={{ fontSize: '2.5rem', color: '#4CAF50' }}>{steps.toLocaleString()}</strong>
              <span style={{ fontSize: '1.2rem', color: '#666', marginLeft: '0.5rem' }}>/ 10,000</span>
            </div>
            <div className="chart-container" style={{ height: '150px' }}>
              <Line data={createChartData(stepsData, '#4CAF50')} options={chartOptions} />
            </div>

            {showStepsDetails && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid #e0e0e0' }}>
                <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#333' }}>📊 Steps & Goals Analysis</h4>
                
                <div style={{ marginBottom: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Today</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{getStepsStatus(steps).emoji}</span>
                    <span style={{ fontWeight: 'bold', color: getStepsStatus(steps).color }}>
                      {getStepsStatus(steps).status}
                    </span>
                    <span style={{ color: '#666' }}>({Math.round((steps / 10000) * 100)}%)</span>
                  </div>
                  <div style={{ background: 'white', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ height: '8px', background: '#e0e0e0', width: '100%' }}>
                      <div style={{ height: '100%', background: '#4CAF50', width: `${Math.min((steps / 10000) * 100, 100)}%`, transition: 'width 0.3s' }}></div>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Yesterday</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{getStepsStatus(stepsData[stepsData.length - 5]).emoji}</span>
                    <span style={{ fontWeight: 'bold', color: getStepsStatus(stepsData[stepsData.length - 5]).color }}>
                      {getStepsStatus(stepsData[stepsData.length - 5]).status}
                    </span>
                    <span style={{ color: '#666' }}>({stepsData[stepsData.length - 5].toLocaleString()} steps)</span>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Weekly Average</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>📊</span>
                    <span style={{ fontWeight: 'bold', color: '#FF9800' }}>
                      {Math.round(stepsData.reduce((a, b) => a + b) / stepsData.length).toLocaleString()}
                    </span>
                    <span style={{ color: '#666' }}>steps/day</span>
                  </div>
                </div>

                <div style={{ padding: '1rem', background: '#F1F8E9', borderRadius: '8px', borderLeft: '4px solid #4CAF50' }}>
                  <div style={{ fontSize: '0.85rem', color: '#33691E', lineHeight: '1.6' }}>
                    <strong>ℹ️ Daily Goal:</strong> 10,000 steps recommended. Keep moving! Even small walks throughout the day help.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6 mb-4">
          <div className="dashboard-card">
            <h3 className="card-title mb-3">😰 Stress Level</h3>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <strong style={{ fontSize: '2.5rem', color: stressColor }}>{stressScore}</strong>
              <span style={{ fontSize: '1.2rem', color: '#666', marginLeft: '0.5rem' }}>/ 100</span>
            </div>
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <span style={{ 
                background: stressColor, 
                color: 'white', 
                padding: '0.5rem 1.5rem', 
                borderRadius: '20px',
                fontWeight: '600'
              }}>
                {stressLevel} Stress
              </span>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="dashboard-card">
            <h3 className="card-title mb-3">💓 HRV (Heart Rate Variability)</h3>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <strong style={{ fontSize: '2.5rem', color: '#9C27B0' }}>{hrv}</strong>
              <span style={{ fontSize: '1.2rem', color: '#666', marginLeft: '0.5rem' }}>ms</span>
            </div>
            <div className="chart-container" style={{ height: '150px' }}>
              <Line data={createChartData(hrvData, '#9C27B0')} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ fontSize: '2rem', margin: 0 }}>🐢 TurtleHealth</h1>
            <span style={{ color: '#666' }}>Welcome, {user?.name || 'User'}</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button 
              onClick={() => setShowEmergencyModal(true)}
              style={{
                background: '#F44336',
                border: 'none',
                color: 'white',
                padding: '10px 24px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              🚨 Emergency
            </button>
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
      </div>

      {/* Emergency Modal */}
      {showEmergencyModal && (
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
            width: '90%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            animation: 'slideIn 0.3s ease-out'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚨</div>
              <h2 style={{ fontSize: '1.8rem', color: '#F44336', marginBottom: '0.5rem' }}>Emergency Services</h2>
              <p style={{ color: '#666', fontSize: '1rem' }}>Do you need immediate assistance?</p>
            </div>
            
            <div style={{
              background: '#fff3e0',
              border: '1px solid #ff9800',
              borderRadius: '10px',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <p style={{ margin: 0, color: '#e65100', fontSize: '0.9rem' }}>
                <strong>⚠️ Note:</strong> This will immediately contact emergency services (911) and share your location.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowEmergencyModal(false)}
                style={{
                  flex: 1,
                  background: '#e0e0e0',
                  border: 'none',
                  color: '#333',
                  padding: '1rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#d0d0d0'}
                onMouseLeave={(e) => e.target.style.background = '#e0e0e0'}
              >
                Cancel
              </button>
              <button
                onClick={handleEmergencyCall}
                style={{
                  flex: 1,
                  background: '#F44336',
                  border: 'none',
                  color: 'white',
                  padding: '1rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem',
                  boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#D32F2F';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#F44336';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                Call 911 Now
              </button>
            </div>
          </div>
        </div>
      )}

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
              onClick={() => setActiveView('dashboard')}
              style={{
                width: '100%',
                padding: '1rem 2rem',
                background: activeView === 'dashboard' ? '#667eea' : 'transparent',
                color: activeView === 'dashboard' ? 'white' : '#333',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              🏠 Dashboard
            </button>
            <button
              onClick={() => setActiveView('profile')}
              style={{
                width: '100%',
                padding: '1rem 2rem',
                background: activeView === 'profile' ? '#667eea' : 'transparent',
                color: activeView === 'profile' ? 'white' : '#333',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              👤 Profile
            </button>
            <button
              onClick={() => setActiveView('leaderboard')}
              style={{
                width: '100%',
                padding: '1rem 2rem',
                background: activeView === 'leaderboard' ? '#667eea' : 'transparent',
                color: activeView === 'leaderboard' ? 'white' : '#333',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              🏆 Leaderboard
            </button>
            <button
              onClick={() => setActiveView('medical')}
              style={{
                width: '100%',
                padding: '1rem 2rem',
                background: activeView === 'medical' ? '#667eea' : 'transparent',
                color: activeView === 'medical' ? 'white' : '#333',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              💊 Medical Info
            </button>
            <button
              onClick={() => setActiveView('biometrics')}
              style={{
                width: '100%',
                padding: '1rem 2rem',
                background: activeView === 'biometrics' ? '#667eea' : 'transparent',
                color: activeView === 'biometrics' ? 'white' : '#333',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              📊 Biometrics
            </button>
            <button
              onClick={() => setActiveView('notifications')}
              style={{
                width: '100%',
                padding: '1rem 2rem',
                background: activeView === 'notifications' ? '#667eea' : 'transparent',
                color: activeView === 'notifications' ? 'white' : '#333',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'all 0.2s',
                position: 'relative'
              }}
            >
              🔔 Notifications
              {accessRequests.length > 0 && (
                <span style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#F44336',
                  color: 'white',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}>
                  {accessRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveView('smartwatch')}
              style={{
                width: '100%',
                padding: '1rem 2rem',
                background: activeView === 'smartwatch' ? '#667eea' : 'transparent',
                color: activeView === 'smartwatch' ? 'white' : '#333',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              ⌚ Smartwatch
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: '2rem' }}>
          {activeView === 'dashboard' && (
            <>
              <div className="row mb-4">
                <div className="col-md-6 mb-4">
                  <div className="dashboard-card">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h3 className="card-title">Heart Rate</h3>
                      <div className="heart-rate-display">
                        <strong style={{ fontSize: '1.5rem', color: '#6C63FF' }}>
                          {Math.round(heartRateData[heartRateData.length - 1])} bpm
                        </strong>
                      </div>
                    </div>
                    <div className="chart-container">
                      <Line data={chartData} options={chartOptions} />
                    </div>
                  </div>
                </div>

                <div className="col-md-6 mb-4">
                  <div className="dashboard-card">
                    <h3 className="card-title mb-3">Steps</h3>
                    <div className="steps-section">
                      <div className="steps-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="#4CAF50">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M10 8h4v8h-4z" fill="white" />
                        </svg>
                      </div>
                      <div className="steps-info">
                        <div className="steps-count">
                          <strong style={{ fontSize: '1.8rem' }}>{steps.toLocaleString()}</strong>
                          <span style={{ color: '#666', marginLeft: '0.5rem' }}>/ 10,000 Goal</span>
                        </div>
                        <div className="progress-bar mt-2">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${stepsPercent}%` }}
                          />
                        </div>
                        <small className="text-muted mt-1" style={{ display: 'block' }}>{Math.round(stepsPercent)}% Complete</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-7 mb-4">
                  <div className="dashboard-card">
                    <h3 className="card-title mb-3">🏆 Leaderboard (Lowest Stress)</h3>
                    {leaderboard.map((entry) => (
                      <div key={entry.rank} className="leaderboard-row">
                        <span className="leaderboard-rank">#{entry.rank}</span>
                        <span className="leaderboard-name">{entry.name}</span>
                        <div className="leaderboard-divider"></div>
                        <span className="leaderboard-stress">
                          Stress: {entry.stress}
                          <span style={{ marginLeft: '0.5rem' }}>{getTrendArrow(entry.trend)}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-md-5 mb-4">
                  <div className="dashboard-card">
                    <h3 className="card-title mb-3">Daily Suggestion</h3>
                    <p className="suggestion-text">
                      Please drink at least 2 liters of water today and take short breaks to stretch.
                    </p>
                    <div className="text-center my-3">
                      <TurtleAvatar
                        stressScore={stressScore}
                        metrics={{ heartRate, steps, stressScore }}
                      />
                    </div>
                    <div className="text-center">
                      <button
                        className="stress-pill"
                        style={{ backgroundColor: stressColor, border: 'none', cursor: 'default' }}
                      >
                        Stress: {stressLevel} ({stressScore})
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          {activeView === 'profile' && renderProfileView()}
          {activeView === 'leaderboard' && renderLeaderboardView()}
          {activeView === 'medical' && renderMedicalView()}
          {activeView === 'biometrics' && renderBiometricsView()}
          {activeView === 'notifications' && (
            <>
              <h2 style={{ marginBottom: '2rem' }}>📬 Notifications</h2>

              {/* Healthcare Provider Notifications Section */}
              <div style={{ marginBottom: '3rem' }}>
                <h3 style={{ marginBottom: '1.5rem', color: '#333', fontSize: '1.3rem' }}>
                  🏥 Healthcare Provider Access Requests
                </h3>
                
                {accessRequests.length > 0 ? (
                  <div className="row">
                    {accessRequests.map((request) => (
                      <div key={request.id} className="col-12 mb-3">
                        <div className="dashboard-card" style={{ borderLeft: '4px solid #FF9800' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div style={{ flex: 1 }}>
                              <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>
                                🏥 Healthcare Provider Access Request
                              </h4>
                              <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>
                                <strong>{request.provider_name}</strong> from <strong>{request.facility}</strong>
                              </p>
                              <p style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.9rem' }}>
                                Specialization: {request.specialization}
                              </p>
                              <p style={{ margin: '0 0 1rem 0', color: '#888', fontSize: '0.85rem' }}>
                                Requested on: {new Date(request.created_at).toLocaleString()}
                              </p>
                              <div style={{ 
                                background: '#FFF3E0', 
                                padding: '1rem', 
                                borderRadius: '8px',
                                marginBottom: '1rem'
                              }}>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#E65100' }}>
                                  ℹ️ This provider is requesting access to view your health data and history. 
                                  You can approve or reject this request below.
                                </p>
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button
                              onClick={() => handleApproveRequest(request.id)}
                              disabled={loading}
                              style={{
                                flex: 1,
                                background: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '10px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontWeight: '600',
                                fontSize: '1rem',
                                opacity: loading ? 0.7 : 1
                              }}
                            >
                              ✓ Approve Access
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request.id)}
                              disabled={loading}
                              style={{
                                flex: 1,
                                background: '#F44336',
                                color: 'white',
                                border: 'none',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '10px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontWeight: '600',
                                fontSize: '1rem',
                                opacity: loading ? 0.7 : 1
                              }}
                            >
                              ✗ Reject Request
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="dashboard-card" style={{ textAlign: 'center', padding: '2rem', background: '#E8F5E9' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✓</div>
                    <h3 style={{ color: '#2E7D32', marginBottom: '0.5rem' }}>No Access Requests</h3>
                    <p style={{ color: '#558B2F', margin: 0 }}>
                      You don't have any pending provider access requests.
                    </p>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '2px solid #e0e0e0', paddingTop: '2rem' }}></div>

              {/* Biometric Notifications Section */}
              <div>
                <h3 style={{ marginBottom: '1.5rem', color: '#333', fontSize: '1.3rem' }}>
                  💓 Biometric Alerts & Anomalies
                </h3>

                {biometricAlerts.length > 0 ? (
                  <div className="row">
                    {biometricAlerts.map((alert) => {
                      let borderColor = '#FF9800';
                      let bgColor = '#FFF3E0';
                      let textColor = '#E65100';
                      let icon = '⚠️';

                      if (alert.severity === 'critical') {
                        borderColor = '#F44336';
                        bgColor = '#FFEBEE';
                        textColor = '#C62828';
                        icon = '🚨';
                      } else if (alert.severity === 'warning') {
                        borderColor = '#FF9800';
                        bgColor = '#FFF3E0';
                        textColor = '#E65100';
                        icon = '⚠️';
                      } else {
                        borderColor = '#2196F3';
                        bgColor = '#E3F2FD';
                        textColor = '#1565C0';
                        icon = 'ℹ️';
                      }

                      return (
                        <div key={alert.id} className="col-12 mb-3">
                          <div className="dashboard-card" style={{ borderLeft: `4px solid ${borderColor}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                              <div style={{ flex: 1 }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>
                                  {icon} {alert.metric} Alert
                                </h4>
                                <p style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.95rem' }}>
                                  <strong>Status:</strong> {alert.status} ({alert.reading} {alert.metric === 'Heart Rate' ? 'bpm' : alert.metric === 'SpO2' ? '%' : '°C'})
                                </p>
                                <p style={{ margin: '0 0 0.75rem 0', color: '#666', fontSize: '0.9rem' }}>
                                  {alert.message}
                                </p>
                                <p style={{ margin: '0', color: '#999', fontSize: '0.85rem' }}>
                                  {alert.timestamp.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div style={{ 
                              background: bgColor, 
                              padding: '1rem', 
                              borderRadius: '8px',
                              marginTop: '1rem'
                            }}>
                              <p style={{ margin: 0, fontSize: '0.85rem', color: textColor, lineHeight: '1.5' }}>
                                {alert.severity === 'critical' ? 
                                  '🚨 This is a critical alert. Please seek medical attention if symptoms persist.' :
                                  alert.severity === 'warning' ?
                                  '⚠️ This reading is outside your normal range. Monitor this metric and contact your doctor if it persists.' :
                                  'ℹ️ This reading is unusual but within normal ranges. Continue monitoring.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="dashboard-card" style={{ textAlign: 'center', padding: '2rem', background: '#E8F5E9' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✓</div>
                    <h3 style={{ color: '#2E7D32', marginBottom: '0.5rem' }}>All Clear</h3>
                    <p style={{ color: '#558B2F', margin: 0 }}>
                      No biometric anomalies detected. Your health metrics look good!
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
          {activeView === 'smartwatch' && (
            <>
              <h2 style={{ marginBottom: '2rem' }}>⌚ Smartwatch Connection</h2>
              
              <div className="row">
                <div className="col-lg-6">
                  <div className="dashboard-card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ fontSize: '6rem', marginBottom: '1.5rem' }}>⌚</div>
                    <h3 style={{ color: '#667eea', marginBottom: '1rem' }}>Connect Your Smartwatch</h3>
                    <p style={{ color: '#666', marginBottom: '2rem', lineHeight: '1.6' }}>
                      Connect your smartwatch to automatically sync your health data in real-time. 
                      This feature allows seamless tracking of your biometric data including heart rate, 
                      steps, sleep patterns, and more.
                    </p>
                    <button
                      onClick={() => alert('This is a demo feature. In a real application, this would connect to your smartwatch via Bluetooth or API.')}
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '1rem 2.5rem',
                        borderRadius: '12px',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                        transition: 'transform 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                      onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                      🔗 Connect Smartwatch
                    </button>
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="dashboard-card" style={{ background: '#f8f9fa' }}>
                    <h4 style={{ marginBottom: '1.5rem', color: '#333' }}>Supported Devices</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {[
                        { name: 'Apple Watch', icon: '🍎', status: 'Compatible' },
                        { name: 'Samsung Galaxy Watch', icon: '📱', status: 'Compatible' },
                        { name: 'Fitbit', icon: '🏃', status: 'Compatible' },
                        { name: 'Garmin', icon: '⚡', status: 'Compatible' },
                        { name: 'Google Wear OS', icon: '🤖', status: 'Compatible' }
                      ].map((device, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1rem',
                            background: 'white',
                            borderRadius: '10px',
                            border: '1px solid #e0e0e0'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '2rem' }}>{device.icon}</span>
                            <span style={{ fontWeight: '500', color: '#333' }}>{device.name}</span>
                          </div>
                          <span style={{
                            padding: '0.4rem 1rem',
                            background: '#E8F5E9',
                            color: '#2E7D32',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: '600'
                          }}>
                            ✓ {device.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
