import { useEffect, useState, type MouseEvent } from 'react';
import ConstellationCanvas from './ConstellationCanvas';
import TripPage from './TripPage';
import {
  defaultTrips,
  calculateSettlements,
  formatRubles,
  type Trip,
} from './trips';

function tripIdFromPath(): string | null {
  const match = window.location.pathname.match(/^\/trips\/([a-z0-9-]+)\/?$/);
  return match && defaultTrips.some((t) => t.id === match[1]) ? match[1] : null;
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
  const [tripsData, setTripsData] = useState<Trip[]>(defaultTrips);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(tripIdFromPath);
  const [activeTabTripId, setActiveTabTripId] = useState<string>(defaultTrips[0].id);
  const [isNewTripModalOpen, setIsNewTripModalOpen] = useState(false);

  // New trip form state
  const [newPlace, setNewPlace] = useState('');
  const [newDestination, setNewDestination] = useState('');
  const [newDates, setNewDates] = useState('');
  const [newBudget, setNewBudget] = useState('140000');

  // Sync with browser URL back/forward
  useEffect(() => {
    const handlePopState = () => {
      setSelectedTripId(tripIdFromPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const selectedTrip = tripsData.find((t) => t.id === selectedTripId) || null;
  const activeTabTrip = tripsData.find((t) => t.id === activeTabTripId) || tripsData[0];

  useEffect(() => {
    if (selectedTrip) {
      document.title = `${selectedTrip.place} — TravelSplit`;
    } else {
      document.title = 'TravelSplit — В горы вместе с друзьями';
    }
  }, [selectedTrip]);

  function handleOpenTrip(e: MouseEvent<HTMLAnchorElement>, id: string) {
    if (!isPlainClick(e)) return;
    e.preventDefault();
    window.history.pushState(null, '', `/trips/${id}`);
    setSelectedTripId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleBackToHome(e: MouseEvent<HTMLAnchorElement>) {
    if (!isPlainClick(e)) return;
    e.preventDefault();
    window.history.pushState(null, '', '/');
    setSelectedTripId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleUpdateTrip(updatedTrip: Trip) {
    setTripsData((prev) =>
      prev.map((t) => (t.id === updatedTrip.id ? updatedTrip : t))
    );
  }

  function handleCreateTrip(e: React.FormEvent) {
    e.preventDefault();
    if (!newPlace.trim()) return;

    const id = newPlace.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `trip-${Date.now()}`;
    const budgetNum = parseFloat(newBudget) || 120000;

    const created: Trip = {
      id,
      place: newPlace.trim(),
      destination: newDestination.trim() || `${newPlace.trim()}, Россия`,
      dates: newDates.trim() || 'Июль 2027',
      duration: '7 дней в пути',
      description: 'Новый маршрут нашей компании. Палатки, горные перевалы, костры под звездами и чистый воздух.',
      image: '/images/cover-altai.png',
      next: 'Сбор рюкзаков и выезд',
      nextWhen: 'День 1 · 08:00',
      budget: budgetNum,
      members: [
        {
          name: 'Аня',
          role: 'Маршруты и вдохновение',
          initials: 'АН',
          color: '#8052ff',
          duty: 'Карты и смотровые площадки',
        },
        {
          name: 'Дима',
          role: 'Костер, палатки и авто',
          initials: 'ДМ',
          color: '#15846e',
          duty: 'Снаряжение и стоянки',
        },
      ],
      expenses: [
        {
          id: `init-${Date.now()}`,
          title: 'Аванс за домик на базе',
          paidBy: 'Аня',
          date: 'Сегодня',
          amount: Math.round(budgetNum * 0.25),
          category: 'Жилье',
        },
      ],
    };

    setTripsData((prev) => [created, ...prev]);
    setActiveTabTripId(created.id);
    setIsNewTripModalOpen(false);
    setNewPlace('');
    setNewDestination('');
    setNewDates('');
  }

  const activeSettlements = calculateSettlements(activeTabTrip);

  return (
    <div className="app-shell">
      <div className="page-frame">
        {/* Top Minimal Navigation Bar */}
        <header className="site-header" role="banner">
          <a
            href="/"
            className="logo-lockup"
            onClick={handleBackToHome}
            aria-label="TravelSplit главная"
          >
            {/* Triangular Mountain Glyph Icon with violet-to-teal gradient */}
            <span className="logo-mark" aria-hidden="true">
              <svg viewBox="0 0 28 28" fill="none">
                <defs>
                  <linearGradient id="dala-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8052ff" />
                    <stop offset="100%" stopColor="#15846e" />
                  </linearGradient>
                </defs>
                {/* Mountain Ridge Icon */}
                <path
                  d="M14 4L25 23H3L14 4Z"
                  stroke="url(#dala-logo-grad)"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 4L19 16L15 14L10 23"
                  stroke="#ffb829"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="logo-text">TravelSplit</span>
          </a>

          {!selectedTrip && (
            <nav aria-label="Основная навигация">
              <ul className="nav-links">
                <li>
                  <a href="#trips" className="nav-link">Поездки</a>
                </li>
                <li>
                  <a href="#split" className="nav-link">Общий котел</a>
                </li>
                <li>
                  <a href="#friends" className="nav-link">Компания</a>
                </li>
              </ul>
            </nav>
          )}

          <div className="header-cta-group">
            <button
              className="btn-primary"
              onClick={() => setIsNewTripModalOpen(true)}
              aria-label="Создать поездку"
            >
              Новая поездка
            </button>
          </div>
        </header>

        {/* Selected Trip Full View OR Main Friendly Landing */}
        {selectedTrip ? (
          <TripPage
            trip={selectedTrip}
            onBack={handleBackToHome}
            onUpdateTrip={handleUpdateTrip}
          />
        ) : (
          <main id="main-content">
            {/* Hero Section with Constellation Mountain Range */}
            <section className="hero-section" aria-labelledby="hero-title">
              <div>
                <span className="kicker-amber">TRAVELSPLIT · ПУТЕШЕСТВИЯ С ДРУЗЬЯМИ</span>
                <h1 id="hero-title" className="hero-headline">
                  В горы вместе.<br />Без споров о деньгах.
                </h1>
                <p className="hero-body">
                  Собрали рюкзаки, прыгнули в машину и поехали. Кто-то снял дом, кто-то заправил бак, а сервис сам разложит всё по полочкам и посчитает, кто кому сколько переводит.
                </p>
                <div className="hero-actions">
                  <a
                    href={`/trips/${activeTabTrip.id}`}
                    className="btn-primary"
                    onClick={(e) => handleOpenTrip(e, activeTabTrip.id)}
                  >
                    Открыть поездку →
                  </a>
                  <a href="#split" className="btn-ghost">
                    Как делим расходы ↓
                  </a>
                </div>
              </div>

              {/* Animated Mountain Range Constellation */}
              <div className="hero-visual-wrap" aria-hidden="true">
                <ConstellationCanvas preset="mountains" />
              </div>
            </section>

            {/* Block 1: Наши поездки (Выбор маршрута) */}
            <section id="trips" className="content-island" aria-labelledby="trips-block-title">
              <div className="content-island-header">
                <div>
                  <span className="kicker-amber" style={{ marginBottom: '4px' }}>РАЗДЕЛ 01</span>
                  <h2 id="trips-block-title" className="heading-subsection">
                    Наши экспедиции ({tripsData.length})
                  </h2>
                </div>
                <span style={{ color: '#9a9a9a', fontSize: '14px' }}>
                  Выбирайте поездку, чтобы увидеть все детали
                </span>
              </div>

              <div className="section-two-col" style={{ margin: 0 }}>
                {/* Left: Selector */}
                <div>
                  <p className="body-light" style={{ marginBottom: '20px' }}>
                    Три направления нашей компании. Выбирайте маршрут, чтобы увидеть кто едет, сколько скинулись и какой следующий шаг в пути.
                  </p>

                  <div className="trips-nav-list" role="tablist">
                    {tripsData.map((t) => {
                      const isActive = t.id === activeTabTrip.id;
                      return (
                        <button
                          key={t.id}
                          role="tab"
                          aria-selected={isActive}
                          className={`trips-nav-item ${isActive ? 'active' : ''}`}
                          onClick={() => setActiveTabTripId(t.id)}
                        >
                          <div>
                            <div className="trips-nav-item-title">{t.place}</div>
                            <div className="trips-nav-item-dates">{t.destination}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ color: isActive ? '#ffb829' : '#9a9a9a', fontSize: '13px' }}>
                              {t.dates}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Active Trip Card */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: '#ffb829', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.35px' }}>
                      ВЫБРАННАЯ ПОЕЗДКА
                    </span>
                    <span style={{ color: '#9a9a9a', fontSize: '13px' }}>{activeTabTrip.duration}</span>
                  </div>

                  <h3 style={{ fontSize: '32px', fontWeight: 400, color: '#ffffff', marginBottom: '12px' }}>
                    {activeTabTrip.place}
                  </h3>

                  <p className="body-light" style={{ marginBottom: '20px' }}>
                    {activeTabTrip.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ffb829', fontSize: '14px', marginBottom: '24px' }}>
                    <span>✦ СЛЕДУЮЩЕЕ В ПЛАНЕ:</span>
                    <strong style={{ color: '#ffffff', fontWeight: 400 }}>{activeTabTrip.next} ({activeTabTrip.nextWhen})</strong>
                  </div>

                  <div>
                    <a
                      href={`/trips/${activeTabTrip.id}`}
                      className="btn-primary"
                      onClick={(e) => handleOpenTrip(e, activeTabTrip.id)}
                    >
                      Перейти в поездку {activeTabTrip.place} →
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Block 2: Друзья в поездке (Компания) */}
            <section id="friends" className="content-island" aria-labelledby="friends-block-title">
              <div className="content-island-header">
                <div>
                  <span className="kicker-amber" style={{ marginBottom: '4px' }}>РАЗДЕЛ 02</span>
                  <h2 id="friends-block-title" className="heading-subsection">
                    Компания в пути ({activeTabTrip.members.length} друзей)
                  </h2>
                </div>
                <span style={{ color: '#9a9a9a', fontSize: '14px' }}>
                  В поездке: {activeTabTrip.place}
                </span>
              </div>

              <p className="body-light" style={{ marginBottom: '18px' }}>
                Никакой бюрократии и строгих начальников — каждый друг берет на себя то, в чем он силен.
              </p>

              <div className="friends-grid">
                {activeTabTrip.members.map((member) => (
                  <div className="friend-card" key={member.name}>
                    <div className="friend-badge" style={{ backgroundColor: `${member.color}22`, borderColor: member.color }}>
                      {member.initials}
                    </div>
                    <h3 className="friend-name">{member.name}</h3>
                    <span className="friend-role" style={{ color: member.color }}>{member.role}</span>
                    <p className="friend-duty">{member.duty}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Block 3: Общий котел и расчеты (Сплит) */}
            <section id="split" className="content-island" aria-labelledby="split-block-title">
              <div className="content-island-header">
                <div>
                  <span className="kicker-amber" style={{ marginBottom: '4px' }}>РАЗДЕЛ 03</span>
                  <h2 id="split-block-title" className="heading-subsection">
                    Общий котел и честный расчет расходов
                  </h2>
                </div>
                <span style={{ color: '#34d399', fontSize: '14px' }}>
                  ✓ Рассчитано автоматически без споров
                </span>
              </div>

              <div className="split-summary-grid">
                <div className="split-stat-box">
                  <span className="split-stat-title">ОБЩИЙ БЮДЖЕТ</span>
                  <div className="split-stat-num">{formatRubles(activeTabTrip.budget)}</div>
                </div>
                <div className="split-stat-box">
                  <span className="split-stat-title">ПОТРАЧЕНО КОМПАНИЕЙ</span>
                  <div className="split-stat-num" style={{ color: '#8052ff' }}>
                    {formatRubles(activeSettlements.spent)}
                  </div>
                </div>
                <div className="split-stat-box">
                  <span className="split-stat-title">ДОЛЯ С КАЖДОГО</span>
                  <div className="split-stat-num" style={{ color: '#ffb829' }}>
                    {formatRubles(activeSettlements.perPerson)}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 'var(--spacing-18)' }}>
                <span className="label-violet" style={{ marginBottom: '14px' }}>
                  КТО КОМУ ПЕРЕВОДИТ, ЧТОБЫ ВСЕ БЫЛИ В РАСЧЕТЕ:
                </span>

                <div className="settlement-card-list">
                  {activeSettlements.settlements.length === 0 ? (
                    <p style={{ color: '#9a9a9a', fontStyle: 'italic', padding: '8px 0' }}>
                      Все скинулись ровно, долгов нет!
                    </p>
                  ) : (
                    activeSettlements.settlements.map((s, idx) => (
                      <div className="settlement-row-card" key={idx}>
                        <div className="settlement-names">
                          <strong style={{ fontWeight: 400 }}>{s.from}</strong>
                          <span className="arrow">→</span>
                          <strong style={{ fontWeight: 400 }}>{s.to}</strong>
                        </div>
                        <strong className="settlement-cash">{formatRubles(s.amount)}</strong>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </main>
        )}

        {/* Minimal Typographic Footer */}
        <footer className="site-footer" role="contentinfo">
          <span>TravelSplit · 2027 · Горы и созвездия для настоящих друзей</span>
          <div className="footer-links">
            <a href="#main-content" className="btn-ghost">Наверх ↑</a>
          </div>
        </footer>
      </div>

      {/* New Trip Modal */}
      {isNewTripModalOpen && (
        <div className="modal-overlay" onClick={() => setIsNewTripModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="kicker-amber">НОВОЕ ПУТЕШЕСТВИЕ</span>
                <h3 className="heading-subsection">Куда едем с друзьями?</h3>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setIsNewTripModalOpen(false)}
                aria-label="Закрыть"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTrip}>
              <div className="form-field">
                <label className="form-label">НАЗВАНИЕ МАРШРУТА</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Например: Байкал или Карелия"
                  value={newPlace}
                  onChange={(e) => setNewPlace(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label className="form-label">ЛОКАЦИЯ</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Озеро Байкал, Россия"
                  value={newDestination}
                  onChange={(e) => setNewDestination(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="form-label">ДАТЫ ПОЕЗДКИ</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="12–19 июля 2027"
                  value={newDates}
                  onChange={(e) => setNewDates(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="form-label">ПРИМЕРНЫЙ БЮДЖЕТ НА КОМПАНИЮ (₽)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="140000"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                />
              </div>

              <div style={{ marginTop: 'var(--spacing-24)', display: 'flex', gap: 'var(--spacing-18)', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setIsNewTripModalOpen(false)}
                >
                  Отмена
                </button>
                <button type="submit" className="btn-primary">
                  Поехали!
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
