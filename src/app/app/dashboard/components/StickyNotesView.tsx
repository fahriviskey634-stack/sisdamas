import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { OFFICIAL_RT_RW_OPTIONS } from './constants';

const COLUMNS: ('Aspirasi' | 'Masalah' | 'Potensi' | 'Lainnya')[] = ['Aspirasi', 'Masalah', 'Potensi', 'Lainnya'];

const COLORS = [
  { name: 'Kuning', value: '#FEF08A', text: '#854D0E' },
  { name: 'Hijau', value: '#BBF7D0', text: '#166534' },
  { name: 'Biru', value: '#BFDBFE', text: '#1E40AF' },
  { name: 'Merah', value: '#FECDD3', text: '#9F1239' },
];

export default function StickyNotesView() {
  const [notes, setNotes] = useState<any[]>([]);
  const [newContent, setNewContent] = useState('');
  const [selectedColumn, setSelectedColumn] = useState<'Aspirasi' | 'Masalah' | 'Potensi' | 'Lainnya'>('Aspirasi');
  const [selectedColor, setSelectedColor] = useState('#FEF08A');
  const [rtNumber, setRtNumber] = useState('RT 01 / RW 01');
  const [authorName, setAuthorName] = useState('Anonim');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    // 1. Instant load dari cache lokal (0ms delay)
    const local = localStorage.getItem('sukahaji_sticky_notes');
    if (local) {
      try { setNotes(JSON.parse(local)); } catch {}
    }

    // 2. Background revalidate dari cloud
    try {
      const res = await fetch('/api/sync/sticky-notes');
      const result = await res.json();
      if (result.success && result.data && result.data.length > 0) {
        setNotes(result.data.map((d: any) => ({
          id: d.id,
          column_name: d.column_name || 'Lainnya',
          content: d.content,
          color: d.color || '#FEF08A',
          rt_number: d.rt_number || 'Umum',
          author: d.author || 'Anonim',
          created_at: d.created_at
        })));
        localStorage.setItem('sukahaji_sticky_notes', JSON.stringify(result.data));
      }
    } catch {}
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const newNote = {
      column_name: selectedColumn,
      content: newContent.trim(),
      color: selectedColor,
      rt_number: rtNumber,
      author: authorName,
      created_at: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/sync/sticky-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: [newNote] })
      });
      const result = await res.json();
      if (result.success && result.data && result.data.length > 0) {
        setNotes((prev) => [...prev, result.data[0]]);
      } else {
        const itemWithId = { ...newNote, id: Math.random().toString(36).substr(2, 9) };
        setNotes((prev) => [...prev, itemWithId]);
      }
    } catch {
      const itemWithId = { ...newNote, id: Math.random().toString(36).substr(2, 9) };
      setNotes((prev) => [...prev, itemWithId]);
    }

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
            <label className="mb-1 block text-xxs font-semibold text-slate-500 uppercase">RT / RW (Dusun 2)</label>
            <select
              value={rtNumber}
              onChange={(e) => setRtNumber(e.target.value)}
              className="w-full rounded-lg border border-slate-300 text-slate-900 bg-white px-3 py-2.5 text-xs outline-none focus:border-transisi transition font-bold"
            >
              {OFFICIAL_RT_RW_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 md:col-span-4 mt-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xxs font-semibold text-slate-500 uppercase mr-2">Warna:</span>
              <div className="flex flex-wrap gap-1.5">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setSelectedColor(c.value)}
                    style={{ backgroundColor: c.value, border: selectedColor === c.value ? '2px solid #4F46E5' : '1px solid #CBD5E1' }}
                    className="h-6 px-2.5 rounded text-[10px] font-bold uppercase transition"
                  >
                    <span style={{ color: c.text }}>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-teal-sedang px-5 py-2 text-xs font-semibold text-white shadow hover:bg-kabut transition w-full sm:w-auto justify-center"
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
