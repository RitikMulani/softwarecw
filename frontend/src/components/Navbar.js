import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout, isPatient, isDoctor } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg" style={{
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
    }}>
      <div className="container">
        <Link className="navbar-brand" to="/" style={{
          color: '#6eb5d0',
          fontWeight: '700',
          fontSize: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          🏥 Health App
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          style={{border: '2px solid #6eb5d0'}}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <Link className="nav-link" to="/" style={{color: '#333', fontWeight: '500', padding: '8px 16px'}}>
                Home
              </Link>
            </li>
            
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to={isPatient ? '/patient-dashboard' : '/doctor-dashboard'} 
                    style={{color: '#333', fontWeight: '500', padding: '8px 16px'}}>
                    Dashboard
                  </Link>
                </li>
                
                <li className="nav-item">
                  <Link className="nav-link" to="/appointments" style={{color: '#333', fontWeight: '500', padding: '8px 16px'}}>
                    Appointments
                  </Link>
                </li>
                
                <li className="nav-item">
                  <Link className="nav-link" to="/prescriptions" style={{color: '#333', fontWeight: '500', padding: '8px 16px'}}>
                    Prescriptions
                  </Link>
                </li>
                
                <li className="nav-item">
                  <Link className="nav-link" to="/medical-records" style={{color: '#333', fontWeight: '500', padding: '8px 16px'}}>
                    Records
                  </Link>
                </li>
                
                <li className="nav-item">
                  <Link className="nav-link" to="/profile" style={{color: '#333', fontWeight: '500', padding: '8px 16px'}}>
                    Profile
                  </Link>
                </li>
                
                <li className="nav-item">
                  <span className="nav-link" style={{color: '#666', padding: '8px 16px'}}>
                    👋 {user?.full_name}
                  </span>
                </li>
                
                <li className="nav-item ms-2">
                  <button 
                    style={{
                      background: 'linear-gradient(135deg, #ff6b9d 0%, #ffa5c4 100%)',
                      border: 'none',
                      color: 'white',
                      padding: '8px 20px',
                      borderRadius: '20px',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={handleLogout}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login" style={{color: '#333', fontWeight: '500', padding: '8px 16px'}}>
                    Login
                  </Link>
                </li>
                
                <li className="nav-item ms-2">
                  <Link to="/register" style={{
                    background: 'linear-gradient(135deg, #6eb5d0 0%, #a8d5e2 100%)',
                    border: 'none',
                    color: 'white',
                    padding: '8px 20px',
                    borderRadius: '20px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    display: 'inline-block',
                    transition: 'all 0.3s ease'
                  }}>
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
