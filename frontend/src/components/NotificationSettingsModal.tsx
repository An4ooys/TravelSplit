import React, { useState, useEffect, useRef } from 'react';
import { fetchNotificationSettings, saveNotificationSettings } from '../api/notifications';
import { DEMO_USERS, NotificationSetting, NotificationType } from '../types/notification';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  currentUserId: string;
}

const INTERVAL_OPTIONS: Record<NotificationType, { label: string; minutes: number }[]> = {
  TRIP_START: [
    { label: 'За 6 часов', minutes: 360 },
    { label: 'За 1 день', minutes: 1440 },
    { label: 'За 3 дня', minutes: 4320 },
    { label: 'За 1 неделю', minutes: 10080 },
  ],
  TRANSPORT_DEPARTURE: [
    { label: 'За 15 минут', minutes: 15 },
    { label: 'За 30 минут', minutes: 30 },
    { label: 'За 1 час', minutes: 60 },
    { label: 'За 2 часа', minutes: 120 },
    { label: 'За 1 день', minutes: 1440 },
  ],
  ACCOMMODATION_CHECKIN: [
    { label: 'За 1 час', minutes: 60 },
    { label: 'За 3 часа', minutes: 180 },
    { label: 'За 1 день', minutes: 1440 },
  ],
  ACCOMMODATION_CHECKOUT: [
    { label: 'За 1 час', minutes: 60 },
    { label: 'За 2 часа', minutes: 120 },
    { label: 'За вечер до выселения (12 ч)', minutes: 720 },
  ],
  ITINERARY_EVENT: [
    { label: 'За 15 минут', minutes: 15 },
    { label: 'За 30 минут', minutes: 30 },
    { label: 'За 1 час', minutes: 60 },
    { label: 'За 1 день', minutes: 1440 },
  ],
};

export const NotificationSettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  tripId,
  currentUserId
}) => {
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;
  const loadSeqRef = useRef(0);

  useEffect(() => {
    if (!isOpen) return;
    loadSettings();

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => {
      loadSeqRef.current++;
      window.removeEventListener('keydown', handleEscape);
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, [isOpen, tripId, currentUserId]);

  const loadSettings = async () => {
    const seq = ++loadSeqRef.current;
    setLoading(true);
    setMessage(null);
    try {
      const data = await fetchNotificationSettings(tripId, currentUserId);
      if (seq !== loadSeqRef.current || !isOpenRef.current) return;
      setSettings(data);
    } catch (err) {
      if (seq !== loadSeqRef.current || !isOpenRef.current) return;
      console.error(err);
      setMessage('Ошибка загрузки настроек');
    } finally {
      if (seq === loadSeqRef.current) {
        setLoading(false);
      }
    }
  };

  const handleToggle = (type: NotificationType) => {
    setSettings(prev =>
      prev.map(s => (s.eventType === type ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleChangeInterval = (type: NotificationType, minutes: number) => {
    setSettings(prev =>
      prev.map(s => (s.eventType === type ? { ...s, leadTimeMinutes: minutes } : s))
    );
  };

  const handleSave = async () => {
    const seq = loadSeqRef.current;
    setSaving(true);
    setMessage(null);
    try {
      await saveNotificationSettings(tripId, settings, currentUserId);
      if (seq !== loadSeqRef.current || !isOpenRef.current) return;
      setMessage('Настройки сохранены');
      closeTimerRef.current = window.setTimeout(() => {
        closeTimerRef.current = null;
        if (isOpenRef.current) {
          onCloseRef.current();
        }
      }, 800);
    } catch (err) {
      if (seq !== loadSeqRef.current || !isOpenRef.current) return;
      console.error(err);
      setMessage('Не удалось сохранить настройки');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Настройки напоминаний</h2>
            <p className="modal-subtitle">
              Пользователь: <strong>{DEMO_USERS[currentUserId] || currentUserId}</strong>
            </p>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="empty-state">Загрузка параметров...</div>
          ) : (
            <div className="settings-list">
              {settings.map(setting => {
                const options = INTERVAL_OPTIONS[setting.eventType] || [];
                return (
                  <div key={setting.eventType} className="setting-card">
                    <div className="setting-top">
                      <div className="setting-info">
                        <label className="setting-name">
                          {setting.eventTypeDisplayName}
                        </label>
                        <span className="setting-status-hint">
                          {setting.enabled ? 'Включено' : 'Выключено'}
                        </span>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={setting.enabled}
                          onChange={() => handleToggle(setting.eventType)}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>

                    {setting.enabled && (
                      <div className="setting-interval-selector">
                        <span className="interval-label">Напомнить:</span>
                        <select
                          className="interval-select"
                          value={setting.leadTimeMinutes}
                          onChange={e =>
                            handleChangeInterval(
                              setting.eventType,
                              Number(e.target.value)
                            )
                          }
                        >
                          {options.map(opt => (
                            <option key={opt.minutes} value={opt.minutes}>
                              {opt.label}
                            </option>
                          ))}
                          {!options.some(opt => opt.minutes === setting.leadTimeMinutes) && (
                            <option value={setting.leadTimeMinutes}>
                              За {setting.leadTimeMinutes} мин
                            </option>
                          )}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {message && <div className="status-banner">{message}</div>}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Отмена
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={saving || loading}
            onClick={handleSave}
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsModal;
