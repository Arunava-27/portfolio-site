import { useRef, useState, useEffect, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { motion, useMotionValue, useSpring } from "framer-motion";
import * as THREE from "three";

// ─── 3D: Wireframe Icosahedron + orbiting rings ────────────────────────────

function CyberOrb({ mouseRef }) {
  const groupRef = useRef();
  const spinRef = useRef();
  const ring1 = useRef();
  const ring2 = useRef();
  const ring3 = useRef();

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    if (spinRef.current) {
      spinRef.current.rotation.y += delta * 0.38;
      spinRef.current.rotation.x = Math.sin(t * 0.25) * 0.12;
    }
    if (ring1.current) ring1.current.rotation.z += delta * 0.65;
    if (ring2.current) ring2.current.rotation.x += delta * 0.42;
    if (ring3.current) ring3.current.rotation.y += delta * 0.28;

    // Mouse-driven tilt for the whole orb group
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        mouseRef.current.x * 0.45,
        0.04
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        -mouseRef.current.y * 0.28,
        0.04
      );
    }
  });

  return (
    <group ref={groupRef} position={[1.2, 0, 0]}>
      {/* Layered glow halos — simulates bloom */}
      {[1.55, 1.7, 1.88].map((s, i) => (
        <mesh key={i} scale={s}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial
            color="#00f5ff"
            transparent
            opacity={0.025 - i * 0.006}
            side={THREE.BackSide}
          />
        </mesh>
      ))}

      {/* Purple glow halo */}
      <mesh scale={1.65}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#bf00ff" transparent opacity={0.018} side={THREE.BackSide} />
      </mesh>

      {/* Spinning wireframe icosahedron */}
      <group ref={spinRef}>
        <mesh>
          <icosahedronGeometry args={[1.15, 3]} />
          <meshStandardMaterial
            wireframe
            color="#00f5ff"
            emissive="#00f5ff"
            emissiveIntensity={1.1}
          />
        </mesh>
        {/* Dark core so wireframe reads clearly */}
        <mesh>
          <sphereGeometry args={[1.05, 32, 32]} />
          <meshStandardMaterial
            color="#000814"
            emissive="#001a33"
            emissiveIntensity={1}
            transparent
            opacity={0.96}
          />
        </mesh>
      </group>

      {/* Orbiting ring — XZ plane, cyan */}
      <mesh ref={ring1} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.72, 0.016, 16, 120]} />
        <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={1.6} />
      </mesh>

      {/* Orbiting ring — tilted, magenta */}
      <mesh ref={ring2} rotation={[0.4, 0.15, 0]}>
        <torusGeometry args={[1.55, 0.011, 16, 120]} />
        <meshStandardMaterial color="#bf00ff" emissive="#bf00ff" emissiveIntensity={1.4} />
      </mesh>

      {/* Outer orbit — thin pink */}
      <mesh ref={ring3} rotation={[0.85, 0.5, 0.3]}>
        <torusGeometry args={[2.05, 0.009, 16, 120]} />
        <meshStandardMaterial
          color="#ff00aa"
          emissive="#ff00aa"
          emissiveIntensity={1.1}
          transparent
          opacity={0.75}
        />
      </mesh>
    </group>
  );
}

// ─── 3D: Floating particle field ──────────────────────────────────────────

function FloatingParticles({ count = 350, mouseRef }) {
  const pointsRef = useRef();

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 5 + Math.random() * 11;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      // Alternating cyan / purple particles
      if (Math.random() > 0.45) {
        col[i * 3] = 0; col[i * 3 + 1] = 0.96; col[i * 3 + 2] = 1;       // cyan
      } else {
        col[i * 3] = 0.75; col[i * 3 + 1] = 0; col[i * 3 + 2] = 1;       // purple
      }
    }
    return [pos, col];
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += delta * 0.022;
    pointsRef.current.rotation.x = THREE.MathUtils.lerp(
      pointsRef.current.rotation.x,
      mouseRef.current.y * 0.08,
      0.02
    );
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.055} vertexColors transparent opacity={0.65} sizeAttenuation />
    </points>
  );
}

// ─── 3D: Cyber grid floor ─────────────────────────────────────────────────

function CyberGrid({ mouseRef }) {
  const ref = useRef();
  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.x = THREE.MathUtils.lerp(
      ref.current.rotation.x,
      -mouseRef.current.y * 0.04,
      0.025
    );
  });
  return (
    <gridHelper
      ref={ref}
      args={[50, 50, "#00f5ff", "#002233"]}
      position={[0, -3.2, 0]}
    />
  );
}

// ─── 3D: Rotating cyber globe ─────────────────────────────────────────────

function CyberGlobe({ mouseRef }) {
  const groupRef = useRef();
  const R = 3.2;

  // Build lat/lon line segments once
  const gridGeo = useMemo(() => {
    const pts = [];
    const LAT = 14;   // latitude rings
    const LON = 26;   // longitude rings
    const SEG = 60;   // points per circle arc

    // Latitude rings (horizontal)
    for (let i = 1; i < LAT; i++) {
      const phi = (i / LAT) * Math.PI;
      for (let j = 0; j < SEG; j++) {
        const t1 = (j / SEG) * Math.PI * 2;
        const t2 = ((j + 1) / SEG) * Math.PI * 2;
        pts.push(
          R * Math.sin(phi) * Math.cos(t1), R * Math.cos(phi), R * Math.sin(phi) * Math.sin(t1),
          R * Math.sin(phi) * Math.cos(t2), R * Math.cos(phi), R * Math.sin(phi) * Math.sin(t2)
        );
      }
    }

    // Longitude arcs (vertical)
    for (let i = 0; i < LON; i++) {
      const theta = (i / LON) * Math.PI * 2;
      for (let j = 0; j < SEG; j++) {
        const p1 = (j / SEG) * Math.PI;
        const p2 = ((j + 1) / SEG) * Math.PI;
        pts.push(
          R * Math.sin(p1) * Math.cos(theta), R * Math.cos(p1), R * Math.sin(p1) * Math.sin(theta),
          R * Math.sin(p2) * Math.cos(theta), R * Math.cos(p2), R * Math.sin(p2) * Math.sin(theta)
        );
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return geo;
  }, []);

  // Dots at every lat/lon intersection
  const dotGeo = useMemo(() => {
    const pts = [];
    const LAT = 14;
    const LON = 26;
    for (let i = 0; i <= LAT; i++) {
      for (let j = 0; j < LON; j++) {
        const phi   = (i / LAT) * Math.PI;
        const theta = (j / LON) * Math.PI * 2;
        pts.push(
          R * Math.sin(phi) * Math.cos(theta),
          R * Math.cos(phi),
          R * Math.sin(phi) * Math.sin(theta)
        );
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.1;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      mouseRef.current.y * 0.04,
      0.015
    );
  });

  return (
    <group ref={groupRef} position={[1.4, 0.4, -5.5]}>
      {/* Dark core so the globe reads as solid */}
      <mesh>
        <sphereGeometry args={[R * 0.97, 32, 32]} />
        <meshBasicMaterial color="#000814" transparent opacity={0.82} />
      </mesh>

      {/* Lat/lon wire grid */}
      <lineSegments geometry={gridGeo}>
        <lineBasicMaterial color="#00f5ff" transparent opacity={0.07} />
      </lineSegments>

      {/* Intersection glow dots */}
      <points geometry={dotGeo}>
        <pointsMaterial size={0.048} color="#00f5ff" transparent opacity={0.45} sizeAttenuation />
      </points>

      {/* Cyan atmosphere rim */}
      <mesh scale={1.06}>
        <sphereGeometry args={[R, 32, 32]} />
        <meshBasicMaterial color="#00f5ff" transparent opacity={0.025} side={THREE.BackSide} />
      </mesh>

      {/* Violet inner atmosphere */}
      <mesh scale={1.03}>
        <sphereGeometry args={[R, 32, 32]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.018} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

// ─── 3D: Full scene ───────────────────────────────────────────────────────

function Scene({ mouseRef }) {
  return (
    <>
      <color attach="background" args={["#000814"]} />
      <fog attach="fog" args={["#000814", 18, 38]} />

      <ambientLight intensity={0.04} />
      <pointLight position={[6, 4, 5]}  color="#00f5ff" intensity={4} distance={22} />
      <pointLight position={[-5, -4, 4]} color="#bf00ff" intensity={2.5} distance={18} />
      <pointLight position={[0, 2, 8]}  color="#ffffff" intensity={0.4} />

      <Stars radius={70} depth={50} count={3500} factor={3} saturation={0.4} fade speed={0.4} />

      <CyberOrb mouseRef={mouseRef} />
      <FloatingParticles mouseRef={mouseRef} />
      <CyberGrid mouseRef={mouseRef} />
      <CyberGlobe mouseRef={mouseRef} />
    </>
  );
}

// ─── Social icons (inline SVG) ────────────────────────────────────────────

const SOCIALS = [
  {
    label: "GitHub",
    href: "https://github.com/Arunava-27",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/arunava-kundu-32375024b/",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "Email",
    href: "mailto:drarunkundu22@gmail.com",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

const STATS = [
  { value: "100+", label: "REPOS" },
  { value: "2+",  label: "YRS_EXP" },
  { value: "3",   label: "PROD_APPS" },
];

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.6 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

// ─── Main Hero ─────────────────────────────────────────────────────────────

export default function Hero() {
  const mouseRef = useRef({ x: 0, y: 0 });

  // Smooth spring parallax for the text layer
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 38, damping: 22 });
  const springY = useSpring(rawY, { stiffness: 38, damping: 22 });

  useEffect(() => {
    const onMove = (e) => {
      const nx = (e.clientX / window.innerWidth  - 0.5) * 2;
      const ny = -(e.clientY / window.innerHeight - 0.5) * 2;
      mouseRef.current = { x: nx, y: ny };
      rawX.set(nx * -16);
      rawY.set(ny * -10);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [rawX, rawY]);

  return (
    <section
      id="hero"
      className="relative min-h-screen overflow-hidden"
      style={{ background: "#000814" }}
    >
      {/* ── R3F Canvas (full background) ── */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 6.5], fov: 55 }}
          gl={{ antialias: true }}
          dpr={[1, 1.8]}
        >
          <Suspense fallback={null}>
            <Scene mouseRef={mouseRef} />
          </Suspense>
        </Canvas>
      </div>

      {/* ── CRT scan-line overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,245,255,0.012) 2px, rgba(0,245,255,0.012) 4px)",
        }}
      />

      {/* ── Left vignette so text is legible ── */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 100% at 20% 50%, rgba(0,8,20,0.15) 0%, rgba(0,8,20,0.72) 65%, rgba(0,8,20,0.35) 100%)",
        }}
      />

      {/* ── Corner brackets (HUD decoration) ── */}
      {[
        "top-24 left-4 border-l-2 border-t-2 border-cyan-500/35",
        "top-24 right-4 border-r-2 border-t-2 border-purple-500/35",
        "bottom-10 left-4 border-l-2 border-b-2 border-cyan-500/35",
        "bottom-10 right-4 border-r-2 border-b-2 border-purple-500/35",
      ].map((cls) => (
        <div key={cls} className={`absolute w-7 h-7 z-20 pointer-events-none ${cls}`} />
      ))}

      {/* ── Top-right system tag ── */}
      <div className="absolute top-20 right-12 z-20 pointer-events-none hidden lg:block">
        <div className="flex flex-col items-end gap-1 font-mono text-[10px] text-cyan-500/40 tracking-widest">
          <span>SYS::PORTFOLIO_v2.0</span>
          <span>STATUS: ONLINE</span>
          <span>SECURE_CONN: TRUE</span>
        </div>
      </div>

      {/* ── Text content with spring parallax ── */}
      <div id="hero-text-container" className="relative z-20 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
          <motion.div
            style={{ x: springX, y: springY }}
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="max-w-xl lg:max-w-2xl"
          >
            {/* Status pill */}
            <motion.div variants={fadeUp} className="flex items-center gap-2.5 mb-7">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
              </span>
              <span
                className="text-[11px] font-mono tracking-[0.22em] uppercase text-cyan-400 cyber-flicker"
                style={{ textShadow: "0 0 8px rgba(0,245,255,0.7)" }}
              >
                [ ONLINE — AVAILABLE FOR WORK ]
              </span>
            </motion.div>

            {/* Terminal prompt line */}
            <motion.p variants={fadeUp} className="font-mono text-base text-cyan-500/55 tracking-widest mb-2">
              <span className="text-cyan-400/70">&gt;&nbsp;</span>
              <span>HELLO_WORLD.exe</span>
            </motion.p>

            {/* Name heading */}
            <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl lg:text-[5.25rem] font-black leading-[1.05] mb-4">
              <span className="text-white/90">Hi, I'm</span>
              <br />
              <span className="cyber-gradient-text">Arunava Kundu</span>
            </motion.h1>

            {/* Fixed subtitle */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-2 text-base sm:text-lg font-semibold mb-5">
              <span
                className="font-mono text-cyan-400"
                style={{ textShadow: "0 0 12px rgba(0,245,255,0.5)" }}
              >
                Full Stack Developer
              </span>
              <span className="text-slate-600 font-mono">|</span>
              <span
                className="font-mono text-purple-400"
                style={{ textShadow: "0 0 12px rgba(191,0,255,0.5)" }}
              >
                Cybersecurity Enthusiast
              </span>
            </motion.div>

            {/* Description */}
            <motion.p variants={fadeUp} className="text-sm sm:text-base text-slate-400/80 leading-relaxed mb-10 max-w-lg">
              Building secure, scalable web applications at the intersection of development
              and cybersecurity. Passionate about clean code, ethical hacking, and the
              future of the open web.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3 mb-10">
              {/* Primary — gradient fill */}
              <button
                onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
                className="group relative px-7 py-3 text-sm font-bold font-mono tracking-wider text-black rounded overflow-hidden transition-transform duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #00f5ff, #bf00ff)",
                  boxShadow: "0 0 22px rgba(0,245,255,0.45), 0 0 44px rgba(191,0,255,0.2)",
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  VIEW_PROJECTS
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </button>

              {/* Secondary — cyan border */}
              <button
                onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
                className="px-7 py-3 text-sm font-bold font-mono tracking-wider text-cyan-400 rounded border transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  borderColor: "rgba(0,245,255,0.38)",
                  boxShadow: "0 0 14px rgba(0,245,255,0.08), inset 0 0 14px rgba(0,245,255,0.04)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(0,245,255,0.75)";
                  e.currentTarget.style.boxShadow = "0 0 24px rgba(0,245,255,0.28), inset 0 0 20px rgba(0,245,255,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(0,245,255,0.38)";
                  e.currentTarget.style.boxShadow = "0 0 14px rgba(0,245,255,0.08), inset 0 0 14px rgba(0,245,255,0.04)";
                }}
              >
                CONTACT_ME
              </button>

              {/* Tertiary — purple border */}
              <a
                href="/arunava_kundu_resume.pdf"
                download="Arunava_Kundu_Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="px-7 py-3 text-sm font-bold font-mono tracking-wider text-purple-400 rounded border transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  borderColor: "rgba(191,0,255,0.32)",
                  boxShadow: "0 0 14px rgba(191,0,255,0.08)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(191,0,255,0.72)";
                  e.currentTarget.style.boxShadow = "0 0 22px rgba(191,0,255,0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(191,0,255,0.32)";
                  e.currentTarget.style.boxShadow = "0 0 14px rgba(191,0,255,0.08)";
                }}
              >
                DOWNLOAD_CV
              </a>
            </motion.div>

            {/* Social + Stats row */}
            <motion.div variants={fadeUp} className="flex items-center gap-6 flex-wrap">
              {/* Social icons */}
              <div className="flex items-center gap-2">
                {SOCIALS.map(({ label, href, icon }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-9 h-9 flex items-center justify-center rounded text-slate-500 border transition-all duration-200 hover:text-cyan-400 hover:scale-110"
                    style={{
                      borderColor: "rgba(0,245,255,0.12)",
                      background: "rgba(0,245,255,0.03)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "rgba(0,245,255,0.45)";
                      e.currentTarget.style.boxShadow = "0 0 12px rgba(0,245,255,0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(0,245,255,0.12)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {icon}
                  </a>
                ))}
              </div>

              <div className="w-px h-8 bg-slate-800" />

              {/* Stats */}
              <div className="flex items-center gap-5">
                {STATS.map(({ value, label }) => (
                  <div key={label} className="flex flex-col items-center gap-0.5">
                    <span
                      className="text-sm font-black font-mono text-cyan-400"
                      style={{ textShadow: "0 0 10px rgba(0,245,255,0.6)" }}
                    >
                      {value}
                    </span>
                    <span className="text-[9px] font-mono tracking-widest text-slate-600">{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        style={{ color: "rgba(0,245,255,0.38)" }}
      >
        <span className="text-[9px] font-mono tracking-[0.35em] uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="w-4 h-7 rounded-full border border-current flex items-start justify-center pt-1"
        >
          <div className="w-0.5 h-2 rounded-full bg-current" />
        </motion.div>
      </motion.div>
    </section>
  );
}
