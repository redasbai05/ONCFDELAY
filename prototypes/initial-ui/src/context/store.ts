import { create } from 'zustand';
import { User, Voyage, Reservation, Notification, ListeAttente, Train } from '../types';
import { storage } from '../services/storage';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
  currentUser: User | null;
  users: User[];
  trains: Train[];
  voyages: Voyage[];
  reservations: Reservation[];
  notifications: Notification[];
  listeAttente: ListeAttente[];
  
  // Auth
  login: (email: string, mdp: string) => User | null;
  register: (user: Omit<User, 'id' | 'role'>) => void;
  logout: () => void;
  
  // Voyageur actions
  reserverVoyage: (voyageId: string) => void;
  annulerReservation: (reservationId: string) => void;
  marquerNotificationLue: (notifId: string) => void;
  
  // Admin actions
  ajouterVoyage: (voyage: Omit<Voyage, 'id'>) => void;
  modifierVoyage: (id: string, updates: Partial<Voyage>) => void;
  supprimerVoyage: (id: string) => void;
  declarerRetard: (voyageId: string) => void;
}

export const useAppStore = create<AppState>((set, get) => {
  const data = storage.get();

  return {
    currentUser: null,
    users: data.users,
    trains: data.trains,
    voyages: data.voyages,
    reservations: data.reservations,
    notifications: data.notifications,
    listeAttente: data.listeAttente,

    login: (email, mdp) => {
      const { users } = get();
      const user = users.find(u => u.email === email && u.motDePasse === mdp) || null;
      if (user) set({ currentUser: user });
      return user;
    },

    register: (userData) => {
      const newUser: User = { ...userData, id: uuidv4(), role: 'voyageur' };
      set((state) => {
        const newUsers = [...state.users, newUser];
        storage.set({ ...storage.get(), users: newUsers });
        return { users: newUsers, currentUser: newUser };
      });
    },

    logout: () => set({ currentUser: null }),

    reserverVoyage: (voyageId) => {
      const { currentUser, voyages, reservations, listeAttente } = get();
      if (!currentUser) return;

      const voyageIndex = voyages.findIndex(v => v.id === voyageId);
      if (voyageIndex === -1) return;

      const voyage = voyages[voyageIndex];
      const newVoyages = [...voyages];
      const newReservations = [...reservations];
      const newListeAttente = [...listeAttente];

      if (voyage.placesDisponibles > 0) {
        // Confirmation directe
        newVoyages[voyageIndex] = { ...voyage, placesDisponibles: voyage.placesDisponibles - 1 };
        newReservations.push({
          id: uuidv4(),
          voyageId,
          userId: currentUser.id,
          dateReservation: new Date().toISOString(),
          statut: 'CONFIRMEE'
        });
      } else {
        // Liste d'attente
        newReservations.push({
          id: uuidv4(),
          voyageId,
          userId: currentUser.id,
          dateReservation: new Date().toISOString(),
          statut: 'EN_ATTENTE'
        });
        newListeAttente.push({
          id: uuidv4(),
          voyageId,
          userId: currentUser.id,
          dateDemande: new Date().toISOString()
        });
      }

      set({ voyages: newVoyages, reservations: newReservations, listeAttente: newListeAttente });
      storage.set({ ...storage.get(), voyages: newVoyages, reservations: newReservations, listeAttente: newListeAttente });
    },

    annulerReservation: (reservationId) => {
      const { reservations, voyages, listeAttente, notifications } = get();
      const resIndex = reservations.findIndex(r => r.id === reservationId);
      if (resIndex === -1) return;

      const res = reservations[resIndex];
      const newReservations = [...reservations];
      const newVoyages = [...voyages];
      let newListeAttente = [...listeAttente];
      const newNotifications = [...notifications];

      // Marquer comme annulée
      newReservations[resIndex] = { ...res, statut: 'ANNULEE' };

      const voyIndex = voyages.findIndex(v => v.id === res.voyageId);
      
      if (res.statut === 'CONFIRMEE' && voyIndex !== -1) {
        // Vérifier liste d'attente
        const waitingList = newListeAttente
          .filter(la => la.voyageId === res.voyageId)
          .sort((a, b) => new Date(a.dateDemande).getTime() - new Date(b.dateDemande).getTime());

        if (waitingList.length > 0) {
          // Promouvoir le premier
          const firstWaiting = waitingList[0];
          const waitingResIndex = newReservations.findIndex(r => r.userId === firstWaiting.userId && r.voyageId === res.voyageId && r.statut === 'EN_ATTENTE');
          
          if (waitingResIndex !== -1) {
            newReservations[waitingResIndex] = { ...newReservations[waitingResIndex], statut: 'CONFIRMEE' };
            newListeAttente = newListeAttente.filter(la => la.id !== firstWaiting.id);
            
            // Notifier
            newNotifications.push({
              id: uuidv4(),
              userId: firstWaiting.userId,
              titre: 'Place confirmée !',
              message: `Une place s'est libérée et votre réservation est maintenant confirmée.`,
              type: 'APPLICATION',
              lue: false,
              date: new Date().toISOString()
            });
          }
        } else {
          // Rendre la place dispo
          newVoyages[voyIndex] = { ...newVoyages[voyIndex], placesDisponibles: newVoyages[voyIndex].placesDisponibles + 1 };
        }
      } else if (res.statut === 'EN_ATTENTE') {
        newListeAttente = newListeAttente.filter(la => !(la.userId === res.userId && la.voyageId === res.voyageId));
      }

      set({ reservations: newReservations, voyages: newVoyages, listeAttente: newListeAttente, notifications: newNotifications });
      storage.set({ ...storage.get(), reservations: newReservations, voyages: newVoyages, listeAttente: newListeAttente, notifications: newNotifications });
    },

    marquerNotificationLue: (notifId) => {
      const { notifications } = get();
      const newNotifications = notifications.map(n => 
        n.id === notifId ? { ...n, lue: true } : n
      );
      set({ notifications: newNotifications });
      storage.set({ ...storage.get(), notifications: newNotifications });
    },

    ajouterVoyage: (voyage) => {
      const newVoyage = { ...voyage, id: uuidv4() };
      set((state) => {
        const newVoyages = [...state.voyages, newVoyage];
        storage.set({ ...storage.get(), voyages: newVoyages });
        return { voyages: newVoyages };
      });
    },

    modifierVoyage: (id, updates) => {
      set((state) => {
        const newVoyages = state.voyages.map(v => v.id === id ? { ...v, ...updates } : v);
        storage.set({ ...storage.get(), voyages: newVoyages });
        return { voyages: newVoyages };
      });
    },

    supprimerVoyage: (id) => {
      set((state) => {
        const newVoyages = state.voyages.filter(v => v.id !== id);
        storage.set({ ...storage.get(), voyages: newVoyages });
        return { voyages: newVoyages };
      });
    },

    declarerRetard: (voyageId) => {
      const { voyages, reservations, notifications } = get();
      const voyIndex = voyages.findIndex(v => v.id === voyageId);
      if (voyIndex === -1) return;

      const newVoyages = [...voyages];
      newVoyages[voyIndex] = { ...newVoyages[voyIndex], etat: 'EN_RETARD' };

      const newNotifications = [...notifications];
      const voyageursImpactes = reservations.filter(r => r.voyageId === voyageId && r.statut === 'CONFIRMEE').map(r => r.userId);

      // Unique user ids
      [...new Set(voyageursImpactes)].forEach(userId => {
        newNotifications.push({
          id: uuidv4(),
          userId,
          titre: 'Retard de train',
          message: `Votre train de ${newVoyages[voyIndex].gareDepart} vers ${newVoyages[voyIndex].gareArrivee} est en retard.`,
          type: 'APPLICATION',
          lue: false,
          date: new Date().toISOString()
        });
      });

      set({ voyages: newVoyages, notifications: newNotifications });
      storage.set({ ...storage.get(), voyages: newVoyages, notifications: newNotifications });
    }
  };
});
