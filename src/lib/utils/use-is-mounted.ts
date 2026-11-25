// src/lib/utils/use-is-mounted.ts
'use client';

import { useState, useEffect } from 'react';

/**
 * Hook untuk memastikan rendering elemen dinamis client-side (seperti localStorage)
 * hanya aktif setelah komponen ter-mount di browser, mencegah Hydration Mismatch Error di Next.js.
 */
export function useIsMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}

