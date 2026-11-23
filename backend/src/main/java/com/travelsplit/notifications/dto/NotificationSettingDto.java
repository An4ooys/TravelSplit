package com.travelsplit.notifications.dto;

import com.travelsplit.notifications.model.NotificationSetting;
import com.travelsplit.notifications.model.NotificationType;

public class NotificationSettingDto {
    private NotificationType eventType;
    private String eventTypeDisplayName;
    private int leadTimeMinutes;
    private boolean enabled;

    public NotificationSettingDto() {
    }

    public NotificationSettingDto(NotificationType eventType, int leadTimeMinutes, boolean enabled) {
        this.eventType = eventType;
        this.eventTypeDisplayName = eventType.getDisplayName();
        this.leadTimeMinutes = leadTimeMinutes;
        this.enabled = enabled;
    }

    public static NotificationSettingDto fromEntity(NotificationSetting entity) {
        NotificationSettingDto dto = new NotificationSettingDto();
        dto.setEventType(entity.getEventType());
        dto.setEventTypeDisplayName(entity.getEventType().getDisplayName());
        dto.setLeadTimeMinutes(entity.getLeadTimeMinutes());
        dto.setEnabled(entity.isEnabled());
        return dto;
    }

    public NotificationType getEventType() {
        return eventType;
    }

    public void setEventType(NotificationType eventType) {
        this.eventType = eventType;
    }

    public String getEventTypeDisplayName() {
        return eventTypeDisplayName;
    }

    public void setEventTypeDisplayName(String eventTypeDisplayName) {
        this.eventTypeDisplayName = eventTypeDisplayName;
    }

    public int getLeadTimeMinutes() {
        return leadTimeMinutes;
    }

    public void setLeadTimeMinutes(int leadTimeMinutes) {
        this.leadTimeMinutes = leadTimeMinutes;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}
