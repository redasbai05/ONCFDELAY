package com.oncf.service;

import com.oncf.model.*;
import com.oncf.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final PlaceRepository placeRepository;
    private final VoyageRepository voyageRepository;
    private final VoyageurRepository voyageurRepository;
    private final ListeAttenteRepository listeAttenteRepository;
    private final WaitingListService waitingListService;
    private final NotificationService notificationService;

    @Transactional
    public Map<String, Object> createReservation(Long voyageurId, Long voyageId, Long placeId) {
        Voyageur voyageur = voyageurRepository.findById(voyageurId)
                .orElseThrow(() -> new RuntimeException("Voyageur not found"));
        Voyage voyage = voyageRepository.findById(voyageId)
                .orElseThrow(() -> new RuntimeException("Voyage not found"));
        Place place = placeRepository.findById(placeId)
                .orElseThrow(() -> new RuntimeException("Place not found"));

        if (place.isEstLibre()) {
            Reservation reservation = Reservation.builder()
                    .dateReservation(LocalDateTime.now())
                    .statut("CONFIRMEE")
                    .voyageur(voyageur)
                    .voyage(voyage)
                    .place(place)
                    .build();
            place.setEstLibre(false);
            placeRepository.save(place);
            reservation = reservationRepository.save(reservation);

            // Subscribe to train delay notifications
            voyage.getTrain().addObserver(voyageur);

            return Map.of(
                    "reservation", reservation,
                    "statut", "CONFIRMEE",
                    "message", "Reservation confirmee pour la place " + place.getNumeroPlace()
            );
        }

        boolean hasFreeSeat = placeRepository.findFirstByVoyageIdAndEstLibreTrue(voyageId).isPresent();
        if (hasFreeSeat) {
            throw new RuntimeException("Cette place est occupee. Veuillez choisir une place libre.");
        }

        // Already in waiting list?
        var existingWL = listeAttenteRepository.findByVoyageIdAndVoyageurIdAndStatut(
                voyageId, voyageurId, ListeAttente.StatutAttente.EN_ATTENTE);
        if (existingWL.isPresent()) {
            ListeAttente e = existingWL.get();
            return Map.of(
                    "waitingListId", e.getId(),
                    "position", e.getPosition(),
                    "statut", "LISTE_ATTENTE",
                    "message", "Vous etes deja inscrit sur la liste d'attente (position " + e.getPosition() + ")."
            );
        }

        ListeAttente entry = waitingListService.addToWaitingList(voyageur, voyage);

        // Create an EN_ATTENTE reservation linked to this waiting list entry
        Reservation enAttente = Reservation.builder()
                .dateReservation(LocalDateTime.now())
                .statut("EN_ATTENTE")
                .voyageur(voyageur)
                .voyage(voyage)
                .place(null)
                .build();
        reservationRepository.save(enAttente);

        return Map.of(
                "waitingListId", entry.getId(),
                "position", entry.getPosition(),
                "statut", "LISTE_ATTENTE",
                "message", "Voyage complet. Vous etes inscrit sur la liste d'attente (position " + entry.getPosition() + ")."
        );
    }

    @Transactional
    public Map<String, Object> reserverOuAttente(Long voyageurId, Long voyageId) {
        Voyageur voyageur = voyageurRepository.findById(voyageurId)
                .orElseThrow(() -> new RuntimeException("Voyageur not found"));
        Voyage voyage = voyageRepository.findById(voyageId)
                .orElseThrow(() -> new RuntimeException("Voyage not found"));

        boolean hasFreeSeat = placeRepository.findFirstByVoyageIdAndEstLibreTrue(voyageId).isPresent();
        if (hasFreeSeat) {
            return Map.of("statut", "CHOISIR_PLACE", "voyageId", voyageId);
        }

        var existingWL = listeAttenteRepository.findByVoyageIdAndVoyageurIdAndStatut(
                voyageId, voyageurId, ListeAttente.StatutAttente.EN_ATTENTE);
        if (existingWL.isPresent()) {
            ListeAttente e = existingWL.get();
            return Map.of(
                    "statut", "LISTE_ATTENTE",
                    "waitingListId", e.getId(),
                    "position", e.getPosition(),
                    "message", "Vous êtes déjà inscrit sur la liste d'attente (position " + e.getPosition() + ")."
            );
        }

        ListeAttente entry = waitingListService.addToWaitingList(voyageur, voyage);

        Reservation enAttente = Reservation.builder()
                .dateReservation(LocalDateTime.now())
                .statut("EN_ATTENTE")
                .voyageur(voyageur)
                .voyage(voyage)
                .place(null)
                .build();
        reservationRepository.save(enAttente);

        // Subscribe to train delay notifications
        voyage.getTrain().addObserver(voyageur);

        return Map.of(
                "statut", "LISTE_ATTENTE",
                "waitingListId", entry.getId(),
                "position", entry.getPosition(),
                "message", "Voyage complet. Vous êtes inscrit sur la liste d'attente (position " + entry.getPosition() + ")."
        );
    }

    @Transactional
    public void cancelReservation(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        if ("EN_ATTENTE".equals(reservation.getStatut())) {
            reservation.setStatut("ANNULEE");
            reservationRepository.save(reservation);
            listeAttenteRepository.findByVoyageIdAndVoyageurIdAndStatut(
                    reservation.getVoyage().getId(),
                    reservation.getVoyageur().getId(),
                    ListeAttente.StatutAttente.EN_ATTENTE
            ).ifPresent(e -> {
                e.setStatut(ListeAttente.StatutAttente.ANNULE);
                listeAttenteRepository.save(e);
            });
            return;
        }

        reservation.setStatut("ANNULEE");
        reservationRepository.save(reservation);

        Place place = reservation.getPlace();
        place.setEstLibre(true);
        placeRepository.save(place);

        String msg = "Reservation annulee pour le voyage " + reservation.getVoyage().getGareDepart()
                + " -> " + reservation.getVoyage().getGareArrivee();
        notificationService.sendNotification(reservation.getVoyageur().getId(), msg, "ANNULATION");

        waitingListService.reassignFifo(reservation.getVoyage().getId());
    }

    public List<Reservation> getReservationsByVoyageur(Long voyageurId) {
        return reservationRepository.findByVoyageurId(voyageurId);
    }

    public List<Reservation> getReservationsByVoyage(Long voyageId) {
        return reservationRepository.findByVoyageId(voyageId);
    }
}
