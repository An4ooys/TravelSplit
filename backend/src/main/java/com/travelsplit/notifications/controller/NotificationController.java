package com.travelsplit.notifications.controller;

import com.travelsplit.notifications.dto.NotificationResponse;
import com.travelsplit.notifications.dto.NotificationSettingDto;
import com.travelsplit.notifications.dto.NotificationSettingUpdateRequest;
import com.travelsplit.notifications.dto.UnreadCountResponse;
import com.travelsplit.notifications.dto.WebhookNotificationRequest;
import com.travelsplit.notifications.model.Notification;
import com.travelsplit.notifications.model.NotificationType;
import com.travelsplit.notifications.scheduler.NotificationScheduler;
import com.travelsplit.notifications.service.NotificationService;
import com.travelsplit.notifications.service.NotificationStreamService;
import com.travelsplit.trips.dto.TripEventCreateRequest;
import com.travelsplit.trips.model.TripEvent;
import com.travelsplit.trips.service.TripEventService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@CrossOrigin(
    origins = {"http://127.0.0.1:5173", "http://localhost:5173"},
    allowedHeaders = {"Content-Type", "X-Demo-User-Id"},
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE, RequestMethod.OPTIONS}
)
public class NotificationController {

    private final NotificationService notificationService;
    private final TripEventService tripEventService;
    private final NotificationStreamService streamService;
    private final NotificationScheduler notificationScheduler;
    private final String webhookSecret;

    public NotificationController(NotificationService notificationService,
                                  TripEventService tripEventService,
                                  NotificationStreamService streamService,
                                  NotificationScheduler notificationScheduler,
                                  @Value("${notifications.webhook.secret:}") String webhookSecret) {
        this.notificationService = notificationService;
        this.tripEventService = tripEventService;
        this.streamService = streamService;
        this.notificationScheduler = notificationScheduler;
        this.webhookSecret = webhookSecret != null ? webhookSecret.trim() : "";
    }

    private String resolveIdentifier(String raw, String fallback) {
        if (raw == null || raw.isBlank()) {
            return fallback;
        }
        String normalized = raw.trim().toLowerCase();
        return normalized.matches("[a-z0-9._-]{1,64}") ? normalized : null;
    }

    private String resolveUserId(String headerUserId) {
        String resolved = resolveIdentifier(headerUserId, "anna");
        return resolved != null ? resolved : "anna";
    }

    private boolean isWebhookAuthorized(String secretHeader) {
        if (webhookSecret.isEmpty()) {
            return true;
        }
        if (secretHeader == null) {
            return false;
        }
        return MessageDigest.isEqual(
            webhookSecret.getBytes(StandardCharsets.UTF_8),
            secretHeader.getBytes(StandardCharsets.UTF_8)
        );
    }

    @GetMapping("/api/me/notifications")
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(
            @RequestHeader(value = "X-Demo-User-Id", required = false) String userIdHeader) {
        String userId = resolveUserId(userIdHeader);
        return ResponseEntity.ok(notificationService.getNotifications(userId));
    }

    @GetMapping("/api/me/notifications/unread-count")
    public ResponseEntity<UnreadCountResponse> getUnreadCount(
            @RequestHeader(value = "X-Demo-User-Id", required = false) String userIdHeader) {
        String userId = resolveUserId(userIdHeader);
        return ResponseEntity.ok(new UnreadCountResponse(notificationService.getUnreadCount(userId)));
    }

    @GetMapping(value = "/api/me/notifications/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamNotifications(
            @RequestParam(value = "userId", required = false) String userIdParam,
            @RequestHeader(value = "X-Demo-User-Id", required = false) String userIdHeader) {
        String userId = resolveUserId(userIdParam != null && !userIdParam.isBlank() ? userIdParam : userIdHeader);
        return streamService.subscribe(userId, notificationService.getUnreadCount(userId));
    }

    private String truncate(String value, int maxLen) {
        if (value == null || value.length() <= maxLen) {
            return value;
        }
        return value.substring(0, maxLen);
    }

    @PostMapping("/api/webhooks/notifications")
    public ResponseEntity<NotificationResponse> receiveNotificationWebhook(
            @RequestHeader(value = "X-Webhook-Secret", required = false) String secretHeader,
            @RequestBody WebhookNotificationRequest request) {
        if (!isWebhookAuthorized(secretHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        if (request == null) {
            return ResponseEntity.badRequest().build();
        }
        String userId = resolveUserId(request.getUserId());
        String tripId = resolveIdentifier(request.getTripId(), "altai");
        if (tripId == null) {
            return ResponseEntity.badRequest().build();
        }
        NotificationType type = request.getType() != null ? request.getType() : NotificationType.ITINERARY_EVENT;
        String targetType = (request.getTargetType() != null && !request.getTargetType().isBlank())
            ? truncate(request.getTargetType().trim(), 64)
            : "WEBHOOK";
        String targetId = (request.getTargetId() != null && !request.getTargetId().isBlank())
            ? truncate(request.getTargetId().trim(), 255)
            : "wh-" + UUID.randomUUID().toString().substring(0, 8);
        String title = (request.getTitle() != null && !request.getTitle().isBlank())
            ? truncate(request.getTitle().trim(), 255)
            : "Уведомление TravelSplit";
        String message = truncate(request.getMessage() != null ? request.getMessage() : "", 1000);
        String dedupKey = (request.getDeduplicationKey() != null && !request.getDeduplicationKey().isBlank())
            ? truncate(request.getDeduplicationKey().trim(), 255)
            : userId + ":" + targetId + ":" + type.name() + ":" + UUID.randomUUID();

        Optional<Notification> created = notificationService.createNotificationIfAbsent(
            userId, tripId, type, targetType, targetId, title, message, Instant.now(), dedupKey
        );

        return created
            .map(n -> ResponseEntity.status(HttpStatus.CREATED).body(NotificationResponse.fromEntity(n)))
            .orElse(ResponseEntity.status(HttpStatus.CONFLICT).build());
    }

    @GetMapping("/api/me/trips/events")
    public ResponseEntity<List<TripEvent>> getMyTripEvents(
            @RequestHeader(value = "X-Demo-User-Id", required = false) String userIdHeader) {
        String userId = resolveUserId(userIdHeader);
        List<TripEvent> userEvents = tripEventService.getAllUpcomingEvents().stream()
            .filter(e -> e.getParticipantUserIds() != null && e.getParticipantUserIds().contains(userId))
            .toList();
        return ResponseEntity.ok(userEvents);
    }

    @PatchMapping("/api/notifications/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable Long id,
            @RequestHeader(value = "X-Demo-User-Id", required = false) String userIdHeader) {
        String userId = resolveUserId(userIdHeader);
        return notificationService.markAsRead(id, userId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/api/notifications/{id}/unread")
    public ResponseEntity<NotificationResponse> markAsUnread(
            @PathVariable Long id,
            @RequestHeader(value = "X-Demo-User-Id", required = false) String userIdHeader) {
        String userId = resolveUserId(userIdHeader);
        return notificationService.markAsUnread(id, userId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/api/me/notifications/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @RequestHeader(value = "X-Demo-User-Id", required = false) String userIdHeader) {
        String userId = resolveUserId(userIdHeader);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/api/trips/{tripId}/notification-settings")
    public ResponseEntity<List<NotificationSettingDto>> getTripNotificationSettings(
            @PathVariable String tripId,
            @RequestHeader(value = "X-Demo-User-Id", required = false) String userIdHeader) {
        String safeTripId = resolveIdentifier(tripId, null);
        if (safeTripId == null) {
            return ResponseEntity.badRequest().build();
        }
        String userId = resolveUserId(userIdHeader);
        return ResponseEntity.ok(notificationService.getSettingsForTrip(userId, safeTripId));
    }

    @PutMapping("/api/trips/{tripId}/notification-settings")
    public ResponseEntity<List<NotificationSettingDto>> updateTripNotificationSettings(
            @PathVariable String tripId,
            @RequestBody NotificationSettingUpdateRequest request,
            @RequestHeader(value = "X-Demo-User-Id", required = false) String userIdHeader) {
        String safeTripId = resolveIdentifier(tripId, null);
        if (safeTripId == null || request == null || request.getSettings() == null) {
            return ResponseEntity.badRequest().build();
        }
        String userId = resolveUserId(userIdHeader);
        List<NotificationSettingDto> updated = notificationService.updateSettingsForTrip(userId, safeTripId, request.getSettings());
        notificationScheduler.checkAndTriggerNotifications();
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/api/trips/{tripId}/events")
    public ResponseEntity<TripEvent> createTripEvent(
            @PathVariable String tripId,
            @RequestBody TripEventCreateRequest request,
            @RequestHeader(value = "X-Demo-User-Id", required = false) String userIdHeader) {
        String safeTripId = resolveIdentifier(tripId, null);
        if (safeTripId == null || request == null || request.getTitle() == null || request.getTitle().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        String userId = resolveUserId(userIdHeader);
        NotificationType type = request.getType() != null ? request.getType() : NotificationType.ITINERARY_EVENT;
        String targetType = switch (type) {
            case TRIP_START -> "TRIP";
            case ITINERARY_EVENT -> "ITINERARY";
            case TRANSPORT_DEPARTURE, ACCOMMODATION_CHECKIN, ACCOMMODATION_CHECKOUT -> "BOOKING";
        };
        ZoneId zoneId = resolveTripZone(safeTripId, request.getTimeZone());
        String tripTitle = switch (safeTripId) {
            case "norway" -> "Норвегия";
            case "switzerland" -> "Швейцария";
            default -> "Алтай";
        };
        List<String> participants = switch (safeTripId) {
            case "norway" -> Arrays.asList("anna", "ivan", "maria");
            case "switzerland" -> Arrays.asList("anna", "dmitry");
            default -> Arrays.asList("anna", "maria", "dmitry");
        };
        if (!participants.contains(userId)) {
            participants = Collections.singletonList(userId);
        }

        String eventId = (targetType.equals("ITINERARY") ? "itin-" : "booking-")
            + UUID.randomUUID().toString().substring(0, 8);
        String safeTitle = truncate(request.getTitle().trim(), 255);
        String safeDescription = truncate(
            request.getDescription() != null && !request.getDescription().isBlank()
                ? request.getDescription().trim()
                : "Событие добавлено в поездку «" + tripTitle + "».",
            1000
        );

        TripEvent event;
        if (request.getLocalDateTime() != null && !request.getLocalDateTime().isBlank()) {
            try {
                LocalDateTime localDt = LocalDateTime.parse(request.getLocalDateTime().trim());
                event = new TripEvent(
                    eventId, safeTripId, tripTitle, safeTitle, safeDescription,
                    type, targetType, eventId, localDt, zoneId, participants
                );
            } catch (Exception e) {
                return ResponseEntity.badRequest().build();
            }
        } else {
            int offsetMinutes = request.getOffsetMinutes() != null
                ? Math.max(1, Math.min(43200, request.getOffsetMinutes()))
                : 15;
            event = new TripEvent(
                eventId, safeTripId, tripTitle, safeTitle, safeDescription,
                type, targetType, eventId, Instant.now().plus(offsetMinutes, ChronoUnit.MINUTES),
                zoneId, participants
            );
        }

        tripEventService.addCustomEvent(event);
        notificationScheduler.checkAndTriggerNotifications();
        return ResponseEntity.status(HttpStatus.CREATED).body(event);
    }

    private ZoneId resolveTripZone(String tripId, String requestedZone) {
        if (requestedZone != null && !requestedZone.isBlank()) {
            try {
                return ZoneId.of(requestedZone.trim());
            } catch (Exception ignored) {
            }
        }
        return switch (tripId) {
            case "norway" -> ZoneId.of("Europe/Oslo");
            case "switzerland" -> ZoneId.of("Europe/Zurich");
            default -> ZoneId.of("Asia/Barnaul");
        };
    }

    @PostMapping("/api/demo/trigger-test-notification")
    public ResponseEntity<NotificationResponse> triggerTestNotification(
            @RequestParam(defaultValue = "TRANSPORT_DEPARTURE") NotificationType type,
            @RequestParam(defaultValue = "Рейс SU-100 отправляется через 15 минут!") String title,
            @RequestHeader(value = "X-Demo-User-Id", required = false) String userIdHeader) {
        String userId = resolveUserId(userIdHeader);
        String eventId = "evt-" + UUID.randomUUID().toString().substring(0, 8);
        String safeTitle = truncate(title != null && !title.isBlank() ? title.trim() : "Напоминание TravelSplit", 255);
        String targetType = switch (type) {
            case TRIP_START -> "TRIP";
            case ITINERARY_EVENT -> "ITINERARY";
            case TRANSPORT_DEPARTURE, ACCOMMODATION_CHECKIN, ACCOMMODATION_CHECKOUT -> "BOOKING";
        };
        String targetId = switch (type) {
            case TRIP_START -> "altai";
            case ITINERARY_EVENT -> "itin-altai-lakes";
            case ACCOMMODATION_CHECKIN -> "booking-altai-hotel-checkin";
            case ACCOMMODATION_CHECKOUT -> "booking-altai-hotel-checkout";
            case TRANSPORT_DEPARTURE -> "booking-altai-train";
        };

        tripEventService.addCustomEvent(new TripEvent(
            eventId,
            "altai",
            "Алтай",
            safeTitle,
            "Информация о предстоящем событии. Проверьте детали в приложении.",
            type,
            targetType,
            targetId,
            Instant.now().plus(10, ChronoUnit.MINUTES),
            ZoneId.of("Asia/Barnaul"),
            Collections.singletonList(userId)
        ));

        String dedupKey = userId + ":" + eventId + ":" + type.name() + ":instant";
        Optional<Notification> created = notificationService.createNotificationIfAbsent(
            userId,
            "altai",
            type,
            targetType,
            targetId,
            safeTitle,
            "Напоминание о приближающемся событии.",
            Instant.now(),
            dedupKey
        );

        return created
            .map(n -> ResponseEntity.ok(NotificationResponse.fromEntity(n)))
            .orElseGet(() -> ResponseEntity.ok().build());
    }
}
