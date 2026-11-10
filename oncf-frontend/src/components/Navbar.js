import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Navbar() {
  const { user, logout, isAgent } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  const fetchNotifs = async () => {
    try {
      const res = await api.get('/voyageur/notifications');
      setNotifications(res.data.slice(0, 5));
      setUnreadCount(res.data.filter(n => !n.lu).length);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    if (!user || isAgent) return;
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, [user, isAgent]);

  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to={isAgent ? '/dashboard/agent' : '/dashboard'} className="navbar-brand">
          <span className="navbar-logo">🚄</span>
          <span className="navbar-title">ONCF Delay</span>
        </Link>
      </div>

      <div className="navbar-center">
        {isAgent ? (
          <>
            <Link to="/dashboard/agent" className="nav-link">Tableau de bord</Link>
            <Link to="/agent/voyages" className="nav-link">Gestion des Voyages</Link>
          </>
        ) : (
          <>
            <Link to="/dashboard" className="nav-link">Tableau de bord</Link>
            <Link to="/reservations" className="nav-link">Mes Réservations</Link>
            <Link to="/waiting-list" className="nav-link">Liste d'Attente</Link>
            <Link to="/notifications" className="nav-link">Notifications</Link>
          </>
        )}
      </div>

      <div className="navbar-right">
        {!isAgent && (
          <div className="notif-bell" ref={notifRef}>
            <button className="notif-btn" onClick={() => { setShowNotifications(!showNotifications); fetchNotifs(); }}>
              🔔
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </button>
            {showNotifications && (
              <div className="notif-dropdown">
                {notifications.length === 0 ? (
                  <div className="notif-dropdown-item">Aucune notification</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`notif-dropdown-item ${!n.lu ? 'unread' : ''}`}>
                      <span className="notif-icon">
                        {n.type === 'RETARD' ? '⏰' : n.type === 'ATTRIBUTION' ? '✅' : n.type === 'ANNULATION' ? '❌' : '🔔'}
                      </span>
                      <span className="notif-msg">{n.message}</span>
                    </div>
                  ))
                )}
                <Link to="/notifications" className="notif-dropdown-link" onClick={() => setShowNotifications(false)}>Voir tout</Link>
              </div>
            )}
          </div>
        )}
        <span className="navbar-user">{user?.prenom} {user?.nom}</span>
        <button className="btn-logout" onClick={handleLogout}>Déconnexion</button>
      </div>
    </nav>
  );
}
