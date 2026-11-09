import { Component, lazy, Suspense, useState } from 'react';
import { locations } from '../data/memories';
import Modal from './Modal';

const MemoryMap = lazy(() => import('./MemoryMap'));
class MapErrorBoundary extends Component {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  render() {
    if (this.state.error) return <div className="map-placeholder" role="alert"><p>Žemėlapio įkelti nepavyko. Patikrink interneto ryšį.</p><button className="button" onClick={() => window.location.reload()}>Bandyti iš naujo</button></div>;
    return this.props.children;
  }
}

export default function MapSection({ requested, onOpen }) {
  const [opened, setOpened] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [selection, setSelection] = useState(null);
  const selected = selection && (!requested || selection.at > requested.at) ? selection : requested;
  const active = opened || Boolean(requested);
  const renderMap = () => <MapErrorBoundary><Suspense fallback={<div className="map-placeholder" role="status">Kraunamas žemėlapis…</div>}>
    <MemoryMap selected={selected} onOpen={onOpen} />
  </Suspense></MapErrorBoundary>;
  return <section id="zemelapis" className="section map-section" aria-labelledby="map-heading">
    <div className="section-heading">
      <div><p className="eyebrow">02 / Vietos, kurios liko širdy</p><h2 id="map-heading">Visur gera. <em>Su tavimi.</em></h2></div>
      {active && <button className="button button-outline" onClick={() => setExpanded(true)}>Išskleisti žemėlapį ↗</button>}
    </div>
    <div className="map-shell">
      {active ? (!expanded && renderMap()) : <div className="map-placeholder map-cover">
        <span className="map-cover-heart" aria-hidden="true">♡</span>
        <h3>Nuo pirmo pasimatymo iki kalnų viršūnių.</h3>
        <p>Kiekvienas taškas — maža mūsų istorija.</p>
        <button className="button button-primary" onClick={() => setOpened(true)}>Atverti mūsų žemėlapį <span aria-hidden="true">↗</span></button>
      </div>}
    </div>
    {expanded && <Modal label="Prisiminimų žemėlapis" className="map-modal" onClose={() => setExpanded(false)}>
      <div className="map-modal-heading"><h2>Mūsų vietos</h2><label className="sr-only" htmlFor="map-memory">Pasirink prisiminimą</label>
        <select id="map-memory" value={selected?.id || ''} onChange={(event) => setSelection({ id: event.target.value, at: Date.now() })}>
          <option value="">Pasirink prisiminimą</option>{locations.map(({ id, date, title }) => <option key={id} value={id}>{date} · {title}</option>)}
        </select>
      </div><div className="expanded-map">{renderMap()}</div>
    </Modal>}
  </section>;
}
