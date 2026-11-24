import React, { useEffect, useState } from 'react';
import { NotificationItem, NotificationType } from '../types/notification';

interface Props {
  notifications: NotificationItem[];
  loading: boolean;
  error?: string | null;
  onMarkRead: (id: number) => void;
  onMarkUnread: (id: number) => void;
  onMarkAllRead: () => void;
  onItemClick: (item: NotificationItem) => void;
  onRefresh: () => void;
}

const getIcon = (type: NotificationType) => {
  switch (type) {
    case 'TRIP_START':
      return '📅';
    case 'TRANSPORT_DEPARTURE':
      return '✈️';
    case 'ACCOMMODATION_CHECKIN':
    case 'ACCOMMODATION_CHECKOUT':
      return '🏨';
    case 'ITINERARY_EVENT':
      return '📍';
    default:
      return '🔔';
  }
};

const formatTimeAgo = (dateStr: string) => {
  const ts = new Date(dateStr).getTime();
  if (Number.isNaN(ts)) return '';
  const diff = Math.max(0, Date.now() - ts);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'только что';
  if (minutes < 60) return `${minutes} мин назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.floor(hours / 24);
  return `${days} д назад`;
};

export const NotificationDropdown: React.FC<Props> = ({
  notifications,
  loading,
  error,
  onMarkRead,
  onMarkUnread,
  onMarkAllRead,
  onItemClick,
  onRefresh
}) => {
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [, setTimeTick] = useState<number>(0);

  useEffect(() => {
    const id = window.setInterval(() => setTimeTick(t => t + 1), 30000);
    return () => window.clearInterval(id);
  }, []);

  const filtered = notifications.filter(n => {
    if (filter === 'UNREAD') return !n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notification-dropdown">
      <div className="dropdown-header">
        <div className="dropdown-title-row">
          <h3 className="dropdown-title">Уведомления</h3>
          <div className="dropdown-actions">
            <button
              type="button"
              className="icon-text-btn"
              onClick={onRefresh}
              title="Обновить"
            >
              🔄
            </button>
            {unreadCount > 0 && (
              <button
                type="button"
                className="mark-all-read-btn"
                onClick={onMarkAllRead}
              >
                Прочитать все
              </button>
            )}
          </div>
        </div>

        <div className="filter-tabs">
          <button
            type="button"
            className={`tab-btn ${filter === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilter('ALL')}
          >
            Все ({notifications.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${filter === 'UNREAD' ? 'active' : ''}`}
            onClick={() => setFilter('UNREAD')}
          >
            Непрочитанные ({unreadCount})
          </button>
        </div>
      </div>

      <div className="dropdown-content">
        {loading && notifications.length === 0 ? (
          <div className="empty-state">Загрузка уведомлений...</div>
        ) : error && notifications.length === 0 ? (
          <div className="empty-state">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            {filter === 'UNREAD' ? 'Все уведомления прочитаны' : 'Уведомлений пока нет'}
          </div>
        ) : (
          <div className="notification-items-list">
            {filtered.map(item => (
              <div
                key={item.id}
                className={`notification-item ${!item.read ? 'unread' : 'read'}`}
              >
                <div
                  className="item-click-area"
                  role="button"
                  tabIndex={0}
                  onClick={() => onItemClick(item)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onItemClick(item);
                    }
                  }}
                >
                  <div className="item-icon">{getIcon(item.type)}</div>
                  <div className="item-body">
                    <div className="item-header">
                      <span className="item-type-badge">{item.typeDisplayName}</span>
                      <span className="item-time">{formatTimeAgo(item.deliveredAt)}</span>
                    </div>
                    <div className="item-title">{item.title}</div>
                    <div className="item-message">{item.message}</div>
                    {item.repeatCount > 0 && (
                      <span className="repeat-badge">Повторно ({item.repeatCount})</span>
                    )}
                  </div>
                </div>

                <div className="item-actions">
                  {!item.read ? (
                    <button
                      type="button"
                      className="read-toggle-btn mark-read"
                      onClick={() => onMarkRead(item.id)}
                    >
                      ✓ Прочитано
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="read-toggle-btn mark-unread"
                      onClick={() => onMarkUnread(item.id)}
                    >
                      ↩ Не прочитано
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="dropdown-footer">
        <span>Нажмите на уведомление для перехода к разделу</span>
      </div>
    </div>
  );
};

export default NotificationDropdown;
