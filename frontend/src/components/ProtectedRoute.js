import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Component to protect routes that require authentication
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If requiredRole is specified, check if user has the correct role
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user's actual role
    let redirectPath = '/dashboard';
    if (user?.role === 'admin') {
      redirectPath = '/admin-dashboard';
    } else if (user?.role === 'doctor') {
      redirectPath = '/doctor-dashboard';
    } else if (user?.role === 'provider') {
      redirectPath = '/provider-dashboard';
    }
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
