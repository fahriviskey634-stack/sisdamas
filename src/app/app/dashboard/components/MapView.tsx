import React from 'react';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-[450px] w-full rounded-2xl border border-slate-300/60 bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-500">
      Memuat Peta Sebaran Lapangan (Leaflet GIS)...
    </div>
  )
});

export default function MapView() {
  return (
    <div className="bg-white rounded-xl border border-slate-300/60 p-6 shadow-sm space-y-4">
      <h3 className="font-bold text-slate-800 text-sm">Distribusi Peta Spasial (Desa Sukahaji)</h3>
      <MapComponent />
    </div>
  );
}
