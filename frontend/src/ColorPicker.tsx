import { useEffect, useId, useState } from 'react';
import { isHexColor } from './colors';

export default function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => { setDraft(value); }, [value]);
  const invalid = !isHexColor(draft);
  const id = useId();
  return <div className="custom-color">
    <label htmlFor={id}>{label}</label>
    <div className="color-inputs">
      <input id={id} type="color" value={value} onChange={event => onChange(event.target.value)} />
      <input aria-label={`${label} — HEX`} aria-invalid={invalid} aria-describedby={invalid ? `${id}-error` : undefined} type="text" value={draft} maxLength={7} spellCheck={false} onChange={event => {
        const next = event.target.value;
        setDraft(next);
        if (isHexColor(next)) onChange(next.toLowerCase());
      }} />
    </div>
    {invalid && <small id={`${id}-error`} className="color-error">Введите цвет в формате #AABBCC</small>}
  </div>;
}
