// The site's backend: one Express app. On Vercel it runs as a single
// serverless function (api/index.js); in development Vite mounts it as
// middleware, so there is one process and one port either way.
//
//   GET  /api/status    every live project, fetched and timed from here
//   POST /api/contact   the compose window's message, sent by email
//   GET  /api/health    for a quick "is the backend up" check

import express from 'express';
import { checkAll } from './status.js';

export const EMAIL = 'sahilpathak2005@gmail.com';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, mail: Boolean(process.env.RESEND_API_KEY) });
});

app.get('/api/status', async (req, res, next) => {
  try {
    // cached at the edge for a minute, so each site is asked at most once a
    // minute however many people visit; ?fresh=… is a different cache key,
    // which is how the status board's Check again gets a new answer
    res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    res.json(await checkAll());
  } catch (err) { next(err); }
});

// ---- contact ---------------------------------------------------------------
// ponytail: in-memory rate limit, per serverless instance. Enough to stop a
// script hammering one instance; a shared store (Upstash) if abuse ever
// spreads across instances.
const recent = new Map();
function limited(ip) {
  const now = Date.now();
  const hits = (recent.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  hits.push(now);
  recent.set(ip, hits);
  return hits.length > 5;
}

const clean = (v, max) => String(v ?? '').replace(/\s+$/g, '').slice(0, max);
const ABOUT = new Set(['Hiring', 'A project', 'Something else']);

app.post('/api/contact', async (req, res) => {
  const b = req.body || {};
  // the hidden "website" field is filled only by bots
  if (b.website) return res.json({ sent: true });
  const msg = clean(b.msg, 5000).trim();
  const email = clean(b.email, 200).trim();
  const name = clean(b.name, 120).trim();
  const org = clean(b.org, 160).trim();
  const about = ABOUT.has(b.about) ? b.about : 'Something else';

  const errors = {};
  if (!msg) errors.msg = 'Write a line or two first.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Add an email address I can reply to.';
  if (Object.keys(errors).length) return res.status(400).json({ errors });

  const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  if (limited(ip)) return res.status(429).json({ error: 'Too many messages from here in a few minutes. Try again shortly.' });

  // Without a mail provider configured, say so: the page then opens the
  // visitor's own email app with the message written, which always works.
  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(503).json({ fallback: 'mailto' });

  const subject = `${about}${org ? ': ' + org : name ? ': ' + name : ''}`;
  const text = `${msg}\n\n${[name, org].filter(Boolean).join(', ')}\n${email}`;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM || 'Portfolio <onboarding@resend.dev>',
        to: [process.env.CONTACT_TO || EMAIL],
        reply_to: email,
        subject: `[Portfolio] ${subject}`,
        text,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) return res.status(502).json({ fallback: 'mailto' });
    res.json({ sent: true });
  } catch {
    res.status(502).json({ fallback: 'mailto' });
  }
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => res.status(500).json({ error: 'Something failed on the server.' }));

export default app;
