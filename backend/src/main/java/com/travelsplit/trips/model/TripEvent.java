package com.travelsplit.trips.model;

import com.travelsplit.notifications.model.NotificationType;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;

public class TripEvent {
    private String id;
    private String tripId;
    private String tripTitle;
    private String title;
    private String description;
    private NotificationType type;
    private String targetType;
    private String targetId;
    private LocalDateTime localEventTime;
    private ZoneId zoneId;
    private List<String> participantUserIds;

    public TripEvent(String id, String tripId, String tripTitle, String title, String description,
                     NotificationType type, String targetType, String targetId,
                     LocalDateTime localEventTime, ZoneId zoneId, List<String> participantUserIds) {
        this.id = id;
        this.tripId = tripId;
        this.tripTitle = tripTitle;
        this.title = title;
        this.description = description;
        this.type = type;
        this.targetType = targetType;
        this.targetId = targetId;
        this.localEventTime = localEventTime;
        this.zoneId = zoneId != null ? zoneId : ZoneId.of("UTC");
        this.participantUserIds = participantUserIds;
    }

    public TripEvent(String id, String tripId, String tripTitle, String title, String description,
                     NotificationType type, String targetType, String targetId,
                     Instant instantUtc, ZoneId zoneId, List<String> participantUserIds) {
        this.id = id;
        this.tripId = tripId;
        this.tripTitle = tripTitle;
        this.title = title;
        this.description = description;
        this.type = type;
        this.targetType = targetType;
        this.targetId = targetId;
        this.zoneId = zoneId != null ? zoneId : ZoneId.of("UTC");
        this.localEventTime = LocalDateTime.ofInstant(instantUtc, this.zoneId);
        this.participantUserIds = participantUserIds;
    }

    public Instant getEventTimeUtc() {
        if (localEventTime == null) {
            return Instant.now();
        }
        ZonedDateTime zdt = localEventTime.atZone(zoneId);
        return zdt.toInstant();
    }

    public String getId() {
        return id;
    }

    public String getTripId() {
        return tripId;
    }

    public String getTripTitle() {
        return tripTitle;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public NotificationType getType() {
        return type;
    }

    public String getTargetType() {
        return targetType;
    }

    public String getTargetId() {
        return targetId;
    }

    public LocalDateTime getLocalEventTime() {
        return localEventTime;
    }

    public ZoneId getZoneId() {
        return zoneId;
    }

    public List<String> getParticipantUserIds() {
        return participantUserIds;
    }
}
