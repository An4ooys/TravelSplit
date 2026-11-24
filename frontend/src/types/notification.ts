export const DEMO_USERS: Record<string, string> = {
  anna: 'Анна',
  maria: 'Мария',
  dmitry: 'Дмитрий',
  ivan: 'Иван',
};

export type NotificationType =
  | 'TRIP_START'
  | 'TRANSPORT_DEPARTURE'
  | 'ACCOMMODATION_CHECKIN'
  | 'ACCOMMODATION_CHECKOUT'
  | 'ITINERARY_EVENT';

export interface NotificationItem {
  id: number;
  userId: string;
  tripId: string;
  type: NotificationType;
  typeDisplayName: string;
  iconType: string;
  targetType: 'TRIP' | 'BOOKING' | 'ITINERARY' | 'WEBHOOK';
  targetId: string;
  title: string;
  message: string;
  scheduledFor: string;
  deliveredAt: string;
  read: boolean;
  repeatCount: number;
}

export interface NotificationSetting {
  eventType: NotificationType;
  eventTypeDisplayName: string;
  leadTimeMinutes: number;
  enabled: boolean;
}

export interface UnreadCountResponse {
  unreadCount: number;
}
