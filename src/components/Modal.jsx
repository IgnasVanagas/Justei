import { useEffect, useRef } from 'react';

export default function Modal({ children, label, onClose, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    const focused = document.activeElement;
    const scrollY = window.scrollY;
    const previousStyle = document.body.getAttribute('style');
    Object.assign(document.body.style, { position: 'fixed', top: `-${scrollY}px`, width: '100%' });
    dialog.showModal();
    return () => {
      dialog.close();
      if (previousStyle === null) document.body.removeAttribute('style');
      else document.body.setAttribute('style', previousStyle);
      window.scrollTo({ top: scrollY, behavior: 'instant' });
      focused?.focus({ preventScroll: true });
    };
  }, []);
  return <dialog ref={ref} className={`modal ${className}`} aria-label={label}
    onCancel={(event) => { event.preventDefault(); onClose(); }}
    onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="modal-inner">
      <button className="modal-close" type="button" onClick={onClose} aria-label="Uždaryti">×</button>
      {children}
    </div>
  </dialog>;
}
