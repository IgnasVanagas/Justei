import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import "./App.css";

const heroImage = new URL("../media/image.png", import.meta.url).href;

const PASSWORD = "myliu";
const STORAGE_KEY = "meiles-kelione-unlocked";

// CAROUSEL COMPONENT
function MediaCarousel({ media, alt, className, onImageClick, heightClass = "timeline-media" }) {
  const [index, setIndex] = useState(0);

  // Reset index if media changes (e.g. reused component in map)
  useEffect(() => {
    setIndex(0);
  }, [media]);

  if (!media || media.length === 0) return null;

  const currentSrc = media[index];
  const hasMultiple = media.length > 1;

  const handleImageClick = (e) => {
    // If a custom click handler is passed, use it
    if (onImageClick) {
      onImageClick(currentSrc);
    }
  };

  const next = (e) => {
    e.stopPropagation();
    setIndex((prev) => (prev + 1) % media.length);
  };

  const prev = (e) => {
    e.stopPropagation();
    setIndex((prev) => (prev - 1 + media.length) % media.length);
  };
  
  return (
    <div className={`carousel-wrapper ${className || ""}`}>
       <img 
         src={currentSrc} 
         alt={alt} 
         className={heightClass} 
         onClick={handleImageClick} 
       />
       {hasMultiple && (
         <>
           <button className="carousel-btn prev" onClick={prev} type="button">‹</button>
           <button className="carousel-btn next" onClick={next} type="button">›</button>
           <div className="carousel-dots">
             {media.map((_, i) => (
               <span key={i} className={`dot ${i === index ? "active" : ""}`} />
             ))}
           </div>
         </>
       )}
    </div>
  );
}

// Helper to resolve media files
// Note: In Vite, we can relying on the server to serve files from /media if it's in public or root
// But here the structure says media/ is at root. 
// Standard way in Vite for root files is new URL.
const getMedia = (name) => new URL(`../media/${name}`, import.meta.url).href;

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const timelineEvents = [
  { id: "1", date: "2024-10-06", title: "Pirmas pasimatymas", text: "Patikrinom kurio telefonas geresnis. Čia viskas prasidėjo.", locationId: "1" },
  { id: "2", date: "2024-11-10", title: "Apsishoppinom", text: "Kieta panelė", locationId: "2" },
  { id: "3", date: "2024-11-10", title: "Čia tapome pora", text: "Ir netoli buvo pirmas bučinys su burito skoniu.", locationId: "3" },
  { id: "4", date: "2024-12-01", title: "Pirmas sleepovers ir pirmas bėgimas", text: "Kažką beveik suvalgė šuo.", locationId: "4" },
  { id: "5", date: "2024-12-26", title: "Trakai dar be mano mašinos raktelių", text: "Ir skanūs kibinai", locationId: "5" },
  { id: "6", date: "2024-12-28", title: "Žąsinas", text: "Chill guy", locationId: "6" },
  { id: "7", date: "2024-12-31", title: "Grindinam", text: "Plankas į naujus metus", locationId: "7" },
  { id: "8", date: "2025-02-12", title: "Ant pasaulio krašto", text: "Kažkas atvarė į Portugaliją.", locationId: "8" },
  { id: "9", date: "2025-02-14", title: "Pirmoji Valentino diena", text: "O paskui buvo nuostabus vakaras valgant aštunkojį", locationId: "9" },
  { id: "10", date: "2025-04-25", title: "Pirmi dviračių testavimai", text: "Ir skanus maistas po jų", locationId: "10" },
  { id: "11", date: "2025-05-11", title: "Skaitiniai miške", text: "Ir gilūs pokalbiai", locationId: "11" },
  { id: "12", date: "2025-06-15", title: "Su tavim visur smagu", text: "Aplankėm mano kaimą, pravažiavom 130km ir Justytės alkūnės bučkis su asfaltu", locationId: "12" },
  { id: "13", date: "2025-06-23", title: "Po maudynių Jonavoj", text: "Gavom rimtesnes maudynes arčiau Kauno..", locationId: "13" },
  { id: "14", date: "2025-07-14", title: "Naujas butas", text: "...ir batai", locationId: "14" },
  { id: "15", date: "2025-07-26", title: "Pirmas bikeback", text: "Ir pats smagiausias keliukas. Ir stirnos.", locationId: "15" },
  { id: "16", date: "2025-07-27", title: "Maumedžiai", text: "Visi trys augam.", locationId: "16" },
  { id: "17", date: "2025-07-29", title: "Kolekcionuojam ženklus", text: "Ir pabėgom nuo kareivių.", locationId: "17" },
  { id: "18", date: "2025-08-02", title: "Išsimaudėm", text: "Ir pasivažinėjom.", locationId: "18" },
  { id: "19", date: "2025-08-05", title: "Big day", text: "Mano Justytė baigė mokyklą", locationId: "19" },
  { id: "20", date: "2025-08-06", title: "Moments before disaster", text: "Bet šiaip fun dienelė ir gražūs šuniukai kavinėje.", locationId: "20" },
  { id: "21", date: "2025-08-17", title: "Fotografai", text: "Ir fun piknikas prie Kauno marių.", locationId: "21" },
  { id: "22", date: "2025-08-23", title: "Sleepy", text: "Kelionės pradžia", locationId: "22" },
  { id: "23", date: "2025-08-24", title: "Laipiojam", text: "Pirma kelionė kartu", locationId: "23" },
  { id: "24", date: "2025-08-25", title: "Gražus ežeras", text: "Ir crazy dienelė su nuotykiais", locationId: "24" },
  { id: "25", date: "2025-08-28", title: "Įveikėm Rysy", text: "Suvalgėm brumika ir planavom lipti į Everestą", locationId: "25" },
  { id: "26", date: "2025-11-01", title: "Tinukas", text: "Ir paskui abu pavėmėm", locationId: "26" },
  { id: "27", date: "2025-11-10", title: "Metai kartu", text: "Pirmi iš daugelio", locationId: "27" },
  { id: "28", date: "2025-11-23", title: "Bukapročiai", text: "Visom prasmėm", locationId: "28" },
  { id: "29", date: "2026-01-01", title: "Nauji metai", text: "Šį kartą be planko", locationId: "29" },
  { id: "30", date: "2026-01-16", title: "Vintedo pirkiniai", text: "Ir smagūs vakarai kartu", locationId: "30" },
  { id: "31", date: "2026-01-31", title: "Grybukas", text: "<3", locationId: "31" },
  { id: "32", date: "2026-02-14", title: "Šiandien", text: "Ir visada kartu. Myliu tave", locationId: "32" },
];

const rawLocations = [
  {
    id: "1", title: "Pirmas pasimatymas", date: "2024-10-06", text: "Patikrinom kurio telefonas geresnis. Čia viskas prasidėjo.",
    coords: [54.686688, 25.297734], media: [getMedia("IMG_20241006_191719.jpg")]
  },
  {
    id: "2", title: "Apsishoppinom", date: "2024-11-10", text: "Kieta panelė",
    coords: [54.7106853163931, 25.26491320950711], media: [getMedia("IMG_20241110_151343.jpg")]
  },
  {
    id: "3", title: "Čia tapome pora", date: "2024-11-10", text: "Ir netoli buvo pirmas bučinys su burito skoniu.",
    coords: [54.679710, 25.293198], media: [getMedia("IMG_20241121_170200.jpg")]
  },
  {
    id: "4", title: "Pirmas sleepovers ir pirmas bėgimas", date: "2024-12-01", text: "Kažką beveik suvalgė šuo.",
    coords: [54.924964, 23.952569], media: [getMedia("Screenshot 2026-02-10 151917.png")]
  },
  {
    id: "5", title: "Trakai dar be mano mašinos raktelių", date: "2024-12-26", text: "Ir skanūs kibinai",
    coords: [54.651155, 24.933340], media: [getMedia("Screenshot 2026-02-10 161000.png")]
  },
  {
    id: "6", title: "Žąsinas", date: "2024-12-28", text: "Chill guy",
    coords: [54.868832, 24.195923], media: [getMedia("Screenshot 2026-02-10 152129.png")]
  },
  {
    id: "7", title: "Grindinam", date: "2024-12-31", text: "Plankas į naujus metus",
    coords: [55.691429360236086, 21.15076123423581], media: [getMedia("IMG_20241231_123400.jpg")]
  },
  {
    id: "8", title: "Ant pasaulio krašto", date: "2025-02-12", text: "Kažkas atvarė į Portugaliją.",
    coords: [37.021754, -8.993677], media: [getMedia("image00001 (4).jpeg")]
  },
  {
    id: "9", title: "Pirmoji Valentino diena", date: "2025-02-14", text: "O paskui buvo nuostabus vakaras valgant aštunkojį",
    coords: [37.179496, -7.441596], media: [getMedia("Screenshot 2026-02-10 152720.png")]
  },
  {
    id: "10", title: "Pirmi dviračių testavimai", date: "2025-04-25", text: "Ir skanus maistas po jų",
    coords: [54.875624, 24.024847], media: [getMedia("Screenshot 2026-02-10 153359.png")]
  },
  {
    id: "11", title: "Skaitiniai miške", date: "2025-05-11", text: "Ir gilūs pokalbiai",
    coords: [54.942468, 23.949067], media: [getMedia("Screenshot 2026-02-10 153619.png")]
  },
  {
    id: "12", title: "Su tavim visur smagu", date: "2025-06-15", text: "Aplankėm mano kaimą, pravažiavom 130km ir Justytės alkūnės bučkis su asfaltu",
    coords: [54.948927, 24.388207], media: [getMedia("Screenshot 2026-02-10 154113.png")]
  },
  {
    id: "13", title: "Po maudynių Jonavoj", date: "2025-06-23", text: "Gavom rimtesnes maudynes arčiau Kauno..",
    coords: [55.069509, 24.138476], media: [getMedia("Screenshot 2026-02-10 154652.png")]
  },
  {
    id: "14", title: "Naujas butas", date: "2025-07-14", text: "...ir batai",
    coords: [54.898204, 23.970008], media: [getMedia("20250714_161437.jpg")]
  },
  {
    id: "15", title: "Pirmas bikeback", date: "2025-07-26", text: "Ir pats smagiausias keliukas. Ir stirnos.",
    coords: [54.427003, 23.735224], media: [getMedia("20250726_193830.jpg")]
  },
  {
    id: "16", title: "Maumedžiai", date: "2025-07-27", text: "Visi trys augam.",
    coords: [54.569200, 23.875185], media: [getMedia("20250727_134421.jpg")]
  },
  {
    id: "17", title: "Kolekcionuojam ženklus", date: "2025-07-29", text: "Ir pabėgom nuo kareivių.",
    coords: [54.973407, 24.023830], 
    media: [getMedia("20250729_212913.jpg"), getMedia("20250729_195901.jpg"), getMedia("20250729_195924.jpg"), getMedia("20250729_212550.jpg")]
  },
  {
    id: "18", title: "Išsimaudėm", date: "2025-08-02", text: "Ir pasivažinėjom.",
    coords: [54.785268, 25.333282], 
    media: [getMedia("20250802_174612.jpg"), getMedia("20250802_174540.jpg"), getMedia("20250802_174546.jpg")]
  },
  {
    id: "19", title: "Big day", date: "2025-08-05", text: "Mano Justytė baigė mokyklą",
    coords: [54.982513, 25.759599], 
    media: [getMedia("Screenshot 2026-02-10 160116.png"), getMedia("20250805_233850.jpg")]
  },
  {
    id: "20", title: "Moments before disaster", date: "2025-08-06", text: "Bet šiaip fun dienelė ir gražūs šuniukai kavinėje.",
    coords: [54.650151, 24.936471], 
    media: [getMedia("20250806_190115.jpg"), getMedia("20250806_185845.jpg")]
  },
  {
    id: "21", title: "Fotografai", date: "2025-08-17", text: "Ir fun piknikas prie Kauno marių.",
    coords: [54.875603, 24.020761], media: [getMedia("DSCN0031.JPG")]
  },
  {
    id: "22", title: "Sleepy", date: "2025-08-23", text: "Kelionės pradžia",
    coords: [53.936435, 22.761293], media: [getMedia("20250823_063123.jpg")]
  },
  {
    id: "23", title: "Laipiojam", date: "2025-08-24", text: "Pirma kelionė kartu",
    coords: [49.236502, 19.932209], 
    media: [getMedia("DSCN0279.JPG"), getMedia("DSCN0142.JPG"), getMedia("DSCN0171.JPG"), getMedia("DSCN0216.JPG"), getMedia("DSCN0321.JPG"), getMedia("20250824_132512.jpg")]
  },
  {
    id: "24", title: "Gražus ežeras", date: "2025-08-25", text: "Ir crazy dienelė su nuotykiais",
    coords: [49.200844, 20.072096], 
    media: [getMedia("DSCN0376.JPG"), getMedia("20250825_072110.jpg"), getMedia("DSCN0439.JPG"), getMedia("DSCN0440.JPG"), getMedia("DSCN0466.JPG"), getMedia("DSCN0510.JPG")]
  },
  {
    id: "25", title: "Įveikėm Rysy", date: "2025-08-28", text: "Suvalgėm brumika ir planavom lipti į Everestą",
    coords: [49.179557, 20.088054], 
    media: [getMedia("DSCN0749.JPG"), getMedia("DSCN0607.JPG"), getMedia("DSCN0620.JPG"), getMedia("20250828_175110.jpg"), getMedia("20250830_092115.jpg")]
  },
  {
    id: "26", title: "Tinukas", date: "2025-11-01", text: "Ir paskui abu pavėmėm",
    coords: [54.991910, 25.792713], media: [getMedia("20251101_211809.jpg")]
  },
  {
    id: "27", title: "Metai kartu", date: "2025-11-10", text: "Pirmi iš daugelio",
    coords: [54.939473, 23.894364], 
    media: [getMedia("20251110_190312.mp4")], isVideo: true
  },
  {
    id: "28", title: "Bukapročiai", date: "2025-11-23", text: "Visom prasmėm",
    coords: [54.898212, 23.969954], media: [getMedia("Screenshot_20251123_232759_Messenger.jpg")]
  },
  {
    id: "29", title: "Nauji metai", date: "2026-01-01", text: "Šį kartą be planko",
    coords: [54.869223, 23.977094], media: [getMedia("20260101_010723.jpg")]
  },
  {
    id: "30", title: "Vintedo pirkiniai", date: "2026-01-16", text: "Ir smagūs vakarai kartu",
    coords: [54.898212, 23.969954], media: [getMedia("20260116_170134.jpg")]
  },
  {
    id: "31", title: "Grybukas", date: "2026-01-31", text: "<3",
    coords: [55.000445, 25.787335], media: [getMedia("20260131_155858.jpg")]
  },
  {
    id: "32", title: "Šiandien", date: "2026-02-14", text: "Ir visada kartu. Myliu tave",
    coords: [54.899480, 23.913723], 
    media: [getMedia("Gemini_Generated_Image_bo4fuzbo4fuzbo4f.png"), getMedia("Gemini_Generated_Image_ihhv0sihhv0sihhv.png")]
  },
].filter(l => true); /* Keep all for timeline, filter for map separately */

const createPlaceholderPhoto = (label) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="480" height="300" viewBox="0 0 480 300">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffd1d8" />
          <stop offset="100%" stop-color="#f4a8b8" />
        </linearGradient>
      </defs>
      <rect width="480" height="300" fill="url(#g)" />
      <circle cx="380" cy="70" r="46" fill="#fcd1d9" opacity="0.75" />
      <circle cx="90" cy="240" r="60" fill="#f7c1ce" opacity="0.55" />
      <text x="240" y="165" font-family="Georgia, serif" font-size="28" fill="#6a1e32" text-anchor="middle">${label}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const MapController = ({ onMapReady }) => {
  const map = useMap();
  useEffect(() => {
    onMapReady(map);
    map.scrollWheelZoom.enable();
  }, [map, onMapReady]);
  return null;
};

function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const mapRef = useRef(null);
  const markerRefs = useRef({});
  
  // New refs for sticky timeline
  const stickySectionRef = useRef(null);
  const horizontalTrackRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) === "true";
    setIsUnlocked(stored);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("locked", !isUnlocked);
  }, [isUnlocked]);

  // Horizontal Scroll Logic
  useEffect(() => {
    const stickySection = stickySectionRef.current;
    const track = horizontalTrackRef.current;
    
    if (!stickySection || !track) return undefined;

    let AnimationFrameId;

    const handleScroll = () => {
      const offsetTop = stickySection.offsetTop;
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      
      // Calculate how far we've scrolled into the sticky section
      // We start transforming when the section hits the top
      const distance = scrollY - offsetTop;
      
      // The total scrollable distance is the section's height minus the viewport height
      // (because the content sticks for that duration)
      const maxScroll = stickySection.offsetHeight - viewportHeight;
      
      if (maxScroll <= 0) return;

      let percentage = distance / maxScroll;
      percentage = Math.max(0, Math.min(percentage, 1));
      
      // The track needs to move left by (track width - viewport width) * percentage
      // We add a little padding logic or just raw calculation
      const trackWidth = track.scrollWidth;
      const viewportWidth = window.innerWidth;
      const translateMax = trackWidth - viewportWidth + 200; // +200 for padding end
      
      if (translateMax <= 0) {
        track.style.transform = `translateX(0px)`;
        return;
      }
      
      const translateX = -(percentage * translateMax);
      track.style.transform = `translateX(${translateX}px)`;
    };

    const onScroll = () => {
      if (AnimationFrameId) cancelAnimationFrame(AnimationFrameId);
      AnimationFrameId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // Initial call
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (AnimationFrameId) cancelAnimationFrame(AnimationFrameId);
    };
  }, [timelineEvents]);


  useEffect(() => {
    document.body.classList.toggle("map-fullscreen", isMapFullscreen);

    if (!mapRef.current) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      mapRef.current.invalidateSize();
    }, 200);

    return () => window.clearTimeout(timer);
  }, [isMapFullscreen]);

  const { locations, locationsById } = useMemo(() => {
    // We already have media paths in rawLocations media array.
    // We'll use the first one as the 'photo' for backward compatibility
    // but the Popup will render the full media.
    const withPhotos = rawLocations.map((location) => {
      let mainPhoto;
      if (location.media && location.media.length > 0) {
        mainPhoto = location.media[0];
      } else {
        mainPhoto = createPlaceholderPhoto(location.title);
      }
      return { ...location, photo: mainPhoto };
    });
    
    const byId = withPhotos.reduce((acc, location) => {
      acc[location.id] = location;
      return acc;
    }, {});
    return { locations: withPhotos, locationsById: byId };
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const value = password.trim();

    if (value === PASSWORD) {
      localStorage.setItem(STORAGE_KEY, "true");
      setError("");
      setPassword("");
      setIsUnlocked(true);
      return;
    }

    setError("Neteisingas slaptažodis.");
    setPassword("");
  };

  const handleTimelineClick = (event) => {
    if (!event.locationId || !isUnlocked) {
      return;
    }

    const location = locationsById[event.locationId];
    if (!location || !mapRef.current) {
      return;
    }

    const mapSection = document.getElementById("zemelapis");
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    mapRef.current.flyTo(location.coords, 13, { duration: 1.2 });
    const marker = markerRefs.current[event.locationId];
    if (marker) {
      marker.openPopup();
    }
  };

  const handleMapToggle = () => {
    setIsMapFullscreen((prev) => !prev);
  };

  return (
    <div className="page">
      {fullscreenImage && (
        <div className="lightbox-overlay" onClick={() => setFullscreenImage(null)}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setFullscreenImage(null)}>&times;</button>
            <img src={fullscreenImage} alt="Fullscreen" className="lightbox-image" />
          </div>
        </div>
      )}
      <div className="ambient" aria-hidden="true" />
      {!isUnlocked && (
        <div className="gate" role="dialog" aria-modal="true" aria-labelledby="gate-title">
          <div className="gate-card">
            <p className="gate-eyebrow">Slaptas puslapis</p>
            <h2 id="gate-title">Įveskite slaptažodį</h2>
            <p className="gate-text">Šis puslapis skirtas tik jums dviem.</p>
            <form className="gate-form" onSubmit={handleSubmit}>
              <label className="gate-label" htmlFor="gate-password">
                Slaptažodis
              </label>
              <div className="gate-field">
                <input
                  id="gate-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Slaptažodis"
                  autoComplete="current-password"
                  required
                />
                <button type="submit">Atrakinti</button>
              </div>
              <p className="gate-error" aria-live="polite">
                {error}
              </p>
            </form>
          </div>
        </div>
      )}

      <header className="hero">
        <h1 className="hero-simple-title">Mūsų Kelionė</h1>
        <img className="hero-image" src={heroImage} alt="Mūsų kelionė" />
      </header>

      <div ref={stickySectionRef} className="timeline-container">
        <div className="timeline-sticky">
          <h2 className="timeline-heading">Laiko juosta</h2>
          <div ref={horizontalTrackRef} className="timeline-track">
            {timelineEvents.map((event) => {
              const location = locationsById[event.locationId];
              const mediaList = location ? (location.media ? location.media : (location.photo ? [location.photo] : [])) : [];
              const isVideo = location && location.isVideo;
              const videoSrc = isVideo && mediaList.length > 0 ? mediaList[0] : null;
              
              return (
              <div key={event.id} className="timeline-item">
                <div className="timeline-marker">
                  <span className="timeline-date">{event.date}</span>
                  <div className="timeline-heart" />
                </div>
                {event.locationId && location.coords ? (
                  <button
                    className="timeline-card"
                    type="button"
                    onClick={() => handleTimelineClick(event)}
                  >
                    {isVideo && videoSrc ? (
                       <video src={videoSrc} className="timeline-media" muted loop playsInline onMouseOver={e => e.target.play()} onMouseOut={e => e.target.pause()} /> 
                    ) : (
                       mediaList.length > 0 && <MediaCarousel media={mediaList} alt={event.title} />
                    )}
                    <h3>{event.title}</h3>
                    <p>{event.text}</p>
                    <span className="timeline-action">
                      Peržiūrėti žemėlapyje <span>→</span>
                    </span>
                  </button>
                ) : (
                  <div className="timeline-card">
                    {mediaList.length > 0 && (
                       <MediaCarousel media={mediaList} alt={event.title} />
                    )}
                    <h3>{event.title}</h3>
                    <p>{event.text}</p>
                  </div>
                )}
              </div>
            );})}
          </div>
        </div>
      </div>

      <main>

        <section className="map-section" id="zemelapis">
          <div className="map-header">
            <div className="section-title">
              <h2>Žemėlapis su akimirkomis</h2>
              <p>Spauskite ant taško ir peržiūrėkite nuotrauką bei aprašymą.</p>
            </div>
            {!isMapFullscreen && (
              <button className="map-toggle" type="button" onClick={handleMapToggle}>
                Visas ekranas
              </button>
            )}
          </div>
          <div className={`map-layout ${isMapFullscreen ? "map-layout--fullscreen" : ""}`}>
            {isMapFullscreen && (
              <button className="map-close" type="button" onClick={handleMapToggle}>
                Uždaryti
              </button>
            )}
            {isMapFullscreen && (
              <aside className="map-sidebar">
                <p className="map-sidebar-heading">Laiko juosta</p>
                <ol className="map-sidebar-list">
                  {timelineEvents.map((event) => (
                    <li key={`side-${event.id}`}>
                      {event.locationId ? (
                        <button
                          className="map-sidebar-item"
                          type="button"
                          onClick={() => handleTimelineClick(event)}
                        >
                          <span className="map-sidebar-date">{event.date}</span>
                          <span className="map-sidebar-title">{event.title}</span>
                        </button>
                      ) : (
                        <div className="map-sidebar-item map-sidebar-item--inactive">
                          <span className="map-sidebar-date">{event.date}</span>
                          <span className="map-sidebar-title">{event.title}</span>
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              </aside>
            )}
            <div className={`map-shell ${isMapFullscreen ? "map-shell--fullscreen" : ""}`}>
              {isUnlocked ? (
                <MapContainer
                  center={[54.6872, 25.2797]}
                  zoom={10}
                  scrollWheelZoom={true}
                  style={{ height: "100%", width: "100%", minHeight: "100%" }}
                >
                  <MapController
                    onMapReady={(map) => {
                      mapRef.current = map;
                    }}
                  />
                  <TileLayer
                    attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {locations.filter(l => l.coords).map((location) => (
                    <Marker
                      key={`${location.title}-${location.date}`}
                      position={location.coords}
                      icon={defaultIcon}
                      ref={(marker) => {
                        if (marker) {
                          markerRefs.current[location.id] = marker;
                        }
                      }}
                    >
                      <Popup maxWidth={isMapFullscreen ? 800 : 300} className={isMapFullscreen ? "fullscreen-popup" : ""}>
                        <div className="popup-content">
                          {location.isVideo ? (
                            <video
                              className="popup-image"
                              src={location.media[0]}
                              controls
                              muted
                              loop
                              playsInline
                            />
                          ) : (
                             location.media && location.media.length > 0 ? (
                               <MediaCarousel 
                                 media={location.media} 
                                 alt={location.title} 
                                 heightClass="popup-image" 
                                 onImageClick={(src) => setFullscreenImage(src)}
                               />
                             ) : (
                               <img
                                 className="popup-image"
                                 src={location.photo}
                                 alt={location.title}
                                 onClick={() => setFullscreenImage(location.photo)}
                               />
                             )
                          )}
                          <strong>{location.title}</strong>
                          <span>{location.date}</span>
                          <p>{location.text}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              ) : (
                <div className="map-placeholder">
                  <p>Atrakinkite puslapį, kad pamatytumėte žemėlapį.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>Pagaminta su meile. Papildykite įvykius bet kada.</p>
      </footer>
    </div>
  );
}

export default App;
