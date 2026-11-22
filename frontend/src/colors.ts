import type { CSSProperties } from 'react';

export type ThemeColors = { background: string; accent: string };
export type ColorSettings = { light: ThemeColors; dark: ThemeColors };

export const palettes = [
  { id: 'original', name: 'Нынешний', light: { background: '#f7f3ea', accent: '#6e2937' }, dark: { background: '#182820', accent: '#a65765' } },
  { id: 'green', name: 'Зелёный', light: { background: '#edf1e6', accent: '#3f614b' }, dark: { background: '#18291f', accent: '#91b49a' } },
  { id: 'blue', name: 'Голубой', light: { background: '#edf3f6', accent: '#416c89' }, dark: { background: '#192832', accent: '#91bdd5' } },
  { id: 'gray', name: 'Серый', light: { background: '#f0efed', accent: '#62646b' }, dark: { background: '#25262a', accent: '#b1b3bd' } },
  { id: 'brown', name: 'Коричневый', light: { background: '#f1e9df', accent: '#77523f' }, dark: { background: '#2a211c', accent: '#c49c7b' } },
] as const;

export function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && /^#[\da-f]{6}$/i.test(value);
}

export function loadColors(): ColorSettings {
  try {
    const saved = JSON.parse(localStorage.getItem('travelsplit-editorial-colors') || 'null');
    if (saved && [saved.light, saved.dark].every(pair => pair && isHexColor(pair.background) && isHexColor(pair.accent))) return saved;
  } catch { /* Use the original palette when saved settings are unavailable. */ }
  return { light: { ...palettes[0].light }, dark: { ...palettes[0].dark } };
}

function channels(hex: string) {
  return [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16));
}

function luminance(hex: string) {
  const linear = channels(hex).map(channel => {
    const value = channel / 255;
    return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
  });
  return linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722;
}

function contrast(first: string, second: string) {
  const a = luminance(first);
  const b = luminance(second);
  return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
}

function readableOn(background: string) {
  const dark = contrast(background, '#182820');
  const light = contrast(background, '#fff9ef');
  if (Math.max(dark, light) >= 4.5) return dark > light ? '#182820' : '#fff9ef';
  return contrast(background, '#000000') > contrast(background, '#ffffff') ? '#000000' : '#ffffff';
}

function mix(first: string, second: string, ratio: number) {
  const other = channels(second);
  return `#${channels(first).map((value, index) => Math.round(value * (1 - ratio) + other[index] * ratio).toString(16).padStart(2, '0')).join('')}`;
}

export function colorVariables(colors: ThemeColors): CSSProperties {
  const ink = readableOn(colors.background);
  return {
    '--paper': colors.background,
    '--ink': ink,
    '--muted': mix(colors.background, ink, .72),
    '--wine': colors.accent,
    '--wine-ink': readableOn(colors.accent),
    '--accent-text': colors.accent,
    '--sage': mix(colors.background, ink, .14),
    '--surface': mix(colors.background, ink, .045),
    '--line': mix(colors.background, ink, .24),
    '--accent-border': contrast(colors.accent, colors.background) >= 3 ? colors.accent : ink,
  } as CSSProperties;
}
