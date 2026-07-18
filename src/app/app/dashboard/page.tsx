'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LayoutDashboard, StickyNote, User, LogOut, CheckSquare, BarChart3, HelpCircle, RefreshCw, AlertCircle, PlusCircle, Map, FileSpreadsheet, Activity, ChevronRight, Save, Trash2, Camera, Navigation, AlertTriangle, CheckCircle, Plus, Info, Tag, Key, Shield, ArrowLeft, ArrowRight, BookOpen, Printer } from 'lucide-react';
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
  a_score?: number;
  b_score?: number;
  c_score?: number;
  d_score?: number;
  total_score_abcd?: number;
  rank_abcd?: number;
  potensi_uraian?: string;
  alt_mandiri?: string;
  alt_dukungan_luar?: string;
  alt_bantuan_luar?: string;
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
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Read member session from cookie
  useEffect(() => {
    const getSessionCookie = () => {
      const name = 'kkn-member-session=';
      const decodedCookie = decodeURIComponent(document.cookie);
      const ca = decodedCookie.split('; ');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        if (c.indexOf(name) === 0) {
          try {
            return JSON.parse(c.substring(name.length));
          } catch {
            return null;
          }
        }
      }
      return null;
    };
    
    const session = getSessionCookie();
    if (session) {
      setCurrentUser(session);
    } else {
      setCurrentUser({
        isMember: false,
        email: 'surveyor@sukahaji-official.id',
        name: 'Admin/DPL',
        nim: 'ADMIN56',
        prodi: 'Sistem Informasi',
        fakultas: 'Sains dan Teknologi',
        division: 'Fasilitator Utama'
      });
    }
  }, []);

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
              onClick={() => switchTab('logbook')}
              className={`flex items-center gap-3.5 w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 transform hover:translate-x-1 ${
                currentTab === 'logbook'
                  ? 'bg-gradient-to-r from-[#194A5B] to-[#407F8F] text-white shadow-md shadow-[#092430]/60 border-l-4 border-[#D9CBB0]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen className="h-4.5 w-4.5" /> Logbook Harian KKN
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
            <div className="h-7 w-7 rounded-full bg-[#D9CBB0] text-[#092430] flex items-center justify-center font-bold text-xs shadow-inner uppercase">
              {currentUser?.name ? currentUser.name.charAt(0) : 'F'}
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-black truncate text-[#F6F1E6]">{currentUser?.name || 'Fasilitator KKN'}</p>
              <p className="text-[9px] text-slate-400 truncate">{currentUser?.division || 'Kelompok 56 Sukahaji'}</p>
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
              {currentTab === 'priority' && 'Siklus 3: Klasifikasi & Skoring Prioritas'}
              {currentTab === 'logbook' && 'Buku Harian: Logbook KKN'}
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
          {currentTab === 'logbook' && <LogbookView currentUser={currentUser} />}
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
  const [programs, setPrograms] = useState<any[]>([]);
  const [success, setSuccess] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Load priority problems for linking
  const [priorityProblems, setPriorityProblems] = useState<any[]>([]);

  // Form states
  const [newName, setNewName] = useState('');
  const [newPriority, setNewPriority] = useState('');
  const [newVolume, setNewVolume] = useState('');
  const [newFrequency, setNewFrequency] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [newPic, setNewPic] = useState('Kelompok 56 KKN');
  const [newStatus, setNewStatus] = useState('Planned');
  const [newProgress, setNewProgress] = useState(0);
  const [newDesc, setNewDesc] = useState('');
  const [newEval, setNewEval] = useState('');

  // Load programs & priority problems from localStorage
  useEffect(() => {
    // Priority Problems
    const savedProblems = localStorage.getItem('sukahaji_priority_items');
    if (savedProblems) {
      const parsed = JSON.parse(savedProblems);
      setPriorityProblems(parsed);
      if (parsed.length > 0) {
        setNewPriority(parsed[0].problem_text);
      }
    } else {
      setPriorityProblems(INITIAL_PROBLEMS);
      if (INITIAL_PROBLEMS.length > 0) {
        setNewPriority(INITIAL_PROBLEMS[0].problem_text);
      }
    }

    // Programs
    const savedProgs = localStorage.getItem('sukahaji_siklus4_programs');
    if (savedProgs) {
      setPrograms(JSON.parse(savedProgs));
    } else {
      const defaultProgs = [
        {
          id: '1',
          name: 'Normalisasi Selokan & Saluran Air RT 02 / RW 01',
          priorityName: 'Saluran air mampet dan berbau (Skor USG: 13)',
          volume: '150 Meter',
          frequency: '1 Kali (Kerja Bakti)',
          location: 'RT 02 / RW 01',
          target: 'Warga Dusun 2',
          budget: 'Rp 450.000 (Swadaya)',
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
          volume: '6 Unit Bak',
          frequency: 'Penyediaan Permanen',
          location: 'RT 03 / RW 02',
          target: 'Setiap RT di Dusun 2',
          budget: 'Rp 1.200.000 (Dana Desa)',
          pic: 'Fasilitator Kelompok 56',
          status: 'Planned',
          progress: 20,
          description: 'Penyediaan 6 unit drum pemilah sampah organik dan non-organik di gang utama.',
          evaluation: 'Drum sampah dalam tahap pengecatan dan pemberian stiker edukasi.'
        }
      ];
      setPrograms(defaultProgs);
      localStorage.setItem('sukahaji_siklus4_programs', JSON.stringify(defaultProgs));
    }
  }, []);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!newName) return;

    const newProg = {
      id: String(Date.now()),
      name: newName,
      priorityName: newPriority,
      volume: newVolume || '-',
      frequency: newFrequency || '-',
      location: newLocation || '-',
      target: newTarget || '-',
      budget: newBudget || '-',
      pic: newPic,
      status: newStatus,
      progress: Number(newProgress) || 0,
      description: newDesc,
      evaluation: newEval
    };

    const updated = [newProg, ...programs];
    setPrograms(updated);
    localStorage.setItem('sukahaji_siklus4_programs', JSON.stringify(updated));

    // Clear form
    setNewName('');
    setNewVolume('');
    setNewFrequency('');
    setNewLocation('');
    setNewTarget('');
    setNewBudget('');
    setNewDesc('');
    setNewEval('');
    setNewProgress(0);
    setNewStatus('Planned');
    setShowAddForm(false);
  };

  const deleteProgram = (id: string) => {
    const updated = programs.filter(p => p.id !== id);
    setPrograms(updated);
    localStorage.setItem('sukahaji_siklus4_programs', JSON.stringify(updated));
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-50 border border-slate-200/80 p-4 rounded-xl">
        <div>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">
            TABEL 3. Rencana Program Kerja & Evaluasi
          </h2>
          <p className="text-[10px] text-slate-450 mt-0.5">
            Daftar rencana kerja KKN pemberdayaan masyarakat Desa Sukahaji (klik baris untuk melihat detail progres & evaluasi).
          </p>
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
          <h3 className="font-extrabold text-xs text-slate-850 uppercase tracking-wider border-b border-slate-100 pb-2">Form Rencana Program Baru (Tabel 3)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase">Nama Kegiatan / Program Kerja</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Normalisasi Got Saluran Air RT 02"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2 text-xs outline-none focus:border-teal-sedang"
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase">Rujukan Masalah Prioritas (Siklus 3)</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white text-slate-950 px-3 py-2 text-xs outline-none focus:border-teal-sedang font-bold"
                >
                  {priorityProblems.map(p => (
                    <option key={p.id} value={p.problem_text}>{p.problem_text}</option>
                  ))}
                  {priorityProblems.length === 0 && (
                    <option value="Umum">Umum / Semua Masalah</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase">Volume</label>
                  <input
                    type="text"
                    placeholder="Contoh: 150 KK / 2 Unit"
                    value={newVolume}
                    onChange={(e) => setNewVolume(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2 text-xs outline-none focus:border-teal-sedang"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase">Frekuensi</label>
                  <input
                    type="text"
                    placeholder="Contoh: 1 kali seminggu"
                    value={newFrequency}
                    onChange={(e) => setNewFrequency(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2 text-xs outline-none focus:border-teal-sedang"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase">Lokasi Kegiatan</label>
                  <input
                    type="text"
                    placeholder="Contoh: RT 02 / RW 01"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2 text-xs outline-none focus:border-teal-sedang"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase">Sasaran Kegiatan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Ibu-ibu kader / Pemuda"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2 text-xs outline-none focus:border-teal-sedang"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase">Jumlah (Biaya/Peserta)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Rp 500.000 / 30 Orang"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2 text-xs outline-none focus:border-teal-sedang"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase">PJ (Penanggung Jawab)</label>
                  <input
                    type="text"
                    value={newPic}
                    onChange={(e) => setNewPic(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2 text-xs outline-none focus:border-teal-sedang"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white text-slate-950 px-3 py-2 text-xs outline-none focus:border-teal-sedang font-bold"
                  >
                    <option value="Planned">Planned (Direncanakan)</option>
                    <option value="In Progress">In Progress (Berjalan)</option>
                    <option value="Completed">Completed (Selesai)</option>
                  </select>
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

              <div>
                <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase">Uraian / Deskripsi Kegiatan</label>
                <textarea
                  rows={2}
                  placeholder="Terangkan detail aktivitas pelaksanaan..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2 text-xs outline-none focus:border-teal-sedang resize-none"
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase">Hasil Penilaian / Catatan Evaluasi Akhir</label>
                <textarea
                  rows={2}
                  placeholder="Kelebihan, kendala, atau evaluasi program..."
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

      {/* Tabel 3 Output */}
      <div className="bg-white rounded-xl border border-slate-300/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-300/60">
                <th className="px-4 py-3 text-center w-12">No</th>
                <th className="px-4 py-3">Kegiatan/Program</th>
                <th className="px-4 py-3 text-center">Volume</th>
                <th className="px-4 py-3 text-center">Frekuensi</th>
                <th className="px-4 py-3 text-center">Lokasi</th>
                <th className="px-4 py-3 text-center">Sasaran</th>
                <th className="px-4 py-3 text-center">Jumlah</th>
                <th className="px-4 py-3 text-center">PJ</th>
                <th className="px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 text-xs text-slate-700">
              {programs.map((prog, index) => (
                <React.Fragment key={prog.id}>
                  <tr
                    onClick={() => toggleExpand(prog.id)}
                    className="hover:bg-slate-50/50 cursor-pointer transition-all"
                  >
                    <td className="px-4 py-3 text-center font-bold text-slate-400">{index + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-extrabold text-slate-800 uppercase tracking-wide truncate max-w-xs">{prog.name}</p>
                      <span className="text-[9px] font-bold text-teal-650 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-150 mt-1 inline-block">
                        Rujukan: {prog.priorityName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold">{prog.volume}</td>
                    <td className="px-4 py-3 text-center text-slate-500 font-medium">{prog.frequency}</td>
                    <td className="px-4 py-3 text-center font-bold text-slate-700">{prog.location}</td>
                    <td className="px-4 py-3 text-center text-slate-500">{prog.target}</td>
                    <td className="px-4 py-3 text-center font-bold text-teal-tua">{prog.budget}</td>
                    <td className="px-4 py-3 text-center text-slate-600 font-semibold">{prog.pic}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteProgram(prog.id);
                        }}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                  {/* Expanded detail section */}
                  {expandedId === prog.id && (
                    <tr className="bg-slate-50/30">
                      <td colSpan={9} className="px-6 py-4 border-t border-slate-100">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xxs leading-relaxed">
                          <div className="space-y-1.5">
                            <span className="font-black text-slate-400 uppercase tracking-wider block">Status Pelaksanaan</span>
                            <div className="flex items-center gap-3">
                              <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase border ${
                                prog.status === 'Completed'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : prog.status === 'In Progress'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {prog.status}
                              </span>
                              <span className="font-bold text-slate-500">{prog.progress}% Selesai</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden max-w-xs mt-1">
                              <div
                                className="bg-gradient-to-r from-teal-sedang to-emerald-500 h-1.5 rounded-full"
                                style={{ width: `${prog.progress}%` }}
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="font-black text-slate-400 uppercase tracking-wider block">Uraian / Deskripsi Kegiatan</span>
                            <p className="text-slate-650 font-medium">{prog.description || '-'}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="font-black text-slate-400 uppercase tracking-wider block">Hasil Penilaian & Evaluasi Akhir</span>
                            <p className="text-slate-700 font-semibold bg-slate-50 p-2 rounded-lg border border-slate-200/50">
                              {prog.evaluation || 'Belum ada catatan evaluasi.'}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {programs.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400 font-medium italic">
                    Belum ada program kerja yang ditambahkan. Silakan klik tombol "+ Tambah Program Kerja".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
// CONSTANTS: KKN Group 56 Members
// -------------------------------------------------------------
const KKN_MEMBERS = [
  { nim: '1234060108', name: 'Aisyah Shofa Aini', gender: 'P', prodi: 'S1 - Ilmu Komunikasi Humas', fakultas: 'Dakwah dan Komunikasi', email: 'aisyah@sukahaji-official.id', division: 'Sekretaris (BPH)' },
  { nim: '1231030055', name: 'Arpan Maulana', gender: 'L', prodi: 'S1 - Ilmu Al-Qur\'an dan Tafsir', fakultas: 'Ushuluddin', email: 'arpan@sukahaji-official.id', division: 'Ketua (BPH)' },
  { nim: '1237010003', name: 'Tifa Astrianti', gender: 'P', prodi: 'S1 - Matematika', fakultas: 'Sains dan Teknologi', email: 'tifa@sukahaji-official.id', division: 'Bendahara (BPH)' },
  { nim: '1235060059', name: 'Hani Husnul Nuwat', gender: 'P', prodi: 'S1 - Ilmu Perpustakaan dan Informasi Islam', fakultas: 'Adab dan Humaniora', email: 'hani@sukahaji-official.id', division: 'Divisi Acara' },
  { nim: '1232040021', name: 'Indah Sri Rahayu', gender: 'P', prodi: 'S1 - Pendidikan Bahasa Inggris', fakultas: 'Tarbiyah dan Keguruan', email: 'indah@sukahaji-official.id', division: 'Divisi Acara' },
  { nim: '1232050026', name: 'Hasna Khairinisa Asy Syifa', gender: 'P', prodi: 'S1 - Pendidikan Matematika', fakultas: 'Tarbiyah dan Keguruan', email: 'hasna@sukahaji-official.id', division: 'Divisi Acara' },
  { nim: '1238010111', name: 'Ilya Hanifah Hakim', gender: 'P', prodi: 'S1 - Administrasi Publik', fakultas: 'Ilmu Sosial dan Ilmu Politik', email: 'ilya@sukahaji-official.id', division: 'Divisi Media' },
  { nim: '1239230099', name: 'Evan Fadhil Al Akbar', gender: 'L', prodi: 'S1 - Manajemen Keuangan Syariah', fakultas: 'Ekonomi dan Bisnis Islam', email: 'evan@sukahaji-official.id', division: 'Divisi Media' },
  { nim: '1235020162', name: 'Hilya Izza Fitriani', gender: 'P', prodi: 'S1 - Bahasa dan Sastra Arab', fakultas: 'Adab dan Humaniora', email: 'hilya@sukahaji-official.id', division: 'Divisi Media' },
  { nim: '1239240038', name: 'Kayyis Yasra Ismaya', gender: 'P', prodi: 'S1 - Manajemen (FEBI)', fakultas: 'Ekonomi dan Bisnis Islam', email: 'kayyis@sukahaji-official.id', division: 'Divisi Humas' },
  { nim: '1237030018', name: 'Fahry Rizky Samsudin', gender: 'L', prodi: 'S1 - Fisika', fakultas: 'Sains dan Teknologi', email: 'fahri@sukahaji-official.id', division: 'Divisi Humas' },
  { nim: '1236000005', name: 'Nova Aulia Rahmawan', gender: 'P', prodi: 'S1 - Psikologi', fakultas: 'Psikologi', email: 'nova@sukahaji-official.id', division: 'Divisi Logsum' },
  { nim: '1232090080', name: 'Nurdin', gender: 'L', prodi: 'S1 - Pendidikan Guru Madrasah Ibtidaiyah', fakultas: 'Tarbiyah dan Keguruan', email: 'nurdin@sukahaji-official.id', division: 'Divisi Logsum' },
  { nim: '1231040133', name: 'Hanifah Mauludiah', gender: 'P', prodi: 'S1 - Tasawuf dan Psikoterapi', fakultas: 'Ushuluddin', email: 'hanifah@sukahaji-official.id', division: 'Divisi Logsum' },
  { nim: '1239240280', name: 'Ridwan Firmansyah', gender: 'L', prodi: 'S1 - Manajemen (FEBI)', fakultas: 'Ekonomi dan Bisnis Islam', email: 'ridwan@sukahaji-official.id', division: 'Divisi Logsum' }
];

// -------------------------------------------------------------
// SUB-VIEW 4.5: Logbook View Component (Logbook Harian)
// -------------------------------------------------------------
function LogbookView({ currentUser }: { currentUser: any }) {
  const [activeNim, setActiveNim] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activities, setActivities] = useState<any[]>([]);
  const [success, setSuccess] = useState(false);
  const [rekap, setRekap] = useState<any[]>([]);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Form states for new activity row
  const [kegiatanText, setKegiatanText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [volumeVal, setVolumeVal] = useState<number>(1);
  const [satuanVal, setSatuanVal] = useState('kali');
  const [photoPreview, setPhotoPreview] = useState<string>('');

  // Sync activeNim with currentUser
  useEffect(() => {
    if (currentUser) {
      setActiveNim(currentUser.nim);
    }
  }, [currentUser]);

  // Load activities for activeNim and selectedDate
  useEffect(() => {
    if (!activeNim) return;
    const allLogs = JSON.parse(localStorage.getItem(`sukahaji_logbook_${activeNim}`) || '{}');
    const dayLogs = allLogs[selectedDate] || [];
    setActivities(dayLogs);
  }, [activeNim, selectedDate]);

  // Load Rekap (History)
  useEffect(() => {
    if (!activeNim) return;
    const allLogs = JSON.parse(localStorage.getItem(`sukahaji_logbook_${activeNim}`) || '{}');
    const tempRekap = Object.keys(allLogs).map(date => ({
      date,
      count: allLogs[date].length,
      status: allLogs[date].length > 0 ? 'Tersimpan' : 'Draft'
    })).sort((a, b) => b.date.localeCompare(a.date));
    setRekap(tempRekap);
  }, [activeNim, activities]);

  const handleAddRow = () => {
    if (!kegiatanText.trim() || !outputText.trim()) return;
    const newAct = {
      id: String(Date.now()),
      kegiatan: kegiatanText.trim(),
      output: outputText.trim(),
      volume: volumeVal,
      satuan: satuanVal,
      bukti_foto_url: photoPreview || '📷 default_foto.jpg'
    };
    setActivities(prev => [...prev, newAct]);
    setKegiatanText('');
    setOutputText('');
    setVolumeVal(1);
    setSatuanVal('kali');
    setPhotoPreview('');
  };

  const handleRemoveRow = (id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
  };

  const handleSaveLogbook = async () => {
    if (!activeNim) return;
    const allLogs = JSON.parse(localStorage.getItem(`sukahaji_logbook_${activeNim}`) || '{}');
    allLogs[selectedDate] = activities;
    localStorage.setItem(`sukahaji_logbook_${activeNim}`, JSON.stringify(allLogs));
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);

    try {
      await fetch('/api/sync/logbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nim: activeNim, logbookData: allLogs })
      });
    } catch (e) {
      console.warn("Background logbook sync failed, saved locally:", e);
    }
  };

  // Find active member details for header display
  const activeMember = KKN_MEMBERS.find(m => m.nim === activeNim) || currentUser;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">Buku Catatan Harian (Logbook KKN Digital)</h2>
            <p className="text-[10px] text-slate-450 mt-0.5">Pendokumentasian mandiri aktivitas harian mahasiswa KKN Sisdamas.</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Member switcher for Admin/DPL/Master account */}
            {currentUser?.email === 'surveyor@sukahaji-official.id' && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-450 uppercase">Pilih Anggota:</span>
                <select
                  value={activeNim}
                  onChange={(e) => setActiveNim(e.target.value)}
                  className="rounded-xl border border-slate-250 bg-white text-slate-900 px-3 py-1.5 text-xs outline-none focus:border-teal-sedang transition font-bold"
                >
                  {KKN_MEMBERS.map(m => (
                    <option key={m.nim} value={m.nim}>{m.name} ({m.division})</option>
                  ))}
                </select>
              </div>
            )}
            <button
              onClick={() => setShowPrintModal(true)}
              className="flex items-center gap-2 rounded-xl border border-slate-250 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-4 py-2 cursor-pointer shadow-sm transition"
            >
              <Printer className="h-4 w-4" /> Cetak LP2M
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xxs font-semibold text-slate-600">
          <div className="space-y-1">
            <span className="font-black text-slate-400 uppercase">Nama Peserta</span>
            <p className="font-bold text-slate-800 text-xs truncate">{activeMember?.name || '-'}</p>
          </div>
          <div className="space-y-1">
            <span className="font-black text-slate-400 uppercase">NIM / Prodi</span>
            <p className="font-bold text-slate-800 text-xs truncate">{activeMember?.nim || '-'} / {activeMember?.prodi || '-'}</p>
          </div>
          <div className="space-y-1">
            <span className="font-black text-slate-400 uppercase">Fakultas / Divisi</span>
            <p className="font-bold text-slate-850 text-xs truncate">
              {activeMember?.fakultas || '-'} / <span className="text-teal-sedang font-black">{activeMember?.division || '-'}</span>
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-black text-slate-400 uppercase">Kelompok / Lokasi KKN</span>
            <p className="font-bold text-slate-800 text-xs truncate">Kelompok 56 / Dusun 2, Desa Sukahaji</p>
          </div>
        </div>
      </div>

      {/* Date Picker & Active Logbook Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-400 uppercase">Pilih Tanggal:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="rounded-lg border border-slate-250 bg-white text-slate-900 px-3 py-1 text-xs outline-none focus:border-teal-sedang transition font-bold"
                />
              </div>
              <button
                onClick={handleSaveLogbook}
                className="rounded-xl bg-teal-sedang hover:bg-[#113a48] text-white text-xs font-bold px-5 py-2 cursor-pointer shadow-sm transition"
              >
                {success ? '✓ Berhasil Disimpan' : 'Simpan Logbook'}
              </button>
            </div>

            {/* List of current day's activities */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="px-4 py-2 text-center w-12">No</th>
                    <th className="px-4 py-2">Uraian Kegiatan</th>
                    <th className="px-4 py-2">Output Kegiatan</th>
                    <th className="px-4 py-2 text-center w-16">Vol</th>
                    <th className="px-4 py-2 text-center w-20">Satuan</th>
                    <th className="px-4 py-2 text-center">Foto Bukti</th>
                    <th className="px-4 py-2 text-center w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-xs">
                  {activities.map((act, index) => (
                    <tr key={act.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-center font-bold text-slate-400">{index + 1}</td>
                      <td className="px-4 py-3 font-semibold text-slate-700">{act.kegiatan}</td>
                      <td className="px-4 py-3 text-slate-600">{act.output}</td>
                      <td className="px-4 py-3 text-center font-bold text-teal-tua">{act.volume}</td>
                      <td className="px-4 py-3 text-center text-slate-500 font-semibold">{act.satuan}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-500 text-xxs font-bold">
                          {act.bukti_foto_url.startsWith('data:image') ? '📷 Foto Terlampir' : act.bukti_foto_url}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleRemoveRow(act.id)}
                          className="text-red-500 hover:text-red-800 font-bold hover:bg-red-50 p-1.5 rounded transition"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                  {activities.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400 font-medium italic">
                        Belum ada kegiatan yang dimasukkan untuk tanggal ini. Silakan tambahkan baris kegiatan di bawah.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Quick add activity line row */}
            <div className="bg-slate-50/70 border border-slate-200/60 p-4 rounded-xl space-y-3 pt-3">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block border-b border-slate-150 pb-1.5">
                ➕ Tambah Uraian Kegiatan Baru
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Uraian Kegiatan (misal: Rapat koordinasi RW)"
                  value={kegiatanText}
                  onChange={(e) => setKegiatanText(e.target.value)}
                  className="rounded-lg border border-slate-250 bg-white text-slate-900 px-3 py-1.5 text-xs outline-none focus:border-teal-sedang transition"
                />
                <input
                  type="text"
                  placeholder="Output Kegiatan (misal: Terbentuknya jadwal ronda)"
                  value={outputText}
                  onChange={(e) => setOutputText(e.target.value)}
                  className="rounded-lg border border-slate-250 bg-white text-slate-900 px-3 py-1.5 text-xs outline-none focus:border-teal-sedang transition"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-slate-450 uppercase">Volume:</span>
                  <input
                    type="number"
                    min="1"
                    value={volumeVal}
                    onChange={(e) => setVolumeVal(parseInt(e.target.value) || 1)}
                    className="rounded-lg border border-slate-250 bg-white text-slate-900 px-3 py-1 w-16 text-xs outline-none focus:border-teal-sedang transition text-center"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-slate-450 uppercase">Satuan:</span>
                  <select
                    value={satuanVal}
                    onChange={(e) => setSatuanVal(e.target.value)}
                    className="rounded-lg border border-slate-250 bg-white text-slate-900 px-3 py-1 text-xs outline-none focus:border-teal-sedang transition font-semibold"
                  >
                    {['kali', 'unit', 'orang', 'dokumen', 'kegiatan', 'kartu keluarga'].map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-[9px] font-bold text-slate-450 uppercase">Foto Bukti:</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setPhotoPreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="text-xxs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xxs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-1.5 text-xs transition self-end cursor-pointer shadow-sm"
                >
                  Tambah Baris
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Rekap Side Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-2">📋 Histori Pengisian Harian</span>
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
              {rekap.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(item.date)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex justify-between items-center ${
                    selectedDate === item.date
                      ? 'bg-emerald-50/50 border-emerald-300 text-emerald-800 shadow-sm'
                      : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100/50'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold font-mono">{new Date(item.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    <p className="text-[9px] text-slate-450 mt-0.5">{item.count} Kegiatan Harian</p>
                  </div>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    item.status === 'Tersimpan'
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-250'
                      : 'bg-amber-100 text-amber-700 border-amber-250'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
              {rekap.length === 0 && (
                <p className="text-xxs text-slate-400 italic text-center py-4">Belum ada histori logbook.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Print Preview Document */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-150 flex justify-between items-center bg-slate-50 rounded-t-2xl">
              <h3 className="font-extrabold text-slate-855 text-xs uppercase tracking-wider">📄 Pratinjau Dokumen Cetak LP2M KKN</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.print();
                    }
                  }}
                  className="rounded-lg bg-slate-700 hover:bg-slate-800 text-white text-xxs font-bold px-3 py-1.5 transition cursor-pointer shadow-sm"
                >
                  Cetak Browser
                </button>
                <a
                  href={`/api/export/logbook?user_id=${activeNim}&start_date=${selectedDate}&end_date=${selectedDate}&format=pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xxs font-bold px-3 py-1.5 transition cursor-pointer shadow-sm text-center flex items-center justify-center"
                >
                  Unduh PDF (Hari Ini)
                </a>
                <a
                  href={`/api/export/logbook?user_id=${activeNim}&start_date=${selectedDate}&end_date=${selectedDate}&format=docx`}
                  className="rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xxs font-bold px-3 py-1.5 transition cursor-pointer shadow-sm text-center flex items-center justify-center"
                >
                  Unduh Word (Hari Ini)
                </a>
                <a
                  href={`/api/export/logbook?user_id=${activeNim}&format=pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xxs font-bold px-3 py-1.5 transition cursor-pointer shadow-sm text-center flex items-center justify-center"
                >
                  Unduh PDF (Semua)
                </a>
                <a
                  href={`/api/export/logbook?user_id=${activeNim}&format=docx`}
                  className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xxs font-bold px-3 py-1.5 transition cursor-pointer shadow-sm text-center flex items-center justify-center"
                >
                  Unduh Word (Semua)
                </a>
                {activeNim === '1231030055' && (
                  <>
                    <a
                      href={`/api/export/logbook-kelompok?format=pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-red-600 hover:bg-red-700 text-white text-xxs font-bold px-3 py-1.5 transition cursor-pointer shadow-sm text-center flex items-center justify-center"
                    >
                      Unduh LPJ Gabungan (PDF)
                    </a>
                    <a
                      href={`/api/export/logbook-kelompok?format=docx`}
                      className="rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xxs font-bold px-3 py-1.5 transition cursor-pointer shadow-sm text-center flex items-center justify-center"
                    >
                      Unduh LPJ Gabungan (Word)
                    </a>
                  </>
                )}
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xxs font-bold px-3 py-1.5 transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Document Printable Sheet */}
            <div className="p-8 overflow-y-auto flex-1 bg-white" id="print-area">
              {/* PRINT CSS TRICK */}
              <style>{`
                @page {
                  margin: 2cm;
                }
                @media print {
                  body * {
                    visibility: hidden;
                  }
                  #print-area, #print-area * {
                    visibility: visible;
                    font-family: "Times New Roman", Times, serif !important;
                    color: #000000 !important;
                  }
                  #print-area {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    padding: 0;
                    margin: 0;
                    font-size: 12pt !important;
                  }
                  #print-area a {
                    color: #000000 !important;
                    text-decoration: none !important;
                  }
                  #print-area table {
                    border: 1px solid #000000 !important;
                    border-collapse: collapse !important;
                    width: 100% !important;
                  }
                  #print-area th, #print-area td {
                    border: 1px solid #000000 !important;
                    padding: 8px 10px !important;
                    color: #000000 !important;
                  }
                }
                /* Screen style mirroring */
                #print-area {
                  font-family: "Times New Roman", Times, serif !important;
                  color: #000000 !important;
                  font-size: 12pt !important;
                }
                #print-area * {
                  font-family: "Times New Roman", Times, serif !important;
                  color: #000000 !important;
                }
                #print-area table {
                  border: 1px solid #000000 !important;
                  border-collapse: collapse !important;
                }
                #print-area th, #print-area td {
                  border: 1px solid #000000 !important;
                  padding: 8px 10px !important;
                }
              `}</style>

              <div className="text-center space-y-1.5 pb-6 border-b-2 border-black">
                <h2 className="text-md font-bold uppercase tracking-wider">BUKU CATATAN HARIAN (LOGBOOK)</h2>
                <h2 className="text-sm font-bold uppercase tracking-wide">KULIAH KERJA NYATA (KKN) REGULER SISDAMAS</h2>
                <h3 className="text-xs font-semibold">UIN SUNAN GUNUNG DJATI BANDUNG - TAHUN AKADEMIK 2025/2026</h3>
              </div>

              {/* Identity Form */}
              <div className="grid grid-cols-2 gap-4 py-4 text-[12pt] border-b border-black text-black">
                <div className="space-y-1">
                  <p><strong>Nama Peserta:</strong> {activeMember?.name || '-'}</p>
                  <p><strong>NIM / Prodi:</strong> {activeMember?.nim || '-'} / {activeMember?.prodi || '-'}</p>
                  <p><strong>Fakultas / Divisi:</strong> {activeMember?.fakultas || '-'} / {activeMember?.division || '-'}</p>
                </div>
                <div className="space-y-1 text-right md:text-left">
                  <p><strong>Kelompok / Dusun:</strong> Kelompok 56 / Dusun 2</p>
                  <p><strong>Desa / Kecamatan:</strong> Sukahaji / Cipeundeuy</p>
                  <p><strong>Kabupaten / Provinsi:</strong> Bandung Barat / Jawa Barat</p>
                </div>
              </div>

              {/* Table Data list */}
              <div className="mt-6">
                <h4 className="text-[12pt] font-bold uppercase tracking-wider mb-2 text-black">
                  Entri Kegiatan Tanggal: {new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </h4>
                <table className="w-full border-collapse border border-black text-[12pt] text-black">
                  <thead>
                    <tr className="bg-transparent">
                      <th className="border border-black px-3 py-2 text-center w-12 font-bold">No</th>
                      <th className="border border-black px-3 py-2 text-left font-bold">Uraian Aktivitas/Kegiatan</th>
                      <th className="border border-black px-3 py-2 text-left font-bold">Output / Hasil Kegiatan</th>
                      <th className="border border-black px-3 py-2 text-center w-16 font-bold">Volume</th>
                      <th className="border border-black px-3 py-2 text-center w-20 font-bold">Satuan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((act, idx) => (
                      <tr key={act.id}>
                        <td className="border border-black px-3 py-2 text-center font-bold">{idx + 1}</td>
                        <td className="border border-black px-3 py-2">{act.kegiatan}</td>
                        <td className="border border-black px-3 py-2">{act.output}</td>
                        <td className="border border-black px-3 py-2 text-center font-bold">{act.volume}</td>
                        <td className="border border-black px-3 py-2 text-center">{act.satuan}</td>
                      </tr>
                    ))}
                    {activities.length === 0 && (
                      <tr>
                        <td colSpan={5} className="border border-black px-3 py-6 text-center italic text-black">
                          Tidak ada data kegiatan KKN untuk tanggal ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Signatures Blocks */}
              <div className="mt-12 grid grid-cols-2 gap-8 text-[12pt] text-black">
                <div>
                  <p>Bandung Barat, ........................ 2026</p>
                  <p className="font-bold">Peserta KKN,</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">{activeMember?.name}</p>
                  <p>NIM. {activeMember?.nim}</p>
                </div>
                <div className="text-right md:text-left">
                  <p>Mengetahui,</p>
                  <p className="font-bold">Ketua Kelompok 56,</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">Arpan Maulana</p>
                  <p>NIM. 1231030055</p>
                </div>
              </div>

              {/* Mengetahui DPL Block */}
              <div className="mt-12 text-center text-[12pt] border-t border-black pt-6 text-black">
                <p>Mengetahui,</p>
                <p className="font-semibold">Dosen Pembimbing Lapangan (DPL) Kelompok 56</p>
                <div className="h-16"></div>
                <p className="font-bold underline">Dr. Hj. Yani Heryani, M.Ag.</p>
                <p>NIP. 197207101998021001</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// SUB-VIEW 5: Priority View Component
// -------------------------------------------------------------
function PriorityView() {
  const [method, setMethod] = useState<'usg' | 'abcd'>('usg');
  const [items, setItems] = useState<PriorityItem[]>([]);
  const [success, setSuccess] = useState(false);
  
  // Custom problem adding
  const [newProbText, setNewProbText] = useState('');
  const [newProbCat, setNewProbCat] = useState('Infrastruktur');
  const [newProbRt, setNewProbRt] = useState('RT 01 / RW 01');

  // Load items from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sukahaji_priority_items');
    if (saved) {
      setItems(JSON.parse(saved));
    } else {
      // Map INITIAL_PROBLEMS to have default ABCD scores and alternative descriptions
      const mapped = INITIAL_PROBLEMS.map((prob: any) => ({
        ...prob,
        a_score: prob.urgency || 3,
        b_score: prob.seriousness || 3,
        c_score: prob.growth || 3,
        d_score: 3,
        total_score_abcd: (prob.urgency || 3) + (prob.seriousness || 3) + (prob.growth || 3) + 3,
        potensi_uraian: 'Swadaya gotong royong warga desa',
        alt_mandiri: 'Kerja bakti pembersihan/perbaikan mandiri',
        alt_dukungan_luar: 'Pengajuan proposal bantuan material',
        alt_bantuan_luar: 'Bantuan dinas terkait/dana desa'
      }));
      setItems(mapped);
      localStorage.setItem('sukahaji_priority_items', JSON.stringify(mapped));
    }
  }, []);

  const handleScoreUSG = (id: string, field: 'urgency' | 'seriousness' | 'growth', val: number) => {
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
      // Sort for USG ranks
      const sorted = [...updated].sort((a, b) => b.total_score - a.total_score);
      const reranked = updated.map((item) => ({
        ...item,
        rank: sorted.findIndex((s) => s.id === item.id) + 1
      }));
      localStorage.setItem('sukahaji_priority_items', JSON.stringify(reranked));
      return reranked;
    });
  };

  const handleScoreABCD = (id: string, field: 'a_score' | 'b_score' | 'c_score' | 'd_score', val: number) => {
    setItems((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          const newA = field === 'a_score' ? val : (item.a_score || 3);
          const newB = field === 'b_score' ? val : (item.b_score || 3);
          const newC = field === 'c_score' ? val : (item.c_score || 3);
          const newD = field === 'd_score' ? val : (item.d_score || 3);
          return {
            ...item,
            a_score: newA,
            b_score: newB,
            c_score: newC,
            d_score: newD,
            total_score_abcd: newA + newB + newC + newD
          };
        }
        return item;
      });
      // Sort for ABCD ranks
      const sorted = [...updated].sort((a, b) => (b.total_score_abcd || 12) - (a.total_score_abcd || 12));
      const reranked = updated.map((item) => ({
        ...item,
        rank_abcd: sorted.findIndex((s) => s.id === item.id) + 1
      }));
      localStorage.setItem('sukahaji_priority_items', JSON.stringify(reranked));
      return reranked;
    });
  };

  const handleUpdateAlternatif = (id: string, field: 'potensi_uraian' | 'alt_mandiri' | 'alt_dukungan_luar' | 'alt_bantuan_luar', val: string) => {
    setItems((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: val };
        }
        return item;
      });
      localStorage.setItem('sukahaji_priority_items', JSON.stringify(updated));
      return updated;
    });
  };

  const handleAddProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProbText.trim()) return;
    
    const newProb: PriorityItem = {
      id: `prob-custom-${Date.now()}`,
      problem_text: newProbText.trim(),
      category: newProbCat,
      rt_label: newProbRt,
      urgency: 3,
      seriousness: 3,
      growth: 3,
      total_score: 9,
      a_score: 3,
      b_score: 3,
      c_score: 3,
      d_score: 3,
      total_score_abcd: 12,
      potensi_uraian: '',
      alt_mandiri: '',
      alt_dukungan_luar: '',
      alt_bantuan_luar: ''
    };

    setItems((prev) => {
      const updated = [...prev, newProb];
      // Sort both USG and ABCD
      const sortedUSG = [...updated].sort((a, b) => b.total_score - a.total_score);
      const sortedABCD = [...updated].sort((a, b) => (b.total_score_abcd || 12) - (a.total_score_abcd || 12));
      
      const finalized = updated.map((item) => ({
        ...item,
        rank: sortedUSG.findIndex((s) => s.id === item.id) + 1,
        rank_abcd: sortedABCD.findIndex((s) => s.id === item.id) + 1
      }));
      localStorage.setItem('sukahaji_priority_items', JSON.stringify(finalized));
      return finalized;
    });

    setNewProbText('');
  };

  const handleSaveAll = () => {
    localStorage.setItem('sukahaji_priority_items', JSON.stringify(items));
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const sortedUSGItems = [...items].sort((a, b) => (a.rank || 9) - (b.rank || 9));
  const sortedABCDItems = [...items].sort((a, b) => (a.rank_abcd || 9) - (b.rank_abcd || 9));

  return (
    <div className="space-y-6">
      {/* Method selector toggle */}
      <div className="flex justify-between items-center bg-slate-50 border border-slate-200/80 p-4 rounded-xl">
        <div>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">
            Siklus 3: Klasifikasi & Prioritas Pokok Masalah
          </h2>
          <p className="text-[10px] text-slate-455 mt-0.5">
            Pilihlah metode prioritas yang ingin digunakan di bawah ini untuk menilai pokok masalah desa.
          </p>
        </div>
        <div className="flex gap-2 bg-slate-200/60 p-1 rounded-xl">
          <button
            onClick={() => setMethod('usg')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              method === 'usg' ? 'bg-white text-teal-sedang shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Metode USG
          </button>
          <button
            onClick={() => setMethod('abcd')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              method === 'abcd' ? 'bg-white text-teal-sedang shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Metode ABCD (KKN)
          </button>
        </div>
      </div>

      {method === 'usg' ? (
        <div className="bg-white rounded-xl border border-slate-300/60 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Matriks Skoring Prioritas Kerja (USG)</h3>
              <p className="text-xxs text-slate-455 mt-0.5">Urgency (U), Seriousness (S), Growth (G). Rentang nilai 1-5.</p>
            </div>
            <button
              onClick={handleSaveAll}
              className="rounded-xl bg-teal-sedang hover:bg-[#113a48] text-white font-bold px-5 py-2 text-xs transition cursor-pointer shadow-sm"
            >
              {success ? '✓ Tersimpan!' : 'Simpan Matrix'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-xxs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-300/60">
                  <th className="px-4 py-3 text-center">Rank</th>
                  <th className="px-4 py-3">Deskripsi Pokok Masalah</th>
                  <th className="px-4 py-3 text-center">Urgency</th>
                  <th className="px-4 py-3 text-center">Seriousness</th>
                  <th className="px-4 py-3 text-center">Growth</th>
                  <th className="px-4 py-3 text-center">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-xs text-slate-700">
                {sortedUSGItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-center font-bold text-teal-tua">{item.rank}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{item.problem_text} <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded ml-1 font-bold">{item.rt_label}</span></td>
                    <td className="px-4 py-3 text-center">
                      <select value={item.urgency} onChange={(e) => handleScoreUSG(item.id, 'urgency', parseInt(e.target.value))} className="rounded border border-slate-300 text-slate-900 bg-white px-2 py-1 text-xs">
                        {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select value={item.seriousness} onChange={(e) => handleScoreUSG(item.id, 'seriousness', parseInt(e.target.value))} className="rounded border border-slate-300 text-slate-900 bg-white px-2 py-1 text-xs">
                        {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select value={item.growth} onChange={(e) => handleScoreUSG(item.id, 'growth', parseInt(e.target.value))} className="rounded border border-slate-300 text-slate-900 bg-white px-2 py-1 text-xs">
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
      ) : (
        <div className="space-y-6">
          {/* TABEL 1: Skoring ABCD */}
          <div className="bg-white rounded-xl border border-slate-300/60 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">TABEL 1. Penentuan Pokok Masalah (Skoring Prioritas ABCD)</h3>
                <p className="text-xxs text-slate-455 mt-0.5">Berikan nilai 1-5 pada masing-masing kriteria. Jumlah skor = A + B + C + D.</p>
              </div>
              <button
                onClick={handleSaveAll}
                className="rounded-xl bg-teal-sedang hover:bg-[#113a48] text-white font-bold px-5 py-2 text-xs transition cursor-pointer shadow-sm"
              >
                {success ? '✓ Tersimpan!' : 'Simpan Matrix'}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-xxs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-300/60">
                    <th className="px-4 py-3 text-center w-16">Peringkat</th>
                    <th className="px-4 py-3">Pokok Masalah</th>
                    <th className="px-3 py-3 text-center">Kriteria A</th>
                    <th className="px-3 py-3 text-center">Kriteria B</th>
                    <th className="px-3 py-3 text-center">Kriteria C</th>
                    <th className="px-3 py-3 text-center">Kriteria D</th>
                    <th className="px-4 py-3 text-center">Jumlah Skor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-xs text-slate-700">
                  {sortedABCDItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-center font-bold text-teal-tua">{item.rank_abcd || 1}</td>
                      <td className="px-4 py-3 font-semibold text-slate-855">
                        {item.problem_text}
                        <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded ml-1 font-bold">{item.rt_label}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <select value={item.a_score || 3} onChange={(e) => handleScoreABCD(item.id, 'a_score', parseInt(e.target.value))} className="rounded border border-slate-300 text-slate-900 bg-white px-2 py-1 text-xs">
                          {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <select value={item.b_score || 3} onChange={(e) => handleScoreABCD(item.id, 'b_score', parseInt(e.target.value))} className="rounded border border-slate-300 text-slate-900 bg-white px-2 py-1 text-xs">
                          {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <select value={item.c_score || 3} onChange={(e) => handleScoreABCD(item.id, 'c_score', parseInt(e.target.value))} className="rounded border border-slate-300 text-slate-900 bg-white px-2 py-1 text-xs">
                          {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <select value={item.d_score || 3} onChange={(e) => handleScoreABCD(item.id, 'd_score', parseInt(e.target.value))} className="rounded border border-slate-300 text-slate-900 bg-white px-2 py-1 text-xs">
                          {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center font-extrabold text-teal-sedang">{item.total_score_abcd || 12}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Info Kriteria Penjelasan */}
            <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4 text-xxs font-semibold">
              <div className="space-y-1">
                <span className="font-bold text-teal-tua uppercase">Kriteria A</span>
                <p className="text-slate-500">Menimbulkan masalah lain bila tidak diselesaikan.</p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-teal-tua uppercase">Kriteria B</span>
                <p className="text-slate-500">Mendesak untuk segera diatasi.</p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-teal-tua uppercase">Kriteria C</span>
                <p className="text-slate-500">Menjadi kebutuhan mayoritas masyarakat desa.</p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-teal-tua uppercase">Kriteria D</span>
                <p className="text-slate-500">Memiliki potensi sumber daya masyarakat untuk diselesaikan.</p>
              </div>
            </div>
          </div>

          {/* TABEL 2: Alternatif Penyelesaian */}
          <div className="bg-white rounded-xl border border-slate-300/60 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">TABEL 2. Alternatif Penyelesaian Masalah</h3>
              <p className="text-xxs text-slate-455 mt-0.5">Uraikan potensi dan alternatif solusi berdasarkan urutan masalah prioritas (Tabel 1).</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-xxs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-300/60">
                    <th className="px-3 py-3 w-16 text-center">Rank</th>
                    <th className="px-3 py-3 w-1/4">Pokok Masalah (Prioritas)</th>
                    <th className="px-3 py-3">Uraian Potensi Penyelesaian</th>
                    <th className="px-3 py-3">1. Mandiri (Swadaya Warga)</th>
                    <th className="px-3 py-3">2. Dukungan Luar (Semi-Mandiri)</th>
                    <th className="px-3 py-3">3. Memerlukan Bantuan Luar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-xs text-slate-700">
                  {sortedABCDItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="px-3 py-3 text-center font-bold text-teal-tua">{item.rank_abcd || 1}</td>
                      <td className="px-3 py-3 font-semibold text-slate-800">
                        {item.problem_text}
                        <p className="text-[9px] text-slate-400 font-bold mt-0.5">{item.rt_label}</p>
                      </td>
                      <td className="px-2 py-2">
                        <textarea
                          rows={2}
                          value={item.potensi_uraian || ''}
                          onChange={(e) => handleUpdateAlternatif(item.id, 'potensi_uraian', e.target.value)}
                          placeholder="Potensi yang dimiliki..."
                          className="w-full rounded border border-slate-200 bg-white p-1 text-[10px] text-slate-800 outline-none focus:border-teal-sedang resize-none"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <textarea
                          rows={2}
                          value={item.alt_mandiri || ''}
                          onChange={(e) => handleUpdateAlternatif(item.id, 'alt_mandiri', e.target.value)}
                          placeholder="Solusi masyarakat..."
                          className="w-full rounded border border-slate-200 bg-white p-1 text-[10px] text-slate-800 outline-none focus:border-teal-sedang resize-none"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <textarea
                          rows={2}
                          value={item.alt_dukungan_luar || ''}
                          onChange={(e) => handleUpdateAlternatif(item.id, 'alt_dukungan_luar', e.target.value)}
                          placeholder="Bentuk dukungan..."
                          className="w-full rounded border border-slate-200 bg-white p-1 text-[10px] text-slate-800 outline-none focus:border-teal-sedang resize-none"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <textarea
                          rows={2}
                          value={item.alt_bantuan_luar || ''}
                          onChange={(e) => handleUpdateAlternatif(item.id, 'alt_bantuan_luar', e.target.value)}
                          placeholder="Bantuan instansi..."
                          className="w-full rounded border border-slate-200 bg-white p-1 text-[10px] text-slate-800 outline-none focus:border-teal-sedang resize-none"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add custom problem form */}
      <form onSubmit={handleAddProblem} className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-4">
        <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-2">
          <PlusCircle className="h-4 w-4 text-teal-sedang" /> Tambah Pokok Masalah Baru
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase">Deskripsi Pokok Masalah</label>
            <input
              type="text"
              required
              placeholder="Tulis pokok masalah yang diidentifikasi..."
              value={newProbText}
              onChange={(e) => setNewProbText(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2 text-xs outline-none focus:border-teal-sedang font-medium"
            />
          </div>
          <div>
            <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase">Kategori & RT Wilayah</label>
            <div className="flex gap-2">
              <select
                value={newProbCat}
                onChange={(e) => setNewProbCat(e.target.value)}
                className="flex-1 rounded-lg border border-slate-200 bg-white text-slate-950 px-3 py-2 text-xs outline-none focus:border-teal-sedang font-bold"
              >
                {['Infrastruktur', 'Lingkungan', 'Ekonomi', 'Kesehatan', 'Pendidikan', 'Sosial'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="RT 01 / RW 01"
                value={newProbRt}
                onChange={(e) => setNewProbRt(e.target.value)}
                className="w-24 rounded-lg border border-slate-200 bg-white text-slate-900 px-2 py-2 text-xs outline-none focus:border-teal-sedang text-center font-bold"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="rounded-xl bg-[#092430] hover:bg-[#113a48] text-white text-xs font-bold px-6 py-2.5 shadow cursor-pointer transition"
          >
            Tambah ke Matriks Skoring
          </button>
        </div>
      </form>
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
