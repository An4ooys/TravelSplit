import { NotificationItem, NotificationSetting, NotificationType, UnreadCountResponse } from '../types/notification';

const API_BASE = '/api';

export async function fetchNotifications(userId: string): Promise<NotificationItem[]> {
  const res = await fetch(`${API_BASE}/me/notifications`, {
    headers: { 'X-Demo-User-Id': userId }
  });
  if (!res.ok) throw new Error('Ошибка загрузки уведомлений');
  return res.json();
}

export async function markAsRead(id: number, userId: string): Promise<NotificationItem> {
  const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
    method: 'PATCH',
    headers: { 'X-Demo-User-Id': userId }
  });
  if (!res.ok) throw new Error('Ошибка отметки о прочтении');
  return res.json();
}

export async function markAsUnread(id: number, userId: string): Promise<NotificationItem> {
  const res = await fetch(`${API_BASE}/notifications/${id}/unread`, {
    method: 'PATCH',
    headers: { 'X-Demo-User-Id': userId }
  });
  if (!res.ok) throw new Error('Ошибка отметки о непрочтении');
  return res.json();
}

export async function markAllAsRead(userId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/me/notifications/read-all`, {
    method: 'PATCH',
    headers: { 'X-Demo-User-Id': userId }
  });
  if (!res.ok) throw new Error('Ошибка отметки всех прочитанными');
}

export async function fetchNotificationSettings(tripId: string, userId: string): Promise<NotificationSetting[]> {
  const res = await fetch(`${API_BASE}/trips/${encodeURIComponent(tripId)}/notification-settings`, {
    headers: { 'X-Demo-User-Id': userId }
  });
  if (!res.ok) throw new Error('Ошибка загрузки настроек');
  return res.json();
}

export async function saveNotificationSettings(
  tripId: string,
  settings: NotificationSetting[],
  userId: string
): Promise<NotificationSetting[]> {
  const res = await fetch(`${API_BASE}/trips/${encodeURIComponent(tripId)}/notification-settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Demo-User-Id': userId
    },
    body: JSON.stringify({ settings })
  });
  if (!res.ok) throw new Error('Ошибка сохранения настроек');
  return res.json();
}

export interface CreateTripEventPayload {
  title: string;
  description?: string;
  type: NotificationType;
  offsetMinutes: number;
  timeZone: string;
}

export async function createTripEvent(
  tripId: string,
  payload: CreateTripEventPayload,
  userId: string
): Promise<{ id: string; title: string }> {
  const res = await fetch(`${API_BASE}/trips/${encodeURIComponent(tripId)}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Demo-User-Id': userId
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Не удалось добавить событие в маршрут');
  return res.json();
}

export interface StreamHandlers {
  onUnreadCount: (count: number) => void;
  onNotification: (item: NotificationItem) => void;
  onNotificationUpdated?: (item: NotificationItem) => void;
  onAllRead?: () => void;
  onReconnect?: () => void;
}

function addJsonListener<T>(
  source: EventSource,
  eventName: string,
  handler?: (payload: T) => void
): void {
  if (!handler) return;
  source.addEventListener(eventName, (event: MessageEvent) => {
    try {
      handler(JSON.parse(event.data) as T);
    } catch {
    }
  });
}

export function subscribeToNotificationStream(
  userId: string,
  handlers: StreamHandlers
): () => void {
  const url = `${API_BASE}/me/notifications/stream?userId=${encodeURIComponent(userId)}`;
  const source = new EventSource(url);
  let openedOnce = false;

  source.onopen = () => {
    if (openedOnce) {
      handlers.onReconnect?.();
    }
    openedOnce = true;
  };

  addJsonListener<UnreadCountResponse>(source, 'unread_count', (data) => {
    handlers.onUnreadCount(data.unreadCount);
  });
  addJsonListener<NotificationItem>(source, 'notification', handlers.onNotification);
  addJsonListener<NotificationItem>(source, 'notification_updated', handlers.onNotificationUpdated);

  source.addEventListener('all_read', () => {
    handlers.onAllRead?.();
  });

  return () => {
    source.close();
  };
}
