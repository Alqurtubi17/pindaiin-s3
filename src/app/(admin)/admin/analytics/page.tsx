// src/app/(admin)/admin/analytics/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import {
  Download,
  Users,
  CheckCircle2,
  TrendingUp,
  BookOpen,
  FileSpreadsheet,
  FileJson,
  ShieldCheck,
  Receipt,
  Sparkles,
  HelpCircle,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Award,
  ArrowRight,
  GraduationCap,
  Building2,
  Info,
} from 'lucide-react';
import {
  SAMPLE_RAW_RESEARCH_DATA,
  pseudonymizeRecords,
  calculateAggregateMetrics,
  convertToCSV,
  convertToSpssCSV,
  RESEARCH_CODEBOOK,
  PseudonymizedResearchRecord,
} from '@/modules/analytics/research-export.service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePageTitle } from '@/lib/utils/use-page-title';

export default function ResearchAnalyticsPage() {
  usePageTitle('Analitik Riset & Ekspor Data');

  const [rawDataset] = useState(() => pseudonymizeRecords(SAMPLE_RAW_RESEARCH_DATA));
  const metrics = calculateAggregateMetrics(rawDataset);

  // Filter & Pencarian
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedTrajectory, setSelectedTrajectory] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Notifikasi & Modal
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [showCodebookModal, setShowCodebookModal] = useState(false);
  const [codebookFilter, setCodebookFilter] = useState('');

  // Filter Data
  const filteredData = useMemo(() => {
    return rawDataset.filter((item) => {
      const matchSearch =
        item.participantId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.regionRegency.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.businessCategory.toLowerCase().includes(searchTerm.toLowerCase());

      const matchRegion = selectedRegion === 'ALL' || item.regionRegency === selectedRegion;
      const matchTrajectory =
        selectedTrajectory === 'ALL' || item.adoptionTrajectory === selectedTrajectory;

      return matchSearch && matchRegion && matchTrajectory;
    });
  }, [rawDataset, searchTerm, selectedRegion, selectedTrajectory]);

  // Kalkulasi Pagination
  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  // Daftar Unik Wilayah untuk Filter
  const uniqueRegions = useMemo(() => {
    return Array.from(new Set(rawDataset.map((r) => r.regionRegency)));
  }, [rawDataset]);

  // Download Handler: CSV SPSS / SmartPLS / R
  const handleDownloadSpssCSV = () => {
    const csvContent = convertToSpssCSV(filteredData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `digiumkm_spss_dataset_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadSuccess('Dataset numerik khusus SPSS/SmartPLS/R berhasil diunduh.');
  };

  // Download Handler: CSV Tabulasi Lengkap
  const handleDownloadFullCSV = () => {
    const csvContent = convertToCSV(filteredData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `digiumkm_tabular_dataset_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadSuccess('Dataset tabulasi lengkap CSV berhasil diunduh.');
  };

  // Download Handler: JSON Riset Lengkap dengan Metadata
  const handleDownloadJSON = () => {
    const researchPackage = {
      researchMetadata: {
        title: 'Pengaruh Gamifikasi dan Edukasi Terhadap Adopsi Berkelanjutan QRIS pada UMKM Pedesaan',
        theoreticalFramework: 'Technology Acceptance Model (TAM), UTAUT, dan Self-Determination Theory (SDT)',
        targetPopulation: 'UMKM di Wilayah Pedesaan Jawa Timur',
        samplingMethod: 'Purposive Sampling',
        ethicalClearance: 'Approved (Zero PII, SHA-256 Pseudonymization, Informed Consent v1.0)',
        sampleSizeN: filteredData.length,
        exportedAt: new Date().toISOString(),
      },
      variableDictionary: RESEARCH_CODEBOOK,
      dataRecords: filteredData,
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(researchPackage, null, 2)
    )}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.setAttribute('download', `digiumkm_research_package_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadSuccess('Paket dataset riset JSON lengkap dengan metadata metodologi berhasil diunduh.');
  };

  // Filter Codebook
  const filteredCodebook = useMemo(() => {
    if (!codebookFilter.trim()) return RESEARCH_CODEBOOK;
    const q = codebookFilter.toLowerCase();
    return RESEARCH_CODEBOOK.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.label.toLowerCase().includes(q) ||
        c.construct.toLowerCase().includes(q) ||
        c.theory.toLowerCase().includes(q)
    );
  }, [codebookFilter]);

  return (
    <div className="space-y-6">
      {/* Header Analitik */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Ringkasan Analitik & Laporan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pantau perkembangan adopsi QRIS, partisipasi belajar pedagang, serta unduh laporan teranonimkan
          </p>
        </div>

        {/* Toolbar Tombol Unduh Laporan */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="text-xs flex items-center gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl"
            onClick={() => setShowCodebookModal(true)}
          >
            <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
            <span>Panduan Data</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-xs flex items-center gap-1.5 border-slate-300 hover:bg-slate-50 rounded-xl"
            onClick={handleDownloadJSON}
          >
            <FileJson className="w-3.5 h-3.5 text-slate-600" />
            <span>Unduh JSON</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-xs flex items-center gap-1.5 border-slate-300 hover:bg-slate-50 rounded-xl"
            onClick={handleDownloadFullCSV}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
            <span>Unduh Tabel</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            className="text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs font-semibold"
            onClick={handleDownloadSpssCSV}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Data Olahan</span>
          </Button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{downloadSuccess}</span>
          </div>
          <button
            type="button"
            className="text-emerald-700 hover:text-emerald-900"
            onClick={() => setDownloadSuccess(null)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Grid 6 Kartu Metrik Utama Penelitian */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Metrik 1: Total Sampel */}
        <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Sampel Responden</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {metrics.totalParticipants} Pedagang
            </p>
            <p className="text-[11px] text-slate-500">Partisipan wilayah rural</p>
          </div>
        </Card>

        {/* Metrik 2: Tingkat Adopsi Terkini */}
        <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Adopsi QRIS Terkini</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-emerald-600 tracking-tight">
              {metrics.activeQrisAdoptionRatePercent}%
            </p>
            <p className="text-[11px] text-slate-500">+{metrics.netAdoptionGainCount} adopsi baru</p>
          </div>
        </Card>

        {/* Metrik 3: Pembelajaran & Kuis */}
        <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Penguasaan Edukasi</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {metrics.avgQuizScore}%
            </p>
            <p className="text-[11px] text-slate-500">{metrics.totalLessonsCompleted} modul tuntas</p>
          </div>
        </Card>

        {/* Metrik 4: Validitas & Akurasi Transaksi */}
        <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Akurasi Transaksi</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-indigo-600 tracking-tight">
              {metrics.overallVerificationRatePercent}%
            </p>
            <p className="text-[11px] text-slate-500">{metrics.totalVerifiedTransactions} transaksi sah</p>
          </div>
        </Card>

        {/* Metrik 5: Poin Keaktifan Platform */}
        <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Poin Keaktifan</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-amber-600 tracking-tight">
              {metrics.averageXpPerMerchant} XP
            </p>
            <p className="text-[11px] text-slate-500">Rata-rata akumulasi</p>
          </div>
        </Card>

        {/* Metrik 6: Penukaran Hadiah Usaha */}
        <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Penukaran Hadiah</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-teal-700 tracking-tight">
              {metrics.totalRewardsRedeemed} Kali
            </p>
            <p className="text-[11px] text-slate-500">Insentif usaha riil</p>
          </div>
        </Card>
      </div>

      {/* Panel Wawasan Data & Evaluasi Adopsi */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Kolom 1: Matriks Transisi Adopsi */}
        <Card className="p-5 bg-white border border-slate-200/80 rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Perkembangan Adopsi QRIS</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Perubahan status adopsi pedagang sebelum dan sesudah program pendampingan:
          </p>
          <div className="space-y-2 pt-1 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <span className="font-medium text-emerald-900">Baru Mengadopsi</span>
              <strong className="text-emerald-700 font-bold">5 UMKM (50%)</strong>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-sky-50/70 border border-sky-100">
              <span className="font-medium text-sky-900">Adopsi Berkelanjutan</span>
              <strong className="text-sky-700 font-bold">3 UMKM (30%)</strong>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-medium text-slate-700">Belum Mengadopsi</span>
              <strong className="text-slate-600 font-bold">2 UMKM (20%)</strong>
            </div>
          </div>
        </Card>

        {/* Kolom 2: Keaktifan Misi & Hari Interaksi */}
        <Card className="p-5 bg-white border border-slate-200/80 rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Keterlibatan Program & Misi</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Pencapaian tantangan misi harian dan durasi keaktifan pedagang:
          </p>
          <div className="space-y-2 pt-1 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Rata-rata Misi Selesai</span>
                <span className="text-amber-600 font-bold">{metrics.avgMissionsCompleted} Misi / pedagang</span>
              </div>
              <p className="text-[11px] text-slate-500">Menyelesaikan tantangan transaksi dan keamanan</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Rata-rata Hari Aktif</span>
                <span className="text-sky-600 font-bold">{metrics.avgActiveDays} Hari</span>
              </div>
              <p className="text-[11px] text-slate-500">Membuka dan menggunakan aplikasi secara berkala</p>
            </div>
          </div>
        </Card>

        {/* Kolom 3: Standar Kepatuhan Etika Riset */}
        <Card className="p-5 bg-white border border-slate-200/80 rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Kepatuhan Etik & Integritas Data</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Standar perlindungan privasi dan pengelolaan data partisipan:
          </p>
          <ul className="space-y-1.5 text-xs text-slate-600 pt-1">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span><strong>Privasi Terjaga</strong>: Nama, telepon, dan nama usaha disamarkan.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span><strong>Persetujuan Partisipasi</strong>: Seluruh responden telah menyetujui ketentuan.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span><strong>Format Terstruktur</strong>: Data laporan tersusun rapi dan siap diolah.</span>
            </li>
          </ul>
        </Card>
      </div>

      {/* Tabel Dataset Riset Ilmiah Interaktif */}
      <Card className="p-5 bg-white border border-slate-200/80 rounded-2xl space-y-4 shadow-xs">
        {/* Header Tabel & Filter */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-0.5">
            <h3 className="font-bold text-sm text-slate-900">
              Data Partisipan Teranonimkan
            </h3>
            <p className="text-xs text-slate-500">
              Ringkasan profil usaha, aktivitas belajar, dan perkembangan penggunaan QRIS
            </p>
          </div>

          {/* Kontrol Filter & Search */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full xl:w-auto">
            {/* Input Cari */}
            <div className="relative col-span-2 w-full sm:w-52">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari ID / wilayah..."
                className="w-full h-9 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Filter Wilayah */}
            <select
              className="w-full sm:w-auto h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">Semua Wilayah</option>
              {uniqueRegions.map((reg) => (
                <option key={reg} value={reg}>
                  Kab. {reg}
                </option>
              ))}
            </select>

            {/* Filter Perkembangan Adopsi */}
            <select
              className="w-full sm:w-auto h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
              value={selectedTrajectory}
              onChange={(e) => {
                setSelectedTrajectory(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">Semua Perkembangan</option>
              <option value="Baru Mengadopsi">Baru Mengadopsi</option>
              <option value="Adopsi Berkelanjutan">Adopsi Berkelanjutan</option>
              <option value="Belum Mengadopsi">Belum Mengadopsi</option>
            </select>
          </div>
        </div>

        {/* Tabel Data Responsif & Ringkas */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full text-left text-xs min-w-[780px] tabular-nums">
            <thead className="bg-slate-50/90 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3.5">Partisipan & Usaha</th>
                <th className="py-2.5 px-3">Profil Pemilik</th>
                <th className="py-2.5 px-3">Status QRIS</th>
                <th className="py-2.5 px-3">Edukasi & Transaksi</th>
                <th className="py-2.5 px-3">Keaktifan & XP</th>
                <th className="py-2.5 px-3.5 text-right">Perkembangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada data partisipan yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => {
                  const formatQrisLabel = (status: string) => {
                    if (status === 'active') return 'Aktif';
                    if (status === 'applied') return 'Mengajukan';
                    return 'Belum Aktif';
                  };

                  return (
                    <tr key={row.participantId} className="hover:bg-slate-50/70 transition-colors">
                      {/* Partisipan & Usaha */}
                      <td className="py-2.5 px-3.5">
                        <div className="font-mono font-bold text-sky-700 whitespace-nowrap">
                          {row.participantId}
                        </div>
                        <div className="text-[11px] text-slate-600 truncate max-w-[190px]">
                          {row.regionRegency} • {row.businessCategory}
                        </div>
                      </td>

                      {/* Demografi */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="text-slate-800 font-medium">
                          {row.gender === 'M' ? 'Pria' : 'Wanita'}, {row.ageGroup} thn
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {row.educationLevel} • {row.monthlyTurnoverBracket}
                        </div>
                      </td>

                      {/* Status QRIS Awal -> Terkini */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <span className="text-[11px] text-slate-500 font-medium">
                            {formatQrisLabel(row.qrisStatusInitial)}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-md font-bold ${
                              row.isAdoptedQris
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {formatQrisLabel(row.qrisStatusCurrent)}
                          </span>
                        </div>
                      </td>

                      {/* Edukasi & Transaksi */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">
                          {row.modulesCompleted} Modul{' '}
                          <span className="text-amber-700 font-medium">({row.avgQuizScorePercent}%)</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {row.verifiedTransactions}/{row.reportedTransactions} Sah{' '}
                          <span className="text-emerald-600 font-semibold">({row.verificationRatePercent}%)</span>
                        </div>
                      </td>

                      {/* Keaktifan & XP */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-bold text-amber-600">
                          {row.totalXp} XP{' '}
                          <span className="text-slate-500 font-semibold">• Lvl {row.currentLevel}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {row.missionsCompleted} Misi • {row.activeDaysCount} Hr • {row.rewardsRedeemed} Hadiah
                        </div>
                      </td>

                      {/* Trajektori Adopsi */}
                      <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                        {row.adoptionTrajectory === 'Baru Mengadopsi' ? (
                          <span className="text-xs font-semibold text-emerald-700">
                            Baru Mengadopsi
                          </span>
                        ) : row.adoptionTrajectory === 'Adopsi Berkelanjutan' ? (
                          <span className="text-xs font-semibold text-sky-700">
                            Berkelanjutan
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-slate-500">
                            Belum Adopsi
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Kontrol Pagination Interaktif */}
        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs">
            <div className="text-slate-500 font-medium">
              Menampilkan <strong className="text-slate-800">{startIndex + 1}</strong> –{' '}
              <strong className="text-slate-800">{Math.min(startIndex + pageSize, totalItems)}</strong> dari{' '}
              <strong className="text-slate-800">{totalItems}</strong> data partisipan
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Tampilkan:</span>
                <select
                  className="h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={5}>5 per halaman</option>
                  <option value={10}>10 per halaman</option>
                  <option value={20}>20 per halaman</option>
                </select>
              </div>

              {/* Tombol Halaman */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                        currentPage === pageNum
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Halaman Berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Modal Kamus Variabel Riset (Research Codebook Modal) */}
      {showCodebookModal && (
        <div className="fixed inset-0 z-[100] !mt-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-sky-600" />
                  <span>Kamus Variabel Penelitian (Research Codebook)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Definisi operasional, skala pengukuran, dan kode variabel untuk evaluasi serta analisis data statistik
                </p>
              </div>
              <button
                type="button"
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                onClick={() => setShowCodebookModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pencarian di dalam Codebook */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari kode variabel, konstruk teori, atau deskripsi..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
                value={codebookFilter}
                onChange={(e) => setCodebookFilter(e.target.value)}
              />
            </div>

            {/* Daftar Tabel Codebook */}
            <div className="overflow-y-auto flex-1 border border-slate-200/80 rounded-xl">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Kode SPSS/R</th>
                    <th className="py-2.5 px-3">Nama Variabel</th>
                    <th className="py-2.5 px-3">Konstruk & Teori</th>
                    <th className="py-2.5 px-3">Skala</th>
                    <th className="py-2.5 px-3">Definisi & Nilai Coding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredCodebook.map((item) => (
                    <tr key={item.code} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-sky-700">{item.code}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{item.label}</td>
                      <td className="py-2.5 px-3">
                        <div className="text-slate-900 font-medium">{item.construct}</div>
                        <div className="text-[10px] text-slate-500">{item.theory}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {item.scaleType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        <div>{item.description}</div>
                        {item.valueLabels && (
                          <div className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                            {item.valueLabels}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-medium">
                Total {filteredCodebook.length} variabel riset terdefinisi
              </span>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setShowCodebookModal(false)}
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
