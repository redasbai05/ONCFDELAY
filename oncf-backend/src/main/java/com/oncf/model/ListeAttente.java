package com.oncf.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "liste_attente",
       uniqueConstraints = @UniqueConstraint(columnNames = {"voyageur_id", "voyage_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ListeAttente {

    public enum StatutAttente {
        EN_ATTENTE, ATTRIBUE, ANNULE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime requestTime;

    private int position;

    @Enumerated(EnumType.STRING)
    private StatutAttente statut;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voyageur_id")
    @JsonIgnoreProperties({"reservations", "waitingListEntries", "notifications", "password", "hibernateLazyInitializer", "handler"})
    private Voyageur voyageur;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "voyage_id")
    @JsonIgnoreProperties({"places", "hibernateLazyInitializer", "handler"})
    private Voyage voyage;
}
