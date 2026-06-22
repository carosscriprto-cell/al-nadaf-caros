'use client';

// components/dashboard/MapPicker.tsx — interactive location picker for the Site/
// Settings tab. The dealer sets their single location by searching (OSM Nominatim,
// free, no key), clicking the map, or dragging the marker → emits lat/lng which
// the settings form stores as map_center. Leaflet must not SSR, so the actual map
// lives in MapPickerInner loaded with ssr:false.

import dynamic from 'next/dynamic';

export type MapPickerProps = {
  lat: string;
  lng: string;
  onChange: (lat: number, lng: number) => void;
  disabled?: boolean;
  searchPlaceholder?: string;
  searchLabel?: string;
};

const Inner = dynamic(() => import('./MapPickerInner'), {
  ssr: false,
  loading: () => <div className="h-64 w-full animate-pulse rounded-xl bg-[#f0f1f3]" />,
});

export default function MapPicker(props: MapPickerProps) {
  return <Inner {...props} />;
}
