import { motion } from "framer-motion";
import meImage from "../assets/me.png";

const STATS = [
  { value: "2+", label: "Years Experience" },
  { value: "100+", label: "GitHub Repos" },
  { value: "3", label: "Production Apps" },
  { value: "5+", label: "Certifications" },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function About() {
  return (
    <section id="about" className="py-24 lg:py-32 bg-white dark:bg-slate-900/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold tracking-widest uppercase text-violet-600 dark:text-violet-400">Who I Am</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            About <span className="text-gradient">Me</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Avatar + card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } }}
            className="flex flex-col items-center gap-6"
          >
            <div className="relative">
              {/* Animated gradient glow ring */}
              <div className="absolute -inset-[3px] rounded-2xl bg-gradient-to-br from-violet-500 via-cyan-400 to-violet-600 opacity-70 blur-[6px] animate-pulse" />
              <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-br from-violet-500 via-cyan-400 to-violet-600 opacity-40" />

              {/* Photo frame */}
              <div className="relative w-64 h-80 rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={meImage}
                  alt="Arunava Kundu"
                  className="w-full h-full object-cover object-top"
                />

                {/* CRT scan-line overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,245,255,0.025) 3px,rgba(0,245,255,0.025) 4px)",
                  }}
                />

                {/* Bottom gradient fade → ID strip */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-950/90 to-transparent" />
                <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  </span>
                  <span className="text-[9px] font-mono tracking-[0.2em] text-cyan-400/80 uppercase">ID: AK-001 // VERIFIED</span>
                </div>
              </div>

              {/* HUD corner brackets */}
              {[
                "top-1 left-1 border-l-2 border-t-2 border-cyan-400/60",
                "top-1 right-1 border-r-2 border-t-2 border-violet-400/60",
                "bottom-1 left-1 border-l-2 border-b-2 border-cyan-400/60",
                "bottom-1 right-1 border-r-2 border-b-2 border-violet-400/60",
              ].map((cls) => (
                <div key={cls} className={`absolute w-5 h-5 pointer-events-none ${cls}`} />
              ))}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              {STATS.map(({ value, label }) => (
                <div
                  key={label}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/50 text-center hover:border-violet-500/40 transition-colors duration-200"
                >
                  <div className="text-2xl font-black text-gradient">{value}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Bio */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } }}
          >
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Building software that <span className="text-gradient">makes a difference</span>
            </h3>
            <div className="space-y-4 text-slate-600 dark:text-slate-400 leading-relaxed">
              <p>
                I'm a Full Stack Developer at <strong className="text-slate-800 dark:text-slate-200">IEMALabs (IEMA Research & Development Pvt. Ltd.)</strong> in Kolkata, building production-grade web and mobile applications across healthcare, industrial IoT, and education domains.
              </p>
              <p>
                I graduated with a B.Tech in <strong className="text-slate-800 dark:text-slate-200">Computer Science & Business Systems (CSBS)</strong> from the Institute of Engineering & Management, Kolkata (2025), having earlier completed a Diploma in CST from Saroj Mohan Institute of Technology.
              </p>
              <p>
                Beyond development, I have a deep passion for <strong className="text-slate-800 dark:text-slate-200">cybersecurity</strong> — practicing VA/PT, network analysis, and building security tools. I actively practice on TryHackMe and hold an AWS Fundamentals certification from Coursera.
              </p>
            </div>

            {/* Tech interests */}
            <div className="mt-8 flex flex-wrap gap-2">
              {["MERN Stack", "React Native", "Cybersecurity", "IoT", "AWS", "Docker", "Java", "Python"].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-violet-500/10 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-500/20"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-violet-500/25"
              >
                Let's Talk
              </button>
              <button
                onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-500 transition-all duration-200"
              >
                See Projects
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
