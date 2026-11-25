// src/components/auth/turnstile-widget.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
        }
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

interface TurnstileWidgetProps {
  onVerify: (token: string | null) => void;
}

export function TurnstileWidget({ onVerify }: TurnstileWidgetProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [devChecked, setDevChecked] = useState(false);

  useEffect(() => {
    if (!siteKey) return;

    let cancelled = false;

    const renderWidget = () => {
      if (cancelled || !containerRef.current || !window.turnstile) return;
      if (widgetIdRef.current) return;

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: 'light',
        callback: (token: string) => onVerify(token),
        'expired-callback': () => onVerify(null),
        'error-callback': () => onVerify(null),
      });
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      const existingScript = document.querySelector('script[data-cf-turnstile="true"]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        script.dataset.cfTurnstile = 'true';
        script.onload = renderWidget;
        document.head.appendChild(script);
      } else {
        existingScript.addEventListener('load', renderWidget);
      }
    }

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, onVerify]);

  if (siteKey) {
    return (
      <div className="flex justify-center py-1">
        <div ref={containerRef} />
      </div>
    );
  }

  // Fallback lokal ketika NEXT_PUBLIC_TURNSTILE_SITE_KEY belum diisi
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 flex items-center justify-between gap-3">
      <label className="flex items-center gap-2.5 cursor-pointer select-none flex-1">
        <input
          type="checkbox"
          checked={devChecked}
          onChange={(e) => {
            const checked = e.target.checked;
            setDevChecked(checked);
            onVerify(checked ? 'dev-turnstile-token' : null);
          }}
          className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
        />
        <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
          {devChecked ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-emerald-700 font-semibold">Terverifikasi aman</span>
            </>
          ) : (
            <span>Saya bukan robot</span>
          )}
        </span>
      </label>
      <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 shrink-0">
        <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
        <span>Cloudflare</span>
      </div>
    </div>
  );
}

