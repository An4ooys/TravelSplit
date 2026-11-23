package com.travelsplit.notifications.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_user_read", columnList = "user_id, is_read"),
    @Index(name = "idx_dedup_key", columnList = "deduplication_key", unique = true)
})
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "trip_id", nullable = false)
    private String tripId;

    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", nullable = false)
    private NotificationType type;

    @Column(name = "target_type", nullable = false)
    private String targetType;

    @Column(name = "target_id", nullable = false)
    private String targetId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "message", length = 1000, nullable = false)
    private String message;

    @Column(name = "scheduled_for")
    private Instant scheduledFor;

    @Column(name = "delivered_at", nullable = false)
    private Instant deliveredAt;

    @Column(name = "is_read", nullable = false)
    private boolean isRead;

    @Column(name = "repeat_count", nullable = false)
    private int repeatCount;

    @Column(name = "deduplication_key", nullable = false, unique = true)
    private String deduplicationKey;

    public Notification() {
    }

    public Notification(String userId, String tripId, NotificationType type, String targetType,
                        String targetId, String title, String message, Instant scheduledFor,
                        Instant deliveredAt, String deduplicationKey) {
        this.userId = userId;
        this.tripId = tripId;
        this.type = type;
        this.targetType = targetType;
        this.targetId = targetId;
        this.title = title;
        this.message = message;
        this.scheduledFor = scheduledFor;
        this.deliveredAt = deliveredAt;
        this.isRead = false;
        this.repeatCount = 0;
        this.deduplicationKey = deduplicationKey;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getTripId() {
        return tripId;
    }

    public void setTripId(String tripId) {
        this.tripId = tripId;
    }

    public NotificationType getType() {
        return type;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public String getTargetType() {
        return targetType;
    }

    public void setTargetType(String targetType) {
        this.targetType = targetType;
    }

    public String getTargetId() {
        return targetId;
    }

    public void setTargetId(String targetId) {
        this.targetId = targetId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Instant getScheduledFor() {
        return scheduledFor;
    }

    public void setScheduledFor(Instant scheduledFor) {
        this.scheduledFor = scheduledFor;
    }

    public Instant getDeliveredAt() {
        return deliveredAt;
    }

    public void setDeliveredAt(Instant deliveredAt) {
        this.deliveredAt = deliveredAt;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public int getRepeatCount() {
        return repeatCount;
    }

    public void setRepeatCount(int repeatCount) {
        this.repeatCount = repeatCount;
    }

    public String getDeduplicationKey() {
        return deduplicationKey;
    }

    public void setDeduplicationKey(String deduplicationKey) {
        this.deduplicationKey = deduplicationKey;
    }
}
