package com.travelsplit.notifications.repository;

import com.travelsplit.notifications.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findTop100ByUserIdOrderByDeliveredAtDesc(String userId);

    long countByUserIdAndIsReadFalse(String userId);

    Optional<Notification> findByDeduplicationKey(String deduplicationKey);

    boolean existsByDeduplicationKey(String deduplicationKey);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.userId = :userId AND n.isRead = false")
    int markAllReadByUserId(@Param("userId") String userId);
}
