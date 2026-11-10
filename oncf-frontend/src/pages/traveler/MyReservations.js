import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmCancel, setConfirmCancel] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const res = await api.get('/voyageur/reservations');
      setReservations(Array.isArray(res.data) ? res.data : []);
    } catch {
      setMessage('Erreur lors du chargement des réservations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      await api.delete(`/voyageur/reservations/${confirmCancel}`);
      setMessage('Réservation annulée avec succès');
      setConfirmCancel(null);
      fetchReservations();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur lors de l\'annulation');
    }
  };

  const getBadgeClass = (statut) => {
    switch (statut) {
      case 'CONFIRMEE': return 'badge-success';
      case 'ANNULEE': return 'badge-danger';
      case 'EN_ATTENTE': return 'badge-warning';
      default: return 'badge-info';
    }
  };

  const getStatutLabel = (statut) => {
    switch (statut) {
      case 'CONFIRMEE': return 'Confirmée';
      case 'ANNULEE': return 'Annulée';
      case 'EN_ATTENTE': return 'En attente';
      default: return statut;
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Mes Réservations</h1>
        <p>Gérez vos réservations de voyage</p>
      </div>

      {message && (
        <div className={`alert ${message.includes('succès') ? 'alert-success' : 'alert-error'}`}>
          {message}
          <button className="alert-close" onClick={() => setMessage('')}>&times;</button>
        </div>
      )}

      <div className="card">
        {reservations.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🎫</span>
            <p>Aucune réservation pour le moment</p>
            <p>Parcourez les voyages disponibles et réservez votre siège.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Train</th>
                <th>Gares</th>
                <th>Date</th>
                <th>Heure</th>
                <th>Siège</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(r => (
                <tr key={r.id}>
                  <td>{r.voyage?.train?.numeroTrain || 'N/A'}</td>
                  <td>{r.voyage?.gareDepart || '-'} → {r.voyage?.gareArrivee || '-'}</td>
                  <td>{r.voyage?.dateDepart ? new Date(r.voyage.dateDepart).toLocaleDateString('fr-FR') : r.dateReservation ? new Date(r.dateReservation).toLocaleDateString('fr-FR') : '-'}</td>
                  <td>{r.voyage?.heureDepart || '-'}</td>
                  <td>{r.place?.numeroPlace || '-'}</td>
                  <td><span className={`badge ${getBadgeClass(r.statut)}`}>{getStatutLabel(r.statut)}</span></td>
                  <td>
                    {(r.statut === 'CONFIRMEE' || r.statut === 'EN_ATTENTE') && (
                      <button className="btn btn-danger btn-sm" onClick={() => setConfirmCancel(r.id)}>Annuler</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {confirmCancel && (
        <div className="modal-overlay" onClick={() => setConfirmCancel(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Confirmer l'annulation</h3>
            <p>Êtes-vous sûr de vouloir annuler cette réservation ?</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmCancel(null)}>Non</button>
              <button className="btn btn-danger" onClick={handleCancel}>Oui, annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
