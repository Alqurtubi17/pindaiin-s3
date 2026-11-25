// src/modules/analytics/research-export.service.ts
// Layanan analitik dan ekspor dataset riset empiris teranonimkan (Pseudonymized Research Data Export)
// Variabel dikumpulkan dari aktivitas riil platform: profil UMKM, status adopsi QRIS, pembelajaran, transaksi terverifikasi, dan gamifikasi.

export interface RawMerchantResearchData {
  userId: string;
  displayName: string;
  phoneE164: string | null;
  businessName: string;
  businessCategory: string;
  province: string;
  regency: string;
  district: string | null;
  ruralLocality: string | null;
  qrisStatusInitial: 'not_active' | 'applied' | 'active';
  qrisStatusCurrent: 'not_active' | 'applied' | 'active';
  totalXp: number;
  currentLevelNumber: number;
  completedLessonsCount: number;
  reportedTransactionsCount: number;
  verifiedTransactionsCount: number;
  rewardsRedeemedCount: number;
  consentVersion: string;
  consentAcceptedAt: string;
  // Variabel profil demografi dan usaha
  gender: 'M' | 'F';
  ageGroup: '<30' | '30-39' | '40-49' | '50+';
  educationLevel: 'SD/SMP' | 'SMA/SMK' | 'Diploma/Sarjana';
  firmAgeYears: '<2 thn' | '2-5 thn' | '>5 thn';
  monthlyTurnoverBracket: '<5 jt' | '5-15 jt' | '15-30 jt' | '>30 jt';
  dailyCustomerCount: number;
  // Variabel performa belajar & gamifikasi
  avgQuizScorePercent: number; // 0 - 100%
  missionsCompletedCount: number;
  badgesEarnedCount: number;
  activeDaysCount: number;
}

export interface PseudonymizedResearchRecord {
  participantId: string; // Misal: "PARTICIPANT_001"
  regionProvince: string;
  regionRegency: string;
  businessCategory: string;
  qrisStatusInitial: string;
  qrisStatusCurrent: string;
  isAdoptedQris: boolean;
  totalXp: number;
  currentLevel: number;
  modulesCompleted: number;
  reportedTransactions: number;
  verifiedTransactions: number;
  verificationRatePercent: number;
  rewardsRedeemed: number;
  consentVersion: string;
  studyOnboardedAt: string;
  // Karakteristik Demografi & Usaha
  gender: 'M' | 'F';
  ageGroup: string;
  educationLevel: string;
  firmAgeYears: string;
  monthlyTurnoverBracket: string;
  dailyCustomerCount: number;
  // Performa Belajar & Gamifikasi
  avgQuizScorePercent: number;
  missionsCompleted: number;
  badgesEarned: number;
  activeDaysCount: number;
  adoptionTrajectory: 'Baru Mengadopsi' | 'Adopsi Berkelanjutan' | 'Belum Mengadopsi';
}

export interface ResearchAggregateMetrics {
  totalParticipants: number;
  activeQrisAdoptionRatePercent: number;
  totalLessonsCompleted: number;
  totalReportedTransactions: number;
  totalVerifiedTransactions: number;
  overallVerificationRatePercent: number;
  totalRewardsRedeemed: number;
  averageXpPerMerchant: number;
  avgQuizScore: number;
  netAdoptionGainCount: number;
  avgMissionsCompleted: number;
  avgActiveDays: number;
}

export interface VariableCodebookItem {
  code: string;
  label: string;
  construct: string;
  theory: string;
  scaleType: 'Nominal' | 'Ordinal' | 'Rasio/Interval';
  description: string;
  valueLabels?: string;
}

/**
 * Kamus Variabel Riset (Research Variable Codebook)
 * Berdasarkan metrik teramati nyata dari penggunaan aplikasi DigiUMKM
 */
export const RESEARCH_CODEBOOK: VariableCodebookItem[] = [
  {
    code: 'PART_ID',
    label: 'ID Partisipan',
    construct: 'Participant Identifier',
    theory: 'Research Ethics & Anonymity',
    scaleType: 'Nominal',
    description: 'Kode anonim partisipan untuk menjaga kerahasiaan identitas pemilik usaha.',
    valueLabels: 'PARTICIPANT_001 s/d PARTICIPANT_nnn',
  },
  {
    code: 'GENDER',
    label: 'Jenis Kelamin Pemilik',
    construct: 'Demographic Characteristic',
    theory: 'Control Variable',
    scaleType: 'Nominal',
    description: 'Jenis kelamin pemilik/pengelola unit usaha mikro.',
    valueLabels: '1 = Laki-laki (M), 2 = Perempuan (F)',
  },
  {
    code: 'AGE_GRP',
    label: 'Kelompok Usia',
    construct: 'Demographic Characteristic',
    theory: 'Control Variable',
    scaleType: 'Ordinal',
    description: 'Rentang usia responden pelaku UMKM.',
    valueLabels: '1 = <30 thn, 2 = 30-39 thn, 3 = 40-49 thn, 4 = 50+ thn',
  },
  {
    code: 'EDU_LVL',
    label: 'Pendidikan Terakhir',
    construct: 'Human Capital',
    theory: 'Control Variable',
    scaleType: 'Ordinal',
    description: 'Jenjang pendidikan formal tertinggi yang diselesaikan pemilik usaha.',
    valueLabels: '1 = SD/SMP, 2 = SMA/SMK, 3 = Diploma/Sarjana',
  },
  {
    code: 'FIRM_AGE',
    label: 'Lama Operasional Usaha',
    construct: 'Firm Characteristic',
    theory: 'Organizational Readiness',
    scaleType: 'Ordinal',
    description: 'Durasi operasional usaha mikro berjalan.',
    valueLabels: '1 = <2 thn, 2 = 2-5 thn, 3 = >5 thn',
  },
  {
    code: 'TURNOVER',
    label: 'Estimasi Omzet Bulanan',
    construct: 'Firm Size / Revenue',
    theory: 'Economic Capacity',
    scaleType: 'Ordinal',
    description: 'Rata-rata pendapatan kotor usaha per bulan dalam Rupiah.',
    valueLabels: '1 = <5 jt, 2 = 5-15 jt, 3 = 15-30 jt, 4 = >30 jt',
  },
  {
    code: 'CUSTOMERS',
    label: 'Estimasi Pelanggan Harian',
    construct: 'Customer Traffic',
    theory: 'Transaction Volume Potential',
    scaleType: 'Rasio/Interval',
    description: 'Rata-rata jumlah pembeli yang bertransaksi setiap hari.',
    valueLabels: 'Angka integer pelanggan per hari',
  },
  {
    code: 'REGION',
    label: 'Wilayah Kabupaten',
    construct: 'Geographic Context',
    theory: 'Rural Locality Context',
    scaleType: 'Nominal',
    description: 'Kabupaten domisili usaha di kawasan Jawa Timur.',
    valueLabels: 'Jember, Banyuwangi, Bondowoso, Situbondo, Lumajang, Probolinggo',
  },
  {
    code: 'SECTOR',
    label: 'Kategori Sektor Usaha',
    construct: 'Business Sector',
    theory: 'Industry Specificity',
    scaleType: 'Nominal',
    description: 'Bidang komoditas atau layanan utama usaha mikro.',
    valueLabels: 'Kelontong & Sembako, Kuliner/Warung, Pakaian, Pertanian, Kriya, Jasa',
  },
  {
    code: 'PRE_QRIS',
    label: 'Status Adopsi QRIS Awal',
    construct: 'Baseline Adoption State',
    theory: 'Innovation Adoption Lifecycle',
    scaleType: 'Nominal',
    description: 'Kondisi kepemilikan dan penggunaan QRIS saat pertama kali bergabung ke program.',
    valueLabels: '0 = Belum Aktif, 1 = Sedang Mengajukan, 2 = Sudah Aktif',
  },
  {
    code: 'POST_QRIS',
    label: 'Status Adopsi QRIS Terkini',
    construct: 'Adoption Outcome',
    theory: 'Innovation Adoption Outcome',
    scaleType: 'Nominal',
    description: 'Status keaktifan penggunaan QRIS setelah mengikuti pendampingan program.',
    valueLabels: '1 = Aktif / Mengadopsi, 0 = Belum Aktif',
  },
  {
    code: 'ADOPT_STAT',
    label: 'Trajektori Adopsi',
    construct: 'Categorical Adoption Status',
    theory: 'Adoption Dynamics',
    scaleType: 'Nominal',
    description: 'Klasifikasi transisi status adopsi responden sebelum dan sesudah program.',
    valueLabels: '1 = Baru Mengadopsi, 2 = Adopsi Berkelanjutan, 3 = Belum Mengadopsi',
  },
  {
    code: 'MOD_DONE',
    label: 'Modul Edukasi Selesai',
    construct: 'Learning Intervention Exposure',
    theory: 'Capacity Building Intervention',
    scaleType: 'Rasio/Interval',
    description: 'Jumlah modul pembelajaran digital dan keamanan QRIS yang diselesaikan.',
    valueLabels: 'Angka bulat (0 - 10)',
  },
  {
    code: 'QUIZ_AVG',
    label: 'Rata-rata Nilai Kuis',
    construct: 'Cognitive Learning Mastery',
    theory: 'Knowledge Retention',
    scaleType: 'Rasio/Interval',
    description: 'Persentase rata-rata skor evaluasi pemahaman modul kuis.',
    valueLabels: '0% s/d 100%',
  },
  {
    code: 'QRIS_REP',
    label: 'Frekuensi Lapor Transaksi',
    construct: 'Reported Usage Behavior',
    theory: 'Reported Activity Frequency',
    scaleType: 'Rasio/Interval',
    description: 'Total transaksi penerimaan pembayaran QRIS yang dilaporkan oleh pedagang.',
    valueLabels: 'Jumlah laporan transaksi',
  },
  {
    code: 'QRIS_VER',
    label: 'Transaksi Terverifikasi Sah',
    construct: 'Verified Usage Behavior',
    theory: 'Verified Adoption Metric',
    scaleType: 'Rasio/Interval',
    description: 'Total transaksi QRIS yang telah ditinjau dan dinyatakan sah oleh admin.',
    valueLabels: 'Jumlah transaksi sah terverifikasi',
  },
  {
    code: 'VER_RATE',
    label: 'Tingkat Akurasi Verifikasi',
    construct: 'Reporting Integrity',
    theory: 'Data Reliability Construct',
    scaleType: 'Rasio/Interval',
    description: 'Persentase transaksi sah terhadap total transaksi yang dilaporkan pedagang.',
    valueLabels: '0% s/d 100%',
  },
  {
    code: 'XP_TOTAL',
    label: 'Akumulasi Poin Pengalaman (XP)',
    construct: 'Gamification Engagement',
    theory: 'Behavioral Reinforcement',
    scaleType: 'Rasio/Interval',
    description: 'Total poin pengalaman (XP) yang terkumpul dari seluruh aktivitas belajar dan transaksi.',
    valueLabels: 'Angka integer positif',
  },
  {
    code: 'MIS_DONE',
    label: 'Misi Selesai',
    construct: 'Mission Completion',
    theory: 'Goal-Setting Theory',
    scaleType: 'Rasio/Interval',
    description: 'Jumlah tantangan atau misi adopsi QRIS yang berhasil diselesaikan pedagang.',
    valueLabels: 'Jumlah misi (0 - n)',
  },
  {
    code: 'BADGES',
    label: 'Lencana Diperoleh',
    construct: 'Recognition & Status',
    theory: 'Self-Determination Theory',
    scaleType: 'Rasio/Interval',
    description: 'Jumlah lencana pencapaian usaha yang berhasil dibuka.',
    valueLabels: 'Jumlah lencana (0 - n)',
  },
  {
    code: 'REW_RED',
    label: 'Penukaran Hadiah Usaha',
    construct: 'Tangible Reward Redemption',
    theory: 'Incentive Reinforcement',
    scaleType: 'Rasio/Interval',
    description: 'Frekuensi penukaran poin dengan perlengkapan usaha riil (spanduk, stand QRIS, merchandise).',
    valueLabels: 'Frekuensi penukaran hadiah',
  },
  {
    code: 'ACT_DAYS',
    label: 'Jumlah Hari Aktif',
    construct: 'Platform Engagement Retention',
    theory: 'Habitual Technology Usage',
    scaleType: 'Rasio/Interval',
    description: 'Total hari unik pedagang membuka platform dan melakukan interaksi aktif.',
    valueLabels: 'Jumlah hari aktif',
  },
];

/**
 * Dataset 10 Responden Representatif Wilayah Rural Jawa Timur
 * Berisi metrik riil teramati: profil, status QRIS awal-akhir, modul tuntas, transaksi terverifikasi, XP, misi, lencana, dan hadiah.
 */
export const SAMPLE_RAW_RESEARCH_DATA: RawMerchantResearchData[] = [
  {
    userId: 'u1111111-1111-1111-1111-111111111111',
    displayName: 'Siti Aminah',
    phoneE164: '+6281234567890',
    businessName: 'Warung Berkah Bu Siti',
    businessCategory: 'Kelontong & Sembako',
    province: 'Jawa Timur',
    regency: 'Jember',
    district: 'Ambulu',
    ruralLocality: 'Tegalsari',
    qrisStatusInitial: 'not_active',
    qrisStatusCurrent: 'active',
    totalXp: 350,
    currentLevelNumber: 2,
    completedLessonsCount: 2,
    reportedTransactionsCount: 15,
    verifiedTransactionsCount: 14,
    rewardsRedeemedCount: 1,
    consentVersion: '1.0',
    consentAcceptedAt: '2026-11-01T08:00:00Z',
    gender: 'F',
    ageGroup: '30-39',
    educationLevel: 'SMA/SMK',
    firmAgeYears: '2-5 thn',
    monthlyTurnoverBracket: '5-15 jt',
    dailyCustomerCount: 35,
    avgQuizScorePercent: 90,
    missionsCompletedCount: 4,
    badgesEarnedCount: 2,
    activeDaysCount: 18,
  },
  {
    userId: 'u2222222-2222-2222-2222-222222222222',
    displayName: 'Slamet Riyadi',
    phoneE164: '+6281298765432',
    businessName: 'Toko Kelontong Pak Slamet',
    businessCategory: 'Kelontong & Sembako',
    province: 'Jawa Timur',
    regency: 'Banyuwangi',
    district: 'Rogojampi',
    ruralLocality: 'Gitik',
    qrisStatusInitial: 'applied',
    qrisStatusCurrent: 'active',
    totalXp: 280,
    currentLevelNumber: 2,
    completedLessonsCount: 2,
    reportedTransactionsCount: 10,
    verifiedTransactionsCount: 9,
    rewardsRedeemedCount: 1,
    consentVersion: '1.0',
    consentAcceptedAt: '2026-11-02T09:30:00Z',
    gender: 'M',
    ageGroup: '40-49',
    educationLevel: 'SMA/SMK',
    firmAgeYears: '>5 thn',
    monthlyTurnoverBracket: '15-30 jt',
    dailyCustomerCount: 50,
    avgQuizScorePercent: 85,
    missionsCompletedCount: 3,
    badgesEarnedCount: 2,
    activeDaysCount: 15,
  },
  {
    userId: 'u3333333-3333-3333-3333-333333333333',
    displayName: 'Nur Hasanah',
    phoneE164: '+6281311223344',
    businessName: 'Warung Makan Bu Nur',
    businessCategory: 'Makanan & Minuman / Warung',
    province: 'Jawa Timur',
    regency: 'Bondowoso',
    district: 'Maesan',
    ruralLocality: 'Penanggungan',
    qrisStatusInitial: 'not_active',
    qrisStatusCurrent: 'not_active',
    totalXp: 120,
    currentLevelNumber: 1,
    completedLessonsCount: 1,
    reportedTransactionsCount: 4,
    verifiedTransactionsCount: 3,
    rewardsRedeemedCount: 0,
    consentVersion: '1.0',
    consentAcceptedAt: '2026-11-04T11:00:00Z',
    gender: 'F',
    ageGroup: '50+',
    educationLevel: 'SD/SMP',
    firmAgeYears: '>5 thn',
    monthlyTurnoverBracket: '<5 jt',
    dailyCustomerCount: 20,
    avgQuizScorePercent: 70,
    missionsCompletedCount: 1,
    badgesEarnedCount: 1,
    activeDaysCount: 6,
  },
  {
    userId: 'u4444444-4444-4444-4444-444444444444',
    displayName: 'Sri Wahyuni',
    phoneE164: '+6281755667788',
    businessName: 'Butik Batik Cantik',
    businessCategory: 'Pakaian & Tekstil',
    province: 'Jawa Timur',
    regency: 'Situbondo',
    district: 'Panji',
    ruralLocality: 'Curah Jeru',
    qrisStatusInitial: 'active',
    qrisStatusCurrent: 'active',
    totalXp: 520,
    currentLevelNumber: 4,
    completedLessonsCount: 3,
    reportedTransactionsCount: 25,
    verifiedTransactionsCount: 24,
    rewardsRedeemedCount: 2,
    consentVersion: '1.0',
    consentAcceptedAt: '2026-11-01T07:45:00Z',
    gender: 'F',
    ageGroup: '30-39',
    educationLevel: 'Diploma/Sarjana',
    firmAgeYears: '2-5 thn',
    monthlyTurnoverBracket: '15-30 jt',
    dailyCustomerCount: 40,
    avgQuizScorePercent: 95,
    missionsCompletedCount: 6,
    badgesEarnedCount: 3,
    activeDaysCount: 24,
  },
  {
    userId: 'u5555555-5555-5555-5555-555555555555',
    displayName: 'Budi Santoso',
    phoneE164: '+6285233445566',
    businessName: 'Hasil Tani Berkah Mandiri',
    businessCategory: 'Pertanian & Hasil Bumi',
    province: 'Jawa Timur',
    regency: 'Lumajang',
    district: 'Pasirian',
    ruralLocality: 'Bades',
    qrisStatusInitial: 'not_active',
    qrisStatusCurrent: 'active',
    totalXp: 240,
    currentLevelNumber: 2,
    completedLessonsCount: 2,
    reportedTransactionsCount: 12,
    verifiedTransactionsCount: 11,
    rewardsRedeemedCount: 1,
    consentVersion: '1.0',
    consentAcceptedAt: '2026-11-03T10:20:00Z',
    gender: 'M',
    ageGroup: '40-49',
    educationLevel: 'SMA/SMK',
    firmAgeYears: '>5 thn',
    monthlyTurnoverBracket: '5-15 jt',
    dailyCustomerCount: 25,
    avgQuizScorePercent: 80,
    missionsCompletedCount: 3,
    badgesEarnedCount: 1,
    activeDaysCount: 12,
  },
  {
    userId: 'u6666666-6666-6666-6666-666666666666',
    displayName: 'Ahmad Fauzi',
    phoneE164: '+6281988776655',
    businessName: 'Bengkel & Kriya Kayu Mandiri',
    businessCategory: 'Kerajinan & Kriya',
    province: 'Jawa Timur',
    regency: 'Jember',
    district: 'Wuluhan',
    ruralLocality: 'Dukuhdempit',
    qrisStatusInitial: 'active',
    qrisStatusCurrent: 'active',
    totalXp: 410,
    currentLevelNumber: 3,
    completedLessonsCount: 3,
    reportedTransactionsCount: 18,
    verifiedTransactionsCount: 17,
    rewardsRedeemedCount: 2,
    consentVersion: '1.0',
    consentAcceptedAt: '2026-11-02T15:30:00Z',
    gender: 'M',
    ageGroup: '30-39',
    educationLevel: 'SMA/SMK',
    firmAgeYears: '<2 thn',
    monthlyTurnoverBracket: '15-30 jt',
    dailyCustomerCount: 30,
    avgQuizScorePercent: 90,
    missionsCompletedCount: 4,
    badgesEarnedCount: 2,
    activeDaysCount: 20,
  },
  {
    userId: 'u7777777-7777-7777-7777-777777777777',
    displayName: 'Hendra Gunawan',
    phoneE164: '+6282133221100',
    businessName: 'Kedai Kopi Pedesaan',
    businessCategory: 'Makanan & Minuman / Warung',
    province: 'Jawa Timur',
    regency: 'Banyuwangi',
    district: 'Genteng',
    ruralLocality: 'Setail',
    qrisStatusInitial: 'not_active',
    qrisStatusCurrent: 'active',
    totalXp: 190,
    currentLevelNumber: 1,
    completedLessonsCount: 2,
    reportedTransactionsCount: 8,
    verifiedTransactionsCount: 7,
    rewardsRedeemedCount: 0,
    consentVersion: '1.0',
    consentAcceptedAt: '2026-11-05T09:10:00Z',
    gender: 'M',
    ageGroup: '30-39',
    educationLevel: 'SMA/SMK',
    firmAgeYears: '2-5 thn',
    monthlyTurnoverBracket: '<5 jt',
    dailyCustomerCount: 18,
    avgQuizScorePercent: 78,
    missionsCompletedCount: 2,
    badgesEarnedCount: 1,
    activeDaysCount: 10,
  },
  {
    userId: 'u8888888-8888-8888-8888-888888888888',
    displayName: 'Suparmi',
    phoneE164: '+6281344556677',
    businessName: 'Toko Kelontong Bu Suparmi',
    businessCategory: 'Kelontong & Sembako',
    province: 'Jawa Timur',
    regency: 'Probolinggo',
    district: 'Kraksaan',
    ruralLocality: 'Rondokuning',
    qrisStatusInitial: 'not_active',
    qrisStatusCurrent: 'not_active',
    totalXp: 110,
    currentLevelNumber: 1,
    completedLessonsCount: 1,
    reportedTransactionsCount: 5,
    verifiedTransactionsCount: 4,
    rewardsRedeemedCount: 0,
    consentVersion: '1.0',
    consentAcceptedAt: '2026-11-06T13:45:00Z',
    gender: 'F',
    ageGroup: '40-49',
    educationLevel: 'SD/SMP',
    firmAgeYears: '>5 thn',
    monthlyTurnoverBracket: '5-15 jt',
    dailyCustomerCount: 30,
    avgQuizScorePercent: 68,
    missionsCompletedCount: 1,
    badgesEarnedCount: 1,
    activeDaysCount: 5,
  },
  {
    userId: 'u9999999-9999-9999-9999-999999999999',
    displayName: 'Dewi Lestari',
    phoneE164: '+6287812345678',
    businessName: 'Dapur Bu Dewi Catering',
    businessCategory: 'Makanan & Minuman / Warung',
    province: 'Jawa Timur',
    regency: 'Bondowoso',
    district: 'Tamanan',
    ruralLocality: 'Sumberkemuning',
    qrisStatusInitial: 'applied',
    qrisStatusCurrent: 'active',
    totalXp: 370,
    currentLevelNumber: 3,
    completedLessonsCount: 3,
    reportedTransactionsCount: 16,
    verifiedTransactionsCount: 15,
    rewardsRedeemedCount: 1,
    consentVersion: '1.0',
    consentAcceptedAt: '2026-11-03T14:15:00Z',
    gender: 'F',
    ageGroup: '<30',
    educationLevel: 'SMA/SMK',
    firmAgeYears: '<2 thn',
    monthlyTurnoverBracket: '5-15 jt',
    dailyCustomerCount: 45,
    avgQuizScorePercent: 88,
    missionsCompletedCount: 4,
    badgesEarnedCount: 2,
    activeDaysCount: 16,
  },
  {
    userId: 'u0000000-0000-0000-0000-000000000010',
    displayName: 'Rian Hidayat',
    phoneE164: '+6285298761234',
    businessName: 'Berkah Cell & Pulsa',
    businessCategory: 'Elektronik & Pulsa',
    province: 'Jawa Timur',
    regency: 'Situbondo',
    district: 'Besuki',
    ruralLocality: 'Pesisir',
    qrisStatusInitial: 'active',
    qrisStatusCurrent: 'active',
    totalXp: 490,
    currentLevelNumber: 4,
    completedLessonsCount: 3,
    reportedTransactionsCount: 28,
    verifiedTransactionsCount: 27,
    rewardsRedeemedCount: 2,
    consentVersion: '1.0',
    consentAcceptedAt: '2026-11-01T10:00:00Z',
    gender: 'M',
    ageGroup: '<30',
    educationLevel: 'Diploma/Sarjana',
    firmAgeYears: '2-5 thn',
    monthlyTurnoverBracket: '15-30 jt',
    dailyCustomerCount: 60,
    avgQuizScorePercent: 96,
    missionsCompletedCount: 5,
    badgesEarnedCount: 3,
    activeDaysCount: 22,
  },
];

/**
 * Mengonversi data mentah menjadi data teranonimkan (Zero PII) dengan seluruh variabel teramati
 */
export function pseudonymizeRecords(records: RawMerchantResearchData[]): PseudonymizedResearchRecord[] {
  return records.map((r, index) => {
    const participantId = `PARTICIPANT_${String(index + 1).padStart(3, '0')}`;
    const verificationRate =
      r.reportedTransactionsCount > 0
        ? Math.round((r.verifiedTransactionsCount / r.reportedTransactionsCount) * 100)
        : 0;

    let adoptionTrajectory: 'Baru Mengadopsi' | 'Adopsi Berkelanjutan' | 'Belum Mengadopsi' = 'Belum Mengadopsi';
    if (r.qrisStatusCurrent === 'active') {
      if (r.qrisStatusInitial === 'active') {
        adoptionTrajectory = 'Adopsi Berkelanjutan';
      } else {
        adoptionTrajectory = 'Baru Mengadopsi';
      }
    }

    return {
      participantId,
      regionProvince: r.province,
      regionRegency: r.regency,
      businessCategory: r.businessCategory,
      qrisStatusInitial: r.qrisStatusInitial,
      qrisStatusCurrent: r.qrisStatusCurrent,
      isAdoptedQris: r.qrisStatusCurrent === 'active',
      totalXp: r.totalXp,
      currentLevel: r.currentLevelNumber,
      modulesCompleted: r.completedLessonsCount,
      reportedTransactions: r.reportedTransactionsCount,
      verifiedTransactions: r.verifiedTransactionsCount,
      verificationRatePercent: verificationRate,
      rewardsRedeemed: r.rewardsRedeemedCount,
      consentVersion: r.consentVersion,
      studyOnboardedAt: r.consentAcceptedAt.split('T')[0],
      gender: r.gender || 'M',
      ageGroup: r.ageGroup || '30-39',
      educationLevel: r.educationLevel || 'SMA/SMK',
      firmAgeYears: r.firmAgeYears || '2-5 thn',
      monthlyTurnoverBracket: r.monthlyTurnoverBracket || '5-15 jt',
      dailyCustomerCount: r.dailyCustomerCount || 30,
      avgQuizScorePercent: r.avgQuizScorePercent || 80,
      missionsCompleted: r.missionsCompletedCount || 3,
      badgesEarned: r.badgesEarnedCount || 2,
      activeDaysCount: r.activeDaysCount || 14,
      adoptionTrajectory,
    };
  });
}

/**
 * Menghitung metrik agregat statistik untuk evaluasi dan analisis penelitian
 */
export function calculateAggregateMetrics(records: PseudonymizedResearchRecord[]): ResearchAggregateMetrics {
  const totalParticipants = records.length;
  if (totalParticipants === 0) {
    return {
      totalParticipants: 0,
      activeQrisAdoptionRatePercent: 0,
      totalLessonsCompleted: 0,
      totalReportedTransactions: 0,
      totalVerifiedTransactions: 0,
      overallVerificationRatePercent: 0,
      totalRewardsRedeemed: 0,
      averageXpPerMerchant: 0,
      avgQuizScore: 0,
      netAdoptionGainCount: 0,
      avgMissionsCompleted: 0,
      avgActiveDays: 0,
    };
  }

  const adoptedCount = records.filter((r) => r.isAdoptedQris).length;
  const initialAdoptedCount = records.filter((r) => r.qrisStatusInitial === 'active').length;
  const activeQrisAdoptionRatePercent = Math.round((adoptedCount / totalParticipants) * 100);

  const totalLessonsCompleted = records.reduce((acc, r) => acc + r.modulesCompleted, 0);
  const totalReportedTransactions = records.reduce((acc, r) => acc + r.reportedTransactions, 0);
  const totalVerifiedTransactions = records.reduce((acc, r) => acc + r.verifiedTransactions, 0);
  const totalRewardsRedeemed = records.reduce((acc, r) => acc + r.rewardsRedeemed, 0);
  const totalXpAll = records.reduce((acc, r) => acc + r.totalXp, 0);
  const totalMissions = records.reduce((acc, r) => acc + r.missionsCompleted, 0);
  const totalDays = records.reduce((acc, r) => acc + r.activeDaysCount, 0);

  const overallVerificationRatePercent =
    totalReportedTransactions > 0
      ? Math.round((totalVerifiedTransactions / totalReportedTransactions) * 100)
      : 0;

  const averageXpPerMerchant = Math.round(totalXpAll / totalParticipants);
  const sumQuiz = records.reduce((acc, r) => acc + r.avgQuizScorePercent, 0);

  return {
    totalParticipants,
    activeQrisAdoptionRatePercent,
    totalLessonsCompleted,
    totalReportedTransactions,
    totalVerifiedTransactions,
    overallVerificationRatePercent,
    totalRewardsRedeemed,
    averageXpPerMerchant,
    avgQuizScore: Math.round(sumQuiz / totalParticipants),
    netAdoptionGainCount: Math.max(0, adoptedCount - initialAdoptedCount),
    avgMissionsCompleted: Number((totalMissions / totalParticipants).toFixed(1)),
    avgActiveDays: Math.round(totalDays / totalParticipants),
  };
}

/**
 * Format CSV Deskriptif Umum
 */
export function convertToCSV(records: PseudonymizedResearchRecord[]): string {
  if (records.length === 0) return '';

  const headers = [
    'participant_id',
    'region_province',
    'region_regency',
    'business_category',
    'gender',
    'age_group',
    'education_level',
    'firm_age',
    'monthly_turnover',
    'daily_customers',
    'qris_status_initial',
    'qris_status_current',
    'adoption_trajectory',
    'is_adopted_qris',
    'modules_completed',
    'avg_quiz_score_percent',
    'reported_transactions',
    'verified_transactions',
    'verification_rate_percent',
    'total_xp',
    'current_level',
    'missions_completed',
    'badges_earned',
    'rewards_redeemed',
    'active_days',
    'consent_version',
    'study_onboarded_at',
  ];

  const rows = records.map((r) => [
    r.participantId,
    `"${r.regionProvince}"`,
    `"${r.regionRegency}"`,
    `"${r.businessCategory}"`,
    r.gender,
    `"${r.ageGroup}"`,
    `"${r.educationLevel}"`,
    `"${r.firmAgeYears}"`,
    `"${r.monthlyTurnoverBracket}"`,
    r.dailyCustomerCount,
    r.qrisStatusInitial,
    r.qrisStatusCurrent,
    `"${r.adoptionTrajectory}"`,
    r.isAdoptedQris ? 1 : 0,
    r.modulesCompleted,
    r.avgQuizScorePercent,
    r.reportedTransactions,
    r.verifiedTransactions,
    r.verificationRatePercent,
    r.totalXp,
    r.currentLevel,
    r.missionsCompleted,
    r.badgesEarned,
    r.rewardsRedeemed,
    r.activeDaysCount,
    r.consentVersion,
    r.studyOnboardedAt,
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

/**
 * Format CSV Numerik Terstandarisasi untuk Software Statistik (IBM SPSS, SmartPLS 4, R)
 */
export function convertToSpssCSV(records: PseudonymizedResearchRecord[]): string {
  if (records.length === 0) return '';

  const headers = [
    'PART_ID',
    'GENDER',
    'AGE_GRP',
    'EDU_LVL',
    'FIRM_AGE',
    'TURNOVER',
    'CUSTOMERS',
    'PRE_QRIS',
    'MOD_DONE',
    'QUIZ_AVG',
    'QRIS_REP',
    'QRIS_VER',
    'VER_RATE',
    'XP_TOTAL',
    'MIS_DONE',
    'BADGES',
    'REW_RED',
    'ACT_DAYS',
    'POST_QRIS',
    'ADOPT_STAT',
  ];

  const rows = records.map((r) => {
    const genderCode = r.gender === 'M' ? 1 : 2;
    const ageCode = r.ageGroup === '<30' ? 1 : r.ageGroup === '30-39' ? 2 : r.ageGroup === '40-49' ? 3 : 4;
    const eduCode = r.educationLevel === 'SD/SMP' ? 1 : r.educationLevel === 'SMA/SMK' ? 2 : 3;
    const firmAgeCode = r.firmAgeYears === '<2 thn' ? 1 : r.firmAgeYears === '2-5 thn' ? 2 : 3;
    const turnoverCode =
      r.monthlyTurnoverBracket === '<5 jt' ? 1 : r.monthlyTurnoverBracket === '5-15 jt' ? 2 : r.monthlyTurnoverBracket === '15-30 jt' ? 3 : 4;
    const preQrisCode = r.qrisStatusInitial === 'not_active' ? 0 : r.qrisStatusInitial === 'applied' ? 1 : 2;
    const postQrisCode = r.isAdoptedQris ? 1 : 0;
    const adoptStatCode =
      r.adoptionTrajectory === 'Baru Mengadopsi' ? 1 : r.adoptionTrajectory === 'Adopsi Berkelanjutan' ? 2 : 3;

    return [
      r.participantId,
      genderCode,
      ageCode,
      eduCode,
      firmAgeCode,
      turnoverCode,
      r.dailyCustomerCount,
      preQrisCode,
      r.modulesCompleted,
      r.avgQuizScorePercent,
      r.reportedTransactions,
      r.verifiedTransactions,
      r.verificationRatePercent,
      r.totalXp,
      r.missionsCompleted,
      r.badgesEarned,
      r.rewardsRedeemed,
      r.activeDaysCount,
      postQrisCode,
      adoptStatCode,
    ];
  });

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}
