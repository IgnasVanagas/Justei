# Meilės kelionė

Ignas and Justė's Lithuanian photo album, memory map, and date invitations.
Production: https://justei.vercel.app/

## Local development

Use Node.js 22 and `npm ci`, then `npm run dev`. On Windows PowerShell, use
`npm.cmd` if execution policy blocks `npm.ps1`.

`npm run dev` generates responsive photos and serves both the app and the real
`/api/book-date` handler. Copy `.env.example` to `.env.local` to configure local
email delivery. Restart the dev server after changing environment variables.
Without a Resend key, submitting the form returns a clear error and an email-app
fallback, rather than claiming the invitation was sent.

## Vercel deployment and email setup

1. Deploy this checkout to the existing `Justei` Vercel project. For a Git-connected
   project, commit and push the changes to its configured production branch.
   `vercel.json` selects Vite, `npm run build`, and `dist` automatically.
2. In Vercel → Project Settings → Environment Variables, add `RESEND_API_KEY`
   for Production (and Preview if invitations should work on preview deployments).
3. Set `BOOKING_FROM_EMAIL` to a sender on your verified Resend domain, for example
   `Mūsų pasimatymai <pasimatymai@your-verified-domain.example>`.
   The default `onboarding@resend.dev` is for testing and only sends to the email
   address of the Resend account owner. It can reach `ignas.judo@gmail.com` only
   if that is the account owner's email. See [Resend sender restrictions](https://resend.com/docs/knowledge-base/403-error-resend-dev-domain).
4. Redeploy after changing environment variables. Submit one future invitation
   and verify it in the Gmail inbox and Resend logs.

The recipient is fixed on the server to **ignas.judo@gmail.com**. The previous
`BOOKING_NOTIFICATION_EMAIL` variable is no longer needed. Never put secrets in
`VITE_` variables; those are public browser configuration.

The API uses the [Vercel Web Standard Node.js handler](https://vercel.com/docs/functions/runtimes/node-js).
It validates dates and activities, limits request sizes, escapes email content,
rejects unrelated browser origins, times out provider calls, and uses Resend
idempotency keys so retries do not duplicate an email for 24 hours. All invitation
times use `Europe/Vilnius`, including daylight-saving offsets. A successful
response means Resend accepted the email, not that Gmail inbox delivery is confirmed.

Telegram is an optional secondary notification: set `TELEGRAM_BOT_TOKEN` and
`TELEGRAM_CHAT_ID`. Email must succeed before the form reports success.
For a separately hosted frontend, set its exact origin in `BOOKING_ALLOWED_ORIGIN`
and the endpoint in `VITE_BOOKING_API_URL`. Neither is necessary on Vercel.

## Images and performance

Original files in `media/` are preserved. `scripts/prepare-media.mjs` generates
480, 960, and 1600 pixel WebP variants, without upscaling, with corrected orientation
and no original EXIF metadata. Content hashes make immutable CDN caching safe.
Generated `public/media/` and `src/data/media-manifest.json` are ignored and rebuilt
by `predev` / `prebuild`; do not deploy with a build command that skips `prebuild`.

The album shows nine memories at a time, with year filters and a load-more button.
Photos load lazily at the appropriate display size, the hero has priority, the map
bundle loads only when opened, and the video uses `preload="none"` and native controls.
Layouts include safe-area insets, dynamic viewport sizing, 16px form inputs to avoid
iOS focus zoom, large touch targets, reduced-motion support, and native modal focus
management. No external font downloads or scroll-driven animations are required.

Five photos referenced by the existing memories are absent from this checkout:

- `20260626_201450.jpg`
- `20260628_162412.jpg`
- `20260708_100620.jpg`
- `20260709_105013.jpg`
- `20260801_064051.jpg`

Their memories and map pins are retained with a placeholder. Add the originals to
`media/` with these filenames and rebuild to restore them automatically.

The existing client-side secret-word gate is preserved. It is a presentation gate;
it does not provide server-side access control for publicly served assets.

## Checks

- `npm test`: booking validation, timezone boundaries, request limits, origin
  handling, mocked provider failures, fixed recipient, HTML escaping and retries.
- `npm run lint`: JavaScript and React checks.
- `npm run build`: generate photos and create the production build.
- `npm run check:media`: verify generated image dimensions and report missing originals.
- `npm run check:render`: smoke-check locked/unlocked rendering and deferred media.
- `npm run preview`: serve built static files; use `npm run dev` or `vercel dev`
  when testing the API as well.

Before production release, visually check Safari on iPhone and MacBook: unlock,
year filters, load more, gallery controls, lightbox Escape/close, video playback,
map selection/fullscreen and form success/failure. Actual Apple-device and visual
browser checks were not available in this editing session. Provider calls in the
automated suite are mocked; they do not send real email.
