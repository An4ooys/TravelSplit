import { useEffect, useRef } from 'react';
import { DEMO_USERS, type User } from './auth';

type Props = {
  user: User;
  tripsCount: number;
  onSwitchUser: (user: User) => void;
  onLogout: () => void;
  onClose: () => void;
};

export default function ProfileMenu({
  user,
  tripsCount,
  onSwitchUser,
  onLogout,
  onClose,
}: Props) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <>
      <div className="profile-menu-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        ref={menuRef}
        className="profile-menu"
        role="dialog"
        aria-label="Профиль путешественника"
      >
        <div className="profile-menu-head">
          <div
            className="profile-menu-avatar"
            style={{ backgroundColor: user.avatarBg || '#3b6555' }}
            aria-hidden="true"
          >
            {user.initials}
          </div>
          <div className="profile-menu-meta">
            <strong>{user.name}</strong>
            <span className="username">@{user.username}</span>
            <span className="email">{user.email}</span>
          </div>
        </div>

        <div className="profile-menu-stats">
          <div className="stat-pill">
            <span>Поездки</span>
            <strong>{tripsCount}</strong>
          </div>
          <div className="stat-pill">
            <span>Статус</span>
            <strong>{user.role || 'Участник'}</strong>
          </div>
        </div>

        <div className="profile-menu-switch">
          <span className="switch-label">Быстрое переключение профиля</span>
          <div className="switch-user-list">
            {DEMO_USERS.map((demo) => {
              const isActive = demo.username.toLowerCase() === user.username.toLowerCase();
              return (
                <button
                  key={demo.id}
                  type="button"
                  className={`switch-user-btn ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    onSwitchUser(demo);
                    onClose();
                  }}
                >
                  <span
                    className="switch-avatar"
                    style={{ backgroundColor: demo.avatarBg }}
                    aria-hidden="true"
                  >
                    {demo.initials}
                  </span>
                  <span>{demo.name}</span>
                  {isActive && <small style={{ marginLeft: 'auto', opacity: 0.7 }}>активен</small>}
                </button>
              );
            })}
          </div>
        </div>

        <button type="button" className="logout-btn" onClick={onLogout}>
          <span aria-hidden="true">⎋</span>
          <span>Выйти из аккаунта</span>
        </button>
      </div>
    </>
  );
}
