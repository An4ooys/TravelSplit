import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  AVATAR_PALETTE,
  DEMO_USERS,
  computeInitials,
  loginUser,
  registerUser,
  type User,
} from './auth';

type Props = {
  initialTab?: 'login' | 'register';
  onClose: () => void;
  onSuccess: (user: User) => void;
};

export default function AuthModal({ initialTab = 'login', onClose, onSuccess }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);

  // Login form state
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regColor, setRegColor] = useState(AVATAR_PALETTE[0].color);

  // Feedback state
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement as HTMLElement | null;
    element?.showModal();
    return () => {
      element?.close();
      previous?.focus();
    };
  }, []);

  function handleTabChange(nextTab: 'login' | 'register') {
    setTab(nextTab);
    setError(null);
  }

  function handleLoginSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const user = loginUser(loginId, loginPassword);
      onSuccess(user);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Не удалось войти. Пожалуйста, проверьте данные.');
      }
    }
  }

  function handleRegisterSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const user = registerUser({
        name: regName,
        username: regUsername,
        email: regEmail,
        password: regPassword,
        avatarBg: regColor,
      });
      onSuccess(user);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Не удалось зарегистрироваться. Пожалуйста, проверьте введённые данные.');
      }
    }
  }

  function handleQuickDemoLogin(demoUser: User) {
    setError(null);
    try {
      const user = loginUser(demoUser.username);
      onSuccess(user);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    }
  }

  const previewInitials = computeInitials(regName || 'П');

  return (
    <dialog
      ref={dialog}
      className="appearance auth-dialog"
      aria-labelledby="auth-modal-title"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="auth-inner">
        <div className="auth-header">
          <div>
            <p className="eyebrow">TRAVELSPLIT ID</p>
            <h2 id="auth-modal-title">
              {tab === 'login' ? 'Вход в аккаунт' : 'Регистрация'}
            </h2>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Закрыть окно авторизации"
          >
            ×
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={tab === 'login'}
            className={`auth-tab-btn ${tab === 'login' ? 'active' : ''}`}
            onClick={() => handleTabChange('login')}
          >
            Вход
          </button>
          <button
            role="tab"
            aria-selected={tab === 'register'}
            className={`auth-tab-btn ${tab === 'register' ? 'active' : ''}`}
            onClick={() => handleTabChange('register')}
          >
            Создать аккаунт
          </button>
        </div>

        {/* Error alert */}
        {error && (
          <div className="auth-error" role="alert">
            <span aria-hidden="true">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Tab Content */}
        {tab === 'login' ? (
          <div>
            <form className="auth-form" onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label htmlFor="login-username">Имя пользователя или Email</label>
                <div className="input-wrap">
                  <input
                    id="login-username"
                    className="form-input"
                    type="text"
                    placeholder="anna или anna@travelsplit.ru"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="login-password">Пароль</label>
                <div className="input-wrap">
                  <input
                    id="login-password"
                    className="form-input"
                    type={showLoginPassword ? 'text' : 'password'}
                    placeholder="Для демо-профилей пароль не требуется"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                  >
                    {showLoginPassword ? 'Скрыть' : 'Показать'}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-submit-btn">
                <span>Войти в TravelSplit</span>
                <span aria-hidden="true">→</span>
              </button>
            </form>

            {/* Quick Demo Login Grid */}
            <div className="demo-section">
              <div className="demo-title">
                <span>Быстрый демо-вход</span>
                <span className="demo-badge">1 клик</span>
              </div>
              <div className="demo-grid">
                {DEMO_USERS.map((demo) => (
                  <button
                    key={demo.id}
                    type="button"
                    className="demo-user-card"
                    onClick={() => handleQuickDemoLogin(demo)}
                    title={`Войти как ${demo.name}`}
                  >
                    <span
                      className="demo-avatar"
                      style={{ backgroundColor: demo.avatarBg }}
                      aria-hidden="true"
                    >
                      {demo.initials}
                    </span>
                    <div className="demo-user-info">
                      <strong>{demo.name}</strong>
                      <span>@{demo.username}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Register Tab Content */
          <form className="auth-form" onSubmit={handleRegisterSubmit}>
            {/* Avatar preview with custom initials & color selection */}
            <div className="form-group">
              <label>Ваш аватар и цвет</label>
              <div className="avatar-builder">
                <div
                  className="avatar-preview-circle"
                  style={{ backgroundColor: regColor }}
                  aria-label={`Превью аватара с инициалами ${previewInitials}`}
                >
                  {previewInitials}
                </div>
                <div className="avatar-colors">
                  {AVATAR_PALETTE.map((pal) => (
                    <button
                      key={pal.id}
                      type="button"
                      className={`color-swatch ${regColor === pal.color ? 'active' : ''}`}
                      style={{ backgroundColor: pal.color }}
                      title={pal.name}
                      onClick={() => setRegColor(pal.color)}
                    />
                  ))}
                </div>
              </div>
              <span className="form-helper">
                Инициалы формируются автоматически из вашего имени
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="reg-name">Ваше имя</label>
              <input
                id="reg-name"
                className="form-input"
                type="text"
                placeholder="Например, Алексей Смирнов"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-username">Имя пользователя (username)</label>
              <div className="input-wrap">
                <input
                  id="reg-username"
                  className="form-input"
                  type="text"
                  placeholder="alex (будет @alex)"
                  value={regUsername}
                  onChange={(e) =>
                    setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))
                  }
                  required
                />
              </div>
              <span className="form-helper">
                Используется для приглашения в команды и поездки
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">Электронная почта</label>
              <input
                id="reg-email"
                className="form-input"
                type="email"
                placeholder="name@example.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-password">Пароль</label>
              <div className="input-wrap">
                <input
                  id="reg-password"
                  className="form-input"
                  type={showRegPassword ? 'text' : 'password'}
                  placeholder="Минимум 4 символа"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                >
                  {showRegPassword ? 'Скрыть' : 'Показать'}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn">
              <span>Создать аккаунт путешественника</span>
              <span aria-hidden="true">→</span>
            </button>
          </form>
        )}
      </div>
    </dialog>
  );
}
