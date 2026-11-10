import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function SeatGrid() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [voyage, setVoyage] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const vRes = await api.get(`/voyageur/voyages/${id}`);
        setVoyage(vRes.data);
        const sRes = await api.get(`/voyageur/voyages/${id}/places`);
        setSeats(Array.isArray(sRes.data) ? sRes.data : []);
      } catch {
        setMessage('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const isVoyageFull = seats.length > 0 && seats.every(s => !s.estLibre);

  const getStatus = (seat) => {
    if (!seat || seat.estLibre) return 'libre';
    return 'occupee';
  };

  const handleSeatClick = (seat) => {
    if (seat.estLibre) {
      setModal({ type: 'reserve', seat, message: `Confirmer la réservation du siège ${seat.numeroPlace} ?` });
    } else if (isVoyageFull) {
      reserveSeat(seat);
    }
  };

  const reserveSeat = async (seat) => {
    setProcessing(true);
    try {
      const res = await api.post('/voyageur/reservations', {
        voyageId: Number(id),
        placeId: seat.id,
      });
      if (res.data.statut === 'LISTE_ATTENTE') {
        setMessage(res.data.message || `Voyage complet — inscrit en position ${res.data.position}`);
      } else {
        setMessage('Réservation confirmée avec succès !');
      }
      setModal(null);
      const sRes = await api.get(`/voyageur/voyages/${id}/places`);
      setSeats(Array.isArray(sRes.data) ? sRes.data : []);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Une erreur est survenue');
    } finally {
      setProcessing(false);
    }
  };

  const confirmAction = async () => {
    await reserveSeat(modal.seat);
  };

  const rows = {};
  if (seats.length > 0) {
    seats.forEach(s => {
      const match = s.numeroPlace ? s.numeroPlace.match(/^(\d+)([A-D])$/) : null;
      const rowLabel = match ? match[1] : Math.ceil((s.id || 1) / 4);
      const colLabel = match ? match[2] : String.fromCharCode(65 + ((s.id - 1) % 4));
      if (!rows[rowLabel]) rows[rowLabel] = [];
      rows[rowLabel].push({ ...s, colLabel });
    });
  }

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div className="page-container">
      {message && (
        <div className={`alert ${message.includes('succès') ? 'alert-success' : 'alert-error'}`}>
          {message}
          <button className="alert-close" onClick={() => setMessage('')}>&times;</button>
        </div>
      )}

      <button className="btn btn-secondary mb-20" onClick={() => navigate(-1)}>← Retour</button>

      {voyage && (
        <div className="voyage-info card mb-20">
          <h2>Voyage : {voyage.train?.numeroTrain || 'N/A'}</h2>
          <p>{voyage.gareDepart} → {voyage.gareArrivee}</p>
          <p>Date : {voyage.dateDepart ? new Date(voyage.dateDepart).toLocaleDateString('fr-FR') : '-'} | Heure : {voyage.heureDepart || '-'}</p>
        </div>
      )}

      <div className="card">
        <h3 className="mb-20">Plan du train - Sélectionnez votre siège</h3>
        <div className="seat-grid">
          {Object.keys(rows).sort((a, b) => Number(a) - Number(b)).map(rowNum => (
            <div className="seat-row" key={rowNum}>
              <span className="seat-row-label">{rowNum}</span>
              {rows[rowNum].sort((a, b) => (a.colLabel || '').localeCompare(b.colLabel || '')).map(seat => {
                const status = getStatus(seat);
                return (
                  <div
                    key={seat.id}
                    className={`seat ${status}`}
                    title={`Siège ${seat.numeroPlace} - ${status === 'libre' ? 'Libre' : 'Occupée'}`}
                    onClick={() => handleSeatClick(seat)}
                  >
                    <span className="seat-label">{seat.numeroPlace}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="seat-legend">
          <div className="legend-item"><span className="legend-color libre"></span> Libre</div>
          <div className="legend-item"><span className="legend-color occupee"></span> Occupée</div>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Confirmer la réservation</h3>
            <p>{modal.message}</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setModal(null)} disabled={processing}>Annuler</button>
              <button className="btn btn-primary" onClick={confirmAction} disabled={processing}>
                {processing ? 'Traitement...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
