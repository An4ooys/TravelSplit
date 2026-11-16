import { useEffect, useState, type MouseEvent } from 'react';
import ThemeArc, { times, type TimeOfDay } from './ThemeArc';
import TripPage from './TripPage';
import Appearance, { landscapes, fonts } from './Appearance';
import Scenery from './Scenery';

import { trips } from './trips';

function initialTime(): TimeOfDay {
  const saved = window.localStorage.getItem('travelsplit-time');
  if (times.some((time) => time === saved)) return saved as TimeOfDay;
  const configured = import.meta.env.VITE_DEFAULT_TIME;
  return times.some((time) => time === configured) ? configured as TimeOfDay : 'morning';
}

function tripIdFromPath() {
  const match = window.location.pathname.match(/^\/trips\/([a-z0-9-]+)\/?$/);
  return match && trips.some((trip) => trip.id === match[1]) ? match[1] : null;
}

function isPlainClick(event: MouseEvent<HTMLAnchorElement>) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

export default function App() {
  const [landscape, setLandscape] = useState(() => {
    const saved = localStorage.getItem('travelsplit-landscape') || import.meta.env.VITE_DEFAULT_BACKGROUND;
    return landscapes.some((item) => item.id === saved) ? saved : 'mist';
  });
  const [font, setFont] = useState(() => localStorage.getItem('travelsplit-font') || 'sans');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [motion, setMotion] = useState(() => localStorage.getItem('travelsplit-motion') !== 'off');
  useEffect(() => {
    localStorage.setItem('travelsplit-landscape', landscape);
    localStorage.setItem('travelsplit-font', font);
    localStorage.setItem('travelsplit-motion', motion ? 'on' : 'off');
  }, [landscape, font, motion]);
  const [time, setTime] = useState<TimeOfDay>(initialTime);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(tripIdFromPath);
  const selectedTrip = trips.find((trip) => trip.id === selectedTripId);
  const featuredTrip = trips[0];

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
    document.title = selectedTrip ? `${selectedTrip.place} — TravelSplit` : 'TravelSplit — мои поездки';
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

  return (
    <div className={`app-shell theme-${time} landscape-${landscape} ${motion ? '' : 'motion-paused'}`} style={{ fontFamily: fonts.find((item) => item.id === font)?.family || fonts[0].family }}>
      <Scenery landscape={landscape} time={time} motion={motion} />
      {settingsOpen && <Appearance landscape={landscape} font={font} motion={motion} onLandscape={setLandscape} onFont={setFont} onMotion={() => setMotion(!motion)} onClose={() => setSettingsOpen(false)} />}
      <div className="page-frame">
        <header className="site-header">
          <div className="wordmark" aria-label={import.meta.env.VITE_APP_TITLE || 'TravelSplit'}>
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 36 36" fill="none">
                <path d="M4 26.5 13.5 13l5.5 7 4.3-5.2L32 26.5H4Z" stroke="currentColor" strokeWidth="2.1" strokeLinejoin="round" />
                <path d="M13.5 13 16 16.2l2.3-1.1" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span>{import.meta.env.VITE_APP_TITLE || 'TravelSplit'}</span>
          </div>
          <ThemeArc value={time} onChange={setTime} />
          <div className="header-actions"><button className="appearance-trigger" onClick={() => setSettingsOpen(true)}><span aria-hidden="true">◉</span> Оформление</button><div className="profile" aria-label="Демо-профиль Анны">
            <span className="profile-name">Анна</span>
            <span className="profile-avatar" aria-hidden="true">А</span>
          </div></div>
        </header>

        {selectedTrip ? (
          <TripPage key={selectedTrip.id} trip={selectedTrip} onBack={closeTrip} />
        ) : (
        <main className="home-content" key="home">
          <div className="intro">
            <p className="eyebrow">TRAVELSPLIT / ВАШИ ПУТЕШЕСТВИЯ</p>
            <h1>Ближе к миру.<br /><em>Ближе друг к другу.</em></h1>
            <p className="intro-subtitle">С возвращением, Анна. Куда отправимся вместе?</p>
          </div>

          <section className="trip-section" aria-labelledby="trip-section-heading">
            <div className="section-heading">
              <h2 id="trip-section-heading">Мои поездки</h2>
              <span>3 путешествия</span>
            </div>

            <a className="featured-trip trip-link" href={`/trips/${featuredTrip.id}`} onClick={(event) => openTrip(event, featuredTrip.id)} aria-label={`Открыть поездку: ${featuredTrip.place}`}>
              <div className="featured-image-wrap">
                <img src={featuredTrip.image} alt="Горная тропа и палатка на Алтае" />
                <span className="image-caption">Ближайшая поездка</span>
              </div>
              <div className="featured-copy">
                <div className="featured-topline">
                  <span className="trip-kicker">БЛИЖАЙШЕЕ ПУТЕШЕСТВИЕ</span>
                  <span className="trip-dates">{featuredTrip.dates}</span>
                </div>
                <h3>{featuredTrip.place}</h3>
                <div className="traveler-row">
                  <div className="avatar-stack" aria-label={`${featuredTrip.members.length} участника поездки`}>
                    {featuredTrip.members.map((member, index) => (
                      <span className={`traveler traveler-${index}`} key={member.username}>{member.initials}</span>
                    ))}
                  </div>
                  <span>Вместе с друзьями</span>
                </div>
                <div className="next-plan">
                  <span className="next-icon" aria-hidden="true">✦</span>
                  <div>
                    <span className="next-label">СЛЕДУЮЩЕЕ В ПЛАНЕ</span>
                    <strong>{featuredTrip.next}</strong>
                    <span>{featuredTrip.nextWhen}</span>
                  </div>
                </div>
              </div>
            </a>

            <div className="other-trips" aria-label="Другие поездки">
              {trips.slice(1).map((trip) => (
                <a className="small-trip trip-link" href={`/trips/${trip.id}`} onClick={(event) => openTrip(event, trip.id)} key={trip.id} aria-label={`Открыть поездку: ${trip.place}`}>
                  <img src={trip.image} alt={`Пейзаж поездки: ${trip.place}`} />
                  <div>
                    <h3>{trip.place}</h3>
                    <p>{trip.dates}</p>
                  </div>
                </a>
              ))}
              <button className="future-note" onClick={() => setSettingsOpen(true)} aria-label="Выбрать настроение путешествия">
                <span className="future-symbol" aria-hidden="true">＋</span>
                <span>Выбрать пейзаж<br />для новых планов</span>
              </button>
            </div>
          </section>
        </main>
        )}

        <footer className="site-footer">
          <span>Планы, которые хочется воплотить.</span>
          <button className="landscape-caption" onClick={() => setSettingsOpen(true)}>{landscapes.find((item) => item.id === landscape)?.name} <span aria-hidden="true">↗</span></button>
        </footer>
      </div>
    </div>
  );
}
