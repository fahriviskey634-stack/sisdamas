import React, { useState } from 'react';
import { LogOut, FileSpreadsheet, RefreshCw } from 'lucide-react';

export default function ProfileView({ handleLogout, rtTargets, setRtTargets }: any) {
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

        {/* Bidirectional Google Sheets Sync Panel */}
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
