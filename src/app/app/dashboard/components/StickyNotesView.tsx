import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, CheckCircle2, RefreshCw } from 'lucide-react';
import { getGroupRtRwOptions, GROUP_PALETTES } from './constants';
import { supabase } from '@/lib/supabase';

const COLUMNS: ('Aspirasi' | 'Masalah' | 'Potensi' | 'Lainnya')[] = ['Aspirasi', 'Masalah', 'Potensi', 'Lainnya'];

const COLORS = [
  { name: 'Kuning', value: '#FEF08A', text: '#854D0E' },
  { name: 'Hijau', value: '#BBF7D0', text: '#166534' },
  { name: 'Biru', value: '#BFDBFE', text: '#1E40AF' },
  { name: 'Merah', value: '#FECDD3', text: '#9F1239' },
];

export default function StickyNotesView({ currentUser }: { currentUser?: any }) {
  const userGroup = (currentUser?.group || '56') as '55' | '56' | '57';
  const rtRwOptions = getGroupRtRwOptions(userGroup);
  const groupConfig = GROUP_PALETTES[userGroup] || GROUP_PALETTES['56'];

  const [notes, setNotes] = useState<any[]>([]);
  const [newContent, setNewContent] = useState('');
  const [selectedColumn, setSelectedColumn] = useState<'Aspirasi' | 'Masalah' | 'Potensi' | 'Lainnya'>('Aspirasi');
  const [selectedColor, setSelectedColor] = useState('#FEF08A');
  const [rtNumber, setRtNumber] = useState(rtRwOptions[0] || 'RT 01 / RW 01');
  const [authorName, setAuthorName] = useState(currentUser?.name || 'Anonim');
  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [editingNote, setEditingNote] = useState<any | null>(null);

  useEffect(() => {
    if (currentUser?.name) {
      setAuthorName(currentUser.name);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    // 1. Instant load dari cache lokal (0ms delay)
    const local = localStorage.getItem('sukahaji_sticky_notes');
    let localNotes: any[] = [];
    if (local) {
      try { 
        localNotes = JSON.parse(local);
        setNotes(localNotes);
      } catch {}
    }

    // 2. Background revalidate dari cloud (merge with local)
    try {
      const res = await fetch('/api/sync/sticky-notes');
      const result = await res.json();
      if (result.success && result.data && result.data.length > 0) {
        const cloudNotes = result.data.map((d: any) => ({
          id: d.id,
          column_name: d.column_name || 'Lainnya',
          content: d.content,
          color: d.color || '#FEF08A',
          rt_number: d.rt_number || 'Umum',
          author: d.author || 'Anonim',
          created_at: d.created_at
        }));

        // Merge: combination of local and cloud notes without duplicates
        const noteMap = new Map();
        cloudNotes.forEach((n: any) => noteMap.set(n.id, n));
        localNotes.forEach((n: any) => noteMap.set(n.id, n));
        const merged = Array.from(noteMap.values());

        setNotes(merged);
        localStorage.setItem('sukahaji_sticky_notes', JSON.stringify(merged));
      }
    } catch (err) {
      console.warn("Cloud sticky notes fetch failed, using local cache:", err);
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
      rt_number: rtNumber,
      author: authorName || currentUser?.name || 'Anonim',
      created_at: new Date().toISOString()
    };

    // 1. Save to state & localStorage IMMEDIATELY so it never vanishes on refresh
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    localStorage.setItem('sukahaji_sticky_notes', JSON.stringify(updatedNotes));

    setNewContent('');
    setFeedbackMsg('✓ Catatan berhasil ditambahkan!');
    setTimeout(() => setFeedbackMsg(''), 3000);

    // 2. Sync to Supabase in background
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
          const replaced = prev.map(n => n.id === tempId ? { ...n, id: savedCloudNote.id } : n);
          localStorage.setItem('sukahaji_sticky_notes', JSON.stringify(replaced));
          return replaced;
        });
      }
    } catch (err) {
      console.warn("Background sticky note sync failed, saved locally:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus catatan sticky note ini?')) return;

    // 1. Update UI state & localStorage immediately
    const updated = notes.filter(n => n.id !== noteId);
    setNotes(updated);
    localStorage.setItem('sukahaji_sticky_notes', JSON.stringify(updated));

    // 2. Delete from Supabase if real DB record
    if (noteId && !noteId.startsWith('local-note-')) {
      try {
        await supabase.from('sticky_note').delete().eq('id', noteId);
      } catch (err) {
        console.error('Failed to delete note from Supabase:', err);
      }
    }
  };

  const handleSaveEditedNote = async () => {
    if (!editingNote || !editingNote.content.trim()) return;

    const updated = notes.map(n => n.id === editingNote.id ? editingNote : n);
    setNotes(updated);
    localStorage.setItem('sukahaji_sticky_notes', JSON.stringify(updated));

    if (editingNote.id && !editingNote.id.startsWith('local-note-')) {
      try {
        await supabase
          .from('sticky_note')
          .update({
            content: editingNote.content,
            column_name: editingNote.column_name,
            color: editingNote.color,
            rt_number: editingNote.rt_number
          })
          .eq('id', editingNote.id);
      } catch (err) {
        console.error('Failed to update note in Supabase:', err);
      }
    }

    setEditingNote(null);
    setFeedbackMsg('✓ Catatan berhasil diperbarui!');
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Info Banner explaining rembug warga flow */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-900 text-xs leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <strong className="block text-amber-950 text-sm mb-0.5">📢 Instrumen Digitalisasi Rembug Warga (Siklus 1) — Kelompok {userGroup} ({groupConfig.dusun})</strong>
          Dokumentasikan aspirasi, potensi, dan keluhan warga dari rembug desa. Data otomatis tersimpan secara aman di browser & cloud database.
        </div>

        {feedbackMsg && (
          <span className="shrink-0 px-3 py-1.5 bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-sm animate-pulse flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" /> {feedbackMsg}
          </span>
        )}
      </div>

      {/* Input Form Card */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 space-y-4">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">➕ Tambah Catatan Rembug Warga</h3>
        <form onSubmit={handleAddNote} className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="md:col-span-2 space-y-1">
            <label className="block text-xxs font-bold text-slate-500 uppercase">Isi Catatan / Aspirasi / Keluhan</label>
            <input
              type="text"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Masukkan aspirasi/keluhan warga..."
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

          <div className="flex flex-wrap items-center justify-between gap-3 md:col-span-4 pt-2 border-t border-slate-100">
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

      {/* Columns Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {COLUMNS.map((columnName) => {
          const colNotes = notes.filter((n) => n.column_name === columnName);
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

                    <p className="text-xs font-semibold text-slate-850 pr-10 leading-relaxed font-sans">{note.content}</p>

                    <div className="mt-3 flex items-center justify-between text-[9.5px] text-slate-600 border-t border-black/10 pt-2">
                      <span className="font-extrabold">📍 {note.rt_number}</span>
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

              <div className="grid grid-cols-2 gap-3">
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
              </div>

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
