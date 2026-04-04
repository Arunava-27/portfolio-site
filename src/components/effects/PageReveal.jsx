import { useEffect, useRef, useState, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { gsap } from "gsap";
import * as THREE from "three";

// ─── 3D: Central orb — wireframe icosahedron + orbiting rings ────────────────

function LoaderCore({ scaleProxy }) {
  const groupRef  = useRef();
  const spinRef   = useRef();
  const ring1     = useRef();
  const ring2     = useRef();
  const ring3     = useRef();

  // Entrance: GSAP animates scale via scaleProxy, applied each frame
  useEffect(() => {
    scaleProxy.current = { val: 0 };
    gsap.to(scaleProxy.current, { val: 1, duration: 0.75, ease: "back.out(1.6)" });
    // Expose Three.js group so parent can trigger implosion
    scaleProxy.threeGroup = groupRef.current ?? null;
  });

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // Apply GSAP-driven scale
    if (groupRef.current && scaleProxy.current) {
      groupRef.current.scale.setScalar(scaleProxy.current.val);
    }

    if (spinRef.current) {
      spinRef.current.rotation.y += delta * 0.68;
      spinRef.current.rotation.x = Math.sin(t * 0.38) * 0.18;
    }
    if (ring1.current) ring1.current.rotation.z += delta * 0.88;
    if (ring2.current) ring2.current.rotation.x += delta * 0.58;
    if (ring3.current) ring3.current.rotation.y += delta * 0.32;
  });

  return (
    <group ref={groupRef}>
      {/* Layered cyan atmosphere */}
      {[1.52, 1.72, 1.92].map((s, i) => (
        <mesh key={i} scale={s}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color="#00f5ff" transparent opacity={0.022 - i * 0.006} side={THREE.BackSide} />
        </mesh>
      ))}
      {/* Violet atmosphere */}
      <mesh scale={1.65}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.016} side={THREE.BackSide} />
      </mesh>

      {/* Spinning wireframe icosahedron */}
      <group ref={spinRef}>
        <mesh>
          <icosahedronGeometry args={[1.12, 3]} />
          <meshStandardMaterial wireframe color="#00f5ff" emissive="#00f5ff" emissiveIntensity={1.15} />
        </mesh>
        {/* Dark core */}
        <mesh>
          <sphereGeometry args={[1.02, 32, 32]} />
          <meshStandardMaterial color="#000814" emissive="#000f1a" emissiveIntensity={1} transparent opacity={0.96} />
        </mesh>
      </group>

      {/* Ring 1 — cyan, XZ plane */}
      <mesh ref={ring1} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.62, 0.016, 16, 100]} />
        <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={1.8} />
      </mesh>
      {/* Ring 2 — violet, tilted */}
      <mesh ref={ring2} rotation={[0.45, 0.15, 0]}>
        <torusGeometry args={[1.42, 0.011, 16, 100]} />
        <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={1.5} />
      </mesh>
      {/* Ring 3 — pink, outer */}
      <mesh ref={ring3} rotation={[0.9, 0.5, 0.3]}>
        <torusGeometry args={[1.88, 0.009, 16, 100]} />
        <meshStandardMaterial color="#ff00aa" emissive="#ff00aa" emissiveIntensity={1.1} transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

// ─── 3D: Floating particle cloud ─────────────────────────────────────────────

function LoaderParticles({ count = 240 }) {
  const ref = useRef();

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2.4 + Math.random() * 5.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      if (Math.random() > 0.45) {
        col[i * 3] = 0; col[i * 3 + 1] = 0.96; col[i * 3 + 2] = 1; // cyan
      } else {
        col[i * 3] = 0.55; col[i * 3 + 1] = 0.36; col[i * 3 + 2] = 1; // violet
      }
    }
    return [pos, col];
  }, [count]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.13;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.045} vertexColors transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

// ─── 3D: Cyber grid floor ─────────────────────────────────────────────────────

function LoaderGrid() {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) ref.current.position.z = ((state.clock.elapsedTime * 0.5) % 2);
  });
  return (
    <gridHelper
      ref={ref}
      args={[30, 30, "#00f5ff", "#001822"]}
      position={[0, -2.8, 0]}
    />
  );
}

// ─── Full loader scene ────────────────────────────────────────────────────────

function LoaderScene({ scaleProxy }) {
  return (
    <>
      <color attach="background" args={["#000814"]} />
      <fog attach="fog" args={["#000814", 14, 30]} />
      <ambientLight intensity={0.04} />
      <pointLight position={[5, 3, 5]}  color="#00f5ff" intensity={4}   distance={22} />
      <pointLight position={[-4, -3, 4]} color="#8b5cf6" intensity={2.5} distance={18} />
      <LoaderCore scaleProxy={scaleProxy} />
      <LoaderParticles />
      <LoaderGrid />
    </>
  );
}

// ─── HUD: typing label component ─────────────────────────────────────────────

const LABELS = [
  "LOADING ASSETS...",
  "INITIALIZING 3D ENGINE...",
  "ESTABLISHING SECURE CONNECTION...",
  "PORTFOLIO ONLINE",
];

function TypingLabel({ labelRef }) {
  const [text, setText] = useState("");
  const [labelIdx, setLabelIdx] = useState(0);

  useEffect(() => {
    let timeout;
    let charIdx = 0;
    const label = LABELS[labelIdx];

    function typeNext() {
      charIdx++;
      setText(label.slice(0, charIdx));
      if (charIdx < label.length) {
        timeout = setTimeout(typeNext, 38);
      }
    }
    typeNext();
    return () => clearTimeout(timeout);
  }, [labelIdx]);

  // Advance label on cue — labelRef.advance() called by GSAP
  useEffect(() => {
    labelRef.current = {
      advance: () => setLabelIdx((i) => Math.min(i + 1, LABELS.length - 1)),
    };
  }, [labelRef]);

  return (
    <span style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.22em", color: "rgba(0,245,255,0.7)" }}>
      {text}
      <span style={{ animation: "blink 0.8s step-end infinite" }}>█</span>
    </span>
  );
}

// ─── Main PageReveal ──────────────────────────────────────────────────────────

export default function PageReveal() {
  const overlayRef  = useRef(null);
  const hudRef      = useRef(null);
  const progressRef = useRef(null);
  const labelRef    = useRef(null);
  const scaleProxy  = useRef({ val: 0 }); // bridges GSAP ↔ Three.js scale
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!overlayRef.current) return;

    const tl = gsap.timeline();

    // 1 — HUD fades in
    tl.fromTo(hudRef.current,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" },
      0.55
    )
    // 2 — Progress bar fills
    .to(progressRef.current, {
      scaleX: 1,
      duration: 1.15,
      ease: "power2.inOut",
    }, 0.65)
    // 3 — Advance label mid-way
    .call(() => labelRef.current?.advance(), null, 1.0)
    .call(() => labelRef.current?.advance(), null, 1.5)
    .call(() => labelRef.current?.advance(), null, 1.75)
    // 4 — Orb implosion: spin up + scale to 0
    .call(() => {
      if (scaleProxy.current) {
        gsap.to(scaleProxy.current, {
          val: 0,
          duration: 0.38,
          ease: "back.in(2.2)",
        });
      }
    }, null, 1.9)
    // 5 — HUD fades out
    .to(hudRef.current, {
      opacity: 0, y: -12,
      duration: 0.3,
      ease: "power2.in",
    }, 2.0)
    // 6 — Overlay slides up
    .to(overlayRef.current, {
      yPercent: -100,
      duration: 0.9,
      ease: "power4.inOut",
      onComplete: () => setDone(true),
    }, 2.2);

    return () => tl.kill();
  }, []);

  if (done) return null;

  return (
    <div
      ref={overlayRef}
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#000814", overflow: "hidden" }}
      aria-hidden="true"
    >
      {/* ── 3D Canvas ── */}
      <div style={{ position: "absolute", inset: 0 }}>
        <Canvas camera={{ position: [0, 0, 5.5], fov: 52 }} gl={{ antialias: true }} dpr={[1, 1.6]}>
          <Suspense fallback={null}>
            <LoaderScene scaleProxy={scaleProxy} />
          </Suspense>
        </Canvas>
      </div>

      {/* ── CRT scanlines ── */}
      <div
        style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,245,255,0.012) 2px,rgba(0,245,255,0.012) 4px)",
        }}
      />

      {/* ── Corner HUD brackets ── */}
      {[
        { top: 24, left: 24,  borderTop: "2px solid rgba(0,245,255,0.45)", borderLeft:  "2px solid rgba(0,245,255,0.45)" },
        { top: 24, right: 24, borderTop: "2px solid rgba(139,92,246,0.45)", borderRight: "2px solid rgba(139,92,246,0.45)" },
        { bottom: 24, left: 24,  borderBottom: "2px solid rgba(0,245,255,0.45)", borderLeft:  "2px solid rgba(0,245,255,0.45)" },
        { bottom: 24, right: 24, borderBottom: "2px solid rgba(139,92,246,0.45)", borderRight: "2px solid rgba(139,92,246,0.45)" },
      ].map((style, i) => (
        <div key={i} style={{ position: "absolute", width: 28, height: 28, pointerEvents: "none", ...style }} />
      ))}

      {/* ── HUD info strip ── */}
      <div
        ref={hudRef}
        style={{
          position: "absolute",
          bottom: "14%",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          opacity: 0,
          pointerEvents: "none",
          minWidth: 260,
        }}
      >
        {/* Typing label */}
        <div style={{ marginBottom: 14 }}>
          <TypingLabel labelRef={labelRef} />
        </div>

        {/* Name */}
        <div style={{
          color: "white", fontFamily: "Inter, sans-serif", fontWeight: 900,
          fontSize: 20, letterSpacing: "0.12em", textTransform: "uppercase",
          textShadow: "0 0 20px rgba(0,245,255,0.4)",
          marginBottom: 4,
        }}>
          ARUNAVA KUNDU
        </div>
        <div style={{
          color: "rgba(139,92,246,0.8)", fontFamily: "monospace",
          fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
          marginBottom: 18,
        }}>
          FULL STACK DEV // CYBERSECURITY
        </div>

        {/* Progress bar */}
        <div style={{
          width: "100%", height: 2, background: "rgba(0,245,255,0.12)",
          borderRadius: 2, overflow: "hidden", position: "relative",
        }}>
          <div
            ref={progressRef}
            style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(90deg, #8b5cf6, #00f5ff, #8b5cf6)",
              backgroundSize: "200% 100%",
              transformOrigin: "left center",
              transform: "scaleX(0)",
              animation: "gradient-shift 2s linear infinite",
            }}
          />
        </div>
      </div>

      {/* Blink keyframe (injected inline for isolation) */}
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  );
}

