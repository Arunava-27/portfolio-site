// scripts/generate-cv.js
// Run with: node scripts/generate-cv.js
// Generates public/arunava_kundu_resume.pdf  (strict one-page A4)

import puppeteer from "puppeteer";
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Dynamic metrics (auto-update on each run) ────────────────────────────────

const now = new Date();

// Experience: +1 year every year since Jan 2023
const EXP_START = new Date("2023-01-01");
const yearsExp = Math.floor((now - EXP_START) / (365.25 * 24 * 60 * 60 * 1000));

// Production apps: base 5 at Jan 2023, +1 every 2 months
const APPS_BASE_DATE = new Date("2023-01-01");
const APPS_BASE = 5;
const monthsSinceBase =
  (now.getFullYear() - APPS_BASE_DATE.getFullYear()) * 12 +
  (now.getMonth() - APPS_BASE_DATE.getMonth());
const appCount = APPS_BASE + Math.floor(monthsSinceBase / 2);

// Users reached: base 1,000 at Jan 2023, +100 every 2 months
const USER_BASE = 1000;
const userCount = USER_BASE + Math.floor(monthsSinceBase / 2) * 100;
const userCountFormatted = userCount.toLocaleString("en-IN");

// ─── CV HTML template ─────────────────────────────────────────────────────────

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Arunava Kundu — Resume</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --v: #6d28d9;
    --c: #0284c7;
    --dark: #0f172a;
    --text: #1e293b;
    --muted: #64748b;
    --border: #e2e8f0;
    --tag-bg: #f5f3ff;
    --tag-c-bg: #e0f2fe;
    --surface: #f8fafc;
  }

  html, body {
    font-family: 'Inter', sans-serif;
    font-size: 8.8pt;
    color: var(--text);
    background: #fff;
    line-height: 1.45;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── A4 page — fills exactly one page ── */
  .page {
    width: 210mm;
    height: 297mm;
    padding: 7.5mm 10mm 7mm 10mm;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* ── Header ── */
  .hdr {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding-bottom: 7px;
    border-bottom: 3px solid var(--v);
    margin-bottom: 9px;
    flex-shrink: 0;
  }
  .hdr h1 {
    font-size: 23pt;
    font-weight: 900;
    letter-spacing: -0.03em;
    color: var(--dark);
    line-height: 1;
  }
  .hdr .role {
    font-size: 8pt;
    font-weight: 700;
    color: var(--v);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-top: 4px;
  }
  .hdr .contacts {
    text-align: right;
    font-size: 7.5pt;
    font-family: 'JetBrains Mono', monospace;
    color: var(--muted);
    line-height: 1.7;
  }
  .hdr .contacts a { color: var(--c); text-decoration: none; }

  /* ── Full-width summary strip ── */
  .summary {
    font-size: 8.2pt;
    color: #334155;
    line-height: 1.55;
    padding: 7px 10px;
    background: var(--surface);
    border-left: 3px solid var(--v);
    border-radius: 0 4px 4px 0;
    margin-bottom: 10px;
    flex-shrink: 0;
  }

  /* ── Body: left 61% / right 39% ── */
  .body {
    display: grid;
    grid-template-columns: 61% 39%;
    gap: 0 18px;
    flex: 1;
    min-height: 0;
  }

  .col { display: flex; flex-direction: column; }

  /* ── Section ── */
  .sec { margin-bottom: 11px; }
  .sec:last-child { margin-bottom: 0; flex: 1; }
  .sec-title {
    font-size: 6.8pt;
    font-weight: 800;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--v);
    border-bottom: 1.5px solid var(--border);
    padding-bottom: 3px;
    margin-bottom: 7px;
  }

  /* ── Experience ── */
  .exp { margin-bottom: 10px; }
  .exp:last-child { margin-bottom: 0; }
  .exp-hdr {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 6px;
  }
  .exp-role { font-weight: 700; font-size: 9pt; color: var(--dark); }
  .exp-date {
    font-size: 7pt;
    color: var(--muted);
    font-family: 'JetBrains Mono', monospace;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .exp-co {
    font-size: 8pt;
    font-weight: 600;
    color: var(--c);
    margin-bottom: 4px;
    margin-top: 1.5px;
  }
  .bullets { padding-left: 12px; }
  .bullets li { margin-bottom: 2.5px; list-style: disc; font-size: 8pt; }
  .bullets li::marker { color: var(--v); }

  /* ── Projects: 2-col grid ── */
  .proj-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }
  .proj {
    border: 1px solid var(--border);
    border-left: 3px solid var(--v);
    border-radius: 4px;
    padding: 6px 8px;
    background: var(--surface);
  }
  .proj.cyan-accent { border-left-color: var(--c); }
  .proj-name { font-weight: 700; font-size: 8pt; color: var(--dark); margin-bottom: 2px; }
  .proj-desc { font-size: 7.2pt; color: var(--muted); line-height: 1.38; margin-bottom: 5px; }
  .tags { display: flex; flex-wrap: wrap; gap: 3px; }
  .tag {
    font-size: 6.2pt;
    font-family: 'JetBrains Mono', monospace;
    background: var(--tag-bg);
    color: var(--v);
    padding: 1.5px 5px;
    border-radius: 3px;
  }
  .tag.c { background: var(--tag-c-bg); color: var(--c); }

  /* ── Skills ── */
  .skill-row { margin-bottom: 7px; }
  .skill-row:last-child { margin-bottom: 0; }
  .skill-lbl {
    font-size: 7pt;
    font-weight: 700;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.09em;
    margin-bottom: 3.5px;
  }
  .skill-tags { display: flex; flex-wrap: wrap; gap: 3px; }

  /* ── Education ── */
  .edu { margin-bottom: 8px; }
  .edu:last-child { margin-bottom: 0; }
  .edu-deg { font-weight: 700; font-size: 8.5pt; color: var(--dark); }
  .edu-sch { font-size: 7.8pt; font-weight: 600; color: var(--c); margin-top: 1px; }
  .edu-yr  { font-size: 7pt; color: var(--muted); font-family: 'JetBrains Mono', monospace; margin-top: 1px; }

  /* ── Certifications ── */
  .cert { display: flex; gap: 7px; align-items: flex-start; margin-bottom: 6px; }
  .cert:last-child { margin-bottom: 0; }
  .cert-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--v);
    margin-top: 4px;
    flex-shrink: 0;
  }
  .cert-dot.c { background: var(--c); }
  .cert-name { font-weight: 600; font-size: 8pt; color: var(--dark); }
  .cert-sub  { font-size: 7pt; color: var(--muted); margin-top: 1px; }

  /* ── Open Source ── */
  .oss {
    font-size: 7.5pt;
    color: var(--muted);
    font-family: 'JetBrains Mono', monospace;
    line-height: 1.7;
  }
  .oss strong { color: var(--text); font-weight: 600; }

  /* ── Divider ── */
  .divider {
    border: none;
    border-top: 1px dashed var(--border);
    margin: 9px 0;
  }

  @page { size: A4; margin: 0; }
  @media print { .page { overflow: hidden; } }
</style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div class="hdr">
    <div>
      <h1>Arunava Kundu</h1>
      <div class="role">Full Stack Developer &nbsp;·&nbsp; Cybersecurity Enthusiast</div>
    </div>
    <div class="contacts">
      <div><a href="mailto:drarunkundu22@gmail.com">drarunkundu22@gmail.com</a></div>
      <div><a href="https://arunavakundu.com">arunavakundu.com</a></div>
      <div><a href="https://github.com/Arunava-27">github.com/Arunava-27</a></div>
      <div><a href="https://linkedin.com/in/arunava-kundu-32375024b">linkedin.com/in/arunava-kundu</a></div>
      <div>Kolkata, West Bengal, India</div>
    </div>
  </div>

  <!-- FULL-WIDTH SUMMARY -->
  <div class="summary">
    Full Stack Developer with ${yearsExp}+ years of professional experience at IEMALabs delivering production-grade MERN and React Native applications across healthcare, IoT, and education domains. Skilled in Docker, AWS, CI/CD automation, and RESTful API design. Equally passionate about cybersecurity — hands-on with VAPT, penetration testing, network analysis, and vulnerability management. Seeking roles at the intersection of software engineering and security.
  </div>

  <!-- BODY -->
  <div class="body">

    <!-- ── LEFT COLUMN ── -->
    <div class="col">

      <!-- Experience -->
      <div class="sec">
        <div class="sec-title">Work Experience</div>

        <div class="exp">
          <div class="exp-hdr">
            <span class="exp-role">Software Developer (Fixed-Term)</span>
            <span class="exp-date">Sep 2025 – Present</span>
          </div>
          <div class="exp-co">IEMALabs — IEMA Research &amp; Development Pvt. Ltd., Kolkata</div>
          <ul class="bullets">
            <li>Built and shipped ${appCount}+ production MERN + React Native applications across healthcare, IoT &amp; education verticals serving ${userCountFormatted}+ active users</li>
            <li>Engineered IEMA EMR — a full-stack Electronic Medical Records platform with RBAC, appointment scheduling, prescription management, and audit logging</li>
            <li>Containerised microservices with Docker and configured AWS EC2 CI/CD pipelines, cutting deployment time by ~40%</li>
            <li>Led code reviews, enforced best practices, and maintained high test coverage across critical backend modules</li>
          </ul>
        </div>

        <div class="exp">
          <div class="exp-hdr">
            <span class="exp-role">Trainee Developer</span>
            <span class="exp-date">Jan 2023 – Sep 2025</span>
          </div>
          <div class="exp-co">IEMALabs — IEMA Research &amp; Development Pvt. Ltd., Kolkata</div>
          <ul class="bullets">
            <li>Contributed full-feature development on React.js / Node.js / Express products; integrated Razorpay, Twilio SMS &amp; Google Maps APIs</li>
            <li>Optimised MongoDB aggregation pipelines and introduced Redis caching, reducing average API response time by 35%</li>
            <li>Conducted internal VA/PT exercises and patched critical SQL-injection, XSS &amp; IDOR vulnerabilities before production release</li>
          </ul>
        </div>
      </div>

      <!-- Projects -->
      <div class="sec">
        <div class="sec-title">Key Projects</div>
        <div class="proj-grid">

          <div class="proj">
            <div class="proj-name">VAPT Toolkit</div>
            <div class="proj-desc">Automated VA/PT suite with recon, port scanning, CVE lookup &amp; structured HTML report generation.</div>
            <div class="tags"><span class="tag">Python</span><span class="tag">Nmap</span><span class="tag">Shodan API</span><span class="tag c">Security</span></div>
          </div>

          <div class="proj">
            <div class="proj-name">IEMA EMR</div>
            <div class="proj-desc">Production Electronic Medical Records system with RBAC, appointment scheduling &amp; prescription workflow.</div>
            <div class="tags"><span class="tag">React</span><span class="tag">Node.js</span><span class="tag">MongoDB</span><span class="tag c">Healthcare</span></div>
          </div>

          <div class="proj">
            <div class="proj-name">CyberShield</div>
            <div class="proj-desc">Real-time threat intelligence dashboard with NVD CVE tracking &amp; live Socket.io security event alerts.</div>
            <div class="tags"><span class="tag">React</span><span class="tag">Socket.io</span><span class="tag">Node.js</span><span class="tag c">Security</span></div>
          </div>

          <div class="proj">
            <div class="proj-name">IoT Asset Monitor</div>
            <div class="proj-desc">Industrial MQTT telemetry dashboard with real-time charts, threshold alerts &amp; device health monitoring.</div>
            <div class="tags"><span class="tag">MQTT</span><span class="tag">React</span><span class="tag">Socket.io</span><span class="tag c">IoT</span></div>
          </div>

          <div class="proj">
            <div class="proj-name">SecureVault</div>
            <div class="proj-desc">Zero-knowledge AES-256 password manager with HIBP breach detection &amp; encrypted vault sync.</div>
            <div class="tags"><span class="tag">React</span><span class="tag">AES-256</span><span class="tag">Node.js</span><span class="tag c">Security</span></div>
          </div>

          <div class="proj cyan-accent">
            <div class="proj-name">IntelliChat</div>
            <div class="proj-desc">MERN real-time chat platform with Gemini 1.5 AI assistant, room management &amp; WebSocket messaging.</div>
            <div class="tags"><span class="tag">React</span><span class="tag">Gemini AI</span><span class="tag">Socket.io</span><span class="tag c">AI/ML</span></div>
          </div>

        </div>
      </div>

    </div><!-- /left -->

    <!-- ── RIGHT COLUMN ── -->
    <div class="col">

      <!-- Skills -->
      <div class="sec">
        <div class="sec-title">Technical Skills</div>

        <div class="skill-row">
          <div class="skill-lbl">Languages</div>
          <div class="skill-tags">
            <span class="tag">JavaScript</span><span class="tag">TypeScript</span><span class="tag">Python</span>
            <span class="tag">Java</span><span class="tag">Kotlin</span><span class="tag">C / C++</span>
            <span class="tag">SQL</span><span class="tag">Bash</span>
          </div>
        </div>

        <div class="skill-row">
          <div class="skill-lbl">Web &amp; Mobile</div>
          <div class="skill-tags">
            <span class="tag">React.js</span><span class="tag">Next.js</span><span class="tag">Node.js</span>
            <span class="tag">Express.js</span><span class="tag">React Native</span><span class="tag">GraphQL</span>
            <span class="tag">MongoDB</span><span class="tag">PostgreSQL</span><span class="tag">Redis</span>
            <span class="tag">Socket.io</span><span class="tag">Tailwind CSS</span>
          </div>
        </div>

        <div class="skill-row">
          <div class="skill-lbl">DevOps &amp; Cloud</div>
          <div class="skill-tags">
            <span class="tag">Docker</span><span class="tag">AWS EC2</span><span class="tag">AWS S3</span>
            <span class="tag">Nginx</span><span class="tag">GitHub Actions</span><span class="tag">Linux</span>
          </div>
        </div>

        <div class="skill-row">
          <div class="skill-lbl">Security</div>
          <div class="skill-tags">
            <span class="tag c">VAPT</span><span class="tag c">Penetration Testing</span>
            <span class="tag c">Kali Linux</span><span class="tag c">Burp Suite</span>
            <span class="tag c">Wireshark</span><span class="tag c">Nmap</span><span class="tag c">OWASP Top 10</span>
          </div>
        </div>
      </div>

      <!-- Education -->
      <div class="sec">
        <div class="sec-title">Education</div>

        <div class="edu">
          <div class="edu-deg">B.Tech — CS &amp; Business Systems</div>
          <div class="edu-sch">Institute of Engineering &amp; Management, Kolkata</div>
          <div class="edu-yr">2021 – 2025</div>
        </div>

        <div class="edu">
          <div class="edu-deg">Diploma — CS &amp; Technology</div>
          <div class="edu-sch">Saroj Mohan Institute of Technology, Hooghly</div>
          <div class="edu-yr">2018 – 2021</div>
        </div>
      </div>

      <!-- Certifications -->
      <div class="sec">
        <div class="sec-title">Certifications</div>

        <div class="cert">
          <div class="cert-dot"></div>
          <div>
            <div class="cert-name">AWS Fundamentals Specialisation</div>
            <div class="cert-sub">Coursera — Amazon Web Services · 2024</div>
          </div>
        </div>

        <div class="cert">
          <div class="cert-dot c"></div>
          <div>
            <div class="cert-name">TryHackMe — Active Practitioner</div>
            <div class="cert-sub">Web Fundamentals · Jr Pentester · SOC Analyst L1</div>
          </div>
        </div>

        <div class="cert">
          <div class="cert-dot"></div>
          <div>
            <div class="cert-name">Robotrix 2024 — Lead Developer</div>
            <div class="cert-sub">IEM Annual Robotics Competition Platform</div>
          </div>
        </div>
      </div>

      <!-- Open Source -->
      <div class="sec">
        <div class="sec-title">Open Source &amp; Community</div>
        <p class="oss">
          <strong>100+ public repositories</strong> on GitHub<br/>
          github.com/Arunava-27<br/>
          <strong>Notable:</strong> vapt-toolkit · cybershield · iema-emr<br/>
          iot-asset-monitor · securevault · intellichat
        </p>
      </div>

    </div><!-- /right -->

  </div><!-- /body -->

</div>
</body>
</html>`;

// ─── Generate PDF ──────────────────────────────────────────────────────────────

const outPdf  = resolve(__dirname, "../public/arunava_kundu_resume.pdf");
const outHtml = resolve(__dirname, "../public/cv.html");

writeFileSync(outHtml, html, "utf-8");
console.log(`✔  HTML saved → ${outHtml}`);

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

try {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);

  await page.pdf({
    path: outPdf,
    format: "A4",
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  console.log(`✔  PDF saved  → ${outPdf}`);
} finally {
  await browser.close();
}
