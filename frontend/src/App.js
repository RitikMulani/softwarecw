import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Dashboard Routes by Role */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/admin-dashboard" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="/provider-dashboard" element={
              <ProtectedRoute requiredRole="provider">
                <ProviderDashboard />
              </ProtectedRoute>
            } />

            <Route path="/doctor-dashboard" element={
              <ProtectedRoute requiredRole="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            } />
            
            {/* Redirect root to dashboard if logged in, otherwise to login */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Redirect unknown routes to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
