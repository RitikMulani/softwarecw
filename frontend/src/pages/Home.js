import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, isPatient, isDoctor } = useAuth();

  return (
    <div className="container mt-5">
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '30px',
        padding: '60px 40px',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        marginBottom: '50px'
      }}>
        <div style={{fontSize: '64px', marginBottom: '20px'}}>🏥</div>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #6eb5d0 0%, #7fb069 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '20px'
        }}>
          Welcome to Health App
        </h1>
        <p style={{fontSize: '1.3rem', color: '#666', marginBottom: '40px'}}>
          Your comprehensive health management system for patients and doctors
        </p>
        
        {!isAuthenticated ? (
          <div>
            <p style={{fontSize: '1.1rem', color: '#666', marginBottom: '30px'}}>
              Get started by creating an account or logging in
            </p>
            <Link to="/register" className="btn btn-primary btn-lg me-3" style={{
              padding: '15px 40px',
              fontSize: '1.1rem',
              borderRadius: '25px'
            }}>
              Register Now
            </Link>
            <Link to="/login" className="btn btn-outline-primary btn-lg" style={{
              padding: '15px 40px',
              fontSize: '1.1rem',
              borderRadius: '25px',
              border: '2px solid #6eb5d0',
              color: '#6eb5d0'
            }}>
              Login
            </Link>
          </div>
        ) : (
          <div>
            <p style={{fontSize: '1.1rem', color: '#666', marginBottom: '30px'}}>
              Welcome back! Go to your dashboard to manage your health
            </p>
            <Link 
              to={isPatient ? '/patient-dashboard' : '/doctor-dashboard'} 
              className="btn btn-primary btn-lg"
              style={{
                padding: '15px 40px',
                fontSize: '1.1rem',
                borderRadius: '25px'
              }}
            >
              Go to Dashboard →
            </Link>
          </div>
        )}
      </div>

      <div className="row mt-5">
        <div className="col-md-4">
          <div className="health-metric-card" style={{textAlign: 'center', minHeight: '280px'}}>
            <div style={{fontSize: '64px', marginBottom: '20px'}}>📅</div>
            <h5 style={{fontWeight: '700', color: '#333', marginBottom: '15px', fontSize: '1.3rem'}}>
              Appointment Management
            </h5>
            <p style={{color: '#666', fontSize: '1rem'}}>
              Book, view, and manage appointments with doctors easily. Real-time scheduling and notifications.
            </p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="health-metric-card" style={{textAlign: 'center', minHeight: '280px'}}>
            <div style={{fontSize: '64px', marginBottom: '20px'}}>💊</div>
            <h5 style={{fontWeight: '700', color: '#333', marginBottom: '15px', fontSize: '1.3rem'}}>
              Prescription Tracking
            </h5>
            <p style={{color: '#666', fontSize: '1rem'}}>
              Keep track of all your prescriptions and medications in one secure place.
            </p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="health-metric-card" style={{textAlign: 'center', minHeight: '280px'}}>
            <div style={{fontSize: '64px', marginBottom: '20px'}}>📋</div>
            <h5 style={{fontWeight: '700', color: '#333', marginBottom: '15px', fontSize: '1.3rem'}}>
              Medical Records
            </h5>
            <p style={{color: '#666', fontSize: '1rem'}}>
              Access your complete medical history anytime, anywhere with secure cloud storage.
            </p>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-6">
          <div className="health-metric-card" style={{minHeight: '300px'}}>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '20px'}}>
              <div style={{fontSize: '48px', marginRight: '15px'}}>👤</div>
              <h5 style={{fontWeight: '700', color: '#333', margin: 0, fontSize: '1.5rem'}}>
                For Patients
              </h5>
            </div>
            <ul style={{listStyle: 'none', padding: 0, fontSize: '1rem', color: '#666'}}>
              <li style={{marginBottom: '12px', display: 'flex', alignItems: 'center'}}>
                <span style={{color: '#7fb069', marginRight: '10px', fontSize: '20px'}}>✓</span>
                Book appointments with doctors
              </li>
              <li style={{marginBottom: '12px', display: 'flex', alignItems: 'center'}}>
                <span style={{color: '#7fb069', marginRight: '10px', fontSize: '20px'}}>✓</span>
                View your medical records
              </li>
              <li style={{marginBottom: '12px', display: 'flex', alignItems: 'center'}}>
                <span style={{color: '#7fb069', marginRight: '10px', fontSize: '20px'}}>✓</span>
                Track prescriptions
              </li>
              <li style={{marginBottom: '12px', display: 'flex', alignItems: 'center'}}>
                <span style={{color: '#7fb069', marginRight: '10px', fontSize: '20px'}}>✓</span>
                Manage your health profile
              </li>
              <li style={{display: 'flex', alignItems: 'center'}}>
                <span style={{color: '#7fb069', marginRight: '10px', fontSize: '20px'}}>✓</span>
                Monitor wellness points and health metrics
              </li>
            </ul>
          </div>
        </div>

        <div className="col-md-6">
          <div className="health-metric-card" style={{minHeight: '300px'}}>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '20px'}}>
              <div style={{fontSize: '48px', marginRight: '15px'}}>👨‍⚕️</div>
              <h5 style={{fontWeight: '700', color: '#333', margin: 0, fontSize: '1.5rem'}}>
                For Doctors
              </h5>
            </div>
            <ul style={{listStyle: 'none', padding: 0, fontSize: '1rem', color: '#666'}}>
              <li style={{marginBottom: '12px', display: 'flex', alignItems: 'center'}}>
                <span style={{color: '#6eb5d0', marginRight: '10px', fontSize: '20px'}}>✓</span>
                Manage patient appointments
              </li>
              <li style={{marginBottom: '12px', display: 'flex', alignItems: 'center'}}>
                <span style={{color: '#6eb5d0', marginRight: '10px', fontSize: '20px'}}>✓</span>
                Create medical records
              </li>
              <li style={{marginBottom: '12px', display: 'flex', alignItems: 'center'}}>
                <span style={{color: '#6eb5d0', marginRight: '10px', fontSize: '20px'}}>✓</span>
                Issue prescriptions
              </li>
              <li style={{marginBottom: '12px', display: 'flex', alignItems: 'center'}}>
                <span style={{color: '#6eb5d0', marginRight: '10px', fontSize: '20px'}}>✓</span>
                View patient history
              </li>
              <li style={{display: 'flex', alignItems: 'center'}}>
                <span style={{color: '#6eb5d0', marginRight: '10px', fontSize: '20px'}}>✓</span>
                Track professional performance metrics
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
