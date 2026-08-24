const env = globalThis.process?.env ?? {};

const jsonResponse = (body, status = 200, headers = {}) => new Response(
  JSON.stringify(body),
  {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers,
    },
  },
);

const getCorsHeaders = (request) => {
  const requestOrigin = request.headers.get("origin");
  const allowedOrigin = env.BOOKING_ALLOWED_ORIGIN;

  if (!allowedOrigin || !requestOrigin) {
    return {};
  }

  if (allowedOrigin !== "*" && requestOrigin !== allowedOrigin) {
    return {};
  }

  return {
    "Access-Control-Allow-Origin": allowedOrigin === "*" ? "*" : requestOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
};

const isValidDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsedDate = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsedDate.getTime())
    && parsedDate.toISOString().slice(0, 10) === value;
};

const escapeHtml = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const sendTelegramNotification = async ({ date, time, activity, notes }) => {
  const lines = [
    "💌 Naujas pasimatymas!",
    `📅 Data: ${date}`,
    `🕒 Laikas: ${time}`,
    `✨ Veikla: ${activity}`,
  ];

  if (notes) {
    lines.push(`📝 Detalės: ${notes}`);
  }

  const response = await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text: lines.join("\n"),
      }),
    },
  );
  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.ok === false) {
    throw new Error(`Telegram notification failed: ${result.description || response.status}`);
  }
};

const sendEmailNotification = async ({ date, time, activity, notes }) => {
  const safeDate = escapeHtml(date);
  const safeTime = escapeHtml(time);
  const safeActivity = escapeHtml(activity);
  const safeNotes = notes ? escapeHtml(notes).replaceAll("\n", "<br />") : "Nepateikta";
  const from = env.BOOKING_FROM_EMAIL
    || "Pasimatymų rezervacija <onboarding@resend.dev>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [env.BOOKING_NOTIFICATION_EMAIL],
      subject: `Naujas pasimatymas: ${date} ${time}`,
      html: `
        <div style="font-family: Georgia, serif; color: #2b1b22; line-height: 1.6">
          <h1 style="color: #6b1f35">💌 Naujas pasimatymas!</h1>
          <p><strong>Data:</strong> ${safeDate}</p>
          <p><strong>Laikas:</strong> ${safeTime}</p>
          <p><strong>Veikla:</strong> ${safeActivity}</p>
          <p><strong>Detalės:</strong> ${safeNotes}</p>
        </div>
      `,
      text: [
        "Naujas pasimatymas!",
        `Data: ${date}`,
        `Laikas: ${time}`,
        `Veikla: ${activity}`,
        `Detalės: ${notes || "Nepateikta"}`,
      ].join("\n"),
    }),
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(`Email notification failed: ${result.message || response.status}`);
  }
};

export default {
  async fetch(request) {
    const corsHeaders = getCorsHeaders(request);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return jsonResponse({ error: "Leidžiamas tik POST metodas." }, 405, {
        ...corsHeaders,
        Allow: "POST, OPTIONS",
      });
    }

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 16_384) {
      return jsonResponse({ error: "Rezervacijos duomenys per dideli." }, 413, corsHeaders);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return jsonResponse({ error: "Neteisingas rezervacijos formatas." }, 400, corsHeaders);
    }

    if (typeof payload.website === "string" && payload.website.trim()) {
      return jsonResponse({ ok: true }, 200, corsHeaders);
    }

    const date = typeof payload.date === "string" ? payload.date.trim() : "";
    const time = typeof payload.time === "string" ? payload.time.trim() : "";
    const activity = typeof payload.activity === "string" ? payload.activity.trim() : "";
    const notes = typeof payload.notes === "string" ? payload.notes.trim() : "";

    if (!isValidDate(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
      return jsonResponse({ error: "Pasirinkite tinkamą datą ir laiką." }, 400, corsHeaders);
    }

    if (!activity || activity.length > 100 || notes.length > 1000) {
      return jsonResponse({ error: "Patikrinkite veiklą ir papildomas detales." }, 400, corsHeaders);
    }

    const booking = { date, time, activity, notes };
    const notificationTasks = [];

    if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
      notificationTasks.push({
        channel: "telegram",
        promise: sendTelegramNotification(booking),
      });
    }

    if (env.RESEND_API_KEY && env.BOOKING_NOTIFICATION_EMAIL) {
      notificationTasks.push({
        channel: "email",
        promise: sendEmailNotification(booking),
      });
    }

    if (notificationTasks.length === 0) {
      return jsonResponse({
        error: "Pranešimų kanalas dar nesukonfigūruotas.",
      }, 503, corsHeaders);
    }

    const results = await Promise.allSettled(
      notificationTasks.map(({ promise }) => promise),
    );
    const sentChannels = results.flatMap((result, index) => (
      result.status === "fulfilled" ? [notificationTasks[index].channel] : []
    ));
    const failedResults = results.filter((result) => result.status === "rejected");

    failedResults.forEach((result) => {
      console.error(result.reason);
    });

    if (sentChannels.length === 0) {
      return jsonResponse({
        error: "Pranešimo išsiųsti nepavyko. Pabandykite dar kartą.",
      }, 502, corsHeaders);
    }

    return jsonResponse({ ok: true, channels: sentChannels }, 200, corsHeaders);
  },
};
