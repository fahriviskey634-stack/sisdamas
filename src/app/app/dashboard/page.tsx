'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LayoutDashboard, StickyNote, User, LogOut, CheckSquare, RefreshCw, AlertCircle, PlusCircle, Map, Activity, Camera, Menu, X, BookOpen } from 'lucide-react';

import { DEFAULT_RT_TARGETS } from './components/constants';
import DashboardView from './components/DashboardView';
import Siklus2View from './components/Siklus2View';
import SurveyWizardView from './components/SurveyWizardView';
import MapView from './components/MapView';
import PriorityView from './components/PriorityView';
import LogbookView from './components/LogbookView';
import Siklus4View from './components/Siklus4View';
import StickyNotesView from './components/StickyNotesView';
import DokumentasiGalleryView from './components/DokumentasiGalleryView';
import ProfileView from './components/ProfileView';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [draftCount, setDraftCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [rtTargets, setRtTargets] = useState<any[]>(DEFAULT_RT_TARGETS);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Read session cookie
  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    const sessionData = getCookie('kkn-member-session');
    if (sessionData) {
      try {
        const parsed = JSON.parse(decodeURIComponent(sessionData));
        setCurrentUser(parsed);
      } catch (e) {
        console.error('Failed to parse session cookie', e);
      }
    } else {
      router.push('/login');
    }

    updateDraftCount();

    const savedTargets = localStorage.getItem('sukahaji_rt_targets');
    if (savedTargets) {
      try {
        setRtTargets(JSON.parse(savedTargets));
      } catch {
        setRtTargets(DEFAULT_RT_TARGETS);
      }
    }
  }, [router]);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setCurrentTab(tabParam);
    }
  }, [searchParams]);

  // Auto-backup & auto-migrasi foto Base64 ke Google Drive
  useEffect(() => {
    const autoMigrateLocalStorageToCloud = async () => {
      try {
        // 1. Backup Siklus 1 (sticky_note)
        const localNotes = localStorage.getItem('sukahaji_sticky_notes');
        if (localNotes) {
          const parsed = JSON.parse(localNotes);
          if (parsed.length > 0) {
            await fetch('/api/sync/sticky-notes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ notes: parsed })
            });
          }
        }

        // 2. Backup Siklus 3 (priority_item)
        const localPriority = localStorage.getItem('sukahaji_priority_items_v3');
        if (localPriority) {
          const parsed = JSON.parse(localPriority);
          if (parsed.length > 0) {
            await fetch('/api/sync/priority-items', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ items: parsed })
            });
          }
        }

        // 3. Backup & Migrasi Foto Base64 Siklus 4 (program) ke Google Drive
        const localProgs = localStorage.getItem('sukahaji_siklus4_programs_v3');
        if (localProgs) {
          const parsed = JSON.parse(localProgs);
          if (parsed.length > 0) {
            let progUpdated = false;
            for (let p = 0; p < parsed.length; p++) {
              const prog = parsed[p];
              const photos = prog.photo_urls || [];
              const base64Photos = photos
                .map((u: any) => typeof u === 'string' ? u : (u.viewUrl || u.driveUrl || ''))
                .filter((url: string) => url && url.startsWith('data:'));
              
              if (base64Photos.length > 0) {
                try {
                  const driveRes = await fetch('/api/sync/program-kerja', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ photos: base64Photos, programName: prog.name })
                  });
                  if (driveRes.ok) {
                    const driveData = await driveRes.json();
                    if (driveData.urls && driveData.urls.length > 0) {
                      let driveIdx = 0;
                      prog.photo_urls = photos.map((u: any) => {
                        const raw = typeof u === 'string' ? u : (u.viewUrl || u.driveUrl || '');
                        if (raw && raw.startsWith('data:')) {
                          const newUrl = driveData.urls[driveIdx++];
                          return newUrl || u;
                        }
                        return u;
                      });
                      progUpdated = true;
                    }
                  }
                } catch (dErr) {
                  console.warn('[Auto-Migrate Drive] Error:', dErr);
                }
              }
            }

            if (progUpdated) {
              localStorage.setItem('sukahaji_siklus4_programs_v3', JSON.stringify(parsed));
            }

            await fetch('/api/sync/programs', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ programs: parsed })
            });
          }
        }

        // 4. Backup Draf Sensus
        const localDrafts = localStorage.getItem('survey_drafts');
        if (localDrafts) {
          const drafts = JSON.parse(localDrafts);
          if (drafts.length > 0) {
            await fetch('/api/surveys/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ surveys: drafts })
            });
          }
        }
      } catch (err) {
        console.warn('[Auto-Backup Cloud] Warning:', err);
      }
    };

    autoMigrateLocalStorageToCloud();
  }, []);

  const updateDraftCount = () => {
    const drafts = JSON.parse(localStorage.getItem('survey_drafts') || '[]');
    setDraftCount(drafts.length);
  };

  const handleSyncDrafts = async () => {
    const drafts = JSON.parse(localStorage.getItem('survey_drafts') || '[]');
    if (drafts.length === 0) return;

    setSyncing(true);
    setSyncStatus('Mengunggah draf ke server...');

    try {
      const res = await fetch('/api/surveys/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surveys: drafts })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.removeItem('survey_drafts');
        updateDraftCount();
        setSyncStatus(`✓ Sukses! ${data.synced_count} draf berhasil dikirim ke database.`);
        setTimeout(() => setSyncStatus(''), 4000);
      } else {
        setSyncStatus(`Gagal sync: ${data.error || 'Server error'}`);
      }
    } catch (err: any) {
      setSyncStatus(`Error koneksi: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = () => {
    document.cookie = 'kkn-member-session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
  };

  const navItems = [
    { id: 'dashboard', label: 'Ringkasan', icon: LayoutDashboard },
    { id: 'sticky-notes', label: 'Siklus 1 (Rembug)', icon: StickyNote },
    { id: 'surveys-new', label: 'Siklus 2 (Sensus)', icon: PlusCircle, badge: draftCount },
    { id: 'map', label: 'Peta GIS', icon: Map },
    { id: 'priority', label: 'Siklus 3 (Prioritas)', icon: CheckSquare },
    { id: 'logbook', label: 'Logbook Harian', icon: BookOpen },
    { id: 'siklus-4', label: 'Siklus 4 (Program)', icon: Activity },
    { id: 'dokumentasi', label: 'Galeri Foto', icon: Camera },
    { id: 'profile', label: 'Profil & Pengaturan', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 font-sans text-slate-800 antialiased selection:bg-teal-sedang selection:text-white flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#092430] border-b border-slate-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-teal-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <div 
              onClick={() => setCurrentTab('dashboard')} 
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-sedang to-teal-tua p-0.5 shadow-inner">
                <div className="w-full h-full bg-[#092430] rounded-[10px] flex items-center justify-center font-black text-teal-200 group-hover:scale-105 transition">
                  56
                </div>
              </div>
              <div>
                <h1 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                  SISDAMAS <span className="bg-teal-sedang text-[#092430] text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">K56</span>
                </h1>
                <p className="text-[10px] text-teal-200/70 font-medium">Desa Sukahaji • Dusun 2</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition duration-200 flex items-center gap-1.5 relative cursor-pointer ${
                    isActive
                      ? 'bg-teal-sedang text-white shadow-sm'
                      : 'text-teal-100/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-0.5 bg-[#DFB0B3] text-[#092430] text-[9px] font-black px-1.5 py-0.2 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User profile corner */}
          <div className="flex items-center gap-3">
            {currentUser && (
              <div 
                onClick={() => setCurrentTab('profile')} 
                className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 px-3 py-1.5 rounded-xl cursor-pointer transition"
              >
                <div className="w-6 h-6 rounded-full bg-teal-sedang text-white text-[10px] font-bold flex items-center justify-center">
                  {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                </div>
                <span className="text-xs font-bold text-teal-100 max-w-[120px] truncate">{currentUser.name}</span>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-teal-200 hover:text-white hover:bg-red-500/20 transition cursor-pointer"
              title="Keluar Sesi"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-[#092430] px-4 py-3 space-y-1 animate-fade-in">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'bg-teal-sedang text-white shadow-sm'
                      : 'text-teal-100/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-[#DFB0B3] text-[#092430] text-[9px] font-black px-2 py-0.5 rounded-full">
                      {item.badge} Draf
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            switchTab={setCurrentTab}
            draftCount={draftCount}
            syncing={syncing}
            syncStatus={syncStatus}
            handleSyncDrafts={handleSyncDrafts}
            rtTargets={rtTargets}
            setRtTargets={setRtTargets}
          />
        )}
        {currentTab === 'sticky-notes' && <StickyNotesView />}
        {currentTab === 'surveys-new' && (
          <Siklus2View 
            updateDraftCount={updateDraftCount} 
            currentUser={currentUser} 
          />
        )}
        {currentTab === 'map' && <MapView />}
        {currentTab === 'priority' && <PriorityView />}
        {currentTab === 'logbook' && <LogbookView currentUser={currentUser} />}
        {currentTab === 'siklus-4' && <Siklus4View />}
        {currentTab === 'dokumentasi' && <DokumentasiGalleryView />}
        {currentTab === 'profile' && (
          <ProfileView 
            handleLogout={handleLogout} 
            rtTargets={rtTargets} 
            setRtTargets={setRtTargets} 
          />
        )}
      </main>
    </div>
  );
}

export default function DashboardSPA() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#092430] flex items-center justify-center text-teal-200 text-sm font-bold">
        Memuat Platform SISDAMAS Kelompok 56...
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
