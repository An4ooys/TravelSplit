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
      {/* Scroll-driven Constellation Canvas Background */}
      <ConstellationCanvas />

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
                  <linearGradient id="ts-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8052ff" />
                    <stop offset="100%" stopColor="#15846e" />
                  </linearGradient>
                </defs>
                <path
                  d="M14 4L25 23H3L14 4Z"
                  stroke="url(#ts-logo-grad)"
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
                  <a href="#friends" className="nav-link">Компания</a>
                </li>
                <li>
                  <a href="#split" className="nav-link">Общий котел</a>
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

        {/* Selected Trip Full View OR Main Open Void Landing */}
        {selectedTrip ? (
          <TripPage
            trip={selectedTrip}
            onBack={handleBackToHome}
            onUpdateTrip={handleUpdateTrip}
          />
        ) : (
          <main id="main-content">
            {/* Hero Section — Open Void, 3D Constellation unobstructed on the right */}
            <section className="dala-section" aria-labelledby="hero-title">
              <div className="dala-two-col">
                <div className="dala-text-col">
                  <span className="kicker-amber">TRAVELSPLIT · ПУТЕШЕСТВИЯ С ДРУЗЬЯМИ</span>
                  <h1 id="hero-title" className="heading-display">
                    В горы вместе.<br />Без споров о деньгах.
                  </h1>
                  <p className="body-airy">
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
                  <div style={{ marginTop: 'var(--spacing-36)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-ash-gray)', fontSize: '13px' }}>
                    <span style={{ color: 'var(--color-saffron-spark)' }}>✦</span>
                    <span>Листайте страницу — созвездие плавно перерождается в 3D-символы каждого этапа пути</span>
                  </div>
                </div>
                {/* Visual column is pure void: background 3D canvas shines through */}
                <div className="dala-visual-col" aria-hidden="true" />
              </div>
            </section>

            {/* Section 01: Наши экспедиции */}
            <section id="trips" className="dala-section" aria-labelledby="trips-title">
              <div className="dala-two-col">
                <div className="dala-text-col">
                  <span className="kicker-amber">01 · НАШИ ЭКСПЕДИЦИИ</span>
                  <h2 id="trips-title" className="heading-section">
                    Маршруты<br />для своих
                  </h2>
                  <p className="body-muted">
                    Три экспедиции нашей компании. Выбирайте маршрут, чтобы увидеть кто едет, сколько скинулись и какой следующий шаг в пути.
                  </p>

                  <div className="trips-clean-list" role="tablist">
                    {tripsData.map((t) => {
                      const isActive = t.id === activeTabTrip.id;
                      return (
                        <button
                          key={t.id}
                          role="tab"
                          aria-selected={isActive}
                          className={`trips-clean-item ${isActive ? 'active' : ''}`}
                          onClick={() => setActiveTabTripId(t.id)}
                        >
                          <span className="trips-clean-item-name">
                            {t.place}
                            {isActive && <span style={{ color: 'var(--color-saffron-spark)', fontSize: '16px' }}>→</span>}
                          </span>
                          <span className="trips-clean-item-dates">
                            {t.destination} · {t.dates}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: 'var(--spacing-24)', padding: 'var(--spacing-18) 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '14px', color: 'var(--color-saffron-spark)' }}>
                      <span>✦ СЛЕДУЮЩИЙ ШАГ:</span>
                      <strong style={{ color: 'var(--color-bone-white)', fontWeight: 400 }}>
                        {activeTabTrip.next} ({activeTabTrip.nextWhen})
                      </strong>
                    </div>
                    <a
                      href={`/trips/${activeTabTrip.id}`}
                      className="btn-primary"
                      onClick={(e) => handleOpenTrip(e, activeTabTrip.id)}
                    >
                      Перейти в {activeTabTrip.place} →
                    </a>
                  </div>
                </div>
                {/* Visual column: 3D globe animation rotates here */}
                <div className="dala-visual-col" aria-hidden="true" />
              </div>
            </section>

            {/* Section 02: Компания в пути */}
            <section id="friends" className="dala-section" aria-labelledby="friends-title">
              <div className="dala-two-col">
                <div className="dala-text-col">
                  <span className="kicker-amber">02 · ДРУЖЕСКИЙ КРУГ</span>
                  <h2 id="friends-title" className="heading-section">
                    Только друзья.<br />Без начальников.
                  </h2>
                  <p className="body-muted">
                    В поездке у каждого своя суперсила. Никакой бюрократии: роли и обязанности распределены легко и по любви.
                  </p>

                  <div className="friends-clean-list">
                    {activeTabTrip.members.map((member) => (
                      <div className="friend-clean-row" key={member.name}>
                        <div
                          className="friend-clean-badge"
                          style={{
                            backgroundColor: `${member.color}22`,
                            borderColor: member.color,
                          }}
                        >
                          {member.initials}
                        </div>
                        <div className="friend-clean-info">
                          <div className="friend-clean-name">
                            {member.name}
                            <span style={{ color: member.color, fontSize: '14px', marginLeft: '8px', fontWeight: 200 }}>
                              · {member.role}
                            </span>
                          </div>
                          <div className="friend-clean-duty">{member.duty}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Visual column: 3D campfire & tent constellation shines here */}
                <div className="dala-visual-col" aria-hidden="true" />
              </div>
            </section>

            {/* Section 03: Общий котел и честный сплит */}
            <section id="split" className="dala-section" aria-labelledby="split-title">
              <div className="dala-two-col">
                <div className="dala-text-col">
                  <span className="kicker-amber">03 · ЧЕСТНЫЙ СПЛИТ</span>
                  <h2 id="split-title" className="heading-section">
                    Расчет до копейки.<br />Без неловких пауз.
                  </h2>
                  <p className="body-muted">
                    Сервис автоматически подсчитывает траты компании и находит оптимальную схему взаимозачетов с минимальным количеством переводов.
                  </p>

                  <div className="stats-clean-row">
                    <div className="stat-clean-item">
                      <span className="stat-clean-label">Общий бюджет</span>
                      <span className="stat-clean-value">{formatRubles(activeTabTrip.budget)}</span>
                    </div>
                    <div className="stat-clean-item">
                      <span className="stat-clean-label">Потрачено</span>
                      <span className="stat-clean-value" style={{ color: 'var(--color-electric-iris)' }}>
                        {formatRubles(activeSettlements.spent)}
                      </span>
                    </div>
                    <div className="stat-clean-item">
                      <span className="stat-clean-label">С каждого</span>
                      <span className="stat-clean-value" style={{ color: 'var(--color-saffron-spark)' }}>
                        {formatRubles(activeSettlements.perPerson)}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginTop: 'var(--spacing-24)' }}>
                    <span className="label-violet" style={{ marginBottom: '12px' }}>
                      КТО КОМУ ПЕРЕВОДИТ, ЧТОБЫ ВСЕ БЫЛИ В РАСЧЕТЕ:
                    </span>

                    <div className="settlement-clean-list">
                      {activeSettlements.settlements.length === 0 ? (
                        <p style={{ color: 'var(--color-ash-gray)', fontStyle: 'italic', padding: '8px 0' }}>
                          Все скинулись ровно, долгов нет!
                        </p>
                      ) : (
                        activeSettlements.settlements.map((s, idx) => (
                          <div className="settlement-clean-row" key={idx}>
                            <div className="settlement-clean-names">
                              <span>{s.from}</span>
                              <span className="arrow">→</span>
                              <span>{s.to}</span>
                            </div>
                            <span className="settlement-clean-amount">{formatRubles(s.amount)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                {/* Visual column: 3D compass / split constellation shines here */}
                <div className="dala-visual-col" aria-hidden="true" />
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
                <h3 className="heading-section" style={{ fontSize: '28px', marginBottom: 0 }}>Куда едем с друзьями?</h3>
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
