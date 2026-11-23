package com.travelsplit.notifications.scheduler;

import com.travelsplit.notifications.dto.NotificationSettingDto;
import com.travelsplit.notifications.model.Notification;
import com.travelsplit.notifications.service.NotificationService;
import com.travelsplit.trips.model.TripEvent;
import com.travelsplit.trips.service.TripEventService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
public class NotificationScheduler {

    private static final Logger log = LoggerFactory.getLogger(NotificationScheduler.class);

    private final TripEventService tripEventService;
    private final NotificationService notificationService;

    public NotificationScheduler(TripEventService tripEventService,
                                 NotificationService notificationService) {
        this.tripEventService = tripEventService;
        this.notificationService = notificationService;
    }

    @Scheduled(fixedRateString = "${notifications.scheduler.fixed-rate-ms:30000}")
    public synchronized void checkAndTriggerNotifications() {
        Instant nowUtc = Instant.now();
        List<TripEvent> upcomingEvents = tripEventService.getAllUpcomingEvents();
        Map<String, List<NotificationSettingDto>> settingsCache = new HashMap<>();

        for (TripEvent event : upcomingEvents) {
            if (event.getParticipantUserIds() == null) {
                continue;
            }
            for (String userId : event.getParticipantUserIds()) {
                String cacheKey = userId + ":" + event.getTripId();
                List<NotificationSettingDto> settings = settingsCache.computeIfAbsent(
                    cacheKey, k -> notificationService.getSettingsForTrip(userId, event.getTripId())
                );

                NotificationSettingDto matchingSetting = settings.stream()
                    .filter(s -> s.getEventType() == event.getType())
                    .findFirst()
                    .orElse(null);

                if (matchingSetting == null || !matchingSetting.isEnabled()) {
                    continue;
                }

                int leadTimeMinutes = matchingSetting.getLeadTimeMinutes();
                Instant triggerTimeUtc = event.getEventTimeUtc().minus(leadTimeMinutes, ChronoUnit.MINUTES);

                if (nowUtc.isAfter(triggerTimeUtc) || nowUtc.equals(triggerTimeUtc)) {
                    String dedupKey = String.format("%s:%s:%s:%d", userId, event.getId(), event.getType().name(), leadTimeMinutes);

                    Optional<Notification> created = notificationService.createNotificationIfAbsent(
                        userId,
                        event.getTripId(),
                        event.getType(),
                        event.getTargetType(),
                        event.getTargetId(),
                        event.getTitle(),
                        event.getDescription(),
                        triggerTimeUtc,
                        dedupKey
                    );

                    if (created.isPresent()) {
                        log.info("Triggered notification for user='{}', type='{}', title='{}'",
                            userId, event.getType().name(), event.getTitle());
                    }
                }
            }
        }
    }
}
