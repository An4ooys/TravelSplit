import { useEffect, useRef, type CSSProperties } from 'react';
import { isHexColor } from './colors';

export const backgroundOptions = [
  { id: 'plain', name: 'Однотонный' },
  { id: 'mountains', name: 'Горные слои' },
  { id: 'forest', name: 'Хвойный край' },
  { id: 'lines', name: 'Линии маршрута' },
  { id: 'mountain-forest', name: 'Горы и лес' },
] as const;
export type BackgroundPattern = typeof backgroundOptions[number]['id'];
export type BackgroundSettings = { pattern: BackgroundPattern; scale: number; light: string; dark: string };

export function loadBackground(): BackgroundSettings {
  const defaults: BackgroundSettings = { pattern: 'plain', scale: 100, light: '#5c7160', dark: '#a4b8a3' };
  try {
    const saved = JSON.parse(localStorage.getItem('travelsplit-background-elements') || 'null');
    if (!saved) return defaults;
    return {
      pattern: backgroundOptions.some(item => item.id === saved.pattern) ? saved.pattern : defaults.pattern,
      scale: typeof saved.scale === 'number' && Number.isFinite(saved.scale) ? Math.min(145, Math.max(60, saved.scale)) : defaults.scale,
      light: isHexColor(saved.light) ? saved.light : defaults.light,
      dark: isHexColor(saved.dark) ? saved.dark : defaults.dark,
    };
  } catch { return defaults; }
}

export const mountainPaths = [
  'M0 460 L70 426 L140 445 L225 382 L290 423 L385 354 L450 395 L570 270 L655 345 L742 225 L820 310 L900 238 L1000 330 V600 H0Z',
  'M0 493 L120 450 L215 478 L330 417 L440 458 L550 382 L640 421 L750 345 L835 395 L925 318 L1000 380 V600 H0Z',
  'M0 535 L100 500 L185 520 L310 471 L405 505 L510 452 L615 489 L720 432 L815 462 L930 408 L1000 449 V600 H0Z',
];

function Tree({ x, y, height, tone, width = .75 }: { x: number; y: number; height: number; tone: number; width?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${height / 100 * width} ${height / 100})`} className={`decor-tone-${tone}`}><path d="M0 -100 L-12 -75 L-7 -75 L-23 -49 L-15 -49 L-34 -20 L-23 -20 L-42 5 H-5 V18 H5 V5 H42 L23 -20 H34 L15 -49 H23 L7 -75 H12Z" /></g>;
}

export default function BackgroundArtwork({ pattern }: { pattern: BackgroundPattern }) {
  return <svg viewBox="0 0 1000 600" preserveAspectRatio="xMaxYMax slice" aria-hidden="true" focusable="false">
    {(pattern === 'mountains' || pattern === 'mountain-forest') && mountainPaths.map((path, index) => <path key={path} className={`decor-tone-${index + 1}`} d={path} />)}
    {pattern === 'forest' && <><Tree x={670} y={470} height={125} tone={1} /><Tree x={830} y={410} height={195} tone={1} /><Tree x={945} y={385} height={240} tone={1} /><Tree x={755} y={530} height={150} tone={2} /><Tree x={900} y={530} height={220} tone={3} /><Tree x={1010} y={535} height={300} tone={4} /><Tree x={615} y={575} height={105} tone={2} /></>}
    {pattern === 'mountain-forest' && <><Tree x={875} y={535} height={150} tone={3} /><Tree x={960} y={550} height={200} tone={4} /><Tree x={780} y={560} height={95} tone={3} /></>}
    {pattern === 'lines' && <g className="decor-lines"><path d="M1010 70C770 -25 640 95 770 165S985 270 790 320 700 500 1040 430" /><path d="M1030 100C805 15 688 104 805 178S1020 294 820 346 720 510 1025 465" /><path d="M1040 135C835 58 735 119 837 191S1057 318 852 373 767 529 1045 501" /><path d="M-60 485C80 385 142 574 315 501S490 466 524 585" /><circle cx="751" cy="142" r="47" /><circle cx="751" cy="142" r="65" /><circle cx="550" cy="456" r="10" /><circle cx="640" cy="325" r="4" /></g>}
  </svg>;
}

export function DecorativeBackground({ settings, dark, motion }: { settings: BackgroundSettings; dark: boolean; motion: boolean }) {
  const layer = useRef<HTMLDivElement>(null);
  const position = useRef(0);

  useEffect(() => {
    const element = layer.current;
    if (!element) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let lastTime = 0;
    let target = 0;

    function animate(time: number) {
      const delta = lastTime ? Math.min(time - lastTime, 50) : 16;
      lastTime = time;
      position.current += (target - position.current) * (1 - Math.exp(-delta / 160));
      if (Math.abs(target - position.current) < .1) position.current = target;
      element!.style.setProperty('--scroll-offset', `${position.current.toFixed(2)}px`);
      if (position.current !== target) frame = requestAnimationFrame(animate);
      else { frame = 0; lastTime = 0; }
    }

    function update() {
      if (!motion || reduced.matches || settings.pattern === 'plain') {
        cancelAnimationFrame(frame);
        frame = 0;
        lastTime = 0;
        position.current = 0;
        element!.style.setProperty('--scroll-offset', '0px');
        return;
      }
      const maximum = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.max(0, Math.min(1, window.scrollY / maximum));
      target = -progress * 72;
      if (!frame) frame = requestAnimationFrame(animate);
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    reduced.addEventListener('change', update);
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(document.body);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      reduced.removeEventListener('change', update);
      resizeObserver.disconnect();
    };
  }, [motion, settings.pattern]);

  return <div ref={layer} className="decorative-background" data-pattern={settings.pattern} aria-hidden="true" style={{ '--decor-color': dark ? settings.dark : settings.light, '--decor-scale': settings.scale / 100 } as CSSProperties}><div className="decorative-motion"><div className="decorative-art"><BackgroundArtwork pattern={settings.pattern} /></div></div></div>;
}

export function MountainDivider() {
  return <div className="mountain-edge" aria-hidden="true"><svg viewBox="0 0 1000 100" preserveAspectRatio="none"><path d="M0 80L65 50L115 70L190 18L240 62L310 40L365 65L440 5L510 57L575 30L650 65L730 12L800 64L860 35L930 68L975 45L1000 70V100H0Z" /></svg></div>;
}
