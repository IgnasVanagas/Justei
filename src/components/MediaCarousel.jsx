import { useState } from 'react';
import Photo from './Photo';

export default function MediaCarousel({ media, title, onOpen, compact = false }) {
  const [index, setIndex] = useState(0);
  const available = media.filter(Boolean);
  const current = available[index] ?? available[0];
  if (current?.type === 'video') return <div className="video-frame">
    <video src={current.src} controls playsInline preload="none" aria-label={title} />
    <span className="video-caption">▶ {title} · vaizdo įrašas</span>
  </div>;
  return <div className={`carousel ${compact ? 'carousel--compact' : ''}`}>
    {current ? <button className="photo-button" type="button" onClick={() => onOpen(available, index, title)} aria-label={`Atidaryti nuotrauką: ${title}`}>
      <Photo key={current.src} media={current} alt={title} />
      <span className="photo-expand" aria-hidden="true">↗</span>
    </button> : <Photo alt={title} />}
    {available.length > 1 && <div className="carousel-controls">
      <button type="button" aria-label={`Ankstesnė nuotrauka: ${title}`} onClick={() => setIndex((index + available.length - 1) % available.length)}>←</button>
      <span aria-live="polite">{index + 1} / {available.length}</span>
      <button type="button" aria-label={`Kita nuotrauka: ${title}`} onClick={() => setIndex((index + 1) % available.length)}>→</button>
    </div>}
  </div>;
}
