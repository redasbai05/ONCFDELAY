package com.oncf.controller;

import com.oncf.dto.DelayRequest;
import com.oncf.model.*;
import com.oncf.repository.VoyageRepository;
import com.oncf.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/agent")
@RequiredArgsConstructor
@PreAuthorize("hasRole('AGENT')")
public class AgentController {

    private final VoyageService voyageService;
    private final TrainService trainService;
    private final VoyageRepository voyageRepository;

    @GetMapping("/trains")
    public ResponseEntity<?> getAllTrains() {
        return ResponseEntity.ok(trainService.getAllTrains());
    }

    @GetMapping("/voyages")
    public ResponseEntity<?> getAllVoyages() {
        return ResponseEntity.ok(voyageService.getAllVoyages());
    }

    @PostMapping("/voyages")
    public ResponseEntity<?> createVoyage(@RequestBody Map<String, Object> body) {
        Object trainIdObj = body.get("trainId");
        Long trainId = null;
        if (trainIdObj != null && !trainIdObj.toString().isBlank()) {
            trainId = Long.valueOf(trainIdObj.toString());
        }
        String gareDepart = (String) body.get("gareDepart");
        String gareArrivee = (String) body.get("gareArrivee");
        String dateDepart = (String) body.get("dateDepart");
        String heureDepart = (String) body.get("heureDepart");
        String heureArrivee = (String) body.get("heureArrivee");

        Voyage voyage = Voyage.builder()
                .gareDepart(gareDepart)
                .gareArrivee(gareArrivee)
                .dateDepart(java.time.LocalDate.parse(dateDepart))
                .heureDepart(java.time.LocalTime.parse(heureDepart))
                .heureArrivee(java.time.LocalTime.parse(heureArrivee))
                .build();

        if (trainId == null) {
            String numeroTrain = (String) body.get("numeroTrain");
            int capacite = Integer.parseInt(body.get("capacite").toString());
            Train newTrain = Train.builder()
                    .numeroTrain(numeroTrain)
                    .capacite(capacite)
                    .etat("A_L_HEURE")
                    .build();
            newTrain = trainService.createTrain(newTrain);
            trainId = newTrain.getId();
        }

        Voyage created = voyageService.createVoyage(voyage, trainId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/voyages/{id}")
    public ResponseEntity<?> updateVoyage(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        String gareDepart = (String) body.get("gareDepart");
        String gareArrivee = (String) body.get("gareArrivee");
        String dateDepart = (String) body.get("dateDepart");
        String heureDepart = (String) body.get("heureDepart");
        String heureArrivee = (String) body.get("heureArrivee");

        Voyage updated = Voyage.builder()
                .gareDepart(gareDepart)
                .gareArrivee(gareArrivee)
                .dateDepart(dateDepart != null ? java.time.LocalDate.parse(dateDepart) : null)
                .heureDepart(heureDepart != null ? java.time.LocalTime.parse(heureDepart) : null)
                .heureArrivee(heureArrivee != null ? java.time.LocalTime.parse(heureArrivee) : null)
                .build();

        Object trainIdObj = body.get("trainId");
        Long trainId = null;
        if (trainIdObj != null && !trainIdObj.toString().isBlank()) {
            trainId = Long.valueOf(trainIdObj.toString());
        }

        return ResponseEntity.ok(voyageService.updateVoyage(id, updated, trainId));
    }

    @DeleteMapping("/voyages/{id}")
    public ResponseEntity<?> deleteVoyage(@PathVariable Long id) {
        voyageService.deleteVoyage(id);
        return ResponseEntity.ok(Map.of("message", "Voyage deleted successfully"));
    }

    @PostMapping("/trains")
    public ResponseEntity<?> createTrain(@RequestBody Train train) {
        return ResponseEntity.status(HttpStatus.CREATED).body(trainService.createTrain(train));
    }

    @PostMapping("/trains/{id}/delay")
    public ResponseEntity<?> declareDelay(@PathVariable Long id, @RequestBody DelayRequest request) {
        trainService.declareDelay(id, request.getMinutesRetard(), request.getRaison());
        return ResponseEntity.ok(Map.of("message", "Delay declared successfully"));
    }

    @PostMapping("/voyages/{id}/delay")
    public ResponseEntity<?> declareVoyageDelay(@PathVariable Long id, @RequestBody DelayRequest request) {
        Voyage voyage = voyageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Voyage not found"));
        Long trainId = voyage.getTrain().getId();
        trainService.declareDelay(trainId, request.getMinutesRetard(), request.getRaison());
        return ResponseEntity.ok(Map.of("message", "Delay declared successfully"));
    }
}
