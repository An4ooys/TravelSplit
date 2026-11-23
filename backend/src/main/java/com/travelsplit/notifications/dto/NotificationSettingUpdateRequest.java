package com.travelsplit.notifications.dto;

import java.util.List;

public class NotificationSettingUpdateRequest {
    private List<NotificationSettingDto> settings;

    public List<NotificationSettingDto> getSettings() {
        return settings;
    }

    public void setSettings(List<NotificationSettingDto> settings) {
        this.settings = settings;
    }
}
