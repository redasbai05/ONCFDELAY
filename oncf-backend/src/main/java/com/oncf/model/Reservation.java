package com.oncf.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "reservations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime dateReservation;

    private String statut;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voyageur_id")
    @JsonIgnoreProperties({"reservations", "waitingListEntries", "notifications", "password", "hibernateLazyInitializer", "handler"})
    private Voyageur voyageur;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "voyage_id")
    @JsonIgnoreProperties({"places", "hibernateLazyInitializer", "handler"})
    private Voyage voyage;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "place_id")
    @JsonIgnoreProperties({"voyage", "waitingList", "hibernateLazyInitializer", "handler"})
    private Place place;
}
