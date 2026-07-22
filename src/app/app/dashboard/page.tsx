'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LayoutDashboard, StickyNote, User, LogOut, CheckSquare, RefreshCw, AlertCircle, PlusCircle, Map, Activity, Camera, Menu, X, BookOpen } from 'lucide-react';

import { DEFAULT_RT_TARGETS, GROUP_PALETTES } from './components/constants';
import DashboardView from './components/DashboardView';
import Siklus2View from './components/Siklus2View';
import PriorityView from './components/PriorityView';
import LogbookView from './components/LogbookView';
import Siklus4View from './components/Siklus4View';
import StickyNotesView from './components/StickyNotesView';
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
            let hasBase64 = false;
            const updatedProgs = await Promise.all(parsed.map(async (prog: any) => {
              if (prog.photo_urls && Array.isArray(prog.photo_urls)) {
                const newPhotos = await Promise.all(prog.photo_urls.map(async (p: any) => {
                  const urlStr = typeof p === 'string' ? p : (p.viewUrl || p.url || '');
                  if (typeof urlStr === 'string' && urlStr.startsWith('data:')) {
                    hasBase64 = true;
                    try {
                      const res = await fetch('/api/sync/dokumentasi-umum', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          galleryName: prog.name || 'Dokumentasi Kegiatan',
                          photos: [urlStr],
                          group: currentUser?.group || '56'
                        })
                      });
                      if (res.ok) {
                        const data = await res.json();
                        if (data.urls && data.urls.length > 0) {
                          return data.urls[0];
                        }
                      }
                    } catch (e) {
                      console.warn('Auto drive upload error:', e);
                    }
                  }
                  return p;
                }));
                return { ...prog, photo_urls: newPhotos };
              }
              return prog;
            }));

            if (hasBase64) {
              localStorage.setItem('sukahaji_siklus4_programs_v3', JSON.stringify(updatedProgs));
            }

            await fetch('/api/sync/programs', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ programs: updatedProgs })
            });
          }
        }
      } catch (err) {
        console.warn('Auto backup exception:', err);
      }
    };

    if (currentUser) {
      autoMigrateLocalStorageToCloud();
    }
  }, [currentUser]);

  const updateDraftCount = () => {
    const saved = localStorage.getItem('sukahaji_draft_surveys');
    if (saved) {
      try {
        const drafts = JSON.parse(saved);
        setDraftCount(drafts.length);
      } catch {
        setDraftCount(0);
      }
    } else {
      setDraftCount(0);
    }
  };

  const handleSyncDrafts = async () => {
    const saved = localStorage.getItem('sukahaji_draft_surveys');
    if (!saved) return;

    try {
      const drafts = JSON.parse(saved);
      if (drafts.length === 0) return;

      setSyncing(true);
      setSyncStatus(`Mengirim ${drafts.length} data survei ke server cloud...`);

      const res = await fetch('/api/surveys/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drafts })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal sinkronisasi');
      }

      localStorage.removeItem('sukahaji_draft_surveys');
      updateDraftCount();
      setSyncStatus(`✓ Berhasil mengirim ${drafts.length} data survei!`);
      setTimeout(() => setSyncStatus(''), 3000);
    } catch (err: any) {
      setSyncStatus(`⚠ Error: ${err.message}`);
      setTimeout(() => setSyncStatus(''), 4000);
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'kkn-member-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login');
  };

  const userGroup = (currentUser?.group || '56') as '55' | '56' | '57';
  const groupConfig = GROUP_PALETTES[userGroup] || GROUP_PALETTES['56'];

  const navItems = [
    { id: 'dashboard', label: 'Ringkasan Platform', icon: LayoutDashboard },
    { id: 'sticky-notes', label: 'Siklus 1: Rembug Warga', icon: StickyNote },
    { id: 'surveys-new', label: 'Siklus 2: Form & Peta GIS', icon: PlusCircle, badge: draftCount },
    { id: 'priority', label: 'Siklus 3: Prioritas USG', icon: CheckSquare },
    { id: 'siklus-4', label: 'Siklus 4: Program & Galeri', icon: Camera },
    { id: 'logbook', label: 'Logbook Harian', icon: BookOpen },
    { id: 'profile', label: 'Profil KKN', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Dynamic Header Navbar per Kelompok Theme Palette */}
      <header className={`${groupConfig.headerBg} text-white sticky top-0 z-40 shadow-xl border-b border-white/10 transition-colors duration-500`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo UIN & Group Brand */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => setCurrentTab('dashboard')} 
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="bg-white/10 p-1.5 rounded-xl border border-white/20 shadow-md group-hover:scale-105 transition">
                <img 
                  src="/logo-uin.png" 
                  alt="Logo UIN Sunan Gunung Djati" 
                  className="h-7 w-auto object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm sm:text-base tracking-tight text-white group-hover:text-teal-200 transition">
                    SISDAMAS SUKAHAJI
                  </span>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${groupConfig.badgeClass}`}>
                    KKN {userGroup}
                  </span>
                </div>
                <span className="text-[10px] text-teal-100/70 font-semibold block -mt-0.5">
                  {currentUser?.dusun || groupConfig.dusun} Desa Sukahaji
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer relative ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-md'
                      : 'text-white/80 hover:text-white hover:bg-white/15'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-1 bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-teal-100 hover:bg-white/10 transition cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {currentUser && (
              <div 
                onClick={() => setCurrentTab('profile')} 
                className="hidden sm:flex items-center gap-2 bg-white/10 border border-white/15 hover:bg-white/20 px-3 py-1.5 rounded-xl cursor-pointer transition shadow-xs"
              >
                <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center shadow-xs">
                  {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-white max-w-[110px] truncate block leading-tight">{currentUser.name}</span>
                  <span className="text-[9px] text-amber-200/90 font-semibold block leading-tight">Kelompok {userGroup}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-teal-100 hover:text-white hover:bg-red-500/20 transition cursor-pointer"
              title="Keluar Sesi"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-slate-900 px-4 py-3 space-y-1 animate-fade-in">
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
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-teal-100/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full">
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
        {(currentTab === 'surveys-new' || currentTab === 'map') && (
          <Siklus2View 
            updateDraftCount={updateDraftCount} 
            currentUser={currentUser} 
          />
        )}
        {currentTab === 'priority' && <PriorityView />}
        {currentTab === 'logbook' && <LogbookView currentUser={currentUser} />}
        {(currentTab === 'siklus-4' || currentTab === 'dokumentasi') && <Siklus4View />}
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-teal-200 text-sm font-bold">
        Memuat Platform Digital SISDAMAS...
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
