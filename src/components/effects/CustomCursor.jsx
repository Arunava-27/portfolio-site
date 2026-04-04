import { useEffect, useRef, useState } from "react";

// Cyberpunk targeting-reticle cursor
// - Inner dot tracks mouse 1:1 (translate3d, no reflows)
// - Outer ring trails behind with lerp factor 0.13
// - Crosshair ticks at N / S / E / W
// - Hover (links/buttons) → expands + turns violet
// - Click → snaps smaller + flashes
// - Only active on pointer-fine (desktop); touch devices keep native cursor

export default function CustomCursor() {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);
  const ticksRef = useRef({ t: null, b: null, l: null, r: null });

  const mouse = useRef({ x: -200, y: -200 });
  const lag   = useRef({ x: -200, y: -200 });
  const rafId = useRef();

  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [active,  setActive]  = useState(false);   // shown after first mouse move

  useEffect(() => {
    // Touch/stylus devices — don't mount
    if (!window.matchMedia("(pointer: fine)").matches) return;

    // ── Event handlers ────────────────────────────────────────────
    const onMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (!active) setActive(true);
    };

    const onOver = (e) => {
      const interactive = e.target.closest(
        "a, button, [role='button'], input, textarea, select, label, [tabindex]"
      );
      setHovered(!!interactive);
    };

    const onDown = () => setPressed(true);
    const onUp   = () => setPressed(false);

    document.addEventListener("mousemove", onMove,  { passive: true });
    document.addEventListener("mouseover", onOver,  { passive: true });
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup",   onUp);

    // ── RAF animation loop ────────────────────────────────────────
    function animate() {
      const mx = mouse.current.x;
      const my = mouse.current.y;

      // Lerp trailing ring
      lag.current.x += (mx - lag.current.x) * 0.13;
      lag.current.y += (my - lag.current.y) * 0.13;

      const lx = lag.current.x;
      const ly = lag.current.y;

      // Dot — offset by half its size (4px) so it's centred on cursor
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mx - 4}px, ${my - 4}px, 0)`;
      }

      // Ring — offset by half its size (varies by state, use 18px base)
      if (ringRef.current) {
        const half = parseInt(ringRef.current.dataset.half || 18);
        ringRef.current.style.transform = `translate3d(${lx - half}px, ${ly - half}px, 0)`;
      }

      rafId.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup",   onUp);
      cancelAnimationFrame(rafId.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Don't render at all on touch devices (SSR / pre-JS safe)
  // Active guard prevents flash before first mouse move
  if (!active && typeof window !== "undefined" &&
      !window.matchMedia("(pointer: fine)").matches) {
    return null;
  }

  // ── Visual config based on state ─────────────────────────────
  const ringSize  = pressed ? 24 : hovered ? 46 : 36;
  const dotSize   = pressed ? 4  : hovered ? 5  : 8;
  const ringHalf  = ringSize / 2;
  const dotHalf   = dotSize  / 2;

  const cyan   = "rgba(0,245,255";
  const violet = "rgba(139,92,246";
  const col    = hovered ? violet : cyan;

  const dotColor  = `${col},${hovered ? 0.9 : 1})`;
  const dotShadow = `0 0 8px ${col},0.9), 0 0 18px ${col},0.4)`;
  const ringBorder = `1.5px solid ${col},${hovered ? 0.8 : pressed ? 1 : 0.55})`;
  const ringShadow = `0 0 12px ${col},${hovered ? 0.25 : 0.1}), inset 0 0 8px ${col},${hovered ? 0.1 : 0.04})`;

  const TICK_COLOR = `${col},${hovered ? 0.8 : 0.5})`;
  const TICK_GAP   = 5;    // gap between ring edge and tick start
  const TICK_LEN   = hovered ? 6 : 4;  // tick length

  return (
    <>
      {/* ── Inner dot ── */}
      <div
        ref={dotRef}
        style={{
          position:        "fixed",
          top:             0,
          left:            0,
          width:           dotSize,
          height:          dotSize,
          borderRadius:    "50%",
          background:      dotColor,
          pointerEvents:   "none",
          zIndex:          99999,
          opacity:         active ? 1 : 0,
          boxShadow:       dotShadow,
          transition:      "width 0.18s ease, height 0.18s ease, background 0.18s ease, box-shadow 0.18s ease",
          willChange:      "transform",
        }}
      />

      {/* ── Trailing ring ── */}
      <div
        ref={ringRef}
        data-half={ringHalf}
        style={{
          position:      "fixed",
          top:           0,
          left:          0,
          width:         ringSize,
          height:        ringSize,
          borderRadius:  "50%",
          border:        ringBorder,
          pointerEvents: "none",
          zIndex:        99998,
          opacity:       active ? 1 : 0,
          boxShadow:     ringShadow,
          transition:    "width 0.22s ease, height 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease, opacity 0.3s ease",
          willChange:    "transform",
          // Slight fill on hover for the "locked-on" look
          background:    hovered ? `${col},0.06)` : "transparent",
        }}
      >
        {/* Crosshair ticks — N */}
        <div style={{
          position:  "absolute",
          top:       -(TICK_GAP + TICK_LEN),
          left:      "50%",
          transform: "translateX(-50%)",
          width:     1,
          height:    TICK_LEN,
          background: TICK_COLOR,
          transition: "background 0.18s ease, height 0.18s ease",
        }} />
        {/* S */}
        <div style={{
          position:  "absolute",
          bottom:    -(TICK_GAP + TICK_LEN),
          left:      "50%",
          transform: "translateX(-50%)",
          width:     1,
          height:    TICK_LEN,
          background: TICK_COLOR,
          transition: "background 0.18s ease, height 0.18s ease",
        }} />
        {/* W */}
        <div style={{
          position:  "absolute",
          top:       "50%",
          left:      -(TICK_GAP + TICK_LEN),
          transform: "translateY(-50%)",
          width:     TICK_LEN,
          height:    1,
          background: TICK_COLOR,
          transition: "background 0.18s ease, width 0.18s ease",
        }} />
        {/* E */}
        <div style={{
          position:  "absolute",
          top:       "50%",
          right:     -(TICK_GAP + TICK_LEN),
          transform: "translateY(-50%)",
          width:     TICK_LEN,
          height:    1,
          background: TICK_COLOR,
          transition: "background 0.18s ease, width 0.18s ease",
        }} />
      </div>
    </>
  );
}
