// src/components/ui/brand-logo.tsx
import React from 'react';
import { clsx } from 'clsx';

interface BrandMarkProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_MAP: Record<NonNullable<BrandMarkProps['size']>, string> = {
  sm: 'w-8 h-8',
  md: 'w-9 h-9',
  lg: 'w-12 h-12',
  xl: 'w-14 h-14',
};

/**
 * Logo mark orisinal Pindaiin:
 * Monogram "P" kokoh membentuk bidang pindai QRIS dengan sudut bidik
 * serta aksen piksel digital emas hangat untuk UMKM.
 */
export function BrandMark({ size = 'md', className }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx(SIZE_MAP[size], 'shrink-0', className)}
      aria-label="Logo Pindaiin"
    >
      <defs>
        <linearGradient id="pindaiin-mark-bg" x1="2" y1="2" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0EA5E9" />
          <stop offset="55%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>
        <linearGradient id="pindaiin-gold" x1="23" y1="9" x2="33" y2="19" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      {/* Wadah squircle */}
      <rect width="40" height="40" rx="12" fill="url(#pindaiin-mark-bg)" />

      {/* Sudut bidik pindai (viewfinder) di kiri atas & kanan bawah */}
      <path
        d="M8.5 13V10.5C8.5 9.4 9.4 8.5 10.5 8.5H13"
        stroke="#BAE6FD"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M27 31.5H29.5C30.6 31.5 31.5 30.6 31.5 29.5V27"
        stroke="#BAE6FD"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Monogram "P" geometris dengan kepala pindai */}
      <path
        d="M13 30V12.5H21.2C24.8 12.5 27.5 15 27.5 18.4C27.5 21.8 24.8 24.2 21.2 24.2H13"
        stroke="#FFFFFF"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Titik fokus QR di dalam lengkung P */}
      <rect x="17.5" y="16.4" width="4.2" height="4.2" rx="1.1" fill="url(#pindaiin-gold)" />

      {/* Aksen piksel digital emas di sudut kanan atas */}
      <rect x="27.2" y="8.5" width="4.3" height="4.3" rx="1.2" fill="#FDE68A" />
    </svg>
  );
}

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BrandLogo({ size = 'sm', className }: BrandLogoProps) {
  return (
    <span className={clsx('inline-flex items-center gap-2.5', className)}>
      <BrandMark size={size} />
      <span className="font-extrabold text-base text-slate-900 tracking-tight">
        Pindai<span className="text-sky-600">in</span>
      </span>
    </span>
  );
}
