# TravelSplit Telegram Bot (Python)

Асинхронный Telegram-бот (`AsyncTeleBot`, `aiohttp`, `asyncpg`) для сервиса путешествий TravelSplit, работающий напрямую с общей базой данных PostgreSQL (`travelsplit`).

## Как бот работает с PostgreSQL
- **Единая БД без отдельной SQLite**: бот подключается к общей PostgreSQL через пул соединений `asyncpg` и использует таблицы:
  - `notifications` — читает уведомления и отмечает `is_read = TRUE` при нажатии `✅ Прочитано` (после чего сообщение удаляется из чата);
  - `telegram_chat_bindings` — хранит привязки Telegram `chat_id` к пользователям;
  - `telegram_reminders` — хранит персональные напоминания (`/remind`, перенос времени);
  - `telegram_delivered_notifications` — гарантирует идемпотентную доставку (ровно 1 раз на чат);
  - `users`, `trips`, `bookings`, `itinerary_items` — источник данных для `/link` и `/trips`.
- **Мгновенная доставка (`LISTEN / NOTIFY`)**: при вставке записи в `notifications` срабатывает PostgreSQL-триггер `trg_notifications_after_insert` (`pg_notify('new_notification', ...)`), и бот сразу отправляет сообщение пользователю (плюс догон непрочитанных при старте и реконнекте).
- **Обратная синхронизация с сайтом**: при отметке прочтения в Telegram бот обновляет `notifications.is_read` в PostgreSQL и дополнительно уведомляет бэкенд (`PATCH /api/notifications/{id}/read`) для обновления колокольчика на сайте по SSE.

## Меню, команды и напоминания
- Главное меню (`/start`, `/menu`): **Аккаунт**, **Поездки**, **Уведомления** (только чтение), **Напоминания**.
- `/link [имя]` — привязать аккаунт (список подтягивается из `users`, по умолчанию `anna`, `maria`, `dmitry`, `ivan`).
- `/trips` — предстоящие поездки, бронирования и пункты маршрута из PostgreSQL (с fallback на backend API / демо).
- `/remind [текст] [время]` — создать напоминание (`15m`, `2h`, `18:30` или `18:30 28 11 2026`; без указания дня, месяца или года подставляются текущие).
- `/reminders` — список активных напоминаний, создание новых и управление каждым (`🕒 Перенести время`, `✅ Выполнено`, `🗑 Удалить`).

---

## Установка и запуск

### 1. Поднимите общую базу данных PostgreSQL (из корня репозитория)
```bash
docker compose up -d
```

### 2. Установите зависимости бота
```bash
pip install -r requirements.txt
```

### 3. Настройте `.env`
```bash
cp .env.example .env
```
```ini
BOT_TOKEN=your_telegram_bot_token_here
DATABASE_URL=postgresql://travelsplit:travelsplit@127.0.0.1:5432/travelsplit
BACKEND_URL=http://localhost:8080
BOT_WEBHOOK_HOST=0.0.0.0
BOT_WEBHOOK_PORT=8081
WEBHOOK_SECRET=
TELEGRAM_WEBHOOK_URL=
```

### 4. Запустите бота
```bash
python3 bot.py
```
