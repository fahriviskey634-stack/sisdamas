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
  main_job?: string;
  monthly_income?: string;
  problems: { category: string; description: string }[];
  potentials?: { category: string; description: string }[];
  photo_url?: string;
}

// Sample pins array initialized empty (only real surveyed households will be displayed)
const INITIAL_DEMO_PINS: MapPin[] = [];

// Helper to create custom colored HTML markers with category icon emoji and pulse glow
const createHtmlIcon = (color: string, number: number, iconEmoji: string = '🏠') => {
  return L.divIcon({
    html: `
      <div class="relative group cursor-pointer">
        <div class="flex items-center justify-center h-10 w-10 rounded-full border-2 border-white shadow-2xl transition-all duration-300 transform group-hover:scale-125" style="background: radial-gradient(circle, ${color} 80%, #0f172a 100%);">
          <span class="text-sm drop-shadow-md select-none">${iconEmoji}</span>
          <span class="absolute -bottom-1 -right-1 flex items-center justify-center min-w-[18px] h-4.5 px-1 rounded-full text-[9px] font-black text-white bg-slate-950 border border-white shadow">
            ${number}
          </span>
        </div>
        <span class="absolute -top-1 -right-1 flex h-3 w-3">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style="background-color: ${color}"></span>
          <span class="relative inline-flex rounded-full h-3 w-3" style="background-color: ${color}"></span>
        </span>
      </div>
    `,
    className: 'custom-leaflet-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};

// Default village boundary bounds for Cipeundeuy
const SUKAHAJI_BOUNDS: L.LatLngBoundsExpression = [
  [-6.850, 107.250],
  [-6.600, 107.500]
];

export default function MapComponent({ defaultMapType = 'hybrid', currentUser }: { defaultMapType?: 'hybrid' | 'terrain' | 'osm'; currentUser?: any }) {
  const userGroup = currentUser?.group || 'All';

  // Synchronous state initialization to eliminate 0ms glitch on deleted pins
  const [pins, setPins] = useState<MapPin[]>(() => {
    if (typeof window === 'undefined') return INITIAL_DEMO_PINS;
    try {
      const deletedIds: string[] = JSON.parse(localStorage.getItem('sukahaji_deleted_pin_ids') || '[]');
      const editedPinsMap: Record<string, MapPin> = JSON.parse(localStorage.getItem('sukahaji_edited_pins') || '{}');
      return INITIAL_DEMO_PINS
        .filter(p => !deletedIds.includes(p.id))
        .map(p => editedPinsMap[p.id] ? { ...p, ...editedPinsMap[p.id] } : p);
    } catch {
      return INITIAL_DEMO_PINS;
    }
  });

  const [rtFilter, setRtFilter] = useState('All');
  const [groupFilter, setGroupFilter] = useState<string>(userGroup !== 'All' ? userGroup : 'All');
  const [mapType, setMapType] = useState<'hybrid' | 'terrain' | 'osm'>(defaultMapType);
  const [colorMode, setColorMode] = useState<'problem' | 'status'>('problem');
  const [boundaryData, setBoundaryData] = useState<any>(null);
  const [showLegendMobile, setShowLegendMobile] = useState(false);
  const [editingPin, setEditingPin] = useState<MapPin | null>(null);
  const [syncingCloud, setSyncingCloud] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  // Fetch real GeoJSON administrative boundary
  useEffect(() => {
    fetch('/data/sukahaji_boundary.json')
      .then((res) => res.json())
      .then((data) => setBoundaryData(data))
      .catch((err) => console.error('Error loading GeoJSON boundary:', err));
  }, []);

  const syncLocalDraftsToCloud = async () => {
    try {
      const saved1 = JSON.parse(localStorage.getItem('survey_drafts') || '[]');
      const saved2 = JSON.parse(localStorage.getItem('sukahaji_draft_surveys') || '[]');
      const allDrafts = [...(Array.isArray(saved1) ? saved1 : []), ...(Array.isArray(saved2) ? saved2 : [])];
      
      if (allDrafts.length > 0) {
        const res = await fetch('/api/surveys/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ drafts: allDrafts })
        });
        if (res.ok) {
          localStorage.removeItem('survey_drafts');
          localStorage.removeItem('sukahaji_draft_surveys');
        }
      }
    } catch (e) {
      console.warn('Auto-sync local drafts exception:', e);
    }
  };

  const fetchRealMapData = async () => {
    // 1. Auto-sync any unsynced local drafts to Cloud Server
    await syncLocalDraftsToCloud();

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
          monthly_income,
          main_job,
          rt (
            rt_number,
            rw (
              rw_number
            )
          ),
          survey (
            id,
            monthly_income,
            main_job,
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
            monthly_income: h.monthly_income || h.survey?.[0]?.monthly_income || '< Rp 1.000.000',
            main_job: h.main_job || h.survey?.[0]?.main_job || 'Petani',
            problems
          };
        });
      }
    } catch (err) {
      console.warn('Database fetch fallback active.');
    }

    // Merge local offline drafts if any remaining
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
      main_job: d.main_job,
      monthly_income: d.monthly_income,
      problems: d.problems || [],
      potentials: d.potentials || [],
      photo_url: d.photo_url
    }));

    // Load deleted IDs blacklist and edited pins map from localStorage
    const deletedIds: string[] = JSON.parse(localStorage.getItem('sukahaji_deleted_pin_ids') || '[]');
    const editedPinsMap: Record<string, MapPin> = JSON.parse(localStorage.getItem('sukahaji_edited_pins') || '{}');

    const allMerged = [...INITIAL_DEMO_PINS, ...loadedDbPins, ...draftPins];
    const uniqueMap = new Map();
    allMerged.forEach(p => {
      if (!deletedIds.includes(p.id)) {
        const finalPin = editedPinsMap[p.id] ? { ...p, ...editedPinsMap[p.id] } : p;
        uniqueMap.set(p.id, finalPin);
      }
    });
    setPins(Array.from(uniqueMap.values()));
  };

  const handleManualSync = async () => {
    setSyncingCloud(true);
    setSyncMsg('⏳ Sinkronisasi data pin ke Cloud Server Supabase...');
    await fetchRealMapData();
    setSyncMsg('✓ Berhasil menyinkronkan seluruh Pin SIMAP dengan Cloud Server!');
    setSyncingCloud(false);
    setTimeout(() => setSyncMsg(''), 3000);
  };

  // Fetch real household coordinates and problems list from Supabase + localStorage
  useEffect(() => {
    fetchRealMapData();
  }, []);

  const handleDeletePin = async (pinId: string, kkName: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus pin sensus "${kkName}" dari peta?`)) return;

    // 1. Remove from UI state
    setPins(prev => prev.filter(p => p.id !== pinId));

    // 2. Persist deleted ID to localStorage so it NEVER reappears on refresh!
    try {
      const deletedIds: string[] = JSON.parse(localStorage.getItem('sukahaji_deleted_pin_ids') || '[]');
      if (!deletedIds.includes(pinId)) {
        deletedIds.push(pinId);
        localStorage.setItem('sukahaji_deleted_pin_ids', JSON.stringify(deletedIds));
      }
    } catch {}

    // 3. Remove from localStorage draft
    try {
      const drafts = JSON.parse(localStorage.getItem('survey_drafts') || '[]');
      const updatedDrafts = drafts.filter((d: any) => d.client_uuid !== pinId && `draft-map-${d.id}` !== pinId);
      localStorage.setItem('survey_drafts', JSON.stringify(updatedDrafts));
    } catch {}

    // 4. Delete / Soft-delete from Supabase if real DB ID
    if (pinId && !pinId.startsWith('pin-sukahaji') && !pinId.startsWith('draft-')) {
      try {
        await supabase
          .from('household')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', pinId);
      } catch (err) {
        console.error('Gagal hapus pin dari database:', err);
      }
    }
  };

  const handleSaveEditPin = async () => {
    if (!editingPin) return;

    // 1. Update state
    setPins(prev => prev.map(p => p.id === editingPin.id ? editingPin : p));

    // 2. Save edit to localStorage
    try {
      const editedPinsMap = JSON.parse(localStorage.getItem('sukahaji_edited_pins') || '{}');
      editedPinsMap[editingPin.id] = editingPin;
      localStorage.setItem('sukahaji_edited_pins', JSON.stringify(editedPinsMap));
    } catch {}

    // 3. Update Supabase if real DB ID
    if (editingPin.id && !editingPin.id.startsWith('pin-sukahaji') && !editingPin.id.startsWith('draft-')) {
      try {
        await supabase
          .from('household')
          .update({
            kk_name: editingPin.kk_name,
            welfare_level: editingPin.welfare_level,
            housing_condition: editingPin.housing_condition,
            family_size: editingPin.family_size,
            survey_status: editingPin.survey_status
          })
          .eq('id', editingPin.id);
      } catch (err) {
        console.error('Gagal memperbarui database:', err);
      }
    }

    setEditingPin(null);
    alert('✓ Data pin berhasil diperbarui!');
  };

  // Dual filtering by RT/RW and Kelompok
  const filteredPins = pins.filter(pin => {
    const matchRt = rtFilter === 'All' || pin.rt_label.includes(rtFilter);
    let matchGroup = true;
    if (groupFilter === '55') {
      matchGroup = pin.rt_label.includes('RW 06');
    } else if (groupFilter === '56') {
      matchGroup = pin.rt_label.includes('RW 01') || pin.rt_label.includes('RW 05') || pin.rt_label.includes('RW 11');
    } else if (groupFilter === '57') {
      matchGroup = pin.rt_label.includes('RW 03') || pin.rt_label.includes('RW 04');
    }
    return matchRt && matchGroup;
  });

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
    const cat = (problems[0].category || '').toLowerCase();
    if (cat.includes('infrastruktur') || cat.includes('jalan')) return '#EF4444'; // Red
    if (cat.includes('kesehatan') || cat.includes('posyandu') || cat.includes('mbg')) return '#3B82F6'; // Blue
    if (cat.includes('ekonomi') || cat.includes('emok') || cat.includes('umkm')) return '#10B981'; // Green
    if (cat.includes('lingkungan') || cat.includes('sampah')) return '#F59E0B'; // Amber
    if (cat.includes('pendidikan') || cat.includes('guru')) return '#8B5CF6'; // Purple
    if (cat.includes('sosial') || cat.includes('baznas') || cat.includes('rutilahu')) return '#EC4899'; // Pink
    if (cat.includes('kelembagaan') || cat.includes('stakeholder')) return '#6366F1'; // Indigo
    return '#6B7280';
  };

  const getCategoryIcon = (problems: { category: string }[]) => {
    if (!problems || problems.length === 0) return '🏠';
    const cat = (problems[0].category || '').toLowerCase();
    if (cat.includes('infrastruktur') || cat.includes('jalan')) return '🏗️';
    if (cat.includes('kesehatan') || cat.includes('posyandu') || cat.includes('mbg')) return '🏥';
    if (cat.includes('ekonomi') || cat.includes('emok')) return '💸';
    if (cat.includes('umkm') || cat.includes('kuliner')) return '🍱';
    if (cat.includes('lingkungan') || cat.includes('sampah')) return '🚮';
    if (cat.includes('pendidikan') || cat.includes('guru')) return '📖';
    if (cat.includes('sosial') || cat.includes('rutilahu') || cat.includes('baznas')) return '🏚️';
    if (cat.includes('kelembagaan') || cat.includes('stakeholder')) return '🏛️';
    return '🏠';
  };

  const handleExportCSVForLooker = () => {
    if (filteredPins.length === 0) return alert('Tidak ada data pin untuk diekspor.');

    const headers = ['ID Pin', 'Nama KK', 'RT/RW', 'Latitude', 'Longitude', 'Akurasi GPS (m)', 'Status Verifikasi', 'Kesejahteraan', 'Kondisi Rumah', 'Anggota Keluarga', 'Masalah Utama', 'Deskripsi Masalah'];
    const rows = filteredPins.map(p => {
      const mainProb = p.problems?.[0] || { category: '-', description: '-' };
      return [
        `"${p.id}"`,
        `"${p.kk_name.replace(/"/g, '""')}"`,
        `"${p.rt_label}"`,
        p.latitude,
        p.longitude,
        p.gps_accuracy,
        `"${p.survey_status}"`,
        `"${p.welfare_level || 'Sejahtera I'}"`,
        `"${p.housing_condition || 'Layak Huni'}"`,
        p.family_size || 4,
        `"${mainProb.category}"`,
        `"${mainProb.description.replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gis_sukahaji_google_looker_studio_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportGeoJSON = () => {
    if (filteredPins.length === 0) return alert('Tidak ada data pin untuk diekspor.');

    const geojson = {
      type: 'FeatureCollection',
      features: filteredPins.map(p => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [p.longitude, p.latitude]
        },
        properties: {
          id: p.id,
          kk_name: p.kk_name,
          rt_label: p.rt_label,
          survey_status: p.survey_status,
          welfare_level: p.welfare_level,
          housing_condition: p.housing_condition,
          family_size: p.family_size,
          problems: p.problems
        }
      }))
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(geojson, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `gis_sukahaji_google_earth_${Date.now()}.geojson`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 font-sans text-slate-800">
      {/* Map Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Kelompok Filter */}
          <div>
            <span className="text-xs font-semibold text-slate-700 uppercase mr-2">Filter Kelompok:</span>
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="rounded-lg border border-teal-300 bg-teal-50 text-teal-900 px-3 py-1.5 text-xs outline-none focus:border-teal-600 transition font-bold"
            >
              <option value="All">Semua Kelompok (Kelompok 55, 56, 57)</option>
              <option value="55">Kelompok 55 — Dusun 2 (RW 06)</option>
              <option value="56">Kelompok 56 — Dusun 2 (RW 01, RW 05, RW 11)</option>
              <option value="57">Kelompok 57 — Dusun 1 (RW 03, RW 04)</option>
            </select>
          </div>

          {/* RT Filter */}
          <div>
            <span className="text-xs font-semibold text-slate-700 uppercase mr-2">Filter Wilayah RW:</span>
            <select
              value={rtFilter}
              onChange={(e) => setRtFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white text-slate-900 px-3 py-1.5 text-xs outline-none focus:border-indigo-500 transition font-bold"
            >
              <option value="All">Semua Wilayah RW ({filteredPins.length} Pin)</option>
              <option value="RW 01">RW 01 (Dusun 2 — Kelompok 56)</option>
              <option value="RW 03">RW 03 (Dusun 1 — Kelompok 57)</option>
              <option value="RW 04">RW 04 (Dusun 1 — Kelompok 57)</option>
              <option value="RW 05">RW 05 (Dusun 2 — Kelompok 56)</option>
              <option value="RW 06">RW 06 (Dusun 2 — Kelompok 55)</option>
              <option value="RW 08">RW 08 (Dusun 3 — Umum)</option>
              <option value="RW 11">RW 11 (Dusun 2 — Kelompok 56)</option>
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
        </div>

        {/* GIS Data Export & Cloud Sync Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleManualSync}
            disabled={syncingCloud}
            className="flex items-center gap-1.5 rounded-xl bg-teal-sedang hover:bg-[#113a48] text-white font-extrabold text-xs px-3.5 py-2 transition shadow-sm cursor-pointer disabled:opacity-50"
            title="Sinkronkan data draf lokal dan muat pin terbaru dari Cloud Supabase"
          >
            {syncingCloud ? '⏳ Menyelaraskan...' : '🔄 Sinkronkan Pin Cloud'}
          </button>
          <button
            type="button"
            onClick={handleExportCSVForLooker}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3.5 py-2 transition shadow-sm cursor-pointer"
            title="Ekspor CSV untuk Google Looker Studio & Excel"
          >
            📊 Ekspor CSV (Google Looker Studio)
          </button>
          <button
            type="button"
            onClick={handleExportGeoJSON}
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs px-3.5 py-2 transition shadow-sm cursor-pointer"
            title="Ekspor GeoJSON untuk Google Earth & QGIS"
          >
            🗺️ Ekspor GeoJSON (Google Earth)
          </button>
        </div>
      </div>

      {syncMsg && (
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs font-bold text-teal-900 animate-fade-in flex items-center justify-between">
          <span>{syncMsg}</span>
          <span className="text-[10px] text-teal-700 font-normal">Tersinkronisasi dengan Supabase Cloud Database</span>
        </div>
      )}

      {/* Leaflet Map Container */}
      <div className="h-[540px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-10">
        <MapContainer
          center={[-6.7290, 107.3650]}
          zoom={14}
          minZoom={11}
          maxZoom={20}
          maxBounds={SUKAHAJI_BOUNDS}
          maxBoundsViscosity={0.6}
          style={{ height: '100%', width: '100%' }}
        >
          {mapType === 'osm' && (
            <TileLayer
              attribution='&copy; OpenStreetMap'
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
              maxNativeZoom={20}
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
            
            const iconEmoji = getCategoryIcon(pin.problems);

            return (
              <Marker
                key={pin.id}
                position={[pin.latitude, pin.longitude]}
                icon={createHtmlIcon(pinColor, pin.problems.length, iconEmoji)}
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
                        <span className="text-slate-400 block text-[8px] uppercase font-bold">Penghasilan / Bln</span>
                        <span className="text-emerald-700 font-extrabold">{pin.monthly_income || '< Rp 1.000.000'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[8px] uppercase font-bold">Pekerjaan Utama</span>
                        <span className="text-slate-800 font-bold">{pin.main_job || 'Petani'}</span>
                      </div>
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

                    {/* Action Buttons: Direct Google Maps, Street View & Edit/Delete Pin */}
                    <div className="space-y-1.5 pt-1">
                      <div className="grid grid-cols-2 gap-1.5">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${pin.latitude},${pin.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-[9.5px] py-1.5 transition shadow-sm text-center"
                        >
                          🧭 Google Maps ↗
                        </a>
                        <a
                          href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${pin.latitude},${pin.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[9.5px] py-1.5 transition shadow-sm text-center"
                        >
                          📷 Street View 360° ↗
                        </a>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingPin({ ...pin })}
                          className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-[10px] py-1.5 transition cursor-pointer shadow-xs"
                        >
                          ✏️ Edit Data Pin
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeletePin(pin.id, pin.kk_name)}
                          className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-[10px] py-1.5 transition cursor-pointer shadow-xs"
                        >
                          🗑️ Hapus Pin
                        </button>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Optimized Bottom-Left Collapsible Map Legend Floating Card */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/90 text-white backdrop-blur-md p-3 rounded-2xl shadow-2xl border border-white/20 max-w-[92vw] sm:max-w-xl transition-all duration-300 pointer-events-auto">
          <div
            onClick={() => setShowLegendMobile(!showLegendMobile)}
            className="flex items-center justify-between gap-3 cursor-pointer select-none"
          >
            <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              🗺️ Legenda Icon Peta Tematik Desa ({filteredPins.length} Pin)
            </span>
            <span className="text-[10px] font-bold text-slate-300 bg-white/10 px-2 py-0.5 rounded-lg border border-white/20 hover:bg-white/20 transition">
              {showLegendMobile ? '▲ Sembunyikan' : '▼ Tampilkan Legenda'}
            </span>
          </div>

          {showLegendMobile && (
            <div className="mt-2.5 pt-2 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[9.5px] font-bold animate-fade-in">
              {colorMode === 'status' ? (
                <>
                  <span className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-lg border border-white/10"><span className="h-2.5 w-2.5 rounded-full bg-[#22C55E]" /> Terkunci</span>
                  <span className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-lg border border-white/10"><span className="h-2.5 w-2.5 rounded-full bg-[#3B82F6]" /> Terverifikasi</span>
                  <span className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-lg border border-white/10"><span className="h-2.5 w-2.5 rounded-full bg-[#EAB308]" /> Dikirim</span>
                  <span className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-lg border border-white/10"><span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" /> Perlu Perbaikan</span>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-lg border border-white/10"><span className="text-xs">🏗️</span><span className="h-2 w-2 rounded-full bg-[#EF4444]" /> Infrastruktur</span>
                  <span className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-lg border border-white/10"><span className="text-xs">🏥</span><span className="h-2 w-2 rounded-full bg-[#3B82F6]" /> Kesehatan</span>
                  <span className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-lg border border-white/10"><span className="text-xs">💰</span><span className="h-2 w-2 rounded-full bg-[#10B981]" /> Ekonomi</span>
                  <span className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-lg border border-white/10"><span className="text-xs">🌿</span><span className="h-2 w-2 rounded-full bg-[#F59E0B]" /> Lingkungan</span>
                  <span className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-lg border border-white/10"><span className="text-xs">🎓</span><span className="h-2 w-2 rounded-full bg-[#8B5CF6]" /> Pendidikan</span>
                  <span className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-lg border border-white/10"><span className="text-xs">🎭</span><span className="h-2 w-2 rounded-full bg-[#EC4899]" /> Sosial-Budaya</span>
                  <span className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-lg border border-white/10"><span className="text-xs">🏠</span><span className="h-2 w-2 rounded-full bg-[#94A3B8]" /> Tanpa Masalah</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Pin Modal Dialog */}
      {editingPin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                ✏️ Edit Data Sensus ({editingPin.kk_name})
              </h3>
              <button
                onClick={() => setEditingPin(null)}
                className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs text-slate-800">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nama Kepala Keluarga (KK):</label>
                <input
                  type="text"
                  value={editingPin.kk_name}
                  onChange={(e) => setEditingPin({ ...editingPin, kk_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-teal-sedang font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Wilayah RT / RW:</label>
                  <input
                    type="text"
                    value={editingPin.rt_label}
                    onChange={(e) => setEditingPin({ ...editingPin, rt_label: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-teal-sedang font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Status Verifikasi:</label>
                  <select
                    value={editingPin.survey_status}
                    onChange={(e) => setEditingPin({ ...editingPin, survey_status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-teal-sedang font-semibold bg-white"
                  >
                    <option value="completed">Dikirim (Completed)</option>
                    <option value="verified">Terverifikasi (Verified)</option>
                    <option value="locked">Terkunci (Locked)</option>
                    <option value="rejected">Perlu Perbaikan (Rejected)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tingkat Kesejahteraan:</label>
                  <select
                    value={editingPin.welfare_level || 'Sejahtera I'}
                    onChange={(e) => setEditingPin({ ...editingPin, welfare_level: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-teal-sedang font-semibold bg-white"
                  >
                    <option value="Pra Sejahtera">Pra Sejahtera</option>
                    <option value="Sejahtera I">Sejahtera I</option>
                    <option value="Sejahtera II">Sejahtera II</option>
                    <option value="Sejahtera III">Sejahtera III</option>
                    <option value="Sejahtera III Plus">Sejahtera III Plus</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Kondisi Rumah:</label>
                  <input
                    type="text"
                    value={editingPin.housing_condition || 'Layak Huni'}
                    onChange={(e) => setEditingPin({ ...editingPin, housing_condition: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-teal-sedang font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Jumlah Anggota Keluarga (Jiwa):</label>
                  <input
                    type="number"
                    min={1}
                    value={editingPin.family_size || 4}
                    onChange={(e) => setEditingPin({ ...editingPin, family_size: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-teal-sedang font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Akurasi GPS (meter):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingPin.gps_accuracy || 4.0}
                    onChange={(e) => setEditingPin({ ...editingPin, gps_accuracy: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-teal-sedang font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingPin(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveEditPin}
                className="px-5 py-2 bg-teal-sedang hover:bg-[#113a48] text-white font-bold rounded-xl transition cursor-pointer shadow-sm"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
