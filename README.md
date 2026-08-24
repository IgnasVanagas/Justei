# Meilės kelionė

Valentino dienos tematikos svetainė su laiko juosta, slaptažodžio vartais ir interaktyviu žemėlapiu.

## Paleidimas

1. Įrašymas: `npm install`
2. Startas: `npm run dev`
3. Naršyklėje atidarykite pateiktą vietinį adresą iš terminalo.

## Gamyba

- Sukurti build: `npm run build`
- Peržiūrėti build: `npm run preview`

## Pasimatymo rezervacijos

Rezervacijos forma siunčia duomenis į `POST /api/book-date`. `api` aplanke esanti
funkcija pritaikyta Vercel diegimui. Vietiniam visos svetainės ir funkcijos
paleidimui naudokite `npx vercel dev`.

1. Nukopijuokite `.env.example` į `.env.local`.
2. Sukonfigūruokite bent vieną pranešimų kanalą:
   - Telegram: `TELEGRAM_BOT_TOKEN` ir `TELEGRAM_CHAT_ID`.
   - El. paštas per Resend: `RESEND_API_KEY` ir `BOOKING_NOTIFICATION_EMAIL`.
3. Jei sukonfigūruoti abu kanalai, pranešimas bus siunčiamas į abu.

Diegiant kitur serverio funkciją galima talpinti atskirai, o jos adresą nurodyti
per `VITE_BOOKING_API_URL`. Telegram ir el. pašto raktų negalima dėti į
`VITE_` kintamuosius, nes jie būtų matomi naršyklėje.
