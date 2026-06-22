'use client';

import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L, { type LatLngExpression, type Map as LeafletMap } from 'leaflet';
import { Search, Loader2 } from 'lucide-react';
import type { MapPickerProps } from './MapPicker';

// Default view when nothing is set yet (Damascus). Only a starting view — the
// dealer's chosen point is what gets saved.
const DEFAULT_CENTER: [number, number] = [33.5138, 36.2765];

const pinIcon = L.divIcon({
  className: '',
  html: `
    <div style="transform: translateY(-4px); display:flex; flex-direction:column; align-items:center;">
      <div style="width:18px;height:18px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#75ACE8;border:2px solid white;box-shadow:0 8px 16px rgba(0,0,0,0.3);"></div>
    </div>
  `,
  iconSize: [22, 26],
  iconAnchor: [11, 26],
});

// Click-to-place handler (react-leaflet hook must be a child of MapContainer).
function ClickToPlace({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapPickerInner({
  lat,
  lng,
  onChange,
  disabled,
  searchPlaceholder,
  searchLabel,
}: MapPickerProps) {
  const nLat = Number(lat);
  const nLng = Number(lng);
  const hasInitial = lat.trim() !== '' && lng.trim() !== '' && Number.isFinite(nLat) && Number.isFinite(nLng);
  const initial: [number, number] = hasInitial ? [nLat, nLng] : DEFAULT_CENTER;

  const [pos, setPos] = useState<[number, number]>(initial);
  const [hasMarker, setHasMarker] = useState<boolean>(hasInitial);
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const place = (la: number, ln: number, fly = true) => {
    if (disabled) return;
    setPos([la, ln]);
    setHasMarker(true);
    onChange(la, ln);
    if (fly && map) map.flyTo([la, ln], Math.max(map.getZoom(), 15));
  };

  const search = async () => {
    const q = query.trim();
    if (!q || disabled) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
        { headers: { Accept: 'application/json' } },
      );
      const data = (await res.json()) as Array<{ lat: string; lon: string }>;
      if (Array.isArray(data) && data[0]) {
        place(parseFloat(data[0].lat), parseFloat(data[0].lon));
      }
    } catch {
      /* ignore network/geocode errors — dealer can click the map instead */
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Search (OSM Nominatim) */}
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              void search();
            }
          }}
          placeholder={searchPlaceholder}
          aria-label={searchLabel ?? searchPlaceholder}
          disabled={disabled}
          className="w-full rounded-xl border border-[#e7e8ea] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#75ACE8] focus:ring-4 focus:ring-[#75ACE8]/15 disabled:bg-[#f7f7f7]"
        />
        <button
          type="button"
          onClick={() => void search()}
          disabled={disabled || searching}
          aria-label={searchLabel ?? 'Search'}
          className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-[#75ACE8] text-white transition hover:bg-[#5f9ad9] disabled:opacity-50"
        >
          {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
        </button>
      </div>

      {/* Map — click or drag the marker */}
      <div className="overflow-hidden rounded-xl border border-[#e7e8ea]">
        <MapContainer
          center={initial as LatLngExpression}
          zoom={hasInitial ? 15 : 11}
          scrollWheelZoom
          ref={(m) => setMap(m)}
          className="h-64 w-full"
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          <ClickToPlace onPick={(la, ln) => place(la, ln, false)} />
          {hasMarker && (
            <Marker
              position={pos as LatLngExpression}
              icon={pinIcon}
              draggable={!disabled}
              eventHandlers={{
                dragend: (e) => {
                  const p = (e.target as L.Marker).getLatLng();
                  place(p.lat, p.lng, false);
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      {hasMarker && (
        <p className="text-[11px] text-[#9aa0a8]" dir="ltr">
          {pos[0].toFixed(5)}, {pos[1].toFixed(5)}
        </p>
      )}
    </div>
  );
}
