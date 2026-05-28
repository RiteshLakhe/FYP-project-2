import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FiMapPin, FiNavigation, FiSearch } from "react-icons/fi";

// Fix Leaflet's default icon paths so they don't 404 in bundlers like Vite
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const cyanIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: "drop-shadow-[0_4px_12px_rgba(6,182,212,0.45)]",
});

interface LatLng {
  lat: number;
  lng: number;
}

interface LocationMapPickerProps {
  value?: LatLng | null;
  defaultCenter?: LatLng;
  onChange: (next: LatLng) => void;
  landmark?: string;
  onLandmarkChange?: (next: string) => void;
  className?: string;
}

const DEFAULT_CENTER: LatLng = { lat: 27.7172, lng: 85.324 }; // Kathmandu

const Recenter = ({ center }: { center: LatLng }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
};

const ClickHandler = ({ onPick }: { onPick: (latlng: LatLng) => void }) => {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

const LocationMapPicker = ({
  value,
  defaultCenter,
  onChange,
  landmark,
  onLandmarkChange,
  className = "",
}: LocationMapPickerProps) => {
  const initial = value || defaultCenter || DEFAULT_CENTER;
  const [pin, setPin] = useState<LatLng>(initial);
  const [recenterTarget, setRecenterTarget] = useState<LatLng | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [searching, setSearching] = useState(false);
  const lastSentRef = useRef<LatLng>(initial);

  // Keep internal pin in sync with controlled value (e.g. when editing)
  useEffect(() => {
    if (value && (value.lat !== pin.lat || value.lng !== pin.lng)) {
      setPin(value);
      lastSentRef.current = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.lat, value?.lng]);

  const handlePick = (next: LatLng) => {
    setPin(next);
    if (lastSentRef.current.lat !== next.lat || lastSentRef.current.lng !== next.lng) {
      lastSentRef.current = next;
      onChange(next);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        handlePick(next);
        setRecenterTarget(next);
      },
      () => {
        // silently fail; user can pick manually
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const doSearch = async () => {
    const q = searchValue.trim();
    if (!q) return;
    try {
      setSearching(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
        { headers: { Accept: "application/json" } }
      );
      const data = await res.json();
      if (data?.[0]) {
        const next = { lat: Number(data[0].lat), lng: Number(data[0].lon) };
        handlePick(next);
        setRecenterTarget(next);
      }
    } catch (e) {
      console.error("Geocoding failed", e);
    } finally {
      setSearching(false);
    }
  };

  const formatted = useMemo(
    () => `${pin.lat.toFixed(6)}, ${pin.lng.toFixed(6)}`,
    [pin]
  );

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search + my-location row */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex-1 min-w-[240px] flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2">
          <FiSearch className="text-neutral-400 shrink-0" />
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), doSearch())}
            placeholder="Search a place (e.g. Naxal Kathmandu)"
            className="flex-1 text-sm outline-none bg-transparent"
          />
          <button
            type="button"
            onClick={doSearch}
            disabled={searching || !searchValue.trim()}
            className="btn-ghost !py-1.5 !px-2 disabled:opacity-50">
            {searching ? "..." : "Search"}
          </button>
        </div>
        <button
          type="button"
          onClick={useMyLocation}
          className="btn-secondary !py-2 !px-3 shrink-0">
          <FiNavigation /> Use my location
        </button>
      </div>

      {/* Map */}
      <div className="relative rounded-2xl overflow-hidden border border-neutral-200 shadow-sm">
        <MapContainer
          center={[pin.lat, pin.lng]}
          zoom={15}
          scrollWheelZoom={true}
          style={{ height: 360, width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={handlePick} />
          {recenterTarget && <Recenter center={recenterTarget} />}
          <Marker
            position={[pin.lat, pin.lng]}
            icon={cyanIcon}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const m = e.target as L.Marker;
                const { lat, lng } = m.getLatLng();
                handlePick({ lat, lng });
              },
            }}
          />
        </MapContainer>

        {/* Floating coordinate chip */}
        <div className="pointer-events-none absolute left-3 bottom-3 inline-flex items-center gap-2 rounded-full bg-neutral-900/85 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur ring-1 ring-cyan-400/40">
          <FiMapPin className="text-cyan-400" />
          {formatted}
        </div>
      </div>

      <p className="text-xs text-neutral-500">
        Tip: click anywhere on the map to drop a pin, or drag the cyan marker to fine-tune.
      </p>

      {/* Optional landmark */}
      <div>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
            Landmark / nearby reference <span className="text-neutral-400 normal-case font-medium">(optional)</span>
          </span>
          <input
            type="text"
            value={landmark || ""}
            onChange={(e) => onLandmarkChange?.(e.target.value)}
            placeholder="e.g. Opposite Bhatbhateni Naxal, next to the Police HQ"
            className="input-field"
          />
        </label>
      </div>
    </div>
  );
};

export default LocationMapPicker;
