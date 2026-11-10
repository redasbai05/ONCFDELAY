package com.oncf.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.oncf.service.Observer;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "voyageurs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Voyageur implements Observer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;

    private String prenom;

    @Column(unique = true)
    private String email;

    private String password;

    private String telephone;

    @OneToMany(mappedBy = "voyageur", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Reservation> reservations;

    @OneToMany(mappedBy = "voyageur", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<ListeAttente> waitingListEntries;

    @OneToMany(mappedBy = "voyageur", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Notification> notifications;

    @Transient
    @JsonIgnore
    @Builder.Default
    private List<Notification> pendingNotifications = new ArrayList<>();

    @Override
    public void update(String message) {
        pendingNotifications.add(
            Notification.builder()
                .message(message)
                .dateEnvoi(LocalDateTime.now())
                .lue(false)
                .type("RETARD")
                .voyageur(this)
                .build()
        );
    }

    public List<Notification> drainPendingNotifications() {
        List<Notification> copy = new ArrayList<>(pendingNotifications);
        pendingNotifications.clear();
        return copy;
    }
}
