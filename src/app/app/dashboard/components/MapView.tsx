import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, ExternalLink, Map as MapIcon, Globe } from 'lucide-react';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-[450px] w-full rounded-2xl border border-slate-300/60 bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-500">
      Memuat Peta Sebaran Lapangan (Leaflet GIS)...
    </div>
  )
});

export default function MapView() {
  const [activeMode, setActiveMode] = useState<'leaflet' | 'google'>('leaflet');
  const googleMapsUrl = 'https://www.google.com/maps?cid=2054103360592180660';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
            <MapIcon className="h-4.5 w-4.5 text-teal-sedang" /> Distribusi Peta Spasial (Desa Sukahaji, Cipeundeuy)
          </h3>
          <p className="text-xs text-slate-450 mt-0.5">
            Wilayah Resmi: Desa Sukahaji, Kecamatan Cipeundeuy, Kabupaten Bandung Barat.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveMode('leaflet')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeMode === 'leaflet'
                  ? 'bg-white text-teal-sedang shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <MapIcon className="h-3.5 w-3.5" /> Peta GIS Sensus
            </button>
            <button
              onClick={() => setActiveMode('google')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeMode === 'google'
                  ? 'bg-white text-teal-sedang shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Globe className="h-3.5 w-3.5" /> Google Maps Resmi
            </button>
          </div>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl bg-teal-sedang hover:bg-[#113a48] text-white text-xs font-bold px-3.5 py-2 transition shadow-xs cursor-pointer"
          >
            <MapPin className="h-3.5 w-3.5" /> Buka Google Maps <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {activeMode === 'leaflet' ? (
        <MapComponent />
      ) : (
        <div className="h-[480px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
          <iframe
            title="Google Maps Desa Sukahaji"
            src={`https://www.google.com/maps?cid=2054103360592180660&output=embed`}
            className="w-full h-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}
    </div>
  );
}
