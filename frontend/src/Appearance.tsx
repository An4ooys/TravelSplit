import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import ColorPicker from './ColorPicker';
import { palettes, type ThemeColors } from './colors';
import BackgroundArtwork, { backgroundOptions, type BackgroundSettings } from './BackgroundArtwork';

export const landscapes = [
  { id: 'mist', name: 'Выше облаков', kind: 'Горы · реализм', image: '/images/landscape-mist.png' },
  { id: 'paper', name: 'Тихий берег', kind: 'Озеро · иллюстрация', image: '/images/landscape-paper.png' },
  { id: 'coast', name: 'Дыхание океана', kind: 'Побережье · реализм', image: '/images/cover-norway.png' },
] as const;
export const fonts = [
  { id: 'sans', name: 'Лаконичный', family: '"Source Sans 3", "Segoe UI", sans-serif' },
  { id: 'serif', name: 'Книжный', family: '"PT Serif", Georgia, serif' },
  { id: 'round', name: 'Мягкий', family: 'Nunito, "Segoe UI", sans-serif' },
  { id: 'editorial', name: 'Атлас', family: '"Cormorant Garamond", Georgia, serif' },
  { id: 'classic', name: 'Классический', family: 'Roboto, "Segoe UI", sans-serif' },
] as const;

type Props = {
  decoration: BackgroundSettings;
  onDecoration: (settings: BackgroundSettings) => void;
  colors: ThemeColors;
  dark: boolean;
  onColors: (colors: ThemeColors) => void;
  onPalette: (id: string) => void;
  onBackgroundPalette: (id: string) => void;
  font: string;
  displayFont: string;
  motion: boolean;
  onFont: (id: string) => void;
  onDisplayFont: (id: string) => void;
  onMotion: () => void;
  onClose: () => void;
};
const sections = [{ id: 'palette', name: 'Палитра' }, { id: 'background', name: 'Фон' }, { id: 'text', name: 'Текст' }] as const;
type Section = typeof sections[number]['id'];

export default function Appearance(props: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const tabButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const [section, setSection] = useState<Section>('palette');
  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement as HTMLElement | null;
    element?.showModal();
    return () => { element?.close(); previous?.focus(); };
  }, []);

  function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % sections.length;
    else if (event.key === 'ArrowLeft') next = (index + sections.length - 1) % sections.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = sections.length - 1;
    else return;
    event.preventDefault();
    setSection(sections[next].id);
    tabButtons.current[next]?.focus();
  }

  return (
    <dialog ref={dialog} className="appearance" aria-labelledby="appearance-title" onCancel={props.onClose} onClick={event => {
      if (event.target === event.currentTarget) props.onClose();
    }}>
      <div className="appearance-inner">
        <div className="appearance-heading"><div><p className="eyebrow">ВАШЕ НАСТРОЕНИЕ</p><h2 id="appearance-title">Место, где хорошо</h2></div><button className="icon-button" onClick={props.onClose} aria-label="Закрыть настройки">×</button></div>
        <div className="appearance-tabs" role="tablist" aria-label="Настройки атмосферы">
          {sections.map((item, index) => <button key={item.id} id={`appearance-tab-${item.id}`} ref={element => { tabButtons.current[index] = element; }} role="tab" aria-controls={`appearance-panel-${item.id}`} aria-selected={section === item.id} tabIndex={section === item.id ? 0 : -1} onClick={() => setSection(item.id)} onKeyDown={event => moveTab(event, index)}>{item.name}</button>)}
        </div>
        <div className="appearance-content" key={section} id={`appearance-panel-${section}`} role="tabpanel" aria-labelledby={`appearance-tab-${section}`} tabIndex={0}>
          {section === 'palette' && <>
            <h3>Цвет акцентов</h3>
            <div className="palette-options" aria-label="Палитры акцентов">{palettes.map(palette => {
              const pair = props.dark ? palette.dark : palette.light;
              return <button key={palette.id} className={`palette-option ${pair.accent === props.colors.accent ? 'selected' : ''}`} aria-pressed={pair.accent === props.colors.accent} onClick={() => props.onPalette(palette.id)}><span className="palette-swatch accent-swatch" style={{ background: pair.accent }} /><span>{palette.name}</span></button>;
            })}</div>
            <p className="settings-caption">Цвет кнопок, заголовков и декоративных акцентов.</p>
            <ColorPicker label="Акценты" value={props.colors.accent} onChange={accent => props.onColors({ ...props.colors, accent })} />
          </>}
          {section === 'background' && <>
            <h3>Палитра фона</h3>
            <div className="palette-options" aria-label="Палитры фона">{palettes.map(palette => {
              const pair = props.dark ? palette.dark : palette.light;
              return <button key={palette.id} className={`palette-option ${pair.background === props.colors.background ? 'selected' : ''}`} aria-pressed={pair.background === props.colors.background} onClick={() => props.onBackgroundPalette(palette.id)}><span className="palette-swatch" style={{ background: pair.background }} /><span>{palette.name}</span></button>;
            })}</div>
            <p className="settings-caption">Цвета для {props.dark ? 'тёмной' : 'светлой'} темы.</p>
            <div className="custom-colors">
              <ColorPicker label="Фон" value={props.colors.background} onChange={background => props.onColors({ ...props.colors, background })} />
              <ColorPicker label="Элементы фона" value={props.dark ? props.decoration.dark : props.decoration.light} onChange={color => props.onDecoration({ ...props.decoration, [props.dark ? 'dark' : 'light']: color })} />
            </div>
            <h3 id="background-heading">Узор</h3>
            <div className="background-options" role="group" aria-labelledby="background-heading" style={{ '--decor-color': props.dark ? props.decoration.dark : props.decoration.light } as CSSProperties}>
              {backgroundOptions.map(option => <button key={option.id} className={`background-option ${props.decoration.pattern === option.id ? 'selected' : ''}`} aria-pressed={props.decoration.pattern === option.id} onClick={() => props.onDecoration({ ...props.decoration, pattern: option.id })}><span className="background-thumbnail"><BackgroundArtwork pattern={option.id} /></span><span>{option.name}</span></button>)}
            </div>
            <label className="background-size">Размер элементов <output>{props.decoration.scale}%</output><input type="range" min="60" max="145" step="5" value={props.decoration.scale} onChange={event => props.onDecoration({ ...props.decoration, scale: Number(event.target.value) })} /></label>
            <button className="motion-toggle" aria-pressed={props.motion} onClick={props.onMotion}><span><strong>Движение и переходы</strong><small>Мягкое движение фона при прокрутке</small></span><span className={`toggle ${props.motion ? 'on' : ''}`} aria-hidden="true" /></button>
          </>}
          {section === 'text' && <>
            <h3 id="body-font-heading">Основной текст</h3>
            <div className="font-options" role="group" aria-labelledby="body-font-heading">{fonts.map(font => <button key={font.id} style={{ fontFamily: font.family }} className={props.font === font.id ? 'selected' : ''} aria-pressed={props.font === font.id} onClick={() => props.onFont(font.id)}><span>Аа</span>{font.name}</button>)}</div>
            <h3 id="display-font-heading">Заголовки и украшения</h3>
            <div className="font-options" role="group" aria-labelledby="display-font-heading">{fonts.map(font => <button key={font.id} style={{ fontFamily: font.family }} className={props.displayFont === font.id ? 'selected' : ''} aria-pressed={props.displayFont === font.id} onClick={() => props.onDisplayFont(font.id)}><span>Аа</span>{font.name}</button>)}</div>
          </>}
        </div>
        <button className="primary-button" onClick={props.onClose}>Сохранить настроение <span aria-hidden="true">↗</span></button>
      </div>
    </dialog>
  );
}