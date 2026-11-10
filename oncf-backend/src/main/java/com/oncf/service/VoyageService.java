package com.oncf.service;

import com.oncf.model.Place;
import com.oncf.model.Train;
import com.oncf.model.Voyage;
import com.oncf.repository.PlaceRepository;
import com.oncf.repository.TrainRepository;
import com.oncf.repository.VoyageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VoyageService {

    private final VoyageRepository voyageRepository;
    private final TrainRepository trainRepository;
    private final PlaceRepository placeRepository;

    public List<Voyage> getAllVoyages() {
        return voyageRepository.findAll();
    }

    public Voyage getVoyageById(Long id) {
        return voyageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Voyage not found with id: " + id));
    }

    @Transactional
    public Voyage createVoyage(Voyage voyage, Long trainId) {
        Train train = trainRepository.findById(trainId)
                .orElseThrow(() -> new RuntimeException("Train not found with id: " + trainId));
        voyage.setTrain(train);
        voyage = voyageRepository.save(voyage);
        generatePlacesForVoyage(voyage);
        return voyage;
    }

    @Transactional
    public Voyage updateVoyage(Long id, Voyage updatedVoyage, Long trainId) {
        Voyage voyage = getVoyageById(id);
        voyage.setGareDepart(updatedVoyage.getGareDepart());
        voyage.setGareArrivee(updatedVoyage.getGareArrivee());
        voyage.setDateDepart(updatedVoyage.getDateDepart());
        voyage.setHeureDepart(updatedVoyage.getHeureDepart());
        voyage.setHeureArrivee(updatedVoyage.getHeureArrivee());
        if (trainId != null && !trainId.equals(voyage.getTrain().getId())) {
            Train newTrain = trainRepository.findById(trainId)
                    .orElseThrow(() -> new RuntimeException("Train not found with id: " + trainId));
            voyage.setTrain(newTrain);
        }
        return voyageRepository.save(voyage);
    }

    public void deleteVoyage(Long id) {
        voyageRepository.deleteById(id);
    }

    private void generatePlacesForVoyage(Voyage voyage) {
        int capacite = voyage.getTrain().getCapacite();
        String[] letters = {"A", "B", "C", "D"};
        for (int i = 1; i <= capacite; i++) {
            int row = (i - 1) / 4 + 1;
            String letter = letters[(i - 1) % 4];
            Place place = Place.builder()
                    .numeroPlace(row + letter)
                    .estLibre(true)
                    .voyage(voyage)
                    .build();
            placeRepository.save(place);
        }
    }
}
