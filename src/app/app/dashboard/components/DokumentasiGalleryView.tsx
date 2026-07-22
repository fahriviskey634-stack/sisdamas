import React, { useState, useEffect } from 'react';
import { Camera, Plus, Upload, X, Image as ImageIcon, Video as VideoIcon, RefreshCw, Download, FolderPlus, Folder, Filter } from 'lucide-react';
import { normalizeMedia, downloadSingleMedia } from './utils';

export default function DokumentasiGalleryView() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [selectedProgId, setSelectedProgId] = useState<string>('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all'); // 'all' | '55' | '56' | '57'
  const [lightboxUrl, setLightboxUrl] = useState<string>('');
  const [lightboxType, setLightboxType] = useState<string>('image');

  // Direct Gallery Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadMode, setUploadMode] = useState<'existing' | 'custom'>('existing');
  const [uploadTargetProgId, setUploadTargetProgId] = useState<string>('');
  const [customFolderName, setCustomFolderName] = useState<string>('');
  const [filePreviews, setFilePreviews] = useState<{ url: string; type: string; file: File }[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    // 1. Instant load dari cache lokal (0ms delay)
    const savedProgs = localStorage.getItem('sukahaji_siklus4_programs_v3');
    if (savedProgs) {
      try {
        const parsed = JSON.parse(savedProgs);
        setPrograms(parsed);
        if (parsed.length > 0 && !selectedProgId) {
          setSelectedProgId(parsed[0].id);
          setUploadTargetProgId(parsed[0].id);
        }
      } catch {}
    }

    // 2. Background revalidate dari cloud
    try {
      const res = await fetch(`/api/sync/programs?t=${Date.now()}`, { cache: 'no-store' });
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setPrograms(result.data);
        if (result.data.length > 0) {
          if (!selectedProgId) setSelectedProgId(result.data[0].id);
          if (!uploadTargetProgId) setUploadTargetProgId(result.data[0].id);
        }
        localStorage.setItem('sukahaji_siklus4_programs_v3', JSON.stringify(result.data));
      }
    } catch {}
  };

  // Filter programs based on selected group
  const filteredPrograms = programs.filter((p: any) => {
    if (selectedGroupFilter === 'all') return true;
    if (p.group) return p.group === selectedGroupFilter;
    // Fallback: check if description or name contains group tag
    if (selectedGroupFilter === '55' && (p.name.includes('55') || p.description?.includes('55'))) return true;
    if (selectedGroupFilter === '57' && (p.name.includes('57') || p.description?.includes('57'))) return true;
    if (selectedGroupFilter === '56' && (!p.name.includes('55') && !p.name.includes('57'))) return true;
    return selectedGroupFilter === '56';
  });

  const activeProg = filteredPrograms.find((p: any) => p.id === selectedProgId) || filteredPrograms[0] || programs.find((p: any) => p.id === selectedProgId);
  const mediaItems = activeProg?.photo_urls?.map(normalizeMedia) || [];

  const handleDownloadAll = () => {
    mediaItems.forEach((media: any, i: number) => {
      setTimeout(() => {
        downloadSingleMedia(media, i, activeProg?.name);
      }, i * 600);
    });
  };

  const compressFile = (file: File): Promise<string> => {
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadError('');
    const newPreviews: { url: string; type: string; file: File }[] = [];

    for (const file of files) {
      const isVideo = file.type.startsWith('video/');
      const dataUrl = await compressFile(file);
      newPreviews.push({
        url: dataUrl,
        type: isVideo ? 'video' : 'image',
        file
      });
    }

    setFilePreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemovePreview = (index: number) => {
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (filePreviews.length === 0) {
      setUploadError('Silakan pilih minimal 1 foto atau video terlebih dahulu.');
      return;
    }

    let folderTitle = '';
    if (uploadMode === 'custom') {
      if (!customFolderName.trim()) {
        setUploadError('Silakan masukkan Nama Folder Google Drive terlebih dahulu.');
        return;
      }
      folderTitle = customFolderName.trim();
    } else {
      const p = programs.find((x: any) => x.id === uploadTargetProgId);
      folderTitle = p ? p.name : 'Dokumentasi Kegiatan KKN';
    }

    const currentGroup = selectedGroupFilter === 'all' ? '56' : selectedGroupFilter;

    setUploading(true);
    setUploadStatus(`Membuat folder "${folderTitle}" di Google Drive Kelompok ${currentGroup}...`);
    setUploadError('');

    try {
      // 1. Upload ke Google Drive via API dokumentasi-umum (otomatis membuat folder terpisah di Drive)
      const base64Photos = filePreviews.map(p => p.url);
      const driveRes = await fetch('/api/sync/dokumentasi-umum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          galleryName: folderTitle,
          photos: base64Photos,
          group: currentGroup
        })
      });

      const textRes = await driveRes.text();
      let data: any = {};
      try {
        data = JSON.parse(textRes);
      } catch {
        throw new Error(`Error server Drive (${driveRes.status}): ${textRes.substring(0, 100)}`);
      }

      if (!driveRes.ok) {
        throw new Error(data.error || 'Gagal membuat folder & mengunggah file ke Google Drive');
      }

      const driveUrls = data.urls || [];
      const newViewUrls = driveUrls.map((u: any) => {
        if (typeof u === 'string') return { viewUrl: u, downloadUrl: u, driveUrl: u, type: 'image' };
        return {
          viewUrl: u.viewUrl || u,
          downloadUrl: u.downloadUrl || u.viewUrl || u,
          driveUrl: u.driveUrl || u.viewUrl || u,
          type: u.type || 'image'
        };
      });

      let updatedPrograms = [...programs];
      let targetProgId = uploadTargetProgId;

      if (uploadMode === 'custom' || !uploadTargetProgId) {
        // Buat Kategori Album / Program Baru di state & DB
        const newProg = {
          id: String(Date.now()),
          name: folderTitle,
          priorityName: 'Dokumentasi Kegiatan',
          volume: `${filePreviews.length} Media`,
          frequency: 'Dokumentasi',
          location: 'Desa Sukahaji',
          target: 'Dokumentasi Publik',
          budget: '-',
          pic: `Tim PDD KKN ${currentGroup}`,
          status: 'Completed',
          progress: 100,
          description: `Folder Drive: ${data.folderName || folderTitle}`,
          evaluation: '',
          photo_urls: newViewUrls,
          group: currentGroup
        };
        updatedPrograms = [newProg, ...updatedPrograms];
        targetProgId = newProg.id;
      } else {
        // Tambahkan ke Program Kerja yang sudah ada
        updatedPrograms = updatedPrograms.map((p: any) => {
          if (p.id === uploadTargetProgId) {
            return {
              ...p,
              photo_urls: [...(p.photo_urls || []), ...newViewUrls],
              group: p.group || currentGroup
            };
          }
          return p;
        });
      }

      // 2. Simpan ke LocalStorage & Cloud Supabase Database
      setPrograms(updatedPrograms);
      setSelectedProgId(targetProgId);
      localStorage.setItem('sukahaji_siklus4_programs_v3', JSON.stringify(updatedPrograms));

      await fetch('/api/sync/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programs: updatedPrograms })
      });

      setUploadStatus(`✓ Sukses! Folder "${data.folderName || folderTitle}" berhasil dibuat di Google Drive!`);
      setTimeout(() => {
        setUploading(false);
        setShowUploadModal(false);
        setFilePreviews([]);
        setCustomFolderName('');
        setUploadStatus('');
      }, 1200);

    } catch (err: any) {
      setUploadError(err.message || 'Gagal mengunggah dokumentasi.');
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header + Program Selector + Upload Button */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">📸 Galeri Dokumentasi & Album Google Drive</h2>
            <p className="text-[10px] text-slate-450 mt-0.5">Foto & video tersimpan rapi dalam folder otomatis Google Drive. Klik gambar untuk pemutar fullscreen.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setShowUploadModal(true);
                if (filteredPrograms.length > 0 && !uploadTargetProgId) setUploadTargetProgId(filteredPrograms[0].id);
              }}
              className="rounded-xl bg-teal-sedang hover:bg-[#113a48] text-white text-[10px] font-bold px-4 py-2 flex items-center gap-1.5 cursor-pointer shadow-sm transition whitespace-nowrap"
            >
              <FolderPlus className="h-4 w-4" /> + Tambah Folder / Foto Drive
            </button>

            {mediaItems.length > 0 && (
              <button
                onClick={handleDownloadAll}
                className="rounded-xl bg-slate-700 hover:bg-slate-900 text-white text-[10px] font-bold px-4 py-2 flex items-center gap-1.5 cursor-pointer shadow-sm transition whitespace-nowrap"
              >
                <Download className="h-3.5 w-3.5" /> Download Semua ({mediaItems.length})
              </button>
            )}
          </div>
        </div>

        {/* Group Filter Selector (Semua, 55, 56, 57) */}
        <div className="space-y-2 border-t border-slate-100 pt-3">
          <label className="text-[9px] font-black text-slate-400 flex items-center gap-1.5 uppercase">
            <Filter className="h-3 w-3 text-teal-600" /> Filter Kelompok / Wilayah Dusun:
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedGroupFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                selectedGroupFilter === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              📌 Semua Kelompok Sukahaji
            </button>
            <button
              onClick={() => setSelectedGroupFilter('55')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                selectedGroupFilter === '55'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
              }`}
            >
              🔵 Kelompok 55 (Dusun 1)
            </button>
            <button
              onClick={() => setSelectedGroupFilter('56')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                selectedGroupFilter === '56'
                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                  : 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
              }`}
            >
              🟢 Kelompok 56 (Dusun 2)
            </button>
            <button
              onClick={() => setSelectedGroupFilter('57')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                selectedGroupFilter === '57'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              🔴 Kelompok 57 (Dusun 3)
            </button>
          </div>
        </div>

        {/* Album Selector */}
        <div className="max-w-md pt-1">
          <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase">Pilih Album / Program Kerja ({filteredPrograms.length} Album)</label>
          <select
            value={selectedProgId}
            onChange={(e) => setSelectedProgId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white text-slate-950 px-3 py-2 text-xs outline-none focus:border-teal-sedang font-bold"
          >
            {filteredPrograms.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name} {p.group ? `(Kelompok ${p.group})` : ''}</option>
            ))}
            {filteredPrograms.length === 0 && (
              <option value="">(Belum ada album untuk kelompok ini)</option>
            )}
          </select>
        </div>
      </div>

      {/* Media Grid */}
      {activeProg ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
                <Folder className="h-4 w-4 text-teal-sedang" /> {activeProg.name}
              </h3>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[10px]">
                <span className="text-slate-500">PJ: <strong className="text-slate-700">{activeProg.pic}</strong></span>
                <span className="h-3 w-px bg-slate-200" />
                <span className="text-slate-500">Status: <strong className="text-slate-700">{activeProg.status} ({activeProg.progress}%)</strong></span>
                <span className="h-3 w-px bg-slate-200" />
                <span className="text-slate-500">Lokasi: <strong className="text-slate-700">{activeProg.location}</strong></span>
                <span className="h-3 w-px bg-slate-200" />
                <span className="font-bold text-teal-700 bg-teal-50 border border-teal-150 px-2 py-0.5 rounded-full">
                  {mediaItems.length} Media
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowUploadModal(true);
                setUploadMode('existing');
                setUploadTargetProgId(activeProg.id);
              }}
              className="text-[10px] font-bold text-teal-sedang bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer w-fit"
            >
              <Plus className="h-3.5 w-3.5" /> Tambah Media ke Folder Ini
            </button>
          </div>

          {mediaItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mediaItems.map((media: any, index: number) => (
                <div key={index} className="group relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shadow-sm hover:shadow-md transition">
                  {media.type === 'video' ? (
                    <div className="w-full h-44 bg-slate-800 flex flex-col items-center justify-center gap-2 cursor-pointer"
                      onClick={() => { setLightboxUrl(media.driveUrl || media.viewUrl); setLightboxType('video'); }}>
                      <span className="text-4xl">🎥</span>
                      <span className="text-white text-[10px] font-bold">Klik untuk putar video</span>
                    </div>
                  ) : (
                    <img
                      src={media.viewUrl}
                      alt={`Dokumentasi ${index + 1}`}
                      className="w-full h-44 object-cover cursor-zoom-in group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.querySelector('.img-fallback')?.setAttribute('style', 'display:flex');
                      }}
                      onClick={() => { setLightboxUrl(media.viewUrl); setLightboxType('image'); }}
                    />
                  )}

                  <div className="img-fallback hidden w-full h-44 flex-col items-center justify-center bg-slate-100 text-slate-400 gap-1">
                    <span className="text-3xl">📷</span>
                    <span className="text-[10px] font-semibold">Gambar tidak dapat dimuat</span>
                    <a href={media.driveUrl} target="_blank" rel="noreferrer" className="text-[9px] text-teal-600 underline mt-1">Buka di Drive</a>
                  </div>

                  <div className="p-2.5 bg-white border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                        media.type === 'video'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-teal-50 text-teal-700 border-teal-200'
                      }`}>
                        {media.type === 'video' ? '🎥 Video' : '📷 Foto'} #{index + 1}
                      </span>

                      <div className="flex items-center gap-1">
                        <a
                          href={media.driveUrl}
                          target="_blank"
                          rel="noreferrer"
                          title="Buka di Drive"
                          className="text-[10px] text-slate-500 hover:text-teal-700 p-1 rounded transition font-bold"
                        >
                          🔗
                        </a>
                        <button
                          onClick={() => downloadSingleMedia(media, index, activeProg?.name)}
                          title="Download File"
                          className="text-[10px] text-slate-500 hover:text-blue-700 p-1 rounded transition font-bold cursor-pointer"
                        >
                          ⬇
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 font-medium italic space-y-3">
              <Camera className="h-10 w-10 mx-auto text-slate-300 animate-bounce" />
              <p>Belum ada dokumentasi foto/video di folder ini.</p>
              <button
                onClick={() => {
                  setShowUploadModal(true);
                  setUploadMode('existing');
                  setUploadTargetProgId(activeProg.id);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-sedang text-white text-xs font-bold px-4 py-2 hover:bg-[#113a48] transition cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Unggah Foto/Video Ke Folder Ini
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center text-slate-400 space-y-3 shadow-sm">
          <Camera className="h-10 w-10 mx-auto text-slate-300" />
          <p className="font-semibold text-sm">Belum ada album dokumentasi terdaftar untuk filter ini</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-sedang text-white text-xs font-bold px-4 py-2 hover:bg-[#113a48] transition cursor-pointer"
          >
            <FolderPlus className="h-4 w-4" /> Buat Folder Drive & Unggah Media
          </button>
        </div>
      )}

      {/* Direct Upload Modal with Custom Folder Creation */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-fade-in border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-sedang">
                  <FolderPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm">Unggah Media & Buat Folder Google Drive</h3>
                  <p className="text-[10px] text-slate-400">File akan otomatis tersimpan dalam subfolder kelompok di Google Drive.</p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                disabled={uploading}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Toggle Target Folder Mode */}
              <div className="bg-slate-100 p-1 rounded-xl flex gap-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setUploadMode('existing')}
                  className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
                    uploadMode === 'existing' ? 'bg-white text-teal-sedang shadow-xs' : 'text-slate-500'
                  }`}
                >
                  📁 Ke Program Kerja yang Ada
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('custom')}
                  className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
                    uploadMode === 'custom' ? 'bg-white text-teal-sedang shadow-xs' : 'text-slate-500'
                  }`}
                >
                  ➕ Buat Folder Baru Drive
                </button>
              </div>

              {uploadMode === 'existing' ? (
                <div>
                  <label className="text-[10px] font-black text-slate-500 block mb-1 uppercase">Pilih Program Kerja Target</label>
                  <select
                    value={uploadTargetProgId}
                    onChange={(e) => setUploadTargetProgId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 px-3 py-2 text-xs outline-none focus:border-teal-sedang font-bold"
                  >
                    {filteredPrograms.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                    {filteredPrograms.length === 0 && (
                      <option value="">(Belum ada program kerja)</option>
                    )}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-[10px] font-black text-slate-500 block mb-1 uppercase">Nama Folder Khusus Google Drive</label>
                  <input
                    type="text"
                    value={customFolderName}
                    onChange={(e) => setCustomFolderName(e.target.value)}
                    placeholder="Contoh: Sosialisasi Stunting RT 02 / Kegiatan Posyandu..."
                    className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 px-3 py-2 text-xs outline-none focus:border-teal-sedang font-bold"
                  />
                  <p className="text-[9px] text-slate-400 mt-1">
                    Google Drive akan otomatis membuat folder bernama: <strong>[Tanggal Hari Ini] - {customFolderName || '[Nama Folder]'}</strong>
                  </p>
                </div>
              )}

              <div>
                <label className="text-[10px] font-black text-slate-500 block mb-1 uppercase">Pilih File Foto / Video Lapangan</label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                />
              </div>

              {/* Previews */}
              {filePreviews.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500">Pratinjau File ({filePreviews.length}):</span>
                  <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-100">
                    {filePreviews.map((prev, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 h-16 bg-slate-200">
                        {prev.type === 'video' ? (
                          <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white text-xs">🎥</div>
                        ) : (
                          <img src={prev.url} alt="Preview" className="w-full h-full object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemovePreview(idx)}
                          className="absolute top-0.5 right-0.5 bg-black/70 hover:bg-red-600 text-white rounded-full p-0.5 text-[8px] transition cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {uploadStatus && (
                <div className="bg-teal-50 border border-teal-200 text-teal-800 text-[10px] rounded-xl p-3 font-bold flex items-center gap-2">
                  {uploading && <RefreshCw className="h-3.5 w-3.5 animate-spin text-teal-600" />}
                  <span>{uploadStatus}</span>
                </div>
              )}

              {uploadError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-[10px] rounded-xl p-3 font-bold">
                  ⚠ {uploadError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                  className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploading || filePreviews.length === 0}
                  className="rounded-xl bg-teal-sedang hover:bg-[#113a48] disabled:opacity-50 text-white text-xs font-bold px-5 py-2 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {uploading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploading ? 'Mengunggah...' : 'Buat Folder & Unggah ke Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl('')}
        >
          <button
            onClick={() => setLightboxUrl('')}
            className="absolute top-4 right-4 text-white bg-white/20 hover:bg-white/40 rounded-full p-2 text-lg font-bold transition cursor-pointer z-10"
          >
            ✕
          </button>
          <div className="max-w-5xl max-h-[90vh] w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {lightboxType === 'video' ? (
              <iframe
                src={lightboxUrl}
                className="w-full aspect-video rounded-xl"
                allow="autoplay"
                allowFullScreen
              />
            ) : (
              <img
                src={lightboxUrl}
                alt="Preview full size"
                className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
