import React, { useState, useEffect } from 'react';
import { Trash2, Edit } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Siklus4View() {
  const [programs, setPrograms] = useState<any[]>([]);
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
  const [newMediaFiles, setNewMediaFiles] = useState<File[]>([]);
  const [newPhotos, setNewPhotos] = useState<string[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [editingProg, setEditingProg] = useState<any | null>(null);

  // Load programs & priority problems from Backend API with Supabase fallback
  useEffect(() => {
    fetchPriorityProblems();
    fetchPrograms();
  }, []);

  const fetchPriorityProblems = async () => {
    try {
      const res = await fetch('/api/sync/priority-items');
      const result = await res.json();
      if (result.success && result.data && result.data.length > 0) {
        setPriorityProblems(result.data);
        setNewPriority(result.data[0].problem_text);
        localStorage.setItem('sukahaji_priority_items_v3', JSON.stringify(result.data));
        return;
      }
    } catch {}

    const savedProblems = localStorage.getItem('sukahaji_priority_items_v3');
    if (savedProblems) {
      const parsed = JSON.parse(savedProblems);
      setPriorityProblems(parsed);
      if (parsed.length > 0) setNewPriority(parsed[0].problem_text);
    }
  };

  const fetchPrograms = async () => {
    try {
      const res = await fetch('/api/sync/programs');
      const result = await res.json();
      if (result.success && result.data && result.data.length > 0) {
        setPrograms(result.data);
        localStorage.setItem('sukahaji_siklus4_programs_v3', JSON.stringify(result.data));
        return;
      }
    } catch {}

    const savedProgs = localStorage.getItem('sukahaji_siklus4_programs_v3');
    if (savedProgs) setPrograms(JSON.parse(savedProgs));
  };

  const syncProgramsToSupabase = async (updatedProgs: any[]) => {
    localStorage.setItem('sukahaji_siklus4_programs_v3', JSON.stringify(updatedProgs));
    try {
      await fetch('/api/sync/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programs: updatedProgs })
      });
    } catch (err) {
      console.error('Gagal sinkronisasi program ke API Cloud:', err);
    }
  };

  const handleStartEdit = (prog: any) => {
    setEditingProg(prog);
    setNewName(prog.name);
    setNewPriority(prog.priorityName);
    setNewVolume(prog.volume);
    setNewFrequency(prog.frequency);
    setNewLocation(prog.location);
    setNewTarget(prog.target);
    setNewBudget(prog.budget);
    setNewPic(prog.pic);
    setNewStatus(prog.status);
    setNewProgress(prog.progress);
    setNewDesc(prog.description || '');
    setNewEval(prog.evaluation || '');
    setNewPhotos([]);
    setPhotoPreviews([]);
    setNewMediaFiles([]);
    setUploadError('');
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelForm = () => {
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
    setNewPhotos([]);
    setPhotoPreviews([]);
    setNewMediaFiles([]);
    setUploadError('');
    setEditingProg(null);
    setShowAddForm(false);
  };

  const compressImageFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const maxWidth = 1200;
          const maxHeight = 1200;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        };
        img.onerror = () => {
          const fallbackReader = new FileReader();
          fallbackReader.onloadend = () => resolve(fallbackReader.result as string);
          fallbackReader.readAsDataURL(file);
        };
      };
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!newName) return;
    setUploadError('');
    setUploadingPhotos(true);

    let driveUrls: any[] = [];

    if (newPhotos.length > 0) {
      try {
        const res = await fetch('/api/sync/program-kerja', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            photos: newPhotos,
            programName: newName
          })
        });

        const textRes = await res.text();
        let data: any = {};
        try {
          data = JSON.parse(textRes);
        } catch {
          if (res.status === 413 || textRes.includes('Request Entity Too Large')) {
            setUploadError('Ukuran file media terlalu besar untuk dikirim sekaligus. Mohon kurangi jumlah/ukuran foto atau video.');
          } else {
            setUploadError(`Error server (${res.status}): ${textRes.substring(0, 100)}`);
          }
          setUploadingPhotos(false);
          return;
        }

        if (!res.ok) {
          setUploadError(data.error || 'Gagal upload foto/video.');
          setUploadingPhotos(false);
          return;
        }
        driveUrls = data.urls || [];
      } catch (err: any) {
        setUploadError(`Koneksi gagal: ${err.message}`);
        setUploadingPhotos(false);
        return;
      }
    }

    const newViewUrls = driveUrls.map((u: any) => ({
      viewUrl: u.viewUrl,
      downloadUrl: u.downloadUrl,
      driveUrl: u.driveUrl,
      type: u.type || 'image'
    }));

    if (editingProg) {
      const updatedProg = {
        ...editingProg,
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
        evaluation: newEval,
        photo_urls: [...(editingProg.photo_urls || []), ...newViewUrls]
      };
      const updated = programs.map((p: any) => p.id === editingProg.id ? updatedProg : p);
      setPrograms(updated);
      syncProgramsToSupabase(updated);
      setEditingProg(null);
    } else {
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
        evaluation: newEval,
        photo_urls: newViewUrls
      };
      const updated = [newProg, ...programs];
      setPrograms(updated);
      syncProgramsToSupabase(updated);
    }

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
    setNewPhotos([]);
    setPhotoPreviews([]);
    setNewMediaFiles([]);
    setUploadingPhotos(false);
    setShowAddForm(false);
  };

  const deleteProgram = async (id: string) => {
    const updated = programs.filter(p => p.id !== id);
    setPrograms(updated);
    syncProgramsToSupabase(updated);
    try {
      await supabase.from('program').delete().eq('id', id);
    } catch {}
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
          onClick={() => {
            if (showAddForm) {
              handleCancelForm();
            } else {
              setShowAddForm(true);
            }
          }}
          className="rounded-xl bg-teal-sedang hover:bg-[#113a48] text-white text-xs font-bold px-4 py-2 cursor-pointer shadow-sm transition"
        >
          {showAddForm ? 'Batal' : '+ Tambah Program Kerja'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-extrabold text-xs text-slate-850 uppercase tracking-wider border-b border-slate-100 pb-2">
            {editingProg ? `Edit Program Kerja: ${editingProg.name}` : 'Form Rencana Program Baru (Tabel 3)'}
          </h3>
          
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

          <div className="border-t border-slate-100 pt-3 space-y-3">
            <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase">Dokumentasi Foto / Video Kegiatan (Upload ke Google Drive)</label>
            
            {uploadError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 font-semibold flex items-start gap-2">
                <span>⚠️</span>
                <span>{uploadError}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    const fileList = Array.from(files);
                    setNewMediaFiles(fileList);
                    const blobPreviews = fileList.map(f => URL.createObjectURL(f));
                    setPhotoPreviews(blobPreviews);
                    const readPromises = fileList.map(file => compressImageFile(file));
                    Promise.all(readPromises).then(results => {
                      setNewPhotos(results);
                      setUploadError('');
                    });
                  }
                }}
                className="text-xxs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xxs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
              />
              {photoPreviews.length > 0 && (
                <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-150 font-bold">
                  📎 {photoPreviews.length} File Dipilih
                </span>
              )}
            </div>

            {photoPreviews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mt-2">
                {photoPreviews.map((previewUrl, idx) => (
                  <div key={idx} className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50 aspect-square">
                    {newMediaFiles[idx]?.type.startsWith('video/') ? (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-[10px] font-bold p-1">
                        <span className="text-2xl">🎥</span>
                        <span className="truncate w-full text-center">{newMediaFiles[idx].name}</span>
                      </div>
                    ) : (
                      <img src={previewUrl} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    )}
                    <span className="absolute bottom-0 left-0 right-0 bg-slate-900/60 text-white text-[8px] font-bold text-center py-0.5">
                      {newMediaFiles[idx]?.type.startsWith('video/') ? '🎥 Video' : '📷 Foto'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={uploadingPhotos}
              className="rounded-xl bg-teal-sedang hover:bg-[#113a48] disabled:bg-slate-400 text-white text-xs font-bold px-6 py-2.5 shadow-md cursor-pointer transition flex items-center gap-2"
            >
              {uploadingPhotos ? (
                <>
                  <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                  Mengunggah Foto ke Drive...
                </>
              ) : (
                'Simpan Rencana Program'
              )}
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
                          
                          {prog.photo_urls && prog.photo_urls.length > 0 && (
                            <div className="md:col-span-3 border-t border-slate-100 pt-3 space-y-2">
                              <span className="font-black text-slate-400 uppercase tracking-wider block">Dokumentasi Foto Kegiatan (Google Drive Backup)</span>
                              <div className="flex flex-wrap gap-2">
                                {prog.photo_urls.map((item: any, idx: number) => {
                                  const url = typeof item === 'string' ? item : (item.viewUrl || item.driveUrl || '');
                                  return (
                                    <a
                                      key={idx}
                                      href={url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-block relative rounded-lg border border-slate-200 overflow-hidden hover:opacity-80 transition cursor-pointer"
                                    >
                                      <img
                                        src={url}
                                        alt={`Dokumentasi ${idx + 1}`}
                                        className="h-16 w-24 object-cover"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                      <span className="absolute bottom-0 left-0 right-0 bg-slate-900/70 text-white text-[8px] font-bold text-center py-0.5">
                                        Buka Foto {idx + 1}
                                      </span>
                                    </a>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <div className="md:col-span-3 flex justify-end gap-2 border-t border-slate-150/70 pt-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEdit(prog);
                              }}
                              className="rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 font-bold px-3.5 py-1.5 flex items-center gap-1.5 cursor-pointer transition text-xxs"
                            >
                              <Edit className="h-3 w-3" /> Edit Detail Program Kerja
                            </button>
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
