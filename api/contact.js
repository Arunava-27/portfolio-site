import { Resend } from "resend";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// --- Resend client -----------------------------------------------------------
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// --- Rate limiter (5 requests per IP per hour, sliding window) ---------------
// Gracefully skips if Upstash env vars are absent (local dev without Redis).
let ratelimit = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    }),
    limiter: Ratelimit.slidingWindow(5, "1 h"),
    analytics: false,
  });
} else {
  console.warn("[contact] Upstash env vars missing -- rate limiting disabled.");
}

// --- Helpers -----------------------------------------------------------------

/** Escape HTML special chars so user input is safe inside email HTML. */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/** Strip every HTML/script tag from a string. */
function stripTags(str) {
  return String(str).replace(/<[^>]*>/g, "");
}

/** Sanitize: strip tags then HTML-escape. */
function sanitize(str) {
  return escapeHtml(stripTags(str)).trim();
}

// --- Field limits ------------------------------------------------------------
const LIMITS = { name: 100, email: 254, subject: 150, message: 2000 };

function toOrigin(urlLike) {
  if (!urlLike) return "";
  try {
    return new URL(urlLike).origin;
  } catch {
    return "";
  }
}

function getAllowedOrigins() {
  const origins = new Set([
    "https://arunavakundu.com",
    "https://www.arunavakundu.com",
  ]);

  if (process.env.VERCEL_URL) {
    origins.add(`https://${process.env.VERCEL_URL}`);
  }

  for (const key of ["SITE_URL", "PUBLIC_SITE_URL", "NEXT_PUBLIC_SITE_URL"]) {
    const origin = toOrigin(process.env[key]);
    if (origin) origins.add(origin);
  }

  return origins;
}

// --- Handler -----------------------------------------------------------------
export default async function handler(req, res) {
  // -- Method --
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  // -- Content-Type --
  const ct = req.headers["content-type"] ?? "";
  if (!ct.includes("application/json")) {
    return res.status(415).json({ error: "Content-Type must be application/json." });
  }

  // -- Origin / Referer check (production only) --
  if (process.env.NODE_ENV === "production") {
    const allowedOrigins = getAllowedOrigins();
    const allowedHosts = new Set(
      [...allowedOrigins]
        .map((origin) => {
          try {
            return new URL(origin).host;
          } catch {
            return "";
          }
        })
        .filter(Boolean)
    );

    const origin = toOrigin(req.headers["origin"] ?? "");
    const refererOrigin = toOrigin(req.headers["referer"] ?? "");
    const originOk = (origin && allowedOrigins.has(origin)) || (refererOrigin && allowedOrigins.has(refererOrigin));

    // Some privacy modes omit Origin/Referer for same-origin form posts.
    const secFetchSite = String(req.headers["sec-fetch-site"] ?? "").toLowerCase();
    const forwardedHost = String(req.headers["x-forwarded-host"] ?? req.headers.host ?? "").toLowerCase();
    const hostOnly = forwardedHost.split(":")[0];
    const hostOk = allowedHosts.has(hostOnly);
    const likelySameOrigin = !secFetchSite || secFetchSite === "same-origin" || secFetchSite === "none";

    if (!originOk && !(hostOk && likelySameOrigin)) {
      return res.status(403).json({ error: "Forbidden." });
    }
  }

  // -- Rate limiting --
  if (ratelimit) {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      req.socket?.remoteAddress ||
      "unknown";

    const { success, limit, remaining, reset } = await ratelimit.limit(ip);
    res.setHeader("X-RateLimit-Limit",     String(limit));
    res.setHeader("X-RateLimit-Remaining", String(remaining));
    res.setHeader("X-RateLimit-Reset",     String(reset));

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      res.setHeader("Retry-After", String(retryAfter));
      return res.status(429).json({
        error: `Too many requests. Please wait ${Math.ceil(retryAfter / 60)} minute(s) before trying again.`,
      });
    }
  }

  // -- Resend configured? --
  if (!resend) {
    return res.status(500).json({ error: "Email service is not configured." });
  }

  const body = req.body ?? {};

  // -- Honeypot: bots fill this, humans leave it blank --
  if (body.hp_field) {
    return res.status(200).json({ ok: true });
  }

  const { name, email, subject, message } = body;

  // -- Presence check --
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // -- Length limits --
  for (const [field, max] of Object.entries(LIMITS)) {
    if (String(body[field] ?? "").length > max) {
      return res.status(400).json({ error: `${field} must be ${max} characters or fewer.` });
    }
  }

  // -- Email format (capped to avoid ReDoS) --
  const trimmedEmail = String(email).trim().slice(0, 254);
  if (!/^[^\s@]{1,64}@[^\s@]{1,185}\.[^\s@]{2,}$/.test(trimmedEmail)) {
    return res.status(400).json({ error: "Invalid email address." });
  }

  // -- Sanitize all fields for safe HTML embedding --
  const safeName    = sanitize(name);
  const safeEmail   = sanitize(trimmedEmail);
  const safeSubject = sanitize(subject);
  const safeMessage = sanitize(message);

  try {
    await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: "drarunkundu22@gmail.com",
      reply_to: trimmedEmail,
      subject: `[Portfolio] ${safeSubject}`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 32px; border-radius: 12px;">
          <div style="background: linear-gradient(135deg, #7c3aed, #0891b2); padding: 2px; border-radius: 10px; margin-bottom: 24px;">
            <div style="background: #0f172a; border-radius: 9px; padding: 24px; text-align: center;">
              <h1 style="color: #fff; font-size: 22px; margin: 0; font-weight: 800;">New Contact Form Submission</h1>
              <p style="color: #94a3b8; font-size: 13px; margin: 6px 0 0;">arunavakundu.com</p>
            </div>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="padding: 10px 14px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px 8px 0 0;">
                <span style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;">From</span><br/>
                <span style="font-size: 15px; color: #0f172a; font-weight: 600;">${safeName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; background: #fff; border: 1px solid #e2e8f0; border-top: none;">
                <span style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;">Email</span><br/>
                <a href="mailto:${safeEmail}" style="font-size: 15px; color: #0891b2; text-decoration: none;">${safeEmail}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; background: #fff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
                <span style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;">Subject</span><br/>
                <span style="font-size: 15px; color: #0f172a; font-weight: 600;">${safeSubject}</span>
              </td>
            </tr>
          </table>
          <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <span style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;">Message</span>
            <p style="font-size: 14px; color: #334155; line-height: 1.65; margin: 8px 0 0; white-space: pre-wrap;">${safeMessage}</p>
          </div>
          <a href="mailto:${safeEmail}?subject=Re: ${safeSubject}"
            style="display: block; text-align: center; padding: 12px; background: linear-gradient(135deg, #7c3aed, #0891b2); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px;">
            Reply to ${safeName}
          </a>
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 20px;">
            Sent from the contact form at <a href="https://arunavakundu.com" style="color: #7c3aed;">arunavakundu.com</a>
          </p>
        </div>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[contact] Resend error:", err);
    return res.status(500).json({ error: "Failed to send message. Please try again." });
  }
}
