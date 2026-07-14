'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/app/dashboard?tab=profile');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-sans font-semibold text-slate-500">
      Mengalihkan ke Profil Pengguna...
    </div>
  );
}
