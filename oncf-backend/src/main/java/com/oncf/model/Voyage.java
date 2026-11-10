package com.oncf.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "voyages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Voyage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String gareDepart;

    private String gareArrivee;

    private LocalDate dateDepart;

    private LocalTime heureDepart;

    private LocalTime heureArrivee;

    @Builder.Default
    private int minutesRetard = 0;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "train_id")
    @JsonIgnoreProperties({"voyages", "observers", "hibernateLazyInitializer", "handler"})
    private Train train;

    @OneToMany(mappedBy = "voyage", fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"voyage", "waitingList", "hibernateLazyInitializer", "handler"})
    private List<Place> places;
}
