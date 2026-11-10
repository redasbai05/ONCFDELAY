export type Role = 'voyageur' | 'admin';

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  motDePasse: string;
  role: Role;
}

export type EtatTrain = 'A_L_HEURE' | 'EN_RETARD' | 'ANNULE';

export interface Train {
  id: string;
  numero: string;
  nom: string;
}

export interface Voyage {
  id: string;
  trainId: string;
  gareDepart: string;
  gareArrivee: string;
  heureDepart: string; // ISO string
  heureArrivee: string; // ISO string
  placesTotales: number;
  placesDisponibles: number;
  etat: EtatTrain;
  prix: number;
}

export type StatutReservation = 'CONFIRMEE' | 'ANNULEE' | 'EN_ATTENTE';

export interface Reservation {
  id: string;
  voyageId: string;
  userId: string;
  dateReservation: string; // ISO string
  statut: StatutReservation;
}

export interface ListeAttente {
  id: string;
  voyageId: string;
  userId: string;
  dateDemande: string; // ISO string
}

export type TypeNotification = 'SMS' | 'EMAIL' | 'APPLICATION';

export interface Notification {
  id: string;
  userId: string;
  titre: string;
  message: string;
  type: TypeNotification;
  lue: boolean;
  date: string; // ISO string
}
