package com.travelsplit.notifications.service;

import com.travelsplit.notifications.dto.NotificationResponse;
import com.travelsplit.notifications.dto.NotificationSettingDto;
import com.travelsplit.notifications.model.Notification;
import com.travelsplit.notifications.model.NotificationSetting;
import com.travelsplit.notifications.model.NotificationType;
import com.travelsplit.notifications.repository.NotificationRepository;
import com.travelsplit.notifications.repository.NotificationSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private static final int DEDUP_LOCK_STRIPES = 64;

    private final NotificationRepository notificationRepository;
    private final NotificationSettingRepository settingRepository;
    private final NotificationStreamService streamService;
    private final NotificationWebhookService webhookService;
    private final Object[] dedupLocks = new Object[DEDUP_LOCK_STRIPES];

    public NotificationService(NotificationRepository notificationRepository,
                               NotificationSettingRepository settingRepository,
                               NotificationStreamService streamService,
                               NotificationWebhookService webhookService) {
        this.notificationRepository = notificationRepository;
        this.settingRepository = settingRepository;
        this.streamService = streamService;
        this.webhookService = webhookService;
        for (int i = 0; i < DEDUP_LOCK_STRIPES; i++) {
            this.dedupLocks[i] = new Object();
        }
    }

    public List<NotificationResponse> getNotifications(String userId) {
        String normalizedUser = normalizeUserId(userId);
        return notificationRepository.findTop100ByUserIdOrderByDeliveredAtDesc(normalizedUser)
            .stream()
            .map(NotificationResponse::fromEntity)
            .collect(Collectors.toList());
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(normalizeUserId(userId));
    }

    @Transactional
    public Optional<NotificationResponse> markAsRead(Long id, String userId) {
        String normalizedUser = normalizeUserId(userId);
        return notificationRepository.findById(id)
            .filter(n -> n.getUserId().equalsIgnoreCase(normalizedUser))
            .map(n -> {
                if (n.isRead()) {
                    return NotificationResponse.fromEntity(n);
                }
                n.setRead(true);
                NotificationResponse dto = NotificationResponse.fromEntity(notificationRepository.save(n));
                long unreadCount = notificationRepository.countByUserIdAndIsReadFalse(normalizedUser);
                runAfterCommit(() -> streamService.publishNotificationUpdated(normalizedUser, dto, unreadCount));
                return dto;
            });
    }

    @Transactional
    public Optional<NotificationResponse> markAsUnread(Long id, String userId) {
        String normalizedUser = normalizeUserId(userId);
        return notificationRepository.findById(id)
            .filter(n -> n.getUserId().equalsIgnoreCase(normalizedUser))
            .map(n -> {
                if (!n.isRead()) {
                    return NotificationResponse.fromEntity(n);
                }
                n.setRead(false);
                n.setRepeatCount(n.getRepeatCount() + 1);
                n.setDeliveredAt(Instant.now());
                NotificationResponse dto = NotificationResponse.fromEntity(notificationRepository.save(n));
                long unreadCount = notificationRepository.countByUserIdAndIsReadFalse(normalizedUser);
                runAfterCommit(() -> streamService.publishNotification(normalizedUser, dto, unreadCount));
                return dto;
            });
    }

    @Transactional
    public void markAllAsRead(String userId) {
        String normalizedUser = normalizeUserId(userId);
        int updated = notificationRepository.markAllReadByUserId(normalizedUser);
        if (updated > 0) {
            runAfterCommit(() -> streamService.publishAllRead(normalizedUser));
        }
    }

    public List<NotificationSettingDto> getSettingsForTrip(String userId, String tripId) {
        String normalizedUser = normalizeUserId(userId);
        List<NotificationSetting> existing = settingRepository.findByUserIdAndTripId(normalizedUser, tripId);
        Map<NotificationType, NotificationSetting> map = existing.stream()
            .collect(Collectors.toMap(NotificationSetting::getEventType, s -> s, (a, b) -> a));

        List<NotificationSettingDto> result = new ArrayList<>();
        for (NotificationType type : NotificationType.values()) {
            if (map.containsKey(type)) {
                result.add(NotificationSettingDto.fromEntity(map.get(type)));
            } else {
                result.add(new NotificationSettingDto(type, getDefaultLeadTimeMinutes(type), true));
            }
        }
        return result;
    }

    @Transactional
    public List<NotificationSettingDto> updateSettingsForTrip(String userId, String tripId, List<NotificationSettingDto> dtos) {
        String normalizedUser = normalizeUserId(userId);
        List<NotificationSetting> existing = settingRepository.findByUserIdAndTripId(normalizedUser, tripId);
        Map<NotificationType, NotificationSetting> byType = existing.stream()
            .collect(Collectors.toMap(NotificationSetting::getEventType, s -> s, (a, b) -> a));

        List<NotificationSetting> toSave = new ArrayList<>();
        int count = 0;
        for (NotificationSettingDto dto : dtos) {
            if (count++ >= 50) {
                break;
            }
            if (dto == null || dto.getEventType() == null) {
                continue;
            }
            int safeLeadTime = Math.max(1, Math.min(43200, dto.getLeadTimeMinutes()));
            NotificationSetting setting = byType.computeIfAbsent(
                dto.getEventType(),
                t -> new NotificationSetting(normalizedUser, tripId, t, safeLeadTime, dto.isEnabled())
            );
            setting.setLeadTimeMinutes(safeLeadTime);
            setting.setEnabled(dto.isEnabled());
            toSave.add(setting);
        }
        if (!toSave.isEmpty()) {
            settingRepository.saveAll(toSave);
        }
        return getSettingsForTrip(normalizedUser, tripId);
    }

    @Transactional
    public Optional<Notification> createNotificationIfAbsent(String userId, String tripId, NotificationType type,
                                                             String targetType, String targetId, String title,
                                                             String message, Instant scheduledFor, String dedupKey) {
        String normalizedUser = normalizeUserId(userId);
        String safeDedupKey = truncate(dedupKey, 255);
        Object stripe = dedupLocks[Math.floorMod(safeDedupKey.hashCode(), DEDUP_LOCK_STRIPES)];

        synchronized (stripe) {
            if (notificationRepository.existsByDeduplicationKey(safeDedupKey)) {
                return Optional.empty();
            }

            Notification notification = new Notification(
                normalizedUser,
                truncate(tripId != null && !tripId.isBlank() ? tripId.trim() : "altai", 255),
                type,
                truncate(targetType != null && !targetType.isBlank() ? targetType.trim() : "BOOKING", 255),
                truncate(targetId != null && !targetId.isBlank() ? targetId.trim() : "unknown", 255),
                truncate(title != null && !title.isBlank() ? title.trim() : "Уведомление TravelSplit", 255),
                truncate(message != null ? message : "", 1000),
                scheduledFor,
                Instant.now(),
                safeDedupKey
            );
            Notification saved = notificationRepository.save(notification);
            NotificationResponse dto = NotificationResponse.fromEntity(saved);
            long unreadCount = notificationRepository.countByUserIdAndIsReadFalse(normalizedUser);
            runAfterCommit(() -> {
                streamService.publishNotification(normalizedUser, dto, unreadCount);
                webhookService.dispatchToBot(normalizedUser, dto);
            });
            return Optional.of(saved);
        }
    }

    private String truncate(String value, int maxLen) {
        if (value == null || value.length() <= maxLen) {
            return value != null ? value : "";
        }
        return value.substring(0, maxLen);
    }

    private void runAfterCommit(Runnable action) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    action.run();
                }
            });
        } else {
            action.run();
        }
    }

    private String normalizeUserId(String userId) {
        if (userId == null || userId.isBlank()) {
            return "anna";
        }
        return userId.trim().toLowerCase();
    }

    private int getDefaultLeadTimeMinutes(NotificationType type) {
        return switch (type) {
            case TRIP_START -> 1440;
            case TRANSPORT_DEPARTURE -> 60;
            case ACCOMMODATION_CHECKIN, ACCOMMODATION_CHECKOUT -> 180;
            case ITINERARY_EVENT -> 30;
        };
    }
}
