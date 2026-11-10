import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchNotifications();
    autoMarkAllRead();
  }, []);

  const autoMarkAllRead = async () => {
    try {
      const res = await api.get('/voyageur/notifications');
      const unread = (Array.isArray(res.data) ? res.data : []).filter(n => !n.lu);
      await Promise.all(unread.map(n => api.put(`/voyageur/notifications/${n.id}/read`)));
    } catch {
      // silent — auto-mark on page visit
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/voyageur/notifications');
      const sorted = (Array.isArray(res.data) ? res.data : []).sort((a, b) => new Date(b.dateEnvoi || b.date) - new Date(a.dateEnvoi || a.date));
      setNotifications(sorted);
    } catch {
      setMessage('Erreur lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      const unread = notifications.filter(n => !n.lu);
      await Promise.all(unread.map(n => api.put(`/voyageur/notifications/${n.id}/read`)));
      setMessage('Toutes les notifications marquées comme lues');
      fetchNotifications();
    } catch {
      setMessage('Erreur lors de la mise à jour');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'RETARD': return '⏰';
      case 'ATTRIBUTION': return '✅';
      case 'ANNULATION': return '❌';
      default: return '🔔';
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Notifications</h1>
        <div className="page-header-actions">
          {notifications.some(n => !n.lu) && (
            <button className="btn btn-secondary" onClick={markAllRead}>Marquer tout comme lu</button>
          )}
        </div>
      </div>

      {message && (
        <div className={`alert ${message.includes('Erreur') ? 'alert-error' : 'alert-success'}`}>
          {message}
          <button className="alert-close" onClick={() => setMessage('')}>&times;</button>
        </div>
      )}

      <div className="card">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🔔</span>
            <p>Aucune notification</p>
            <p>Vous serez notifié en cas de retard, d'attribution ou d'annulation.</p>
          </div>
        ) : (
          <div className="notif-list">
            {notifications.map(n => (
              <div key={n.id} className={`notif-item ${!n.lu ? 'unread' : ''}`}>
                <span className="notif-item-icon">{getIcon(n.type)}</span>
                <div className="notif-item-content">
                  <p className="notif-item-message">{n.message}</p>
                  <span className="notif-item-date">
                    {n.dateEnvoi ? new Date(n.dateEnvoi).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                {!n.lu && <span className="notif-unread-dot"></span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
