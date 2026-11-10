import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    telephone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const { nom, prenom, email, password, telephone } = form;
    if (!nom || !prenom || !email || !password) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setLoading(true);
    try {
      await register(nom, prenom, email, password, telephone);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-logo">🚄</span>
          <h1>ONCF Delay</h1>
          <p>Créez votre compte</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nom</label>
              <input type="text" name="nom" className="form-control" placeholder="Nom" value={form.nom} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Prénom</label>
              <input type="text" name="prenom" className="form-control" placeholder="Prénom" value={form.prenom} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" name="email" className="form-control" placeholder="votre@email.com" value={form.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input type="password" name="password" className="form-control" placeholder="Votre mot de passe" value={form.password} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Téléphone</label>
            <input type="tel" name="telephone" className="form-control" placeholder="+212 6XX XXX XXX" value={form.telephone} onChange={handleChange} />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Création...' : 'Créer un Compte'}
          </button>
        </form>
        <p className="auth-footer">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
