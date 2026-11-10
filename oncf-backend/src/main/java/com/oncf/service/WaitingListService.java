package com.oncf.service;

import com.oncf.model.*;
import com.oncf.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WaitingListService {

    private final ListeAttenteRepository listeAttenteRepository;
    private final ReservationRepository reservationRepository;
    private final PlaceRepository placeRepository;
    private final NotificationService notificationService;

    @Transactional
    public ListeAttente addToWaitingList(Voyageur voyageur, Voyage voyage) {
        long position = listeAttenteRepository.countByVoyageIdAndStatut(voyage.getId(), ListeAttente.StatutAttente.EN_ATTENTE) + 1;
        ListeAttente entry = ListeAttente.builder()
                .requestTime(LocalDateTime.now())
                .position((int) position)
                .statut(ListeAttente.StatutAttente.EN_ATTENTE)
                .voyageur(voyageur)
                .voyage(voyage)
                .build();
        return listeAttenteRepository.save(entry);
    }

    @Transactional
    public void reassignFifo(Long voyageId) {
        var opt = listeAttenteRepository.findTopByVoyageIdAndStatutOrderByRequestTimeAsc(voyageId, ListeAttente.StatutAttente.EN_ATTENTE);
        if (opt.isEmpty()) return;

        ListeAttente entry = opt.get();

        Place freePlace = placeRepository.findFirstByVoyageIdAndEstLibreTrue(voyageId)
                .orElse(null);
        if (freePlace == null) return;

        freePlace.setEstLibre(false);
        placeRepository.save(freePlace);

        entry.setStatut(ListeAttente.StatutAttente.ATTRIBUE);
        listeAttenteRepository.save(entry);

        // Cancel the old EN_ATTENTE reservation if it exists
        reservationRepository.findByVoyageIdAndVoyageurIdAndStatut(
                voyageId, entry.getVoyageur().getId(), "EN_ATTENTE"
        ).ifPresent(oldRes -> {
            oldRes.setStatut("ANNULEE");
            reservationRepository.save(oldRes);
        });

        Reservation reservation = Reservation.builder()
                .dateReservation(LocalDateTime.now())
                .statut("CONFIRMEE")
                .voyageur(entry.getVoyageur())
                .voyage(entry.getVoyage())
                .place(freePlace)
                .build();
        reservationRepository.save(reservation);

        String msg = "Une place s'est liberee! Votre reservation pour le voyage "
                + entry.getVoyage().getGareDepart() + " -> " + entry.getVoyage().getGareArrivee()
                + " est maintenant confirmee (place " + freePlace.getNumeroPlace() + ").";
        notificationService.sendNotification(entry.getVoyageur().getId(), msg, "ATTRIBUTION");
    }

    @Transactional
    public void cancelWaitingListEntry(Long listeAttenteId) {
        listeAttenteRepository.findById(listeAttenteId).ifPresent(e -> {
            e.setStatut(ListeAttente.StatutAttente.ANNULE);
            listeAttenteRepository.save(e);
        });
    }

    public List<ListeAttente> getWaitingListByVoyageur(Long voyageurId) {
        return listeAttenteRepository.findByVoyageurIdOrderByRequestTimeAsc(voyageurId);
    }
}
