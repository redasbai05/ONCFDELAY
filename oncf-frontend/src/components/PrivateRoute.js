import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children, requireAgent = false }) {
  const { isAuthenticated, isAgent, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAgent && !isAgent) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
