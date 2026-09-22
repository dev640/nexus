package com.nexus.backend.service;

import com.nexus.backend.domain.notification.Notification;
import com.nexus.backend.domain.task.Task;
import com.nexus.backend.domain.user.User;
import com.nexus.backend.dto.NotificationResponse;
import com.nexus.backend.exception.ResourceNotFoundException;
import com.nexus.backend.repository.NotificationRepository;
import com.nexus.backend.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    /** Generate a notification when a task is assigned to someone. */
    @Transactional
    public void notifyTaskAssigned(Task task, User assignee) {
        if (assignee == null || task == null) return;
        String actor = currentUserEmail();
        if (actor != null && actor.equals(assignee.getEmail())) return; // no self-notifications

        Notification n = new Notification();
        n.setRecipient(assignee);
        n.setCategory(Notification.Category.TASKS);
        n.setText("You were assigned to \"" + task.getTitle() + "\"");
        notificationRepository.save(n);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> findMine() {
        User me = currentUser();
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(me).stream()
            .map(NotificationService::mapToResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public long countUnread() {
        return notificationRepository.countByRecipientAndReadFalse(currentUser());
    }

    @Transactional
    public void markRead(Long id) {
        Notification n = notificationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
        if (!n.getRecipient().getEmail().equals(currentUserEmail())) {
            throw new ResourceNotFoundException("Notification", "id", id);
        }
        n.setRead(true);
        notificationRepository.save(n);
    }

    @Transactional
    public void archive(Long id) {
        Notification n = notificationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
        if (!n.getRecipient().getEmail().equals(currentUserEmail())) {
            throw new ResourceNotFoundException("Notification", "id", id);
        }
        notificationRepository.delete(n);
    }

    @Transactional
    public void markAllRead() {
        User me = currentUser();
        List<Notification> unread = notificationRepository.findByRecipientOrderByCreatedAtDesc(me).stream()
            .filter(n -> !n.isRead())
            .toList();
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private String currentUserEmail() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : null;
    }

    private static NotificationResponse mapToResponse(Notification n) {
        return new NotificationResponse(
            n.getId(),
            n.getCategory().name(),
            n.getText(),
            n.isRead(),
            n.getCreatedAt()
        );
    }
}
