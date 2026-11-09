import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/book-date.js';
import { bookingNow, validateBooking } from '../shared/booking.js';

const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };
const valid = { date: '2099-06-20', time: '18:30', activity: 'Piknikas', notes: 'Prie ežero', website: '' };
const request = (payload = valid, overrides = {}) => new Request('https://justei.example/api/book-date', {
  method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://justei.example' },
  body: JSON.stringify(payload), ...overrides,
});
afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const name of ['RESEND_API_KEY', 'BOOKING_FROM_EMAIL', 'BOOKING_ALLOWED_ORIGIN', 'TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID']) {
    if (originalEnv[name] === undefined) delete process.env[name]; else process.env[name] = originalEnv[name];
  }
});

test('Vilnius date and time cross midnight correctly in summer and winter', () => {
  assert.deepEqual(bookingNow(new Date('2026-06-20T21:30:00Z')), { date: '2026-06-21', time: '00:30' });
  assert.deepEqual(bookingNow(new Date('2026-11-09T22:30:00Z')), { date: '2026-11-10', time: '00:30' });
});
test('validation rejects impossible dates, invalid times, past times and unlisted activities', () => {
  const now = new Date('2026-11-09T12:00:00Z');
  for (const patch of [{ date: '2099-02-30' }, { date: '2026-01-01' }, { time: '24:10' }, { time: '9:00' }, { activity: 'Invalid' }, { notes: 'x'.repeat(1001) }, { date: '2026-11-09', time: '13:59' }]) {
    assert.notEqual(validateBooking({ ...valid, ...patch }, now), '');
  }
  assert.equal(validateBooking({ ...valid, date: '2026-11-09', time: '14:01' }, now), '');
});
test('API rejects null, arrays, malformed JSON and oversized bodies without Content-Length', async () => {
  for (const body of ['null', '[]', '{invalid']) {
    const response = await handler.fetch(request(null, { body }));
    assert.equal(response.status, 400);
  }
  const response = await handler.fetch(request({ ...valid, notes: 'x'.repeat(17000) }));
  assert.equal(response.status, 413);
});
test('API rejects past dates and invalid form fields', async () => {
  for (const patch of [{ date: '2020-01-01' }, { activity: 'unknown' }, { time: '25:00' }, { notes: 'x'.repeat(1001) }]) {
    assert.equal((await handler.fetch(request({ ...valid, ...patch }))).status, 400);
  }
});
test('API enforces method, JSON content type and origin', async () => {
  assert.equal((await handler.fetch(new Request('https://justei.example/api/book-date'))).status, 405);
  assert.equal((await handler.fetch(request(valid, { headers: { 'Content-Type': 'text/plain' } }))).status, 415);
  assert.equal((await handler.fetch(request(valid, { headers: { 'Content-Type': 'application/json', Origin: 'https://unrelated.example' } }))).status, 403);
  const response = await handler.fetch(request(null, { method: 'OPTIONS', body: undefined }));
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://justei.example');
});
test('explicit cross-origin frontend is supported', async () => {
  process.env.BOOKING_ALLOWED_ORIGIN = 'https://frontend.example';
  const response = await handler.fetch(request(null, { method: 'OPTIONS', body: undefined, headers: { Origin: 'https://frontend.example' } }));
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://frontend.example');
});
test('honeypot never sends an email', async () => {
  globalThis.fetch = () => { assert.fail('Should not contact a provider'); };
  assert.equal((await handler.fetch(request({ ...valid, website: 'spam' }))).status, 200);
});
test('missing configuration is a clear failure, even if Telegram is configured', async () => {
  delete process.env.RESEND_API_KEY;
  process.env.TELEGRAM_BOT_TOKEN = 'test'; process.env.TELEGRAM_CHAT_ID = 'test';
  globalThis.fetch = () => { assert.fail('Should not contact a provider'); };
  const response = await handler.fetch(request());
  assert.equal(response.status, 503);
  assert.equal((await response.json()).ok, undefined);
});
test('email goes to the fixed recipient, escapes HTML and deduplicates retries', async () => {
  process.env.RESEND_API_KEY = 'test-only';
  delete process.env.TELEGRAM_BOT_TOKEN;
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, ...options });
    return Response.json({ id: 'mock-email-id' });
  };
  const booking = { ...valid, notes: '<script>alert("x")</script>\nA & B' };
  for (let i = 0; i < 2; i++) {
    const response = await handler.fetch(request(booking));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true, channels: ['email'] });
  }
  const email = JSON.parse(calls[0].body);
  assert.equal(calls[0].url, 'https://api.resend.com/emails');
  assert.deepEqual(email.to, ['ignas.judo@gmail.com']);
  assert.ok(email.text.includes('Europe/Vilnius'));
  assert.ok(email.html.includes('&lt;script&gt;'));
  assert.ok(!email.html.includes('<script>'));
  assert.equal(calls[0].headers['Idempotency-Key'], calls[1].headers['Idempotency-Key']);
  await handler.fetch(request({ ...booking, time: '19:00' }));
  assert.notEqual(calls[0].headers['Idempotency-Key'], calls[2].headers['Idempotency-Key']);
});
test('provider failures, malformed success and network errors never report a sent email', async () => {
  process.env.RESEND_API_KEY = 'test-only';
  delete process.env.TELEGRAM_BOT_TOKEN;
  for (const mock of [async () => Response.json({ message: 'bad key' }, { status: 401 }), async () => Response.json({}), async () => { throw new Error('network'); }]) {
    globalThis.fetch = mock;
    const response = await handler.fetch(request());
    assert.equal(response.status, 502);
    assert.equal((await response.json()).ok, undefined);
  }
});
test('an optional Telegram failure does not turn successful email into failure', async () => {
  process.env.RESEND_API_KEY = 'test-only';
  process.env.TELEGRAM_BOT_TOKEN = 'test'; process.env.TELEGRAM_CHAT_ID = 'test';
  globalThis.fetch = async (url) => url.includes('resend.com') ? Response.json({ id: 'mock-email-id' }) : new Response('', { status: 500 });
  assert.equal((await handler.fetch(request())).status, 200);
});
