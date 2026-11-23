package com.travelsplit.trips.service;

import com.travelsplit.notifications.model.NotificationType;
import com.travelsplit.trips.model.TripEvent;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class TripEventService {

    private static final int MAX_CUSTOM_EVENTS = 50;
    private final List<TripEvent> customEvents = new CopyOnWriteArrayList<>();

    public List<TripEvent> getAllUpcomingEvents() {
        List<TripEvent> events = new ArrayList<>();
        Instant now = Instant.now();

        ZoneId altaiZone = ZoneId.of("Asia/Barnaul");
        ZoneId norwayZone = ZoneId.of("Europe/Oslo");
        ZoneId swissZone = ZoneId.of("Europe/Zurich");
        List<String> altaiParticipants = Arrays.asList("anna", "maria", "dmitry");
        List<String> norwayParticipants = Arrays.asList("anna", "ivan", "maria");
        List<String> swissParticipants = Arrays.asList("anna", "dmitry");

        // События для поездки на Алтай
        events.add(new TripEvent(
            "trip-altai-start",
            "altai",
            "Алтай",
            "Начало поездки «Алтай»",
            "Поездка начинается скоро. Проверьте снаряжение и билеты на поезд.",
            NotificationType.TRIP_START,
            "TRIP",
            "altai",
            now.plus(18, ChronoUnit.HOURS),
            altaiZone,
            altaiParticipants
        ));

        events.add(new TripEvent(
            "booking-altai-train",
            "altai",
            "Алтай",
            "Отправление поезда до Барнаула",
            "Поезд отправляется через 45 минут с Казанского вокзала. Вагон 06, места 12–14.",
            NotificationType.TRANSPORT_DEPARTURE,
            "BOOKING",
            "booking-altai-train",
            now.plus(45, ChronoUnit.MINUTES),
            altaiZone,
            altaiParticipants
        ));

        events.add(new TripEvent(
            "booking-altai-hotel-checkin",
            "altai",
            "Алтай",
            "Заселение в домик у озера",
            "Заезд в домик с 14:00, ключи у администратора базы.",
            NotificationType.ACCOMMODATION_CHECKIN,
            "BOOKING",
            "booking-altai-hotel-checkin",
            now.plus(6, ChronoUnit.HOURS),
            altaiZone,
            altaiParticipants
        ));

        events.add(new TripEvent(
            "booking-altai-hotel-checkout",
            "altai",
            "Алтай",
            "Выселение из домика у озера",
            "Сдача домика до 12:00 перед выездом на вокзал.",
            NotificationType.ACCOMMODATION_CHECKOUT,
            "BOOKING",
            "booking-altai-hotel-checkout",
            now.plus(6, ChronoUnit.DAYS),
            altaiZone,
            altaiParticipants
        ));

        events.add(new TripEvent(
            "itin-altai-lakes",
            "altai",
            "Алтай",
            "Тропа к Мультинским озёрам",
            "Выход на маршрут через 20 минут. Напоминание: взять трекинговые палки и воду.",
            NotificationType.ITINERARY_EVENT,
            "ITINERARY",
            "itin-altai-lakes",
            now.plus(20, ChronoUnit.MINUTES),
            altaiZone,
            altaiParticipants
        ));

        // События для поездки в Норвегию
        events.add(new TripEvent(
            "trip-norway-start",
            "norway",
            "Норвегия",
            "Начало поездки «Норвегия»",
            "Скоро старт путешествия на Лофотены. Проверьте документы и билеты.",
            NotificationType.TRIP_START,
            "TRIP",
            "norway",
            now.plus(4, ChronoUnit.DAYS),
            norwayZone,
            norwayParticipants
        ));

        events.add(new TripEvent(
            "booking-norway-ferry",
            "norway",
            "Норвегия",
            "Отправление парома по фьордам",
            "Паром Будё — Москенес отправляется через 1 час. Регистрация автомобилей заканчивается за 30 минут.",
            NotificationType.TRANSPORT_DEPARTURE,
            "BOOKING",
            "booking-norway-ferry",
            now.plus(55, ChronoUnit.MINUTES),
            norwayZone,
            norwayParticipants
        ));

        events.add(new TripEvent(
            "booking-norway-lodge",
            "norway",
            "Норвегия",
            "Заселение в дом у фьорда",
            "Заселение доступно с 15:00. Код от кейбокса отправлен в чат поездки.",
            NotificationType.ACCOMMODATION_CHECKIN,
            "BOOKING",
            "booking-norway-lodge",
            now.plus(3, ChronoUnit.HOURS),
            norwayZone,
            norwayParticipants
        ));

        events.add(new TripEvent(
            "booking-norway-checkout",
            "norway",
            "Норвегия",
            "Выселение из дома у фьорда",
            "Чек-аут до 11:00. Не забудьте оставить ключ в сейфе.",
            NotificationType.ACCOMMODATION_CHECKOUT,
            "BOOKING",
            "booking-norway-checkout",
            now.plus(7, ChronoUnit.DAYS),
            norwayZone,
            norwayParticipants
        ));

        events.add(new TripEvent(
            "itin-norway-reine",
            "norway",
            "Норвегия",
            "Прогулка к мысу Рейнебринген",
            "Подъём на смотровую площадку, возьмите ветровку и термос.",
            NotificationType.ITINERARY_EVENT,
            "ITINERARY",
            "itin-norway-reine",
            now.plus(2, ChronoUnit.DAYS),
            norwayZone,
            norwayParticipants
        ));

        // События для поездки в Швейцарию
        events.add(new TripEvent(
            "trip-swiss-start",
            "switzerland",
            "Швейцария",
            "Начало поездки «Швейцария»",
            "Скоро отправление в Бернский Оберланд.",
            NotificationType.TRIP_START,
            "TRIP",
            "switzerland",
            now.plus(10, ChronoUnit.DAYS),
            swissZone,
            swissParticipants
        ));

        events.add(new TripEvent(
            "booking-swiss-train",
            "switzerland",
            "Швейцария",
            "Поезд до Гриндельвальда",
            "Отправление панорамного поезда с платформы 4.",
            NotificationType.TRANSPORT_DEPARTURE,
            "BOOKING",
            "booking-swiss-train",
            now.plus(11, ChronoUnit.DAYS),
            swissZone,
            swissParticipants
        ));

        events.add(new TripEvent(
            "itin-swiss-trail",
            "switzerland",
            "Швейцария",
            "Прогулка по альпийской тропе",
            "Маршрут Меннлихен — Клайне-Шайдегг.",
            NotificationType.ITINERARY_EVENT,
            "ITINERARY",
            "itin-swiss-trail",
            now.plus(12, ChronoUnit.DAYS),
            swissZone,
            swissParticipants
        ));

        events.addAll(customEvents);
        return events;
    }

    public synchronized void addCustomEvent(TripEvent event) {
        while (customEvents.size() >= MAX_CUSTOM_EVENTS) {
            customEvents.remove(0);
        }
        customEvents.add(event);
    }
}
