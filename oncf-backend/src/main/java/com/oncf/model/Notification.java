package com.oncf.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String message;

    private LocalDateTime dateEnvoi;

    @Builder.Default
    private boolean lue = false;

    private String type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voyageur_id")
    @JsonIgnoreProperties({"reservations", "waitingListEntries", "notifications", "password", "hibernateLazyInitializer", "handler"})
    private Voyageur voyageur;
}
