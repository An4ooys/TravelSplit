package com.travelsplit.notifications.model;

import jakarta.persistence.*;

@Entity
@Table(name = "notification_settings", uniqueConstraints = {
    @UniqueConstraint(name = "uk_user_trip_event", columnNames = {"user_id", "trip_id", "event_type"})
})
public class NotificationSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "trip_id", nullable = false)
    private String tripId;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private NotificationType eventType;

    @Column(name = "lead_time_minutes", nullable = false)
    private int leadTimeMinutes;

    @Column(name = "is_enabled", nullable = false)
    private boolean enabled;

    public NotificationSetting() {
    }

    public NotificationSetting(String userId, String tripId, NotificationType eventType, int leadTimeMinutes, boolean enabled) {
        this.userId = userId;
        this.tripId = tripId;
        this.eventType = eventType;
        this.leadTimeMinutes = leadTimeMinutes;
        this.enabled = enabled;
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

    public NotificationType getEventType() {
        return eventType;
    }

    public void setEventType(NotificationType eventType) {
        this.eventType = eventType;
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
