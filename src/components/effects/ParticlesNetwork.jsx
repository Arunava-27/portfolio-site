import { useEffect, useRef } from "react";

const PARTICLE_COUNT = 72;
const MAX_LINK_DIST = 160;
const MOUSE_REPEL_RADIUS = 110;

export default function ParticlesNetwork() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();

    // Fewer particles on small screens for performance
    const count = window.innerWidth < 768 ? 40 : PARTICLE_COUNT;

    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: 1.4 + Math.random() * 1.2,
      // Alternate node types: cyan (network) or violet (data)
      cyan: Math.random() > 0.42,
    }));

    const mouse = { x: -9999, y: -9999 };
    let rafId;

    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    const onResize = () => {
      resize();
    };
    window.addEventListener("resize", onResize, { passive: true });

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ── Update positions ──────────────────────────────────────────
      for (const p of particles) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        const d = Math.sqrt(d2);

        if (d < MOUSE_REPEL_RADIUS && d > 0) {
          const strength = (MOUSE_REPEL_RADIUS - d) / MOUSE_REPEL_RADIUS;
          p.vx += (dx / d) * strength * 0.28;
          p.vy += (dy / d) * strength * 0.28;
        }

        // Velocity damping
        p.vx *= 0.975;
        p.vy *= 0.975;

        // Speed cap
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > 1.4) {
          p.vx = (p.vx / spd) * 1.4;
          p.vy = (p.vy / spd) * 1.4;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < -20) p.x = canvas.width + 20;
        else if (p.x > canvas.width + 20) p.x = -20;
        if (p.y < -20) p.y = canvas.height + 20;
        else if (p.y > canvas.height + 20) p.y = -20;
      }

      // ── Draw connections ─────────────────────────────────────────
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < MAX_LINK_DIST) {
            const t = 1 - dist / MAX_LINK_DIST;
            const alpha = t * t * 0.22;

            // Gradient line from node a colour to node b colour
            const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            const [ra, ga, ba] = a.cyan ? [0, 245, 255] : [139, 92, 246];
            const [rb, gb, bb] = b.cyan ? [0, 245, 255] : [139, 92, 246];
            grad.addColorStop(0, `rgba(${ra},${ga},${ba},${alpha})`);
            grad.addColorStop(1, `rgba(${rb},${gb},${bb},${alpha})`);

            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // ── Draw nodes ───────────────────────────────────────────────
      for (const p of particles) {
        const [r, g, b] = p.cyan ? [0, 245, 255] : [139, 92, 246];

        // Outer glow halo
        const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
        halo.addColorStop(0, `rgba(${r},${g},${b},0.12)`);
        halo.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
        ctx.fillStyle = halo;
        ctx.fill();

        // Node core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},0.75)`;
        ctx.fill();

        // Bright centre highlight
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,0.45)`;
        ctx.fill();
      }

      rafId = requestAnimationFrame(tick);
    }

    tick();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.35,
      }}
      aria-hidden="true"
    />
  );
}
