package com.oncf.controller;

import com.oncf.model.*;
import com.oncf.repository.*;
import com.oncf.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/voyageur")
@RequiredArgsConstructor
public class VoyageurController {

    private final VoyageService voyageService;
    private final ReservationService reservationService;
    private final WaitingListService waitingListService;
    private final NotificationService notificationService;
    private final VoyageurRepository voyageurRepository;

    @GetMapping("/voyages")
    public ResponseEntity<?> getAllVoyages() {
        return ResponseEntity.ok(voyageService.getAllVoyages());
    }

    @GetMapping("/voyages/{id}")
    public ResponseEntity<?> getVoyageById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(voyageService.getVoyageById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/voyages/{id}/places")
    public ResponseEntity<?> getPlacesForVoyage(@PathVariable Long id) {
        try {
            Voyage voyage = voyageService.getVoyageById(id);
            return ResponseEntity.ok(voyage.getPlaces());
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/voyages/{id}/reserver")
    public ResponseEntity<?> reserverVoyage(Authentication auth, @PathVariable Long id) {
        Long voyageurId = getVoyageurId(auth);
        return ResponseEntity.ok(reservationService.reserverOuAttente(voyageurId, id));
    }

    @PostMapping("/reservations")
    public ResponseEntity<?> createReservation(Authentication auth, @RequestBody Map<String, Long> body) {
        Long voyageurId = getVoyageurId(auth);
        Long voyageId = body.get("voyageId");
        Long placeId = body.get("placeId");
        try {
            Map<String, Object> result = reservationService.createReservation(voyageurId, voyageId, placeId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/reservations")
    public ResponseEntity<?> getMyReservations(Authentication auth) {
        Long voyageurId = getVoyageurId(auth);
        return ResponseEntity.ok(reservationService.getReservationsByVoyageur(voyageurId));
    }

    @DeleteMapping("/reservations/{id}")
    public ResponseEntity<?> cancelReservation(@PathVariable Long id) {
        reservationService.cancelReservation(id);
        return ResponseEntity.ok(Map.of("message", "Reservation cancelled"));
    }

    @GetMapping("/waiting-list")
    public ResponseEntity<?> getMyWaitingList(Authentication auth) {
        Long voyageurId = getVoyageurId(auth);
        return ResponseEntity.ok(waitingListService.getWaitingListByVoyageur(voyageurId));
    }

    @DeleteMapping("/waiting-list/{id}")
    public ResponseEntity<?> cancelWaitingListEntry(@PathVariable Long id) {
        waitingListService.cancelWaitingListEntry(id);
        return ResponseEntity.ok(Map.of("message", "Desinscrit de la liste d'attente"));
    }

    @GetMapping("/notifications")
    public ResponseEntity<?> getNotifications(Authentication auth) {
        Long voyageurId = getVoyageurId(auth);
        return ResponseEntity.ok(notificationService.getNotificationsByVoyageur(voyageurId));
    }

    @GetMapping("/notifications/unread-count")
    public ResponseEntity<?> getUnreadCount(Authentication auth) {
        Long voyageurId = getVoyageurId(auth);
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(voyageurId)));
    }

    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
    }

    private Long getVoyageurId(Authentication auth) {
        String email = auth.getName();
        return voyageurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Voyageur not found"))
                .getId();
    }
}
