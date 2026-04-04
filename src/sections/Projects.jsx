import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

// ─── Project data ──────────────────────────────────────────────────────────

const PROJECTS = [
  // ── Web ──────────────────────────────────────────────────────────────────
  {
    id: "iema-emr",
    category: "Web",
    featured: true,
    title: "IEMA EMR System",
    subtitle: "Electronic Medical Record Platform",
    description:
      "Full-stack hospital EMR system built for real clinical deployment. Handles patient records, doctor scheduling, prescription management, and role-based workflows for staff, doctors, and admins.",
    tech: ["React.js", "Node.js", "Express", "MongoDB", "JWT Auth", "REST APIs"],
    github: "https://github.com/Arunava-27/iema-emr",
    live: "#",
    accent: { from: "#8b5cf6", to: "#06b6d4" },
    iconPath: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    id: "iot-asset-monitor",
    category: "Web",
    featured: false,
    title: "IoT Asset Monitor",
    subtitle: "Industrial Predictive Maintenance",
    description:
      "Real-time IoT asset health monitoring dashboard built for SAIL DSP. Aggregates live sensor data, visualises equipment health trends, and triggers maintenance alerts before failures occur.",
    tech: ["React.js", "Node.js", "MongoDB", "Socket.io", "Chart.js", "MQTT"],
    github: "https://github.com/Arunava-27/iot-asset-monitor",
    live: "#",
    accent: { from: "#f59e0b", to: "#ef4444" },
    iconPath: "M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18",
  },
  {
    id: "robotrix",
    category: "Web",
    featured: false,
    title: "Robotrix",
    subtitle: "Video Learning App",
    description:
      "React Native mobile learning platform developed for IEM America Corporation. Features video lessons, interactive quizzes, progress tracking, and automated certificate generation on completion.",
    tech: ["React Native", "Node.js", "MongoDB", "Express", "JWT", "AWS S3"],
    github: "https://github.com/Arunava-27/robotrix",
    live: "#",
    accent: { from: "#10b981", to: "#06b6d4" },
    iconPath: "M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
  },

  // ── Cybersecurity ─────────────────────────────────────────────────────────
  {
    id: "vapt-toolkit",
    category: "Cybersecurity",
    featured: true,
    title: "VAPT Toolkit",
    subtitle: "Automated Vulnerability Scanner",
    description:
      "Comprehensive Python-based VA/PT automation framework. Performs recon, port scanning, CVE correlation, and web vulnerability probing — then generates structured HTML/JSON reports.",
    tech: ["Python", "FastAPI", "Nmap", "Requests", "SQLite", "Jinja2"],
    github: "https://github.com/Arunava-27/vapt-toolkit",
    live: "#",
    accent: { from: "#00f5ff", to: "#00ff88" },
    iconPath: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
  {
    id: "cybershield",
    category: "Cybersecurity",
    featured: false,
    title: "CyberShield",
    subtitle: "Real-Time Security Dashboard",
    description:
      "Full-stack cybersecurity monitoring dashboard. Aggregates threat feeds, visualises network traffic anomalies, tracks CVEs, and provides live alerts via WebSocket for active incidents.",
    tech: ["React.js", "Node.js", "Socket.io", "MongoDB", "Chart.js", "Python"],
    github: "https://github.com/Arunava-27/cybershield",
    live: "#",
    accent: { from: "#ff006e", to: "#8b5cf6" },
    iconPath: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  },
  {
    id: "netrecon",
    category: "Cybersecurity",
    featured: false,
    title: "NetRecon",
    subtitle: "Network Reconnaissance Tool",
    description:
      "Passive and active network recon tool built in Python. Automates subdomain enumeration, banner grabbing, OS fingerprinting, and outputs structured attack-surface maps for pen testers.",
    tech: ["Python", "Scapy", "Shodan API", "Click", "Rich", "SQLite"],
    github: "https://github.com/Arunava-27/netrecon",
    live: "#",
    accent: { from: "#00ff88", to: "#00f5ff" },
    iconPath: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9",
  },

  // ── AI ────────────────────────────────────────────────────────────────────
  {
    id: "intellichat",
    category: "AI",
    featured: true,
    title: "IntelliChat",
    subtitle: "AI-Powered Chat Application",
    description:
      "Real-time chat application with an embedded AI assistant powered by the Gemini API. Supports room-based chats, persistent history, code block rendering, and smart conversation summaries.",
    tech: ["React.js", "Node.js", "Socket.io", "MongoDB", "Gemini API", "Express"],
    github: "https://github.com/Arunava-27/intellichat",
    live: "#",
    accent: { from: "#8b5cf6", to: "#ec4899" },
    iconPath: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
  },
  {
    id: "threatmapper",
    category: "AI",
    featured: false,
    title: "ThreatMapper",
    subtitle: "AI Threat Intelligence Tool",
    description:
      "ML-assisted threat intelligence platform that ingests CVE feeds, breach reports, and dark-web alerts — then clusters and prioritises threats using NLP-based similarity scoring.",
    tech: ["Python", "FastAPI", "scikit-learn", "NLP", "React.js", "MongoDB"],
    github: "https://github.com/Arunava-27/threatmapper",
    live: "#",
    accent: { from: "#f59e0b", to: "#ef4444" },
    iconPath: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  {
    id: "securevault",
    category: "AI",
    featured: false,
    title: "SecureVault",
    subtitle: "Zero-Knowledge Password Manager",
    description:
      "AES-256 encrypted password manager with zero-knowledge architecture — the server never sees plaintext credentials. Includes AI-powered breach detection and password strength analysis.",
    tech: ["React.js", "Node.js", "CryptoJS", "MongoDB", "JWT", "Gemini API"],
    github: "https://github.com/Arunava-27/securevault",
    live: "#",
    accent: { from: "#06b6d4", to: "#10b981" },
    iconPath: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z",
  },
];

// ─── Filter config ─────────────────────────────────────────────────────────

const FILTERS = [
  {
    id: "All",
    label: "All Projects",
    icon: "M4 6h16M4 10h16M4 14h16M4 18h16",
    color: "#a78bfa",
  },
  {
    id: "Web",
    label: "Web",
    icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9",
    color: "#8b5cf6",
  },
  {
    id: "Cybersecurity",
    label: "Cybersecurity",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    color: "#00f5ff",
  },
  {
    id: "AI",
    label: "AI / ML",
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    color: "#ff006e",
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

function ExternalIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

function GitHubIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

const CATEGORY_LABEL_STYLES = {
  Web:           { bg: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "rgba(139,92,246,0.35)" },
  Cybersecurity: { bg: "rgba(0,245,255,0.12)",  color: "#00f5ff", border: "rgba(0,245,255,0.35)" },
  AI:            { bg: "rgba(255,0,110,0.12)",  color: "#ff6b9d", border: "rgba(255,0,110,0.35)" },
};

// ─── ProjectCard ───────────────────────────────────────────────────────────

function ProjectCard({ project, index }) {
  const { title, subtitle, description, tech, github, live, accent, category, iconPath, featured } = project;
  const catStyle = CATEGORY_LABEL_STYLES[category];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
      transition={{ delay: index * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
      className="group relative"
    >
      {/* ── Gradient border (absolute overlay) ── */}
      <div
        className="absolute -inset-[1px] rounded-2xl opacity-30 group-hover:opacity-90 transition-opacity duration-400 pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${accent.from}, ${accent.to})` }}
      />

      {/* ── Glow shadow on hover ── */}
      <div
        className="absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-400 pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${accent.from}, ${accent.to})` }}
      />

      {/* ── Card body ── */}
      <div className="relative h-full rounded-2xl bg-slate-900/85 dark:bg-slate-900/85 backdrop-blur-md border border-white/5 p-6 flex flex-col overflow-hidden">

        {/* Subtle inner glow top-left */}
        <div
          className="absolute top-0 left-0 w-48 h-48 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none rounded-2xl"
          style={{ background: `radial-gradient(circle at 0% 0%, ${accent.from}, transparent 70%)` }}
        />

        {/* ── Header row ── */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300"
              style={{ background: `linear-gradient(135deg, ${accent.from}33, ${accent.to}33)`, border: `1px solid ${accent.from}44` }}
            >
              <svg
                className="w-5 h-5"
                style={{ color: accent.from }}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={iconPath} />
              </svg>
            </div>

            {/* Category badge */}
            <span
              className="text-[10px] font-bold font-mono tracking-widest uppercase px-2.5 py-1 rounded-md"
              style={{ background: catStyle.bg, color: catStyle.color, border: `1px solid ${catStyle.border}` }}
            >
              {category}
            </span>
          </div>

          {/* Project number HUD */}
          <span className="text-[10px] font-mono text-slate-600 dark:text-slate-700 tabular-nums">
            #{String(index + 1).padStart(2, "0")}
          </span>
        </div>

        {/* ── Title + subtitle ── */}
        <div className="mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className="text-lg font-bold text-white leading-tight group-hover:text-transparent transition-colors duration-300"
              style={{ backgroundImage: `linear-gradient(135deg, ${accent.from}, ${accent.to})`, WebkitBackgroundClip: "text", backgroundClip: "text" }}
            >
              {title}
            </h3>
            {featured && (
              <span className="text-[9px] font-bold font-mono tracking-widest uppercase px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
                FEATURED
              </span>
            )}
          </div>
          <p className="text-xs font-mono mt-0.5" style={{ color: `${accent.from}99` }}>
            {subtitle}
          </p>
        </div>

        {/* ── Description ── */}
        <p className="text-sm text-slate-400 dark:text-slate-400 leading-relaxed mb-4 flex-1 line-clamp-3">
          {description}
        </p>

        {/* ── Tech stack ── */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {tech.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 text-[11px] font-mono rounded-md transition-colors duration-200 cursor-default"
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

        {/* ── Divider ── */}
        <div
          className="h-px mb-4 opacity-20"
          style={{ background: `linear-gradient(90deg, ${accent.from}, ${accent.to})` }}
        />

        {/* ── Links ── */}
        <div className="flex items-center gap-3">
          <a
            href={live}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold font-mono tracking-wider rounded-lg transition-all duration-200 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${accent.from}22, ${accent.to}22)`,
              color: accent.from,
              border: `1px solid ${accent.from}44`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `linear-gradient(135deg, ${accent.from}40, ${accent.to}40)`;
              e.currentTarget.style.borderColor = `${accent.from}99`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `linear-gradient(135deg, ${accent.from}22, ${accent.to}22)`;
              e.currentTarget.style.borderColor = `${accent.from}44`;
            }}
          >
            <ExternalIcon />
            LIVE DEMO
          </a>
          <a
            href={github}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold font-mono tracking-wider rounded-lg transition-all duration-200 hover:scale-105"
            style={{
              background: "rgba(255,255,255,0.04)",
              color: "#94a3b8",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              e.currentTarget.style.color = "#e2e8f0";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              e.currentTarget.style.color = "#94a3b8";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            }}
          >
            <GitHubIcon />
            SOURCE
          </a>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Filter Tab ────────────────────────────────────────────────────────────

function FilterTab({ filter, active, onClick, count }) {
  const isActive = active === filter.id;
  return (
    <button
      onClick={() => onClick(filter.id)}
      className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold font-mono tracking-wide transition-all duration-200 overflow-hidden"
      style={{
        color: isActive ? "#0a0a0f" : filter.color,
        background: isActive
          ? filter.color
          : `${filter.color}0f`,
        border: `1px solid ${isActive ? filter.color : filter.color + "35"}`,
        boxShadow: isActive ? `0 0 20px ${filter.color}55` : "none",
        transform: isActive ? "scale(1.05)" : "scale(1)",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = `${filter.color}22`;
          e.currentTarget.style.borderColor = `${filter.color}66`;
          e.currentTarget.style.boxShadow = `0 0 12px ${filter.color}33`;
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = `${filter.color}0f`;
          e.currentTarget.style.borderColor = `${filter.color}35`;
          e.currentTarget.style.boxShadow = "none";
        }
      }}
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={filter.icon} />
      </svg>
      <span>{filter.label}</span>
      <span
        className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold"
        style={{
          background: isActive ? "rgba(0,0,0,0.25)" : `${filter.color}22`,
          color: isActive ? "#0a0a0f" : filter.color,
        }}
      >
        {count}
      </span>
    </button>
  );
}

// ─── Main Section ──────────────────────────────────────────────────────────

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState("All");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const filtered =
    activeFilter === "All"
      ? PROJECTS
      : PROJECTS.filter((p) => p.category === activeFilter);

  const getCategoryCount = (id) =>
    id === "All" ? PROJECTS.length : PROJECTS.filter((p) => p.category === id).length;

  return (
    <section
      id="projects"
      className="py-24 lg:py-32 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0a0a1a 0%, #050510 100%)" }}
    >
      {/* Ambient glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-10 pointer-events-none" style={{ background: "#8b5cf6" }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] opacity-8 pointer-events-none" style={{ background: "#00f5ff" }} />

      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section heading ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-violet-500" />
            <span className="text-xs font-mono tracking-[0.22em] uppercase text-violet-400">
              &gt; PROJECTS.list()
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-violet-500" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
            Things I've{" "}
            <span
              className="inline-block"
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #00f5ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Built
            </span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            A collection of projects spanning full-stack web apps, cybersecurity tooling,
            and AI/ML experiments — each solving a real problem.
          </p>
        </motion.div>

        {/* ── Filter tabs ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12"
        >
          {FILTERS.map((f) => (
            <FilterTab
              key={f.id}
              filter={f}
              active={activeFilter}
              onClick={setActiveFilter}
              count={getCategoryCount(f.id)}
            />
          ))}
        </motion.div>

        {/* ── Project grid ── */}
        <motion.div layout className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* ── Stats bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-14 pt-10 border-t flex flex-wrap items-center justify-between gap-6"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div className="flex flex-wrap gap-8">
            {[
              { label: "Total Projects", value: PROJECTS.length },
              { label: "Web Apps",        value: PROJECTS.filter(p => p.category === "Web").length },
              { label: "Security Tools",  value: PROJECTS.filter(p => p.category === "Cybersecurity").length },
              { label: "AI / ML",         value: PROJECTS.filter(p => p.category === "AI").length },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span
                  className="text-2xl font-black font-mono"
                  style={{
                    background: "linear-gradient(135deg, #8b5cf6, #00f5ff)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {value}
                </span>
                <span className="text-[11px] font-mono text-slate-500 tracking-wider uppercase">{label}</span>
              </div>
            ))}
          </div>

          <a
            href="#"
            className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold font-mono tracking-wider transition-all duration-200 hover:scale-105"
            style={{
              color: "#a78bfa",
              border: "1px solid rgba(139,92,246,0.35)",
              background: "rgba(139,92,246,0.08)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(139,92,246,0.18)";
              e.currentTarget.style.borderColor = "rgba(139,92,246,0.65)";
              e.currentTarget.style.boxShadow = "0 0 20px rgba(139,92,246,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(139,92,246,0.08)";
              e.currentTarget.style.borderColor = "rgba(139,92,246,0.35)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <GitHubIcon size={16} />
            VIEW_ALL_ON_GITHUB
            <ExternalIcon size={13} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
