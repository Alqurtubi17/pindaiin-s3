// src/app/(merchant)/learning/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Clock,
  Award,
  ChevronRight,
  CheckCircle2,
  Search,
  X,
  PlayCircle,
  ShieldCheck,
  Wallet,
  QrCode,
  Users,
  Wifi,
  TrendingUp,
  BadgePercent,
  HelpCircle,
} from 'lucide-react';
import { SAMPLE_LESSONS, getStoredLessons, LessonDetail } from '@/modules/learning/learning.service';
import { getStoredCompletedLessons } from '@/modules/ledger/ledger.service';
import { usePageTitle } from '@/lib/utils/use-page-title';
import { useIsMounted } from '@/lib/utils/use-is-mounted';

function getTopicVisual(topic: string) {
  switch (topic) {
    case 'Dasar QRIS':
      return {
        icon: QrCode,
        bg: 'bg-sky-50 text-sky-600 border-sky-100',
      };
    case 'Keamanan Transaksi':
      return {
        icon: ShieldCheck,
        bg: 'bg-rose-50 text-rose-600 border-rose-100',
      };
    case 'Manajemen Keuangan':
      return {
        icon: Wallet,
        bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      };
    case 'Transparansi Biaya':
      return {
        icon: BadgePercent,
        bg: 'bg-amber-50 text-amber-600 border-amber-100',
      };
    case 'Pelayanan Pelanggan':
      return {
        icon: Users,
        bg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      };
    case 'Penanganan Kendala':
      return {
        icon: Wifi,
        bg: 'bg-teal-50 text-teal-600 border-teal-100',
      };
    case 'Pengembangan Usaha':
      return {
        icon: TrendingUp,
        bg: 'bg-violet-50 text-violet-600 border-violet-100',
      };
    default:
      return {
        icon: BookOpen,
        bg: 'bg-slate-50 text-slate-600 border-slate-200',
      };
  }
}

export default function LearningCenterPage() {
  usePageTitle('Pusat Belajar');
  const isMounted = useIsMounted();

  const [lessons, setLessons] = useState<LessonDetail[]>(SAMPLE_LESSONS);
  const [selectedTopic, setSelectedTopic] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [completedLessons, setCompletedLessons] = useState<string[]>([
    'mengenal-qris-aman',
  ]);

  useEffect(() => {
    const syncData = () => {
      setLessons(getStoredLessons());
      setCompletedLessons(getStoredCompletedLessons());
    };
    syncData();
    window.addEventListener('digiumkm_ledger_updated', syncData);
    window.addEventListener('digiumkm_lessons_updated', syncData);
    window.addEventListener('storage', syncData);

    return () => {
      window.removeEventListener('digiumkm_ledger_updated', syncData);
      window.removeEventListener('digiumkm_lessons_updated', syncData);
      window.removeEventListener('storage', syncData);
    };
  }, []);

  const topics = ['Semua', ...Array.from(new Set(lessons.map((l) => l.topic)))];

  const filteredLessons = lessons.filter((lesson) => {
    const matchesTopic = selectedTopic === 'Semua' || lesson.topic === selectedTopic;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      lesson.title.toLowerCase().includes(q) ||
      (lesson.subtitle || '').toLowerCase().includes(q) ||
      lesson.topic.toLowerCase().includes(q);
    return matchesTopic && matchesSearch;
  });

  const completedCount = lessons.filter((l) => completedLessons.includes(l.id)).length;
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
  const remainingXp = lessons
    .filter((l) => !completedLessons.includes(l.id))
    .reduce((sum, l) => sum + l.xpReward, 0);
  const nextLesson = lessons.find((l) => !completedLessons.includes(l.id)) || lessons[0];

  return (
    <div className="space-y-3.5 pb-6">
      {/* Hero Banner Progres Belajar */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-600 via-sky-700 to-indigo-800 p-4 text-white shadow-md shadow-sky-900/15">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-xl" />
        <div className="pointer-events-none absolute -bottom-10 left-1/3 h-28 w-28 rounded-full bg-sky-300/15 blur-xl" />

        <div className="relative space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-100">
              <BookOpen className="w-4 h-4" />
              <span>Pusat Belajar QRIS</span>
            </div>
            {isMounted && (
              <span className="text-[11px] font-bold bg-white/15 px-2.5 py-0.5 rounded-full">
                {completedCount}/{lessons.length} Selesai ({progressPercent}%)
              </span>
            )}
          </div>

          <div>
            <h2 className="text-lg font-extrabold tracking-tight leading-snug">
              Tingkatkan Keahlian Digital
            </h2>
            <p className="text-xs text-sky-100/90 leading-relaxed">
              Modul praktis 2–3 menit • Sisa potensi{' '}
              <span className="font-bold text-amber-300">
                +{isMounted ? remainingXp : 0} XP
              </span>
            </p>
          </div>

          {isMounted && (
            <div className="w-full h-1.5 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-300 to-emerald-300 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}

          {nextLesson && (
            <Link
              href={`/learning/${nextLesson.id}`}
              className="flex items-center justify-between gap-3 rounded-xl bg-white/15 hover:bg-white/20 border border-white/20 px-3 py-2 transition-colors"
            >
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-sky-100">
                  {completedCount < lessons.length ? 'Lanjutkan Belajar' : 'Ulangi Materi'}
                </p>
                <p className="text-xs font-bold text-white truncate">{nextLesson.title}</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-lg bg-white text-sky-700 px-2.5 py-1 text-[11px] font-bold shrink-0 shadow-xs">
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Mulai</span>
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* Pencarian & Filter Topik Sejajar (Clean 1 Baris) */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari materi..."
            className="w-full h-9 pl-9 pr-8 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Hapus pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          aria-label="Filter topik pembelajaran"
          className="h-9 max-w-[165px] px-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-2xs shrink-0"
        >
          {topics.map((topic) => {
            const count =
              topic === 'Semua'
                ? lessons.length
                : lessons.filter((l) => l.topic === topic).length;
            return (
              <option key={topic} value={topic}>
                {topic === 'Semua' ? `Semua Topik (${count})` : `${topic} (${count})`}
              </option>
            );
          })}
        </select>
      </div>

      {/* Daftar Modul Pembelajaran */}
      {filteredLessons.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center space-y-2.5">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-800">Materi tidak ditemukan</p>
          <p className="text-xs text-slate-500">
            Coba kata kunci lain atau tampilkan semua topik pembelajaran.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedTopic('Semua');
              setSearchQuery('');
            }}
            className="inline-flex items-center px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 text-xs font-bold hover:bg-sky-100 transition-colors"
          >
            Tampilkan Semua Modul
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredLessons.map((lesson) => {
            const originalIndex = lessons.findIndex((l) => l.id === lesson.id);
            const isCompleted = isMounted && completedLessons.includes(lesson.id);
            const visual = getTopicVisual(lesson.topic);
            const TopicIcon = visual.icon;

            return (
              <Link key={lesson.id} href={`/learning/${lesson.id}`} className="block group">
                <div
                  className={`rounded-2xl bg-white border p-3.5 transition-all shadow-2xs hover:shadow-sm ${
                    isCompleted
                      ? 'border-emerald-200/90 hover:border-emerald-300'
                      : 'border-slate-200/90 hover:border-sky-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Ikon Topik */}
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${visual.bg}`}
                    >
                      <TopicIcon className="w-5 h-5" />
                    </div>

                    {/* Konten Modul */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-slate-500 truncate">
                          Modul {originalIndex + 1} • {lesson.topic}
                        </span>
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80 flex items-center gap-1 shrink-0">
                          <Award className="w-3 h-3" />
                          <span>+{lesson.xpReward} XP</span>
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-slate-900 leading-snug group-hover:text-sky-700 transition-colors">
                        {lesson.title}
                      </h3>

                      {lesson.subtitle && (
                        <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed">
                          {lesson.subtitle}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[11px]">
                        <div className="flex items-center gap-3 text-slate-500 font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {lesson.durationMinutes} mnt
                          </span>
                          <span className="flex items-center gap-1">
                            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                            {lesson.quiz.length} kuis
                          </span>
                        </div>

                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Selesai • Ulangi</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 font-bold text-sky-600 group-hover:translate-x-0.5 transition-transform">
                            <span>Mulai Belajar</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
