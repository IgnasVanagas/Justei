import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import bookingHandler from './api/book-date.js'

// Exercise the real Vercel handler locally as well as in production.
function bookingApi() {
  return {
    name: 'local-booking-api',
    configureServer(server) {
      server.middlewares.use('/api/book-date', async (req, res) => {
        try {
          const origin = `http://${req.headers.host}`;
          const request = new Request(`${origin}/api/book-date`, {
            method: req.method, headers: req.headers,
            ...(['GET', 'HEAD'].includes(req.method) ? {} : { body: req, duplex: 'half' }),
          });
          const response = await bookingHandler.fetch(request);
          res.writeHead(response.status, Object.fromEntries(response.headers));
          res.end(await response.text());
        } catch {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Nepavyko apdoroti kvietimo.' }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const localEnv = loadEnv(mode, process.cwd(), '');
  for (const key of ['RESEND_API_KEY', 'BOOKING_FROM_EMAIL', 'BOOKING_ALLOWED_ORIGIN', 'TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID']) {
    if (localEnv[key] && !process.env[key]) process.env[key] = localEnv[key];
  }
  return {
    plugins: [react(), bookingApi()],
    build: { target: 'safari16.4' },
  };
})
