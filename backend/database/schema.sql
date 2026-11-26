CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_users_username UNIQUE (username)
);

CREATE INDEX idx_users_username_lower ON users (LOWER(username));

CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    owner_user_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_teams_owner FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_teams_owner ON teams (owner_user_id);

CREATE TABLE team_memberships (
    team_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (team_id, user_id),
    CONSTRAINT fk_team_memberships_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    CONSTRAINT fk_team_memberships_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_team_membership_role CHECK (role IN ('ORGANIZER', 'MEMBER'))
);

CREATE INDEX idx_team_memberships_user_id ON team_memberships (user_id);

CREATE TABLE invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL,
    inviter_user_id UUID NOT NULL,
    invitee_user_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMPTZ,
    CONSTRAINT fk_invitations_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    CONSTRAINT fk_invitations_inviter FOREIGN KEY (inviter_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_invitations_invitee FOREIGN KEY (invitee_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_invitation_status CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED')),
    CONSTRAINT chk_invitation_not_self CHECK (inviter_user_id <> invitee_user_id)
);

CREATE INDEX idx_invitations_invitee_status ON invitations (invitee_user_id, status);
CREATE INDEX idx_invitations_team_status ON invitations (team_id, status);

CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(50) UNIQUE,
    team_id UUID NOT NULL,
    title VARCHAR(150) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    starts_on DATE NOT NULL,
    ends_on DATE NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'RUB',
    budget_minor BIGINT NOT NULL DEFAULT 0,
    description TEXT,
    cover_image_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_trips_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE RESTRICT,
    CONSTRAINT chk_trips_dates CHECK (ends_on >= starts_on),
    CONSTRAINT chk_trips_budget CHECK (budget_minor >= 0)
);

CREATE INDEX idx_trips_team_id ON trips (team_id);
CREATE INDEX idx_trips_dates ON trips (starts_on, ends_on);

CREATE TABLE itinerary_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL,
    item_date DATE NOT NULL,
    item_time TIME,
    title VARCHAR(200) NOT NULL,
    location VARCHAR(255),
    notes TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_itinerary_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

CREATE INDEX idx_itinerary_trip_date ON itinerary_items (trip_id, item_date, sort_order);

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL,
    type VARCHAR(30) NOT NULL,
    title VARCHAR(200) NOT NULL,
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    reference_code VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bookings_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    CONSTRAINT chk_booking_type CHECK (type IN ('TICKET', 'ACCOMMODATION', 'TRANSPORT', 'OTHER'))
);

CREATE INDEX idx_bookings_trip_id ON bookings (trip_id);

CREATE TABLE packing_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    assigned_user_id UUID,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_by_user_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_packing_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    CONSTRAINT fk_packing_assigned_user FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_packing_completed_by FOREIGN KEY (completed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_packing_trip_id ON packing_items (trip_id);

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL,
    paid_by_user_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    amount_minor BIGINT NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'RUB',
    spent_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_expenses_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    CONSTRAINT fk_expenses_paid_by FOREIGN KEY (paid_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT chk_expenses_amount CHECK (amount_minor > 0)
);

CREATE INDEX idx_expenses_trip_id ON expenses (trip_id);
CREATE INDEX idx_expenses_paid_by ON expenses (paid_by_user_id);

CREATE TABLE expense_splits (
    expense_id UUID NOT NULL,
    user_id UUID NOT NULL,
    share_amount_minor BIGINT NOT NULL,
    PRIMARY KEY (expense_id, user_id),
    CONSTRAINT fk_expense_splits_expense FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
    CONSTRAINT fk_expense_splits_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT chk_expense_splits_share CHECK (share_amount_minor > 0)
);

CREATE INDEX idx_expense_splits_user_id ON expense_splits (user_id);

CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL,
    uploaded_by_user_id UUID NOT NULL,
    kind VARCHAR(30) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    storage_key VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100),
    file_size_bytes BIGINT,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_media_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    CONSTRAINT fk_media_uploaded_by FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT chk_media_kind CHECK (kind IN ('PHOTO', 'ATTACHMENT'))
);

CREATE INDEX idx_media_trip_id ON media (trip_id);

CREATE TABLE booking_attachments (
    booking_id UUID NOT NULL,
    media_id UUID NOT NULL,
    PRIMARY KEY (booking_id, media_id),
    CONSTRAINT fk_booking_attachments_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_attachments_media FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE
);

CREATE VIEW v_user_trip_balances AS
WITH user_paid AS (
    SELECT
        e.trip_id,
        e.paid_by_user_id AS user_id,
        COALESCE(SUM(e.amount_minor), 0) AS total_paid_minor
    FROM expenses e
    GROUP BY e.trip_id, e.paid_by_user_id
),
user_share AS (
    SELECT
        e.trip_id,
        es.user_id,
        COALESCE(SUM(es.share_amount_minor), 0) AS total_share_minor
    FROM expense_splits es
    JOIN expenses e ON e.id = es.expense_id
    GROUP BY e.trip_id, es.user_id
),
members AS (
    SELECT
        t.id AS trip_id,
        tm.user_id
    FROM trips t
    JOIN team_memberships tm ON tm.team_id = t.team_id
)
SELECT
    m.trip_id,
    m.user_id,
    COALESCE(up.total_paid_minor, 0) AS total_paid_minor,
    COALESCE(us.total_share_minor, 0) AS total_share_minor,
    (COALESCE(up.total_paid_minor, 0) - COALESCE(us.total_share_minor, 0)) AS balance_minor
FROM members m
LEFT JOIN user_paid up ON up.trip_id = m.trip_id AND up.user_id = m.user_id
LEFT JOIN user_share us ON us.trip_id = m.trip_id AND us.user_id = m.user_id;

-- Таблицы уведомлений и Telegram-бота

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    trip_id VARCHAR(255) NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    target_type VARCHAR(255) NOT NULL,
    target_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    scheduled_for TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    repeat_count INT NOT NULL DEFAULT 0,
    deduplication_key VARCHAR(255) NOT NULL,
    CONSTRAINT chk_notifications_type CHECK (
        notification_type IN (
            'TRIP_START',
            'TRANSPORT_DEPARTURE',
            'ACCOMMODATION_CHECKIN',
            'ACCOMMODATION_CHECKOUT',
            'ITINERARY_EVENT'
        )
    ),
    CONSTRAINT chk_notifications_repeat CHECK (repeat_count >= 0)
);

CREATE INDEX IF NOT EXISTS idx_user_read ON notifications (user_id, is_read);
CREATE UNIQUE INDEX IF NOT EXISTS idx_dedup_key ON notifications (deduplication_key);
CREATE INDEX IF NOT EXISTS idx_notifications_delivered ON notifications (delivered_at DESC);

CREATE TABLE IF NOT EXISTS notification_settings (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    trip_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    lead_time_minutes INT NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uk_user_trip_event UNIQUE (user_id, trip_id, event_type),
    CONSTRAINT chk_notification_settings_type CHECK (
        event_type IN (
            'TRIP_START',
            'TRANSPORT_DEPARTURE',
            'ACCOMMODATION_CHECKIN',
            'ACCOMMODATION_CHECKOUT',
            'ITINERARY_EVENT'
        )
    ),
    CONSTRAINT chk_notification_settings_lead_time CHECK (lead_time_minutes >= 1 AND lead_time_minutes <= 43200)
);

CREATE TABLE IF NOT EXISTS telegram_chat_bindings (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    chat_id BIGINT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    telegram_username VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tg_user_id ON telegram_chat_bindings (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tg_chat_id ON telegram_chat_bindings (chat_id);

CREATE TABLE IF NOT EXISTS telegram_reminders (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    chat_id BIGINT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    remind_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    notification_id BIGINT,
    snooze_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_tg_reminder_status CHECK (
        status IN ('PENDING', 'DELIVERED', 'SNOOZED', 'COMPLETED', 'CANCELLED')
    ),
    CONSTRAINT chk_tg_reminder_snooze CHECK (snooze_count >= 0)
);

CREATE INDEX IF NOT EXISTS idx_remind_status_time ON telegram_reminders (status, remind_at);
CREATE INDEX IF NOT EXISTS idx_remind_chat_status ON telegram_reminders (chat_id, status);
CREATE INDEX IF NOT EXISTS idx_remind_notification_id ON telegram_reminders (notification_id);

CREATE TABLE IF NOT EXISTS telegram_delivered_notifications (
    notification_id BIGINT NOT NULL,
    chat_id BIGINT NOT NULL,
    delivered_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (notification_id, chat_id)
);

CREATE OR REPLACE FUNCTION notify_new_notification()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify(
        'new_notification',
        json_build_object(
            'id', NEW.id,
            'user_id', NEW.user_id,
            'trip_id', NEW.trip_id,
            'notification_type', NEW.notification_type
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notifications_after_insert ON notifications;
CREATE TRIGGER trg_notifications_after_insert
    AFTER INSERT ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_notification();
