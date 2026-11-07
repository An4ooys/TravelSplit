import { useRef, type KeyboardEvent, type PointerEvent } from 'react';

export const times = ['morning', 'day', 'evening', 'night'] as const;
export type TimeOfDay = (typeof times)[number];

const labels = ['Утро', 'День', 'Вечер', 'Ночь'];
const marks = [0, 1 / 3, 2 / 3, 1];

function point(t: number) {
  return {
    x: 28 + 384 * t,
    y: 78 - 172 * t * (1 - t),
  };
}

type Props = {
  value: TimeOfDay;
  onChange: (next: TimeOfDay) => void;
};

export default function ThemeArc({ value, onChange }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const index = times.indexOf(value);
  const handle = point(marks[index]);

  function updateFromPointer(event: PointerEvent<SVGSVGElement>) {
    const bounds = svgRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const localX = ((event.clientX - bounds.left) / bounds.width) * 440;
    const ratio = Math.max(0, Math.min(1, (localX - 28) / 384));
    onChange(times[Math.round(ratio * 3)]);
  }

  function onPointerDown(event: PointerEvent<SVGSVGElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromPointer(event);
  }

  function onPointerMove(event: PointerEvent<SVGSVGElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) updateFromPointer(event);
  }

  function onPointerUp(event: PointerEvent<SVGSVGElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function onKeyDown(event: KeyboardEvent<SVGSVGElement>) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      onChange(times[Math.min(3, index + 1)]);
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      onChange(times[Math.max(0, index - 1)]);
    }
    if (event.key === 'Home') {
      event.preventDefault();
      onChange(times[0]);
    }
    if (event.key === 'End') {
      event.preventDefault();
      onChange(times[3]);
    }
  }

  return (
    <div className="theme-control">
      <svg
        ref={svgRef}
        className="theme-arc"
        viewBox="0 0 440 102"
        role="slider"
        tabIndex={0}
        aria-label="Время суток и тема интерфейса"
        aria-valuemin={0}
        aria-valuemax={3}
        aria-valuenow={index}
        aria-valuetext={labels[index]}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      >
        <path className="arc-hit-area" d="M28 78 Q220 -8 412 78" />
        <path className="arc-line" d="M28 78 Q220 -8 412 78" />
        {marks.map((mark, markerIndex) => {
          const marker = point(mark);
          return (
            <circle
              key={labels[markerIndex]}
              className={markerIndex === index ? 'arc-marker is-active' : 'arc-marker'}
              cx={marker.x}
              cy={marker.y}
              r={markerIndex === index ? 4.5 : 3.5}
            />
          );
        })}
        <g className="arc-handle" transform={`translate(${handle.x} ${handle.y})`}>
          <circle className="handle-halo" r="24" />
          <circle className="handle-disc" r="17" />
          {value === 'night' ? (
            <path className="moon-shape" d="M5 -10A11 11 0 1 0 10 5A10 10 0 0 1 5 -10Z" />
          ) : (
            <>
              <circle className="sun-shape" r="7" />
              <path className="sun-rays" d="M0 -12V-15M0 12V15M-12 0H-15M12 0H15M-8.5 -8.5L-10.6 -10.6M8.5 -8.5L10.6 -10.6M-8.5 8.5L-10.6 10.6M8.5 8.5L10.6 10.6" />
            </>
          )}
        </g>
      </svg>
      <div className="theme-labels" aria-hidden="true">
        {labels.map((label, labelIndex) => (
          <span key={label} className={index === labelIndex ? 'is-active' : ''}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
