import { useEffect, useState } from 'react';
import Modal from './Modal';
import Photo from './Photo';

export default function Lightbox({ media, initialIndex, title, onClose }) {
  const [index, setIndex] = useState(initialIndex);
  const previous = () => setIndex((value) => (value + media.length - 1) % media.length);
  const next = () => setIndex((value) => (value + 1) % media.length);
  useEffect(() => {
    const keydown = (event) => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); setIndex((value) => (value + media.length - 1) % media.length); }
      if (event.key === 'ArrowRight') { event.preventDefault(); setIndex((value) => (value + 1) % media.length); }
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [media.length]);
  return <Modal label={title} className="lightbox" onClose={onClose}>
    <Photo key={media[index].src} media={media[index]} alt={title} full priority sizes="100vw" />
    <div className="lightbox-caption">
      <p>{title}</p>
      {media.length > 1 && <div className="lightbox-controls">
        <button type="button" onClick={previous} aria-label="Ankstesnė nuotrauka">←</button>
        <span aria-live="polite">{index + 1} / {media.length}</span>
        <button type="button" onClick={next} aria-label="Kita nuotrauka">→</button>
      </div>}
    </div>
  </Modal>;
}
