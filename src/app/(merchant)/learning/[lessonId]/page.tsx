// src/app/(merchant)/learning/[lessonId]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  BookOpen,
  Clock,
  ShieldCheck,
  ShieldAlert,
  QrCode,
  Eye,
  Hand,
  Lock,
  Bell,
  Receipt,
  Zap,
  Wallet,
  CheckSquare,
  Square,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import {
  SAMPLE_LESSONS,
  getStoredLessons,
  evaluateQuiz,
  LessonDetail,
  LessonStep,
  LessonBenefit,
} from '@/modules/learning/learning.service';
import { recordLessonCompleted } from '@/modules/ledger/ledger.service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePageTitle } from '@/lib/utils/use-page-title';

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string;

  const [lessons, setLessons] = useState<LessonDetail[]>(SAMPLE_LESSONS);

  useEffect(() => {
    setLessons(getStoredLessons());
  }, []);

  const lesson = lessons.find((l) => l.id === lessonId) || lessons[0];
  usePageTitle(lesson?.title || 'Detail Modul Belajar');

  const [currentStep, setCurrentStep] = useState<'content' | 'quiz' | 'result'>('content');
  const subtitle = lesson.subtitle || 'Modul pembelajaran interaktif adopsi dan keamanan transaksi QRIS.';
  const conceptTitle = lesson.conceptTitle || 'Konsep Kunci Pembelajaran';
  const conceptDescription = lesson.conceptDescription || lesson.contentMd || '';
  const practicalStepsTitle = lesson.practicalStepsTitle || 'Langkah Praktis untuk Pedagang';
  const practicalSteps = lesson.practicalSteps || [];
  const benefits = lesson.benefits || [];
  const goldenRule = lesson.goldenRule || {
    title: 'Kunci Utama Keamanan Kasir',
    description: 'Pastikan setiap transaksi dicek langsung di mutasi ponsel Anda sendiri.',
    warningNote: 'Jangan hanya percaya pada tangkapan layar (screenshot) pembeli.',
  };
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<{ score: number; passed: boolean } | null>(null);

  // Checklist interaktif untuk memastikan pedagang memahami poin inti sebelum kuis
  const [checklist, setChecklist] = useState<Record<number, boolean>>({});

  const toggleChecklist = (index: number) => {
    setChecklist((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleFinishQuiz = () => {
    const result = evaluateQuiz(lesson.quiz, selectedAnswers);
    setQuizResult(result);
    if (result.passed) {
      recordLessonCompleted(lesson.id, lesson.title, lesson.xpReward);
    }
    setCurrentStep('result');
  };

  const handleCompleteWithoutQuiz = () => {
    recordLessonCompleted(lesson.id, lesson.title, lesson.xpReward);
    setQuizResult({ score: 100, passed: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep('result');
  };

  // Helper render ikon langkah praktis
  const renderStepIcon = (iconType: LessonStep['iconType']) => {
    switch (iconType) {
      case 'eye':
        return <Eye className="w-5 h-5 text-sky-600" />;
      case 'hand':
        return <Hand className="w-5 h-5 text-amber-600" />;
      case 'lock':
        return <Lock className="w-5 h-5 text-indigo-600" />;
      case 'bell':
        return <Bell className="w-5 h-5 text-amber-600" />;
      case 'receipt':
        return <Receipt className="w-5 h-5 text-teal-600" />;
      case 'wallet':
        return <Wallet className="w-5 h-5 text-emerald-600" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-sky-600" />;
    }
  };

  // Helper render ikon manfaat
  const renderBenefitIcon = (iconType: LessonBenefit['iconType']) => {
    switch (iconType) {
      case 'speed':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'wallet':
        return <Wallet className="w-4 h-4 text-emerald-500" />;
      case 'receipt':
        return <Receipt className="w-4 h-4 text-sky-500" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Navigasi Balik & Stepper Alur */}
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/learning"
          className="p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-semibold">Semua Modul</span>
        </Link>

        {/* Stepper Progres */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold">
          <span
            className={`px-2.5 py-1 rounded-full transition-all ${
              currentStep === 'content'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            1. Materi
          </span>
          <span className="text-slate-300">›</span>
          <span
            className={`px-2.5 py-1 rounded-full transition-all ${
              currentStep === 'quiz'
                ? 'bg-sky-600 text-white shadow-xs'
                : currentStep === 'result'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            2. Kuis
          </span>
          <span className="text-slate-300">›</span>
          <span
            className={`px-2.5 py-1 rounded-full transition-all ${
              currentStep === 'result' ? 'bg-sky-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500'
            }`}
          >
            3. Hasil & XP
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* STEP 1: MATERI BELAJAR KREATIF & INTERAKTIF              */}
      {/* ========================================================= */}
      {currentStep === 'content' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Header Modul Bergaya Kartu Infografis */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-600 via-sky-700 to-indigo-800 text-white space-y-3 shadow-md shadow-sky-900/10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2.5 py-1 rounded-md backdrop-blur-xs flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {lesson.topic}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-sky-100 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {lesson.durationMinutes} Menit
                </span>
                <span className="text-xs font-bold text-amber-950 bg-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  <Award className="w-3.5 h-3.5" />
                  +{lesson.xpReward} XP
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <h1 className="text-xl font-black text-white leading-snug">
                {lesson.title}
              </h1>
              <p className="text-xs text-sky-100 leading-relaxed">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Bagian 1: Konsep Kunci & Kartu Manfaat Instan */}
          <Card className="p-4 sm:p-5 space-y-4 border-slate-200/90 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 shadow-xs">
                <QrCode className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-900">
                  {conceptTitle}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {conceptDescription}
                </p>
              </div>
            </div>

            {/* 3 Kartu Keuntungan Praktis */}
            {benefits && benefits.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                {benefits.map((benefit, bIdx) => (
                  <div
                    key={bIdx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 hover:border-sky-300 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                      {renderBenefitIcon(benefit.iconType)}
                      <span>{benefit.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      {benefit.desc}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Bagian 2: 3 Langkah Emas Praktis (Visual Step Cards) */}
          {practicalSteps.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider px-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{practicalStepsTitle}</span>
              </h3>

              <div className="space-y-2.5">
                {practicalSteps.map((step) => (
                  <Card
                    key={step.stepNumber}
                    className="p-4 hover:border-sky-300 transition-all space-y-2 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 font-bold text-xs border border-slate-200">
                          {step.stepNumber}
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900 leading-snug">
                              {step.title}
                            </h4>
                          </div>
                          {step.badge && (
                            <span className="inline-block text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                              {step.badge}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-50 text-slate-600 shrink-0">
                        {renderStepIcon(step.iconType)}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed pl-11">
                      {step.description}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Bagian 3: Kotak Waspada Praktis Kasir (Security Alert Callout) */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-2 shadow-xs">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{goldenRule.title}</span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed font-medium">
              {goldenRule.description}
            </p>
            <div className="p-2.5 rounded-xl bg-white/80 border border-amber-200 text-[11px] text-amber-900 flex items-center gap-2">
              <span className="font-bold text-red-600 uppercase text-[10px] bg-red-100 px-1.5 py-0.5 rounded shrink-0">
                PENTING
              </span>
              <span>{goldenRule.warningNote}</span>
            </div>
          </div>

          {/* Bagian 4: Checklist Interaktif Pemahaman Materi */}
          {practicalSteps.length > 0 && (
            <Card className="p-4 space-y-3 bg-gradient-to-br from-white to-sky-50/30 border-sky-200">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-sky-600" />
                  <span>Cek Kesiapan Anda Sebelum Kuis</span>
                </h4>
                <span className="text-[10px] font-medium text-slate-500">
                  Sentuh untuk mencentang
                </span>
              </div>

              <div className="space-y-2">
                {practicalSteps.map((step, sIdx) => {
                  const isChecked = !!checklist[sIdx];
                  return (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => toggleChecklist(sIdx)}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center gap-2.5 transition-all ${
                        isChecked
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {isChecked ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300 shrink-0" />
                      )}
                      <span className="flex-1">{step.title}</span>
                    </button>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Tombol Lanjut ke Kuis atau Selesai */}
          <div className="pt-2 sticky bottom-20 z-20">
            {lesson.quiz.length > 0 ? (
              <Button
                variant="primary"
                size="lg"
                className="w-full flex items-center justify-center gap-2 py-3.5 shadow-lg shadow-sky-600/20 text-sm font-bold min-h-[48px] rounded-xl"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setCurrentStep('quiz');
                }}
              >
                <span>Mulai Kuis Singkat</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-black">
                  +{lesson.xpReward} XP
                </span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                className="w-full flex items-center justify-center gap-2 py-3.5 shadow-lg shadow-sky-600/20 text-sm font-bold min-h-[48px] rounded-xl"
                onClick={handleCompleteWithoutQuiz}
              >
                <span>Selesaikan Materi & Klaim</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-black">
                  +{lesson.xpReward} XP
                </span>
                <CheckCircle2 className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 2: KUIS EVALUASI PEMAHAMAN                           */}
      {/* ========================================================= */}
      {currentStep === 'quiz' && (
        <Card className="p-5 space-y-5 animate-in fade-in duration-200 border-slate-200/90 shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100 inline-flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              Kuis Evaluasi Pemahaman
            </span>
            <h2 className="text-base font-bold text-slate-900 mt-2">
              Jawab Pertanyaan Berdasarkan Materi
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih satu jawaban yang paling tepat. Nilai minimal kelulusan adalah <strong>70%</strong>.
            </p>
          </div>

          <div className="space-y-6">
            {lesson.quiz.map((q, qIndex) => (
              <div key={q.id} className="space-y-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <p className="font-bold text-xs text-slate-900 leading-snug">
                  {qIndex + 1}. {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, optIndex) => {
                    const isSelected = selectedAnswers[q.id] === optIndex;
                    return (
                      <button
                        key={optIndex}
                        type="button"
                        onClick={() => handleSelectAnswer(q.id, optIndex)}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all min-h-[46px] flex items-center gap-3 ${
                          isSelected
                            ? 'border-sky-600 bg-sky-50/90 text-sky-950 font-semibold ring-1 ring-sky-500 shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                            isSelected
                              ? 'bg-sky-600 text-white'
                              : 'border border-slate-300 text-slate-500'
                          }`}
                        >
                          {String.fromCharCode(65 + optIndex)}
                        </span>
                        <span className="flex-1 leading-snug">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Button
              variant="primary"
              size="lg"
              className="w-full min-h-[48px] text-sm font-bold shadow-md shadow-sky-600/20"
              disabled={Object.keys(selectedAnswers).length < lesson.quiz.length}
              onClick={handleFinishQuiz}
            >
              Kirim Jawaban Kuis
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => setCurrentStep('content')}
            >
              Baca Ulang Materi
            </Button>
          </div>
        </Card>
      )}

      {/* ========================================================= */}
      {/* STEP 3: HASIL KUIS & PEMBERIAN POIN XP                   */}
      {/* ========================================================= */}
      {currentStep === 'result' && quizResult && (
        <Card className="p-6 text-center space-y-5 animate-in fade-in duration-200 border-slate-200 shadow-sm">
          {quizResult.passed ? (
            <>
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Luar Biasa, Anda Lulus!
                </h2>
                <p className="text-xs text-slate-600">
                  Nilai Evaluasi: <strong className="text-emerald-700 text-sm font-black">{quizResult.score}%</strong>. Anda telah menguasai materi ini dengan sangat baik.
                </p>
              </div>

              <div className="p-3.5 bg-gradient-to-r from-amber-50 to-amber-100/80 rounded-2xl border border-amber-200 flex items-center justify-center gap-2 text-amber-950 font-bold text-xs shadow-xs">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Selamat! Hadiah +{lesson.xpReward} XP telah ditambahkan ke buku besar Anda.</span>
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <Link href="/dashboard" className="w-full">
                  <Button variant="primary" size="lg" className="w-full text-xs font-bold min-h-[46px]">
                    Lihat Progres di Dashboard
                  </Button>
                </Link>
                <Link href="/learning" className="w-full">
                  <Button variant="outline" size="md" className="w-full text-xs font-semibold">
                    Pilih Modul Belajar Lain
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center shadow-xs">
                <XCircle className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900">
                  Belum Memenuhi Ambang Kelulusan
                </h2>
                <p className="text-xs text-slate-600">
                  Skor Anda: <strong className="text-red-600 text-sm">{quizResult.score}%</strong> (Minimal lulus: 70%).
                </p>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Tidak masalah! Anda dapat membaca ulang materinya dan mencoba kuis kembali kapan saja untuk mendapatkan poin XP.
              </p>

              <div className="pt-2 flex flex-col gap-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full text-xs font-bold min-h-[46px]"
                  onClick={() => {
                    setSelectedAnswers({});
                    setCurrentStep('content');
                  }}
                >
                  Baca Ulang Materi & Coba Lagi
                </Button>
                <Link href="/learning" className="w-full">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Kembali ke Pusat Belajar
                  </Button>
                </Link>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
