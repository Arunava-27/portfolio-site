import { useRef } from "react";
import {
  motion,
  useInView,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { yearsExpLabel, userCountLabel } from "../utils/metrics";

// ─── Data ──────────────────────────────────────────────────────────────────

const EXPERIENCES = [
  {
    id: "iema-fulltime",
    role: "Software Developer (Fixed Term)",
    company: "IEMALabs",
    companyInitial: "IE",
    type: "Full-time",
    period: "Sep 2025 — Present",
    duration: "Current",
    location: "Kolkata, India",
    current: true,
    description:
      "Building and maintaining production-grade web and mobile applications for real-world clients across healthcare, IoT, and education sectors at IEMA Research & Development Pvt. Ltd.",
    achievements: [
      "Developing full-stack features using the MERN stack and React Native for multiple live client deployments",
      "Architecting scalable backend services with Node.js + Express — improving API response times by 35%",
      "Implementing CI/CD pipelines and containerized workflows using Docker for streamlined deployments",
      "Collaborating with cross-functional teams to deliver production-ready features on tight schedules",
    ],
    tech: ["React.js", "React Native", "Node.js", "MongoDB", "Express", "Docker"],
    accent: { from: "#8b5cf6", to: "#06b6d4" },
    dotColor: "#8b5cf6",
  },
  {
    id: "iema-trainee",
    role: "Software Developer Trainee",
    company: "IEMALabs",
    companyInitial: "IE",
    type: "Trainee",
    period: "Jan 2023 — Sep 2025",
    duration: "2 yrs 9 mos",
    location: "Kolkata, India",
    current: false,
    description:
      "Trained under senior developers to build full-stack web and mobile applications for IEMA R&D clients, transitioning from learner to independent contributor on three major production projects.",
    achievements: [
      "Built IEMA EMR — an Electronic Medical Record system for hospitals using MERN stack with secure role-based access",
      "Developed the Asset Health Monitoring dashboard for SAIL DSP integrating real-time IoT sensor data",
      "Created Robotrix — a React Native video-learning app with automated quiz grading and certificate generation",
      "Developed secure backend APIs with JWT authentication and granular role-based access control systems",
    ],
    tech: ["MERN Stack", "React Native", "PostgreSQL", "JWT Auth", "IoT", "REST APIs"],
    accent: { from: "#00f5ff", to: "#10b981" },
    dotColor: "#00f5ff",
  },
];

// ─── TimelineDot ────────────────────────────────────────────────────────────

function TimelineDot({ accent, current, inView }) {
  return (
    <div className="relative flex items-center justify-center w-10 h-10 flex-shrink-0 z-10">
      {/* Outer glow ring – always visible, brightens on inView */}
      <motion.div
        animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle, ${accent.from}44, transparent 70%)` }}
      />

      {/* Pulse ring for current job */}
      {current && (
        <motion.div
          animate={{ scale: [1, 1.7, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full"
          style={{ background: accent.from, opacity: 0.4 }}
        />
      )}

      {/* Core dot */}
      <motion.div
        animate={inView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="w-4 h-4 rounded-full shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
          boxShadow: `0 0 12px ${accent.from}99`,
        }}
      />
    </div>
  );
}

// ─── CompanyLogo ────────────────────────────────────────────────────────────

function CompanyLogo({ initial, accent }) {
  return (
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm select-none shadow-lg flex-shrink-0"
      style={{
        background: `linear-gradient(135deg, ${accent.from}22, ${accent.to}22)`,
        border: `1px solid ${accent.from}44`,
        color: accent.from,
        textShadow: `0 0 8px ${accent.from}99`,
      }}
    >
      {initial}
    </div>
  );
}

// ─── DateBadge (shown on the opposite side of the card on desktop) ──────────

function DateBadge({ exp, align }) {
  return (
    <div className={`hidden lg:flex flex-col gap-1 ${align === "right" ? "items-start" : "items-end"} pt-3`}>
      <span
        className="text-xs font-mono font-bold tracking-widest uppercase px-3 py-1.5 rounded-lg"
        style={{
          background: `${exp.accent.from}18`,
          color: exp.accent.from,
          border: `1px solid ${exp.accent.from}35`,
        }}
      >
        {exp.period}
      </span>
      <span className="text-[11px] font-mono text-slate-500 px-1">{exp.duration}</span>
      <span className="text-[11px] font-mono text-slate-600 px-1">{exp.location}</span>
    </div>
  );
}

// ─── ExperienceCard ─────────────────────────────────────────────────────────

function ExperienceCard({ exp, inView, direction }) {
  return (
    <motion.div
      animate={
        inView
          ? { opacity: 1, x: 0 }
          : { opacity: 0, x: direction === "left" ? -60 : 60 }
      }
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="relative group w-full"
    >
      {/* Gradient border */}
      <div
        className="absolute -inset-[1px] rounded-2xl opacity-25 group-hover:opacity-75 transition-opacity duration-400 pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${exp.accent.from}, ${exp.accent.to})` }}
      />

      {/* Glow bloom */}
      <div
        className="absolute -inset-3 rounded-2xl blur-xl opacity-0 group-hover:opacity-15 transition-opacity duration-500 pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${exp.accent.from}, ${exp.accent.to})` }}
      />

      {/* Card body */}
      <div
        className="relative rounded-2xl p-6 backdrop-blur-md border border-white/5 overflow-hidden"
        style={{ background: "rgba(8, 8, 22, 0.85)" }}
      >
        {/* Inner corner glow */}
        <div
          className="absolute top-0 right-0 w-40 h-40 opacity-0 group-hover:opacity-8 transition-opacity duration-500 pointer-events-none rounded-2xl"
          style={{
            background: `radial-gradient(circle at 100% 0%, ${exp.accent.from}, transparent 65%)`,
          }}
        />

        {/* ── Card header ── */}
        <div className="flex items-start gap-4 mb-5">
          <CompanyLogo initial={exp.companyInitial} accent={exp.accent} />

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <h3
                className="text-lg font-black leading-tight"
                style={{ color: "#f1f5f9" }}
              >
                {exp.role}
              </h3>
              {exp.current && (
                <span
                  className="text-[9px] font-bold font-mono tracking-widest uppercase px-2 py-0.5 rounded-full"
                  style={{
                    background: `${exp.accent.from}25`,
                    color: exp.accent.from,
                    border: `1px solid ${exp.accent.from}55`,
                    boxShadow: `0 0 10px ${exp.accent.from}44`,
                  }}
                >
                  ● CURRENT
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="text-sm font-bold"
                style={{
                  background: `linear-gradient(135deg, ${exp.accent.from}, ${exp.accent.to})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {exp.company}
              </span>
              <span className="text-slate-600 text-xs font-mono">·</span>
              <span className="text-xs font-mono text-slate-500">{exp.type}</span>
            </div>
          </div>
        </div>

        {/* Mobile-only date */}
        <div
          className="lg:hidden flex flex-wrap items-center gap-3 mb-4 pb-4"
          style={{ borderBottom: `1px solid ${exp.accent.from}18` }}
        >
          <span
            className="text-xs font-mono font-bold px-2.5 py-1 rounded-md"
            style={{
              background: `${exp.accent.from}18`,
              color: exp.accent.from,
              border: `1px solid ${exp.accent.from}35`,
            }}
          >
            {exp.period}
          </span>
          <span className="text-[11px] font-mono text-slate-500">{exp.duration}</span>
          <span className="text-[11px] font-mono text-slate-600">{exp.location}</span>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-400 leading-relaxed mb-5">{exp.description}</p>

        {/* Achievements */}
        <div className="mb-5">
          <div
            className="flex items-center gap-2 mb-3 text-[10px] font-mono tracking-widest uppercase"
            style={{ color: exp.accent.from }}
          >
            <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${exp.accent.from}66, transparent)` }} />
            <span>KEY ACHIEVEMENTS</span>
            <div className="h-px flex-1" style={{ background: `linear-gradient(270deg, ${exp.accent.from}66, transparent)` }} />
          </div>
          <ul className="space-y-2.5">
            {exp.achievements.map((a, i) => (
              <motion.li
                key={i}
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                transition={{ delay: 0.3 + i * 0.09, duration: 0.4 }}
                className="flex items-start gap-3 text-sm text-slate-400 leading-relaxed"
              >
                {/* Bullet icon */}
                <span
                  className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${exp.accent.from}, ${exp.accent.to})`,
                    boxShadow: `0 0 6px ${exp.accent.from}88`,
                  }}
                />
                {a}
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Tech stack */}
        <div
          className="pt-4"
          style={{ borderTop: `1px solid rgba(255,255,255,0.05)` }}
        >
          <div className="flex flex-wrap gap-1.5">
            {exp.tech.map((t) => (
              <span
                key={t}
                className="px-2.5 py-1 text-[11px] font-mono rounded-md cursor-default transition-colors duration-200"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  color: "#94a3b8",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── TimelineEntry ──────────────────────────────────────────────────────────

function TimelineEntry({ exp, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -80px 0px" });
  const isEven = index % 2 === 0;

  return (
    <div
      ref={ref}
      className="relative grid grid-cols-[40px_1fr] lg:grid-cols-[1fr_40px_1fr] gap-x-4 lg:gap-x-8 mb-10 lg:mb-14"
    >
      {/* ── Left slot (desktop only) ── */}
      <div className="hidden lg:block">
        {isEven ? (
          <ExperienceCard exp={exp} inView={inView} direction="left" />
        ) : (
          <DateBadge exp={exp} align="right" />
        )}
      </div>

      {/* ── Center: dot ── */}
      <div className="flex flex-col items-center pt-6">
        <TimelineDot accent={exp.accent} current={exp.current} inView={inView} />
      </div>

      {/* ── Right slot ── */}
      <div className="lg:hidden w-full">
        {/* Mobile: always show card on the right */}
        <ExperienceCard exp={exp} inView={inView} direction="right" />
      </div>

      <div className="hidden lg:block">
        {isEven ? (
          <DateBadge exp={exp} align="left" />
        ) : (
          <ExperienceCard exp={exp} inView={inView} direction="right" />
        )}
      </div>
    </div>
  );
}

// ─── Animated scroll line ────────────────────────────────────────────────────

function TimelineLine() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 75%", "end 25%"],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });

  return (
    <div
      ref={ref}
      className="absolute left-5 lg:left-1/2 top-0 bottom-0 w-px -translate-x-1/2 overflow-hidden"
    >
      {/* Base track */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-800/80 via-slate-700/40 to-slate-800/80" />
      {/* Animated fill */}
      <motion.div
        style={{
          scaleY,
          transformOrigin: "top",
          background:
            "linear-gradient(180deg, #8b5cf6 0%, #06b6d4 33%, #10b981 66%, #f59e0b 100%)",
        }}
        className="absolute inset-0 origin-top"
      />
    </div>
  );
}

// ─── Main section ──────────────────────────────────────────────────────────

export default function Experience() {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true });

  return (
    <section
      id="experience"
      className="py-24 lg:py-32 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #050510 0%, #080818 100%)" }}
    >
      {/* Ambient blobs */}
      <div
        className="absolute top-1/3 -left-32 w-80 h-80 rounded-full blur-[100px] opacity-8 pointer-events-none"
        style={{ background: "#8b5cf6" }}
      />
      <div
        className="absolute bottom-1/3 -right-32 w-80 h-80 rounded-full blur-[100px] opacity-6 pointer-events-none"
        style={{ background: "#06b6d4" }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Section heading ── */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 lg:mb-20"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-violet-500" />
            <span className="text-xs font-mono tracking-[0.22em] uppercase text-violet-400">
              &gt; EXPERIENCE.log()
            </span>
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-violet-500" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
            Work{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              History
            </span>
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            A chronological journey through the roles that shaped how I think about
            software, teams, and impact.
          </p>
        </motion.div>

        {/* ── Timeline ── */}
        <div className="relative">
          <TimelineLine />

          <div className="relative">
            {EXPERIENCES.map((exp, i) => (
              <TimelineEntry key={exp.id} exp={exp} index={i} />
            ))}
          </div>

          {/* ── End cap ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-3 pt-4"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono"
              style={{
                background: "linear-gradient(135deg, #8b5cf622, #06b6d422)",
                border: "1px solid #8b5cf655",
                color: "#8b5cf6",
              }}
            >
              ★
            </div>
            <div className="flex flex-col items-center gap-1">
              <span
                className="text-xs font-mono tracking-widest uppercase"
                style={{ color: "#8b5cf699" }}
              >
                The journey continues
              </span>
              <span className="text-[10px] font-mono text-slate-600">
                — Open to new opportunities —
              </span>
            </div>
          </motion.div>
        </div>

        {/* ── Stats row ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {[
            { value: yearsExpLabel,  label: "Years Experience",   color: "#8b5cf6" },
            { value: "1",            label: "Companies",          color: "#06b6d4" },
            { value: userCountLabel, label: "Users Reached",      color: "#10b981" },
            { value: "100%",         label: "On-time Delivery",   color: "#f59e0b" },
          ].map(({ value, label, color }) => (
            <div
              key={label}
              className="p-5 rounded-2xl text-center group hover:scale-105 transition-transform duration-200"
              style={{
                background: `${color}0c`,
                border: `1px solid ${color}28`,
              }}
            >
              <div
                className="text-2xl font-black font-mono mb-1"
                style={{
                  background: `linear-gradient(135deg, ${color}, ${color}99)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: "drop-shadow(0 0 8px " + color + "66)",
                }}
              >
                {value}
              </div>
              <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
