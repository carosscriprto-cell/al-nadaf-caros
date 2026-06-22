'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L, { type LatLngExpression } from 'leaflet';
import { useTheme } from 'next-themes';

// Fix Leaflet's default marker icon URL resolution (we use a custom icon below,
// but this avoids broken default markers if one ever renders).
delete (
  L.Icon.Default.prototype as L.Icon.Default & {
    _getIconUrl?: string;
  }
)._getIconUrl;

// A single pin for the tenant's location (no logo image needed).
const createPinIcon = () =>
  L.divIcon({
    className: '',
    html: `
      <div style="transform: translateY(-4px); display:flex; flex-direction:column; align-items:center;">
        <div style="width:18px;height:18px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#3b82f6;border:2px solid white;box-shadow:0 8px 16px rgba(0,0,0,0.3);"></div>
      </div>
    `,
    iconSize: [22, 26],
    iconAnchor: [11, 26],
  });

type MapClientProps = {
  center: [number, number]; // tenant location [lat, lng]
  label?: string; // address shown in the marker popup
};

export default function MapClient({ center, label }: MapClientProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  const position = center as LatLngExpression;

  return (
    <MapContainer
      center={position}
      zoom={14}
      scrollWheelZoom={false}
      className={`h-[420px] w-full transition-all ${
        isDark ? 'grayscale contrast-125 brightness-90' : ''
      }`}
    >
      <TileLayer url={tileUrl} />
      <Marker position={position} icon={createPinIcon()}>
        {label && (
          <Popup>
            <div className="text-sm font-semibold">{label}</div>
          </Popup>
        )}
      </Marker>
    </MapContainer>
  );
}
