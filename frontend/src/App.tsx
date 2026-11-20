import { useEffect, useState, type MouseEvent } from 'react';
import ThemeArc, { times, type TimeOfDay } from './ThemeArc';
import TripPage from './TripPage';
import Appearance, { landscapes, fonts } from './Appearance';
import Scenery from './Scenery';
import AuthModal from './AuthModal';
import ProfileMenu from './ProfileMenu';
import {
  getInitialUser,
  setCurrentUser as setCurrentUserStorage,
  logoutUser,
  type User,
} from './auth';

import { trips } from './trips';

function initialTime(): TimeOfDay {
  const saved = window.localStorage.getItem('travelsplit-time');
  if (times.some((time) => time === saved)) return saved as TimeOfDay;
  const configured = import.meta.env.VITE_DEFAULT_TIME;
  return times.some((time) => time === configured) ? (configured as TimeOfDay) : 'morning';
}

function tripIdFromPath() {
  const match = window.location.pathname.match(/^\/trips\/([a-z0-9-]+)\/?$/);
  return match && trips.some((trip) => trip.id === match[1]) ? match[1] : null;
}

function isPlainClick(event: MouseEvent<HTMLAnchorElement>) {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

export default function App() {
  const [landscape, setLandscape] = useState(() => {
    const saved =
      localStorage.getItem('travelsplit-landscape') ||
      import.meta.env.VITE_DEFAULT_BACKGROUND;
    return landscapes.some((item) => item.id === saved) ? saved : 'mist';
  });
  const [font, setFont] = useState(
    () => localStorage.getItem('travelsplit-font') || 'sans'
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [motion, setMotion] = useState(
    () => localStorage.getItem('travelsplit-motion') !== 'off'
  );

  // Auth & Profile state
  const [currentUser, setCurrentUser] = useState<User | null>(getInitialUser);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showAllTrips, setShowAllTrips] = useState(false);

  useEffect(() => {
    localStorage.setItem('travelsplit-landscape', landscape);
    localStorage.setItem('travelsplit-font', font);
    localStorage.setItem('travelsplit-motion', motion ? 'on' : 'off');
  }, [landscape, font, motion]);

  const [time, setTime] = useState<TimeOfDay>(initialTime);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(tripIdFromPath);
  const selectedTrip = trips.find((trip) => trip.id === selectedTripId);

  // Trips filtering based on user
  const userTrips = currentUser
    ? trips.filter((trip) =>
        trip.members.some(
          (m) => m.username.toLowerCase() === currentUser.username.toLowerCase()
        )
      )
    : [];

  const visibleTrips =
    currentUser && !showAllTrips && userTrips.length > 0 ? userTrips : trips;
  const featuredTrip = visibleTrips[0];

  useEffect(() => {
    window.localStorage.setItem('travelsplit-time', time);
    document.documentElement.dataset.theme = time;
  }, [time]);

  useEffect(() => {
    const syncLocation = () => setSelectedTripId(tripIdFromPath());
    window.addEventListener('popstate', syncLocation);
    return () => window.removeEventListener('popstate', syncLocation);
  }, []);

  useEffect(() => {
    document.title = selectedTrip
      ? `${selectedTrip.place} — TravelSplit`
      : 'TravelSplit — мои поездки';
  }, [selectedTrip]);

  function openTrip(event: MouseEvent<HTMLAnchorElement>, id: string) {
    if (!isPlainClick(event)) return;
    event.preventDefault();
    window.history.pushState(null, '', `/trips/${id}`);
    setSelectedTripId(id);
    window.scrollTo(0, 0);
  }

  function closeTrip(event: MouseEvent<HTMLAnchorElement>) {
    if (!isPlainClick(event)) return;
    event.preventDefault();
    window.history.pushState(null, '', '/');
    setSelectedTripId(null);
    window.scrollTo(0, 0);
  }

  function handleSwitchUser(user: User) {
    setCurrentUser(user);
    setCurrentUserStorage(user);
  }

  function handleLogout() {
    logoutUser();
    setCurrentUser(null);
    setProfileMenuOpen(false);
  }

  const userFirstName = currentUser ? currentUser.name.split(' ')[0] : '';

  return (
    <div
      className={`app-shell theme-${time} landscape-${landscape} ${
        motion ? '' : 'motion-paused'
      }`}
      style={{
        fontFamily:
          fonts.find((item) => item.id === font)?.family || fonts[0].family,
      }}
    >
      <Scenery landscape={landscape} time={time} motion={motion} />

      {settingsOpen && (
        <Appearance
          landscape={landscape}
          font={font}
          motion={motion}
          onLandscape={setLandscape}
          onFont={setFont}
          onMotion={() => setMotion(!motion)}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {authOpen && (
        <AuthModal
          initialTab={authTab}
          onClose={() => setAuthOpen(false)}
          onSuccess={(user) => {
            setCurrentUser(user);
            setAuthOpen(false);
          }}
        />
      )}

      <div className="page-frame">
        <header className="site-header">
          <div
            className="wordmark"
            aria-label={import.meta.env.VITE_APP_TITLE || 'TravelSplit'}
            onClick={(e) => {
              if (selectedTrip) closeTrip(e as unknown as MouseEvent<HTMLAnchorElement>);
            }}
            style={{ cursor: selectedTrip ? 'pointer' : 'default' }}
          >
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 36 36" fill="none">
                <path
                  d="M4 26.5 13.5 13l5.5 7 4.3-5.2L32 26.5H4Z"
                  stroke="currentColor"
                  strokeWidth="2.1"
                  strokeLinejoin="round"
                />
                <path
                  d="M13.5 13 16 16.2l2.3-1.1"
                  stroke="currentColor"
                  strokeWidth="2.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span>{import.meta.env.VITE_APP_TITLE || 'TravelSplit'}</span>
          </div>

          <ThemeArc value={time} onChange={setTime} />

          <div className="header-actions">
            <button
              className="appearance-trigger"
              onClick={() => setSettingsOpen(true)}
            >
              <span aria-hidden="true">◉</span> Оформление
            </button>

            {currentUser ? (
              <div style={{ position: 'relative' }}>
                <button
                  className="profile-trigger"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  aria-label={`Профиль: ${currentUser.name}`}
                  aria-expanded={profileMenuOpen}
                >
                  <span className="profile-name">{userFirstName}</span>
                  <span
                    className="profile-avatar"
                    style={{ backgroundColor: currentUser.avatarBg || '#3b6555' }}
                    aria-hidden="true"
                  >
                    {currentUser.initials}
                  </span>
                </button>

                {profileMenuOpen && (
                  <ProfileMenu
                    user={currentUser}
                    tripsCount={userTrips.length}
                    onSwitchUser={handleSwitchUser}
                    onLogout={handleLogout}
                    onClose={() => setProfileMenuOpen(false)}
                  />
                )}
              </div>
            ) : (
              <div className="guest-auth-actions">
                <button
                  className="login-trigger-btn"
                  onClick={() => {
                    setAuthTab('login');
                    setAuthOpen(true);
                  }}
                >
                  <span>Войти</span>
                </button>
                <button
                  className="signup-trigger-btn"
                  onClick={() => {
                    setAuthTab('register');
                    setAuthOpen(true);
                  }}
                >
                  <span>Регистрация</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {selectedTrip ? (
          <TripPage
            key={selectedTrip.id}
            trip={selectedTrip}
            onBack={closeTrip}
          />
        ) : (
          <main className="home-content" key="home">
            <div className="intro">
              <p className="eyebrow">TRAVELSPLIT / ВАШИ ПУТЕШЕСТВИЯ</p>
              <h1>
                Ближе к миру.
                <br />
                <em>Ближе друг к другу.</em>
              </h1>
              <p className="intro-subtitle">
                {currentUser ? (
                  <>С возвращением, {userFirstName}. Куда отправимся вместе?</>
                ) : (
                  <>Планируйте маршруты, делите расходы и сохраняйте воспоминания с друзьями.</>
                )}
              </p>
            </div>

            {!currentUser && (
              <div className="guest-banner">
                <div className="guest-banner-text">
                  <strong>Добро пожаловать в TravelSplit</strong>
                  <p>
                    Войдите или создайте аккаунт, чтобы сохранять свои поездки, делить чеки и приглашать друзей.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="login-trigger-btn"
                    onClick={() => {
                      setAuthTab('login');
                      setAuthOpen(true);
                    }}
                  >
                    Войти
                  </button>
                  <button
                    className="signup-trigger-btn"
                    onClick={() => {
                      setAuthTab('register');
                      setAuthOpen(true);
                    }}
                  >
                    Создать аккаунт →
                  </button>
                </div>
              </div>
            )}

            <section
              className="trip-section"
              aria-labelledby="trip-section-heading"
            >
              <div className="section-heading">
                <h2 id="trip-section-heading">
                  {currentUser ? 'Мои поездки' : 'Популярные маршруты'}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {currentUser && userTrips.length > 0 && userTrips.length < trips.length && (
                    <button
                      onClick={() => setShowAllTrips(!showAllTrips)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--muted)',
                        cursor: 'pointer',
                        fontSize: '11px',
                        textDecoration: 'underline',
                      }}
                    >
                      {showAllTrips ? 'Только мои поездки' : 'Показать все (демо)'}
                    </button>
                  )}
                  <span>
                    {visibleTrips.length}{' '}
                    {visibleTrips.length === 1
                      ? 'путешествие'
                      : visibleTrips.length > 1 && visibleTrips.length < 5
                      ? 'путешествия'
                      : 'путешествий'}
                  </span>
                </div>
              </div>

              {currentUser && userTrips.length === 0 && !showAllTrips ? (
                <div className="empty-trips-card">
                  <span className="empty-trips-icon" aria-hidden="true">
                    🏔️
                  </span>
                  <h3>Пока нет запланированных поездок</h3>
                  <p>
                    Вы успешно вошли как <strong>{currentUser.name}</strong> (@{currentUser.username}).
                    Друзья могут пригласить вас в поездку по вашему никнейму, либо вы можете ознакомиться с демонстрационными поездками.
                  </p>
                  <div className="empty-trips-actions">
                    <button
                      className="primary-button"
                      style={{ width: 'auto' }}
                      onClick={() => setShowAllTrips(true)}
                    >
                      Посмотреть примеры поездок
                    </button>
                  </div>
                </div>
              ) : featuredTrip ? (
                <>
                  <a
                    className="featured-trip trip-link"
                    href={`/trips/${featuredTrip.id}`}
                    onClick={(event) => openTrip(event, featuredTrip.id)}
                    aria-label={`Открыть поездку: ${featuredTrip.place}`}
                  >
                    <div className="featured-image-wrap">
                      <img
                        src={featuredTrip.image}
                        alt={`Пейзаж поездки: ${featuredTrip.place}`}
                      />
                      <span className="image-caption">Ближайшая поездка</span>
                    </div>
                    <div className="featured-copy">
                      <div className="featured-topline">
                        <span className="trip-kicker">БЛИЖАЙШЕЕ ПУТЕШЕСТВИЕ</span>
                        <span className="trip-dates">{featuredTrip.dates}</span>
                      </div>
                      <h3>{featuredTrip.place}</h3>
                      <div className="traveler-row">
                        <div
                          className="avatar-stack"
                          aria-label={`${featuredTrip.members.length} участника поездки`}
                        >
                          {featuredTrip.members.map((member, index) => (
                            <span
                              className={`traveler traveler-${index % 3}`}
                              key={member.username}
                              title={`${member.name} (@${member.username})`}
                            >
                              {member.initials}
                            </span>
                          ))}
                        </div>
                        <span>Вместе с друзьями</span>
                      </div>
                      <div className="next-plan">
                        <span className="next-icon" aria-hidden="true">
                          ✦
                        </span>
                        <div>
                          <span className="next-label">СЛЕДУЮЩЕЕ В ПЛАНЕ</span>
                          <strong>{featuredTrip.next}</strong>
                          <span>{featuredTrip.nextWhen}</span>
                        </div>
                      </div>
                    </div>
                  </a>

                  {visibleTrips.length > 1 && (
                    <div className="other-trips" aria-label="Другие поездки">
                      {visibleTrips.slice(1).map((trip) => (
                        <a
                          className="small-trip trip-link"
                          href={`/trips/${trip.id}`}
                          onClick={(event) => openTrip(event, trip.id)}
                          key={trip.id}
                          aria-label={`Открыть поездку: ${trip.place}`}
                        >
                          <img
                            src={trip.image}
                            alt={`Пейзаж поездки: ${trip.place}`}
                          />
                          <div>
                            <h3>{trip.place}</h3>
                            <p>{trip.dates}</p>
                          </div>
                        </a>
                      ))}
                      <button
                        className="future-note"
                        onClick={() => setSettingsOpen(true)}
                        aria-label="Выбрать настроение путешествия"
                      >
                        <span className="future-symbol" aria-hidden="true">
                          ＋
                        </span>
                        <span>
                          Выбрать пейзаж
                          <br />
                          для новых планов
                        </span>
                      </button>
                    </div>
                  )}
                </>
              ) : null}
            </section>
          </main>
        )}

        <footer className="site-footer">
          <span>Планы, которые хочется воплотить.</span>
          <button
            className="landscape-caption"
            onClick={() => setSettingsOpen(true)}
          >
            {landscapes.find((item) => item.id === landscape)?.name}{' '}
            <span aria-hidden="true">↗</span>
          </button>
        </footer>
      </div>
    </div>
  );
}
