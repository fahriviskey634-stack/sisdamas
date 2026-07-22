import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, ExternalLink, Map as MapIcon, Globe } from 'lucide-react';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-[450px] w-full rounded-2xl border border-slate-300/60 bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-500">
      Memuat Peta Sebaran Lapangan (Google Satellite GIS)...
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
              <MapIcon className="h-3.5 w-3.5" /> Peta Interaktif & Pin Sensus
            </button>
            <button
              onClick={() => setActiveMode('google')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeMode === 'google'
                  ? 'bg-white text-teal-sedang shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Globe className="h-3.5 w-3.5" /> Google Maps Embed
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
        <div className="space-y-4 font-sans text-slate-800">
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

          {/* Legenda Peta Tematik Card Overlay for Google Maps Embed */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-2">
            <span className="text-xxs font-extrabold text-slate-400 uppercase tracking-wider block">
              Legenda Peta Tematik Sensus Desa Sukahaji
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 text-xxs font-bold text-slate-700">
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[#EF4444]" /> Infrastruktur</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[#3B82F6]" /> Kesehatan</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[#10B981]" /> Ekonomi</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[#F59E0B]" /> Lingkungan</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[#8B5CF6]" /> Pendidikan</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[#EC4899]" /> Sosial-Budaya</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[#22C55E]" /> Terverifikasi</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
