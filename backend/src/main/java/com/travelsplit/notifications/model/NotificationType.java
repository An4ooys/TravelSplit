package com.travelsplit.notifications.model;

public enum NotificationType {
    TRIP_START("Начало поездки", "calendar"),
    TRANSPORT_DEPARTURE("Отправление транспорта", "transport"),
    ACCOMMODATION_CHECKIN("Заселение в отель", "hotel"),
    ACCOMMODATION_CHECKOUT("Выселение из отеля", "hotel"),
    ITINERARY_EVENT("Событие из маршрута", "map-pin");

    private final String displayName;
    private final String iconType;

    NotificationType(String displayName, String iconType) {
        this.displayName = displayName;
        this.iconType = iconType;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getIconType() {
        return iconType;
    }
}
