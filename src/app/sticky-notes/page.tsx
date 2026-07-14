'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StickyNotesRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the unified SPA dashboard workspace shell
    router.replace('/app/dashboard?tab=sticky-notes');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-sans font-semibold text-slate-500">
      Mengalihkan ke Papan Sticky Notes KKN...
    </div>
  );
}
