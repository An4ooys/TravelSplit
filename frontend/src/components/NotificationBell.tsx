import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fetchNotifications, markAsRead, markAsUnread, markAllAsRead, subscribeToNotificationStream } from '../api/notifications';
import { NotificationItem } from '../types/notification';
import NotificationDropdown from './NotificationDropdown';

interface Props {
  currentUserId: string;
  onNavigateToSection: (targetType: string, targetId: string, tripId?: string) => void;
  onToast?: (message: string) => void;
}

export const NotificationBell: React.FC<Props> = ({ currentUserId, onNavigateToSection, onToast }) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const onToastRef = useRef(onToast);
  onToastRef.current = onToast;
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;
  const currentUserRef = useRef(currentUserId);
  currentUserRef.current = currentUserId;
  const loadSeqRef = useRef(0);
  const toastedKeysRef = useRef<Set<string>>(new Set());

  const notifyOnce = useCallback((item: NotificationItem) => {
    const key = `${item.id}:${item.repeatCount}`;
    if (toastedKeysRef.current.has(key)) return;
    toastedKeysRef.current.add(key);
    const prefix = item.repeatCount > 0 ? 'Повторное уведомление' : 'Новое уведомление';
    onToastRef.current?.(`${prefix}: «${item.title}»`);
  }, []);

  const loadNotifications = useCallback(async () => {
    const seq = ++loadSeqRef.current;
    const requestedUser = currentUserId;
    setLoading(true);
    setError(null);
    try {
      const items = await fetchNotifications(requestedUser);
      if (seq !== loadSeqRef.current || currentUserRef.current !== requestedUser) {
        return;
      }
      setNotifications(items);
      setUnreadCount(items.filter(n => !n.read).length);
    } catch (err) {
      if (seq !== loadSeqRef.current || currentUserRef.current !== requestedUser) {
        return;
      }
      console.error(err);
      setError('Не удалось загрузить уведомления');
    } finally {
      if (seq === loadSeqRef.current) {
        setLoading(false);
      }
    }
  }, [currentUserId]);

  useEffect(() => {
    loadSeqRef.current++;
    setNotifications([]);
    setUnreadCount(0);
    setError(null);
    const unsubscribe = subscribeToNotificationStream(currentUserId, {
      onUnreadCount: (count) => setUnreadCount(Math.max(0, count)),
      onNotification: (incoming) => {
        setNotifications(prev => [incoming, ...prev.filter(n => n.id !== incoming.id)]);
        notifyOnce(incoming);
      },
      onNotificationUpdated: (updated) => {
        setNotifications(prev => prev.map(n => (n.id === updated.id ? updated : n)));
      },
      onAllRead: () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      },
      onReconnect: () => {
        if (isOpenRef.current) {
          loadNotifications();
        }
      },
    });
    return unsubscribe;
  }, [currentUserId, loadNotifications]);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, loadNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };

  const handleMarkAsRead = async (id: number) => {
    const targetUser = currentUserId;
    try {
      const updated = await markAsRead(id, targetUser);
      if (currentUserRef.current !== targetUser) return;
      setNotifications(prev => {
        const next = prev.map(n => (n.id === id ? updated : n));
        setUnreadCount(next.filter(n => !n.read).length);
        return next;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAsUnread = async (id: number) => {
    const targetUser = currentUserId;
    try {
      const updated = await markAsUnread(id, targetUser);
      if (currentUserRef.current !== targetUser) return;
      setNotifications(prev => {
        const next = [updated, ...prev.filter(n => n.id !== id)];
        setUnreadCount(next.filter(n => !n.read).length);
        return next;
      });
      notifyOnce(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    const targetUser = currentUserId;
    try {
      await markAllAsRead(targetUser);
      if (currentUserRef.current !== targetUser) return;
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleItemClick = (item: NotificationItem) => {
    if (!item.read) {
      handleMarkAsRead(item.id);
    }
    onNavigateToSection(item.targetType, item.targetId, item.tripId);
    setIsOpen(false);
  };

  return (
    <div className="notification-bell-container" ref={containerRef}>
      <button
        type="button"
        className={`bell-button ${isOpen ? 'active' : ''}`}
        onClick={handleToggle}
        aria-label="Уведомления"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Уведомления"
      >
        <svg
          className="bell-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {unreadCount > 0 && (
          <span className="unread-badge animate-pop">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          loading={loading}
          error={error}
          onMarkRead={handleMarkAsRead}
          onMarkUnread={handleMarkAsUnread}
          onMarkAllRead={handleMarkAllRead}
          onItemClick={handleItemClick}
          onRefresh={loadNotifications}
        />
      )}
    </div>
  );
};

export default NotificationBell;
