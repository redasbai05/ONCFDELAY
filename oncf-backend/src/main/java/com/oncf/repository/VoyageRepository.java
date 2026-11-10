package com.oncf.repository;

import com.oncf.model.Voyage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VoyageRepository extends JpaRepository<Voyage, Long> {
    List<Voyage> findByTrainId(Long trainId);
}
