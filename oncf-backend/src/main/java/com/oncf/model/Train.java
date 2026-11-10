package com.oncf.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.oncf.service.TrainDelaySubject;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "trains")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Train implements TrainDelaySubject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String numeroTrain;

    private int capacite;

    private String etat;

    @OneToMany(mappedBy = "train", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Voyage> voyages;

    @ManyToMany
    @JoinTable(name = "train_observers",
        joinColumns = @JoinColumn(name = "train_id"),
        inverseJoinColumns = @JoinColumn(name = "voyageur_id"))
    @JsonIgnore
    @Builder.Default
    private Set<Voyageur> observers = new HashSet<>();

    @Override
    public void addObserver(Voyageur voyageur) {
        observers.add(voyageur);
    }

    @Override
    public void removeObserver(Voyageur voyageur) {
        observers.remove(voyageur);
    }

    @Override
    public void notifyObservers(String message) {
        for (Voyageur observer : observers) {
            observer.update(message);
        }
    }
}
