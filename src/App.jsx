import { useRef, useState } from 'react';
import { heroImage, locations } from './data/memories';
import Photo from './components/Photo';
import MediaCarousel from './components/MediaCarousel';
import BookingForm from './components/BookingForm';
import MapSection from './components/MapSection';
import Lightbox from './components/Lightbox';
import './App.css';

const STORAGE_KEY = 'meiles-kelione-unlocked';
const years = [...new Set(locations.map(({ date }) => date.slice(0, 4)))];
const dateFormatter = new Intl.DateTimeFormat('lt-LT', { year: 'numeric', month: 'long', day: 'numeric' });

function Gate({ onUnlock }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const submit = (event) => {
    event.preventDefault();
    if (password.trim() !== 'myliu') { setError('Ne tas žodis. Pabandyk dar kartą.'); return; }
    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch { /* Private browsing can disable storage. */ }
    onUnlock();
  };
  return <main className="gate-page">
    <div className="gate-decoration" aria-hidden="true">♡</div>
    <div className="gate-card"><p className="eyebrow">Ignas & Justė</p>
      <h1>Mūsų mažas<br /><em>pasaulis.</em></h1>
      <p className="gate-copy">Visos mūsų akimirkos, vienoje vietoje.<br />Šis puslapis — tik mums.</p>
      <form onSubmit={submit}>
        <label className="booking-field" htmlFor="gate-password">Mūsų slaptas žodis</label>
        <input id="gate-password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => { setPassword(event.target.value); setError(''); }} aria-invalid={Boolean(error)} aria-describedby="gate-error" placeholder="Slaptažodis" />
        <button className="button button-primary" type="submit">Atverti prisiminimus <span aria-hidden="true">↗</span></button>
        <p className="gate-error" id="gate-error" role="alert">{error}</p>
      </form>
      <span className="gate-footer">Nuo 2024.10.06 · Su meile</span>
    </div>
  </main>;
}

function Album({ onOpen, onMap }) {
  const [year, setYear] = useState('all');
  const [count, setCount] = useState(9);
  const nextCard = useRef(null);
  const filtered = year === 'all' ? locations : locations.filter(({ date }) => date.startsWith(year));
  const visible = filtered.slice(0, count);
  return <section className="section album-section" id="prisiminimai" aria-labelledby="album-heading">
    <div className="section-heading"><div><p className="eyebrow">01 / Mūsų istorija</p><h2 id="album-heading">Mažos akimirkos.<br /><em>Didelė laimė.</em></h2></div>
      <p className="section-description">Pirmi kartai, ilgi keliai ir paprastos dienos.<br />Viskas, kas mus atvedė iki čia.</p>
    </div>
    <div className="album-toolbar"><div className="year-filters" role="group" aria-label="Filtruoti prisiminimus pagal metus">
      {['all', ...years].map((value) => <button key={value} type="button" aria-pressed={year === value} onClick={() => { setYear(value); setCount(9); }}>{value === 'all' ? 'Visos akimirkos' : value}</button>)}
    </div><span className="album-count" role="status">{visible.length} / {filtered.length} akimirkų</span></div>
    <div className="memory-grid">{visible.map((location, index) => <article className="memory-card" key={location.id} tabIndex={-1} ref={index === count - 9 ? nextCard : undefined}>
      <MediaCarousel media={location.media} title={location.title} onOpen={onOpen} />
      <div className="memory-copy"><time dateTime={location.date}>{dateFormatter.format(new Date(`${location.date}T12:00:00`))}</time>
        <h3>{location.title}</h3><p>{location.text}</p>
        <button className="memory-map-link" onClick={() => onMap(location.id)} type="button">Ši vieta žemėlapyje <span aria-hidden="true">↗</span></button>
      </div>
    </article>)}</div>
    {count < filtered.length && <div className="album-more"><button className="button button-outline" type="button" onClick={() => {
      setCount(count + 9);
      requestAnimationFrame(() => nextCard.current?.focus({ preventScroll: true }));
    }}>Daugiau prisiminimų <span aria-hidden="true">↓</span></button><p>Dar {filtered.length - count} mūsų akimirkų</p></div>}
  </section>;
}

export default function App() {
  const [unlocked, setUnlocked] = useState(() => { try { return localStorage.getItem(STORAGE_KEY) === 'true'; } catch { return false; } });
  const [lightbox, setLightbox] = useState(null);
  const [requested, setRequested] = useState(null);
  const openPhoto = (media, initialIndex, title) => setLightbox({ media, initialIndex, title });
  const showOnMap = (id) => {
    setRequested({ id, at: Date.now() });
    document.getElementById('zemelapis')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  };
  if (!unlocked) return <Gate onUnlock={() => setUnlocked(true)} />;
  return <div className="page">
    <a className="skip-link" href="#prisiminimai">Pereiti prie prisiminimų</a>
    <header className="site-header"><a className="wordmark" href="#pradzia">I <span aria-hidden="true">♡</span> J<span className="sr-only"> — Ignas ir Justė</span></a>
      <nav aria-label="Pagrindinė navigacija"><a href="#prisiminimai">Prisiminimai</a><a href="#zemelapis">Žemėlapis</a><a className="nav-date" href="#pasimatymas">Pasimatymas <span aria-hidden="true">↗</span></a></nav>
    </header>
    <main id="pradzia">
      <section className="hero section" aria-labelledby="hero-heading">
        <div className="hero-copy"><p className="eyebrow">Mūsų istorija · Nuo 2024</p><h1 id="hero-heading">Su tavimi —<br /><em>visas pasaulis.</em></h1>
          <p className="hero-description">Nuo pirmo pasimatymo iki kalnų viršūnių.<br />Ir visos gražiausios akimirkos tarp jų.</p>
          <div className="hero-actions"><a className="button button-primary" href="#prisiminimai">Mūsų prisiminimai <span aria-hidden="true">↓</span></a><a className="text-link" href="#pasimatymas">Suplanuokim pasimatymą ↗</a></div>
          <div className="hero-signature"><span aria-hidden="true">♡</span> Tu, aš ir dar tiek visko prieš akis.</div>
        </div>
        <figure className="hero-photo"><Photo media={heroImage} alt="Ignas ir Justė kartu kalnuose" priority sizes="(max-width: 760px) 100vw, 55vw" /><figcaption>Geriausias vaizdas — kartu su tavimi. <span>01 / ∞</span></figcaption></figure>
      </section>
      <Album onOpen={openPhoto} onMap={showOnMap} />
      <MapSection requested={requested} onOpen={openPhoto} />
      <BookingForm />
    </main>
    <footer className="footer"><a className="wordmark" href="#pradzia">I ♡ J</a><p>Mūsų kelionė tęsiasi.</p><span>Su meile, Ignas</span></footer>
    {lightbox && <Lightbox {...lightbox} onClose={() => setLightbox(null)} />}
  </div>;
}
