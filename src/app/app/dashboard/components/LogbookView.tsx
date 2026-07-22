import React, { useState, useEffect } from 'react';
import { Printer } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { KKN_MEMBERS } from './constants';

export default function LogbookView({ currentUser }: { currentUser: any }) {
  const [activeNim, setActiveNim] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activities, setActivities] = useState<any[]>([]);
  const [success, setSuccess] = useState(false);
  const [rekap, setRekap] = useState<any[]>([]);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Form states for new activity row
  const [kegiatanText, setKegiatanText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  // Sync activeNim with currentUser
  useEffect(() => {
    if (currentUser) {
      setActiveNim(currentUser.nim);
    }
  }, [currentUser]);

  // Load activities for activeNim and selectedDate from cloud/API with local fallback
  useEffect(() => {
    if (!activeNim) return;

    const fetchCloudLogs = async () => {
      try {
        const { data: entryData } = await supabase
          .from('logbook_entry')
          .select('id')
          .eq('nim', activeNim)
          .eq('entry_date', selectedDate)
          .single();

        if (entryData) {
          const { data: actData } = await supabase
            .from('logbook_activity')
            .select('*')
            .eq('entry_id', entryData.id)
            .order('created_at', { ascending: true });

          if (actData && actData.length > 0) {
            setActivities(actData);
            return;
          }
        }
      } catch {}

      const allLogs = JSON.parse(localStorage.getItem(`sukahaji_logbook_${activeNim}`) || '{}');
      setActivities(allLogs[selectedDate] || []);
    };

    fetchCloudLogs();
  }, [activeNim, selectedDate]);

  // Load Rekap (History)
  useEffect(() => {
    if (!activeNim) return;

    const fetchRekap = async () => {
      try {
        const { data: entries } = await supabase
          .from('logbook_entry')
          .select('id, entry_date, logbook_activity(count)')
          .eq('nim', activeNim)
          .order('entry_date', { ascending: false });

        if (entries && entries.length > 0) {
          setRekap(entries.map((e: any) => ({
            date: e.entry_date,
            count: e.logbook_activity?.[0]?.count || 1,
            status: 'Tersimpan (Cloud)'
          })));
          return;
        }
      } catch {}

      const allLogs = JSON.parse(localStorage.getItem(`sukahaji_logbook_${activeNim}`) || '{}');
      const tempRekap = Object.keys(allLogs).map(date => ({
        date,
        count: allLogs[date].length,
        status: allLogs[date].length > 0 ? 'Tersimpan' : 'Draft'
      })).sort((a, b) => b.date.localeCompare(a.date));
      setRekap(tempRekap);
    };

    fetchRekap();
  }, [activeNim, activities]);

  const handleAddRow = () => {
    if (!kegiatanText.trim() || !outputText.trim()) return;
    const newAct = {
      id: String(Date.now()),
      kegiatan: kegiatanText.trim(),
      output: outputText.trim(),
      volume: 1,
      satuan: 'kali',
      bukti_foto_url: photoPreviews.length > 0 ? JSON.stringify(photoPreviews) : '📷 default_foto.jpg'
    };
    setActivities(prev => [...prev, newAct]);
    setKegiatanText('');
    setOutputText('');
    setPhotoPreviews([]);
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
      const res = await fetch('/api/sync/logbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nim: activeNim, logbookData: allLogs })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.updatedLogbookData) {
          localStorage.setItem(`sukahaji_logbook_${activeNim}`, JSON.stringify(data.updatedLogbookData));
          setActivities(data.updatedLogbookData[selectedDate] || []);
        }
      }
    } catch (e) {
      console.warn("Background logbook sync failed, saved locally:", e);
    }
  };

  const handleDeleteDayLogbook = async () => {
    if (!activeNim) return;
    if (!confirm('Apakah Anda yakin ingin menghapus seluruh logbook pada tanggal ini?')) return;

    const allLogs = JSON.parse(localStorage.getItem(`sukahaji_logbook_${activeNim}`) || '{}');
    delete allLogs[selectedDate];
    localStorage.setItem(`sukahaji_logbook_${activeNim}`, JSON.stringify(allLogs));
    setActivities([]);

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

  const activeMember = KKN_MEMBERS.find(m => m.nim === activeNim) || currentUser;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 md:p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">Buku Catatan Harian (Logbook KKN Digital)</h2>
            <p className="text-[10px] text-slate-450 mt-0.5">Pendokumentasian mandiri aktivitas harian mahasiswa KKN Sisdamas.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 md:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-400 uppercase">Pilih Tanggal:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="rounded-lg border border-slate-250 bg-white text-slate-900 px-3 py-1 text-xs outline-none focus:border-teal-sedang transition font-bold"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleDeleteDayLogbook}
                  className="rounded-xl bg-red-650 hover:bg-red-700 text-white text-[10px] md:text-xs font-bold px-3 md:px-4 py-2 cursor-pointer shadow-sm transition flex-1 sm:flex-none"
                >
                  Hapus Hari Ini
                </button>
                <button
                  onClick={handleSaveLogbook}
                  className="rounded-xl bg-teal-sedang hover:bg-[#113a48] text-white text-[10px] md:text-xs font-bold px-3 md:px-5 py-2 cursor-pointer shadow-sm transition flex-1 sm:flex-none"
                >
                  {success ? '✓ Berhasil Disimpan' : 'Simpan Logbook'}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="px-2 md:px-4 py-2 text-center w-8 md:w-12">No</th>
                    <th className="px-2 md:px-4 py-2 min-w-[120px]">Uraian Kegiatan</th>
                    <th className="px-2 md:px-4 py-2 min-w-[120px]">Output Kegiatan</th>
                    <th className="px-2 md:px-4 py-2 text-center">Foto</th>
                    <th className="px-2 md:px-4 py-2 text-center w-8 md:w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-xs">
                  {activities.map((act, index) => (
                    <tr key={act.id} className="hover:bg-slate-50/50">
                      <td className="px-2 md:px-4 py-2 md:py-3 text-center font-bold text-slate-400">{index + 1}</td>
                      <td className="px-2 md:px-4 py-2 md:py-3 font-semibold text-slate-700">{act.kegiatan}</td>
                      <td className="px-2 md:px-4 py-2 md:py-3 text-slate-600">{act.output}</td>
                      <td className="px-2 py-2 text-center min-w-[80px]">
                        {act.bukti_foto_url ? (() => {
                          let urls: string[] = [];
                          try {
                            if (act.bukti_foto_url.startsWith('[')) {
                              urls = JSON.parse(act.bukti_foto_url);
                            } else {
                              urls = [act.bukti_foto_url];
                            }
                          } catch { urls = [act.bukti_foto_url]; }

                          return (
                            <div className="flex flex-wrap gap-1 justify-center">
                              {urls.slice(0, 3).map((url, uidx) => (
                                <div key={uidx} className="relative group">
                                  {url.startsWith('https://drive.google.com/') || url.startsWith('https://lh3.') ? (
                                    <img
                                      src={url}
                                      alt={`Foto ${uidx + 1}`}
                                      className="w-10 h-10 object-cover rounded cursor-zoom-in border border-slate-200 hover:border-teal-400 transition"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling?.setAttribute('style', 'display:flex');
                                      }}
                                      onClick={() => window.open(url, '_blank')}
                                    />
                                  ) : url.startsWith('data:image') ? (
                                    <img
                                      src={url}
                                      alt={`Foto ${uidx + 1}`}
                                      className="w-10 h-10 object-cover rounded cursor-zoom-in border border-slate-200"
                                      onClick={() => window.open(url, '_blank')}
                                    />
                                  ) : (
                                    <span className="text-[9px] text-slate-400 font-bold">📷</span>
                                  )}
                                </div>
                              ))}
                              {urls.length > 3 && (
                                <span className="w-10 h-10 flex items-center justify-center text-[8px] font-black text-slate-500 bg-slate-100 rounded border border-slate-200">
                                  +{urls.length - 3}
                                </span>
                              )}
                            </div>
                          );
                        })() : (
                          <span className="text-[9px] text-slate-300 italic">–</span>
                        )}
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
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400 font-medium italic">
                        Belum ada kegiatan yang dimasukkan untuk tanggal ini. Silakan tambahkan baris kegiatan di bawah.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50/70 border border-slate-200/60 p-3 md:p-4 rounded-xl space-y-3 pt-3">
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
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-[9px] font-bold text-slate-450 uppercase">Foto Bukti:</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        const fileList = Array.from(files);
                        const readPromises = fileList.map(file => {
                          return new Promise<string>((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result as string);
                            reader.readAsDataURL(file);
                          });
                        });
                        Promise.all(readPromises).then(results => {
                          setPhotoPreviews(results);
                        });
                      }
                    }}
                    className="text-xxs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xxs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                  />
                  {photoPreviews.length > 0 && (
                    <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-150 font-bold animate-pulse">
                      📎 {photoPreviews.length} File Terpilih
                    </span>
                  )}
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
                  href={`/api/export/logbook?user_id=${activeNim}&start_date=${selectedDate}&end_date=${selectedDate}&format=docx`}
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xxs font-bold px-3 py-1.5 transition cursor-pointer shadow-sm text-center flex items-center justify-center"
                >
                  Unduh Word (Hari Ini)
                </a>
                <a
                  href={`/api/export/logbook?user_id=${activeNim}&format=docx`}
                  className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xxs font-bold px-3 py-1.5 transition cursor-pointer shadow-sm text-center flex items-center justify-center"
                >
                  Unduh Word (Semua)
                </a>
                {activeNim === '1231030055' && (
                  <a
                    href={`/api/export/logbook-kelompok?format=docx`}
                    className="rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xxs font-bold px-3 py-1.5 transition cursor-pointer shadow-sm text-center flex items-center justify-center"
                  >
                    Unduh LPJ Gabungan (Word)
                  </a>
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

              <div className="text-center pb-4">
                <h1 className="text-md font-bold uppercase tracking-wider text-black m-0" style={{ fontSize: '14pt' }}>LOGBOOK KKN SISDAMAS</h1>
                <h2 className="text-sm font-bold uppercase tracking-wide text-[#000000] mt-1" style={{ fontSize: '12pt' }}>UIN SUNAN GUNUNG DJATI BANDUNG</h2>
                <h3 className="text-xs font-bold text-[#000000] mt-1" style={{ fontSize: '11pt' }}>TAHUN AKADEMIK 2025/2026</h3>
              </div>

              <div className="py-2 text-[11pt] text-[#000000]">
                <ol className="list-decimal pl-5 space-y-1">
                  <li><strong>Nama:</strong> {activeMember?.name || '-'}</li>
                  <li><strong>NIM / Prodi:</strong> {activeMember?.nim || '-'} / {activeMember?.prodi || '-'}</li>
                  <li><strong>Fakultas:</strong> {activeMember?.fakultas || '-'}</li>
                  <li><strong>Kelompok:</strong> Kelompok 56</li>
                  <li><strong>Lokasi:</strong> Dusun 2, Desa Sukahaji, Kecamatan Cipeundeuy, Kabupaten Bandung Barat, Provinsi Jawa Barat</li>
                </ol>
              </div>

              <div className="mt-4">
                <table className="w-full border-collapse border border-[#000000] text-[11pt] text-[#000000]">
                  <thead>
                    <tr style={{ backgroundColor: '#fff2cc' }}>
                      <th className="border border-[#000000] px-2 py-1 text-center w-12 font-bold">No</th>
                      <th className="border border-[#000000] px-2 py-1 text-center w-28 font-bold">Tanggal</th>
                      <th className="border border-[#000000] px-2 py-1 text-left font-bold">Kegiatan</th>
                      <th className="border border-[#000000] px-2 py-1 text-left font-bold">Output</th>
                      <th className="border border-[#000000] px-2 py-1 text-center w-20 font-bold">Bukti Foto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((act, idx) => {
                      const d = new Date(selectedDate);
                      const day = String(d.getDate()).padStart(2, '0');
                      const month = String(d.getMonth() + 1).padStart(2, '0');
                      const year = d.getFullYear();
                      const dateFormatted = `${day}/${month}/${year}`;

                      return (
                        <tr key={act.id}>
                          <td className="border border-[#000000] px-2 py-1 text-center font-bold">{idx + 1}</td>
                          <td className="border border-[#000000] px-2 py-1 text-center">{dateFormatted}</td>
                          <td className="border border-[#000000] px-2 py-1">{act.kegiatan}</td>
                          <td className="border border-[#000000] px-2 py-1">{act.output}</td>
                          <td className="border border-[#000000] px-2 py-1 text-center">
                            {act.bukti_foto_url ? (
                              <img
                                src={act.bukti_foto_url}
                                alt="Bukti"
                                className="w-12 h-12 object-cover mx-auto block"
                              />
                            ) : (
                              <span className="text-[9pt] text-slate-400">Tidak ada foto</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {activities.length === 0 && (
                      <tr>
                        <td colSpan={5} className="border border-[#000000] px-2 py-4 text-center italic text-[#000000]">
                          Tidak ada data kegiatan KKN untuk tanggal ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 flex justify-between text-[11pt] text-[#000000]">
                <div className="flex flex-col justify-between h-[110px] w-[45%]">
                  <div>
                    <p className="m-0">Bandung Barat, ........................ 2026</p>
                    <p className="font-bold mt-1">Peserta,</p>
                  </div>
                  <div>
                    <p className="font-bold m-0">{activeMember?.name}</p>
                    <p className="mt-1">NIM. {activeMember?.nim}</p>
                  </div>
                </div>
                <div className="flex flex-col justify-between h-[110px] w-[45%]">
                  <div>
                    <p className="m-0">&nbsp;</p>
                    <p className="font-bold mt-1">Ketua Kelompok,</p>
                  </div>
                  <div>
                    <p className="font-bold m-0">Arpan Maulana</p>
                    <p className="mt-1">NIM. 1231030055</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col items-center justify-between text-[11pt] text-[#000000] h-[110px]">
                <div className="text-center">
                  <p className="m-0">Mengetahui,</p>
                  <p className="font-bold mt-1">Dosen Pembimbing Lapangan (DPL)</p>
                </div>
                <div className="text-center">
                  <p className="font-bold m-0">Dr. Hj. Yani Heryani, M.Ag.</p>
                  <p className="mt-1">NIP. 197207101998021001</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
