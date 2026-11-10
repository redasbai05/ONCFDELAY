package com.oncf.repository;

import com.oncf.model.ListeAttente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

import com.oncf.model.ListeAttente.StatutAttente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ListeAttenteRepository extends JpaRepository<ListeAttente, Long> {
    List<ListeAttente> findByVoyageurIdOrderByRequestTimeAsc(Long voyageurId);
    Optional<ListeAttente> findTopByVoyageIdAndStatutOrderByRequestTimeAsc(Long voyageId, StatutAttente statut);
    List<ListeAttente> findByVoyageIdAndStatutOrderByRequestTimeAsc(Long voyageId, StatutAttente statut);
    long countByVoyageIdAndStatut(Long voyageId, StatutAttente statut);
    Optional<ListeAttente> findByVoyageIdAndVoyageurId(Long voyageId, Long voyageurId);
    Optional<ListeAttente> findByVoyageIdAndVoyageurIdAndStatut(Long voyageId, Long voyageurId, StatutAttente statut);
}
