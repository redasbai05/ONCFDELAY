import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function ManageVoyages() {
  const [voyages, setVoyages] = useState([]);
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [modal, setModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [delayModal, setDelayModal] = useState(null);
  const [form, setForm] = useState({
    trainId: '',
    numeroTrain: '',
    gareDepart: '',
    gareArrivee: '',
    dateDepart: '',
    heureDepart: '',
    heureArrivee: '',
    capacite: 120,
  });
  const [delayForm, setDelayForm] = useState({ minutes: 5, raison: '' });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vRes, tRes] = await Promise.all([
        api.get('/agent/voyages'),
        api.get('/agent/trains').catch(() => ({ data: [] })),
      ]);
      setVoyages(Array.isArray(vRes.data) ? vRes.data : []);
      setTrains(Array.isArray(tRes.data) ? tRes.data : []);
    } catch {
      setMessage('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setForm({ trainId: '', numeroTrain: '', gareDepart: '', gareArrivee: '', dateDepart: '', heureDepart: '', heureArrivee: '', capacite: 120 });
    setModal('create');
  };

  const openEditModal = (v) => {
    setForm({
      trainId: v.train?.id || '',
      numeroTrain: v.train?.numeroTrain || '',
      gareDepart: v.gareDepart || '',
      gareArrivee: v.gareArrivee || '',
      dateDepart: v.dateDepart ? v.dateDepart.slice(0, 10) : '',
      heureDepart: v.heureDepart || '',
      heureArrivee: v.heureArrivee || '',
      capacite: v.capacite || v.train?.capacite || 120,
    });
    setModal({ type: 'edit', id: v.id });
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      if (modal === 'create') {
        await api.post('/agent/voyages', form);
        setMessage('Voyage créé avec succès');
      } else {
        await api.put(`/agent/voyages/${modal.id}`, form);
        setMessage('Voyage modifié avec succès');
      }
      setModal(null);
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/agent/voyages/${deleteConfirm}`);
      setMessage('Voyage supprimé avec succès');
      setDeleteConfirm(null);
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const openDelayModal = (v) => {
    setDelayForm({ minutes: v.minutesRetard || 5, raison: '' });
    setDelayModal(v);
  };

  const handleDelaySubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      await api.post(`/agent/voyages/${delayModal.id}/delay`, { minutesRetard: delayForm.minutes, raison: delayForm.raison });
      setMessage('Retard déclaré avec succès');
      setDelayModal(null);
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur lors de la déclaration du retard');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gestion des Voyages</h1>
        <button className="btn btn-primary" onClick={openCreateModal}>+ Ajouter un voyage</button>
      </div>

      {message && (
        <div className={`alert ${message.includes('succès') || message.includes('Retard') ? 'alert-success' : 'alert-error'}`}>
          {message}
          <button className="alert-close" onClick={() => setMessage('')}>&times;</button>
        </div>
      )}

      <div className="card">
        {voyages.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🚄</span>
            <p>Aucun voyage trouvé</p>
            <p>Créez un nouveau voyage pour commencer.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Train</th>
                <th>Gares</th>
                <th>Date</th>
                <th>Départ</th>
                <th>Arrivée</th>
                <th>Retard</th>
                <th>Capacité</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {voyages.map(v => (
                <tr key={v.id}>
                  <td>{v.id}</td>
                  <td>{v.train?.numeroTrain || v.trainId || 'N/A'}</td>
                  <td>{v.gareDepart} → {v.gareArrivee}</td>
                  <td>{v.dateDepart ? new Date(v.dateDepart).toLocaleDateString('fr-FR') : '-'}</td>
                  <td>{v.heureDepart || '-'}</td>
                  <td>{v.heureArrivee || '-'}</td>
                  <td>
                    {v.minutesRetard > 0 ? (
                      <span className="badge badge-danger">{v.minutesRetard} min</span>
                    ) : (
                      <span className="badge badge-success">0</span>
                    )}
                  </td>
                  <td>{v.capacite || '-'}</td>
                  <td className="actions-cell">
                    <button className="btn btn-sm btn-secondary" onClick={() => openEditModal(v)} title="Modifier">✏️</button>
                    <button className="btn btn-sm btn-danger" onClick={() => setDeleteConfirm(v.id)} title="Supprimer">🗑️</button>
                    <button className="btn btn-sm btn-warning" onClick={() => openDelayModal(v)} title="Retard">⏰</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(modal === 'create' || modal?.type === 'edit') && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{modal === 'create' ? 'Ajouter un voyage' : 'Modifier le voyage'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Train existant (optionnel)</label>
                <select name="trainId" className="form-control" value={form.trainId} onChange={handleFormChange}>
                  <option value="">Créer un nouveau train</option>
                  {trains.map(t => (
                    <option key={t.id} value={t.id}>{t.numeroTrain || t.id}</option>
                  ))}
                </select>
              </div>
              {!form.trainId && (
                <div className="form-group">
                  <label className="form-label">Nouveau train - Numéro</label>
                  <input type="text" name="numeroTrain" className="form-control" value={form.numeroTrain} onChange={handleFormChange} placeholder="Ex: T123" />
                </div>
              )}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Gare départ</label>
                  <input type="text" name="gareDepart" className="form-control" value={form.gareDepart} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Gare arrivée</label>
                  <input type="text" name="gareArrivee" className="form-control" value={form.gareArrivee} onChange={handleFormChange} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Date départ</label>
                <input type="date" name="dateDepart" className="form-control" value={form.dateDepart} onChange={handleFormChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Heure départ</label>
                  <input type="time" name="heureDepart" className="form-control" value={form.heureDepart} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Heure arrivée</label>
                  <input type="time" name="heureArrivee" className="form-control" value={form.heureArrivee} onChange={handleFormChange} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Capacité</label>
                <input type="number" name="capacite" className="form-control" value={form.capacite} onChange={handleFormChange} min="1" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={processing}>
                  {processing ? 'Sauvegarde...' : modal === 'create' ? 'Créer' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Confirmer la suppression</h3>
            <p>Êtes-vous sûr de vouloir supprimer ce voyage ? Cette action est irréversible.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Annuler</button>
              <button className="btn btn-danger" onClick={handleDelete}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {delayModal && (
        <div className="modal-overlay" onClick={() => setDelayModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Déclarer un retard</h3>
            <p>Voyage : {delayModal.train?.numeroTrain || delayModal.trainId} - {delayModal.gareDepart} → {delayModal.gareArrivee}</p>
            <form onSubmit={handleDelaySubmit}>
              <div className="form-group">
                <label className="form-label">Minutes de retard</label>
                <input type="number" name="minutes" className="form-control" value={delayForm.minutes} onChange={e => setDelayForm({ ...delayForm, minutes: parseInt(e.target.value) || 0 })} min="1" required />
              </div>
              <div className="form-group">
                <label className="form-label">Raison du retard</label>
                <textarea name="raison" className="form-control" value={delayForm.raison} onChange={e => setDelayForm({ ...delayForm, raison: e.target.value })} rows="3" placeholder="Motif du retard..." />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setDelayModal(null)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={processing}>
                  {processing ? 'Traitement...' : 'Déclarer le retard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
