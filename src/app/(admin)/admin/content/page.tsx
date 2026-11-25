// src/app/(admin)/admin/content/page.tsx
'use client';

import React, { useState } from 'react';
import {
  Gift,
  Target,
  BookOpen,
  Sliders,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Sparkles,
  Save,
  Package,
  Tag,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SAMPLE_REWARDS } from '@/modules/rewards/reward.service';
import { SAMPLE_MISSIONS } from '@/modules/missions/mission.service';
import {
  SAMPLE_LESSONS,
  LessonDetail,
  LessonBenefit,
  LessonStep,
  QuizQuestion,
  generateLessonId,
  getStoredLessons,
  saveStoredLessons,
} from '@/modules/learning/learning.service';
import { Reward, Mission } from '@/types/database.types';
import { usePageTitle } from '@/lib/utils/use-page-title';
import {
  getStoredCategories,
  saveStoredCategories,
  DEFAULT_BUSINESS_CATEGORIES,
} from '@/modules/merchants/categories.service';

interface PointRuleItem {
  key: string;
  label: string;
  description: string;
  xp: number;
}

const INITIAL_RULES: PointRuleItem[] = [
  {
    key: 'PROFILE_COMPLETED',
    label: 'Penyelesaian Profil Toko',
    description: 'Diberikan sekali saat pedagang melengkapi data nama toko, kategori, dan wilayah.',
    xp: 50,
  },
  {
    key: 'LESSON_COMPLETED',
    label: 'Menyelesaikan Modul Edukasi',
    description: 'Diberikan setelah pedagang membaca materi dan lulus kuis keamanan QRIS.',
    xp: 50,
  },
  {
    key: 'QRIS_ACTIVITY_SUBMITTED',
    label: 'Pelaporan Transaksi QRIS',
    description: 'Diberikan saat pedagang mengirimkan laporan klaim transaksi harian.',
    xp: 20,
  },
  {
    key: 'QRIS_ACTIVITY_VERIFIED',
    label: 'Verifikasi Admin Transaksi QRIS',
    description: 'Bonus tambahan saat laporan transaksi disetujui oleh admin.',
    xp: 30,
  },
];

export default function AdminContentManagementPage() {
  usePageTitle('Kelola Konten & Event');

  const [activeTab, setActiveTab] = useState<'rewards' | 'missions' | 'lessons' | 'rules' | 'categories'>('rewards');
  const [notification, setNotification] = useState<string | null>(null);

  // 1. State Hadiah
  const [rewards, setRewards] = useState<Reward[]>(SAMPLE_REWARDS);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [editingReward, setEditingReward] = useState<Partial<Reward> | null>(null);

  // 2. State Misi
  const [missions, setMissions] = useState<Mission[]>(SAMPLE_MISSIONS);
  const [showMissionModal, setShowMissionModal] = useState(false);
  const [editingMission, setEditingMission] = useState<Partial<Mission> | null>(null);

  // 3. State Modul Belajar
  const [lessons, setLessons] = useState<LessonDetail[]>(SAMPLE_LESSONS);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Partial<LessonDetail> | null>(null);
  const [editingLessonOriginalId, setEditingLessonOriginalId] = useState<string | null>(null);
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [lessonModalTab, setLessonModalTab] = useState<'materi' | 'langkah' | 'kuis'>('materi');

  // 4. State Aturan Poin
  const [pointRules, setPointRules] = useState<PointRuleItem[]>(INITIAL_RULES);

  // 5. State Master Kategori Usaha (Admin nambah, kurang, edit)
  const [categories, setCategories] = useState<string[]>(DEFAULT_BUSINESS_CATEGORIES);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);
  const [editingCategoryValue, setEditingCategoryValue] = useState('');

  React.useEffect(() => {
    setCategories(getStoredCategories());
    setLessons(getStoredLessons());
  }, []);

  const showSuccess = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Handler Hadiah
  const handleSaveReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReward?.name || !editingReward.points_cost) return;

    if (editingReward.id) {
      setRewards((prev) =>
        prev.map((r) => (r.id === editingReward.id ? ({ ...r, ...editingReward } as Reward) : r))
      );
      showSuccess(`Hadiah "${editingReward.name}" berhasil diperbarui.`);
    } else {
      const newReward: Reward = {
        id: `r_${Date.now()}`,
        name: editingReward.name,
        description: editingReward.description || '',
        category: editingReward.category || 'voucher',
        points_cost: Number(editingReward.points_cost),
        stock: editingReward.stock !== undefined ? Number(editingReward.stock) : 50,
        is_active: true,
        fulfillment_instructions: editingReward.fulfillment_instructions || 'Petunjuk standar pengiriman',
      };
      setRewards((prev) => [newReward, ...prev]);
      showSuccess(`Hadiah baru "${newReward.name}" berhasil ditambahkan.`);
    }
    setShowRewardModal(false);
    setEditingReward(null);
  };

  const handleDeleteReward = (id: string) => {
    if (confirm('Yakin ingin menghapus hadiah ini dari katalog?')) {
      setRewards((prev) => prev.filter((r) => r.id !== id));
      showSuccess('Hadiah berhasil dihapus.');
    }
  };

  // Handler Misi
  const handleSaveMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMission?.title || !editingMission.xp_reward) return;

    if (editingMission.id) {
      setMissions((prev) =>
        prev.map((m) => (m.id === editingMission.id ? ({ ...m, ...editingMission } as Mission) : m))
      );
      showSuccess(`Misi "${editingMission.title}" berhasil diperbarui.`);
    } else {
      const newMission: Mission = {
        id: `m_${Date.now()}`,
        title: editingMission.title,
        description: editingMission.description || '',
        mission_type: editingMission.mission_type || 'activity',
        rules_json: {},
        xp_reward: Number(editingMission.xp_reward),
        starts_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + 30 * 86400000).toISOString(),
        is_active: true,
        created_at: new Date().toISOString(),
      };
      setMissions((prev) => [newMission, ...prev]);
      showSuccess(`Misi baru "${newMission.title}" berhasil ditambahkan.`);
    }
    setShowMissionModal(false);
    setEditingMission(null);
  };

  // Handler Modul
  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson?.title || !editingLesson.xpReward) return;

    const normalizedSteps: LessonStep[] = (editingLesson.practicalSteps || []).map((step, idx) => ({
      ...step,
      stepNumber: idx + 1,
      iconType: step.iconType || 'shield',
    }));

    const normalizedBenefits: LessonBenefit[] = (editingLesson.benefits || []).map((b) => ({
      ...b,
      iconType: b.iconType || 'shield',
    }));

    const normalizedQuiz: QuizQuestion[] = (editingLesson.quiz || []).map((q, idx) => ({
      ...q,
      id: q.id || `q${idx + 1}`,
    }));

    const otherIds = lessons
      .filter((l) => l.id !== editingLessonOriginalId)
      .map((l) => l.id);
    const resolvedId = generateLessonId(
      editingLesson.id?.trim() || editingLesson.title,
      otherIds
    );

    if (editingLessonOriginalId) {
      const updated = lessons.map((l) =>
        l.id === editingLessonOriginalId
          ? ({
              ...l,
              ...editingLesson,
              id: resolvedId,
              subtitle: editingLesson.subtitle ?? l.subtitle,
              durationMinutes: Number(editingLesson.durationMinutes) || l.durationMinutes,
              xpReward: Number(editingLesson.xpReward) || l.xpReward,
              conceptTitle: editingLesson.conceptTitle ?? l.conceptTitle,
              conceptDescription: editingLesson.conceptDescription ?? l.conceptDescription,
              benefits: normalizedBenefits,
              practicalStepsTitle: editingLesson.practicalStepsTitle ?? l.practicalStepsTitle,
              practicalSteps: normalizedSteps,
              goldenRule: editingLesson.goldenRule ?? l.goldenRule,
              quiz: normalizedQuiz,
            } as LessonDetail)
          : l
      );
      setLessons(updated);
      saveStoredLessons(updated);
      showSuccess(`Modul "${editingLesson.title}" (/learning/${resolvedId}) berhasil diperbarui.`);
    } else {
      const newLesson: LessonDetail = {
        id: resolvedId,
        title: editingLesson.title,
        subtitle: editingLesson.subtitle || 'Panduan praktis penerapan QRIS untuk usaha sehari-hari.',
        topic: editingLesson.topic || 'Dasar QRIS',
        durationMinutes: Number(editingLesson.durationMinutes) || 3,
        xpReward: Number(editingLesson.xpReward),
        conceptTitle: editingLesson.conceptTitle || 'Konsep Kunci Pembelajaran',
        conceptDescription: editingLesson.conceptDescription || editingLesson.contentMd || 'Konten materi edukasi.',
        benefits: normalizedBenefits,
        practicalStepsTitle: editingLesson.practicalStepsTitle || 'Langkah Praktis untuk Pedagang',
        practicalSteps: normalizedSteps,
        goldenRule: editingLesson.goldenRule,
        contentMd: editingLesson.contentMd || editingLesson.conceptDescription || 'Konten materi edukasi.',
        quiz: normalizedQuiz,
      };
      const updated = [newLesson, ...lessons];
      setLessons(updated);
      saveStoredLessons(updated);
      showSuccess(`Modul baru "${newLesson.title}" (/learning/${resolvedId}) berhasil ditambahkan.`);
    }
    setShowLessonModal(false);
    setEditingLesson(null);
    setEditingLessonOriginalId(null);
    setIsSlugEdited(false);
  };

  const handleDeleteLesson = (id: string) => {
    if (lessons.length <= 1) {
      showSuccess('Minimal harus ada 1 modul pembelajaran.');
      return;
    }
    if (confirm('Yakin ingin menghapus modul belajar ini?')) {
      const updated = lessons.filter((l) => l.id !== id);
      setLessons(updated);
      saveStoredLessons(updated);
      showSuccess('Modul belajar berhasil dihapus.');
    }
  };

  // Handler Aturan Poin
  const handleUpdateRuleXp = (key: string, newXp: number) => {
    setPointRules((prev) =>
      prev.map((rule) => (rule.key === key ? { ...rule, xp: newXp } : rule))
    );
    showSuccess(`Nilai XP untuk ${key} berhasil diubah menjadi ${newXp} XP.`);
  };

  // Handler Kategori Usaha (Admin nambah, hapus, ubah)
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    if (categories.includes(trimmed)) {
      showSuccess(`Kategori "${trimmed}" sudah ada.`);
      return;
    }
    const updated = [...categories, trimmed];
    setCategories(updated);
    saveStoredCategories(updated);
    setNewCategoryName('');
    showSuccess(`Kategori "${trimmed}" berhasil ditambahkan.`);
  };

  const handleDeleteCategory = (categoryToDelete: string) => {
    if (categories.length <= 1) {
      showSuccess('Minimal harus ada 1 kategori usaha.');
      return;
    }
    const updated = categories.filter((c) => c !== categoryToDelete);
    setCategories(updated);
    saveStoredCategories(updated);
    showSuccess(`Kategori "${categoryToDelete}" berhasil dihapus.`);
  };

  const handleStartEditCategory = (index: number, val: string) => {
    setEditingCategoryIndex(index);
    setEditingCategoryValue(val);
  };

  const handleSaveEditCategory = (index: number) => {
    const trimmed = editingCategoryValue.trim();
    if (!trimmed) {
      setEditingCategoryIndex(null);
      return;
    }
    const updated = [...categories];
    const oldName = updated[index];
    updated[index] = trimmed;
    setCategories(updated);
    saveStoredCategories(updated);
    setEditingCategoryIndex(null);
    showSuccess(`Kategori "${oldName}" diubah menjadi "${trimmed}".`);
  };

  const handleResetCategories = () => {
    setCategories(DEFAULT_BUSINESS_CATEGORIES);
    saveStoredCategories(DEFAULT_BUSINESS_CATEGORIES);
    showSuccess('Daftar kategori berhasil di-reset ke standar default.');
  };

  return (
    <>
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Kelola Konten & Event Merchant
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Atur katalog hadiah, misi berkala, modul pembelajaran, dan konfigurasi bonus XP
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Navigasi Sub-Tab Konten */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'rewards'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
          onClick={() => setActiveTab('rewards')}
        >
          <Gift className="w-4 h-4" />
          <span>Katalog Hadiah ({rewards.length})</span>
        </button>

        <button
          type="button"
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'missions'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
          onClick={() => setActiveTab('missions')}
        >
          <Target className="w-4 h-4" />
          <span>Misi & Tantangan ({missions.length})</span>
        </button>

        <button
          type="button"
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'lessons'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
          onClick={() => setActiveTab('lessons')}
        >
          <BookOpen className="w-4 h-4" />
          <span>Modul Belajar ({lessons.length})</span>
        </button>

        <button
          type="button"
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'rules'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
          onClick={() => setActiveTab('rules')}
        >
          <Sliders className="w-4 h-4" />
          <span>Event & Aturan Poin</span>
        </button>

        <button
          type="button"
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'categories'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
          onClick={() => setActiveTab('categories')}
        >
          <Tag className="w-4 h-4" />
          <span>Kategori Usaha ({categories.length})</span>
        </button>
      </div>

      {/* ================================================================= */}
      {/* 1. TAB: KATALOG HADIAH */}
      {/* ================================================================= */}
      {activeTab === 'rewards' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <h3 className="text-sm font-bold text-slate-800">Daftar Hadiah Penukaran Poin</h3>
            <Button
              size="sm"
              variant="primary"
              className="w-full sm:w-auto justify-center whitespace-nowrap text-xs flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700"
              onClick={() => {
                setEditingReward({ category: 'voucher', points_cost: 100, stock: 20 });
                setShowRewardModal(true);
              }}
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>Tambah Hadiah Baru</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward) => (
              <Card key={reward.id} className="p-4 bg-white border border-slate-200/80 rounded-xl space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {reward.category}
                    </span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {reward.points_cost} Poin
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">{reward.name}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{reward.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Stok: <strong className="text-slate-800">{reward.stock ?? 'Tidak terbatas'}</strong>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs p-1.5 h-8"
                      onClick={() => {
                        setEditingReward(reward);
                        setShowRewardModal(true);
                      }}
                      title="Edit Hadiah"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs p-1.5 h-8 text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteReward(reward.id)}
                      title="Hapus Hadiah"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 2. TAB: MISI & TANTANGAN */}
      {/* ================================================================= */}
      {activeTab === 'missions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <h3 className="text-sm font-bold text-slate-800">Daftar Misi Aktif untuk Merchant</h3>
            <Button
              size="sm"
              variant="primary"
              className="w-full sm:w-auto justify-center whitespace-nowrap text-xs flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700"
              onClick={() => {
                setEditingMission({ mission_type: 'activity', xp_reward: 50 });
                setShowMissionModal(true);
              }}
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>Tambah Misi Baru</span>
            </Button>
          </div>

          <div className="space-y-3">
            {missions.map((mission) => (
              <Card key={mission.id} className="p-4 bg-white border border-slate-200/80 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                      Tipe: {mission.mission_type}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      +{mission.xp_reward} XP
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{mission.title}</h4>
                  <p className="text-xs text-slate-500">{mission.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs flex items-center gap-1.5"
                    onClick={() => {
                      setEditingMission(mission);
                      setShowMissionModal(true);
                    }}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Ubah Misi</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 3. TAB: MODUL BELAJAR */}
      {/* ================================================================= */}
      {activeTab === 'lessons' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <h3 className="text-sm font-bold text-slate-800">Daftar Modul Belajar QRIS</h3>
            <Button
              size="sm"
              variant="primary"
              className="w-full sm:w-auto justify-center whitespace-nowrap text-xs flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700"
              onClick={() => {
                setEditingLessonOriginalId(null);
                setIsSlugEdited(false);
                setEditingLesson({
                  id: '',
                  topic: 'Keamanan Transaksi',
                  durationMinutes: 3,
                  xpReward: 50,
                  conceptTitle: 'Konsep Kunci Pembelajaran',
                  benefits: [],
                  practicalStepsTitle: 'Langkah Praktis untuk Pedagang',
                  practicalSteps: [],
                  quiz: [],
                });
                setLessonModalTab('materi');
                setShowLessonModal(true);
              }}
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>Tambah Modul Baru</span>
            </Button>
          </div>

          <div className="space-y-3">
            {lessons.map((lesson, idx) => (
              <Card key={lesson.id} className="p-4 bg-white border border-slate-200/80 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      Modul {idx + 1} • {lesson.topic}
                    </span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      +{lesson.xpReward} XP
                    </span>
                    <span className="text-xs text-slate-400">• {lesson.durationMinutes} menit baca</span>
                    <span className="text-[11px] text-slate-400">• {lesson.quiz.length} soal kuis</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{lesson.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {lesson.subtitle || lesson.conceptDescription || lesson.contentMd.slice(0, 100)}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400">/learning/{lesson.id}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs flex items-center gap-1.5"
                    onClick={() => {
                      setEditingLessonOriginalId(lesson.id);
                      setIsSlugEdited(true);
                      setEditingLesson(lesson);
                      setLessonModalTab('materi');
                      setShowLessonModal(true);
                    }}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Modul</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-red-600 hover:bg-red-50 hover:border-red-200"
                    onClick={() => handleDeleteLesson(lesson.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 4. TAB: EVENT & ATURAN POIN */}
      {/* ================================================================= */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-800">Pengaturan Bonus XP per Event</h3>
            <p className="text-xs text-slate-500">Sesuaikan jumlah reward XP untuk tiap aktivitas pedagang.</p>
          </div>

          <div className="space-y-3">
            {pointRules.map((rule) => (
              <Card key={rule.key} className="p-4 bg-white border border-slate-200/80 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900">{rule.label}</h4>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {rule.key}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{rule.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-semibold text-slate-600">Nilai XP:</span>
                  <input
                    type="number"
                    min={5}
                    max={500}
                    step={5}
                    className="w-20 h-9 px-2.5 text-xs text-center font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    defaultValue={rule.xp}
                    onBlur={(e) => handleUpdateRuleXp(rule.key, Number(e.target.value))}
                  />
                  <span className="text-xs font-bold text-sky-700">XP</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 5. TAB: MASTER KATEGORI USAHA */}
      {/* ================================================================= */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Master Kategori Usaha UMKM</h3>
              <p className="text-xs text-slate-500">
                Tambah, ubah, atau hapus pilihan kategori usaha yang tampil di formulir profil pedagang dan registrasi.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs text-slate-600 self-start sm:self-auto"
              onClick={handleResetCategories}
            >
              Reset ke Standar Default
            </Button>
          </div>

          {/* Form Tambah Kategori */}
          <Card className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <input
                type="text"
                placeholder="Ketik kategori baru (contoh: Bengkel Motor, Percetakan)..."
                className="w-full sm:flex-1 h-10 px-3.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <Button type="submit" variant="primary" size="sm" className="w-full sm:w-auto h-10 bg-sky-600 hover:bg-sky-700 text-xs flex items-center justify-center gap-1.5 shrink-0">
                <PlusCircle className="w-4 h-4" />
                <span>Tambah Kategori</span>
              </Button>
            </form>
          </Card>

          {/* Daftar Kategori */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((cat, idx) => (
              <Card
                key={idx}
                className="p-3.5 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between gap-2 shadow-xs hover:border-slate-300 transition-colors"
              >
                {editingCategoryIndex === idx ? (
                  <div className="flex items-center gap-1.5 w-full">
                    <input
                      type="text"
                      className="flex-1 h-8 px-2 text-xs border border-sky-400 rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
                      value={editingCategoryValue}
                      onChange={(e) => setEditingCategoryValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEditCategory(idx);
                        if (e.key === 'Escape') setEditingCategoryIndex(null);
                      }}
                      autoFocus
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="primary"
                      className="h-8 px-2 text-xs bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleSaveEditCategory(idx)}
                    >
                      <Save className="w-3.5 h-3.5" />
                    </Button>
                    <button
                      type="button"
                      className="p-1 text-slate-400 hover:text-slate-600"
                      onClick={() => setEditingCategoryIndex(null)}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 min-w-0">
                      <Tag className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span className="text-xs font-semibold text-slate-800 truncate">{cat}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        title="Ubah nama kategori"
                        className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-slate-100 rounded transition-colors"
                        onClick={() => handleStartEditCategory(idx, cat)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Hapus kategori"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
                        onClick={() => handleDeleteCategory(cat)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>

      {/* ================================================================= */}
      {/* MODAL EDIT / TAMBAH HADIAH */}
      {/* ================================================================= */}
      {showRewardModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h4 className="font-bold text-sm text-slate-900">
                {editingReward?.id ? 'Edit Hadiah' : 'Tambah Hadiah Baru'}
              </h4>
              <button type="button" onClick={() => setShowRewardModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveReward} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Nama Hadiah</label>
                <input
                  type="text"
                  required
                  placeholder="contoh: Voucher Belanja Sembako Rp 50.000"
                  className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={editingReward?.name || ''}
                  onChange={(e) => setEditingReward((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Biaya (Poin)</label>
                  <input
                    type="number"
                    required
                    min={10}
                    className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={editingReward?.points_cost || 100}
                    onChange={(e) => setEditingReward((prev) => ({ ...prev, points_cost: Number(e.target.value) }))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Stok Tersedia</label>
                  <input
                    type="number"
                    required
                    min={0}
                    className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={editingReward?.stock || 20}
                    onChange={(e) => setEditingReward((prev) => ({ ...prev, stock: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Kategori</label>
                <select
                  className="w-full h-9 px-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={editingReward?.category || 'voucher'}
                  onChange={(e) => setEditingReward((prev) => ({ ...prev, category: e.target.value }))}
                >
                  <option value="voucher">Voucher / Pulsa</option>
                  <option value="merchandise">Merchandise / Perlengkapan Kasir</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Deskripsi Hadiah</label>
                <textarea
                  rows={2}
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={editingReward?.description || ''}
                  onChange={(e) => setEditingReward((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowRewardModal(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm" className="bg-sky-600 hover:bg-sky-700">
                  Simpan Hadiah
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL EDIT / TAMBAH MISI */}
      {/* ================================================================= */}
      {showMissionModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h4 className="font-bold text-sm text-slate-900">
                {editingMission?.id ? 'Edit Misi Pedagang' : 'Tambah Misi Baru'}
              </h4>
              <button type="button" onClick={() => setShowMissionModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMission} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Judul Misi</label>
                <input
                  type="text"
                  required
                  placeholder="contoh: Terima 10 Transaksi QRIS Pekan Ini"
                  className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={editingMission?.title || ''}
                  onChange={(e) => setEditingMission((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Reward XP</label>
                  <input
                    type="number"
                    required
                    min={10}
                    className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={editingMission?.xp_reward || 50}
                    onChange={(e) => setEditingMission((prev) => ({ ...prev, xp_reward: Number(e.target.value) }))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Tipe Misi</label>
                  <select
                    className="w-full h-9 px-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={editingMission?.mission_type || 'activity'}
                    onChange={(e) => setEditingMission((prev) => ({ ...prev, mission_type: e.target.value }))}
                  >
                    <option value="activity">Aktivitas Transaksi</option>
                    <option value="learning">Penyelesaian Belajar</option>
                    <option value="setup">Pengaturan Kasir</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Deskripsi Tugas</label>
                <textarea
                  rows={2}
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={editingMission?.description || ''}
                  onChange={(e) => setEditingMission((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowMissionModal(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm" className="bg-sky-600 hover:bg-sky-700">
                  Simpan Misi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL EDIT / TAMBAH MODUL (SINKRON PENUH DENGAN HALAMAN BELAJAR) */}
      {/* ================================================================= */}
      {showLessonModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 shrink-0">
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  {editingLesson?.id ? 'Edit Modul Belajar' : 'Tambah Modul Edukasi Baru'}
                </h4>
                <p className="text-[11px] text-slate-500">
                  Semua bagian di bawah ini tampil langsung di halaman belajar pedagang.
                </p>
              </div>
              <button type="button" onClick={() => setShowLessonModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab Navigasi Bagian Modul */}
            <div className="flex items-center gap-1 px-5 pt-2.5 border-b border-slate-100 bg-slate-50/70 shrink-0">
              <button
                type="button"
                onClick={() => setLessonModalTab('materi')}
                className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                  lessonModalTab === 'materi'
                    ? 'border-sky-600 text-sky-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                1. Info & Konsep ({(editingLesson?.benefits || []).length} Manfaat)
              </button>
              <button
                type="button"
                onClick={() => setLessonModalTab('langkah')}
                className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                  lessonModalTab === 'langkah'
                    ? 'border-sky-600 text-sky-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                2. Langkah & Aturan ({(editingLesson?.practicalSteps || []).length})
              </button>
              <button
                type="button"
                onClick={() => setLessonModalTab('kuis')}
                className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                  lessonModalTab === 'kuis'
                    ? 'border-sky-600 text-sky-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                3. Kuis Evaluasi ({(editingLesson?.quiz || []).length} Soal)
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="flex-1 overflow-y-auto p-5 space-y-4">
              {lessonModalTab === 'materi' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Judul Modul</label>
                    <input
                      type="text"
                      required
                      placeholder="contoh: Cara Mencegah Penipuan Transfer Palsu"
                      className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                      value={editingLesson?.title || ''}
                      onChange={(e) => {
                        const nextTitle = e.target.value;
                        const otherIds = lessons
                          .filter((l) => l.id !== editingLessonOriginalId)
                          .map((l) => l.id);
                        setEditingLesson((prev) => ({
                          ...prev,
                          title: nextTitle,
                          id:
                            !editingLessonOriginalId && !isSlugEdited
                              ? nextTitle.trim()
                                ? generateLessonId(nextTitle, otherIds)
                                : ''
                              : prev?.id,
                        }));
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Tag URL (lessonId)</label>
                    <div className="flex items-center rounded-lg border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-sky-500 bg-white">
                      <span className="px-2.5 h-9 flex items-center text-xs font-mono text-slate-500 bg-slate-50 border-r border-slate-200 shrink-0">
                        /learning/
                      </span>
                      <input
                        type="text"
                        placeholder="otomatis-dari-judul"
                        className="w-full h-9 px-2.5 text-xs font-mono text-sky-700 focus:outline-none"
                        value={editingLesson?.id || ''}
                        onChange={(e) => {
                          setIsSlugEdited(true);
                          const cleaned = e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]+/g, '-')
                            .replace(/^-+/, '');
                          setEditingLesson((prev) => ({ ...prev, id: cleaned }));
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Ringkasan Singkat (Subtitle)</label>
                    <input
                      type="text"
                      placeholder="contoh: Panduan singkat menghadapi pembayaran tertunda di jam ramai."
                      className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                      value={editingLesson?.subtitle || ''}
                      onChange={(e) => setEditingLesson((prev) => ({ ...prev, subtitle: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Topik</label>
                      <input
                        type="text"
                        required
                        className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                        value={editingLesson?.topic || 'Keamanan Transaksi'}
                        onChange={(e) => setEditingLesson((prev) => ({ ...prev, topic: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Durasi (Menit)</label>
                      <input
                        type="number"
                        required
                        min={1}
                        max={30}
                        className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                        value={editingLesson?.durationMinutes || 3}
                        onChange={(e) => setEditingLesson((prev) => ({ ...prev, durationMinutes: Number(e.target.value) }))}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Reward (XP)</label>
                      <input
                        type="number"
                        required
                        min={10}
                        className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                        value={editingLesson?.xpReward || 50}
                        onChange={(e) => setEditingLesson((prev) => ({ ...prev, xpReward: Number(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Judul Konsep Utama</label>
                    <input
                      type="text"
                      placeholder="contoh: Apa Sebenarnya QRIS Itu?"
                      className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                      value={editingLesson?.conceptTitle || ''}
                      onChange={(e) => setEditingLesson((prev) => ({ ...prev, conceptTitle: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Penjelasan Konsep Utama</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Jelaskan inti materi dengan bahasa sederhana yang mudah dipahami pedagang..."
                      className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                      value={editingLesson?.conceptDescription ?? editingLesson?.contentMd ?? ''}
                      onChange={(e) =>
                        setEditingLesson((prev) => ({
                          ...prev,
                          conceptDescription: e.target.value,
                          contentMd: e.target.value,
                        }))
                      }
                    />
                  </div>

                  {/* Daftar Kartu Manfaat */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700">Kartu Manfaat Praktis</label>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingLesson((prev) => ({
                            ...prev,
                            benefits: [
                              ...(prev?.benefits || []),
                              { title: '', desc: '', iconType: 'shield' },
                            ],
                          }))
                        }
                        className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Tambah Manfaat</span>
                      </button>
                    </div>
                    {(editingLesson?.benefits || []).map((benefit, bIdx) => (
                      <div key={bIdx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Judul manfaat"
                            className="flex-1 h-8 px-2.5 text-xs border border-slate-300 rounded-lg bg-white"
                            value={benefit.title}
                            onChange={(e) => {
                              const next = [...(editingLesson?.benefits || [])];
                              next[bIdx] = { ...next[bIdx], title: e.target.value };
                              setEditingLesson((prev) => ({ ...prev, benefits: next }));
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = (editingLesson?.benefits || []).filter((_, i) => i !== bIdx);
                              setEditingLesson((prev) => ({ ...prev, benefits: next }));
                            }}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Deskripsi singkat manfaat"
                          className="w-full h-8 px-2.5 text-xs border border-slate-300 rounded-lg bg-white"
                          value={benefit.desc}
                          onChange={(e) => {
                            const next = [...(editingLesson?.benefits || [])];
                            next[bIdx] = { ...next[bIdx], desc: e.target.value };
                            setEditingLesson((prev) => ({ ...prev, benefits: next }));
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {lessonModalTab === 'langkah' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Judul Bagian Langkah Praktis</label>
                    <input
                      type="text"
                      placeholder="contoh: 3 Aturan Emas Pemasangan Stiker QRIS"
                      className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                      value={editingLesson?.practicalStepsTitle || ''}
                      onChange={(e) => setEditingLesson((prev) => ({ ...prev, practicalStepsTitle: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700">Daftar Langkah Praktis</label>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingLesson((prev) => ({
                            ...prev,
                            practicalSteps: [
                              ...(prev?.practicalSteps || []),
                              {
                                stepNumber: (prev?.practicalSteps?.length || 0) + 1,
                                title: '',
                                description: '',
                                badge: '',
                                iconType: 'shield',
                              },
                            ],
                          }))
                        }
                        className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Tambah Langkah</span>
                      </button>
                    </div>

                    {(editingLesson?.practicalSteps || []).map((step, sIdx) => (
                      <div key={sIdx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-slate-600">Langkah {sIdx + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const next = (editingLesson?.practicalSteps || []).filter((_, i) => i !== sIdx);
                              setEditingLesson((prev) => ({ ...prev, practicalSteps: next }));
                            }}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Judul langkah"
                            className="col-span-2 h-8 px-2.5 text-xs border border-slate-300 rounded-lg bg-white"
                            value={step.title}
                            onChange={(e) => {
                              const next = [...(editingLesson?.practicalSteps || [])];
                              next[sIdx] = { ...next[sIdx], title: e.target.value };
                              setEditingLesson((prev) => ({ ...prev, practicalSteps: next }));
                            }}
                          />
                          <input
                            type="text"
                            placeholder="Label singkat"
                            className="h-8 px-2.5 text-xs border border-slate-300 rounded-lg bg-white"
                            value={step.badge || ''}
                            onChange={(e) => {
                              const next = [...(editingLesson?.practicalSteps || [])];
                              next[sIdx] = { ...next[sIdx], badge: e.target.value };
                              setEditingLesson((prev) => ({ ...prev, practicalSteps: next }));
                            }}
                          />
                        </div>
                        <textarea
                          rows={2}
                          placeholder="Penjelasan langkah praktis..."
                          className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white"
                          value={step.description}
                          onChange={(e) => {
                            const next = [...(editingLesson?.practicalSteps || [])];
                            next[sIdx] = { ...next[sIdx], description: e.target.value };
                            setEditingLesson((prev) => ({ ...prev, practicalSteps: next }));
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Kotak Peringatan / Aturan Emas */}
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                    <label className="text-xs font-bold text-amber-900">Kotak Peringatan Penting (Aturan Emas)</label>
                    <input
                      type="text"
                      placeholder="Judul aturan emas (contoh: Kunci Utama Keamanan Kasir)"
                      className="w-full h-8 px-2.5 text-xs border border-amber-200 rounded-lg bg-white"
                      value={editingLesson?.goldenRule?.title || ''}
                      onChange={(e) =>
                        setEditingLesson((prev) => ({
                          ...prev,
                          goldenRule: {
                            title: e.target.value,
                            description: prev?.goldenRule?.description || '',
                            warningNote: prev?.goldenRule?.warningNote || '',
                          },
                        }))
                      }
                    />
                    <textarea
                      rows={2}
                      placeholder="Penjelasan aturan utama..."
                      className="w-full p-2 text-xs border border-amber-200 rounded-lg bg-white"
                      value={editingLesson?.goldenRule?.description || ''}
                      onChange={(e) =>
                        setEditingLesson((prev) => ({
                          ...prev,
                          goldenRule: {
                            title: prev?.goldenRule?.title || 'Kunci Utama',
                            description: e.target.value,
                            warningNote: prev?.goldenRule?.warningNote || '',
                          },
                        }))
                      }
                    />
                    <input
                      type="text"
                      placeholder="Catatan penting (label merah PENTING)"
                      className="w-full h-8 px-2.5 text-xs border border-amber-200 rounded-lg bg-white"
                      value={editingLesson?.goldenRule?.warningNote || ''}
                      onChange={(e) =>
                        setEditingLesson((prev) => ({
                          ...prev,
                          goldenRule: {
                            title: prev?.goldenRule?.title || 'Kunci Utama',
                            description: prev?.goldenRule?.description || '',
                            warningNote: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                </div>
              )}

              {lessonModalTab === 'kuis' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-600">
                      Tambahkan pertanyaan evaluasi untuk pedagang (opsional).
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingLesson((prev) => ({
                          ...prev,
                          quiz: [
                            ...(prev?.quiz || []),
                            {
                              id: `q${(prev?.quiz?.length || 0) + 1}`,
                              question: '',
                              options: ['', '', ''],
                              correctOptionIndex: 0,
                              explanation: '',
                            },
                          ],
                        }))
                      }
                      className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Tambah Soal</span>
                    </button>
                  </div>

                  {(editingLesson?.quiz || []).map((q, qIdx) => (
                    <div key={qIdx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Soal {qIdx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const next = (editingLesson?.quiz || []).filter((_, i) => i !== qIdx);
                            setEditingLesson((prev) => ({ ...prev, quiz: next }));
                          }}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Pertanyaan kuis..."
                        className="w-full h-8 px-2.5 text-xs border border-slate-300 rounded-lg bg-white"
                        value={q.question}
                        onChange={(e) => {
                          const next = [...(editingLesson?.quiz || [])];
                          next[qIdx] = { ...next[qIdx], question: e.target.value };
                          setEditingLesson((prev) => ({ ...prev, quiz: next }));
                        }}
                      />
                      <div className="space-y-1.5">
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${qIdx}`}
                              checked={q.correctOptionIndex === optIdx}
                              onChange={() => {
                                const next = [...(editingLesson?.quiz || [])];
                                next[qIdx] = { ...next[qIdx], correctOptionIndex: optIdx };
                                setEditingLesson((prev) => ({ ...prev, quiz: next }));
                              }}
                              title="Tandai sebagai jawaban benar"
                            />
                            <input
                              type="text"
                              placeholder={`Pilihan ${String.fromCharCode(65 + optIdx)}`}
                              className="flex-1 h-8 px-2.5 text-xs border border-slate-300 rounded-lg bg-white"
                              value={opt}
                              onChange={(e) => {
                                const next = [...(editingLesson?.quiz || [])];
                                const opts = [...next[qIdx].options];
                                opts[optIdx] = e.target.value;
                                next[qIdx] = { ...next[qIdx], options: opts };
                                setEditingLesson((prev) => ({ ...prev, quiz: next }));
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Penjelasan jawaban benar..."
                        className="w-full h-8 px-2.5 text-xs border border-slate-300 rounded-lg bg-white"
                        value={q.explanation}
                        onChange={(e) => {
                          const next = [...(editingLesson?.quiz || [])];
                          next[qIdx] = { ...next[qIdx], explanation: e.target.value };
                          setEditingLesson((prev) => ({ ...prev, quiz: next }));
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowLessonModal(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm" className="bg-sky-600 hover:bg-sky-700">
                  Simpan Modul
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
