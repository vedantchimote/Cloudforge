package io.cloudforge.notificationservice.repository;

import io.cloudforge.notificationservice.model.Notification;
import io.cloudforge.notificationservice.model.NotificationStatus;
import io.cloudforge.notificationservice.model.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    Page<Notification> findByUserId(UUID userId, Pageable pageable);

    Page<Notification> findByUserIdAndType(UUID userId, NotificationType type, Pageable pageable);

    List<Notification> findByStatus(NotificationStatus status);

    List<Notification> findByStatusAndRetryCountLessThan(NotificationStatus status, int maxRetries);

    List<Notification> findByReferenceIdAndReferenceType(String referenceId, String referenceType);

    long countByUserIdAndCreatedAtAfter(UUID userId, Instant since);

    long countByStatus(NotificationStatus status);
}
