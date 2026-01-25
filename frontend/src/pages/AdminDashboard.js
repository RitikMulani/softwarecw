import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Dashboard.css';
import './AdminDashboard.css';

function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState('create');
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Form state for creating doctor
  const [doctorForm, setDoctorForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    date_of_birth: '',
    gender: 'Male'
  });

  useEffect(() => {
    if (activeView === 'delete') {
      fetchAllUsers();
    }
  }, [activeView]);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.users || []);
      setDoctors(response.data.doctors || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
    setLoading(false);
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    
    if (!doctorForm.email || !doctorForm.password || !doctorForm.full_name) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await api.post('/admin/create-doctor', doctorForm);
      alert('Doctor account created successfully!');
      setDoctorForm({
        email: '',
        password: '',
        full_name: '',
        phone: '',
        date_of_birth: '',
        gender: 'Male'
      });
    } catch (error) {
      console.error('Error creating doctor:', error);
      alert(error.response?.data?.message || 'Failed to create doctor account');
    }
    setLoading(false);
  };

  const handleDeleteUser = async (userId, userName, userType) => {
    if (!window.confirm(`Are you sure you want to delete ${userType} ${userName}? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      await api.delete(`/admin/users/${userId}`);
      alert(`${userType} deleted successfully`);
      fetchAllUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.message || 'Failed to delete user');
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setDoctorForm({
      ...doctorForm,
      [e.target.name]: e.target.value
    });
  };

  const renderCreateDoctorView = () => (
    <div className="admin-content-section">
      <div className="admin-card">
        <h3 className="admin-card-title">Create New Doctor Account</h3>
        <form onSubmit={handleCreateDoctor} className="admin-form">
          <div className="form-row">
            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                value={doctorForm.email}
                onChange={handleInputChange}
                placeholder="doctor@hospital.com"
                required
              />
            </div>
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                value={doctorForm.password}
                onChange={handleInputChange}
                placeholder="Minimum 8 characters"
                minLength="8"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="full_name"
                value={doctorForm.full_name}
                onChange={handleInputChange}
                placeholder="Dr. John Smith"
                required
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={doctorForm.phone}
                onChange={handleInputChange}
                placeholder="555-0123"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={doctorForm.date_of_birth}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select
                name="gender"
                value={doctorForm.gender}
                onChange={handleInputChange}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <button type="submit" className="admin-submit-btn" disabled={loading}>
            {loading ? 'Creating...' : 'Create Doctor Account'}
          </button>
        </form>
      </div>
    </div>
  );

  const renderDeleteUsersView = () => (
    <div className="admin-content-section">
      <div className="admin-card">
        <h3 className="admin-card-title">Manage Doctors</h3>
        {loading ? (
          <div className="loading-text">Loading...</div>
        ) : doctors.length === 0 ? (
          <p className="no-data-text">No doctors found</p>
        ) : (
          <div className="users-grid">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="user-card-admin">
                <div className="user-info">
                  <div className="user-avatar">👨‍⚕️</div>
                  <div>
                    <h4>{doctor.full_name}</h4>
                    <p className="user-email">{doctor.email}</p>
                    {doctor.phone && <p className="user-detail">📞 {doctor.phone}</p>}
                  </div>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteUser(doctor.id, doctor.full_name, 'Doctor')}
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-card" style={{ marginTop: '20px' }}>
        <h3 className="admin-card-title">Manage Patients</h3>
        {loading ? (
          <div className="loading-text">Loading...</div>
        ) : users.length === 0 ? (
          <p className="no-data-text">No patients found</p>
        ) : (
          <div className="users-grid">
            {users.map((patient) => (
              <div key={patient.id} className="user-card-admin">
                <div className="user-info">
                  <div className="user-avatar">👤</div>
                  <div>
                    <h4>{patient.full_name}</h4>
                    <p className="user-email">{patient.email}</p>
                    {patient.phone && <p className="user-detail">📞 {patient.phone}</p>}
                  </div>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteUser(patient.id, patient.full_name, 'Patient')}
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="dashboard-container admin-dashboard">
      {/* Sidebar */}
      <div className="dashboard-sidebar admin-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Admin Panel</h2>
          <div className="user-info-sidebar">
            <div className="user-avatar-sidebar">⚙️</div>
            <div className="user-details">
              <p className="user-name">{user?.full_name || 'Admin'}</p>
              <p className="user-role">Administrator</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeView === 'create' ? 'active' : ''}`}
            onClick={() => setActiveView('create')}
          >
            <span className="nav-icon">➕</span>
            <span>Create Doctor</span>
          </button>
          <button
            className={`nav-item ${activeView === 'delete' ? 'active' : ''}`}
            onClick={() => setActiveView('delete')}
          >
            <span className="nav-icon">🗑️</span>
            <span>Manage Users</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={logout}>
            <span className="nav-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main admin-main">
        <div className="dashboard-header">
          <h2 className="dashboard-title">
            {activeView === 'create' ? 'Create Doctor Account' : 'Manage Users'}
          </h2>
          <p className="dashboard-subtitle">
            {activeView === 'create' 
              ? 'Add new doctor accounts to the system' 
              : 'View and delete user accounts'}
          </p>
        </div>

        {activeView === 'create' ? renderCreateDoctorView() : renderDeleteUsersView()}
      </div>
    </div>
  );
}

export default AdminDashboard;
