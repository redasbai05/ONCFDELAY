import { User, Voyage, Train, Reservation, Notification, ListeAttente } from '../types';
import { ADMIN_USER, INITIAL_TRAINS, INITIAL_VOYAGES } from '../data/seed';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'oncf_delay_data';

interface AppData {
  users: User[];
  trains: Train[];
  voyages: Voyage[];
  reservations: Reservation[];
  notifications: Notification[];
  listeAttente: ListeAttente[];
}

const defaultData: AppData = {
  users: [ADMIN_USER],
  trains: INITIAL_TRAINS,
  voyages: INITIAL_VOYAGES,
  reservations: [],
  notifications: [],
  listeAttente: [],
};

export const loadData = (): AppData => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    saveData(defaultData);
    return defaultData;
  }
  return JSON.parse(data);
};

export const saveData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const storage = {
  get: () => loadData(),
  set: (data: AppData) => saveData(data),
  reset: () => {
    localStorage.removeItem(STORAGE_KEY);
    saveData(defaultData);
  }
};
