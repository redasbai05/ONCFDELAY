import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function AgentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ voyages: 0, trains: 0, reservations: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resVoyages, resTrains] = await Promise.all([
          api.get('/agent/voyages').catch(() => ({ data: [] })),
          api.get('/agent/trains').catch(() => ({ data: [] })),
        ]);
        const voyages = Array.isArray(resVoyages.data) ? resVoyages.data : [];
        const totalReservations = voyages.reduce((sum, v) => {
          if (!v.places) return sum;
          return sum + v.places.filter(p => !p.estLibre).length;
        }, 0);
        setStats({
          voyages: voyages.length,
          trains: Array.isArray(resTrains.data) ? resTrains.data.length : 0,
          reservations: totalReservations,
        });
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Tableau de bord Agent</h1>
        <p>Bonjour, {user?.prenom} {user?.nom}</p>
      </div>

      <div className="dashboard-grid">
        <div className="stats-card">
          <div className="stats-icon">🚄</div>
          <div className="stats-info">
            <h3>{stats.voyages}</h3>
            <p>Voyages</p>
          </div>
        </div>
        <div className="stats-card">
          <div className="stats-icon">🚆</div>
          <div className="stats-info">
            <h3>{stats.trains}</h3>
            <p>Trains actifs</p>
          </div>
        </div>
        <div className="stats-card">
          <div className="stats-icon">🎫</div>
          <div className="stats-info">
            <h3>{stats.reservations}</h3>
            <p>Réservations totales</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Actions rapides</h2>
        <div className="action-cards">
          <Link to="/agent/voyages" className="action-card">
            <span className="action-icon">➕</span>
            <span>Créer un voyage</span>
          </Link>
          <Link to="/agent/voyages" className="action-card">
            <span className="action-icon">⏰</span>
            <span>Déclarer un retard</span>
          </Link>
          <Link to="/agent/voyages" className="action-card">
            <span className="action-icon">✏️</span>
            <span>Gérer les voyages</span>
          </Link>
        </div>
      </div>

      <div className="section">
        <h2>Résumé</h2>
        <div className="card">
          <p>Bienvenue sur l'interface agent d'ONCF Delay.</p>
          <p>Utilisez le menu de navigation ou les actions rapides pour gérer les voyages, déclarer des retards et superviser les opérations.</p>
        </div>
      </div>
    </div>
  );
}
