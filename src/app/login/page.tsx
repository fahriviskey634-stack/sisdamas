'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, AlertCircle, CheckCircle } from 'lucide-react';

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

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        // Mock fallback check for local developer bypass
        if (
          email === 'surveyor@sukahaji-official.id' &&
          password === 'sukahaji123'
        ) {
          document.cookie = 'sb-access-token=mock-token; path=/; max-age=86400';
          document.cookie = 'sb-refresh-token=mock-refresh; path=/; max-age=86400';
          
          setSuccessMsg('Login sukses via Mode Pengembang Offline!');
          setTimeout(() => {
            router.push('/app/dashboard');
          }, 1000);
          return;
        }
        throw new Error(data.error || 'Autentikasi gagal');
      }

      setSuccessMsg('Login berhasil! Mengarahkan...');
      setTimeout(() => {
        router.push('/app/dashboard');
      }, 1000);
    } catch (err: any) {
      if (
        email === 'surveyor@sukahaji-official.id' &&
        password === 'sukahaji123'
      ) {
        document.cookie = 'sb-access-token=mock-token; path=/; max-age=86400';
        document.cookie = 'sb-refresh-token=mock-refresh; path=/; max-age=86400';
        
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
              E-mail Surveyor
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="surveyor@sukahaji-official.id"
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

        {/* Info Credentials Bypass */}
        <div className="mt-8 rounded-lg bg-white/5 p-3 text-center border border-white/5">
          <p className="text-[10px] text-slate-400 leading-normal">
            <strong>Kredensial Pengetesan Lapangan:</strong><br />
            Email: <code className="text-transisi font-bold">surveyor@sukahaji-official.id</code><br />
            Password: <code className="text-transisi font-bold">sukahaji123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
