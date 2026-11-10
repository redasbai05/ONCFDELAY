package com.oncf.service;

import com.oncf.model.Notification;
import com.oncf.model.Voyageur;
import com.oncf.repository.NotificationRepository;
import com.oncf.repository.VoyageurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final VoyageurRepository voyageurRepository;

    public void sendNotification(Long voyageurId, String message, String type) {
        Voyageur voyageur = voyageurRepository.findById(voyageurId)
                .orElseThrow(() -> new RuntimeException("Voyageur not found"));
        Notification notification = Notification.builder()
                .message(message)
                .dateEnvoi(LocalDateTime.now())
                .lue(false)
                .type(type)
                .voyageur(voyageur)
                .build();
        notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsByVoyageur(Long voyageurId) {
        return notificationRepository.findByVoyageurIdOrderByDateEnvoiDesc(voyageurId);
    }

    public long getUnreadCount(Long voyageurId) {
        return notificationRepository.countByVoyageurIdAndLueFalse(voyageurId);
    }

    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setLue(true);
        notificationRepository.save(notification);
    }
}
