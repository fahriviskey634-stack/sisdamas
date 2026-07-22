import React, { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';
import { normalizeMedia, downloadSingleMedia } from './utils';

export default function DokumentasiGalleryView() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [selectedProgId, setSelectedProgId] = useState<string>('');
  const [lightboxUrl, setLightboxUrl] = useState<string>('');
  const [lightboxType, setLightboxType] = useState<string>('image');

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
        if (parsed.length > 0 && !selectedProgId) setSelectedProgId(parsed[0].id);
      } catch {}
    }

    // 2. Background revalidate dari cloud
    try {
      const res = await fetch(`/api/sync/programs?t=${Date.now()}`, { cache: 'no-store' });
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setPrograms(result.data);
        if (!selectedProgId && result.data.length > 0) setSelectedProgId(result.data[0].id);
        localStorage.setItem('sukahaji_siklus4_programs_v3', JSON.stringify(result.data));
      }
    } catch {}
  };

  const activeProg = programs.find((p: any) => p.id === selectedProgId);

  const mediaItems = activeProg?.photo_urls?.map(normalizeMedia) || [];

  const handleDownloadAll = () => {
    mediaItems.forEach((media: any, i: number) => {
      setTimeout(() => {
        downloadSingleMedia(media, i, activeProg?.name);
      }, i * 600);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header + Program Selector */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">📸 Galeri Dokumentasi Program Kerja KKN</h2>
            <p className="text-[10px] text-slate-450 mt-0.5">Foto & video program kerja yang tersimpan di Google Drive. Klik gambar untuk fullscreen.</p>
          </div>
          {mediaItems.length > 0 && (
            <button
              onClick={handleDownloadAll}
              className="rounded-xl bg-slate-700 hover:bg-slate-900 text-white text-[10px] font-bold px-4 py-2 flex items-center gap-1.5 cursor-pointer shadow-sm transition whitespace-nowrap"
            >
              ⬇ Download Semua ({mediaItems.length})
            </button>
          )}
        </div>

        <div className="max-w-md">
          <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase">Pilih Rencana Program Kerja</label>
          <select
            value={selectedProgId}
            onChange={(e) => setSelectedProgId(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white text-slate-950 px-3 py-2 text-xs outline-none focus:border-teal-sedang font-bold"
          >
            {programs.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
            {programs.length === 0 && (
              <option value="">(Belum ada program kerja)</option>
            )}
          </select>
        </div>
      </div>

      {/* Media Grid */}
      {activeProg ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">{activeProg.name}</h3>
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

          {mediaItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mediaItems.map((media: any, index: number) => (
                <div key={index} className="group relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shadow-sm hover:shadow-md transition">
                  {media.type === 'video' ? (
                    <div className="w-full h-44 bg-slate-800 flex flex-col items-center justify-center gap-2 cursor-pointer"
                      onClick={() => { setLightboxUrl(media.driveUrl || media.viewUrl); setLightboxType('video'); }}>
                      <span className="text-4xl">🎥</span>
                      <span className="text-white text-[10px] font-bold">Klik untuk putar</span>
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
            <div className="py-12 text-center text-slate-400 font-medium italic space-y-2">
              <Camera className="h-8 w-8 mx-auto text-slate-300 animate-bounce" />
              <p>Belum ada dokumentasi foto/video untuk program kerja ini.</p>
              <p className="text-[9px] text-slate-400">Silakan edit program kerja di menu "Siklus 4" untuk menambahkan foto/video.</p>
            </div>
          )}
        </div>
      ) : programs.length > 0 ? null : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center text-slate-400 space-y-2 shadow-sm">
          <Camera className="h-8 w-8 mx-auto text-slate-300" />
          <p className="font-semibold text-sm">Belum ada program kerja</p>
          <p className="text-[10px]">Tambahkan program kerja di menu Siklus 4 terlebih dahulu.</p>
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
