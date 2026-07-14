'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LayoutDashboard, StickyNote, User, LogOut, CheckSquare, BarChart3, HelpCircle, RefreshCw, AlertCircle, PlusCircle, Map, FileSpreadsheet, Activity, ChevronRight, Save, Trash2, Camera, Navigation, AlertTriangle, CheckCircle, Plus, Info, Tag, Key, Shield, ArrowLeft, ArrowRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';

interface DraftSurvey {
  client_uuid: string;
  rt_id: string;
  rt_label: string;
  kk_name: string;
  kk_number: string;
  latitude: number;
  longitude: number;
  gps_accuracy: number;
  family_size: number;
  housing_status: string;
  housing_condition: string;
  welfare_level?: string;
  education_level?: string;
  main_job?: string;
  problems: { category: string; description: string }[];
  potentials: { category: string; description: string }[];
  photo_url: string; // DataURI compressed image
  surveyor_id: string;
}

interface PriorityItem {
  id: string;
  problem_text: string;
  category: string;
  rt_label: string;
  urgency: number;
  seriousness: number;
  growth: number;
  total_score: number;
  rank?: number;
}

// Dynamically load Map component with SSR disabled
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-[450px] w-full rounded-2xl border border-slate-300/60 bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-500">
      Memuat Peta Sebaran Lapangan (Leaflet GIS)...
    </div>
  )
});

export default function DashboardShell() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-slate-600 font-sans font-semibold">
        Memuat Panel SISDAMAS...
      </div>
    }>
      <DashboardSPA />
    </Suspense>
  );
}

function DashboardSPA() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [draftCount, setDraftCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [rtTargets, setRtTargets] = useState<any[]>([]);

  // Initialize targets from localStorage or defaults
  useEffect(() => {
    const saved = localStorage.getItem('sukahaji_rt_targets');
    if (saved) {
      setRtTargets(JSON.parse(saved));
    } else {
      setRtTargets(DEFAULT_RT_TARGETS);
      localStorage.setItem('sukahaji_rt_targets', JSON.stringify(DEFAULT_RT_TARGETS));
    }
  }, []);

  // Synchronize state with URL parameters (for external links /app/dashboard?tab=...)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setCurrentTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    updateDraftCount();
  }, []);

  const updateDraftCount = () => {
    if (typeof window !== 'undefined') {
      const drafts = JSON.parse(localStorage.getItem('survey_drafts') || '[]');
      setDraftCount(drafts.length);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      document.cookie = 'sb-access-token=; path=/; max-age=0';
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  // Sync drafts to serverless API
  const handleSyncDrafts = async () => {
    const drafts = JSON.parse(localStorage.getItem('survey_drafts') || '[]');
    if (drafts.length === 0) return;

    setSyncing(true);
    setSyncStatus('Sedang mensinkronisasikan data antrean...');

    try {
      const res = await fetch('/api/surveys/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surveys: drafts })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Sinkronisasi gagal');

      // Success - clear local queue
      localStorage.setItem('survey_drafts', '[]');
      setDraftCount(0);
      setSyncStatus('Sukses! Semua data draf lapangan telah tersinkronisasi ke server.');
      setTimeout(() => setSyncStatus(''), 4000);
    } catch (err: any) {
      setSyncStatus(`Gagal sinkronisasi: ${err.message || 'Server offline'}`);
      setTimeout(() => setSyncStatus(''), 4000);
    } finally {
      setSyncing(false);
    }
  };

  // Switch tab in Single-Page Application style
  const switchTab = (tabName: string) => {
    setCurrentTab(tabName);
    // Update browser URL query param silently without full page reload
    window.history.pushState(null, '', `/app/dashboard?tab=${tabName}`);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex font-sans text-slate-800 antialiased selection:bg-teal-sedang selection:text-white">
      {/* Sidebar - Fixed Left (Premium Dark Glassmorphic Sidebar) */}
      <aside className="w-64 bg-[#092430] text-[#F6F1E6] flex flex-col justify-between hidden md:flex shrink-0 border-r border-[#194A5B]/30 shadow-xl relative z-30">
        <div>
          {/* Logo & Branding Area */}
          <div className="p-6 border-b border-[#194A5B]/35 bg-[#071d26]/40">
            <div className="flex items-center gap-2.5">
              <div className="h-8.5 w-8.5 rounded-xl bg-gradient-to-br from-[#194A5B] to-[#407F8F] flex items-center justify-center text-[#F6F1E6] font-bold text-sm shadow-md shadow-indigo-950/40">
                K56
              </div>
              <div>
                <h2 className="text-sm font-extrabold tracking-wider text-[#F6F1E6] uppercase">SISDAMAS 56</h2>
                <p className="text-[9px] text-slate-400 font-semibold tracking-wide mt-0.5">Desa Sukahaji • Dusun 2</p>
              </div>
            </div>
          </div>

          {/* Navigation Links with Active Borders and Transitions */}
          <nav className="p-4 space-y-1.5">
            <span className="text-[9px] font-extrabold text-[#D9CBB0] uppercase tracking-widest pl-3 block mb-2 opacity-60">Menu Navigasi</span>
            
            <button
              onClick={() => switchTab('dashboard')}
              className={`flex items-center gap-3.5 w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 transform hover:translate-x-1 ${
                currentTab === 'dashboard'
                  ? 'bg-gradient-to-r from-[#194A5B] to-[#407F8F] text-white shadow-md shadow-[#092430]/60 border-l-4 border-[#D9CBB0]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="h-4.5 w-4.5" /> Beranda Utama
            </button>

            <button
              onClick={() => switchTab('sticky-notes')}
              className={`flex items-center gap-3.5 w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 transform hover:translate-x-1 ${
                currentTab === 'sticky-notes'
                  ? 'bg-gradient-to-r from-[#194A5B] to-[#407F8F] text-white shadow-md shadow-[#092430]/60 border-l-4 border-[#D9CBB0]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <StickyNote className="h-4.5 w-4.5" /> Siklus 1: Rembug Warga
            </button>

            <button
              onClick={() => switchTab('siklus-2')}
              className={`flex items-center justify-between w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 transform hover:translate-x-1 ${
                currentTab === 'siklus-2'
                  ? 'bg-gradient-to-r from-[#194A5B] to-[#407F8F] text-white shadow-md shadow-[#092430]/60 border-l-4 border-[#D9CBB0]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-3.5">
                <Map className="h-4.5 w-4.5" /> Siklus 2: Pemetaan & Sensus
              </span>
              {draftCount > 0 && (
                <span className="bg-[#DFB0B3] text-[#092430] text-[9px] font-black px-2 py-0.5 rounded-full shadow-inner animate-pulse">
                  {draftCount}
                </span>
              )}
            </button>

            <button
              onClick={() => switchTab('priority')}
              className={`flex items-center gap-3.5 w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 transform hover:translate-x-1 ${
                currentTab === 'priority'
                  ? 'bg-gradient-to-r from-[#194A5B] to-[#407F8F] text-white shadow-md shadow-[#092430]/60 border-l-4 border-[#D9CBB0]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <CheckSquare className="h-4.5 w-4.5" /> Siklus 3: Klasifikasi Prioritas
            </button>

            <button
              onClick={() => switchTab('siklus-4')}
              className={`flex items-center gap-3.5 w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 transform hover:translate-x-1 ${
                currentTab === 'siklus-4'
                  ? 'bg-gradient-to-r from-[#194A5B] to-[#407F8F] text-white shadow-md shadow-[#092430]/60 border-l-4 border-[#D9CBB0]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Activity className="h-4.5 w-4.5" /> Siklus 4: Rencana & Evaluasi
            </button>

            <button
              onClick={() => switchTab('profile')}
              className={`flex items-center gap-3.5 w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 transform hover:translate-x-1 ${
                currentTab === 'profile'
                  ? 'bg-gradient-to-r from-[#194A5B] to-[#407F8F] text-white shadow-md shadow-[#092430]/60 border-l-4 border-[#D9CBB0]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="h-4.5 w-4.5" /> Profil & Pengaturan
            </button>
          </nav>
        </div>

        {/* User Session Footer Badge */}
        <div className="p-4 border-t border-[#194A5B]/35 bg-[#071d26]/20">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 border border-white/5 mb-3">
            <div className="h-7 w-7 rounded-full bg-[#D9CBB0] text-[#092430] flex items-center justify-center font-bold text-xs shadow-inner">
              F
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-black truncate text-[#F6F1E6]">Fasilitator KKN</p>
              <p className="text-[9px] text-slate-450 truncate">Kelompok 56 Sukahaji</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3.5 w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-[#DFB0B3] hover:text-white hover:bg-[#DFB0B3]/10 transition-all duration-200"
          >
            <LogOut className="h-4.5 w-4.5" /> Keluar Sesi
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Navbar (Sticky Frosted Glass) */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-8 py-4.5 flex items-center justify-between shadow-sm sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-5 w-5 text-teal-sedang md:hidden animate-pulse" />
            <h1 className="text-base font-black text-slate-850 uppercase tracking-wider font-sans">
              {currentTab === 'dashboard' && 'Beranda Analitik KKN'}
              {currentTab === 'sticky-notes' && 'Siklus 1: Rembug Warga'}
              {currentTab === 'siklus-2' && 'Siklus 2: Sensus & Pemetaan GIS'}
              {currentTab === 'priority' && 'Siklus 3: Klasifikasi Prioritas (USG)'}
              {currentTab === 'siklus-4' && 'Siklus 4: Program Kerja & Evaluasi'}
              {currentTab === 'profile' && 'Profil & Pengaturan Platform'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {currentTab === 'dashboard' && (
              <a
                href="/api/reports/excel"
                className="hidden sm:flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-xs font-bold px-4.5 py-2.5 shadow-sm shadow-emerald-700/20 transition-all duration-200"
              >
                <FileSpreadsheet className="h-4 w-4" /> Unduh Laporan Excel
              </a>
            )}
            <span className="text-[10px] font-black text-slate-500 bg-slate-100/80 border border-slate-200 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 uppercase tracking-wide">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              Koneksi Online
            </span>
          </div>
        </header>

        {/* Dynamic Inner Views */}
        <div className="p-8 max-w-[1400px] w-full mx-auto flex-1">
          {currentTab === 'dashboard' && (
            <DashboardView
              switchTab={switchTab}
              draftCount={draftCount}
              syncing={syncing}
              syncStatus={syncStatus}
              handleSyncDrafts={handleSyncDrafts}
              rtTargets={rtTargets}
              setRtTargets={setRtTargets}
            />
          )}
          {currentTab === 'sticky-notes' && <StickyNotesView />}
          {currentTab === 'siklus-2' && <Siklus2View updateDraftCount={updateDraftCount} />}
          {currentTab === 'priority' && <PriorityView />}
          {currentTab === 'siklus-4' && <Siklus4View />}
          {currentTab === 'profile' && (
            <ProfileView 
              handleLogout={handleLogout} 
              rtTargets={rtTargets} 
              setRtTargets={setRtTargets} 
            />
          )}
        </div>
      </main>
    </div>
  );
}

// -------------------------------------------------------------
// SUB-VIEW 1: Dashboard View Component (Highly Interactive Statistics with RT Targets Configuration)
// -------------------------------------------------------------
const DEFAULT_RT_TARGETS = [
  { id: '1', rw: 'RW 01', rt: 'RT 01', target_kk: 40, target_warga: 160 },
  { id: '2', rw: 'RW 01', rt: 'RT 02', target_kk: 35, target_warga: 140 },
  { id: '3', rw: 'RW 01', rt: 'RT 03', target_kk: 45, target_warga: 180 },
  { id: '4', rw: 'RW 02', rt: 'RT 01', target_kk: 30, target_warga: 120 },
  { id: '5', rw: 'RW 02', rt: 'RT 02', target_kk: 40, target_warga: 160 },
  { id: '6', rw: 'RW 02', rt: 'RT 03', target_kk: 50, target_warga: 200 },
  { id: '7', rw: 'RW 03', rt: 'RT 01', target_kk: 35, target_warga: 140 },
  { id: '8', rw: 'RW 03', rt: 'RT 02', target_kk: 35, target_warga: 140 },
  { id: '9', rw: 'RW 03', rt: 'RT 03', target_kk: 50, target_warga: 200 }
];

function DashboardView({ switchTab, draftCount, syncing, syncStatus, handleSyncDrafts, rtTargets, setRtTargets }: any) {
  const [selectedRw, setSelectedRw] = useState('All');
  const [selectedRt, setSelectedRt] = useState('All');
  const [surveys, setSurveys] = useState<any[]>([]);
  const [showTargetEditor, setShowTargetEditor] = useState(false);

  // Google Workspace Integration States
  const [syncingDrive, setSyncingDrive] = useState(false);
  const [driveSyncResult, setDriveSyncResult] = useState<any>(null);
  const [calendarTitle, setCalendarTitle] = useState('');
  const [calendarStart, setCalendarStart] = useState('');
  const [calendarEnd, setCalendarEnd] = useState('');
  const [syncingCalendar, setSyncingCalendar] = useState(false);
  const [calendarSyncResult, setCalendarSyncResult] = useState<any>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);

  // Detailed mock surveys seed matching exactly the 82 completed surveys
  useEffect(() => {
    const rawData = [];
    const statuses = ['Milik Sendiri', 'Sewa', 'Milik Keluarga', 'Numpang'];
    const conditions = ['Layak Huni', 'Tidak Layak Huni', 'Butuh Perbaikan'];
    const problemCats = ['Infrastruktur', 'Kesehatan', 'Ekonomi', 'Lingkungan', 'Pendidikan'];

    // Generate 28 KKs for RW 01
    for (let i = 1; i <= 28; i++) {
      const rtNum = `RT 0${(i % 3) + 1}`;
      rawData.push({
        id: `kk-rw1-${i}`,
        rw: 'RW 01',
        rt: rtNum,
        rt_label: `${rtNum} / RW 01`,
        family_size: 3 + (i % 4), // 3 to 6 members
        housing_status: statuses[i % statuses.length],
        housing_condition: conditions[i % conditions.length],
        problems: i % 2 === 0 ? [problemCats[i % problemCats.length]] : []
      });
    }

    // Generate 30 KKs for RW 02
    for (let i = 1; i <= 30; i++) {
      const rtNum = `RT 0${(i % 3) + 1}`;
      rawData.push({
        id: `kk-rw2-${i}`,
        rw: 'RW 02',
        rt: rtNum,
        rt_label: `${rtNum} / RW 02`,
        family_size: 4 + (i % 3), // 4 to 6 members
        housing_status: statuses[(i + 1) % statuses.length],
        housing_condition: conditions[(i + 1) % conditions.length],
        problems: i % 3 === 0 ? [problemCats[(i + 1) % problemCats.length]] : []
      });
    }

    // Generate 24 KKs for RW 03
    for (let i = 1; i <= 24; i++) {
      const rtNum = `RT 0${(i % 3) + 1}`;
      rawData.push({
        id: `kk-rw3-${i}`,
        rw: 'RW 03',
        rt: rtNum,
        rt_label: `${rtNum} / RW 03`,
        family_size: 2 + (i % 4), // 2 to 5 members
        housing_status: statuses[(i + 2) % statuses.length],
        housing_condition: conditions[(i + 2) % conditions.length],
        problems: i % 2 === 0 ? [problemCats[(i + 2) % problemCats.length]] : []
      });
    }

    // Check if there are real local storage drafts, merge them to make live counts reflect draft changes!
    const drafts = JSON.parse(localStorage.getItem('survey_drafts') || '[]');
    if (drafts.length > 0) {
      const draftSurveys = drafts.map((d: any, idx: number) => {
        const rtParts = d.rt_label.split(' / ');
        const rtNum = rtParts[0] || 'RT 01';
        const rwNum = rtParts[1] ? rtParts[1].split(' ')[0] : 'RW 01';
        return {
          id: d.client_uuid || `draft-stat-${idx}`,
          rw: rwNum,
          rt: rtNum,
          rt_label: `${rtNum} / ${rwNum}`,
          family_size: d.family_size || 4,
          housing_status: d.housing_status || 'Milik Sendiri',
          housing_condition: d.housing_condition || 'Layak Huni',
          problems: d.problems ? d.problems.map((p: any) => p.category) : []
        };
      });
      setSurveys([...rawData, ...draftSurveys]);
    } else {
      setSurveys(rawData);
    }
  }, []);

  const handleUpdateTarget = (id: string, field: 'target_kk' | 'target_warga', val: number) => {
    setRtTargets((prev: any[]) => {
      const next = prev.map((t: any) => (t.id === id ? { ...t, [field]: val } : t));
      localStorage.setItem('sukahaji_rt_targets', JSON.stringify(next));
      return next;
    });
  };

  // Filter records dynamically based on active select dropdown inputs
  const filteredSurveys = surveys.filter((s: any) => {
    const matchRw = selectedRw === 'All' || s.rw === selectedRw;
    const matchRt = selectedRt === 'All' || s.rt === selectedRt;
    return matchRw && matchRt;
  });

  // Filter targets dynamically based on active select dropdown inputs
  const filteredTargets = rtTargets.filter((t: any) => {
    const matchRw = selectedRw === 'All' || t.rw === selectedRw;
    const matchRt = selectedRt === 'All' || t.rt === selectedRt;
    return matchRw && matchRt;
  });

  const totalKK = filteredSurveys.length;
  const totalWarga = filteredSurveys.reduce((acc: number, curr: any) => acc + curr.family_size, 0);

  const totalTargetKK = filteredTargets.reduce((acc: number, curr: any) => acc + curr.target_kk, 0) || 120;
  const totalTargetWarga = filteredTargets.reduce((acc: number, curr: any) => acc + curr.target_warga, 0) || 480;

  const progressPercent = Math.round((totalKK / totalTargetKK) * 100);
  const citizensProgressPercent = Math.round((totalWarga / totalTargetWarga) * 100);

  // Compute stats breakdowns
  const getStatusCount = (status: string) => filteredSurveys.filter(s => s.housing_status === status).length;
  const getConditionCount = (cond: string) => filteredSurveys.filter(s => s.housing_condition === cond).length;
  const getProblemCount = (cat: string) => filteredSurveys.filter(s => s.problems.includes(cat)).length;
  // Google Drive & Calendar Sync Handlers
  const handleGoogleDriveSync = async () => {
    setSyncingDrive(true);
    setGoogleError(null);
    setDriveSyncResult(null);
    try {
      const res = await fetch('/api/google/drive/sync', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal sinkronisasi Drive');
      setDriveSyncResult(data);
    } catch (err: any) {
      setGoogleError(err.message);
    } finally {
      setSyncingDrive(false);
    }
  };

  const handleGoogleCalendarSync = async (e: any) => {
    e.preventDefault();
    if (!calendarTitle || !calendarStart || !calendarEnd) {
      setGoogleError('Silakan lengkapi form milestone.');
      return;
    }
    setSyncingCalendar(true);
    setGoogleError(null);
    setCalendarSyncResult(null);
    try {
      const res = await fetch('/api/google/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: calendarTitle,
          start_date: calendarStart,
          end_date: calendarEnd
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal sinkronisasi Kalender');
      setCalendarSyncResult(data);
      setCalendarTitle('');
      setCalendarStart('');
      setCalendarEnd('');
    } catch (err: any) {
      setGoogleError(err.message);
    } finally {
      setSyncingCalendar(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* LEFT COLUMN: Main Reports (col-span-2) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Welcome banner (Premium Gradient) */}
        <div className="bg-gradient-to-br from-[#092430] via-[#0f3442] to-[#194A5B] text-[#F6F1E6] rounded-2xl p-6.5 shadow-md border border-[#194A5B]/30 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-[#407F8F]/10 pointer-events-none blur-3xl rounded-full" />
          <h2 className="text-lg font-black font-sans uppercase tracking-wide text-[#F6F1E6]">Selamat Datang di Portal SISDAMAS Kelompok 56!</h2>
          <p className="mt-2 text-[#F6F1E6]/85 text-xs leading-relaxed max-w-xl">
            Fasilitator Pendamping KKN Dusun 2 Desa Sukahaji. Data di bawah terhubung secara langsung dari kuesioner wawancara lapangan dan rembug warga.
          </p>
        </div>

        {/* Main Overall Progress Widgets (Dynamic Target Comparison) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* KK Progress Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 hover:shadow-md transition-all duration-300">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Kemajuan Sensus (KK)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-800">{totalKK}</span>
              <span className="text-slate-400 text-xs font-semibold">/ {totalTargetKK} KK Sasaran Resmi</span>
            </div>
            <div className="space-y-1">
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-gradient-to-r from-teal-sedang to-kabut h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, progressPercent)}%` }} />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-500">
                <span>Wawancara Lapangan</span>
                <span className="text-teal-sedang">{progressPercent}% Terpenuhi</span>
              </div>
            </div>
          </div>

          {/* Warga/Jiwa Progress Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 hover:shadow-md transition-all duration-300">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Cakupan Populasi (Jiwa)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-800">{totalWarga}</span>
              <span className="text-slate-400 text-xs font-semibold">/ {totalTargetWarga} Jiwa Target Resmi</span>
            </div>
            <div className="space-y-1">
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-gradient-to-r from-teal-sedang to-kabut h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, citizensProgressPercent)}%` }} />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-500">
                <span>Rasio Jiwa Terdaftar</span>
                <span className="text-teal-sedang">{citizensProgressPercent}% Terpenuhi</span>
              </div>
            </div>
          </div>
        </div>

        {/* INTERACTIVE STATISTICS BOARD */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4.5">
            <div>
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Analisis Kependudukan & Sosial</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Filter data wilayah rukun tetangga/warga untuk melihat rincian secara real-time.</p>
            </div>
            
            <div className="flex gap-2">
              <div>
                <select
                  value={selectedRw}
                  onChange={(e) => {
                    setSelectedRw(e.target.value);
                    setSelectedRt('All');
                  }}
                  className="rounded-xl border border-slate-250 bg-white text-slate-900 px-3 py-1.5 text-xs outline-none focus:border-teal-sedang transition font-bold"
                >
                  <option value="All">Semua RW</option>
                  <option value="RW 01">RW 01</option>
                  <option value="RW 02">RW 02</option>
                  <option value="RW 03">RW 03</option>
                </select>
              </div>
              <div>
                <select
                  value={selectedRt}
                  onChange={(e) => setSelectedRt(e.target.value)}
                  className="rounded-xl border border-slate-250 bg-white text-slate-900 px-3 py-1.5 text-xs outline-none focus:border-teal-sedang transition font-bold"
                >
                  <option value="All">Semua RT</option>
                  <option value="RT 01">RT 01</option>
                  <option value="RT 02">RT 02</option>
                  <option value="RT 03">RT 03</option>
                </select>
              </div>
            </div>
          </div>

          {/* Live Filter Metrics Counters with colored left-borders */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 border-l-4 border-teal-sedang text-center">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">KK Terdata</span>
              <span className="text-xl font-extrabold text-slate-800 block mt-1">{totalKK}</span>
              <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Rumah Tangga</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 border-l-4 border-blue-500 text-center">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Jumlah Warga</span>
              <span className="text-xl font-extrabold text-slate-800 block mt-1">{totalWarga}</span>
              <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Jiwa Terdata</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 border-l-4 border-amber-500 text-center">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Rata-rata Jiwa</span>
              <span className="text-xl font-extrabold text-slate-800 block mt-1">
                {totalKK > 0 ? (totalWarga / totalKK).toFixed(1) : '0.0'}
              </span>
              <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Jiwa / KK</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 border-l-4 border-red-500 text-center">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Keluhan Warga</span>
              <span className="text-xl font-extrabold text-red-600 block mt-1">
                {filteredSurveys.reduce((acc, curr) => acc + curr.problems.length, 0)}
              </span>
              <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Kasus Aktif</span>
            </div>
          </div>

          {/* Breakdown Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
            {/* 1. Status Rumah */}
            <div className="space-y-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Status Kepemilikan Rumah</span>
              <div className="space-y-2.5 text-xs">
                {['Milik Sendiri', 'Sewa', 'Milik Keluarga', 'Numpang'].map((st) => {
                  const count = getStatusCount(st);
                  const pct = totalKK > 0 ? Math.round((count / totalKK) * 100) : 0;
                  return (
                    <div key={st} className="space-y-1">
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-600">{st}</span>
                        <span className="text-slate-500">{count} KK ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1">
                        <div className="bg-teal-sedang h-1 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Kondisi Rumah */}
            <div className="space-y-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Kondisi Fisik Bangunan</span>
              <div className="space-y-2.5 text-xs">
                {['Layak Huni', 'Tidak Layak Huni', 'Butuh Perbaikan'].map((co) => {
                  const count = getConditionCount(co);
                  const pct = totalKK > 0 ? Math.round((count / totalKK) * 100) : 0;
                  return (
                    <div key={co} className="space-y-1">
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-600">{co}</span>
                        <span className="text-slate-500">{count} KK ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1">
                        <div className="bg-teal-sedang h-1 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Masalah Tertinggi */}
            <div className="space-y-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Klasifikasi Keluhan Wilayah</span>
              <div className="space-y-2.5 text-xs">
                {['Infrastruktur', 'Kesehatan', 'Ekonomi', 'Lingkungan', 'Pendidikan'].map((pr) => {
                  const count = getProblemCount(pr);
                  const pct = totalKK > 0 ? Math.round((count / totalKK) * 100) : 0;
                  return (
                    <div key={pr} className="space-y-1">
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-600">{pr}</span>
                        <span className="text-slate-500">{count} Kasus</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1">
                        <div className="bg-red-500/70 h-1 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 📅 Google Calendar Live Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">📅 Kalender Kegiatan & Timeline KKN</h3>
              <p className="text-[10px] text-slate-450 mt-0.5">Jadwal rembug warga, sensus lapangan, dan koordinasi program Desa Sukahaji.</p>
            </div>
            <span className="text-[10px] bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold border border-blue-200">
              Terhubung Otomatis
            </span>
          </div>

          <div className="w-full h-[450px] rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-50 relative">
            <iframe
              src={`https://calendar.google.com/calendar/embed?src=${encodeURIComponent(process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ID || 'primary')}&ctz=Asia%2FJakarta`}
              style={{ border: 0 }}
              className="w-full h-full absolute inset-0"
              frameBorder="0"
              scrolling="no"
            ></iframe>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Sidebar Configuration & Cycle Quick Actions (col-span-1) */}
      <div className="space-y-6">
        {/* Offline Draft Queue (Amber Alert Box) */}
        {draftCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3.5">
            <div>
              <h3 className="font-extrabold text-amber-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="h-4.5 w-4.5 text-amber-600" /> Draf Offline Terdeteksi
              </h3>
              <p className="text-xxs text-amber-700 mt-1">Anda memiliki <strong>{draftCount} data sensus</strong> yang belum disinkronisasikan ke database.</p>
            </div>
            <button
              onClick={handleSyncDrafts}
              disabled={syncing}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 text-white font-bold px-4 py-2.5 text-xs transition shadow-md shadow-amber-600/20"
            >
              <RefreshCw className={`h-4.5 w-4.5 ${syncing ? 'animate-spin' : ''}`} /> Sinkronkan Sekarang
            </button>
          </div>
        )}



        {/* ☁️ Google Workspace Integration Panel */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-2">☁️ Google Workspace Sync</span>
          
          {/* Drive Sync Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-xs">Google Drive Backup</h4>
                <p className="text-[9px] text-slate-400">Arsip data sensus & foto ke folder bersama.</p>
              </div>
              <span className="bg-teal-50 text-teal-700 text-[8px] font-bold px-2 py-0.5 rounded-full border border-teal-200">
                Online
              </span>
            </div>
            
            <button
              onClick={handleGoogleDriveSync}
              disabled={syncingDrive}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-bold py-2 text-xs transition-all cursor-pointer shadow-sm"
            >
              {syncingDrive ? 'Menyinkronkan...' : 'Cadangkan Data ke Drive'}
            </button>

            {driveSyncResult && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2.5 text-[10px] text-emerald-800 space-y-1">
                <p className="font-bold">✓ Sinkronisasi Drive Berhasil!</p>
                <p className="text-[9px] text-emerald-600">Arsip baru ditambahkan. {driveSyncResult.mocked && '(Mode Simulasi)'}</p>
                {driveSyncResult.data?.drive_link && (
                  <a href={driveSyncResult.data.drive_link} target="_blank" rel="noopener noreferrer" className="underline font-bold text-emerald-700 block mt-1 hover:text-emerald-900">
                    Buka Google Drive ↗
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Calendar Sync Section */}
          <div className="border-t border-slate-100 pt-3.5 space-y-3">
            <div>
              <h4 className="font-bold text-slate-800 text-xs">Google Calendar Timeline</h4>
              <p className="text-[9px] text-slate-450">Sinkronkan milestone program KKN.</p>
            </div>

            <form onSubmit={handleGoogleCalendarSync} className="space-y-2.5">
              <div>
                <label className="text-[8px] font-black text-slate-400 block mb-0.5 uppercase">Nama Kegiatan / Milestone</label>
                <input
                  type="text"
                  placeholder="Contoh: Rembug Warga Siklus 1"
                  value={calendarTitle}
                  onChange={(e) => setCalendarTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-2 py-1.5 text-xs outline-none focus:border-teal-sedang"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[8px] font-black text-slate-400 block mb-0.5 uppercase">Mulai</label>
                  <input
                    type="date"
                    value={calendarStart}
                    onChange={(e) => setCalendarStart(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-2 py-1.5 text-xs outline-none focus:border-teal-sedang"
                  />
                </div>
                <div>
                  <label className="text-[8px] font-black text-slate-400 block mb-0.5 uppercase">Selesai</label>
                  <input
                    type="date"
                    value={calendarEnd}
                    onChange={(e) => setCalendarEnd(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-2 py-1.5 text-xs outline-none focus:border-teal-sedang"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={syncingCalendar}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-sedang hover:bg-[#113a48] disabled:opacity-50 text-white font-bold py-2 text-xs transition-all cursor-pointer shadow-sm"
              >
                {syncingCalendar ? 'Mengirim...' : 'Kirim ke Google Calendar'}
              </button>
            </form>

            {calendarSyncResult && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2.5 text-[10px] text-emerald-800 space-y-1">
                <p className="font-bold">✓ Event Ditambahkan!</p>
                <p className="text-[9px] text-emerald-600">Terdaftar di Google Calendar. {calendarSyncResult.mocked && '(Mode Simulasi)'}</p>
                {calendarSyncResult.data?.html_link && (
                  <a href={calendarSyncResult.data.html_link} target="_blank" rel="noopener noreferrer" className="underline font-bold text-emerald-700 block mt-1 hover:text-emerald-900">
                    Buka Google Calendar ↗
                  </a>
                )}
              </div>
            )}
          </div>

          {googleError && (
            <div className="bg-red-50 border border-red-100 text-red-750 text-[10px] rounded-xl p-2.5 font-bold">
              ⚠ Error: {googleError}
            </div>
          )}
        </div>

        {/* Premium Quick Navigation Sidebar Column */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3.5">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-2">Akses Cepat Siklus</span>
          
          <div className="space-y-2.5">
            {/* Quick Item 1 */}
            <div
              onClick={() => switchTab('sticky-notes')}
              className="p-3 bg-slate-50 hover:bg-teal-sedang/5 hover:border-teal-sedang/30 rounded-xl border border-slate-200/60 cursor-pointer transition-all duration-200 flex items-center gap-3.5"
            >
              <div className="p-2.5 bg-amber-50 rounded-lg text-amber-600">
                <StickyNote className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-xs">Sticky Notes (Siklus 1)</h4>
                <p className="text-[9px] text-slate-450 mt-0.5">Pendataan rembug offline.</p>
              </div>
            </div>

            {/* Quick Item 2 */}
            <div
              onClick={() => switchTab('surveys-new')}
              className="p-3 bg-slate-50 hover:bg-teal-sedang/5 hover:border-teal-sedang/30 rounded-xl border border-slate-200/60 cursor-pointer transition-all duration-200 flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-[#F6F1E6] rounded-lg text-teal-sedang">
                  <PlusCircle className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs">Isi Sensus (Siklus 2)</h4>
                  <p className="text-[9px] text-slate-450 mt-0.5">Kuesioner kependudukan.</p>
                </div>
              </div>
              {draftCount > 0 && (
                <span className="bg-[#DFB0B3] text-[#092430] text-[9px] font-black px-2 py-0.5 rounded-full shadow-inner">{draftCount}</span>
              )}
            </div>

            {/* Quick Item 3 */}
            <div
              onClick={() => switchTab('map')}
              className="p-3 bg-slate-50 hover:bg-teal-sedang/5 hover:border-teal-sedang/30 rounded-xl border border-slate-200/60 cursor-pointer transition-all duration-200 flex items-center gap-3.5"
            >
              <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600">
                <Map className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-xs">Peta GIS Tematik</h4>
                <p className="text-[9px] text-slate-450 mt-0.5">Pemetaan spasial keluhan.</p>
              </div>
            </div>

            {/* Quick Item 4 */}
            <div
              onClick={() => switchTab('priority')}
              className="p-3 bg-slate-50 hover:bg-teal-sedang/5 hover:border-teal-sedang/30 rounded-xl border border-slate-200/60 cursor-pointer transition-all duration-200 flex items-center gap-3.5"
            >
              <div className="p-2.5 bg-purple-50 rounded-lg text-purple-600">
                <CheckSquare className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-xs">Prioritas USG (Siklus 3)</h4>
                <p className="text-[9px] text-slate-450 mt-0.5">Pembobotan prioritas program.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// SUB-VIEW 1.5: Siklus 2 View Component (Sensus & Pemetaan GIS Tabs)
// -------------------------------------------------------------
function Siklus2View({ updateDraftCount }: any) {
  const [subTab, setSubTab] = useState<'form' | 'map'>('form');

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200/80 gap-6">
        <button
          onClick={() => setSubTab('form')}
          className={`pb-3 font-bold text-xs uppercase tracking-wider relative transition cursor-pointer ${
            subTab === 'form' ? 'text-teal-sedang' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          Formulir Kuesioner Sensus
          {subTab === 'form' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-sedang rounded" />}
        </button>
        <button
          onClick={() => setSubTab('map')}
          className={`pb-3 font-bold text-xs uppercase tracking-wider relative transition cursor-pointer ${
            subTab === 'map' ? 'text-teal-sedang' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          Peta Sebaran GIS Tematik
          {subTab === 'map' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-sedang rounded" />}
        </button>
      </div>

      {subTab === 'form' ? (
        <SurveyWizardView updateDraftCount={updateDraftCount} />
      ) : (
        <MapView />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// SUB-VIEW 1.6: Siklus 4 View Component (Program Kerja & Evaluasi)
// -------------------------------------------------------------
function Siklus4View() {
  const [programs, setPrograms] = useState<any[]>([
    {
      id: '1',
      name: 'Normalisasi Selokan & Saluran Air RT 02 / RW 01',
      priorityName: 'Saluran air mampet dan berbau (Skor USG: 13)',
      pic: 'Rizki & Kelompok 56',
      status: 'In Progress',
      progress: 60,
      description: 'Pembersihan got mampet bersama warga dusun untuk mencegah demam berdarah.',
      evaluation: 'Partisipasi warga sangat tinggi, got lancar kembali.'
    },
    {
      id: '2',
      name: 'Pengadaan Drum Bak Sampah Organik & Anorganik',
      priorityName: 'Pembuangan sampah sembarangan di gang RT 03 (Skor USG: 11)',
      pic: 'Fasilitator Kelompok 56',
      status: 'Planned',
      progress: 20,
      description: 'Penyediaan 6 unit drum pemilah sampah organik dan non-organik di gang utama.',
      evaluation: 'Drum sampah dalam tahap pengecatan dan pemberian stiker edukasi.'
    }
  ]);

  const [newName, setNewName] = useState('');
  const [newPriority, setNewPriority] = useState('Masalah Infrastruktur Saluran Air');
  const [newPic, setNewPic] = useState('Kelompok 56 KKN');
  const [newStatus, setNewStatus] = useState('Planned');
  const [newProgress, setNewProgress] = useState(0);
  const [newDesc, setNewDesc] = useState('');
  const [newEval, setNewEval] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!newName) return;

    const newProg = {
      id: String(Date.now()),
      name: newName,
      priorityName: newPriority,
      pic: newPic,
      status: newStatus,
      progress: Number(newProgress) || 0,
      description: newDesc,
      evaluation: newEval
    };

    setPrograms([newProg, ...programs]);
    setNewName('');
    setNewDesc('');
    setNewEval('');
    setShowAddForm(false);
  };

  const deleteProgram = (id: string) => {
    setPrograms(programs.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-50 border border-slate-200/80 p-4 rounded-xl">
        <div>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">Tabel Rencana & Evaluasi Program KKN</h2>
          <p className="text-[10px] text-slate-450 mt-0.5">Daftar program KKN pemberdayaan masyarakat hasil siklus 1-3.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="rounded-xl bg-teal-sedang hover:bg-[#113a48] text-white text-xs font-bold px-4 py-2 cursor-pointer shadow-sm transition"
        >
          {showAddForm ? 'Batal' : '+ Tambah Program Kerja'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-extrabold text-xs text-slate-850 uppercase tracking-wider border-b border-slate-100 pb-2">Form Rencana Program Baru</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase">Nama Program Kerja</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Normalisasi Selokan Got RT 02"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2 text-xs outline-none focus:border-teal-sedang"
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase">Rujukan Masalah Prioritas (Siklus 3)</label>
                <input
                  type="text"
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2 text-xs outline-none focus:border-teal-sedang"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase">PIC / Penanggung Jawab</label>
                  <input
                    type="text"
                    value={newPic}
                    onChange={(e) => setNewPic(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2 text-xs outline-none focus:border-teal-sedang"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase">Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newProgress}
                    onChange={(e) => setNewProgress(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2 text-xs outline-none focus:border-teal-sedang"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase">Deskripsi Program</label>
                <textarea
                  rows={2}
                  placeholder="Terangkan aktivitas pelaksanaan..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2 text-xs outline-none focus:border-teal-sedang resize-none"
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase">Hasil Evaluasi / Catatan Akhir</label>
                <textarea
                  rows={2}
                  placeholder="Kelebihan, kendala, atau hasil evaluasi..."
                  value={newEval}
                  onChange={(e) => setNewEval(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2 text-xs outline-none focus:border-teal-sedang resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="rounded-xl bg-teal-sedang hover:bg-[#113a48] text-white text-xs font-bold px-6 py-2.5 shadow-md cursor-pointer transition"
            >
              Simpan Rencana Program
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {programs.map((prog) => (
          <div key={prog.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">{prog.name}</h3>
                <span className="text-[9px] font-black text-teal-650 bg-teal-50 px-2 py-0.5 rounded border border-teal-100/50 mt-1.5 inline-block">
                  Rujukan: {prog.priorityName}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                  prog.status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : prog.status === 'In Progress'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {prog.status}
                </span>
                <button
                  onClick={() => deleteProgram(prog.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-xxs">
              <div className="space-y-1">
                <span className="font-black text-slate-400 uppercase">PJ / Penanggung Jawab</span>
                <p className="font-bold text-slate-700">{prog.pic}</p>
              </div>
              <div className="space-y-1">
                <span className="font-black text-slate-400 uppercase">Deskripsi Kegiatan</span>
                <p className="text-slate-600 leading-relaxed">{prog.description || '-'}</p>
              </div>
              <div className="space-y-1">
                <span className="font-black text-slate-400 uppercase">Hasil Penilaian & Evaluasi</span>
                <p className="text-slate-650 font-semibold bg-slate-50 p-2 rounded-lg border border-slate-150/60 leading-relaxed">
                  {prog.evaluation || 'Belum ada catatan evaluasi.'}
                </p>
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <div className="flex justify-between text-[9px] font-bold text-slate-450">
                <span>Progress Pelaksanaan</span>
                <span>{prog.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-teal-sedang to-emerald-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${prog.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// SUB-VIEW 2: Sticky Notes View Component
// -------------------------------------------------------------
function StickyNotesView() {
  const [notes, setNotes] = useState<any[]>(INITIAL_MOCK_NOTES);
  const [newContent, setNewContent] = useState('');
  const [selectedColumn, setSelectedColumn] = useState<'Aspirasi' | 'Masalah' | 'Potensi' | 'Lainnya'>('Aspirasi');
  const [selectedColor, setSelectedColor] = useState('#FEF08A');
  const [rtNumber, setRtNumber] = useState('RT 01 / RW 01');
  const [authorName, setAuthorName] = useState('Anonim');

  const fetchNotes = async () => {
    try {
      const { data } = await supabase
        .from('sticky_note')
        .select('*')
        .order('created_at', { ascending: true });

      if (data && data.length > 0) {
        setNotes(data.map((d: any) => ({
          id: d.id,
          column_name: d.column_name || 'Lainnya',
          content: d.content,
          color: d.color || '#FEF08A',
          rt_number: d.rt_number || 'Umum',
          author: d.author || 'Anonim',
          created_at: d.created_at
        })));
      }
    } catch {}
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const newNote = {
      id: Math.random().toString(36).substr(2, 9),
      column_name: selectedColumn,
      content: newContent.trim(),
      color: selectedColor,
      rt_number: rtNumber,
      author: authorName,
      created_at: new Date().toISOString()
    };

    setNotes((prev) => [...prev, newNote]);
    setNewContent('');
  };

  return (
    <div className="space-y-6">
      {/* Info Banner explaining offline flow */}
      <div className="bg-amber-55 border border-amber-250 rounded-xl p-4 text-amber-800 text-xs leading-relaxed">
        <strong className="block text-amber-900 mb-1">📢 Instrumen Digitalisasi Rembug Warga Offline (Siklus 1)</strong>
        Fitur papan sticky notes digital ini berfungsi untuk mendokumentasikan aspirasi, potensi, dan keluhan yang ditulis secara fisik oleh warga di lembaran kertas offline selama rembug warga. Enumerator memasukkan catatan tersebut di bawah ini agar tersinkronisasi ke sistem USG.
      </div>

      {/* Input Form Card */}
      {/* FIX: Set text color explicitly to text-slate-900 and bg-white to ensure high contrast */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-300/60">
        <h3 className="mb-4 text-base font-bold text-slate-800">Tambah Catatan Rembug Baru</h3>
        <form onSubmit={handleAddNote} className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xxs font-semibold text-slate-500 uppercase">Isi Catatan</label>
            <input
              type="text"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Masukkan keluhan/aspirasi..."
              className="w-full rounded-lg border border-slate-300 text-slate-900 bg-white px-4 py-2.5 text-xs outline-none focus:border-transisi transition"
            />
          </div>
          <div>
            <label className="mb-1 block text-xxs font-semibold text-slate-500 uppercase">Kolom</label>
            <select
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value as any)}
              className="w-full rounded-lg border border-slate-300 text-slate-900 bg-white px-3 py-2.5 text-xs outline-none focus:border-transisi transition"
            >
              {COLUMNS.map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xxs font-semibold text-slate-500 uppercase">RT / RW</label>
            <select
              value={rtNumber}
              onChange={(e) => setRtNumber(e.target.value)}
              className="w-full rounded-lg border border-slate-300 text-slate-900 bg-white px-3 py-2.5 text-xs outline-none focus:border-transisi transition"
            >
              <option value="RT 01 / RW 01">RT 01 / RW 01</option>
              <option value="RT 02 / RW 01">RT 02 / RW 01</option>
              <option value="RT 03 / RW 01">RT 03 / RW 01</option>
              <option value="RT 01 / RW 02">RT 01 / RW 02</option>
              <option value="RT 02 / RW 02">RT 02 / RW 02</option>
              <option value="RT 03 / RW 02">RT 03 / RW 02</option>
              <option value="RT 01 / RW 03">RT 01 / RW 03</option>
              <option value="RT 02 / RW 03">RT 02 / RW 03</option>
              <option value="RT 03 / RW 03">RT 03 / RW 03</option>
            </select>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 md:col-span-4 mt-2">
            <div className="flex items-center gap-2">
              <span className="text-xxs font-semibold text-slate-500 uppercase mr-2">Warna:</span>
              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setSelectedColor(c.value)}
                    style={{ backgroundColor: c.value, border: selectedColor === c.value ? '2px solid #4F46E5' : '1px solid #CBD5E1' }}
                    className="h-6 w-14 rounded text-[10px] font-bold uppercase transition"
                  >
                    <span style={{ color: c.text }}>{c.name[0]}</span>
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-teal-sedang px-5 py-2.5 text-xs font-semibold text-white shadow hover:bg-kabut transition"
            >
              <Plus className="h-3.5 w-3.5" /> Tempel Note
            </button>
          </div>
        </form>
      </div>

      {/* Columns Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {COLUMNS.map((columnName) => {
          const colNotes = notes.filter((n) => n.column_name === columnName);
          return (
            <div key={columnName} className="flex flex-col rounded-xl bg-white p-4 shadow-sm border border-slate-300/60 min-h-[400px]">
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-800 text-sm">{columnName}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xxs font-bold text-slate-500">{colNotes.length}</span>
              </div>
              <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
                {colNotes.map((note) => (
                  <div key={note.id} style={{ backgroundColor: note.color }} className="relative rounded-lg p-3 shadow-sm border border-black/5">
                    <p className="text-xs font-medium text-slate-800 pr-5 leading-relaxed">{note.content}</p>
                    <div className="mt-3 flex items-center justify-between text-[9px] text-slate-500 border-t border-black/5 pt-1.5">
                      <span className="font-semibold">{note.rt_number}</span>
                      <span>Oleh: {note.author}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// SUB-VIEW 3: Survey Wizard View Component
// -------------------------------------------------------------
function SurveyWizardView({ switchTab, updateDraftCount }: any) {
  const [wStep, setWStep] = useState(1);
  const [kkName, setKkName] = useState('');
  const [kkNumber, setKkNumber] = useState('');
  const [selectedRt, setSelectedRt] = useState('rt000101-0000-0000-0000-000000000001');
  const [rtLabel, setRtLabel] = useState('RT 01 / RW 01 (Dusun 2)');

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [manualGps, setManualGps] = useState(false);

  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [photoLoading, setPhotoLoading] = useState(false);

  const [familySize, setFamilySize] = useState(4);
  const [housingStatus, setHousingStatus] = useState('Milik Sendiri');
  const [housingCondition, setHousingCondition] = useState('Layak Huni');
  const [welfareLevel, setWelfareLevel] = useState('Sejahtera I');
  const [educationLevel, setEducationLevel] = useState('SMA');
  const [mainJob, setMainJob] = useState('Petani');

  const [problems, setProblems] = useState<any[]>([]);
  const [newProbCat, setNewProbCat] = useState('Infrastruktur');
  const [newProbDesc, setNewProbDesc] = useState('');

  const [potentials, setPotentials] = useState<any[]>([]);
  const [newPotCat, setNewPotCat] = useState('Usaha Mikro/UMKM');
  const [newPotDesc, setNewPotDesc] = useState('');

  const [success, setSuccess] = useState('');

  const handleGetGPS = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setGpsAccuracy(pos.coords.accuracy);
        setGpsLoading(false);
      },
      () => {
        setGpsLoading(false);
        setManualGps(true);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoLoading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 450;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, 600, 450);
        setPhotoBase64(canvas.toDataURL('image/jpeg', 0.7));
        setPhotoLoading(false);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const addProblem = () => {
    if (!newProbDesc.trim()) return;
    setProblems((prev) => [...prev, { category: newProbCat, description: newProbDesc.trim() }]);
    setNewProbDesc('');
  };

  const removeProblem = (idx: number) => {
    setProblems((prev) => prev.filter((_, i) => i !== idx));
  };

  const addPotential = () => {
    if (!newPotDesc.trim()) return;
    setPotentials((prev) => [...prev, { category: newPotCat, description: newPotDesc.trim() }]);
    setNewPotDesc('');
  };

  const removePotential = (idx: number) => {
    setPotentials((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    const draft: DraftSurvey = {
      client_uuid: 'draft-' + Math.random().toString(36).substring(2, 11),
      rt_id: selectedRt,
      rt_label: rtLabel,
      kk_name: kkName,
      kk_number: kkNumber,
      latitude: latitude || -6.7275,
      longitude: longitude || 107.3789,
      gps_accuracy: gpsAccuracy || 8,
      family_size: familySize,
      housing_status: housingStatus,
      housing_condition: housingCondition,
      welfare_level: welfareLevel,
      education_level: educationLevel,
      main_job: mainJob,
      problems,
      potentials,
      photo_url: photoBase64,
      surveyor_id: 'mock-surveyor'
    };

    const existing = JSON.parse(localStorage.getItem('survey_drafts') || '[]');
    existing.push(draft);
    localStorage.setItem('survey_drafts', JSON.stringify(existing));
    
    updateDraftCount();
    setSuccess('Draf survei berhasil disimpan secara lokal!');
    setTimeout(() => {
      setSuccess('');
      switchTab('dashboard');
    }, 1500);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-300/60 p-6 shadow-sm space-y-6">
      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-polaroid border border-transisi p-3 text-xs text-green-700">
          <CheckCircle className="h-4 w-4 text-teal-sedang" />
          <span>{success}</span>
        </div>
      )}

      {wStep === 1 && (
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 text-sm">Langkah 1: Identitas Kepala Keluarga</h3>
          <div>
            <label className="mb-1 block text-xxs font-semibold text-slate-500 uppercase">Nama Kepala Keluarga *</label>
            <input
              type="text"
              value={kkName}
              onChange={(e) => setKkName(e.target.value)}
              placeholder="Contoh: Bpk. Maman Rohman"
              className="w-full rounded-lg border border-slate-300 text-slate-900 bg-white px-4 py-2 text-xs outline-none focus:border-transisi"
            />
          </div>
          <div>
            <label className="mb-1 block text-xxs font-semibold text-slate-500 uppercase">Pilih RT / RW</label>
            <select
              value={selectedRt}
              onChange={(e) => {
                setSelectedRt(e.target.value);
                setRtLabel(e.target.options[e.target.selectedIndex].text);
              }}
              className="w-full rounded-lg border border-slate-300 text-slate-900 bg-white px-3 py-2 text-xs outline-none focus:border-transisi"
            >
              <option value="rt000101-0000-0000-0000-000000000001">RT 01 / RW 01 (Dusun 2)</option>
              <option value="rt000102-0000-0000-0000-000000000002">RT 02 / RW 01 (Dusun 2)</option>
              <option value="rt000103-0000-0000-0000-000000000003">RT 03 / RW 01 (Dusun 2)</option>
              <option value="rt000201-0000-0000-0000-000000000004">RT 01 / RW 02 (Dusun 2)</option>
              <option value="rt000202-0000-0000-0000-000000000005">RT 02 / RW 02 (Dusun 2)</option>
              <option value="rt000203-0000-0000-0000-000000000006">RT 03 / RW 02 (Dusun 2)</option>
              <option value="rt000301-0000-0000-0000-000000000007">RT 01 / RW 03 (Dusun 2)</option>
              <option value="rt000302-0000-0000-0000-000000000008">RT 02 / RW 03 (Dusun 2)</option>
              <option value="rt000303-0000-0000-0000-000000000009">RT 03 / RW 03 (Dusun 2)</option>
            </select>
          </div>
          <button onClick={() => setWStep(2)} disabled={!kkName.trim()} className="rounded-lg bg-teal-sedang hover:bg-kabut text-white font-semibold px-4 py-2 text-xs flex items-center gap-1.5 ml-auto disabled:opacity-50">
            Lanjut <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {wStep === 2 && (
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 text-sm">Langkah 2: Koordinat Lokasi & Foto Rumah</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-300/60 flex flex-col justify-between space-y-3">
              <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Penentuan Tikor (Titik Koordinat)</span>
              <div className="text-xs font-semibold text-slate-650">
                {latitude ? (
                  <div className="space-y-1">
                    <p>Latitude: <code className="font-mono text-teal-tua font-bold">{latitude.toFixed(6)}</code></p>
                    <p>Longitude: <code className="font-mono text-teal-tua font-bold">{longitude?.toFixed(6)}</code></p>
                    <p>Akurasi: <span className="text-teal-sedang font-bold">{gpsAccuracy?.toFixed(1)}m</span></p>
                  </div>
                ) : (
                  <p className="text-slate-450 italic">GPS belum melakukan capture. Klik tombol di bawah.</p>
                )}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={handleGetGPS} className="rounded bg-teal-sedang hover:bg-kabut text-white text-xxs font-bold px-3 py-2 transition">
                  {gpsLoading ? 'Mencari Satelit...' : 'Ambil GPS Otomatis'}
                </button>
                <button type="button" onClick={() => { setManualGps(!manualGps); if(!latitude) { setLatitude(-6.7275); setLongitude(107.3789); } }} className="rounded border border-slate-300 text-slate-700 text-xxs font-bold px-3 py-2 hover:bg-slate-100 transition">
                  {manualGps ? 'Kunci Input Manual' : 'Input Manual'}
                </button>
              </div>
              {manualGps && (
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400">LATITUDE</label>
                    <input type="number" step="any" value={latitude || ''} onChange={(e) => setLatitude(parseFloat(e.target.value))} className="w-full text-xs rounded border border-slate-300 bg-white text-slate-900 px-2 py-1" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400">LONGITUDE</label>
                    <input type="number" step="any" value={longitude || ''} onChange={(e) => setLongitude(parseFloat(e.target.value))} className="w-full text-xs rounded border border-slate-300 bg-white text-slate-900 px-2 py-1" />
                  </div>
                </div>
              )}
            </div>

            <div className="border border-dashed border-slate-300/60 rounded-lg p-4 bg-slate-50 flex flex-col justify-center items-center text-center min-h-[160px]">
              {photoBase64 ? (
                <div className="relative group">
                  <img src={photoBase64} alt="Preview" className="max-h-36 rounded shadow-md border" />
                  <button type="button" onClick={() => setPhotoBase64('')} className="absolute -top-2 -right-2 bg-red-650 text-white rounded-full p-1 text-xxs font-bold">Hapus</button>
                </div>
              ) : (
                <label className="cursor-pointer bg-teal-sedang text-white text-xxs font-bold px-4 py-2.5 rounded-lg inline-block shadow hover:bg-kabut transition">
                  {photoLoading ? 'Menyusutkan Ukuran...' : 'Buka Kamera / Upload'}
                  <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setWStep(1)} className="rounded border border-slate-300/60 px-4 py-2 text-xs hover:bg-slate-50 transition">Kembali</button>
            <button onClick={() => setWStep(3)} disabled={!latitude || !photoBase64} className="rounded bg-teal-sedang hover:bg-kabut text-white px-4 py-2 text-xs disabled:opacity-50 transition">Lanjut</button>
          </div>
        </div>
      )}

      {wStep === 3 && (
        <div className="space-y-6">
          <h3 className="font-bold text-slate-800 text-sm">Langkah 3: Kuisioner Sosial & Masalah Partisipatif</h3>
          
          {/* Socio Demographics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-100 pb-4">
            <div>
              <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Jumlah Jiwa (Anggota Keluarga)</label>
              <input type="number" value={familySize} onChange={(e) => setFamilySize(parseInt(e.target.value) || 1)} className="w-full rounded border border-slate-300 text-slate-900 bg-white px-3 py-2 text-xs" />
            </div>
            <div>
              <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Pendidikan Terakhir Kepala Keluarga</label>
              <select value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)} className="w-full rounded border border-slate-300 text-slate-900 bg-white px-2.5 py-2 text-xs">
                <option value="SD">SD / Sederajat</option>
                <option value="SMP">SMP / Sederajat</option>
                <option value="SMA">SMA / Sederajat</option>
                <option value="Perguruan Tinggi">Perguruan Tinggi (D3/S1/S2)</option>
                <option value="Tidak Sekolah">Tidak Sekolah</option>
              </select>
            </div>
            <div>
              <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Mata Pencaharian Utama</label>
              <select value={mainJob} onChange={(e) => setMainJob(e.target.value)} className="w-full rounded border border-slate-300 text-slate-900 bg-white px-2.5 py-2 text-xs">
                <option value="Petani">Petani / Pekebun</option>
                <option value="Buruh Harian">Buruh Harian Lepas</option>
                <option value="Pedagang">Pedagang / Warung</option>
                <option value="Pegawai Swasta/PNS">Pegawai Swasta / PNS</option>
                <option value="Wiraswasta">Wiraswasta / UMKM</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-100 pb-4">
            <div>
              <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Tingkat Kesejahteraan</label>
              <select value={welfareLevel} onChange={(e) => setWelfareLevel(e.target.value)} className="w-full rounded border border-slate-300 text-slate-900 bg-white px-2.5 py-2 text-xs">
                <option value="Prasejahtera">Sangat Prasejahtera</option>
                <option value="Sejahtera I">Prasejahtera (Menengah Bawah)</option>
                <option value="Sejahtera II">Sejahtera (Menengah)</option>
                <option value="Sejahtera III">Keluarga Mampu</option>
              </select>
            </div>
            <div>
              <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Status Kepemilikan Rumah</label>
              <select value={housingStatus} onChange={(e) => setHousingStatus(e.target.value)} className="w-full rounded border border-slate-300 text-slate-900 bg-white px-2.5 py-2 text-xs">
                <option value="Milik Sendiri">Milik Sendiri</option>
                <option value="Sewa">Sewa / Kontrak</option>
                <option value="Milik Keluarga">Milik Keluarga (Warisan/Orangtua)</option>
                <option value="Numpang">Numpang / Rumah Dinas</option>
              </select>
            </div>
            <div>
              <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Kondisi Rumah Tinggal</label>
              <select value={housingCondition} onChange={(e) => setHousingCondition(e.target.value)} className="w-full rounded border border-slate-300 text-slate-900 bg-white px-2.5 py-2 text-xs">
                <option value="Layak Huni">Layak Huni</option>
                <option value="Tidak Layak Huni">Tidak Layak Huni</option>
                <option value="Butuh Perbaikan">Butuh Perbaikan Ringan</option>
              </select>
            </div>
          </div>

          {/* Dynamic Problems Input */}
          <div className="space-y-3 border-b border-slate-100 pb-4">
            <span className="text-xxs font-extrabold text-slate-450 uppercase tracking-wider block">Keluhan / Masalah Teridentifikasi (Siklus 2)</span>
            <div className="flex gap-2">
              <select value={newProbCat} onChange={(e) => setNewProbCat(e.target.value)} className="rounded border border-slate-300 text-slate-900 bg-white px-2 py-1 text-xs">
                <option value="Infrastruktur">Infrastruktur</option>
                <option value="Kesehatan">Kesehatan</option>
                <option value="Ekonomi">Ekonomi</option>
                <option value="Lingkungan">Lingkungan</option>
                <option value="Pendidikan">Pendidikan</option>
                <option value="Sosial-Budaya">Sosial-Budaya</option>
              </select>
              <input type="text" value={newProbDesc} onChange={(e) => setNewProbDesc(e.target.value)} placeholder="Tulis keluhan spesifik rumah tangga..." className="flex-1 rounded border border-slate-300 text-slate-900 bg-white px-3 py-1 text-xs" />
              <button type="button" onClick={addProblem} className="rounded bg-teal-sedang text-white px-3 py-1 text-xs font-bold hover:bg-kabut transition">Tambah</button>
            </div>
            {problems.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {problems.map((p, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-50 text-red-700 text-xxs font-semibold border border-red-200">
                    <strong>[{p.category}]</strong> {p.description}
                    <button type="button" onClick={() => removeProblem(idx)} className="text-red-500 hover:text-red-800 font-bold ml-1">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Dynamic Potentials Input */}
          <div className="space-y-3">
            <span className="text-xxs font-extrabold text-slate-450 uppercase tracking-wider block">Potensi Teridentifikasi (Siklus 2)</span>
            <div className="flex gap-2">
              <select value={newPotCat} onChange={(e) => setNewPotCat(e.target.value)} className="rounded border border-slate-300 text-slate-900 bg-white px-2 py-1 text-xs">
                <option value="Pertanian">Pertanian</option>
                <option value="Peternakan">Peternakan</option>
                <option value="Usaha Mikro/UMKM">Usaha Mikro/UMKM</option>
                <option value="Keterampilan Khusus">Keterampilan Khusus</option>
                <option value="Lahan Kosong">Lahan Kosong</option>
              </select>
              <input type="text" value={newPotDesc} onChange={(e) => setNewPotDesc(e.target.value)} placeholder="Tulis potensi spesifik rumah tangga..." className="flex-1 rounded border border-slate-300 text-slate-900 bg-white px-3 py-1 text-xs" />
              <button type="button" onClick={addPotential} className="rounded bg-teal-sedang text-white px-3 py-1 text-xs font-bold hover:bg-kabut transition">Tambah</button>
            </div>
            {potentials.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {potentials.map((p, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 text-xxs font-semibold border border-emerald-250">
                    <strong>[{p.category}]</strong> {p.description}
                    <button type="button" onClick={() => removePotential(idx)} className="text-emerald-500 hover:text-emerald-800 font-bold ml-1">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <button onClick={() => setWStep(2)} className="rounded border border-slate-300/60 px-4 py-2 text-xs hover:bg-slate-50 transition">Kembali</button>
            <button onClick={handleSave} className="rounded bg-teal-sedang hover:bg-kabut text-white px-5 py-2.5 text-xs font-bold transition">Simpan Draf Survei</button>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// SUB-VIEW 4: Map View Component
// -------------------------------------------------------------
function MapView() {
  return (
    <div className="bg-white rounded-xl border border-slate-300/60 p-6 shadow-sm space-y-4">
      <h3 className="font-bold text-slate-800 text-sm">Distribusi Peta Spasar (Desa Sukahaji)</h3>
      <MapComponent />
    </div>
  );
}

// -------------------------------------------------------------
// SUB-VIEW 5: Priority View Component
// -------------------------------------------------------------
function PriorityView() {
  const [items, setItems] = useState<PriorityItem[]>(INITIAL_PROBLEMS);
  const [success, setSuccess] = useState(false);

  const handleScore = (id: string, field: 'urgency' | 'seriousness' | 'growth', val: number) => {
    setItems((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          const newU = field === 'urgency' ? val : item.urgency;
          const newS = field === 'seriousness' ? val : item.seriousness;
          const newG = field === 'growth' ? val : item.growth;
          return {
            ...item,
            urgency: newU,
            seriousness: newS,
            growth: newG,
            total_score: newU + newS + newG
          };
        }
        return item;
      });
      const sorted = [...updated].sort((a, b) => b.total_score - a.total_score);
      return updated.map((item) => ({
        ...item,
        rank: sorted.findIndex((s) => s.id === item.id) + 1
      }));
    });
  };

  const sortedItems = [...items].sort((a, b) => (a.rank || 9) - (b.rank || 9));

  return (
    <div className="bg-white rounded-xl border border-slate-300/60 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-bold text-slate-800 text-sm">Matriks Skoring Prioritas Kerja (USG)</h3>
        <button
          onClick={() => {
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
          }}
          className="rounded bg-teal-sedang hover:bg-kabut text-white font-semibold px-4 py-2 text-xs"
        >
          {success ? 'Tersimpan!' : 'Simpan Matrix'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-xxs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-300/60">
              <th className="px-4 py-3 text-center">Rank</th>
              <th className="px-4 py-3">Deskripsi Masalah</th>
              <th className="px-4 py-3 text-center">Urgency</th>
              <th className="px-4 py-3 text-center">Seriousness</th>
              <th className="px-4 py-3 text-center">Growth</th>
              <th className="px-4 py-3 text-center">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150 text-xs">
            {sortedItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-center font-bold text-teal-tua">{item.rank}</td>
                <td className="px-4 py-3 font-semibold text-slate-700">{item.problem_text}</td>
                {/* FIX: Ensure high contrast text colors inside form select dropdowns and text inputs */}
                <td className="px-4 py-3 text-center">
                  <select value={item.urgency} onChange={(e) => handleScore(item.id, 'urgency', parseInt(e.target.value))} className="rounded border border-slate-300 text-slate-900 bg-white px-2 py-1 text-xs">
                    {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-center">
                  <select value={item.seriousness} onChange={(e) => handleScore(item.id, 'seriousness', parseInt(e.target.value))} className="rounded border border-slate-300 text-slate-900 bg-white px-2 py-1 text-xs">
                    {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-center">
                  <select value={item.growth} onChange={(e) => handleScore(item.id, 'growth', parseInt(e.target.value))} className="rounded border border-slate-300 text-slate-900 bg-white px-2 py-1 text-xs">
                    {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-center font-extrabold text-teal-sedang">{item.total_score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// SUB-VIEW 6: Profile View Component
// -------------------------------------------------------------
function ProfileView({ handleLogout, rtTargets, setRtTargets }: any) {
  const [syncingSheets, setSyncingSheets] = useState(false);
  const [sheetsSyncResult, setSheetsSyncResult] = useState<any>(null);
  const [sheetsSyncError, setSheetsSyncError] = useState<string | null>(null);

  const handleSheetsSync = async (action: 'export' | 'import') => {
    setSyncingSheets(true);
    setSheetsSyncError(null);
    setSheetsSyncResult(null);
    try {
      const res = await fetch(`/api/google/sheets/sync?action=${action}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal melakukan sinkronisasi Google Sheets');
      setSheetsSyncResult({ ...data, actionType: action });
    } catch (err: any) {
      setSheetsSyncError(err.message);
    } finally {
      setSyncingSheets(false);
    }
  };

  const handleUpdateTargetLocal = (id: string, field: string, val: number) => {
    const updated = rtTargets.map((t: any) => t.id === id ? { ...t, [field]: val } : t);
    setRtTargets(updated);
    localStorage.setItem('sukahaji_rt_targets', JSON.stringify(updated));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Kolom Kiri: Profil Pengguna & Keluar Sesi */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3 uppercase tracking-wider">👤 Profil Fasilitator KKN</h3>
          
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-[#092430] text-[#F6F1E6] flex items-center justify-center text-2xl font-bold">
              56
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm">Fasilitator Kelompok 56</h4>
              <p className="text-[10px] text-slate-450 mt-0.5">kkn56.sukahaji@uin-djati.ac.id</p>
              <p className="text-[9px] text-teal-sedang font-bold mt-1">Dusun 2, Desa Sukahaji</p>
            </div>
          </div>

          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <h5 className="font-bold text-xs text-rose-950">Keluar dari Portal</h5>
              <p className="text-[9px] text-rose-700 mt-0.5">Keluar untuk mengunci sesi penulisan sensus secara aman.</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-xl bg-rose-600 hover:bg-rose-750 text-white font-bold px-4.5 py-2 text-xs flex items-center gap-1.5 cursor-pointer transition"
            >
              <LogOut className="h-3.5 w-3.5" /> Keluar Sesi
            </button>
          </div>
        </div>

        {/* ☁️ Bidirectional Google Sheets Sync Panel */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3 uppercase tracking-wider">📊 Sinkronisasi Dua Arah Google Sheets</h3>
          <p className="text-[10px] text-slate-450 leading-relaxed">
            Hubungkan data sensus kependudukan platform Anda langsung dengan Google Sheets. Anda dapat mengekspor data lokal ke spreadsheet, atau mengimpor data yang ditulis perangkat desa.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSheetsSync('export')}
              disabled={syncingSheets}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-bold py-2.5 text-xs transition cursor-pointer shadow-sm"
            >
              <FileSpreadsheet className="h-4 w-4" /> Ekspor ke Sheets
            </button>
            <button
              onClick={() => handleSheetsSync('import')}
              disabled={syncingSheets}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-teal-sedang hover:bg-[#113a48] disabled:opacity-50 text-white font-bold py-2.5 text-xs transition cursor-pointer shadow-sm"
            >
              <RefreshCw className={`h-4 w-4 ${syncingSheets ? 'animate-spin' : ''}`} /> Impor dari Sheets
            </button>
          </div>

          {sheetsSyncResult && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-[10px] text-emerald-800 space-y-1">
              <p className="font-bold">✓ Sinkronisasi Spreadsheet Sukses!</p>
              <p className="text-[9px] text-emerald-600">
                Aksi: {sheetsSyncResult.actionType === 'export' ? 'Ekspor Sensus' : 'Impor Sensus'} •{' '}
                {sheetsSyncResult.actionType === 'export'
                  ? `${sheetsSyncResult.data?.exported_rows} baris diekspor`
                  : `${sheetsSyncResult.data?.imported_rows} baris diimpor`}{' '}
                {sheetsSyncResult.mocked && '(Simulasi)'}
              </p>
              {sheetsSyncResult.data?.sheet_url && (
                <a
                  href={sheetsSyncResult.data.sheet_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-bold text-emerald-700 block mt-1 hover:text-emerald-900"
                >
                  Buka Google Sheets ↗
                </a>
              )}
            </div>
          )}

          {sheetsSyncError && (
            <div className="bg-rose-50 border border-rose-100 text-rose-700 text-[10px] rounded-xl p-3 font-bold">
              ⚠ Error: {sheetsSyncError}
            </div>
          )}
        </div>
      </div>

      {/* Kolom Kanan: Pengaturan Target Sensus per RT */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div>
          <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">⚙️ Pengaturan Estimasi Target RT</h3>
          <p className="text-[10px] text-slate-450 mt-0.5">
            Sesuaikan target KK dan Jiwa resmi Sukahaji per RT untuk memperbarui target sensus di dashboard secara real-time.
          </p>
        </div>

        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
          {rtTargets && rtTargets.map((target: any) => (
            <div key={target.id} className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-xl flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-800 border-b border-slate-200/50 pb-1">
                {target.rt} / {target.rw}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[8px] font-black text-slate-400 block mb-0.5 uppercase">Target KK</label>
                  <input
                    type="number"
                    value={target.target_kk}
                    onChange={(e) => handleUpdateTargetLocal(target.id, 'target_kk', parseInt(e.target.value) || 0)}
                    className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-2 py-1 text-xs outline-none focus:border-teal-sedang"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-[8px] font-black text-slate-400 block mb-0.5 uppercase">Target Warga</label>
                  <input
                    type="number"
                    value={target.target_warga}
                    onChange={(e) => handleUpdateTargetLocal(target.id, 'target_warga', parseInt(e.target.value) || 0)}
                    className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-2 py-1 text-xs outline-none focus:border-teal-sedang"
                    min="0"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// CONSTANTS & STATIC MOCK DATA
// -------------------------------------------------------------
const COLUMNS = ['Aspirasi', 'Masalah', 'Potensi', 'Lainnya'];

const COLORS = [
  { name: 'Kuning', value: '#FEF08A', text: '#713F12' },
  { name: 'Biru', value: '#BFDBFE', text: '#1E3A8A' },
  { name: 'Hijau', value: '#BBF7D0', text: '#14532D' },
  { name: 'Merah Muda', value: '#FBCFE8', text: '#831843' }
];

const INITIAL_MOCK_NOTES = [
  { id: 'mock-1', column_name: 'Masalah', content: 'Kurang fasilitas bak sampah terpusat di lingkungan RT 02', color: '#FEF08A', rt_number: 'RT 02 / RW 01', author: 'Andi', created_at: new Date().toISOString() },
  { id: 'mock-2', column_name: 'Potensi', content: 'Kerajinan anyaman bambu warga RT 01 dapat dikembangkan sebagai UMKM unggulan', color: '#BBF7D0', rt_number: 'RT 01 / RW 02', author: 'Siti', created_at: new Date().toISOString() },
  { id: 'mock-3', column_name: 'Aspirasi', content: 'Warga menginginkan adanya pelatihan posyandu lansia bulanan', color: '#BFDBFE', rt_number: 'RT 03 / RW 01', author: 'Budi', created_at: new Date().toISOString() }
];

const INITIAL_PROBLEMS = [
  { id: 'prob-1', problem_text: 'Jalan gang RW 02 rusak parah dan tergenang lumpur saat hujan', category: 'Infrastruktur', rt_label: 'RT 02 / RW 02', urgency: 4, seriousness: 4, growth: 3, total_score: 11 },
  { id: 'prob-2', problem_text: 'Saluran pembuangan air RT 01 mampet memicu penumpukan sampah', category: 'Lingkungan', rt_label: 'RT 01 / RW 01', urgency: 3, seriousness: 3, growth: 4, total_score: 10 },
  { id: 'prob-3', problem_text: 'Tingkat pengangguran usia produktif tinggi akibat kurang pelatihan kerja', category: 'Ekonomi', rt_label: 'RT 03 / RW 03', urgency: 2, seriousness: 3, growth: 3, total_score: 8 }
];
