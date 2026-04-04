import { useState } from "react";
import { motion } from "framer-motion";

const SKILLS = {
  Languages: [
    { name: "JavaScript", level: 90 },
    { name: "Python", level: 82 },
    { name: "Java", level: 78 },
    { name: "C / C++", level: 72 },
    { name: "SQL", level: 80 },
    { name: "Bash / Shell", level: 65 },
  ],
  "Web & Mobile": [
    { name: "React.js", level: 92 },
    { name: "React Native", level: 84 },
    { name: "Node.js + Express", level: 88 },
    { name: "MongoDB", level: 82 },
    { name: "PostgreSQL", level: 78 },
    { name: "REST APIs", level: 90 },
  ],
  "Security & DevOps": [
    { name: "VA/PT (Pen Testing)", level: 75 },
    { name: "Linux", level: 80 },
    { name: "Networking", level: 72 },
    { name: "AWS", level: 68 },
    { name: "Docker", level: 72 },
    { name: "Git & GitHub", level: 90 },
  ],
};

const CATEGORIES = Object.keys(SKILLS);

const CATEGORY_COLORS = {
  Languages: "from-violet-600 to-purple-600",
  "Web & Mobile": "from-cyan-600 to-blue-600",
  "Security & DevOps": "from-pink-600 to-rose-600",
};

const CATEGORY_BG = {
  Languages: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  "Web & Mobile": "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  "Security & DevOps": "bg-pink-500/10 text-pink-600 dark:text-pink-400",
};

export default function Skills() {
  const [active, setActive] = useState("Languages");

  return (
    <section id="skills" className="py-24 lg:py-32 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-sm font-semibold tracking-widest uppercase text-violet-600 dark:text-violet-400">What I Know</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            My <span className="text-gradient">Skills</span>
          </h2>
          <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            A curated set of tools and technologies I use to build modern applications.
          </p>
        </motion.div>

        {/* Category tabs */}
        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`relative px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                active === cat
                  ? `${CATEGORY_BG[cat]} border border-current/20 scale-105`
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Skills grid */}
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid sm:grid-cols-2 gap-4"
        >
          {SKILLS[active].map(({ name, level }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="group p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/60 hover:border-violet-500/40 dark:hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-200">
                  {name}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${CATEGORY_BG[active]}`}>
                  {level}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${level}%` }}
                  transition={{ delay: i * 0.06 + 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className={`h-full rounded-full bg-gradient-to-r ${CATEGORY_COLORS[active]}`}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional tech badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-slate-500 dark:text-slate-500 mb-4">Also familiar with</p>
          <div className="flex flex-wrap justify-center gap-2">
            {["Spring Boot", "JWT Auth", "Socket.io", "MQTT / IoT", "TryHackMe", "Tailwind CSS", "Vite", "Wireshark"].map((tech) => (
              <span
                key={tech}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-violet-500/40 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200 cursor-default"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
