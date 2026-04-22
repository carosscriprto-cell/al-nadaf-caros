'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L, { type LatLngExpression } from 'leaflet';
import { useTheme } from 'next-themes';
import { useLocale } from 'next-intl';

import { siteConfig, type LocaleCode } from '@/config/site';

// Fix marker icons
delete (
  L.Icon.Default.prototype as L.Icon.Default & {
    _getIconUrl?: string;
  }
)._getIconUrl;

const createCustomIcon = (logo: string) =>
  L.divIcon({
    className: '',
    html: `
      <div style="
        display:flex;
        flex-direction:column;
        align-items:center;
        transform: translateY(-10px);
      ">
        <div style="
          width:40px;
          height:40px;
          border-radius:12px;
          overflow:hidden;
          border:2px solid white;
          box-shadow:0 10px 20px rgba(0,0,0,0.25);
        ">
          <img src="${logo}" style="width:100%;height:100%;object-fit:cover;" />
        </div>
        <div style="
          width:10px;
          height:10px;
          background:#3b82f6;
          border-radius:50%;
          margin-top:4px;
        "></div>
      </div>
    `,
    iconSize: [40, 50],
    iconAnchor: [20, 50],
  });

export default function MapClient() {
  const locale = useLocale() as LocaleCode;
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const cities = siteConfig.map.coverageCities;

  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  return (
    <MapContainer
      center={siteConfig.map.center as LatLngExpression}
      zoom={siteConfig.map.zoom}
      scrollWheelZoom={false}
      className={`h-[420px] w-full transition-all ${
        isDark ? 'grayscale contrast-125 brightness-90' : ''
      }`}
    >
      <TileLayer url={tileUrl} />

      {cities.map((city) => (
        <Marker
          key={city.name.en}
          position={city.position as LatLngExpression}
          icon={createCustomIcon(city.logo)}
        >
          <Popup>
            <div className="text-sm font-semibold">
              {city.name[locale]}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
