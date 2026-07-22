import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { PriorityItem } from './types';

export default function PriorityView() {
  const [method, setMethod] = useState<'usg' | 'abcd'>('usg');
  const [items, setItems] = useState<PriorityItem[]>([]);
  const [success, setSuccess] = useState(false);
  
  // Custom problem adding
  const [newProbText, setNewProbText] = useState('');
  const [newProbCat, setNewProbCat] = useState('Infrastruktur');
  const [newProbRt, setNewProbRt] = useState('RT 01 / RW 01');

  // Load items from Supabase Backend API on mount with localStorage fallback
  useEffect(() => {
    fetchPriorityItems();
  }, []);

  const fetchPriorityItems = async () => {
    try {
      const res = await fetch('/api/sync/priority-items');
      const result = await res.json();
      if (result.success && result.data && result.data.length > 0) {
        setItems(result.data);
        localStorage.setItem('sukahaji_priority_items_v3', JSON.stringify(result.data));
        return;
      }
    } catch {}

    const saved = localStorage.getItem('sukahaji_priority_items_v3');
    if (saved) setItems(JSON.parse(saved));
  };

  const syncItemsToSupabase = async (updatedItems: PriorityItem[]) => {
    localStorage.setItem('sukahaji_priority_items_v3', JSON.stringify(updatedItems));
    try {
      await fetch('/api/sync/priority-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updatedItems })
      });
    } catch (e) {
      console.error('Failed to sync priority_item to Cloud API:', e);
    }
  };

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
      const sorted = [...updated].sort((a, b) => b.total_score - a.total_score);
      const reranked = updated.map((item) => ({
        ...item,
        rank: sorted.findIndex((s) => s.id === item.id) + 1
      }));
      syncItemsToSupabase(reranked);
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
      const sorted = [...updated].sort((a, b) => (b.total_score_abcd || 12) - (a.total_score_abcd || 12));
      const reranked = updated.map((item) => ({
        ...item,
        rank_abcd: sorted.findIndex((s) => s.id === item.id) + 1
      }));
      syncItemsToSupabase(reranked);
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
      syncItemsToSupabase(updated);
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
      const sortedUSG = [...updated].sort((a, b) => b.total_score - a.total_score);
      const sortedABCD = [...updated].sort((a, b) => (b.total_score_abcd || 12) - (a.total_score_abcd || 12));
      
      const finalized = updated.map((item) => ({
        ...item,
        rank: sortedUSG.findIndex((s) => s.id === item.id) + 1,
        rank_abcd: sortedABCD.findIndex((s) => s.id === item.id) + 1
      }));
      localStorage.setItem('sukahaji_priority_items_v3', JSON.stringify(finalized));
      return finalized;
    });

    setNewProbText('');
  };

  const handleSaveAll = () => {
    localStorage.setItem('sukahaji_priority_items_v3', JSON.stringify(items));
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const sortedUSGItems = [...items].sort((a, b) => (a.rank || 9) - (b.rank || 9));
  const sortedABCDItems = [...items].sort((a, b) => (a.rank_abcd || 9) - (b.rank_abcd || 9));

  return (
    <div className="space-y-6">
      {/* Method selector toggle + Add Problem Form */}
      <div className="flex flex-col gap-3 bg-slate-50 border border-slate-200/80 p-4 rounded-xl">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">
              Siklus 3: Klasifikasi & Prioritas Pokok Masalah
            </h2>
            <p className="text-[10px] text-slate-455 mt-0.5">
              Pilihlah metode prioritas yang ingin digunakan di bawah ini untuk menilai pokok masalah desa.
            </p>
          </div>
          <div className="flex gap-2 bg-slate-200/60 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setMethod('usg')}
              className={`px-3 md:px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                method === 'usg' ? 'bg-white text-teal-sedang shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Metode USG
            </button>
            <button
              onClick={() => setMethod('abcd')}
              className={`px-3 md:px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                method === 'abcd' ? 'bg-white text-teal-sedang shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Metode ABCD (KKN)
            </button>
          </div>
        </div>

        {/* Add Problem Form */}
        <form onSubmit={handleAddProblem} className="flex flex-col sm:flex-row gap-2 mt-2 pt-3 border-t border-slate-200/50">
          <input 
            type="text" 
            value={newProbText} 
            onChange={(e) => setNewProbText(e.target.value)}
            placeholder="Tambah pokok masalah baru..." 
            className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-teal-sedang"
          />
          <div className="flex gap-2">
            <select value={newProbRt} onChange={(e) => setNewProbRt(e.target.value)} className="px-2 py-2 text-xs border border-slate-300 rounded-lg">
              {['RT 01 / RW 01', 'RT 02 / RW 01', 'RT 03 / RW 01', 'RT 04 / RW 01'].map(rt => <option key={rt} value={rt}>{rt}</option>)}
            </select>
            <button type="submit" className="bg-teal-sedang text-white px-4 py-2 text-xs font-bold rounded-lg hover:bg-teal-tua transition">Tambah</button>
          </div>
        </form>
      </div>

      {method === 'usg' ? (
        <div className="bg-white rounded-xl border border-slate-300/60 p-4 md:p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
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
                  <th className="px-2 md:px-4 py-2 md:py-3 text-center">Rank</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 min-w-[140px]">Deskripsi Pokok Masalah</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 text-center">U</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 text-center">S</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 text-center">G</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 text-center">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-xs text-slate-700">
                {sortedUSGItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-2 md:px-4 py-2 md:py-3 text-center font-bold text-teal-tua">{item.rank}</td>
                    <td className="px-2 md:px-4 py-2 md:py-3 font-semibold text-slate-800">{item.problem_text} <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded ml-1 font-bold">{item.rt_label}</span></td>
                    <td className="px-2 md:px-4 py-2 md:py-3 text-center">
                      <select value={item.urgency} onChange={(e) => handleScoreUSG(item.id, 'urgency', parseInt(e.target.value))} className="rounded border border-slate-300 text-slate-900 bg-white px-2 py-1 text-xs">
                        {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </td>
                    <td className="px-2 md:px-4 py-2 md:py-3 text-center">
                      <select value={item.seriousness} onChange={(e) => handleScoreUSG(item.id, 'seriousness', parseInt(e.target.value))} className="rounded border border-slate-300 text-slate-900 bg-white px-2 py-1 text-xs">
                        {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </td>
                    <td className="px-2 md:px-4 py-2 md:py-3 text-center">
                      <select value={item.growth} onChange={(e) => handleScoreUSG(item.id, 'growth', parseInt(e.target.value))} className="rounded border border-slate-300 text-slate-900 bg-white px-2 py-1 text-xs">
                        {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </td>
                    <td className="px-2 md:px-4 py-2 md:py-3 text-center font-extrabold text-teal-sedang">{item.total_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* TABEL 1: Skoring ABCD */}
          <div className="bg-white rounded-xl border border-slate-300/60 p-4 md:p-6 shadow-sm space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">TABEL 1. Penentuan Pokok Masalah (Skoring Prioritas ABCD)</h3>
                <p className="text-xxs text-slate-455 mt-0.5">Berikan nilai 1-5 pada masing-masing kriteria. Jumlah skor = A + B + C + D.</p>
              </div>
              <button
                onClick={handleSaveAll}
                className="rounded-xl bg-teal-sedang hover:bg-[#113a48] text-white font-bold px-5 py-2 text-xs transition cursor-pointer shadow-sm self-start sm:self-auto"
              >
                {success ? '✓ Tersimpan!' : 'Simpan Matrix'}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-xxs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-300/60">
                    <th className="px-2 md:px-4 py-2 md:py-3 text-center w-12 md:w-16">Peringkat</th>
                    <th className="px-2 md:px-4 py-2 md:py-3 min-w-[140px]">Pokok Masalah</th>
                    <th className="px-2 py-2 md:py-3 text-center min-w-[65px]"><span className="hidden md:inline">Kriteria </span>A</th>
                    <th className="px-2 py-2 md:py-3 text-center min-w-[65px]"><span className="hidden md:inline">Kriteria </span>B</th>
                    <th className="px-2 py-2 md:py-3 text-center min-w-[65px]"><span className="hidden md:inline">Kriteria </span>C</th>
                    <th className="px-2 py-2 md:py-3 text-center min-w-[65px]"><span className="hidden md:inline">Kriteria </span>D</th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-center min-w-[70px]">Jumlah Skor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-xs text-slate-700">
                  {sortedABCDItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-2 md:px-4 py-2 md:py-3 text-center font-bold text-teal-tua">{item.rank_abcd || 1}</td>
                      <td className="px-2 md:px-4 py-2 md:py-3 font-semibold text-slate-855">
                        {item.problem_text}
                        <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded ml-1 font-bold">{item.rt_label}</span>
                      </td>
                      <td className="px-1 md:px-3 py-2 text-center">
                        <select value={item.a_score || 3} onChange={(e) => handleScoreABCD(item.id, 'a_score', parseInt(e.target.value))} className="rounded border border-slate-300 text-slate-900 bg-white px-1.5 py-1 text-xs">
                          {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </td>
                      <td className="px-1 md:px-3 py-2 text-center">
                        <select value={item.b_score || 3} onChange={(e) => handleScoreABCD(item.id, 'b_score', parseInt(e.target.value))} className="rounded border border-slate-300 text-slate-900 bg-white px-1.5 py-1 text-xs">
                          {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </td>
                      <td className="px-1 md:px-3 py-2 text-center">
                        <select value={item.c_score || 3} onChange={(e) => handleScoreABCD(item.id, 'c_score', parseInt(e.target.value))} className="rounded border border-slate-300 text-slate-900 bg-white px-1.5 py-1 text-xs">
                          {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </td>
                      <td className="px-1 md:px-3 py-2 text-center">
                        <select value={item.d_score || 3} onChange={(e) => handleScoreABCD(item.id, 'd_score', parseInt(e.target.value))} className="rounded border border-slate-300 text-slate-900 bg-white px-1.5 py-1 text-xs">
                          {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </td>
                      <td className="px-2 md:px-4 py-2 md:py-3 text-center font-extrabold text-teal-sedang">{item.total_score_abcd || 12}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Info Kriteria Penjelasan */}
            <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-4 text-xxs font-semibold">
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
          <div className="bg-white rounded-xl border border-slate-300/60 p-4 md:p-6 shadow-sm space-y-4 md:space-y-6">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">TABEL 2. Alternatif Penyelesaian Masalah</h3>
              <p className="text-xxs text-slate-455 mt-0.5">Uraikan potensi dan alternatif solusi berdasarkan urutan masalah prioritas (Tabel 1).</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-xxs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-300/60">
                    <th className="px-2 md:px-3 py-2 md:py-3 w-10 md:w-16 text-center">Rank</th>
                    <th className="px-2 md:px-3 py-2 md:py-3 min-w-[140px] w-1/4">Pokok Masalah (Prioritas)</th>
                    <th className="px-2 md:px-3 py-2 md:py-3 min-w-[150px]">Uraian Potensi Penyelesaian</th>
                    <th className="px-2 md:px-3 py-2 md:py-3 min-w-[150px]">1. Mandiri (Swadaya Warga)</th>
                    <th className="px-2 md:px-3 py-2 md:py-3 min-w-[150px]">2. Dukungan Luar (Semi-Mandiri)</th>
                    <th className="px-2 md:px-3 py-2 md:py-3 min-w-[150px]">3. Memerlukan Bantuan Luar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-xs text-slate-700">
                  {sortedABCDItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="px-2 md:px-3 py-2 md:py-3 text-center font-bold text-teal-tua">{item.rank_abcd || 1}</td>
                      <td className="px-2 md:px-3 py-2 md:py-3 font-semibold text-slate-800">
                        {item.problem_text}
                        <p className="text-[9px] text-slate-400 font-bold mt-0.5">{item.rt_label}</p>
                      </td>
                      <td className="px-1 md:px-2 py-1.5">
                        <textarea
                          rows={2}
                          value={item.potensi_uraian || ''}
                          onChange={(e) => handleUpdateAlternatif(item.id, 'potensi_uraian', e.target.value)}
                          placeholder="Potensi yang dimiliki..."
                          className="w-full rounded border border-slate-200 bg-white p-1 text-[10px] text-slate-800 outline-none focus:border-teal-sedang resize-none"
                        />
                      </td>
                      <td className="px-1 md:px-2 py-1.5">
                        <textarea
                          rows={2}
                          value={item.alt_mandiri || ''}
                          onChange={(e) => handleUpdateAlternatif(item.id, 'alt_mandiri', e.target.value)}
                          placeholder="Solusi masyarakat..."
                          className="w-full rounded border border-slate-200 bg-white p-1 text-[10px] text-slate-800 outline-none focus:border-teal-sedang resize-none"
                        />
                      </td>
                      <td className="px-1 md:px-2 py-1.5">
                        <textarea
                          rows={2}
                          value={item.alt_dukungan_luar || ''}
                          onChange={(e) => handleUpdateAlternatif(item.id, 'alt_dukungan_luar', e.target.value)}
                          placeholder="Bentuk dukungan..."
                          className="w-full rounded border border-slate-200 bg-white p-1 text-[10px] text-slate-800 outline-none focus:border-teal-sedang resize-none"
                        />
                      </td>
                      <td className="px-1 md:px-2 py-1.5">
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
