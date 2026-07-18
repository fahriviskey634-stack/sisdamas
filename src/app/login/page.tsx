'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, AlertCircle, CheckCircle } from 'lucide-react';

const KKN_MEMBERS = [
  { nim: '1234060108', name: 'Aisyah Shofa Aini', gender: 'P', prodi: 'S1 - Ilmu Komunikasi Humas', fakultas: 'Dakwah dan Komunikasi', email: 'aisyah@sukahaji-official.id', division: 'Sekretaris (BPH)' },
  { nim: '1231030055', name: 'Arpan Maulana', gender: 'L', prodi: 'S1 - Ilmu Al-Qur\'an dan Tafsir', fakultas: 'Ushuluddin', email: 'arpan@sukahaji-official.id', division: 'Ketua (BPH)' },
  { nim: '1237010003', name: 'Tifa Astrianti', gender: 'P', prodi: 'S1 - Matematika', fakultas: 'Sains dan Teknologi', email: 'tifa@sukahaji-official.id', division: 'Bendahara (BPH)' },
  { nim: '1235060059', name: 'Hani Husnul Nuwat', gender: 'P', prodi: 'S1 - Ilmu Perpustakaan dan Informasi Islam', fakultas: 'Adab dan Humaniora', email: 'hani@sukahaji-official.id', division: 'Divisi Acara' },
  { nim: '1232040021', name: 'Indah Sri Rahayu', gender: 'P', prodi: 'S1 - Pendidikan Bahasa Inggris', fakultas: 'Tarbiyah dan Keguruan', email: 'indah@sukahaji-official.id', division: 'Divisi Acara' },
  { nim: '1232050026', name: 'Hasna Khairinisa Asy Syifa', gender: 'P', prodi: 'S1 - Pendidikan Matematika', fakultas: 'Tarbiyah dan Keguruan', email: 'hasna@sukahaji-official.id', division: 'Divisi Acara' },
  { nim: '1238010111', name: 'Ilya Hanifah Hakim', gender: 'P', prodi: 'S1 - Administrasi Publik', fakultas: 'Ilmu Sosial dan Ilmu Politik', email: 'ilya@sukahaji-official.id', division: 'Divisi Media' },
  { nim: '1239230099', name: 'Evan Fadhil Al Akbar', gender: 'L', prodi: 'S1 - Manajemen Keuangan Syariah', fakultas: 'Ekonomi dan Bisnis Islam', email: 'evan@sukahaji-official.id', division: 'Divisi Media' },
  { nim: '1235020162', name: 'Hilya Izza Fitriani', gender: 'P', prodi: 'S1 - Bahasa dan Sastra Arab', fakultas: 'Adab dan Humaniora', email: 'hilya@sukahaji-official.id', division: 'Divisi Media' },
  { nim: '1239240038', name: 'Kayyis Yasra Ismaya', gender: 'P', prodi: 'S1 - Manajemen (FEBI)', fakultas: 'Ekonomi dan Bisnis Islam', email: 'kayyis@sukahaji-official.id', division: 'Divisi Humas' },
  { nim: '1237030018', name: 'Fahry Rizky Samsudin', gender: 'L', prodi: 'S1 - Fisika', fakultas: 'Sains dan Teknologi', email: 'fahri@sukahaji-official.id', division: 'Divisi Humas' },
  { nim: '1236000005', name: 'Nova Aulia Rahmawan', gender: 'P', prodi: 'S1 - Psikologi', fakultas: 'Psikologi', email: 'nova@sukahaji-official.id', division: 'Divisi Logsum' },
  { nim: '1232090080', name: 'Nurdin', gender: 'L', prodi: 'S1 - Pendidikan Guru Madrasah Ibtidaiyah', fakultas: 'Tarbiyah dan Keguruan', email: 'nurdin@sukahaji-official.id', division: 'Divisi Logsum' },
  { nim: '1231040133', name: 'Hanifah Mauludiah', gender: 'P', prodi: 'S1 - Tasawuf dan Psikoterapi', fakultas: 'Ushuluddin', email: 'hanifah@sukahaji-official.id', division: 'Divisi Logsum' },
  { nim: '1239240280', name: 'Ridwan Firmansyah', gender: 'L', prodi: 'S1 - Manajemen (FEBI)', fakultas: 'Ekonomi dan Bisnis Islam', email: 'ridwan@sukahaji-official.id', division: 'Divisi Logsum' }
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Semua kolom input wajib diisi');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const normalizedEmail = email.toLowerCase().trim().replace('fahry@', 'fahri@');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password })
      });

      const data = await res.json();

      if (!res.ok) {
        // Fallback bypass for offline developer testing or specific members
        const member = KKN_MEMBERS.find(m => m.email === normalizedEmail);
        if (
          (member || normalizedEmail === 'surveyor@sukahaji-official.id') &&
          password === 'sukahaji123'
        ) {
          const sessionData = member 
            ? { isMember: true, email: member.email, name: member.name, nim: member.nim, prodi: member.prodi, fakultas: member.fakultas, division: member.division }
            : { isMember: false, email: 'surveyor@sukahaji-official.id', name: 'Admin/DPL', nim: 'ADMIN56', prodi: 'Sistem Informasi', fakultas: 'Sains dan Teknologi', division: 'Fasilitator Utama' };

          document.cookie = 'sb-access-token=mock-token; path=/; max-age=86400';
          document.cookie = 'sb-refresh-token=mock-refresh; path=/; max-age=86400';
          document.cookie = `kkn-member-session=${encodeURIComponent(JSON.stringify(sessionData))}; path=/; max-age=86400`;
          
          setSuccessMsg('Login sukses via Mode Pengembang Offline!');
          setTimeout(() => {
            router.push('/app/dashboard');
          }, 1000);
          return;
        }
        throw new Error(data.error || 'Autentikasi gagal');
      }

      // If server-side login succeeds, set the cookie as well
      const member = KKN_MEMBERS.find(m => m.email === normalizedEmail);
      const sessionData = member 
        ? { isMember: true, email: member.email, name: member.name, nim: member.nim, prodi: member.prodi, fakultas: member.fakultas, division: member.division }
        : { isMember: false, email: normalizedEmail, name: 'Admin/DPL', nim: 'ADMIN56', prodi: 'Sistem Informasi', fakultas: 'Sains dan Teknologi', division: 'Fasilitator Utama' };
      document.cookie = `kkn-member-session=${encodeURIComponent(JSON.stringify(sessionData))}; path=/; max-age=86400`;

      setSuccessMsg('Login berhasil! Mengarahkan...');
      setTimeout(() => {
        router.push('/app/dashboard');
      }, 1000);
    } catch (err: any) {
      const member = KKN_MEMBERS.find(m => m.email === normalizedEmail);
      if (
        (member || normalizedEmail === 'surveyor@sukahaji-official.id') &&
        password === 'sukahaji123'
      ) {
        const sessionData = member 
          ? { isMember: true, email: member.email, name: member.name, nim: member.nim, prodi: member.prodi, fakultas: member.fakultas, division: member.division }
          : { isMember: false, email: 'surveyor@sukahaji-official.id', name: 'Admin/DPL', nim: 'ADMIN56', prodi: 'Sistem Informasi', fakultas: 'Sains dan Teknologi', division: 'Fasilitator Utama' };

        document.cookie = 'sb-access-token=mock-token; path=/; max-age=86400';
        document.cookie = 'sb-refresh-token=mock-refresh; path=/; max-age=86400';
        document.cookie = `kkn-member-session=${encodeURIComponent(JSON.stringify(sessionData))}; path=/; max-age=86400`;
        
        setSuccessMsg('Login sukses via Mode Pengembang Offline!');
        setTimeout(() => {
          router.push('/app/dashboard');
        }, 1000);
      } else {
        setErrorMsg(err.message || 'Gagal terhubung ke server');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-teal-tua via-teal-sedang to-kabut p-6 font-sans">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-teal-tua/75 p-8 shadow-2xl backdrop-blur-md">
        
        {/* Title */}
        <div className="mb-8 text-center">
          <img 
            src="/logo.jpg" 
            alt="Logo KKN Kelompok 56" 
            className="h-16 w-16 mx-auto mb-4 rounded-2xl object-cover shadow-lg border border-white/15"
          />
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            SISDAMAS 56
          </h1>
          <p className="mt-2 text-xs text-[#F6F1E6]/80">
            Platform Pendataan KKN Desa Sukahaji (Cipeundeuy KBB)
          </p>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="mb-6 flex items-start gap-3 rounded-lg bg-red-950/50 border border-red-500/30 p-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-450" />
            <p>{errorMsg}</p>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 flex items-start gap-3 rounded-lg bg-emerald-950/50 border border-emerald-500/30 p-3 text-xs text-emerald-300">
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
            <p>{successMsg}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xxs font-semibold tracking-wider text-[#F6F1E6]/80 uppercase">
              E-mail Anggota
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama.panggilan@sukahaji-official.id"
                className="w-full rounded-xl border border-white/15 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-400 outline-none focus:border-transisi focus:bg-white/10 transition"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xxs font-semibold tracking-wider text-[#F6F1E6]/80 uppercase">
              Kata Sandi (Password)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/15 bg-white/5 py-3 pl-10 pr-10 text-sm text-white placeholder-slate-400 outline-none focus:border-transisi focus:bg-white/10 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-transisi py-3.5 text-sm font-bold text-teal-tua shadow-lg hover:bg-[#c9bba0] transition disabled:opacity-50"
          >
            {loading ? 'Menghubungkan...' : 'Masuk Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
