package com.travelsplit.notifications;

import com.travelsplit.notifications.controller.NotificationController;
import com.travelsplit.notifications.dto.NotificationResponse;
import com.travelsplit.notifications.dto.NotificationSettingDto;
import com.travelsplit.notifications.dto.WebhookNotificationRequest;
import com.travelsplit.notifications.model.NotificationType;
import com.travelsplit.notifications.service.NotificationService;
import com.travelsplit.trips.dto.TripEventCreateRequest;
import com.travelsplit.trips.model.TripEvent;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class NotificationServiceTest {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private NotificationController notificationController;

    @Test
    void testCreateAndDeduplicateNotification() {
        String userId = "user-1";
        String tripId = "trip-1";
        String dedupKey = "user-1:flight-1:TRANSPORT:60";

        var createdFirst = notificationService.createNotificationIfAbsent(
            userId, tripId, NotificationType.TRANSPORT_DEPARTURE, "BOOKING", "flight-1",
            "Вылет через 1 час", "Рейс SU-100", Instant.now(), dedupKey
        );
        assertTrue(createdFirst.isPresent());

        var createdSecond = notificationService.createNotificationIfAbsent(
            userId, tripId, NotificationType.TRANSPORT_DEPARTURE, "BOOKING", "flight-1",
            "Вылет через 1 час", "Рейс SU-100", Instant.now(), dedupKey
        );
        assertTrue(createdSecond.isEmpty());

        long unread = notificationService.getUnreadCount(userId);
        assertEquals(1, unread);

        List<NotificationResponse> list = notificationService.getNotifications(userId);
        assertFalse(list.isEmpty());
        Long notifId = list.get(0).getId();

        var readResult = notificationService.markAsRead(notifId, userId);
        assertTrue(readResult.isPresent());
        assertTrue(readResult.get().isRead());
        assertEquals(0, notificationService.getUnreadCount(userId));

        var unreadResult = notificationService.markAsUnread(notifId, userId);
        assertTrue(unreadResult.isPresent());
        assertFalse(unreadResult.get().isRead());
        assertEquals(1, unreadResult.get().getRepeatCount());
        assertEquals(1, notificationService.getUnreadCount(userId));

        var unreadAgain = notificationService.markAsUnread(notifId, userId);
        assertTrue(unreadAgain.isPresent());
        assertEquals(1, unreadAgain.get().getRepeatCount());
    }

    @Test
    void testNotificationSettingsDefaultsAndSave() {
        String userId = "anna";
        String tripId = "trip-rome";

        List<NotificationSettingDto> defaults = notificationService.getSettingsForTrip(userId, tripId);
        assertNotNull(defaults);
        assertFalse(defaults.isEmpty());

        defaults.stream()
            .filter(s -> s.getEventType() == NotificationType.TRIP_START)
            .findFirst()
            .ifPresent(s -> s.setLeadTimeMinutes(4320));

        var updated = notificationService.updateSettingsForTrip(userId, tripId, defaults);
        var changedSetting = updated.stream()
            .filter(s -> s.getEventType() == NotificationType.TRIP_START)
            .findFirst()
            .orElseThrow();

        assertEquals(4320, changedSetting.getLeadTimeMinutes());
    }

    @Test
    void testTimezoneCalculation() {
        LocalDateTime localTime = LocalDateTime.of(2026, 5, 19, 14, 0, 0);
        ZoneId zoneRome = ZoneId.of("Europe/Rome");
        TripEvent event = new TripEvent("test-tz", "trip-1", "Рим", "Экскурсия", "Экскурсия",
            NotificationType.ITINERARY_EVENT, "ITINERARY", "test-tz", localTime, zoneRome, List.of("anna"));

        Instant utcInstant = event.getEventTimeUtc();
        assertEquals(Instant.parse("2026-05-19T12:00:00Z"), utcInstant);
    }

    @Test
    void testWebhookMarkAllReadAndSseSubscription() {
        String userId = "webhook-user";
        assertNotNull(notificationController.streamNotifications(userId, null));

        WebhookNotificationRequest req = new WebhookNotificationRequest();
        req.setUserId(userId);
        req.setTripId("altai");
        req.setType(NotificationType.ITINERARY_EVENT);
        req.setTitle("Событие по вебхуку");
        req.setMessage("Тестовое сообщение");
        req.setDeduplicationKey("wh-dedup-1");

        var firstResp = notificationController.receiveNotificationWebhook(null, req);
        assertEquals(HttpStatus.CREATED, firstResp.getStatusCode());
        assertNotNull(firstResp.getBody());
        assertEquals("Событие по вебхуку", firstResp.getBody().getTitle());
        assertEquals(1, notificationService.getUnreadCount(userId));

        var dupResp = notificationController.receiveNotificationWebhook(null, req);
        assertEquals(HttpStatus.CONFLICT, dupResp.getStatusCode());

        // Нормализация регистра userId и обрезка слишком длинных полей
        WebhookNotificationRequest longReq = new WebhookNotificationRequest();
        longReq.setUserId("Webhook-User");
        longReq.setTitle("A".repeat(300));
        longReq.setMessage("B".repeat(1200));
        longReq.setDeduplicationKey("wh-dedup-2");
        var secondResp = notificationController.receiveNotificationWebhook(null, longReq);
        assertEquals(HttpStatus.CREATED, secondResp.getStatusCode());
        assertNotNull(secondResp.getBody());
        assertEquals(255, secondResp.getBody().getTitle().length());
        assertEquals(1000, secondResp.getBody().getMessage().length());
        assertEquals(2, notificationService.getUnreadCount(userId));

        notificationService.markAllAsRead("Webhook-User");
        assertEquals(0, notificationService.getUnreadCount(userId));

        // Невалидный userId с CRLF сбрасывается к безопасному значению по умолчанию
        WebhookNotificationRequest badUserReq = new WebhookNotificationRequest();
        badUserReq.setUserId("evil\r\nInjected: header");
        badUserReq.setTitle("Safe check");
        badUserReq.setDeduplicationKey("wh-dedup-safe-1");
        var safeResp = notificationController.receiveNotificationWebhook(null, badUserReq);
        assertEquals(HttpStatus.CREATED, safeResp.getStatusCode());
        assertNotNull(safeResp.getBody());
        assertEquals("anna", safeResp.getBody().getUserId());

        // Проверка границ leadTimeMinutes [1, 43200]
        var clamped = notificationService.updateSettingsForTrip(
            "anna",
            "trip-bounds",
            List.of(
                new NotificationSettingDto(NotificationType.TRIP_START, -15, true),
                new NotificationSettingDto(NotificationType.ITINERARY_EVENT, 999999, true)
            )
        );
        int tripStartLead = clamped.stream()
            .filter(s -> s.getEventType() == NotificationType.TRIP_START)
            .findFirst().orElseThrow().getLeadTimeMinutes();
        int itinLead = clamped.stream()
            .filter(s -> s.getEventType() == NotificationType.ITINERARY_EVENT)
            .findFirst().orElseThrow().getLeadTimeMinutes();
        assertEquals(1, tripStartLead);
        assertEquals(43200, itinLead);

        assertEquals(
            HttpStatus.BAD_REQUEST,
            notificationController.getTripNotificationSettings("../bad", "anna").getStatusCode()
        );

        // Добавление пользовательского события в маршрут и мгновенная проверка планировщиком
        TripEventCreateRequest eventReq = new TripEventCreateRequest();
        eventReq.setTitle("Экскурсия в горы");
        eventReq.setType(NotificationType.ITINERARY_EVENT);
        eventReq.setOffsetMinutes(10);
        eventReq.setTimeZone("Asia/Barnaul");
        var eventResp = notificationController.createTripEvent("altai", eventReq, "custom-route-user");
        assertEquals(HttpStatus.CREATED, eventResp.getStatusCode());
        assertNotNull(eventResp.getBody());
        assertEquals("ITINERARY", eventResp.getBody().getTargetType());
        assertTrue(
            notificationService.getNotifications("custom-route-user").stream()
                .anyMatch(n -> "Экскурсия в горы".equals(n.getTitle()))
        );
    }
}
