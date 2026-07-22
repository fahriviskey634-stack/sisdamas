import React, { useState } from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { DraftSurvey } from './types';

export default function SurveyWizardView({ switchTab, updateDraftCount, currentUser }: any) {
  const [wStep, setWStep] = useState(1);
  const [kkName, setKkName] = useState('');
  const [kkNumber, setKkNumber] = useState('');
  const [selectedRt, setSelectedRt] = useState('rt010101-0000-0000-0000-000000000001');
  const [rtLabel, setRtLabel] = useState('RT 01 / RW 01 (Dusun 2)');

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [manualGps, setManualGps] = useState(false);

  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [photoLoading, setPhotoLoading] = useState(false);

  const [familySize, setFamilySize] = useState(4);
  const [housingStatus, setHousingStatus] = useState('Milik Sendiri');
  const [housingCondition, setHousingCondition] = useState('Layak Huni');
  const [welfareLevel, setWelfareLevel] = useState('Sejahtera I');
  const [educationLevel, setEducationLevel] = useState('SMA');
  const [mainJob, setMainJob] = useState('Petani');

  const [problems, setProblems] = useState<any[]>([]);
  const [newProbCat, setNewProbCat] = useState('Infrastruktur');
  const [newProbDesc, setNewProbDesc] = useState('');

  const [potentials, setPotentials] = useState<any[]>([]);
  const [newPotCat, setNewPotCat] = useState('Usaha Mikro/UMKM');
  const [newPotDesc, setNewPotDesc] = useState('');

  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const handleGetGPS = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setGpsAccuracy(pos.coords.accuracy);
        setGpsLoading(false);
      },
      () => {
        setGpsLoading(false);
        setManualGps(true);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoLoading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 450;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, 600, 450);
        setPhotoBase64(canvas.toDataURL('image/jpeg', 0.7));
        setPhotoLoading(false);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const addProblem = () => {
    if (!newProbDesc.trim()) return;
    setProblems((prev) => [...prev, { category: newProbCat, description: newProbDesc.trim() }]);
    setNewProbDesc('');
  };

  const removeProblem = (idx: number) => {
    setProblems((prev) => prev.filter((_, i) => i !== idx));
  };

  const addPotential = () => {
    if (!newPotDesc.trim()) return;
    setPotentials((prev) => [...prev, { category: newPotCat, description: newPotDesc.trim() }]);
    setNewPotDesc('');
  };

  const removePotential = (idx: number) => {
    setPotentials((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    const draft: DraftSurvey = {
      client_uuid: 'survey-' + Math.random().toString(36).substring(2, 11),
      rt_id: selectedRt,
      rt_label: rtLabel,
      kk_name: kkName,
      kk_number: kkNumber,
      latitude: latitude || -6.7275,
      longitude: longitude || 107.3789,
      gps_accuracy: gpsAccuracy || 8,
      family_size: familySize,
      housing_status: housingStatus,
      housing_condition: housingCondition,
      welfare_level: welfareLevel,
      education_level: educationLevel,
      main_job: mainJob,
      problems,
      potentials,
      photo_url: photoBase64,
      surveyor_id: currentUser?.nim || 'ADMIN56'
    };

    // 1. Instant local backup (0ms delay)
    const existing = JSON.parse(localStorage.getItem('survey_drafts') || '[]');
    existing.push(draft);
    localStorage.setItem('survey_drafts', JSON.stringify(existing));
    updateDraftCount();

    setSaving(true);
    setSuccess('⏳ Menyimpan data kuesioner otomatis ke Server Cloud & Supabase Database...');

    // 2. Real-time automatic Cloud Direct Post to /api/surveys/sync
    try {
      const res = await fetch('/api/surveys/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drafts: [draft] })
      });

      if (res.ok) {
        setSuccess(`✓ Sukses! Data Kuesioner "${kkName}" Berhasil Disimpan Otomatis ke Cloud Server!`);
      } else {
        setSuccess(`✓ Data tersimpan di HP/Laptop (Otomatis terkirim ke cloud saat online).`);
      }
    } catch (e) {
      setSuccess(`✓ Data tersimpan di HP/Laptop (Otomatis terkirim ke cloud saat online).`);
    } finally {
      setSaving(false);
    }

    setTimeout(() => {
      setKkName('');
      setKkNumber('');
      setProblems([]);
      setPotentials([]);
      setPhotoBase64('');
      setWStep(1);
      setSuccess('');
      if (switchTab) switchTab('dashboard');
    }, 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-300/60 p-6 shadow-sm space-y-6">
      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-polaroid border border-transisi p-3 text-xs text-green-700">
          <CheckCircle className="h-4 w-4 text-teal-sedang" />
          <span>{success}</span>
        </div>
      )}

      {wStep === 1 && (
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 text-sm">Langkah 1: Identitas Kepala Keluarga</h3>
          <div>
            <label className="mb-1 block text-xxs font-semibold text-slate-500 uppercase">Nama Kepala Keluarga *</label>
            <input
              type="text"
              value={kkName}
              onChange={(e) => setKkName(e.target.value)}
              placeholder="Contoh: Bpk. Maman Rohman"
              className="w-full rounded-lg border border-slate-300 text-slate-900 bg-white px-4 py-2 text-xs outline-none focus:border-transisi"
            />
          </div>
          <div>
            <label className="mb-1 block text-xxs font-semibold text-slate-500 uppercase">Pilih RT / RW</label>
            <select
              value={selectedRt}
              onChange={(e) => {
                setSelectedRt(e.target.value);
                setRtLabel(e.target.options[e.target.selectedIndex].text);
              }}
              className="w-full rounded-lg border border-slate-300 text-slate-900 bg-white px-3 py-2 text-xs outline-none focus:border-transisi"
            >
              {/* RW 01 — 4 RT */}
              <option value="rt010101-0000-0000-0000-000000000001">RT 01 / RW 01 (Dusun 2)</option>
              <option value="rt010102-0000-0000-0000-000000000002">RT 02 / RW 01 (Dusun 2)</option>
              <option value="rt010103-0000-0000-0000-000000000003">RT 03 / RW 01 (Dusun 2)</option>
              <option value="rt010104-0000-0000-0000-000000000004">RT 04 / RW 01 (Dusun 2)</option>
              {/* RW 05 — 4 RT */}
              <option value="rt050101-0000-0000-0000-000000000005">RT 01 / RW 05 (Dusun 2)</option>
              <option value="rt050102-0000-0000-0000-000000000006">RT 02 / RW 05 (Dusun 2)</option>
              <option value="rt050103-0000-0000-0000-000000000007">RT 03 / RW 05 (Dusun 2)</option>
              <option value="rt050104-0000-0000-0000-000000000008">RT 04 / RW 05 (Dusun 2)</option>
              {/* RW 06 — 4 RT */}
              <option value="rt060101-0000-0000-0000-000000000009">RT 01 / RW 06 (Dusun 2)</option>
              <option value="rt060102-0000-0000-0000-000000000010">RT 02 / RW 06 (Dusun 2)</option>
              <option value="rt060103-0000-0000-0000-000000000011">RT 03 / RW 06 (Dusun 2)</option>
              <option value="rt060104-0000-0000-0000-000000000012">RT 04 / RW 06 (Dusun 2)</option>
              {/* RW 11 — 3 RT */}
              <option value="rt110101-0000-0000-0000-000000000013">RT 01 / RW 11 (Dusun 2)</option>
              <option value="rt110102-0000-0000-0000-000000000014">RT 02 / RW 11 (Dusun 2)</option>
              <option value="rt110103-0000-0000-0000-000000000015">RT 03 / RW 11 (Dusun 2)</option>
            </select>
          </div>
          <button onClick={() => setWStep(2)} disabled={!kkName.trim()} className="rounded-lg bg-teal-sedang hover:bg-kabut text-white font-semibold px-4 py-2 text-xs flex items-center gap-1.5 ml-auto disabled:opacity-50">
            Lanjut <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {wStep === 2 && (
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 text-sm">Langkah 2: Koordinat Lokasi & Foto Rumah</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-300/60 flex flex-col justify-between space-y-3">
              <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Penentuan Tikor (Titik Koordinat)</span>
              <div className="text-xs font-semibold text-slate-650">
                {latitude ? (
                  <div className="space-y-1">
                    <p>Latitude: <code className="font-mono text-teal-tua font-bold">{latitude.toFixed(6)}</code></p>
                    <p>Longitude: <code className="font-mono text-teal-tua font-bold">{longitude?.toFixed(6)}</code></p>
                    <p>Akurasi: <span className="text-teal-sedang font-bold">{gpsAccuracy?.toFixed(1)}m</span></p>
                  </div>
                ) : (
                  <p className="text-slate-450 italic">GPS belum melakukan capture. Klik tombol di bawah.</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={handleGetGPS} className="rounded bg-teal-sedang hover:bg-kabut text-white text-xxs font-bold px-3 py-2 transition flex-1 sm:flex-none">
                  {gpsLoading ? 'Mencari Satelit...' : 'Ambil GPS Otomatis'}
                </button>
                <button type="button" onClick={() => { setManualGps(!manualGps); if(!latitude) { setLatitude(-6.7275); setLongitude(107.3789); } }} className="rounded border border-slate-300 text-slate-700 text-xxs font-bold px-3 py-2 hover:bg-slate-100 transition flex-1 sm:flex-none">
                  {manualGps ? 'Kunci Input Manual' : 'Input Manual'}
                </button>
              </div>
              {manualGps && (
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400">LATITUDE</label>
                    <input type="number" step="any" value={latitude || ''} onChange={(e) => setLatitude(parseFloat(e.target.value))} className="w-full text-xs rounded border border-slate-300 bg-white text-slate-900 px-2 py-1" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400">LONGITUDE</label>
                    <input type="number" step="any" value={longitude || ''} onChange={(e) => setLongitude(parseFloat(e.target.value))} className="w-full text-xs rounded border border-slate-300 bg-white text-slate-900 px-2 py-1" />
                  </div>
                </div>
              )}
            </div>

            <div className="border border-dashed border-slate-300/60 rounded-lg p-4 bg-slate-50 flex flex-col justify-center items-center text-center min-h-[160px]">
              {photoBase64 ? (
                <div className="relative group">
                  <img src={photoBase64} alt="Preview" className="max-h-36 rounded shadow-md border" />
                  <button type="button" onClick={() => setPhotoBase64('')} className="absolute -top-2 -right-2 bg-red-650 text-white rounded-full p-1 text-xxs font-bold">Hapus</button>
                </div>
              ) : (
                <label className="cursor-pointer bg-teal-sedang text-white text-xxs font-bold px-4 py-2.5 rounded-lg inline-block shadow hover:bg-kabut transition w-full sm:w-auto text-center">
                  {photoLoading ? 'Menyusutkan Ukuran...' : 'Buka Kamera / Upload'}
                  <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setWStep(1)} className="rounded border border-slate-300/60 px-4 py-2 text-xs hover:bg-slate-50 transition">Kembali</button>
            <button onClick={() => setWStep(3)} disabled={!latitude || !photoBase64} className="rounded bg-teal-sedang hover:bg-kabut text-white px-4 py-2 text-xs disabled:opacity-50 transition">Lanjut</button>
          </div>
        </div>
      )}

      {wStep === 3 && (
        <div className="space-y-6">
          <h3 className="font-bold text-slate-800 text-sm">Langkah 3: Kuisioner Sosial & Masalah Partisipatif</h3>
          
          {/* Socio Demographics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-100 pb-4">
            <div>
              <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Jumlah Jiwa (Anggota Keluarga)</label>
              <input type="number" value={familySize} onChange={(e) => setFamilySize(parseInt(e.target.value) || 1)} className="w-full rounded border border-slate-300 text-slate-900 bg-white px-3 py-2 text-xs" />
            </div>
            <div>
              <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Pendidikan Terakhir Kepala Keluarga</label>
              <select value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)} className="w-full rounded border border-slate-300 text-slate-900 bg-white px-2.5 py-2 text-xs">
                <option value="SD">SD / Sederajat</option>
                <option value="SMP">SMP / Sederajat</option>
                <option value="SMA">SMA / Sederajat</option>
                <option value="Perguruan Tinggi">Perguruan Tinggi (D3/S1/S2)</option>
                <option value="Tidak Sekolah">Tidak Sekolah</option>
              </select>
            </div>
            <div>
              <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Mata Pencaharian Utama</label>
              <select value={mainJob} onChange={(e) => setMainJob(e.target.value)} className="w-full rounded border border-slate-300 text-slate-900 bg-white px-2.5 py-2 text-xs">
                <option value="Petani">Petani / Pekebun</option>
                <option value="Buruh Harian">Buruh Harian Lepas</option>
                <option value="Pedagang">Pedagang / Warung</option>
                <option value="Pegawai Swasta/PNS">Pegawai Swasta / PNS</option>
                <option value="Wiraswasta">Wiraswasta / UMKM</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-100 pb-4">
            <div>
              <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Tingkat Kesejahteraan</label>
              <select value={welfareLevel} onChange={(e) => setWelfareLevel(e.target.value)} className="w-full rounded border border-slate-300 text-slate-900 bg-white px-2.5 py-2 text-xs">
                <option value="Prasejahtera">Sangat Prasejahtera</option>
                <option value="Sejahtera I">Prasejahtera (Menengah Bawah)</option>
                <option value="Sejahtera II">Sejahtera (Menengah)</option>
                <option value="Sejahtera III">Keluarga Mampu</option>
              </select>
            </div>
            <div>
              <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Status Kepemilikan Rumah</label>
              <select value={housingStatus} onChange={(e) => setHousingStatus(e.target.value)} className="w-full rounded border border-slate-300 text-slate-900 bg-white px-2.5 py-2 text-xs">
                <option value="Milik Sendiri">Milik Sendiri</option>
                <option value="Sewa">Sewa / Kontrak</option>
                <option value="Milik Keluarga">Milik Keluarga (Warisan/Orangtua)</option>
                <option value="Numpang">Numpang / Rumah Dinas</option>
              </select>
            </div>
            <div>
              <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Kondisi Rumah Tinggal</label>
              <select value={housingCondition} onChange={(e) => setHousingCondition(e.target.value)} className="w-full rounded border border-slate-300 text-slate-900 bg-white px-2.5 py-2 text-xs">
                <option value="Layak Huni">Layak Huni</option>
                <option value="Tidak Layak Huni">Tidak Layak Huni</option>
                <option value="Butuh Perbaikan">Butuh Perbaikan Ringan</option>
              </select>
            </div>
          </div>

          {/* Dynamic Problems Input */}
          <div className="space-y-3 border-b border-slate-100 pb-4">
            <span className="text-xxs font-extrabold text-slate-455 uppercase tracking-wider block">Keluhan / Masalah Teridentifikasi (Siklus 2)</span>
            <div className="flex flex-col sm:flex-row gap-2">
              <select value={newProbCat} onChange={(e) => setNewProbCat(e.target.value)} className="rounded border border-slate-300 text-slate-900 bg-white px-3 py-2 text-xs font-bold sm:w-40 shrink-0">
                <option value="Infrastruktur">Infrastruktur</option>
                <option value="Kesehatan">Kesehatan</option>
                <option value="Ekonomi">Ekonomi</option>
                <option value="Lingkungan">Lingkungan</option>
                <option value="Pendidikan">Pendidikan</option>
                <option value="Sosial-Budaya">Sosial-Budaya</option>
              </select>
              <input type="text" value={newProbDesc} onChange={(e) => setNewProbDesc(e.target.value)} placeholder="Tulis keluhan spesifik rumah tangga..." className="flex-1 rounded border border-slate-300 text-slate-900 bg-white px-3 py-2 text-xs" />
              <button type="button" onClick={addProblem} className="rounded bg-teal-sedang text-white px-5 py-2 text-xs font-bold hover:bg-kabut transition w-full sm:w-auto">Tambah</button>
            </div>
            {problems.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {problems.map((p, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-50 text-red-700 text-xxs font-semibold border border-red-200">
                    <strong>[{p.category}]</strong> {p.description}
                    <button type="button" onClick={() => removeProblem(idx)} className="text-red-500 hover:text-red-800 font-bold ml-1">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Dynamic Potentials Input */}
          <div className="space-y-3">
            <span className="text-xxs font-extrabold text-slate-455 uppercase tracking-wider block">Potensi Teridentifikasi (Siklus 2)</span>
            <div className="flex flex-col sm:flex-row gap-2">
              <select value={newPotCat} onChange={(e) => setNewPotCat(e.target.value)} className="rounded border border-slate-300 text-slate-900 bg-white px-3 py-2 text-xs font-bold sm:w-40 shrink-0">
                <option value="Pertanian">Pertanian</option>
                <option value="Peternakan">Peternakan</option>
                <option value="Usaha Mikro/UMKM">Usaha Mikro/UMKM</option>
                <option value="Keterampilan Khusus">Keterampilan Khusus</option>
                <option value="Lahan Kosong">Lahan Kosong</option>
              </select>
              <input type="text" value={newPotDesc} onChange={(e) => setNewPotDesc(e.target.value)} placeholder="Tulis potensi spesifik rumah tangga..." className="flex-1 rounded border border-slate-300 text-slate-900 bg-white px-3 py-2 text-xs" />
              <button type="button" onClick={addPotential} className="rounded bg-teal-sedang text-white px-5 py-2 text-xs font-bold hover:bg-kabut transition w-full sm:w-auto">Tambah</button>
            </div>
            {potentials.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {potentials.map((p, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 text-xxs font-semibold border border-emerald-250">
                    <strong>[{p.category}]</strong> {p.description}
                    <button type="button" onClick={() => removePotential(idx)} className="text-emerald-500 hover:text-emerald-800 font-bold ml-1">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <button onClick={() => setWStep(2)} className="rounded border border-slate-300/60 px-4 py-2 text-xs hover:bg-slate-50 transition">Kembali</button>
            <button onClick={handleSave} disabled={saving} className="rounded-xl bg-teal-sedang hover:bg-[#113a48] disabled:opacity-50 text-white px-6 py-2.5 text-xs font-black transition shadow-md flex items-center gap-2 cursor-pointer">
              {saving ? '⏳ Menyimpan ke Cloud...' : '☁️ Simpan Langsung ke Cloud'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
