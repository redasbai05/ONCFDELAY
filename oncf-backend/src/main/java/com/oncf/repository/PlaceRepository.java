package com.oncf.repository;

import com.oncf.model.Place;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PlaceRepository extends JpaRepository<Place, Long> {
    List<Place> findByVoyageId(Long voyageId);
    Optional<Place> findFirstByVoyageIdAndEstLibreTrue(Long voyageId);
    Optional<Place> findByVoyageIdAndNumeroPlace(Long voyageId, String numeroPlace);
}
