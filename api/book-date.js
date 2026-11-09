import { createHash } from 'node:crypto';
import { validateBooking } from '../shared/booking.js';

const MAX_BODY = 16_384;
const recipient = 'ignas.judo@gmail.com';
const json = (data, status = 200, headers = {}) => Response.json(data, {
  status, headers: { 'Cache-Control': 'no-store', ...headers },
});
const escapeHtml = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');

async function readBody(request) {
  if (Number(request.headers.get('content-length')) > MAX_BODY) throw new RangeError();
  const reader = request.body?.getReader();
  if (!reader) throw new SyntaxError();
  const chunks = [];
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_BODY) { await reader.cancel(); throw new RangeError(); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

async function sendEmail(booking, env) {
  const { date, time, activity, notes } = booking;
  // Same payload on a retry uses the same provider key for 24 hours, including across cold starts.
  const idempotency = createHash('sha256').update(JSON.stringify({ recipient, ...booking })).digest('hex');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST', signal: AbortSignal.timeout(12_000),
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `date-${idempotency}` },
    body: JSON.stringify({
      from: env.BOOKING_FROM_EMAIL || 'Mūsų pasimatymai <onboarding@resend.dev>',
      to: [recipient],
      subject: `Kvietimas į pasimatymą · ${date} ${time}`,
      text: `Naujas kvietimas į pasimatymą!\n\nData: ${date}\nLaikas: ${time} (Europe/Vilnius)\nVeikla: ${activity}\nDetalės: ${notes || 'Nepateikta'}\n\nTai kvietimas — atsakymą susitarkite tarpusavyje.`,
      html: `<div style="font-family:Georgia,serif;color:#392c2c;line-height:1.7"><h1 style="color:#813d50">Naujas kvietimas į pasimatymą ♡</h1><p><strong>Data:</strong> ${escapeHtml(date)}</p><p><strong>Laikas:</strong> ${escapeHtml(time)} (Lietuvos laiku)</p><p><strong>Veikla:</strong> ${escapeHtml(activity)}</p><p><strong>Detalės:</strong><br>${escapeHtml(notes || 'Nepateikta').replaceAll('\n', '<br>')}</p><p>Tai kvietimas — atsakymą susitarkite tarpusavyje.</p></div>`,
    }),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.id) throw new Error(`Email provider rejected request (${response.status})`);
}

async function sendTelegram(booking, env) {
  const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST', signal: AbortSignal.timeout(4_000),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: `💌 Kvietimas į pasimatymą\n${booking.date} ${booking.time} (Lietuvos laiku)\n${booking.activity}\n${booking.notes}` }),
  });
  if (!response.ok) throw new Error('Telegram notification failed');
}

// Vercel Node.js Web Standard handler; secrets are read only on the server.
export default {
  async fetch(request) {
    const env = process.env;
    const origin = request.headers.get('origin');
    const sameOrigin = new URL(request.url).origin;
    const allowed = !origin || origin === sameOrigin || origin === env.BOOKING_ALLOWED_ORIGIN;
    const cors = origin && allowed ? {
      'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type', Vary: 'Origin',
    } : {};
    if (!allowed) return json({ error: 'Ši svetainė negali siųsti kvietimų.' }, 403);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return json({ error: 'Leidžiamas tik POST metodas.' }, 405, { ...cors, Allow: 'POST, OPTIONS' });
    if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') || '')) return json({ error: 'Reikalingas JSON formatas.' }, 415, cors);
    let payload;
    try { payload = await readBody(request); }
    catch (error) { return json({ error: error instanceof RangeError ? 'Kvietimo duomenys per dideli.' : 'Neteisingas kvietimo formatas.' }, error instanceof RangeError ? 413 : 400, cors); }
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return json({ error: 'Neteisingas kvietimo formatas.' }, 400, cors);
    if (typeof payload.website === 'string' && payload.website.trim()) return json({ ok: true }, 200, cors);
    const booking = Object.fromEntries(['date', 'time', 'activity', 'notes'].map((key) => [key, typeof payload[key] === 'string' ? payload[key].trim() : '']));
    const error = validateBooking(booking);
    if (error) return json({ error }, 400, cors);
    if (!env.RESEND_API_KEY) return json({ error: 'Kvietimų siuntimas dar neįjungtas. Parašyk man el. paštu.' }, 503, cors);
    try { await sendEmail(booking, env); }
    catch (error) {
      console.error('Booking email failed:', error.name);
      return json({ error: 'Kvietimo išsiųsti nepavyko. Pabandyk dar kartą arba parašyk el. paštu.' }, 502, cors);
    }
    // Optional secondary channel must never mask a failed email or invalidate a sent one.
    if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
      try { await sendTelegram(booking, env); }
      catch { console.error('Optional booking Telegram notification failed'); }
    }
    return json({ ok: true, channels: ['email'] }, 200, cors);
  },
};
