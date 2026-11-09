import { useEffect, useRef } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { locations } from '../data/memories';
import MediaCarousel from './MediaCarousel';

const icon = L.divIcon({ className: 'memory-marker', html: '<span aria-hidden="true">♥</span>', iconSize: [36, 42], iconAnchor: [18, 42], popupAnchor: [0, -38] });

function MapSelection({ selected, markers }) {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize({ pan: false }));
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  useEffect(() => {
    if (!selected) return;
    const location = locations.find(({ id }) => id === selected.id);
    if (!location) return;
    map.setView(location.coords, 13, { animate: false });
    markers.current[location.id]?.openPopup();
  }, [map, selected, markers]);
  return null;
}

export default function MemoryMap({ selected, onOpen }) {
  const markers = useRef({});
  return <MapContainer center={[54.9, 24.45]} zoom={7} scrollWheelZoom={false} className="memory-map" aria-label="Mūsų prisiminimų žemėlapis">
    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    {locations.map((location) => <Marker key={location.id} position={location.coords} icon={icon} title={location.title} alt={location.title} ref={(marker) => { markers.current[location.id] = marker; }}>
      <Popup maxWidth={280} minWidth={220} autoPanPadding={[20, 20]}>
        <div className="map-popup">
          <MediaCarousel key={location.id} media={location.media} title={location.title} onOpen={onOpen} compact />
          <time dateTime={location.date}>{location.date}</time>
          <h3>{location.title}</h3><p>{location.text}</p>
        </div>
      </Popup>
    </Marker>)}
    <MapSelection selected={selected} markers={markers} />
  </MapContainer>;
}
