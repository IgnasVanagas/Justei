export const dateActivities = [
  { label: 'Romantiška vakarienė', icon: '✦' },
  { label: 'Pasivaikščiojimas', icon: '↗' },
  { label: 'Dviračių išvyka', icon: '∞' },
  { label: 'Kinas', icon: '▶' },
  { label: 'Piknikas', icon: '☀' },
  { label: 'Kelionė arba nuotykis', icon: '⌁' },
  { label: 'Stalo žaidimų vakaras', icon: '◇' },
  { label: 'Staigmena', icon: '♡' },
];
export const BOOKING_TIME_ZONE = 'Europe/Vilnius';
export function bookingNow(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: BOOKING_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(now);
  const value = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return { date: `${value.year}-${value.month}-${value.day}`, time: `${value.hour}:${value.minute}` };
}
export function validateBooking({ date, time, activity, notes }, now = new Date()) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)
    || Number.isNaN(Date.parse(`${date}T00:00:00Z`))
    || new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date
    || typeof time !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    return 'Pasirink tinkamą datą ir laiką.';
  }
  const current = bookingNow(now);
  if (`${date}T${time}` <= `${current.date}T${current.time}`) return 'Pasirink dar neatėjusią datą ir laiką (Lietuvos laiku).';
  if (!dateActivities.some(({ label }) => label === activity)) return 'Pasirink pasimatymo veiklą.';
  if (typeof notes !== 'string' || notes.length > 1000) return 'Detalėms skirk iki 1000 simbolių.';
  return '';
}
