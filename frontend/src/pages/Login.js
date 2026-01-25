import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      // Redirect based on user role
      const userRole = result.user?.role;
      if (userRole === 'admin') {
        navigate('/admin-dashboard');
      } else if (userRole === 'doctor') {
        navigate('/doctor-dashboard');
      } else if (userRole === 'provider') {
        navigate('/provider-dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.message || 'Login failed. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #a8d5e2 0%, #d4f1f4 100%)'
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card shadow-lg" style={{ borderRadius: '20px' }}>
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h1 style={{ fontSize: '3rem' }}>🐢</h1>
                  <h2 className="card-title mb-2">TurtleHealth</h2>
                  <p className="text-muted">Your companion for stress-free living</p>
                </div>
              
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary w-100"
                    disabled={loading}
                    style={{ 
                      borderRadius: '10px', 
                      padding: '12px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none'
                    }}
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                </form>

                <div className="text-center mt-4">
                  <small className="text-muted">
                    Demo: steven.merkel@email.com / User@123
                  </small>
                </div>

                <div className="text-center mt-3">
                  <span style={{ color: '#666' }}>Don't have an account? </span>
                  <Link 
                    to="/register" 
                    style={{ 
                      color: '#667eea', 
                      textDecoration: 'none', 
                      fontWeight: '600' 
                    }}
                  >
                    Register here
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
