package com.travelsplit.notifications.service;

import com.travelsplit.notifications.dto.NotificationResponse;
import com.travelsplit.notifications.dto.UnreadCountResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class NotificationStreamService {

    private static final Logger log = LoggerFactory.getLogger(NotificationStreamService.class);
    private static final long SSE_TIMEOUT_MS = 30 * 60 * 1000L;
    private static final int MAX_EMITTERS_PER_USER = 10;
    private static final int MAX_TRACKED_USERS = 1000;

    private final Map<String, CopyOnWriteArrayList<SseEmitter>> emittersByUser = new ConcurrentHashMap<>();

    public SseEmitter subscribe(String userId, long initialUnreadCount) {
        String key = normalizeUserId(userId);
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MS);

        if (!emittersByUser.containsKey(key) && emittersByUser.size() >= MAX_TRACKED_USERS) {
            emitter.complete();
            return emitter;
        }

        CopyOnWriteArrayList<SseEmitter> list = emittersByUser.computeIfAbsent(key, k -> new CopyOnWriteArrayList<>());
        while (list.size() >= MAX_EMITTERS_PER_USER) {
            SseEmitter oldest = list.remove(0);
            try {
                oldest.complete();
            } catch (Exception ignored) {
            }
        }
        list.add(emitter);

        Runnable cleanup = () -> removeEmitter(key, emitter);
        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError(e -> cleanup.run());

        try {
            emitter.send(SseEmitter.event()
                .name("unread_count")
                .data(new UnreadCountResponse(initialUnreadCount)));
        } catch (IOException e) {
            removeEmitter(key, emitter);
        }

        return emitter;
    }

    public void publishNotification(String userId, NotificationResponse notification, long unreadCount) {
        String key = normalizeUserId(userId);
        sendToUser(key, "notification", notification);
        sendToUser(key, "unread_count", new UnreadCountResponse(unreadCount));
    }

    public void publishNotificationUpdated(String userId, NotificationResponse notification, long unreadCount) {
        String key = normalizeUserId(userId);
        sendToUser(key, "notification_updated", notification);
        sendToUser(key, "unread_count", new UnreadCountResponse(unreadCount));
    }

    public void publishAllRead(String userId) {
        String key = normalizeUserId(userId);
        sendToUser(key, "all_read", Map.of("read", true));
        sendToUser(key, "unread_count", new UnreadCountResponse(0L));
    }

    public void publishUnreadCount(String userId, long unreadCount) {
        String key = normalizeUserId(userId);
        sendToUser(key, "unread_count", new UnreadCountResponse(unreadCount));
    }

    @Scheduled(fixedRate = 25000)
    public void sendHeartbeat() {
        if (emittersByUser.isEmpty()) {
            return;
        }
        emittersByUser.forEach((userKey, emitters) -> {
            for (SseEmitter emitter : emitters) {
                try {
                    emitter.send(SseEmitter.event().comment("keepalive"));
                } catch (Exception e) {
                    removeEmitter(userKey, emitter);
                }
            }
        });
    }

    private void sendToUser(String userKey, String eventName, Object payload) {
        List<SseEmitter> emitters = emittersByUser.get(userKey);
        if (emitters == null || emitters.isEmpty()) {
            return;
        }

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name(eventName).data(payload));
            } catch (Exception e) {
                log.debug("Removing stale SSE emitter for user '{}': {}", userKey, e.getMessage());
                removeEmitter(userKey, emitter);
            }
        }
    }

    private void removeEmitter(String userKey, SseEmitter emitter) {
        CopyOnWriteArrayList<SseEmitter> list = emittersByUser.get(userKey);
        if (list != null) {
            list.remove(emitter);
            if (list.isEmpty()) {
                emittersByUser.remove(userKey, list);
            }
        }
    }

    private String normalizeUserId(String userId) {
        return userId == null ? "anna" : userId.trim().toLowerCase();
    }
}
