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
  s0: Point3D; // Mountain Peaks (Hero)
  s1: Point3D; // 3D Globe (Expeditions)
  s2: Point3D; // 3D Compass (Friends / Navigation)
  s3: Point3D; // 3D Star (Split / Balance)

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

    // Scroll stage tracking
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

      const isLand = continentShape > 0.1 || Math.abs(lat) < 0.04;
      const rad = isLand ? R : R * 0.95;

      const x = rad * Math.sin(phi) * Math.cos(theta);
      const y = rad * Math.cos(phi);
      const z = rad * Math.sin(phi) * Math.sin(theta);

      const color = isLand
        ? (i % 3 === 0 ? '#ffb829' : '#8052ff')
        : '#15846e';

      return {
        x,
        y,
        z,
        color,
        size: isLand ? 2.6 : 1.8,
      };
    }

    // -------------------------------------------------------------
    // SHAPE 2: 3D EXPEDITION COMPASS (Компас вместо палатки)
    // -------------------------------------------------------------
    function getCompassPoint(i: number, total: number): Point3D {
      // 30% particles: Azimuth dial rings
      if (i < total * 0.3) {
        const u = i / (total * 0.3);
        const isOuter = i % 2 === 0;
        const ringR = isOuter ? 1.35 : 1.12;
        const angle = u * Math.PI * 2;

        // Tick marks at cardinal directions
        const isCardinal = (i % 8 === 0);
        return {
          x: ringR * Math.cos(angle),
          y: ringR * Math.sin(angle),
          z: isCardinal ? 0.04 : 0.0,
          color: isCardinal ? '#ffb829' : '#8052ff',
          size: isCardinal ? 2.8 : 1.9,
        };
      }

      // 55% particles: 4-pointed magnetic needle
      if (i < total * 0.85) {
        const needleIdx = i - Math.floor(total * 0.3);
        const needleTotal = Math.floor(total * 0.55);
        const arm = needleIdx % 4; // 0=North, 1=South, 2=East, 3=West
        const frac = (Math.floor(needleIdx / 4) / (needleTotal / 4)); // 0 (center) to 1 (tip)

        if (arm === 0) {
          // North Arrow: Points UP (y < 0), sharp golden needle
          const length = 1.55;
          const y = -frac * length;
          const w = (1 - frac) * 0.22;
          const side = needleIdx % 2 === 0 ? 1 : -1;
          const x = side * w * ((needleIdx * 7) % 100) / 100;
          return {
            x,
            y,
            z: (1 - frac) * 0.08,
            color: frac > 0.85 ? '#ffffff' : '#ffb829',
            size: frac > 0.85 ? 3.0 : 2.2,
          };
        } else if (arm === 1) {
          // South Arrow: Points DOWN (y > 0), violet needle
          const length = 1.55;
          const y = frac * length;
          const w = (1 - frac) * 0.22;
          const side = needleIdx % 2 === 0 ? 1 : -1;
          const x = side * w * ((needleIdx * 7) % 100) / 100;
          return {
            x,
            y,
            z: (1 - frac) * 0.08,
            color: '#8052ff',
            size: 2.2,
          };
        } else if (arm === 2) {
          // East Arrow: Points RIGHT (x > 0)
          const length = 1.25;
          const x = frac * length;
          const w = (1 - frac) * 0.16;
          const side = needleIdx % 2 === 0 ? 1 : -1;
          const y = side * w * ((needleIdx * 7) % 100) / 100;
          return {
            x,
            y,
            z: (1 - frac) * 0.05,
            color: '#15846e',
            size: 2.0,
          };
        } else {
          // West Arrow: Points LEFT (x < 0)
          const length = 1.25;
          const x = -frac * length;
          const w = (1 - frac) * 0.16;
          const side = needleIdx % 2 === 0 ? 1 : -1;
          const y = side * w * ((needleIdx * 7) % 100) / 100;
          return {
            x,
            y,
            z: (1 - frac) * 0.05,
            color: '#38bdf8',
            size: 2.0,
          };
        }
      }

      // 15% particles: Center brass jewel & 4 diagonal rays
      const subIdx = i - Math.floor(total * 0.85);
      const subTotal = Math.floor(total * 0.15);
      const diagAngle = ((subIdx % 4) * Math.PI) / 2 + Math.PI / 4;
      const dist = 0.25 + (subIdx / subTotal) * 0.65;
      return {
        x: dist * Math.cos(diagAngle),
        y: dist * Math.sin(diagAngle),
        z: (subIdx % 5 - 2) * 0.02,
        color: '#ffb829',
        size: 2.0,
      };
    }

    // -------------------------------------------------------------
    // SHAPE 3: 3D MULTI-POINTED GEOMETRIC STAR (Звезда баланса)
    // -------------------------------------------------------------
    function getStarPoint(i: number, total: number): Point3D {
      // 60% particles: 6 Cardinal 3D Spikes (+Y, -Y, +X, -X, +Z, -Z)
      if (i < total * 0.6) {
        const spikeTotal = Math.floor(total * 0.6);
        const spikeIdx = i % 6;
        const frac = Math.floor(i / 6) / (spikeTotal / 6); // 0 (center) to 1 (sharp apex)
        const armLength = 1.62;
        const dist = frac * armLength;
        const w = Math.pow(1 - frac, 1.2) * 0.28; // pyramidal tapering

        const sideAngle = (i * 2.39996);
        const sideR = w * Math.sqrt(((i * 13) % 100) / 100);
        const off1 = sideR * Math.cos(sideAngle);
        const off2 = sideR * Math.sin(sideAngle);

        let x = 0;
        let y = 0;
        let z = 0;

        if (spikeIdx === 0) {
          // Top spike (+Y up)
          y = -dist;
          x = off1;
          z = off2;
        } else if (spikeIdx === 1) {
          // Bottom spike (-Y down)
          y = dist;
          x = off1;
          z = off2;
        } else if (spikeIdx === 2) {
          // Right spike (+X)
          x = dist;
          y = off1;
          z = off2;
        } else if (spikeIdx === 3) {
          // Left spike (-X)
          x = -dist;
          y = off1;
          z = off2;
        } else if (spikeIdx === 4) {
          // Front 3D spike (+Z)
          z = dist;
          x = off1;
          y = off2;
        } else {
          // Back 3D spike (-Z)
          z = -dist;
          x = off1;
          y = off2;
        }

        const isApex = frac > 0.88;
        return {
          x,
          y,
          z,
          color: isApex ? '#ffffff' : frac > 0.5 ? '#ffb829' : '#8052ff',
          size: isApex ? 3.2 : 2.2,
        };
      }

      // 25% particles: 8 Diagonal 3D Octant Spikes (Stella Octangula)
      if (i < total * 0.85) {
        const octantIdx = i % 8;
        const sx = octantIdx & 1 ? 1 : -1;
        const sy = octantIdx & 2 ? 1 : -1;
        const sz = octantIdx & 4 ? 1 : -1;

        const subFrac = ((i * 17) % 100) / 100;
        const len = subFrac * 1.18;
        const norm = Math.sqrt(3);

        const x = (sx / norm) * len;
        const y = (sy / norm) * len;
        const z = (sz / norm) * len;

        const isTip = subFrac > 0.85;
        return {
          x,
          y,
          z,
          color: isTip ? '#38bdf8' : '#8052ff',
          size: isTip ? 2.8 : 2.0,
        };
      }

      // 15% particles: Center Glowing Starlight Nucleus
      const coreIdx = i - Math.floor(total * 0.85);
      const coreTotal = Math.floor(total * 0.15);
      const phi = Math.acos(-1 + (2 * coreIdx) / coreTotal);
      const theta = Math.sqrt(coreTotal * Math.PI) * phi;
      const coreR = Math.pow(((coreIdx * 19) % 100) / 100, 0.5) * 0.35;

      return {
        x: coreR * Math.sin(phi) * Math.cos(theta),
        y: coreR * Math.cos(phi),
        z: coreR * Math.sin(phi) * Math.sin(theta),
        color: coreIdx % 2 === 0 ? '#ffb829' : '#ffffff',
        size: 2.4,
      };
    }

    // Initialize all particles with exact positions in each of the 4 shapes
    for (let i = 0; i < TOTAL_PARTICLES; i++) {
      const s0 = getMountainPoint(i, TOTAL_PARTICLES);
      const s1 = getGlobePoint(i, TOTAL_PARTICLES);
      const s2 = getCompassPoint(i, TOTAL_PARTICLES);
      const s3 = getStarPoint(i, TOTAL_PARTICLES);

      particles.push({
        s0,
        s1,
        s2,
        s3,
        size: s0.size,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.008,
        color: s0.color,
        alpha: 0.72 + (i % 28) * 0.01,
      });
    }

    // Foreground 3D wireframe floating geometric tetrahedrons (placed on right side so text is never overlapped)
    const foregroundGlyphs: ForegroundGlyph[] = [
      { x: 1.35, y: -0.5, z: -0.85, size: 48, rotX: 0.2, rotY: 0.1, rotZ: 0.4, speedX: 0.003, speedY: 0.004, speedZ: 0.002, color: '#ffb829' },
      { x: 1.15, y: 0.55, z: -0.8, size: 52, rotX: -0.3, rotY: 0.4, rotZ: 0.1, speedX: -0.002, speedY: 0.005, speedZ: -0.003, color: '#8052ff' },
      { x: 1.45, y: 0.15, z: -1.05, size: 36, rotX: 0.5, rotY: -0.2, rotZ: 0.3, speedX: 0.004, speedY: -0.003, speedZ: 0.004, color: '#15846e' },
      { x: 0.55, y: -0.85, z: -0.75, size: 40, rotX: 0.1, rotY: 0.6, rotZ: -0.3, speedX: -0.003, speedY: 0.004, speedZ: 0.003, color: '#38bdf8' },
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

    // Precise Stage Calculation based on actual section viewport presence
    function getTargetStage(): number {
      const heroEl = document.getElementById('hero-title') || document.querySelector('.dala-section');
      const tripsEl = document.getElementById('trips');
      const friendsEl = document.getElementById('friends');
      const splitEl = document.getElementById('split');

      if (!heroEl || !tripsEl || !friendsEl || !splitEl) {
        const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const cur = window.scrollY || window.pageYOffset;
        return Math.min(3, Math.max(0, (cur / maxScroll) * 3));
      }

      const vCenter = (window.scrollY || window.pageYOffset) + window.innerHeight * 0.48;

      const getY = (el: Element) => {
        const r = el.getBoundingClientRect();
        return r.top + (window.scrollY || window.pageYOffset) + r.height * 0.48;
      };

      const y0 = getY(heroEl);
      const y1 = getY(tripsEl);
      const y2 = getY(friendsEl);
      const y3 = getY(splitEl);

      let raw: number;
      if (vCenter <= y0) {
        raw = 0;
      } else if (vCenter < y1) {
        raw = (vCenter - y0) / Math.max(1, y1 - y0);
      } else if (vCenter < y2) {
        raw = 1 + (vCenter - y1) / Math.max(1, y2 - y1);
      } else if (vCenter < y3) {
        raw = 2 + (vCenter - y2) / Math.max(1, y3 - y2);
      } else {
        // Once viewing Section 3 (Split), the stage is 100% at 3.0!
        raw = 3.0;
      }

      // Generous snap plateau around each integer stage:
      // When the user pauses or views a section, the shape is 100% assembled and solid!
      const nearest = Math.round(raw);
      if (Math.abs(raw - nearest) < 0.22) {
        return nearest;
      }

      return raw;
    }

    window.addEventListener('mousemove', handleMouseMove);

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

      // Map scroll smoothly across 4 states:
      // 0.0 -> Mountains (Hero)
      // 1.0 -> Globe (Expeditions)
      // 2.0 -> Compass (Friends)
      // 3.0 -> Star (Split)
      const targetStage = getTargetStage();
      smoothScrollStage += (targetStage - smoothScrollStage) * 0.10;

      const clampedStage = Math.max(0, Math.min(3, smoothScrollStage));
      const stageIndex = Math.min(2, Math.floor(clampedStage));
      const frac = clampedStage >= 3 ? 1.0 : clampedStage - stageIndex;

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

        // 3D rotation matrix
        let x1 = bx * cosY - bz * sinY;
        let z1 = bx * sinY + bz * cosY;
        let y2 = by * cosX - z1 * sinX;
        let z2 = by * sinX + z1 * cosX;

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
          alpha: p.alpha * Math.min(1, Math.max(0.35, depth * 0.95)),
        });
      }

      // Depth sort particles
      toRender.sort((a, b) => b.z - a.z);

      // Draw all triangles
      for (let i = 0; i < toRender.length; i++) {
        const pt = toRender[i];
        drawTriangle(context, pt.x, pt.y, pt.size, pt.angle, pt.color, pt.alpha);
      }

      // Draw tumbling foreground wireframe tetrahedrons
      for (const g of foregroundGlyphs) {
        drawHollowGlyph(context, g, cx, cy, scale, fov);
      }

      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none z-0 ${className}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  );
}
