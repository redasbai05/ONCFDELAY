package com.oncf.repository;

import com.oncf.model.Voyageur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VoyageurRepository extends JpaRepository<Voyageur, Long> {
    Optional<Voyageur> findByEmail(String email);
}
