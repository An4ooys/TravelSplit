package com.travelsplit.notifications.repository;

import com.travelsplit.notifications.model.NotificationSetting;
import com.travelsplit.notifications.model.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationSettingRepository extends JpaRepository<NotificationSetting, Long> {

    List<NotificationSetting> findByUserIdAndTripId(String userId, String tripId);

    Optional<NotificationSetting> findByUserIdAndTripIdAndEventType(String userId, String tripId, NotificationType eventType);

    List<NotificationSetting> findByUserId(String userId);

    List<NotificationSetting> findByEnabledTrue();
}
