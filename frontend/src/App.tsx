import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import Appearance, { fonts } from './Appearance';
import JournalTrip from './JournalTrip';
import { trips } from './trips';
import { colorVariables, loadColors, palettes, type ThemeColors } from './colors';
import { DecorativeBackground, MountainDivider, loadBackground } from './BackgroundArtwork';
import useMountainNavigation from './useMountainNavigation';

export default function App() {
  const [featured, setFeatured] = useState(0);
  const [dark, setDark] = useState(() => localStorage.getItem('travelsplit-editorial-theme') === 'dark');
  const [settings, setSettings] = useState(false);
  const [colors, setColors] = useState(loadColors);
  const colorMode = dark ? 'dark' : 'light';

  function changeColors(next: ThemeColors) {
    setColors(previous => ({ ...previous, [colorMode]: next }));
  }
  const [font, setFont] = useState(() => {
    const saved = localStorage.getItem('travelsplit-editorial-font');
    return fonts.some(item => item.id === saved) ? saved! : 'sans';
  });
  const [displayFont, setDisplayFont] = useState(() => {
    const saved = localStorage.getItem('travelsplit-editorial-display-font');
    return fonts.some(item => item.id === saved) ? saved! : 'editorial';
  });
  const [motion, setMotion] = useState(() => localStorage.getItem('travelsplit-motion') !== 'off');
  const [decoration, setDecoration] = useState(loadBackground);
  const { tripId, navigate, transitioning } = useMountainNavigation(motion);
  const heading = useRef<HTMLElement>(null);
  const trip = trips.find(item => item.id === tripId);
  const nextTrip = trips[featured];

  useEffect(() => {
    localStorage.setItem('travelsplit-editorial-theme', dark ? 'dark' : 'light');
    localStorage.setItem('travelsplit-editorial-font', font);
    localStorage.setItem('travelsplit-editorial-display-font', displayFont);
    localStorage.setItem('travelsplit-motion', motion ? 'on' : 'off');
    localStorage.setItem('travelsplit-editorial-colors', JSON.stringify(colors));
    localStorage.setItem('travelsplit-background-elements', JSON.stringify(decoration));
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  }, [dark, font, displayFont, motion, colors, decoration]);

  useEffect(() => {
    document.title = trip ? `${trip.place} · TravelSplit` : 'TravelSplit · Искусство путешествовать вместе';
    heading.current?.focus({ preventScroll: true });
  }, [trip]);

  function follow(event: MouseEvent<HTMLAnchorElement>, id: string | null) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(id);
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target;
      if (settings || (target instanceof HTMLElement && target.closest('button, a, input, select, textarea, [role="tab"]'))) return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.key === 'Escape' && tripId) navigate(null);
      if (!tripId && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) {
        event.preventDefault();
        const offset = event.key === 'ArrowRight' ? 1 : -1;
        setFeatured(index => (index + offset + trips.length) % trips.length);
      }
      if (!tripId && event.key === 'Enter') navigate(trips[featured].id);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [featured, tripId, settings, navigate]);

  return (
    <div className={`atelier ${dark ? 'is-dark' : ''} ${motion ? '' : 'is-still'}`} style={{ ...colorVariables(colors[colorMode]), fontFamily: fonts.find(item => item.id === font)?.family, '--heading-font': fonts.find(item => item.id === displayFont)?.family } as CSSProperties}>
      <DecorativeBackground settings={decoration} dark={dark} motion={motion} />
      <a className="skip-link" href="#content">К содержимому</a>
      <header className="masthead">
        <a href="/" className="brand" onClick={event => follow(event, null)} aria-label="TravelSplit — главная">travel<span>split</span><i aria-hidden="true">✳</i></a>
        <nav aria-label="Главная навигация">
          <a href="/#journeys" onClick={event => { if (tripId) follow(event, null); }}>Мои путешествия</a>
          <button onClick={() => setSettings(true)}>Атмосфера <span aria-hidden="true">↗</span></button>
        </nav>
        <div className="masthead-actions">
          <button className="day-switch" aria-label={dark ? 'Включить светлую тему' : 'Включить тёмную тему'} aria-pressed={dark} onClick={() => setDark(!dark)}>
            <span className="switch-sun" aria-hidden="true">☀</span><span className="switch-moon" aria-hidden="true">☾</span><span className="switch-knob" />
          </button>
          <span className="user-avatar" title="Анна">А</span>
        </div>
      </header>

      <main id="content" ref={heading} tabIndex={-1} key={tripId || 'home'} className="page-enter" aria-busy={transitioning}>
        {trip ? <JournalTrip trip={trip} onBack={event => follow(event, null)} /> : <>
          <section className="cover">
            <div className="cover-copy">
              <p className="eyebrow">ВАШ ЛИЧНЫЙ АТЛАС ПУТЕШЕСТВИЙ</p>
              <h1>Весь мир.<br />Ваша <em>компания.</em></h1>
              <p className="welcome">С возвращением, Анна.</p>
              <p className="cover-description">Маршруты, общие планы и маленькие открытия.<br />Всё, что делает поездку вашей.</p>
              <a className="button button-wine" href={`/trips/${nextTrip.id}`} onClick={event => follow(event, nextTrip.id)}>Открыть путешествие <span aria-hidden="true">↗</span></a>
              <div className="cover-bottom"><span className="compass" aria-hidden="true">✳</span><span>Больше моментов.<br />Меньше суеты.</span><a href="#journeys" className="text-link">Все поездки <span aria-hidden="true">↓</span></a></div>
            </div>
            <div className="cover-art">
              <div className="cover-color-square" aria-hidden="true" />
              <div className="cover-secondary-square" aria-hidden="true" />
              <div className="trip-ticket" aria-live="polite"><p>СЛЕДУЮЩАЯ ГЛАВА</p><h2>{nextTrip.place}</h2><span>{nextTrip.dates}</span><a href={`/trips/${nextTrip.id}`} onClick={event => follow(event, nextTrip.id)} aria-label={`Открыть поездку ${nextTrip.place}`}>↗</a></div>
              <div className="photo-controls"><span>{featured + 1} <i>/ {trips.length}</i></span><div><button className="circle-button" onClick={() => setFeatured((featured + trips.length - 1) % trips.length)} aria-label="Предыдущая поездка">←</button><button className="circle-button" onClick={() => setFeatured((featured + 1) % trips.length)} aria-label="Следующая поездка">→</button></div></div>
            </div>
          </section>

          <section className="journeys mountain-divider" id="journeys" aria-labelledby="journeys-title">
            <MountainDivider />
            <div className="section-title"><div><p className="eyebrow">СОБИРАЙТЕ ВПЕЧАТЛЕНИЯ</p><h2 id="journeys-title">Ваши <em>путешествия</em></h2></div><span className="collection-count">{trips.length} поездки в коллекции</span></div>
            <div className="journey-grid">{trips.map(item => <a className="journey-card" href={`/trips/${item.id}`} onClick={event => follow(event, item.id)} key={item.id}>
              <div className="journey-image solid-cover"><span className="journey-open" aria-hidden="true">↗</span><span className="duration">{item.duration}</span></div>
              <div className="journey-caption"><div><p>{item.dates}</p><h3>{item.place}</h3></div><span className="member-count">{item.members.length} участника</span></div>
            </a>)}</div>
            <div className="collection-note"><span aria-hidden="true">✳</span><p>Лучшие истории начинаются<br /><em>с общего плана.</em></p><button className="button button-outline" onClick={() => setSettings(true)}>Выбрать атмосферу <span aria-hidden="true">↗</span></button></div>
          </section>
        </>}
      </main>

      <footer className="footer"><a href="/" className="footer-brand" onClick={event => follow(event, null)}>TravelSplit</a><p>Путешествовать. Вместе.</p><span>Сделано для ваших историй</span></footer>
      <div className={`mountain-transition ${transitioning ? 'is-crossing' : ''}`} aria-hidden="true"><svg viewBox="0 0 1000 700" preserveAspectRatio="none"><path d="M0 140L110 80L185 117L310 0L405 100L520 35L610 120L735 10L820 110L930 55L1000 135V700H0Z" /></svg></div>
      {settings && <Appearance decoration={decoration} onDecoration={setDecoration} colors={colors[colorMode]} dark={dark} onColors={changeColors} onPalette={id => {
        const preset = palettes.find(item => item.id === id)!;
        setColors(previous => ({ light: { ...previous.light, accent: preset.light.accent }, dark: { ...previous.dark, accent: preset.dark.accent } }));
      }} onBackgroundPalette={id => {
        const preset = palettes.find(item => item.id === id)!;
        setColors(previous => ({ light: { ...previous.light, background: preset.light.background }, dark: { ...previous.dark, background: preset.dark.background } }));
      }} font={font} displayFont={displayFont} motion={motion} onFont={setFont} onDisplayFont={setDisplayFont} onMotion={() => setMotion(!motion)} onClose={() => setSettings(false)} />}
    </div>
  );
}
