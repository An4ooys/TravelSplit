# База данных TravelSplit (PostgreSQL)

## Архитектура и ER-модель

```mermaid
erDiagram
    users ||--o{ teams : "владеет"
    users ||--o{ team_memberships : "состоит в"
    teams ||--o{ team_memberships : "включает"
    teams ||--o{ invitations : "приглашения"
    users ||--o{ invitations : "отправил"
    users ||--o{ invitations : "получил"
    teams ||--o{ trips : "создана для"
    trips ||--o{ itinerary_items : "маршрут"
    trips ||--o{ bookings : "бронирования"
    trips ||--o{ packing_items : "вещи"
    trips ||--o{ expenses : "расходы"
    trips ||--o{ media : "вложения"
    expenses ||--o{ expense_splits : "разделение"
    users ||--o{ expense_splits : "доля"
    bookings ||--o{ booking_attachments : "файлы"
    media ||--o{ booking_attachments : "прикреплен к"

    users {
        uuid id PK
        varchar username UK
        varchar display_name
        timestamptz created_at
    }

    teams {
        uuid id PK
        varchar name
        uuid owner_user_id FK
        timestamptz created_at
    }

    team_memberships {
        uuid team_id PK,FK
        uuid user_id PK,FK
        varchar role
        timestamptz joined_at
    }

    invitations {
        uuid id PK
        uuid team_id FK
        uuid inviter_user_id FK
        uuid invitee_user_id FK
        varchar status
        timestamptz created_at
        timestamptz responded_at
    }

    trips {
        uuid id PK
        varchar slug UK
        uuid team_id FK
        varchar title
        varchar destination
        date starts_on
        date ends_on
        varchar currency
        bigint budget_minor
        text description
        varchar cover_image_url
        timestamptz created_at
    }

    itinerary_items {
        uuid id PK
        uuid trip_id FK
        date item_date
        time item_time
        varchar title
        varchar location
        text notes
        int sort_order
        timestamptz created_at
    }

    bookings {
        uuid id PK
        uuid trip_id FK
        varchar type
        varchar title
        timestamptz starts_at
        timestamptz ends_at
        varchar reference_code
        text notes
        timestamptz created_at
    }

    packing_items {
        uuid id PK
        uuid trip_id FK
        varchar title
        uuid assigned_user_id FK
        boolean is_completed
        uuid completed_by_user_id FK
        timestamptz created_at
    }

    expenses {
        uuid id PK
        uuid trip_id FK
        uuid paid_by_user_id FK
        varchar title
        bigint amount_minor
        varchar currency
        timestamptz spent_at
        timestamptz created_at
    }

    expense_splits {
        uuid expense_id PK,FK
        uuid user_id PK,FK
        bigint share_amount_minor
    }

    media {
        uuid id PK
        uuid trip_id FK
        uuid uploaded_by_user_id FK
        varchar kind
        varchar original_name
        varchar storage_key
        varchar mime_type
        bigint file_size_bytes
        timestamptz uploaded_at
    }

    booking_attachments {
        uuid booking_id PK,FK
        uuid media_id PK,FK
    }
```

## Описание таблиц

### 1. `users`
Пользователи сервиса. Уникальный логин без учета регистра `LOWER(username)`.

### 2. `teams` и `team_memberships`
Группы участников поездок. Связь многие-ко-многим между пользователями и командами с ролью (`ORGANIZER`, `MEMBER`).

### 3. `invitations`
Приглашения в команду по username. Статусы: `PENDING`, `ACCEPTED`, `DECLINED`. Ограничение `chk_invitation_not_self` исключает отправку приглашения самому себе.

### 4. `trips`
Поездки с датами, валютой, бюджетом в минимальных единицах (`budget_minor`), описанием и обложкой. Ограничение `ends_on >= starts_on`.

### 5. `itinerary_items`
План поездки по дням со временем и сортировкой `sort_order`.

### 6. `bookings`
Бронирования жилья, билетов и транспорта.

### 7. `packing_items`
Списки вещей в дорогу с отметкой выполнения и назначенным участником.

### 8. `expenses` и `expense_splits`
Фиксация расходов. Суммы хранятся в целых минимальных единицах (`amount_minor`, `share_amount_minor` — копейки/центы) для исключения погрешностей чисел с плавающей точкой. Участники сплита и их доли выделены в таблицу `expense_splits`.

### 9. `media` и `booking_attachments`
Метаданные загруженных фото и документов с привязкой к поездкам и бронированиям.

### 10. `v_user_trip_balances`
Представление (SQL View) для автоматического расчета баланса каждого участника в поездке:
- `total_paid_minor`: сумма всех расходов, оплаченных участником;
- `total_share_minor`: сумма долей участника во всех расходах;
- `balance_minor`: чистый баланс (`total_paid_minor - total_share_minor`).

## Локальный запуск через Docker Compose

Запуск базы данных с автоматическим накатом схемы и демо-данных:

```bash
docker compose up -d
```

Проверка статуса контейнера:

```bash
docker compose ps
```

Подключение к базе данных через psql в контейнере:

```bash
docker compose exec -it postgres psql -U travelsplit -d travelsplit
```

Остановка контейнера:

```bash
docker compose down
```

Остановка с удалением volume:

```bash
docker compose down -v
```

## Параметры подключения

| Параметр | Значение |
| --- | --- |
| Host | `127.0.0.1` |
| Port | `5432` |
| Database | `travelsplit` |
| Username | `travelsplit` |
| Password | `travelsplit` |
| JDBC URL | `jdbc:postgresql://127.0.0.1:5432/travelsplit` |

## Расположение миграций

- DDL-схема: `backend/database/schema.sql` и `backend/src/main/resources/db/migration/V1__init_schema.sql`
- Тестовые данные: `backend/database/seed.sql` и `backend/src/main/resources/db/migration/V2__seed_demo_data.sql`
