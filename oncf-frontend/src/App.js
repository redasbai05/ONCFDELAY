import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import TravelerDashboard from './pages/traveler/TravelerDashboard';
import SeatGrid from './pages/traveler/SeatGrid';
import MyReservations from './pages/traveler/MyReservations';
import MyWaitingList from './pages/traveler/MyWaitingList';
import Notifications from './pages/traveler/Notifications';
import AgentDashboard from './pages/agent/AgentDashboard';
import ManageVoyages from './pages/agent/ManageVoyages';
import { useAuth } from './context/AuthContext';
import './styles/App.css';

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated && <Navbar />}
      <main className={isAuthenticated ? 'main-content' : ''}>
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />
          <Route path="/dashboard" element={<PrivateRoute><TravelerDashboard /></PrivateRoute>} />
          <Route path="/seat-grid/:id" element={<PrivateRoute><SeatGrid /></PrivateRoute>} />
          <Route path="/reservations" element={<PrivateRoute><MyReservations /></PrivateRoute>} />
          <Route path="/waiting-list" element={<PrivateRoute><MyWaitingList /></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
          <Route path="/dashboard/agent" element={<PrivateRoute requireAgent><AgentDashboard /></PrivateRoute>} />
          <Route path="/agent/voyages" element={<PrivateRoute requireAgent><ManageVoyages /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
