import React, { useState, useEffect } from 'react';
import { LayoutDashboard, StickyNote, User, CheckSquare, BarChart3, HelpCircle, RefreshCw, AlertCircle, PlusCircle, Map, FileSpreadsheet, Activity, ChevronRight, Save, Trash2, Navigation, AlertTriangle, CheckCircle, Info, Tag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { RtTarget } from './types';

export default function DashboardView({ switchTab, draftCount, syncing, syncStatus, handleSyncDrafts, rtTargets, setRtTargets }: any) {
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
  const [calendarTargetGroup, setCalendarTargetGroup] = useState<string>('56');
  const [syncingCalendar, setSyncingCalendar] = useState(false);
  const [calendarSyncResult, setCalendarSyncResult] = useState<any>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [googleCalendarId, setGoogleCalendarId] = useState<string>('primary');
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(new Date(2026, 6, 1)); // start on July 2026 (KKN timeline start)
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<Date | null>(null);

  // Group Color Coding Config for Google Calendar Events
  const GROUP_EVENT_STYLES: Record<string, { badge: string; dot: string; label: string; pillBg: string }> = {
    '55': {
      badge: 'bg-blue-950/90 border-blue-500/60 text-blue-100',
      dot: 'bg-blue-400',
      label: 'Kelompok 55 (Dusun 1)',
      pillBg: 'bg-blue-600/40 text-blue-200 border-blue-400/50'
    },
    '56': {
      badge: 'bg-teal-950/90 border-teal-500/60 text-teal-100',
      dot: 'bg-emerald-400',
      label: 'Kelompok 56 (Dusun 2)',
      pillBg: 'bg-emerald-600/40 text-emerald-200 border-emerald-400/50'
    },
    '57': {
      badge: 'bg-rose-950/90 border-rose-500/60 text-rose-100',
      dot: 'bg-rose-400',
      label: 'Kelompok 57 (Dusun 3)',
      pillBg: 'bg-rose-600/40 text-rose-200 border-rose-400/50'
    },
    'semua': {
      badge: 'bg-purple-950/90 border-purple-500/60 text-purple-100',
      dot: 'bg-amber-400',
      label: 'Semua Kelompok',
      pillBg: 'bg-amber-600/40 text-amber-200 border-amber-400/50'
    }
  };

  const getEventGroup = (evt: any): string => {
    if (evt.group) return evt.group;
    const summary = (evt.summary || '').toLowerCase();
    if (summary.includes('55') || summary.includes('dusun 1')) return '55';
    if (summary.includes('56') || summary.includes('dusun 2')) return '56';
    if (summary.includes('57') || summary.includes('dusun 3')) return '57';
    if (summary.includes('semua') || summary.includes('bersama')) return 'semua';
    return '56';
  };

  // Fetch Google Calendar ID and Events list dynamically
  useEffect(() => {
    fetch('/api/google/calendar/id')
      .then(res => res.json())
      .then(data => {
        if (data.calendarId) {
          setGoogleCalendarId(data.calendarId);
        }
      })
      .catch(err => console.error("Failed to load Calendar ID", err));

    fetch('/api/google/calendar/events')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.events) {
          setCalendarEvents(data.events);
        }
      })
      .catch(err => console.error("Failed to load Calendar events", err));
  }, []);

  // Month view calendar helpers
  const handlePrevMonth = () => {
    setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1));
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // Sunday is 0
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getEventsForDay = (day: Date | null) => {
    if (!day) return [];
    
    const year = day.getFullYear();
    const month = String(day.getMonth() + 1).padStart(2, '0');
    const dateNum = String(day.getDate()).padStart(2, '0');
    const dayStr = `${year}-${month}-${dateNum}`;
    
    return calendarEvents.filter(evt => {
      const startStr = evt.start?.date || (evt.start?.dateTime ? evt.start.dateTime.split('T')[0] : '');
      const endStr = evt.end?.date || (evt.end?.dateTime ? evt.end.dateTime.split('T')[0] : '');
      
      if (startStr && endStr) {
        if (evt.start?.date) {
          return dayStr >= startStr && dayStr < endStr;
        }
        return dayStr >= startStr && dayStr <= endStr;
      }
      return startStr === dayStr;
    });
  };

  // Load survey data from localStorage drafts only (no mock data)
  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = () => {
    const drafts = JSON.parse(localStorage.getItem('survey_drafts') || '[]');
    setSurveys(drafts);
  };

  // Filter surveys by RW/RT
  const filteredSurveys = surveys.filter(s => {
    if (selectedRw !== 'All' && s.rt_label && !s.rt_label.startsWith(selectedRw)) return false;
    if (selectedRt !== 'All' && s.rt_label && s.rt_label !== `${selectedRw} / ${selectedRt}`) return false;
    return true;
  });

  // Calculate realtime statistics from surveyed households
  const totalKk = filteredSurveys.length;
  const totalWarga = filteredSurveys.reduce((acc, curr) => acc + (Number(curr.family_size) || 0), 0);
  const totalMasalah = filteredSurveys.reduce((acc, curr) => acc + (curr.problems?.length || 0), 0);
  const totalPotensi = filteredSurveys.reduce((acc, curr) => acc + (curr.potentials?.length || 0), 0);

  // Target Editor Handlers
  const handleTargetChange = (id: string, field: 'target_kk' | 'target_warga', val: number) => {
    const next = rtTargets.map((t: RtTarget) => t.id === id ? { ...t, [field]: Math.max(1, val) } : t);
    setRtTargets(next);
    localStorage.setItem('sukahaji_rt_targets', JSON.stringify(next));
  };

  const totalTargetKk = rtTargets.reduce((acc: number, curr: RtTarget) => acc + (curr.target_kk || 0), 0);
  const totalTargetWarga = rtTargets.reduce((acc: number, curr: RtTarget) => acc + (curr.target_warga || 0), 0);
  const overallCapaianKk = totalTargetKk > 0 ? Math.min(100, Math.round((totalKk / totalTargetKk) * 100)) : 0;
  const overallCapaianWarga = totalTargetWarga > 0 ? Math.min(100, Math.round((totalWarga / totalTargetWarga) * 100)) : 0;

  // Google Workspace Operations
  const handleBackupToDrive = async () => {
    setSyncingDrive(true);
    setGoogleError(null);
    setDriveSyncResult(null);
    try {
      const res = await fetch('/api/google/drive/sync', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengarsipkan ke Google Drive');
      setDriveSyncResult(data);
    } catch (err: any) {
      setGoogleError(err.message);
    } finally {
      setSyncingDrive(false);
    }
  };

  const handleAddCalendarEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calendarTitle || !calendarStart || !calendarEnd) {
      setGoogleError('Mohon lengkapi judul, tanggal mulai, dan tanggal selesai event.');
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
          start: calendarStart,
          end: calendarEnd,
          group: calendarTargetGroup
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menambahkan event ke Google Calendar');
      setCalendarSyncResult(data);
      setCalendarTitle('');
      setCalendarStart('');
      setCalendarEnd('');
      
      fetch('/api/google/calendar/events')
        .then(res => res.json())
        .then(d => { if (d.success && d.events) setCalendarEvents(d.events); });
    } catch (err: any) {
      setGoogleError(err.message);
    } finally {
      setSyncingCalendar(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Target Customizer Modal */}
      {showTargetEditor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <Activity className="h-5 w-5 text-teal-sedang" /> Edit Target Sensus Lapangan per RT
                </h3>
                <p className="text-xs text-slate-500">Sesuaikan target KK dan warga per RT Dusun 2 (Sukahaji)</p>
              </div>
              <button 
                onClick={() => setShowTargetEditor(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold bg-slate-100 p-2 rounded-xl transition cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pr-1 space-y-2">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <th className="p-2.5 font-bold">Wilayah RT</th>
                    <th className="p-2.5 font-bold">Target KK</th>
                    <th className="p-2.5 font-bold">Target Warga (Jiwa)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rtTargets.map((item: RtTarget) => (
                    <tr key={item.id} className="hover:bg-slate-50/80">
                      <td className="p-2.5 font-bold text-slate-700">{item.rw} / {item.rt}</td>
                      <td className="p-2.5">
                        <input 
                          type="number"
                          value={item.target_kk}
                          onChange={(e) => handleTargetChange(item.id, 'target_kk', Number(e.target.value))}
                          className="w-24 px-2 py-1 border border-slate-200 rounded-lg text-xs font-semibold focus:border-teal-sedang outline-none bg-white text-slate-800"
                        />
                      </td>
                      <td className="p-2.5">
                        <input 
                          type="number"
                          value={item.target_warga}
                          onChange={(e) => handleTargetChange(item.id, 'target_warga', Number(e.target.value))}
                          className="w-28 px-2 py-1 border border-slate-200 rounded-lg text-xs font-semibold focus:border-teal-sedang outline-none bg-white text-slate-800"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-between items-center bg-slate-50/50 p-3 rounded-xl">
              <div className="text-[11px] text-slate-500">
                Total Target: <span className="font-bold text-slate-700">{totalTargetKk} KK</span> ({totalTargetWarga} Jiwa)
              </div>
              <button 
                onClick={() => setShowTargetEditor(false)}
                className="bg-teal-sedang hover:bg-[#113a48] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Simpan & Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Primary Indicator Header Card */}
      <div className="bg-gradient-to-r from-[#092430] to-[#124255] rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-200 text-xs font-bold backdrop-blur-md mb-2">
                <Activity className="h-3.5 w-3.5" /> SISDAMAS Dashboard Overview
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                Monitoring Progres Lapangan & Pemetaan Sukahaji
              </h2>
              <p className="text-xs md:text-sm text-teal-100/80 mt-1 max-w-2xl leading-relaxed">
                Wilayah Kerja: Dusun 2 (3.165 Jiwa, ~1.031 KK) | RW 01, RW 05, RW 06, RW 11 Desa Sukahaji.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowTargetEditor(true)}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-2.5 rounded-xl text-xs font-bold backdrop-blur-md transition flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Save className="h-4 w-4" /> Edit Target RT
              </button>
              {draftCount > 0 && (
                <button
                  onClick={handleSyncDrafts}
                  disabled={syncing}
                  className="bg-[#DFB0B3] hover:bg-[#d69fa2] text-[#092430] px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                  Sync Draf ({draftCount})
                </button>
              )}
            </div>
          </div>

          {/* Sync notification banner */}
          {syncStatus && (
            <div className="bg-white/15 border border-white/20 text-white text-xs px-4 py-2.5 rounded-xl backdrop-blur-md font-semibold flex items-center gap-2 animate-pulse">
              <Info className="h-4 w-4 text-teal-300 shrink-0" />
              <span>{syncStatus}</span>
            </div>
          )}

          {/* Filter Bar */}
          <div className="pt-2 flex flex-wrap items-center gap-3 border-t border-white/10">
            <span className="text-xs font-bold text-teal-200">Filter Wilayah:</span>
            <div className="flex items-center gap-2">
              <select 
                value={selectedRw}
                onChange={(e) => { setSelectedRw(e.target.value); setSelectedRt('All'); }}
                className="bg-white/10 border border-white/20 text-white text-xs rounded-xl px-3 py-1.5 outline-none font-semibold focus:bg-[#092430] cursor-pointer"
              >
                <option value="All" className="bg-[#092430] text-white">Semua RW (Dusun 2)</option>
                <option value="RW 01" className="bg-[#092430] text-white">RW 01</option>
                <option value="RW 05" className="bg-[#092430] text-white">RW 05</option>
                <option value="RW 06" className="bg-[#092430] text-white">RW 06</option>
                <option value="RW 11" className="bg-[#092430] text-white">RW 11</option>
              </select>

              {selectedRw !== 'All' && (
                <select 
                  value={selectedRt}
                  onChange={(e) => setSelectedRt(e.target.value)}
                  className="bg-white/10 border border-white/20 text-white text-xs rounded-xl px-3 py-1.5 outline-none font-semibold focus:bg-[#092430] cursor-pointer"
                >
                  <option value="All" className="bg-[#092430] text-white">Semua RT di {selectedRw}</option>
                  <option value="RT 01" className="bg-[#092430] text-white">RT 01</option>
                  <option value="RT 02" className="bg-[#092430] text-white">RT 02</option>
                  <option value="RT 03" className="bg-[#092430] text-white">RT 03</option>
                  {selectedRw !== 'RW 11' && <option value="RT 04" className="bg-[#092430] text-white">RT 04</option>}
                </select>
              )}
            </div>
            {(selectedRw !== 'All' || selectedRt !== 'All') && (
              <button 
                onClick={() => { setSelectedRw('All'); setSelectedRt('All'); }}
                className="text-[11px] text-teal-300 hover:text-white underline font-medium"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Interactive Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: KK Terdata */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition duration-200 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">KK Terdata</span>
            <div className="p-2.5 bg-teal-50 rounded-xl text-teal-sedang group-hover:scale-110 transition duration-200">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-800 tracking-tight">{totalKk}</span>
              <span className="text-xs text-slate-400 font-bold">/ {totalTargetKk} KK</span>
            </div>
            <div className="mt-2.5 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-teal-sedang h-full rounded-full transition-all duration-500" 
                style={{ width: `${overallCapaianKk}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-1.5 text-[10px] text-slate-450 font-bold">
              <span>Capaian Lapangan</span>
              <span className="text-teal-sedang">{overallCapaianKk}%</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Jiwa */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition duration-200 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Jiwa Terdata</span>
            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 group-hover:scale-110 transition duration-200">
              <User className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-800 tracking-tight">{totalWarga}</span>
              <span className="text-xs text-slate-400 font-bold">/ {totalTargetWarga} Jiwa</span>
            </div>
            <div className="mt-2.5 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${overallCapaianWarga}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-1.5 text-[10px] text-slate-450 font-bold">
              <span>Estimasi Kependudukan</span>
              <span className="text-blue-600">{overallCapaianWarga}%</span>
            </div>
          </div>
        </div>

        {/* Card 3: Masalah Warga */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition duration-200 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Keluhan / Masalah</span>
            <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600 group-hover:scale-110 transition duration-200">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-800 tracking-tight">{totalMasalah}</span>
              <span className="text-xs text-slate-400 font-bold">Isu Terinventarisir</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-450 font-bold">
              <span>Dasar USG Prioritas (Siklus 3)</span>
              <span className="text-rose-600 font-extrabold">{totalKk > 0 ? (totalMasalah / totalKk).toFixed(1) : 0} / KK</span>
            </div>
          </div>
        </div>

        {/* Card 4: Potensi Lokal */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition duration-200 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Potensi Komunitas</span>
            <div className="p-2.5 bg-[#F6F1E6] rounded-xl text-teal-sedang group-hover:scale-110 transition duration-200">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-800 tracking-tight">{totalPotensi}</span>
              <span className="text-xs text-slate-400 font-bold">Potensi Terdata</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-450 font-bold">
              <span>Aset Pemberdayaan Desa</span>
              <span className="text-teal-sedang font-extrabold">Siap Olah</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Target RT Progress Breakdown & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress per RT Table Card (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Navigation className="h-4 w-4 text-teal-sedang" /> Capaian Target Sensus Dusun 2 per RT
              </h3>
              <p className="text-xs text-slate-400">Distribusi pencapaian pendataan KK dan Warga per unit RT</p>
            </div>
            <button 
              onClick={() => setShowTargetEditor(true)} 
              className="text-xs font-bold text-teal-sedang hover:text-[#113a48] transition cursor-pointer"
            >
              Ubah Target
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-100">
                  <th className="py-2.5 px-3">Wilayah (RT)</th>
                  <th className="py-2.5 px-3 text-center">Capaian KK</th>
                  <th className="py-2.5 px-3 text-center">Capaian Warga</th>
                  <th className="py-2.5 px-3 text-right">Progres %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rtTargets
                  .filter((t: RtTarget) => {
                    if (selectedRw !== 'All' && t.rw !== selectedRw) return false;
                    if (selectedRt !== 'All' && t.rt !== selectedRt) return false;
                    return true;
                  })
                  .map((item: RtTarget) => {
                    const label = `${item.rw} / ${item.rt}`;
                    const kkSurveyed = surveys.filter(s => s.rt_label === label).length;
                    const wargaSurveyed = surveys
                      .filter(s => s.rt_label === label)
                      .reduce((acc, curr) => acc + (Number(curr.family_size) || 0), 0);
                    const pct = item.target_kk > 0 ? Math.min(100, Math.round((kkSurveyed / item.target_kk) * 100)) : 0;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-2.5 px-3 font-bold text-slate-700 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-teal-sedang inline-block" />
                          {item.rw} / {item.rt}
                        </td>
                        <td className="py-2.5 px-3 text-center font-semibold text-slate-600">
                          <span className="font-bold text-slate-800">{kkSurveyed}</span> / {item.target_kk} KK
                        </td>
                        <td className="py-2.5 px-3 text-center font-semibold text-slate-600">
                          <span className="font-bold text-slate-800">{wargaSurveyed}</span> / {item.target_warga} Jiwa
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden hidden sm:block">
                              <div className="bg-teal-sedang h-full rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className={`font-black text-xs ${pct >= 100 ? 'text-emerald-600' : pct > 50 ? 'text-teal-sedang' : 'text-slate-400'}`}>
                              {pct}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar Column: Google Workspace & Quick Navigation */}
        <div className="space-y-6">
          {/* Google Workspace Integration Card */}
          <div className="bg-[#092430] text-white rounded-2xl p-5 shadow-sm border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-sm flex items-center gap-2 text-white">
                <RefreshCw className="h-4 w-4 text-teal-300" /> Google Workspace Cloud Sync
              </h3>
              <span className="text-[9px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-bold">API Cloud</span>
            </div>

            {/* Action 1: Google Drive Sync */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-teal-200 block uppercase tracking-wider">1. Backup Foto & Data (Google Drive)</label>
              <button
                onClick={handleBackupToDrive}
                disabled={syncingDrive}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-[#092430] font-bold py-2 text-xs transition-all cursor-pointer shadow-sm"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${syncingDrive ? 'animate-spin' : ''}`} />
                {syncingDrive ? 'Mengarsipkan...' : 'Arsipkan Data ke Drive'}
              </button>
              {driveSyncResult && (
                <div className="bg-white/10 border border-white/15 rounded-xl p-2.5 text-[10px] text-teal-100 space-y-1">
                  <p className="font-bold text-emerald-300">✓ {driveSyncResult.message}</p>
                  <p className="text-[9px] text-emerald-400">Arsip baru ditambahkan. {driveSyncResult.mocked && '(Mode Simulasi)'}</p>
                  {driveSyncResult.data?.drive_link && (
                    <a href={driveSyncResult.data.drive_link} target="_blank" rel="noopener noreferrer" className="underline font-bold text-emerald-300 block mt-1 hover:text-white">
                      Buka Google Drive Folder ↗
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Action 2: Interactive Month View Calendar */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-teal-200 block uppercase tracking-wider">
                  2. Jadwal KKN (Google Calendar)
                </label>
                <span className="text-[9px] text-teal-300 font-semibold">
                  {calendarEvents.length} Events
                </span>
              </div>

              {/* Group Color Legend Bar */}
              <div className="flex flex-wrap items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1.5 text-[9px] font-bold text-teal-100">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400"></span> K55 (Dusun 1)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> K56 (Dusun 2)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400"></span> K57 (Dusun 3)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Semua</span>
              </div>

              {/* Month Navigator Header */}
              <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white">
                <button onClick={handlePrevMonth} className="hover:text-teal-300 p-1 cursor-pointer">‹</button>
                <span>
                  {currentCalendarDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={handleNextMonth} className="hover:text-teal-300 p-1 cursor-pointer">›</button>
              </div>

              {/* 7-Day Grid Header */}
              <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-bold text-teal-200/70 pt-1">
                <span>Min</span><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span>
              </div>

              {/* Calendar Grid Cells */}
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentCalendarDate).map((day, idx) => {
                  if (!day) return <div key={`empty-${idx}`} className="h-7 rounded-lg bg-transparent" />;
                  
                  const evts = getEventsForDay(day);
                  const isToday = new Date().toDateString() === day.toDateString();
                  const isSelected = selectedCalendarDay?.toDateString() === day.toDateString();

                  // Get unique group codes for this day
                  const uniqueGroups = Array.from(new Set(evts.map(getEventGroup)));

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedCalendarDay(day)}
                      className={`h-8 rounded-lg text-[10px] font-bold relative flex items-center justify-center transition cursor-pointer border pb-1.5 ${
                        isSelected 
                          ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-black' 
                          : isToday 
                          ? 'bg-white/20 text-white border-white/40' 
                          : 'bg-white/5 text-teal-100 hover:bg-white/10 border-white/5'
                      }`}
                    >
                      <span>{day.getDate()}</span>
                      {uniqueGroups.length > 0 && (
                        <div className="absolute bottom-1 flex items-center justify-center gap-0.5">
                          {uniqueGroups.map(g => (
                            <span
                              key={g}
                              className={`w-1.5 h-1.5 rounded-full ${GROUP_EVENT_STYLES[g]?.dot || 'bg-amber-400'}`}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected Day Events List */}
              {selectedCalendarDay && (
                <div className="bg-slate-900/90 border border-white/15 rounded-xl p-3 text-[10px] space-y-2 mt-2 animate-fade-in shadow-lg">
                  <div className="flex items-center justify-between font-bold text-amber-300 border-b border-white/10 pb-1.5">
                    <span>📅 Agenda: {selectedCalendarDay.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <button onClick={() => setSelectedCalendarDay(null)} className="text-slate-400 hover:text-white font-bold px-1.5">✕</button>
                  </div>
                  {getEventsForDay(selectedCalendarDay).length > 0 ? (
                    getEventsForDay(selectedCalendarDay).map((evt, idx) => {
                      const g = getEventGroup(evt);
                      const style = GROUP_EVENT_STYLES[g] || GROUP_EVENT_STYLES['semua'];
                      return (
                        <div key={idx} className={`rounded-xl p-2.5 border transition shadow-sm space-y-1 ${style.badge}`}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-extrabold text-white text-xs">{evt.summary}</span>
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border whitespace-nowrap ${style.pillBg}`}>
                              {style.label}
                            </span>
                          </div>
                          {evt.description && <p className="text-[9.5px] opacity-90 leading-tight">{evt.description}</p>}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-[9px] text-teal-300/60 italic text-center py-2">Tidak ada agenda pada tanggal ini.</p>
                  )}
                </div>
              )}
            </div>

            {/* Action 3: Event Creator Form */}
            <form onSubmit={handleAddCalendarEvent} className="space-y-2.5 pt-2 border-t border-white/10">
              <label className="text-[10px] font-bold text-teal-200 block uppercase tracking-wider">3. Tambah Event Baru</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Judul Agenda (mis. Rembug Warga)..."
                    value={calendarTitle}
                    onChange={(e) => setCalendarTitle(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-2.5 py-1.5 text-xs outline-none focus:border-teal-sedang font-medium"
                  />
                </div>
                <div>
                  <select
                    value={calendarTargetGroup}
                    onChange={(e) => setCalendarTargetGroup(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-2 py-1.5 text-xs outline-none focus:border-teal-sedang font-bold"
                  >
                    <option value="55">🔵 Kelompok 55</option>
                    <option value="56">🟢 Kelompok 56</option>
                    <option value="57">🔴 Kelompok 57</option>
                    <option value="semua">⭐ Semua</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[8px] font-black text-slate-400 block mb-0.5 uppercase">Mulai</label>
                  <input
                    type="date"
                    value={calendarStart}
                    onChange={(e) => setCalendarStart(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-2 py-1.5 text-xs outline-none focus:border-teal-sedang font-bold"
                  />
                </div>
                <div>
                  <label className="text-[8px] font-black text-slate-400 block mb-0.5 uppercase">Selesai</label>
                  <input
                    type="date"
                    value={calendarEnd}
                    onChange={(e) => setCalendarEnd(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-2 py-1.5 text-xs outline-none focus:border-teal-sedang font-bold"
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
    </div>
  );
}
