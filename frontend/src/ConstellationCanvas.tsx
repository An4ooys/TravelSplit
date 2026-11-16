import { useEffect, useRef } from 'react';

type Particle = {
  bx: number;
  by: number;
  bz: number;
  size: number;
  angle: number;
  rotSpeed: number;
  color: string;
  alpha: number;
  phase: number;
  pulseSpeed: number;
  isRidge?: boolean;
  isStar?: boolean;
};

const CHROMATIC_PALETTE = [
  '#8052ff', // Electric Iris (dominant violet)
  '#8052ff',
  '#ffb829', // Saffron Spark (warm amber)
  '#ffb829',
  '#15846e', // Deep Verdant (teal)
  '#d946ef', // Vivid Magenta
  '#38bdf8', // Neon Sky Blue
  '#c084fc', // Soft Iris
];

const RIDGE_PALETTE = [
  '#ffb829', // Saffron Spark for glowing ridge lines
  '#8052ff', // Electric Iris
  '#ffffff', // Bone White accent
  '#38bdf8', // Icy Blue
];

export default function ConstellationCanvas({
  className = '',
  preset = 'mountains',
}: {
  className?: string;
  preset?: 'mountains' | 'altai' | 'norway' | 'switzerland';
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
    let mouseX = 0;
    let mouseY = 0;
    let targetRotY = 0;
    let targetRotX = 0;
    let curRotY = 0;
    let curRotX = 0;
    let mouseOver = false;

    // Generate constellation mountain range particles
    const particles: Particle[] = [];

    // Define main mountain summits (x, height, z, spread)
    const summits = [
      { x: 0.0, y: 1.25, z: 0.0, spreadX: 0.95, spreadZ: 0.8 }, // Main Central Peak (Matterhorn / Belukha)
      { x: -0.95, y: 0.92, z: 0.25, spreadX: 0.8, spreadZ: 0.75 }, // Left Peak
      { x: 0.9, y: 0.98, z: -0.2, spreadX: 0.85, spreadZ: 0.7 }, // Right Spire
      { x: -1.65, y: 0.65, z: -0.4, spreadX: 0.7, spreadZ: 0.6 }, // Far Left Shoulder
      { x: 1.6, y: 0.7, z: 0.2, spreadX: 0.75, spreadZ: 0.65 }, // Far Right Shoulder
      { x: -0.45, y: 0.55, z: 0.65, spreadX: 0.65, spreadZ: 0.5 }, // Foreground Ridge Left
      { x: 0.5, y: 0.5, z: 0.75, spreadX: 0.65, spreadZ: 0.55 }, // Foreground Ridge Right
    ];

    // Calculate mountain surface height at (x, z)
    function getMountainHeight(x: number, z: number): { height: number; isRidge: boolean } {
      let maxH = -0.6;
      let nearRidge = false;

      for (const s of summits) {
        const dx = (x - s.x) / s.spreadX;
        const dz = (z - s.z) / s.spreadZ;
        const dist = Math.sqrt(dx * dx + dz * dz);

        // Pyramid-like faceted mountain geometry with sharp ridges
        const ridgeAngle1 = Math.abs(dx * 0.866 - dz * 0.5);
        const ridgeAngle2 = Math.abs(dx);
        const ridgeDist = Math.min(ridgeAngle1, ridgeAngle2);

        // Height falls off with distance from peak
        const h = s.y - dist * 1.15 + (1 - Math.min(1, ridgeDist * 4.5)) * 0.18;

        // Subtle noise variation
        const noise =
          0.04 * Math.sin(x * 9.0 + z * 6.0) +
          0.02 * Math.cos(x * 16.0 - z * 12.0);

        const currentH = h + noise;
        if (currentH > maxH) {
          maxH = currentH;
          if (dist < 0.25 || ridgeDist < 0.08) {
            nearRidge = true;
          } else {
            nearRidge = false;
          }
        }
      }

      return { height: maxH, isRidge: nearRidge };
    }

    // 1. Generate mountain slopes & peaks particles
    const mountainParticleCount = 1900;
    for (let i = 0; i < mountainParticleCount; i++) {
      const x = (Math.random() - 0.5) * 4.4;
      const z = (Math.random() - 0.5) * 2.2;
      const { height: h, isRidge } = getMountainHeight(x, z);

      if (h > -0.45) {
        // Particles concentrate on the mountain surface and crests
        const yOffset = (Math.random() - 0.5) * (isRidge ? 0.03 : 0.09);
        const y = h + yOffset - 0.35; // centered vertically

        const color = isRidge
          ? RIDGE_PALETTE[Math.floor(Math.random() * RIDGE_PALETTE.length)]
          : CHROMATIC_PALETTE[Math.floor(Math.random() * CHROMATIC_PALETTE.length)];

        particles.push({
          bx: x,
          by: -y, // canvas Y points down
          bz: z,
          size: isRidge ? 2.6 + Math.random() * 2.4 : 1.8 + Math.random() * 2.2,
          angle: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.02,
          color,
          alpha: isRidge ? 0.75 + Math.random() * 0.25 : 0.4 + Math.random() * 0.45,
          phase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.015 + Math.random() * 0.025,
          isRidge,
        });
      }
    }

    // 2. Generate starry night constellation particles in the sky above the peaks
    const starCount = 280;
    for (let i = 0; i < starCount; i++) {
      const x = (Math.random() - 0.5) * 4.6;
      const y = -0.7 - Math.random() * 0.95; // above the mountains
      const z = -0.5 + (Math.random() - 0.5) * 2.0;

      const color =
        Math.random() > 0.4
          ? '#ffb829' // Warm star
          : Math.random() > 0.5
          ? '#8052ff' // Violet star
          : '#ffffff'; // White spark

      particles.push({
        bx: x,
        by: y,
        bz: z,
        size: 1.5 + Math.random() * 2.5,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.015,
        color,
        alpha: 0.35 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.04,
        isStar: true,
      });
    }

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

    // Mouse handlers for tactile tilting
    function handleMouseMove(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      mouseX = nx;
      mouseY = ny;
      targetRotY = nx * 0.42;
      targetRotX = -ny * 0.25;
      mouseOver = true;
    }

    function handleMouseLeave() {
      targetRotY = 0;
      targetRotX = 0;
      mouseOver = false;
    }

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Draw an outlined equilateral triangle
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
      ctx2d.lineWidth = 1.2;
      ctx2d.stroke();

      ctx2d.restore();
    }

    let time = 0;

    function render() {
      time += 0.007;

      // Pure void black background
      context.fillStyle = '#000000';
      context.fillRect(0, 0, width, height);

      // Smooth camera interpolation
      curRotY += (targetRotY - curRotY) * 0.05;
      curRotX += (targetRotX - curRotX) * 0.05;

      // Base gentle breathing and floating motion
      const baseAngleY = curRotY + Math.sin(time * 0.3) * 0.04;
      const baseAngleX = curRotX + Math.cos(time * 0.2) * 0.03;

      const cosY = Math.cos(baseAngleY);
      const sinY = Math.sin(baseAngleY);
      const cosX = Math.cos(baseAngleX);
      const sinX = Math.sin(baseAngleX);

      // Projection center and scaling
      const cx = width * 0.5;
      const cy = height * 0.52;
      const scale = Math.min(width, height) * 0.36;
      const fov = 4.2;

      // Subtle breathing expansion
      const breath = 1.0 + Math.sin(time * 1.2) * 0.012;

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
        p.phase += p.pulseSpeed;

        const bx = p.bx * breath;
        const by = p.by * breath;
        const bz = p.bz * breath;

        // 3D rotation
        const x1 = bx * cosY - bz * sinY;
        const z1 = bx * sinY + bz * cosY;
        const y2 = by * cosX - z1 * sinX;
        const z2 = by * sinX + z1 * cosX;

        const depth = fov / (fov + z2);
        const screenX = cx + x1 * scale * depth;
        const screenY = cy + y2 * scale * depth;

        // Proximity glow
        let proximityBoost = 0;
        if (mouseOver) {
          const dx = screenX - (cx + mouseX * width * 0.4);
          const dy = screenY - (cy + mouseY * height * 0.4);
          const distSq = dx * dx + dy * dy;
          if (distSq < 16000) {
            proximityBoost = (1 - distSq / 16000) * 0.5;
          }
        }

        const pulseAlpha = (p.alpha + proximityBoost) * (0.7 + 0.3 * Math.sin(p.phase));
        const effectiveSize = (p.size + proximityBoost * 2.0) * depth;

        toRender.push({
          x: screenX,
          y: screenY,
          z: z2,
          size: effectiveSize,
          angle: p.angle,
          color: p.color,
          alpha: pulseAlpha,
        });
      }

      // Depth sort back-to-front
      toRender.sort((a, b) => b.z - a.z);

      for (let i = 0; i < toRender.length; i++) {
        const p = toRender[i];
        drawTriangle(context, p.x, p.y, p.size, p.angle, p.color, p.alpha);
      }

      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [preset]);

  return (
    <div
      className={`constellation-container ${className}`}
      style={{ position: 'relative', width: '100%', height: '100%' }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          background: '#000000',
        }}
        aria-label="Созвездие горных вершин из светящихся треугольных частиц"
        role="img"
      />
    </div>
  );
}
