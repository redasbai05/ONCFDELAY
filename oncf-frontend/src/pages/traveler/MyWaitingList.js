import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function MyWaitingList() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await api.get('/voyageur/waiting-list');
      setEntries(Array.isArray(res.data) ? res.data : []);
    } catch {
      setMessage('Erreur lors du chargement de la liste d\'attente');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      await api.delete(`/voyageur/waiting-list/${cancelId}`);
      setMessage('Desinscrit de la liste d\'attente');
      setCancelId(null);
      fetchEntries();
    } catch {
      setMessage('Erreur lors de la désinscription');
    }
  };

  const getBadgeClass = (statut) => {
    switch (statut) {
      case 'ATTRIBUE': return 'badge-success';
      case 'ANNULE': return 'badge-danger';
      case 'EN_ATTENTE': return 'badge-info';
      default: return 'badge-info';
    }
  };

  const formatPosition = (pos) => {
    if (pos === 1) return '1er';
    return `${pos}ème`;
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Ma Liste d'Attente</h1>
        <p>Suivez votre position dans la file d'attente par voyage</p>
      </div>

      {message && (
        <div className={`alert ${message.includes('Erreur') ? 'alert-error' : 'alert-success'}`}>
          {message}
          <button className="alert-close" onClick={() => setMessage('')}>&times;</button>
        </div>
      )}

      <div className="card">
        {entries.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <p>Vous n'êtes sur aucune liste d'attente</p>
            <p>Lorsqu'un voyage est complet, vous êtes automatiquement inscrit sur la liste d'attente.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Position</th>
                <th>Train</th>
                <th>Gares</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, idx) => (
                <tr key={e.id}>
                  <td>{formatPosition(e.position || idx + 1)}</td>
                  <td>{e.voyage?.train?.numeroTrain || 'N/A'}</td>
                  <td>{e.voyage?.gareDepart || '-'} → {e.voyage?.gareArrivee || '-'}</td>
                  <td>{e.requestTime ? new Date(e.requestTime).toLocaleDateString('fr-FR') : '-'}</td>
                  <td><span className={`badge ${getBadgeClass(e.statut)}`}>{e.statut?.replace(/_/g, ' ') || 'EN ATTENTE'}</span></td>
                  <td>
                    {e.statut === 'ATTRIBUE' && (
                      <Link to="/reservations" className="btn btn-success btn-sm">Voir ma réservation</Link>
                    )}
                    {e.statut === 'EN_ATTENTE' && (
                      <button className="btn btn-danger btn-sm" onClick={() => setCancelId(e.id)}>Quitter la liste</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {cancelId && (
        <div className="modal-overlay" onClick={() => setCancelId(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Confirmer</h3>
            <p>Êtes-vous sûr de vouloir quitter la liste d'attente ?</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setCancelId(null)}>Non</button>
              <button className="btn btn-danger" onClick={handleCancel}>Oui, quitter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
