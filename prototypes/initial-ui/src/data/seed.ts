import { User, Voyage, Train } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const ADMIN_USER: User = {
  id: 'admin-1',
  nom: 'Admin',
  prenom: 'Super',
  email: 'admin@oncf.ma',
  telephone: '0600000000',
  motDePasse: 'admin123',
  role: 'admin'
};

export const INITIAL_TRAINS: Train[] = [
  { id: 't1', numero: 'ALB-1', nom: 'Al Boraq' },
  { id: 't2', numero: 'ALB-2', nom: 'Al Boraq' },
  { id: 't3', numero: 'ATL-1', nom: 'Al Atlas' }
];

export const INITIAL_VOYAGES: Voyage[] = [
  {
    id: 'v1',
    trainId: 't1',
    gareDepart: 'Tanger Ville',
    gareArrivee: 'Casablanca Voyageurs',
    heureDepart: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
    heureArrivee: new Date(new Date().setHours(10, 10, 0, 0)).toISOString(),
    placesTotales: 100,
    placesDisponibles: 100,
    etat: 'A_L_HEURE',
    prix: 149
  },
  {
    id: 'v2',
    trainId: 't2',
    gareDepart: 'Casablanca Voyageurs',
    gareArrivee: 'Tanger Ville',
    heureDepart: new Date(new Date().setHours(12, 0, 0, 0)).toISOString(),
    heureArrivee: new Date(new Date().setHours(14, 10, 0, 0)).toISOString(),
    placesTotales: 50,
    placesDisponibles: 0, // Complet pour tester liste d'attente
    etat: 'A_L_HEURE',
    prix: 149
  },
  {
    id: 'v3',
    trainId: 't3',
    gareDepart: 'Rabat Agdal',
    gareArrivee: 'Marrakech',
    heureDepart: new Date(new Date().setHours(9, 30, 0, 0)).toISOString(),
    heureArrivee: new Date(new Date().setHours(13, 0, 0, 0)).toISOString(),
    placesTotales: 200,
    placesDisponibles: 200,
    etat: 'EN_RETARD',
    prix: 120
  }
];
