package com.travelsplit.notifications.dto;

import com.travelsplit.notifications.model.Notification;
import com.travelsplit.notifications.model.NotificationType;

import java.time.Instant;

public class NotificationResponse {
    private Long id;
    private String userId;
    private String tripId;
    private NotificationType type;
    private String typeDisplayName;
    private String iconType;
    private String targetType;
    private String targetId;
    private String title;
    private String message;
    private Instant scheduledFor;
    private Instant deliveredAt;
    private boolean isRead;
    private int repeatCount;

    public static NotificationResponse fromEntity(Notification entity) {
        NotificationResponse dto = new NotificationResponse();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUserId());
        dto.setTripId(entity.getTripId());
        dto.setType(entity.getType());
        dto.setTypeDisplayName(entity.getType().getDisplayName());
        dto.setIconType(entity.getType().getIconType());
        dto.setTargetType(entity.getTargetType());
        dto.setTargetId(entity.getTargetId());
        dto.setTitle(entity.getTitle());
        dto.setMessage(entity.getMessage());
        dto.setScheduledFor(entity.getScheduledFor());
        dto.setDeliveredAt(entity.getDeliveredAt());
        dto.setRead(entity.isRead());
        dto.setRepeatCount(entity.getRepeatCount());
        return dto;
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

    public String getTypeDisplayName() {
        return typeDisplayName;
    }

    public void setTypeDisplayName(String typeDisplayName) {
        this.typeDisplayName = typeDisplayName;
    }

    public String getIconType() {
        return iconType;
    }

    public void setIconType(String iconType) {
        this.iconType = iconType;
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
}
