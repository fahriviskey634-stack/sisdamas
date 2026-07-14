'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PriorityRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/app/dashboard?tab=priority');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-sans font-semibold text-slate-500">
      Mengalihkan ke Matriks Prioritas USG...
    </div>
  );
}
