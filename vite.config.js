import { defineConfig } from 'vite'
import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { Resend } from 'resend'

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function createContactApiPlugin(mode) {
  const env = loadEnv(mode, process.cwd(), '');
  const resendApiKey = env.RESEND_API_KEY || env.VITE_RESEND_API_KEY;
  const resend = resendApiKey ? new Resend(resendApiKey) : null;

  return {
    name: 'dev-contact-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0];
        if (url !== '/api/contact') {
          return next();
        }

        if (req.method !== 'POST') {
          return sendJson(res, 405, { error: 'Method not allowed' });
        }

        if (!resend) {
          return sendJson(res, 500, { error: 'Email service is not configured. Missing RESEND_API_KEY.' });
        }

        let rawBody = '';
        req.on('data', (chunk) => {
          rawBody += chunk;
        });

        req.on('end', async () => {
          try {
            const { name, email, subject, message } = JSON.parse(rawBody || '{}');

            if (!name || !email || !subject || !message) {
              return sendJson(res, 400, { error: 'All fields are required.' });
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
              return sendJson(res, 400, { error: 'Invalid email address.' });
            }

            await resend.emails.send({
              from: 'Portfolio Contact <onboarding@resend.dev>',
              to: 'drarunkundu22@gmail.com',
              reply_to: email,
              subject: `[Portfolio] ${subject}`,
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
                        <span style="font-size: 15px; color: #0f172a; font-weight: 600;">${name}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 14px; background: #fff; border: 1px solid #e2e8f0; border-top: none;">
                        <span style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;">Email</span><br/>
                        <a href="mailto:${email}" style="font-size: 15px; color: #0891b2; text-decoration: none;">${email}</a>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 14px; background: #fff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
                        <span style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;">Subject</span><br/>
                        <span style="font-size: 15px; color: #0f172a; font-weight: 600;">${subject}</span>
                      </td>
                    </tr>
                  </table>

                  <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                    <span style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;">Message</span>
                    <p style="font-size: 14px; color: #334155; line-height: 1.65; margin: 8px 0 0; white-space: pre-wrap;">${message}</p>
                  </div>

                  <a href="mailto:${email}?subject=Re: ${subject}"
                    style="display: block; text-align: center; padding: 12px; background: linear-gradient(135deg, #7c3aed, #0891b2); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px;">
                    Reply to ${name}
                  </a>

                  <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 20px;">
                    Sent from the contact form at <a href="https://arunavakundu.com" style="color: #7c3aed;">arunavakundu.com</a>
                  </p>
                </div>
              `,
            });

            return sendJson(res, 200, { ok: true });
          } catch (err) {
            if (err instanceof SyntaxError) {
              return sendJson(res, 400, { error: 'Invalid JSON payload.' });
            }

            console.error('Resend dev API error:', err);
            return sendJson(res, 500, { error: 'Failed to send message. Please try again.' });
          }
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), createContactApiPlugin(mode)],
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three/')) return 'three';
          if (id.includes('@react-three/fiber') || id.includes('@react-three/drei')) return 'r3f';
          if (id.includes('framer-motion')) return 'framer';
          if (id.includes('node_modules/gsap/')) return 'gsap';
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'react-core';
        },
      },
    },
  },
}))
