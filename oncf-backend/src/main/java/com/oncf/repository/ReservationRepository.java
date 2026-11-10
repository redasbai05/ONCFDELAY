package com.oncf.repository;

import com.oncf.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByVoyageurId(Long voyageurId);
    List<Reservation> findByVoyageId(Long voyageId);
    Optional<Reservation> findByVoyageIdAndPlaceIdAndStatut(Long voyageId, Long placeId, String statut);
    Optional<Reservation> findByVoyageIdAndVoyageurIdAndStatut(Long voyageId, Long voyageurId, String statut);
}
