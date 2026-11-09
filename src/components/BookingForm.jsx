import { useRef, useState } from 'react';
import { bookingNow, dateActivities, validateBooking } from '../../shared/booking';

const empty = { date: '', time: '', activity: '', notes: '', website: '' };
const api = import.meta.env.VITE_BOOKING_API_URL || '/api/book-date';

export default function BookingForm() {
  const [booking, setBooking] = useState(empty);
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const change = ({ target: { name, value } }) => {
    setBooking((previous) => ({ ...previous, [name]: value }));
    setStatus({ type: 'idle', message: '' });
  };
  const submit = async (event) => {
    event.preventDefault();
    if (inFlight.current) return;
    const error = validateBooking(booking);
    if (error) { setStatus({ type: 'error', message: error }); return; }
    inFlight.current = true;
    setBusy(true);
    setStatus({ type: 'idle', message: '' });
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20_000);
    try {
      const response = await fetch(api, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking), signal: controller.signal,
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.ok !== true) throw new Error(result?.error || 'Nepavyko išsiųsti. Pabandyk dar kartą.');
      setBooking(empty);
      setStatus({ type: 'success', message: 'Kvietimas išsiųstas Ignui! Liko tik sulaukti atsakymo. ♡' });
    } catch (error) {
      setStatus({ type: 'error', message: error.name === 'AbortError'
        ? 'Siuntimas užtruko. Pabandyk dar kartą — pakartotinis kvietimas nebus siunčiamas du kartus.'
        : error.message || 'Nėra ryšio. Pabandyk dar kartą.' });
    } finally {
      window.clearTimeout(timeout);
      inFlight.current = false;
      setBusy(false);
    }
  };
  const current = bookingNow();
  return <section className="booking-section section" id="pasimatymas" aria-labelledby="booking-heading">
    <div className="booking-intro">
      <p className="eyebrow">03 / Kitas mūsų nuotykis</p>
      <h2 id="booking-heading">Gražiausi planai —<br /><em>su tavimi.</em></h2>
      <p>Vakarienė, mažas pabėgimas ar tiesiog laikas dviese. Sugalvok, ko norėtum, ir pakviesk mane.</p>
      <span className="booking-heart" aria-hidden="true">♡</span>
      <p className="personal-note">Aš visada už dar vieną mūsų prisiminimą.<br /><span>— Ignas</span></p>
    </div>
    <form className="booking-panel" onSubmit={submit} aria-busy={busy}>
      <h3>Pakviesk į pasimatymą</h3>
      <p className="form-intro">Tavo kvietimas atkeliaus tiesiai man.</p>
      <fieldset disabled={busy} className="booking-fields">
        <div className="booking-when-grid">
          <label className="booking-field">Data<input name="date" type="date" required min={current.date} value={booking.date} onChange={change} /></label>
          <label className="booking-field">Laikas<input name="time" type="time" required min={booking.date === current.date ? current.time : undefined} value={booking.time} onChange={change} /></label>
        </div>
        <p className="field-hint">Laiką planuojame Lietuvos laiku.</p>
        <fieldset className="activity-fieldset">
          <legend>Ką veikiam?</legend>
          <div className="activity-grid">{dateActivities.map(({ label, icon }) => <label key={label} className={`activity-option ${booking.activity === label ? 'is-selected' : ''}`}>
            <input type="radio" name="activity" value={label} required checked={booking.activity === label} onChange={change} />
            <span aria-hidden="true">{icon}</span><span>{label}</span>
          </label>)}</div>
        </fieldset>
        <label className="booking-field notes-label">Dar kas nors? <span className="optional">Nebūtina</span>
          <textarea name="notes" rows="3" maxLength={1000} value={booking.notes} onChange={change} placeholder="Susitikimo vieta ar maža užuomina…" />
        </label>
        <label className="honeypot" aria-hidden="true">Website<input name="website" value={booking.website} onChange={change} tabIndex={-1} autoComplete="off" /></label>
        <button className="button button-primary booking-submit" type="submit" disabled={busy}>
          <span>{busy ? 'Siunčiama…' : 'Siųsti kvietimą'}</span><span aria-hidden="true">↗</span>
        </button>
      </fieldset>
      <p className={`booking-status booking-status--${status.type}`} role={status.type === 'error' ? 'alert' : 'status'}>{status.message}</p>
      {status.type === 'error' && <a className="email-fallback" href={`mailto:ignas.judo@gmail.com?subject=${encodeURIComponent('Kvietimas į pasimatymą')}&body=${encodeURIComponent(`Data: ${booking.date}\nLaikas: ${booking.time} (Lietuvos laiku)\nVeikla: ${booking.activity}\n${booking.notes}`)}`}>Arba atidaryk kvietimą savo el. pašto programoje ↗</a>}
    </form>
  </section>;
}
