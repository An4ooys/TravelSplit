package com.travelsplit.notifications.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelsplit.notifications.dto.NotificationResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class NotificationWebhookService {

    private static final Logger log = LoggerFactory.getLogger(NotificationWebhookService.class);

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final List<URI> botWebhookUris;
    private final String webhookSecret;

    public NotificationWebhookService(
            ObjectMapper objectMapper,
            @Value("${notifications.webhook.bot-url:http://127.0.0.1:8081/webhook/notifications}") String botWebhookUrl,
            @Value("${notifications.webhook.secret:}") String webhookSecret) {
        this.objectMapper = objectMapper;
        this.webhookSecret = webhookSecret != null ? webhookSecret.trim() : "";
        this.botWebhookUris = botWebhookUrl == null ? List.of() : Arrays.stream(botWebhookUrl.split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .map(URI::create)
            .filter(uri -> "http".equalsIgnoreCase(uri.getScheme()) || "https".equalsIgnoreCase(uri.getScheme()))
            .toList();
        this.httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(3))
            .build();
    }

    public void dispatchToBot(String userId, NotificationResponse notification) {
        if (botWebhookUris.isEmpty()) {
            return;
        }

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("id", notification.getId());
            payload.put("userId", userId);
            payload.put("tripId", notification.getTripId());
            payload.put("type", notification.getType() != null ? notification.getType().name() : null);
            payload.put("title", notification.getTitle());
            payload.put("description", notification.getMessage());
            payload.put("deliveredAt", notification.getDeliveredAt() != null ? notification.getDeliveredAt().toString() : null);

            String body = objectMapper.writeValueAsString(payload);

            for (URI targetUri : botWebhookUris) {
                HttpRequest.Builder reqBuilder = HttpRequest.newBuilder()
                    .uri(targetUri)
                    .timeout(Duration.ofSeconds(4))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body));

                if (!webhookSecret.isEmpty()) {
                    reqBuilder.header("X-Webhook-Secret", webhookSecret);
                }

                httpClient.sendAsync(reqBuilder.build(), HttpResponse.BodyHandlers.ofString())
                    .thenAccept(resp -> {
                        if (resp.statusCode() >= 400) {
                            log.warn("Bot webhook {} returned HTTP {}: {}", targetUri, resp.statusCode(), resp.body());
                        } else {
                            log.debug("Bot webhook {} delivered notification id={} (status={})", targetUri, notification.getId(), resp.statusCode());
                        }
                    })
                    .exceptionally(ex -> {
                        log.debug("Bot webhook delivery skipped (target unreachable at {}): {}", targetUri, ex.getMessage());
                        return null;
                    });
            }
        } catch (Exception e) {
            log.warn("Failed to serialize bot webhook payload: {}", e.getMessage());
        }
    }
}
