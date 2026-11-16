import { useEffect, useRef } from 'react';

type Point3D = {
  x: number;
  y: number;
  z: number;
  color: string;
  size: number;
};

type Particle = {
  // 4 target shape positions
  s0: Point3D; // Mountain
  s1: Point3D; // Globe
  s2: Point3D; // Campfire & Tent
  s3: Point3D; // Compass

  size: number;
  angle: number;
  rotSpeed: number;
  color: string;
  alpha: number;
};

type ForegroundGlyph = {
  x: number;
  y: number;
  z: number;
  size: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  speedX: number;
  speedY: number;
  speedZ: number;
  color: string;
};

export default function ConstellationCanvas({
  className = '',
}: {
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    const context: CanvasRenderingContext2D = ctx;

    let animId: number;
    let width = 0;
    let height = 0;

    // Mouse tracking with smooth lerp
    let targetRotY = 0;
    let targetRotX = 0;
    let curRotY = 0;
    let curRotX = 0;

    // Scroll state tracking
    let scrollProgress = 0;
    let smoothScrollStage = 0;

    const TOTAL_PARTICLES = 2200;
    const particles: Particle[] = [];

    // -------------------------------------------------------------
    // SHAPE 0: CALM ALPINE MOUNTAIN PEAK (Горы)
    // -------------------------------------------------------------
    function getMountainPoint(i: number, total: number): Point3D {
      // 15% are steady sky stars above the peak
      if (i > total * 0.85) {
        const angle = (i / (total * 0.15)) * Math.PI * 2;
        const rad = 1.3 + ((i * 17) % 70) * 0.015;
        return {
          x: rad * Math.cos(angle) * 1.6,
          y: -0.9 - ((i * 31) % 50) * 0.018,
          z: rad * Math.sin(angle) * 0.8,
          color: i % 2 === 0 ? '#ffb829' : '#8052ff',
          size: 1.6,
        };
      }

      // Pyramidal mountain peak with main sharp ridges
      const frac = i / (total * 0.85); // 0 to 1 down the mountain
      const y = -1.15 + frac * 1.95; // peak at -1.15, base at 0.8
      const radiusAtY = Math.pow(frac, 0.85) * 1.65; // cone spread

      // Ridge facets (3 main ridges like Matterhorn)
      const ridgeIndex = i % 3;
      const baseRidgeAngle = (ridgeIndex * 2 * Math.PI) / 3;
      // Slight angular spread around ridges
      const spread = (Math.sin(i * 12.9898) * 0.45) * Math.pow(frac, 0.6);
      const angle = baseRidgeAngle + spread;

      const isRidgeLine = Math.abs(spread) < 0.06;
      const r = isRidgeLine ? radiusAtY * 1.05 : radiusAtY * (0.85 + Math.abs(Math.cos(angle * 3)) * 0.15);

      const x = r * Math.sin(angle);
      const z = r * Math.cos(angle);

      const color = isRidgeLine
        ? '#ffb829' // Golden illuminated ridge
        : ridgeIndex === 0
        ? '#8052ff' // Iris facet
        : ridgeIndex === 1
        ? '#15846e' // Verdant shadow facet
        : '#38bdf8'; // Icy blue facet

      return {
        x,
        y,
        z,
        color,
        size: isRidgeLine ? 2.8 : 2.0,
      };
    }

    // -------------------------------------------------------------
    // SHAPE 1: 3D GLOBE / PLANET EARTH (Планета)
    // -------------------------------------------------------------
    function getGlobePoint(i: number, total: number): Point3D {
      const R = 1.35;
      const phi = Math.acos(-1 + (2 * i) / total);
      const theta = Math.sqrt(total * Math.PI) * phi;

      const lat = phi - Math.PI / 2;
      const lon = theta;

      // Continental landmasses vs oceans
      const continentShape =
        Math.sin(lat * 3.0 + lon * 2.0) * Math.cos(lon * 2.0 - lat) +
        0.3 * Math.sin(lat * 7.0);

      const isLand = continentShape > 0.1 || Math.abs(lat) < 0.04; // continents + equator
      const rad = isLand ? R : R * 0.95;

      const x = rad * Math.sin(phi) * Math.cos(theta);
      const y = rad * Math.cos(phi);
      const z = rad * Math.sin(phi) * Math.sin(theta);

      const color = isLand
        ? Math.random() > 0.4
          ? '#ffb829' // Golden continents
          : '#8052ff' // Iris mountain chains
        : '#15846e'; // Deep ocean

      return {
        x,
        y,
        z,
        color,
        size: isLand ? 2.6 : 1.8,
      };
    }

    // -------------------------------------------------------------
    // SHAPE 2: CAMPFIRE & ALPINE TENT (Костер и Палатка)
    // -------------------------------------------------------------
    function getCampfireTentPoint(i: number, total: number): Point3D {
      // 50% particles: A-frame Tent
      if (i < total * 0.5) {
        const u = (i / (total * 0.5)); // 0..1 along tent length
        const z = -0.9 + u * 1.8;
        const side = i % 2 === 0 ? 1 : -1;
        const v = ((i * 13) % 100) / 100; // from ridge (0) to ground (1)

        const ridgeY = -0.85;
        const groundY = 0.75;
        const y = ridgeY + v * (groundY - ridgeY);
        const x = side * v * 1.15;

        const isRidge = v < 0.08;
        return {
          x,
          y,
          z,
          color: isRidge ? '#ffb829' : side > 0 ? '#8052ff' : '#15846e',
          size: isRidge ? 2.8 : 2.0,
        };
      }

      // 35% particles: Campfire Flame (bulb/flame shape like in user Image 2)
      if (i < total * 0.85) {
        const t = (i - total * 0.5) / (total * 0.35); // 0..1 from base to tip of flame
        const flameY = 0.75 - t * 1.55; // rises upwards
        // Tear-drop / flame width
        const widthAtT = Math.sin(t * Math.PI) * (1 - t * 0.5) * 0.65;
        const angle = i * 2.39996; // Golden angle distribution
        const r = Math.sqrt(((i * 7) % 100) / 100) * widthAtT;

        const x = 0.0 + r * Math.cos(angle);
        const z = 0.85 + r * Math.sin(angle);

        const color =
          t < 0.25
            ? '#ffffff' // White base
            : t < 0.65
            ? '#ffb829' // Golden core
            : '#d946ef'; // Magenta tip

        return {
          x,
          y: flameY,
          z,
          color,
          size: 2.2 + (1 - t) * 1.6,
        };
      }

      // 15% Stars around camp
      const starIdx = i - total * 0.85;
      const angle = starIdx * 0.35;
      const rad = 1.3 + (starIdx % 20) * 0.05;
      return {
        x: rad * Math.cos(angle) * 1.5,
        y: -1.0 - (starIdx % 15) * 0.03,
        z: rad * Math.sin(angle),
        color: '#ffb829',
        size: 1.8,
      };
    }

    // -------------------------------------------------------------
    // SHAPE 3: 3D COMPASS ROSE & BALANCE EMBLEM (Компас)
    // -------------------------------------------------------------
    function getCompassPoint(i: number, total: number): Point3D {
      // 35% Concentric celestial rings
      if (i < total * 0.35) {
        const angle = (i / (total * 0.35)) * Math.PI * 2;
        const ringRad = i % 2 === 0 ? 1.38 : 1.08;
        return {
          x: ringRad * Math.cos(angle),
          y: ringRad * Math.sin(angle),
          z: ((i * 7) % 20 - 10) * 0.008,
          color: ringRad > 1.2 ? '#8052ff' : '#ffb829',
          size: 2.2,
        };
      }

      // 65% 8-pointed Windrose Compass
      const ptIndex = i % 8;
      const angle = (ptIndex / 8) * Math.PI * 2;
      const isMajor = ptIndex % 2 === 0;
      const armLength = isMajor ? 1.48 : 0.92;

      const subIdx = Math.floor(i / 8);
      const frac = ((subIdx * 19) % 100) / 100;
      const dist = frac * armLength;
      const perpAngle = angle + Math.PI / 2;
      const w = (1 - frac) * 0.18;
      const side = subIdx % 2 === 0 ? 1 : -1;

      return {
        x: dist * Math.cos(angle) + side * w * Math.cos(perpAngle),
        y: dist * Math.sin(angle) + side * w * Math.sin(perpAngle),
        z: (1 - frac) * (subIdx % 5 - 2) * 0.04,
        color: isMajor ? '#ffb829' : '#38bdf8',
        size: isMajor && frac > 0.85 ? 3.4 : 2.2,
      };
    }

    // Initialize all particles with exact positions in each of the 4 shapes
    for (let i = 0; i < TOTAL_PARTICLES; i++) {
      const s0 = getMountainPoint(i, TOTAL_PARTICLES);
      const s1 = getGlobePoint(i, TOTAL_PARTICLES);
      const s2 = getCampfireTentPoint(i, TOTAL_PARTICLES);
      const s3 = getCompassPoint(i, TOTAL_PARTICLES);

      particles.push({
        s0,
        s1,
        s2,
        s3,
        size: s0.size,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.008, // very gentle triangle orientation spin
        color: s0.color,
        alpha: 0.72 + (i % 28) * 0.01, // steady, calm opacity (no twitching!)
      });
    }

    // Foreground 3D wireframe floating geometric triangles (from user reference images)
    const foregroundGlyphs: ForegroundGlyph[] = [
      { x: -1.35, y: -0.4, z: -0.85, size: 46, rotX: 0.2, rotY: 0.1, rotZ: 0.4, speedX: 0.003, speedY: 0.004, speedZ: 0.002, color: '#ffb829' },
      { x: 1.25, y: 0.35, z: -0.8, size: 54, rotX: -0.3, rotY: 0.4, rotZ: 0.1, speedX: -0.002, speedY: 0.005, speedZ: -0.003, color: '#8052ff' },
      { x: 0.95, y: -0.75, z: -1.05, size: 34, rotX: 0.5, rotY: -0.2, rotZ: 0.3, speedX: 0.004, speedY: -0.003, speedZ: 0.004, color: '#15846e' },
      { x: -0.95, y: 0.65, z: -0.75, size: 40, rotX: 0.1, rotY: 0.6, rotZ: -0.3, speedX: -0.003, speedY: 0.004, speedZ: 0.003, color: '#38bdf8' },
    ];

    // Resize handler
    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.floor(rect.width);
      height = Math.floor(rect.height);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(canvas);
    resize();

    // Mouse handlers (smooth parallax tilt)
    function handleMouseMove(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      targetRotY = nx * 0.35;
      targetRotX = -ny * 0.22;
    }

    // Scroll tracking
    function handleScroll() {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const currentScroll = window.scrollY || window.pageYOffset;
      scrollProgress = Math.min(1, Math.max(0, currentScroll / maxScroll));
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Draw single outlined triangle
    function drawTriangle(
      ctx2d: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      angle: number,
      color: string,
      alpha: number
    ) {
      const h = size * 1.15;
      const halfW = size * 0.75;

      ctx2d.save();
      ctx2d.translate(x, y);
      ctx2d.rotate(angle);

      ctx2d.beginPath();
      ctx2d.moveTo(0, -h * 0.6);
      ctx2d.lineTo(halfW, h * 0.4);
      ctx2d.lineTo(-halfW, h * 0.4);
      ctx2d.closePath();

      ctx2d.strokeStyle = color;
      ctx2d.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx2d.lineWidth = 1.25;
      ctx2d.stroke();

      ctx2d.restore();
    }

    // Draw large hollow 3D tumbling tetrahedron
    function drawHollowGlyph(
      ctx2d: CanvasRenderingContext2D,
      g: ForegroundGlyph,
      cx: number,
      cy: number,
      scale: number,
      fov: number
    ) {
      g.rotX += g.speedX;
      g.rotY += g.speedY;
      g.rotZ += g.speedZ;

      const vertices = [
        { x: 0, y: -g.size * 0.8, z: 0 },
        { x: g.size * 0.75, y: g.size * 0.5, z: -g.size * 0.3 },
        { x: -g.size * 0.75, y: g.size * 0.5, z: -g.size * 0.3 },
        { x: 0, y: g.size * 0.2, z: g.size * 0.6 },
      ];

      const cosX = Math.cos(g.rotX);
      const sinX = Math.sin(g.rotX);
      const cosY = Math.cos(g.rotY);
      const sinY = Math.sin(g.rotY);
      const cosZ = Math.cos(g.rotZ);
      const sinZ = Math.sin(g.rotZ);

      const transformed = vertices.map((v) => {
        let x1 = v.x * cosY - v.z * sinY;
        let z1 = v.x * sinY + v.z * cosY;
        let y2 = v.y * cosX - z1 * sinX;
        let z2 = v.y * sinX + z1 * cosX;
        let x3 = x1 * cosZ - y2 * sinZ;
        let y3 = x1 * sinZ + y2 * cosZ;

        const gx = g.x * scale + x3;
        const gy = g.y * scale + y3;
        const gz = g.z + z2 / scale;

        const depth = fov / (fov + gz);
        return {
          sx: cx + gx * depth,
          sy: cy + gy * depth,
        };
      });

      const edges = [
        [0, 1],
        [1, 2],
        [2, 0],
        [0, 3],
        [1, 3],
        [2, 3],
      ];

      ctx2d.save();
      ctx2d.strokeStyle = g.color;
      ctx2d.globalAlpha = 0.55;
      ctx2d.lineWidth = 1.8;

      for (const [e1, e2] of edges) {
        ctx2d.beginPath();
        ctx2d.moveTo(transformed[e1].sx, transformed[e1].sy);
        ctx2d.lineTo(transformed[e2].sx, transformed[e2].sy);
        ctx2d.stroke();
      }

      ctx2d.restore();
    }

    let time = 0;

    function render() {
      time += 0.005; // calm, stately rotation speed

      // Pure void black background
      context.fillStyle = '#000000';
      context.fillRect(0, 0, width, height);

      // Smooth camera interpolation
      curRotY += (targetRotY - curRotY) * 0.05;
      curRotX += (targetRotX - curRotX) * 0.05;

      // Map scroll progress (0..1) smoothly across 4 states:
      // 0.0 -> Mountains (Hero)
      // 1.0 -> Globe (Expeditions)
      // 2.0 -> Campfire & Tent (Friends)
      // 3.0 -> Compass (Smart Split)
      const targetStage = scrollProgress * 3.0;
      smoothScrollStage += (targetStage - smoothScrollStage) * 0.08;

      const stageIndex = Math.min(2, Math.floor(smoothScrollStage));
      const frac = smoothScrollStage - stageIndex;

      // Clean cubic S-curve easing: NO jitter, pure laminar transition!
      const easeFrac = frac * frac * (3 - 2 * frac);

      // Stately continuous 3D rotation of the entire object around Y axis
      const baseAngleY = curRotY + time * 0.35;
      const baseAngleX = curRotX;

      const cosY = Math.cos(baseAngleY);
      const sinY = Math.sin(baseAngleY);
      const cosX = Math.cos(baseAngleX);
      const sinX = Math.sin(baseAngleX);

      // Centered or slightly shifted right on wide screens
      const cx = width > 1024 ? width * 0.62 : width * 0.5;
      const cy = height * 0.5;
      const scale = Math.min(width, height) * 0.38;
      const fov = 4.2;

      const toRender: {
        x: number;
        y: number;
        z: number;
        size: number;
        angle: number;
        color: string;
        alpha: number;
      }[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.angle += p.rotSpeed;

        // Fetch start and end points for current morph interval
        let fromPt: Point3D;
        let toPt: Point3D;

        if (stageIndex === 0) {
          fromPt = p.s0;
          toPt = p.s1;
        } else if (stageIndex === 1) {
          fromPt = p.s1;
          toPt = p.s2;
        } else {
          fromPt = p.s2;
          toPt = p.s3;
        }

        // LAMINAR SMOOTH INTERPOLATION: NO BROWNIAN NOISE!
        const bx = fromPt.x + (toPt.x - fromPt.x) * easeFrac;
        const by = fromPt.y + (toPt.y - fromPt.y) * easeFrac;
        const bz = fromPt.z + (toPt.z - fromPt.z) * easeFrac;

        const currentColor = easeFrac > 0.5 ? toPt.color : fromPt.color;
        const currentSize = fromPt.size + (toPt.size - fromPt.size) * easeFrac;

        // Solid rigid 3D object rotation
        const x1 = bx * cosY - bz * sinY;
        const z1 = bx * sinY + bz * cosY;
        const y2 = by * cosX - z1 * sinX;
        const z2 = by * sinX + z1 * cosX;

        const depth = fov / (fov + z2);
        const screenX = cx + x1 * scale * depth;
        const screenY = cy + y2 * scale * depth;

        toRender.push({
          x: screenX,
          y: screenY,
          z: z2,
          size: currentSize * depth,
          angle: p.angle,
          color: currentColor,
          alpha: p.alpha,
        });
      }

      // Depth sort particles
      toRender.sort((a, b) => b.z - a.z);

      for (let i = 0; i < toRender.length; i++) {
        const p = toRender[i];
        drawTriangle(context, p.x, p.y, p.size, p.angle, p.color, p.alpha);
      }

      // Draw foreground tumbling wireframe triangles
      for (let k = 0; k < foregroundGlyphs.length; k++) {
        drawHollowGlyph(context, foregroundGlyphs[k], cx, cy, scale, fov);
      }

      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      className={`constellation-container ${className}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          background: '#000000',
        }}
        aria-label="3D созвездие: горы, глобус, костер и компас"
        role="img"
      />
    </div>
  );
}
