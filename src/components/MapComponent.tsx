'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/lib/supabase';

interface MapPin {
  id: string;
  kk_name: string;
  rt_label: string;
  latitude: number;
  longitude: number;
  gps_accuracy: number;
  survey_status: 'completed' | 'verified' | 'locked' | 'rejected';
  welfare_level?: string;
  housing_status?: string;
  housing_condition?: string;
  family_size?: number;
  problems: { category: string; description: string }[];
  potentials?: { category: string; description: string }[];
  photo_url?: string;
}

// Realistic sample pins for Desa Sukahaji Dusun 1, 2, and 3
const INITIAL_DEMO_PINS: MapPin[] = [
  {
    id: 'pin-sukahaji-1',
    kk_name: 'Bpk. Maman Rohman',
    rt_label: 'RT 01 / RW 01 (Dusun 2)',
    latitude: -6.7275,
    longitude: 107.3789,
    gps_accuracy: 4.2,
    survey_status: 'verified',
    welfare_level: 'Sejahtera I',
    housing_status: 'Milik Sendiri',
    housing_condition: 'Layak Huni',
    family_size: 4,
    problems: [
      { category: 'Infrastruktur', description: 'Drainase selokan RT 01 tersumbat saat hujan' },
      { category: 'Kesehatan', description: 'Perlu tambahan fasilitas posyandu lansia' }
    ],
    potentials: [
      { category: 'Usaha Mikro/UMKM', description: 'Produksi keripik pisang skala rumah tangga' }
    ]
  },
  {
    id: 'pin-sukahaji-2',
    kk_name: 'Bpk. Hendra Wijaya',
    rt_label: 'RT 02 / RW 05 (Dusun 2)',
    latitude: -6.7288,
    longitude: 107.3802,
    gps_accuracy: 3.8,
    survey_status: 'completed',
    welfare_level: 'Pra Sejahtera',
    housing_status: 'Milik Sendiri',
    housing_condition: 'Rutilahu (Perbaikan Atap)',
    family_size: 5,
    problems: [
      { category: 'Infrastruktur', description: 'Atap bocor dan penerangan jalan belum memadai' }
    ],
    potentials: [
      { category: 'Pertanian', description: 'Lahan kebun tomat 200m2' }
    ]
  },
  {
    id: 'pin-sukahaji-3',
    kk_name: 'Bpk. Dadang Kusnadi',
    rt_label: 'RT 01 / RW 03 (Dusun 1)',
    latitude: -6.7252,
    longitude: 107.3745,
    gps_accuracy: 5.1,
    survey_status: 'verified',
    welfare_level: 'Sejahtera II',
    housing_status: 'Milik Sendiri',
    housing_condition: 'Layak Huni',
    family_size: 3,
    problems: [
      { category: 'Ekonomi', description: 'Akses permodalan pupuk pertanian terbatas' }
    ],
    potentials: [
      { category: 'Peternakan', description: 'Budidaya kambing perah' }
    ]
  },
  {
    id: 'pin-sukahaji-4',
    kk_name: 'Bpk. Ujang Suherman',
    rt_label: 'RT 03 / RW 08 (Dusun 3)',
    latitude: -6.7315,
    longitude: 107.3855,
    gps_accuracy: 4.0,
    survey_status: 'locked',
    welfare_level: 'Sejahtera I',
    housing_status: 'Milik Sendiri',
    housing_condition: 'Layak Huni',
    family_size: 4,
    problems: [
      { category: 'Lingkungan', description: 'Pengelolaan sampah wilayah RW 08 perlu tempat pembuangan terpadu' }
    ],
    potentials: [
      { category: 'Keterampilan Khusus', description: 'Kerajinan anyaman bambu' }
    ]
  }
];

// Helper to create custom colored HTML markers with pulsing glow
const createHtmlIcon = (color: string, number: number) => {
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center h-8 w-8 rounded-full border-2 border-white shadow-md transition hover:scale-110" style="background-color: ${color}">
        <span class="text-xxs font-black text-white">${number}</span>
        <span class="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style="background-color: ${color}"></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5" style="background-color: ${color}"></span>
        </span>
      </div>
    `,
    className: 'custom-leaflet-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

// Default village boundary bounds for Cipeundeuy
const SUKAHAJI_BOUNDS: L.LatLngBoundsExpression = [
  [-6.850, 107.250],
  [-6.600, 107.500]
];

export default function MapComponent({ defaultMapType = 'hybrid' }: { defaultMapType?: 'hybrid' | 'terrain' | 'osm' }) {
  const [pins, setPins] = useState<MapPin[]>(INITIAL_DEMO_PINS);
  const [rtFilter, setRtFilter] = useState('All');
  const [mapType, setMapType] = useState<'hybrid' | 'terrain' | 'osm'>(defaultMapType);
  const [colorMode, setColorMode] = useState<'problem' | 'status'>('problem');
  const [boundaryData, setBoundaryData] = useState<any>(null);

  // Fetch real GeoJSON administrative boundary
  useEffect(() => {
    fetch('/data/sukahaji_boundary.json')
      .then((res) => res.json())
      .then((data) => setBoundaryData(data))
      .catch((err) => console.error('Error loading GeoJSON boundary:', err));
  }, []);

  // Fetch real household coordinates and problems list from Supabase + localStorage
  useEffect(() => {
    const fetchRealMapData = async () => {
      let loadedDbPins: MapPin[] = [];
      try {
        const { data, error } = await supabase
          .from('household')
          .select(`
            id,
            kk_name,
            latitude,
            longitude,
            gps_accuracy,
            survey_status,
            rt (
              rt_number,
              rw (
                rw_number
              )
            ),
            survey (
              id,
              problem (
                category,
                description
              )
            )
          `)
          .is('deleted_at', null);

        if (!error && data) {
          loadedDbPins = data.map((h: any) => {
            const rawProblems = h.survey?.[0]?.problem || [];
            const problems = rawProblems.map((p: any) => ({
              category: p.category,
              description: p.description
            }));

            const rtName = h.rt?.rt_number || 'RT 01';
            const rwName = h.rt?.rw?.rw_number || 'RW 01';

            return {
              id: h.id,
              kk_name: h.kk_name,
              rt_label: `${rtName} / ${rwName}`,
              latitude: Number(h.latitude),
              longitude: Number(h.longitude),
              gps_accuracy: Number(h.gps_accuracy || 0),
              survey_status: h.survey_status,
              problems
            };
          });
        }
      } catch (err) {
        console.warn('Database fetch fallback active.');
      }

      // Merge local offline drafts
      const drafts = JSON.parse(localStorage.getItem('survey_drafts') || '[]');
      const draftPins: MapPin[] = drafts.map((d: any) => ({
        id: d.client_uuid || `draft-map-${Math.random()}`,
        kk_name: d.kk_name,
        rt_label: d.rt_label,
        latitude: Number(d.latitude),
        longitude: Number(d.longitude),
        gps_accuracy: Number(d.gps_accuracy || 0),
        survey_status: 'completed',
        welfare_level: d.welfare_level,
        housing_status: d.housing_status,
        housing_condition: d.housing_condition,
        family_size: d.family_size,
        problems: d.problems || [],
        potentials: d.potentials || [],
        photo_url: d.photo_url
      }));

      const allMerged = [...INITIAL_DEMO_PINS, ...loadedDbPins, ...draftPins];
      const uniqueMap = new Map();
      allMerged.forEach(p => uniqueMap.set(p.id, p));
      setPins(Array.from(uniqueMap.values()));
    };

    fetchRealMapData();
  }, []);

  const filteredPins = rtFilter === 'All'
    ? pins
    : pins.filter(pin => pin.rt_label.includes(rtFilter));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'locked': return '#22C55E'; // Green
      case 'verified': return '#3B82F6'; // Blue
      case 'completed': return '#EAB308'; // Yellow
      default: return '#EF4444'; // Red
    }
  };

  const getProblemColor = (problems: { category: string }[]) => {
    if (!problems || problems.length === 0) return '#94A3B8';
    const firstCat = problems[0].category;
    switch (firstCat) {
      case 'Infrastruktur': return '#EF4444';
      case 'Kesehatan': return '#3B82F6';
      case 'Ekonomi': return '#10B981';
      case 'Lingkungan': return '#F59E0B';
      case 'Pendidikan': return '#8B5CF6';
      case 'Sosial-Budaya': return '#EC4899';
      default: return '#6B7280';
    }
  };

  return (
    <div className="space-y-4 font-sans text-slate-800">
      {/* Map Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-700 uppercase mr-2">Filter Wilayah:</span>
            <select
              value={rtFilter}
              onChange={(e) => setRtFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white text-slate-900 px-3 py-1.5 text-xs outline-none focus:border-indigo-500 transition font-bold"
            >
              <option value="All">Semua Wilayah RT/RW Desa Sukahaji</option>
              <option value="RW 01">RW 01 (Dusun 2)</option>
              <option value="RW 03">RW 03 (Dusun 1)</option>
              <option value="RW 05">RW 05 (Dusun 2)</option>
              <option value="RW 06">RW 06 (Dusun 2)</option>
              <option value="RW 08">RW 08 (Dusun 3)</option>
              <option value="RW 11">RW 11 (Dusun 2)</option>
            </select>
          </div>
          
          <div>
            <span className="text-xs font-semibold text-slate-700 uppercase mr-2">Tipe Peta GIS:</span>
            <select
              value={mapType}
              onChange={(e) => setMapType(e.target.value as any)}
              className="rounded-lg border border-slate-300 bg-white text-slate-900 px-3 py-1.5 text-xs outline-none focus:border-indigo-500 transition font-bold"
            >
              <option value="hybrid">Satelit Hybrid (Google Satellite + Labels)</option>
              <option value="terrain">Topografi Relief (Google Terrain)</option>
              <option value="osm">Peta Jalan Vector (OSM Standard)</option>
            </select>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-700 uppercase mr-2">Pewarnaan Pin:</span>
            <select
              value={colorMode}
              onChange={(e) => setColorMode(e.target.value as any)}
              className="rounded-lg border border-slate-300 bg-white text-slate-900 px-3 py-1.5 text-xs outline-none focus:border-indigo-500 transition font-bold"
            >
              <option value="problem">Tematik Kategori Masalah (Rekomendasi)</option>
              <option value="status">Status Verifikasi Data</option>
            </select>
          </div>

          <a
            href="https://www.google.com/maps?cid=2054103360592180660"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-[#092430] bg-amber-100 hover:bg-amber-200 border border-amber-300 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
          >
            📍 Google Maps Desa Sukahaji ↗
          </a>
        </div>
      </div>

      {/* Leaflet Map Container */}
      <div className="h-[520px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-10">
        <MapContainer
          center={[-6.7270, 107.3800]}
          zoom={14}
          minZoom={11}
          maxZoom={20}
          maxBounds={SUKAHAJI_BOUNDS}
          maxBoundsViscosity={0.6}
          style={{ height: '100%', width: '100%' }}
        >
          {mapType === 'osm' && (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={20}
              maxNativeZoom={19}
            />
          )}
          {mapType === 'hybrid' && (
            <TileLayer
              attribution='&copy; Google Satellite Maps'
              url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
              maxZoom={20}
              maxNativeZoom={18}
            />
          )}
          {mapType === 'terrain' && (
            <TileLayer
              attribution='&copy; Google Terrain Maps'
              url="https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
              maxZoom={20}
              maxNativeZoom={15}
            />
          )}

          {boundaryData && (
            <GeoJSON
              data={boundaryData}
              style={{
                fillColor: '#EF4444',
                fillOpacity: 0.06,
                color: '#DC2626',
                weight: 2.5,
                dashArray: '4, 6'
              }}
            />
          )}

          {filteredPins.map((pin) => {
            const pinColor = colorMode === 'status'
              ? getStatusColor(pin.survey_status)
              : getProblemColor(pin.problems);

            return (
              <Marker
                key={pin.id}
                position={[pin.latitude, pin.longitude]}
                icon={createHtmlIcon(pinColor, pin.problems.length)}
              >
                <Popup className="custom-pin-popup">
                  <div className="p-2 font-sans text-slate-800 min-w-[260px] max-w-xs space-y-2">
                    <div className="border-b border-slate-150 pb-2">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-extrabold text-sm text-slate-900">{pin.kk_name}</h4>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {pin.survey_status}
                        </span>
                      </div>
                      <p className="text-[10.5px] font-bold text-teal-700 mt-0.5">📍 {pin.rt_label}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-xxs font-semibold bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <div>
                        <span className="text-slate-400 block text-[8px] uppercase font-bold">Kesejahteraan</span>
                        <span className="text-slate-800 font-bold">{pin.welfare_level || 'Sejahtera I'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[8px] uppercase font-bold">Kondisi Rumah</span>
                        <span className="text-slate-800 font-bold">{pin.housing_condition || 'Layak Huni'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[8px] uppercase font-bold">Anggota Keluarga</span>
                        <span className="text-slate-800 font-bold">{pin.family_size || 4} Jiwa</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[8px] uppercase font-bold">Akurasi GPS</span>
                        <span className="text-slate-800 font-bold">±{pin.gps_accuracy.toFixed(1)}m</span>
                      </div>
                    </div>

                    {/* Household Problems Popup List */}
                    <div className="space-y-1">
                      <span className="font-black text-rose-700 block text-[10px] uppercase">
                        ⚠️ Kendala & Keluhan ({pin.problems.length}):
                      </span>
                      {pin.problems.length > 0 ? (
                        <ul className="space-y-1 max-h-28 overflow-y-auto pr-1">
                          {pin.problems.map((p, idx) => (
                            <li key={idx} className="bg-rose-50 p-1.5 rounded-md border border-rose-200 text-xxs">
                              <span className="font-black text-rose-800 uppercase block text-[9px]">[{p.category}]</span>
                              <p className="text-slate-750 font-semibold mt-0.5 leading-tight text-[10px]">{p.description}</p>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[9.5px] text-slate-400 italic">Tidak ada keluhan terdaftar.</p>
                      )}
                    </div>

                    {/* Household Potentials Popup List */}
                    {pin.potentials && pin.potentials.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-slate-150">
                        <span className="font-black text-emerald-700 block text-[10px] uppercase">
                          💡 Potensi Rumah Tangga:
                        </span>
                        <ul className="space-y-1 max-h-20 overflow-y-auto pr-1">
                          {pin.potentials.map((p, idx) => (
                            <li key={idx} className="bg-emerald-50 p-1.5 rounded-md border border-emerald-200 text-xxs">
                              <span className="font-black text-emerald-800 uppercase block text-[9px]">[{p.category}]</span>
                              <p className="text-slate-750 font-semibold mt-0.5 leading-tight text-[10px]">{p.description}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Direct Navigation Button to Google Maps */}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${pin.latitude},${pin.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px] py-1.5 transition mt-2 shadow-sm"
                    >
                      🧭 Navigasi Google Maps ({pin.latitude.toFixed(5)}, {pin.longitude.toFixed(5)}) ↗
                    </a>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Floating Map Legend Card overlaying directly on top-right of the map */}
        <div className="absolute top-3 right-3 z-[1000] bg-slate-900/90 text-white backdrop-blur-md p-3 rounded-xl shadow-2xl border border-white/20 max-w-full sm:max-w-2xl animate-fade-in pointer-events-auto">
          <span className="text-[9px] font-black text-amber-300 uppercase tracking-widest block mb-1.5">
            📍 Legenda Peta Tematik Sensus Desa Sukahaji
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-[9.5px] font-bold">
            {colorMode === 'status' ? (
              <>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#22C55E] shadow-sm" /> Terkunci</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#3B82F6] shadow-sm" /> Terverifikasi</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#EAB308] shadow-sm" /> Dikirim</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#EF4444] shadow-sm" /> Perlu Perbaikan</span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#EF4444] shadow-sm" /> Infrastruktur</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#3B82F6] shadow-sm" /> Kesehatan</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#10B981] shadow-sm" /> Ekonomi</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B] shadow-sm" /> Lingkungan</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#8B5CF6] shadow-sm" /> Pendidikan</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#EC4899] shadow-sm" /> Sosial-Budaya</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#94A3B8] shadow-sm" /> Tanpa Masalah</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
