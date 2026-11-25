// src/lib/utils/use-page-title.ts
import { useEffect } from 'react';

export function usePageTitle(title: string) {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = title ? `${title} | DigiUMKM` : 'DigiUMKM';
    }
  }, [title]);
}

