import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function TravelerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ reservations: 0, waitingList: 0, notifications: 0 });
  const [voyages, setVoyages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resVoyages, resReservations, resWaiting, resNotifs] = await Promise.all([
        api.get('/voyageur/voyages').catch(() => ({ data: [] })),
        api.get('/voyageur/reservations').catch(() => ({ data: [] })),
        api.get('/voyageur/waiting-list').catch(() => ({ data: [] })),
        api.get('/voyageur/notifications').catch(() => ({ data: [] })),
      ]);
      setVoyages(Array.isArray(resVoyages.data) ? resVoyages.data : []);
      setStats({
        reservations: Array.isArray(resReservations.data) ? resReservations.data.length : 0,
        waitingList: Array.isArray(resWaiting.data) ? resWaiting.data.length : 0,
        notifications: Array.isArray(resNotifs.data) ? resNotifs.data.filter(n => !n.lu).length : 0,
      });
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleReserver = async (voyageId) => {
    try {
      const res = await api.post(`/voyageur/voyages/${voyageId}/reserver`);
      if (res.data.statut === 'CHOISIR_PLACE') {
        navigate(`/seat-grid/${voyageId}`);
      } else if (res.data.statut === 'LISTE_ATTENTE') {
        setMessage(res.data.message);
        fetchData();
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Une erreur est survenue');
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Bonjour, {user?.prenom} {user?.nom}</h1>
        <p>Bienvenue sur votre tableau de bord</p>
      </div>

      <div className="dashboard-grid">
        <div className="stats-card">
          <div className="stats-icon">🎫</div>
          <div className="stats-info">
            <h3>{stats.reservations}</h3>
            <p>Réservations</p>
          </div>
        </div>
        <div className="stats-card">
          <div className="stats-icon">📋</div>
          <div className="stats-info">
            <h3>{stats.waitingList}</h3>
            <p>Liste d'attente</p>
          </div>
        </div>
        <div className="stats-card">
          <div className="stats-icon">🔔</div>
          <div className="stats-info">
            <h3>{stats.notifications}</h3>
            <p>Notifications non lues</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Actions rapides</h2>
        <div className="action-cards">
          <Link to="/reservations" className="action-card">
            <span className="action-icon">🎫</span>
            <span>Voir mes réservations</span>
          </Link>
          <Link to="/waiting-list" className="action-card">
            <span className="action-icon">📋</span>
            <span>Voir ma liste d'attente</span>
          </Link>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.includes('complet') ? 'alert-info' : 'alert-success'}`}>
          {message}
          <button className="alert-close" onClick={() => setMessage('')}>&times;</button>
        </div>
      )}

      <div className="section" id="voyages-section">
        <h2>Voyages disponibles</h2>
        <div className="card">
          {voyages.length === 0 ? (
            <p className="empty-state">Aucun voyage disponible pour le moment</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Train</th>
                  <th>Gares</th>
                  <th>Date</th>
                  <th>Heure</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {voyages.map(v => (
                  <tr key={v.id}>
                    <td>{v.train?.numeroTrain || v.trainId || 'N/A'}</td>
                    <td>{v.gareDepart} → {v.gareArrivee}</td>
                    <td>{v.dateDepart ? new Date(v.dateDepart).toLocaleDateString('fr-FR') : '-'}</td>
                    <td>{v.heureDepart || '-'}</td>
                    <td>
                      <span className={`badge ${v.minutesRetard > 0 ? 'badge-danger' : 'badge-success'}`}>
                        {v.minutesRetard > 0 ? `Retard ${v.minutesRetard}min` : 'À l\'heure'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => handleReserver(v.id)}>Réserver</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
