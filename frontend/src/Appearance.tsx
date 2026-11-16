import { useEffect, useRef } from 'react';

export const landscapes = [
  { id: 'mist', name: 'Выше облаков', kind: 'Горы · реализм', image: '/images/landscape-mist.png' },
  { id: 'paper', name: 'Тихий берег', kind: 'Озеро · иллюстрация', image: '/images/landscape-paper.png' },
  { id: 'coast', name: 'Дыхание океана', kind: 'Побережье · реализм', image: '/images/cover-norway.png' },
] as const;
export const fonts = [
  { id: 'sans', name: 'Современный', family: 'Inter, "Segoe UI", sans-serif' },
  { id: 'serif', name: 'Литературный', family: '"PT Serif", Georgia, serif' },
  { id: 'round', name: 'Мягкий', family: 'Nunito, "Segoe UI", sans-serif' },
] as const;

type Props = {
  landscape: string;
  font: string;
  motion: boolean;
  onLandscape: (id: string) => void;
  onFont: (id: string) => void;
  onMotion: () => void;
  onClose: () => void;
};

export default function Appearance(props: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement as HTMLElement | null;
    element?.showModal();
    return () => { element?.close(); previous?.focus(); };
  }, []);

  return (
    <dialog ref={dialog} className="appearance" aria-labelledby="appearance-title" onCancel={props.onClose} onClick={(event) => {
      if (event.target === event.currentTarget) props.onClose();
    }}>
      <div className="appearance-inner">
        <div className="appearance-heading"><div><p className="eyebrow">ВАШЕ НАСТРОЕНИЕ</p><h2 id="appearance-title">Место, где хорошо</h2></div><button className="icon-button" onClick={props.onClose} aria-label="Закрыть настройки">×</button></div>
        <p className="settings-caption">Выберите пейзаж. У каждого — своё утро, день, вечер и ночь.</p>
        <div className="landscape-options">
          {landscapes.map((item) => <button key={item.id} className={`landscape-option ${props.landscape === item.id ? 'selected' : ''}`} aria-pressed={props.landscape === item.id} onClick={() => props.onLandscape(item.id)}><img src={item.image} alt="" /><span><strong>{item.name}</strong><small>{item.kind}</small></span><span className="selection-dot" aria-hidden="true">{props.landscape === item.id ? '✓' : ''}</span></button>)}
        </div>
        <h3>Шрифт</h3>
        <div className="font-options">{fonts.map((font) => <button key={font.id} style={{ fontFamily: font.family }} className={props.font === font.id ? 'selected' : ''} aria-pressed={props.font === font.id} onClick={() => props.onFont(font.id)}><span>Аа</span>{font.name}</button>)}</div>
        <button className="motion-toggle" aria-pressed={props.motion} onClick={props.onMotion}><span><strong>Живой пейзаж</strong><small>Облака, птицы и звёзды</small></span><span className={`toggle ${props.motion ? 'on' : ''}`} aria-hidden="true" /></button>
        <button className="primary-button" onClick={props.onClose}>Сохранить настроение <span aria-hidden="true">↗</span></button>
      </div>
    </dialog>
  );
}
