import { useEffect, useRef, type CSSProperties } from 'react';
import { landscapes } from './Appearance';
import { times, type TimeOfDay } from './ThemeArc';

type Props = { landscape: string; time: TimeOfDay; motion: boolean };
const skylines: Record<string, number[][]> = {
  mist: [[0,.63],[.12,.55],[.25,.53],[.38,.54],[.5,.47],[.61,.39],[.69,.35],[.76,.28],[.8,.25],[.85,.33],[.9,.31],[1,.39]],
  paper: [[0,.05],[.07,.4],[.15,.51],[.25,.49],[.35,.55],[.46,.51],[.57,.46],[.65,.39],[.72,.49],[.82,.47],[.91,.24],[1,.13]],
  coast: [[0,.4],[.15,.35],[.3,.46],[.45,.38],[.6,.43],[.75,.45],[1,.5]],
};

export default function Scenery({ landscape, time, motion }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const currentTime = useRef(times.indexOf(time));
  const clock = useRef(0);
  useEffect(() => {
    const surface = canvas.current;
    const context = surface?.getContext('2d');
    if (!surface || !context) return;
    const ctx = context;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const target = times.indexOf(time);
    let frame = 0;
    let width = 1;
    let height = 1;
    let lastFrame = 0;
    let elapsed = clock.current;
    let nextMeteor = elapsed + 7000;
    let meteor: { born: number; x: number; y: number } | null = null;
    const pointer = { x: -1000, y: -1000 };
    const image = new Image();
    image.src = landscapes.find(item => item.id === landscape)!.image;
    const stars = Array.from({ length: 650 }, (_, index) => ({
      x: ((Math.sin(index * 127.1 + 3) * 43758.5453) % 1 + 1) % 1,
      y: ((Math.sin(index * 311.7 + 7) * 19234.123) % 1 + 1) % 1,
      radius: .3 + (index % 7) * .095, phase: index * 2.39,
    }));
    const ripples: { x: number; y: number; born: number }[] = [];
    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      surface!.width = width * scale;
      surface!.height = height * scale;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
    }
    function clipSky() {
      // Apply the same cover crop as the background image, with a small skyline margin.
      const iw = image.naturalWidth || 1672;
      const ih = image.naturalHeight || 941;
      const scale = Math.max((width + 30) / iw, (height + 30) / ih) * 1.025;
      const ox = (width - iw * scale) / 2;
      const oy = (height - ih * scale) / 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width, 0);
      const skyline = skylines[landscape];
      for (let index = skyline.length - 1; index >= 0; index--) {
        const [x, y] = skyline[index];
        ctx.lineTo(ox + x * iw * scale, oy + y * ih * scale - 16);
      }
      ctx.closePath();
      ctx.clip();
    }
    function sun(progress: number, opacity: number) {
      const x = width * (.16 + .68 * progress);
      const y = height * (.16 - .1 * Math.sin(Math.PI * progress));
      const radius = Math.min(24, width * .035);
      ctx.globalAlpha = opacity;
      const glow = ctx.createRadialGradient(x, y, radius * .6, x, y, radius * 2);
      glow.addColorStop(0, '#ffe9ad88');
      glow.addColorStop(1, '#ffe9ad00');
      ctx.fillStyle = glow;
      ctx.fillRect(x - radius * 2, y - radius * 2, radius * 4, radius * 4);
      const disc = ctx.createRadialGradient(x - radius * .2, y - radius * .2, 0, x, y, radius);
      disc.addColorStop(0, '#fffbe4');
      disc.addColorStop(1, progress > .8 ? '#f5bb70' : '#ffdb85');
      ctx.fillStyle = disc;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffe6ac88';
      ctx.lineWidth = 1;
      for (let ray = 0; ray < 12; ray++) {
        const angle = ray * Math.PI / 6;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(angle) * radius * 1.3, y + Math.sin(angle) * radius * 1.3);
        ctx.lineTo(x + Math.cos(angle) * radius * 1.6, y + Math.sin(angle) * radius * 1.6);
        ctx.stroke();
      }
    }
    function moon(opacity: number) {
      const x = width * .84;
      const y = height * .15;
      const radius = Math.min(22, width * .03);
      ctx.globalAlpha = opacity;
      const glow = ctx.createRadialGradient(x, y, radius, x, y, radius * 2);
      glow.addColorStop(0, '#cddff122');
      glow.addColorStop(1, '#cddff100');
      ctx.fillStyle = glow;
      ctx.fillRect(x - radius * 2, y - radius * 2, radius * 4, radius * 4);
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.clip();
      const disc = ctx.createRadialGradient(x - radius * .4, y - radius * .35, 0, x, y, radius * 1.4);
      disc.addColorStop(0, '#f5f2de');
      disc.addColorStop(1, '#9faebc');
      ctx.fillStyle = disc;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      for (const [cx, cy, size] of [[-.35,-.2,.17],[.25,.3,.22],[.35,-.4,.12],[-.3,.55,.1],[.05,-.1,.09]]) {
        ctx.fillStyle = '#6d7d8c33';
        ctx.beginPath();
        ctx.arc(x + cx * radius, y + cy * radius, size * radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    function paint(now: number) {
      const duration = lastFrame ? now - lastFrame : 16;
      const delta = Math.min(duration, 50);
      lastFrame = now;
      const moving = motion && !reduced.matches;
      if (moving) elapsed += duration;
      clock.current = elapsed;
      const difference = target - currentTime.current;
      currentTime.current = moving ? currentTime.current + difference * (1 - Math.exp(-delta / 280)) : target;
      if (Math.abs(target - currentTime.current) < .005) currentTime.current = target;
      const phase = currentTime.current;
      const night = Math.max(0, Math.min(1, phase - 2));
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      clipSky();
      if (night > .01) {
        stars.forEach(star => {
          const x = star.x * width;
          const y = star.y * height * .72;
          const near = Math.max(0, 1 - Math.hypot(x - pointer.x, y - pointer.y) / 100);
          ctx.globalAlpha = night * Math.min(.9, .4 + Math.sin(elapsed / 2300 + star.phase) * .16 + near * .16);
          ctx.fillStyle = '#e2eaf4';
          ctx.beginPath();
          ctx.arc(x, y, star.radius, 0, Math.PI * 2);
          ctx.fill();
        });
        if (moving && elapsed > nextMeteor) {
          meteor = { born: elapsed, x: width * (.25 + Math.random() * .5), y: height * (.04 + Math.random() * .12) };
          nextMeteor = elapsed + 9000 + Math.random() * 8000;
        }
        if (meteor && moving) {
          const age = (elapsed - meteor.born) / 950;
          if (age < 1) {
            const x = meteor.x + age * 230;
            const y = meteor.y + age * 100;
            const trail = ctx.createLinearGradient(x - 95, y - 41, x, y);
            trail.addColorStop(0, '#d9eaff00');
            trail.addColorStop(1, '#f0f6ff');
            ctx.globalAlpha = night * Math.sin(age * Math.PI) * .8;
            ctx.strokeStyle = trail;
            ctx.lineWidth = 1.1;
            ctx.beginPath();
            ctx.moveTo(x - 95, y - 41);
            ctx.lineTo(x, y);
            ctx.stroke();
          } else meteor = null;
        }
      }
      sun(Math.min(phase / 2, 1), 1 - night);
      moon(night);
      const flight = ((elapsed / 65000 + .28) % 1);
      for (let bird = 0; bird < 4; bird++) {
        const x = -80 + flight * (width + 180) - bird * 23;
        const y = height * .22 + bird * 8 + Math.sin(flight * Math.PI * 2) * 9;
        const wing = Math.sin(elapsed / 180 + bird * .7) * 3;
        ctx.globalAlpha = .48 * (1 - night);
        ctx.strokeStyle = '#253d45';
        ctx.lineWidth = 1.15;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x - 7, y - wing);
        ctx.quadraticCurveTo(x - 3, y - 3 - wing, x, y);
        ctx.quadraticCurveTo(x + 3, y - 3 - wing, x + 7, y - wing);
        ctx.stroke();
      }
      ctx.restore();
      for (let index = ripples.length - 1; index >= 0; index--) {
        const ripple = ripples[index];
        const age = (elapsed - ripple.born) / 1100;
        if (age > 1) { ripples.splice(index, 1); continue; }
        ctx.globalAlpha = (1 - age) * .3;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, 8 + age * 70, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      if (moving || Math.abs(difference) > .001) frame = requestAnimationFrame(paint);
    }
    function redraw() { cancelAnimationFrame(frame); frame = requestAnimationFrame(paint); }
    function onResize() { resize(); redraw(); }
    function move(event: PointerEvent) {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (!motion || reduced.matches) return;
      container.current?.style.setProperty('--parallax-x', `${(event.clientX / width - .5) * 8}px`);
      container.current?.style.setProperty('--parallax-y', `${(event.clientY / height - .5) * 5}px`);
    }
    function touch(event: PointerEvent) {
      if (!motion || reduced.matches || (event.target as HTMLElement).closest('button, a, dialog, [role="slider"]')) return;
      ripples.push({ x: event.clientX, y: event.clientY, born: elapsed });
      if (ripples.length > 8) ripples.shift();
    }
    resize();
    redraw();
    image.addEventListener('load', redraw);
    reduced.addEventListener('change', redraw);
    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', touch, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      image.removeEventListener('load', redraw);
      reduced.removeEventListener('change', redraw);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', touch);
    };
  }, [landscape, motion, time]);

  return <div ref={container} className="scenery" aria-hidden="true">
    {landscapes.map(item => <div key={item.id} className={`landscape-layer ${landscape === item.id ? 'visible' : ''}`} style={{ backgroundImage: `url(${item.image})` }} />)}
    <div className="landscape-light" /><div className="sky-glow" />
    <canvas ref={canvas} className="sky-canvas" />
    <div className="fog fog-one" /><div className="fog fog-two" />
    <div className="cloud cloud-one" /><div className="cloud cloud-two" />
    {landscape === 'paper' && <div className="leaves">{[0, 1, 2, 3, 4].map(item => <i key={item} style={{ '--leaf': item } as CSSProperties} />)}</div>}
  </div>;
}
