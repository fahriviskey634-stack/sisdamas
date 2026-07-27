import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit3, CheckCircle2, RefreshCw, CloudOff, Cloud } from 'lucide-react';
import { getGroupRtRwOptions, GROUP_PALETTES } from './constants';

const COLUMNS: ('Harapan' | 'Masalah' | 'Potensi' | 'Lainnya')[] = ['Harapan', 'Masalah', 'Potensi', 'Lainnya'];

const COLORS = [
  { name: 'Kuning', value: '#FEF08A', text: '#854D0E' },
  { name: 'Hijau', value: '#BBF7D0', text: '#166534' },
  { name: 'Biru', value: '#BFDBFE', text: '#1E40AF' },
  { name: 'Merah', value: '#FECDD3', text: '#9F1239' },
];

const LOCAL_STORAGE_KEY = 'sukahaji_sticky_notes';

export default function StickyNotesView({ currentUser }: { currentUser?: any }) {
  const userGroup = (currentUser?.group || '56') as '55' | '56' | '57';
  const isGroup56 = userGroup === '56';
  const rtRwOptions = getGroupRtRwOptions(userGroup);
  const groupConfig = GROUP_PALETTES[userGroup] || GROUP_PALETTES['56'];

  const [notes, setNotes] = useState<any[]>([]);
  const [newContent, setNewContent] = useState('');
  const [selectedColumn, setSelectedColumn] = useState<'Harapan' | 'Masalah' | 'Potensi' | 'Lainnya'>('Harapan');
  const [selectedColor, setSelectedColor] = useState('#FEF08A');
  const [rtNumber, setRtNumber] = useState(isGroup56 ? 'Dusun 2 (RW 01, 05, 11)' : (rtRwOptions[0] || 'RT 01 / RW 01'));
  const [authorName, setAuthorName] = useState(currentUser?.name || 'Anonim');
  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [editingNote, setEditingNote] = useState<any | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('syncing');

  useEffect(() => {
    if (currentUser?.name) {
      setAuthorName(currentUser.name);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchNotes();
  }, []);

  // Helper: save notes to localStorage as cache
  const saveToLocalCache = useCallback((notesData: any[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notesData));
    } catch {}
  }, []);

  // Helper: load notes from localStorage cache
  const loadFromLocalCache = useCallback((): any[] => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  }, []);

  // Helper: migrate old "Aspirasi" notes to "Harapan" in local cache
  const migrateLocalNotes = useCallback((notesData: any[]): any[] => {
    return notesData.map(n => ({
      ...n,
      column_name: n.column_name === 'Aspirasi' ? 'Harapan' : n.column_name
    }));
  }, []);

  const fetchNotes = async () => {
    setSyncStatus('syncing');

    // 1. Instant load dari local cache (0ms delay) — hanya sebagai placeholder saat loading
    const localNotes = migrateLocalNotes(loadFromLocalCache());
    if (localNotes.length > 0) {
      setNotes(localNotes);
    }

    // 2. Fetch dari CLOUD sebagai Source of Truth
    try {
      const res = await fetch('/api/sync/sticky-notes', { cache: 'no-store' });
      const result = await res.json();

      if (result.success) {
        const cloudNotes = (result.data || []).map((d: any) => ({
          id: d.id,
          column_name: (d.column_name === 'Aspirasi' ? 'Harapan' : d.column_name) || 'Lainnya',
          content: d.content,
          color: d.color || '#FEF08A',
          rt_number: d.rt_number || 'Umum',
          author: d.author || 'Anonim',
          created_at: d.created_at
        }));

        // CLOUD = final state — cloud data selalu menang, hapus local cache lama
        setNotes(cloudNotes);
        saveToLocalCache(cloudNotes);
        setSyncStatus('synced');
      } else {
        // Cloud error tapi response parseable — tetap pakai local
        setSyncStatus('offline');
      }
    } catch (err) {
      console.warn('Cloud sticky notes fetch failed, using local cache:', err);
      setSyncStatus('offline');

    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setSaving(true);
    const tempId = `local-note-${Date.now()}`;
    const newNote = {
      id: tempId,
      column_name: selectedColumn,
      content: newContent.trim(),
      color: selectedColor,
      rt_number: isGroup56 ? 'Dusun 2 (RW 01, 05, 11)' : rtNumber,
      author: authorName || currentUser?.name || 'Anonim',
      created_at: new Date().toISOString()
    };

    // 1. Save to state & localStorage IMMEDIATELY so it never vanishes on refresh
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    saveToLocalCache(updatedNotes);

    setNewContent('');
    setFeedbackMsg('✓ Catatan berhasil ditambahkan!');
    setTimeout(() => setFeedbackMsg(''), 3000);

    // 2. Sync to cloud in background
    try {
      const res = await fetch('/api/sync/sticky-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: [newNote] })
      });
      const result = await res.json();
      if (result.success && result.data && result.data.length > 0) {
        const savedCloudNote = result.data[0];
        // Replace tempId with real DB ID
        setNotes((prev) => {
          const replaced = prev.map(n => n.id === tempId ? {
            ...n,
            id: savedCloudNote.id,
            created_at: savedCloudNote.created_at || n.created_at
          } : n);
          saveToLocalCache(replaced);
          return replaced;
        });
        setSyncStatus('synced');
      }
    } catch (err) {
      console.warn('Background sticky note sync failed, saved locally:', err);
      setSyncStatus('offline');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus catatan sticky note ini?')) return;

    // 1. Update UI state & localStorage immediately
    const updated = notes.filter(n => n.id !== noteId);
    setNotes(updated);
    saveToLocalCache(updated);

    // 2. Delete from cloud if real DB record (via API route)
    if (noteId && !noteId.startsWith('local-note-')) {
      try {
        await fetch(`/api/sync/sticky-notes?id=${noteId}`, { method: 'DELETE' });
      } catch (err) {
        console.error('Failed to delete note from cloud:', err);
      }
    }
  };

  const handleSaveEditedNote = async () => {
    if (!editingNote || !editingNote.content.trim()) return;

    const updated = notes.map(n => n.id === editingNote.id ? editingNote : n);
    setNotes(updated);
    saveToLocalCache(updated);

    // Sync edit to cloud via API route (not direct Supabase)
    if (editingNote.id && !editingNote.id.startsWith('local-note-')) {
      try {
        await fetch('/api/sync/sticky-notes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingNote.id,
            content: editingNote.content,
            column_name: editingNote.column_name,
            color: editingNote.color,
            rt_number: editingNote.rt_number
          })
        });
      } catch (err) {
        console.error('Failed to update note in cloud:', err);
      }
    }

    setEditingNote(null);
    setFeedbackMsg('✓ Catatan berhasil diperbarui!');
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  // Tampilkan semua notes tanpa filter wilayah (Siklus 1 = Dusun 2 saja)
  const filteredNotes = notes;

  return (
    <div className="space-y-6">
      {/* Info Banner explaining rembug warga flow */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-900 text-xs leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <strong className="block text-amber-950 text-sm mb-0.5">📢 Instrumen Digitalisasi Rembug Warga (Siklus 1) — Kelompok {userGroup} ({groupConfig.dusun})</strong>
          Dokumentasikan harapan, potensi, dan keluhan warga dari rembug desa. Data otomatis tersimpan secara aman di browser &amp; cloud database.
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Sync status indicator */}
          {syncStatus === 'synced' && (
            <span className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg">
              <Cloud className="h-3 w-3" /> Tersinkron
            </span>
          )}
          {syncStatus === 'syncing' && (
            <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-lg">
              <RefreshCw className="h-3 w-3 animate-spin" /> Menyinkronkan...
            </span>
          )}
          {syncStatus === 'offline' && (
            <span className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-lg">
              <CloudOff className="h-3 w-3" /> Offline (Cache)
            </span>
          )}

          {feedbackMsg && (
            <span className="px-3 py-1.5 bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-sm animate-pulse flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> {feedbackMsg}
            </span>
          )}
        </div>
      </div>

      {/* Input Form Card */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 space-y-4">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">➕ Tambah Catatan Rembug Warga</h3>
        <form onSubmit={handleAddNote} className={`grid grid-cols-1 gap-4 ${isGroup56 ? 'md:grid-cols-3' : 'md:grid-cols-4'}`}>
          <div className="md:col-span-2 space-y-1">
            <label className="block text-xxs font-bold text-slate-500 uppercase">Isi Catatan / Harapan / Keluhan</label>
            <input
              type="text"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Masukkan harapan/keluhan warga..."
              className="w-full rounded-xl border border-slate-300 text-slate-900 bg-white px-4 py-2 text-xs outline-none focus:border-teal-sedang transition font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xxs font-bold text-slate-500 uppercase">Kategori Kolom</label>
            <select
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value as any)}
              className="w-full rounded-xl border border-slate-300 text-slate-900 bg-white px-3 py-2 text-xs outline-none focus:border-teal-sedang transition font-bold"
            >
              {COLUMNS.map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>

          {/* Wilayah RT/RW picker — hanya tampil untuk kelompok 55 dan 57 */}
          {!isGroup56 && (
            <div className="space-y-1">
              <label className="block text-xxs font-bold text-slate-500 uppercase">Wilayah RT / RW ({groupConfig.dusun})</label>
              <select
                value={rtNumber}
                onChange={(e) => setRtNumber(e.target.value)}
                className="w-full rounded-xl border border-slate-300 text-slate-900 bg-white px-3 py-2 text-xs outline-none focus:border-teal-sedang transition font-bold"
              >
                {rtRwOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          )}

          <div className={`flex flex-wrap items-center justify-between gap-3 ${isGroup56 ? 'md:col-span-3' : 'md:col-span-4'} pt-2 border-t border-slate-100`}>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xxs font-bold text-slate-500 uppercase">Warna Note:</span>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setSelectedColor(c.value)}
                    style={{ backgroundColor: c.value, border: selectedColor === c.value ? '2px solid #0F172A' : '1px solid #CBD5E1' }}
                    className="h-7 px-3 rounded-lg text-xxs font-black uppercase transition cursor-pointer shadow-xs"
                  >
                    <span style={{ color: c.text }}>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-teal-sedang hover:bg-[#113a48] px-6 py-2.5 text-xs font-bold text-white shadow-sm transition w-full sm:w-auto justify-center cursor-pointer disabled:opacity-50"
            >
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Tempel Note
            </button>
          </div>
        </form>
      </div>

      {/* Info wilayah */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
          📌 Papan Sticky Note — Kelompok {userGroup} ({groupConfig.dusun}){isGroup56 && ' • Wilayah RW 01, 05, 11'}
        </span>
        <span className="text-xs font-extrabold text-teal-tua bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200">
          Total: {notes.length} catatan
        </span>
      </div>

      {/* Columns Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {COLUMNS.map((columnName) => {
          const colNotes = filteredNotes.filter((n) => n.column_name === columnName);
          return (
            <div key={columnName} className="flex flex-col rounded-2xl bg-white p-4 shadow-sm border border-slate-200 min-h-[420px]">
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">{columnName}</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-black text-teal-tua border border-slate-200">
                  {colNotes.length}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
                {colNotes.map((note) => (
                  <div
                    key={note.id}
                    style={{ backgroundColor: note.color }}
                    className="group relative rounded-xl p-3.5 shadow-sm border border-slate-900/10 transition hover:shadow-md"
                  >
                    {/* Pending sync indicator */}
                    {typeof note.id === 'string' && note.id.startsWith('local-note-') && (
                      <span className="absolute top-1.5 left-2 text-[8px] font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-md">
                        ⏳ Belum tersinkron
                      </span>
                    )}

                    {/* Delete & Edit Buttons */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                      <button
                        type="button"
                        onClick={() => setEditingNote({ ...note })}
                        className="p-1 rounded hover:bg-black/10 text-slate-700 transition cursor-pointer"
                        title="Edit Catatan"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1 rounded hover:bg-red-500 hover:text-white text-rose-700 transition cursor-pointer"
                        title="Hapus Catatan"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <p className={`text-xs font-semibold text-slate-850 pr-10 leading-relaxed font-sans ${typeof note.id === 'string' && note.id.startsWith('local-note-') ? 'mt-4' : ''}`}>{note.content}</p>

                    <div className={`mt-3 flex items-center ${isGroup56 ? 'justify-end' : 'justify-between'} text-[9.5px] text-slate-600 border-t border-black/10 pt-2`}>
                      {!isGroup56 && <span className="font-extrabold">📍 {note.rt_number}</span>}
                      <span className="font-bold">Oleh: {note.author || 'Anonim'}</span>
                    </div>
                  </div>
                ))}

                {colNotes.length === 0 && (
                  <div className="flex-1 flex items-center justify-center text-slate-350 text-xs italic py-8 border-2 border-dashed border-slate-100 rounded-xl">
                    Belum ada catatan di kolom ini
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Sticky Note Modal */}
      {editingNote && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                ✏️ Edit Catatan Sticky Note
              </h3>
              <button
                onClick={() => setEditingNote(null)}
                className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-800">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Isi Catatan:</label>
                <textarea
                  rows={3}
                  value={editingNote.content}
                  onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-teal-sedang font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Kategori Kolom:</label>
                <select
                  value={editingNote.column_name}
                  onChange={(e) => setEditingNote({ ...editingNote, column_name: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-teal-sedang font-bold bg-white"
                >
                  {COLUMNS.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              {/* Wilayah RT/RW di edit modal — hanya untuk kelompok 55 dan 57 */}
              {!isGroup56 && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Wilayah RT/RW:</label>
                  <select
                    value={editingNote.rt_number}
                    onChange={(e) => setEditingNote({ ...editingNote, rt_number: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-teal-sedang font-bold bg-white"
                  >
                    {rtRwOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Warna Card:</label>
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setEditingNote({ ...editingNote, color: c.value })}
                      style={{ backgroundColor: c.value, border: editingNote.color === c.value ? '2px solid #0F172A' : '1px solid #CBD5E1' }}
                      className="h-7 px-3 rounded-lg text-xxs font-black uppercase transition cursor-pointer"
                    >
                      <span style={{ color: c.text }}>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingNote(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveEditedNote}
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
