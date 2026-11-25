import { describe, it, expect } from 'vitest';
import {
  pseudonymizeRecords,
  calculateAggregateMetrics,
  convertToCSV,
  convertToSpssCSV,
  SAMPLE_RAW_RESEARCH_DATA,
  RESEARCH_CODEBOOK,
} from '@/modules/analytics/research-export.service';

describe('Research Data Anonymization & Export (Zero PII & Real Platform Telemetry)', () => {
  const anonymized = pseudonymizeRecords(SAMPLE_RAW_RESEARCH_DATA);

  it('mengonversi ID menjadi identifier anonim terstandarisasi', () => {
    expect(anonymized[0].participantId).toBe('PARTICIPANT_001');
    expect(anonymized[1].participantId).toBe('PARTICIPANT_002');
    expect(anonymized[9].participantId).toBe('PARTICIPANT_010');
  });

  it('menjamin tidak ada kebocoran PII (nama lengkap, nomor telepon, nama toko, desa)', () => {
    const rawSample = SAMPLE_RAW_RESEARCH_DATA[0];
    const jsonString = JSON.stringify(anonymized);

    // Pastikan nilai PII tidak muncul di dataset hasil ekspor
    expect(jsonString).not.toContain(rawSample.displayName);
    expect(jsonString).not.toContain(rawSample.phoneE164!);
    expect(jsonString).not.toContain(rawSample.businessName);
    expect(jsonString).not.toContain(rawSample.ruralLocality!);
  });

  it('memiliki seluruh variabel konstruk penelitian empiris platform (profil, modul, kuis, transaksi sah, gamifikasi)', () => {
    const record = anonymized[0];
    expect(record.gender).toBeDefined();
    expect(record.ageGroup).toBeDefined();
    expect(record.educationLevel).toBeDefined();
    expect(record.firmAgeYears).toBeDefined();
    expect(record.monthlyTurnoverBracket).toBeDefined();
    expect(record.modulesCompleted).toBeGreaterThanOrEqual(1);
    expect(record.avgQuizScorePercent).toBeGreaterThanOrEqual(70);
    expect(record.verifiedTransactions).toBeGreaterThanOrEqual(1);
    expect(record.totalXp).toBeGreaterThanOrEqual(100);
    expect(record.adoptionTrajectory).toBe('Baru Mengadopsi');
  });

  it('menghitung metrik agregat dengan formula yang tepat', () => {
    const metrics = calculateAggregateMetrics(anonymized);

    expect(metrics.totalParticipants).toBe(10);
    expect(metrics.activeQrisAdoptionRatePercent).toBe(80);
    expect(metrics.totalLessonsCompleted).toBe(22);
    expect(metrics.totalReportedTransactions).toBe(141);
    expect(metrics.totalVerifiedTransactions).toBe(131);
    expect(metrics.overallVerificationRatePercent).toBe(93);
    expect(metrics.totalRewardsRedeemed).toBe(10);
    expect(metrics.averageXpPerMerchant).toBe(308);
    expect(metrics.avgQuizScore).toBe(84);
    expect(metrics.avgMissionsCompleted).toBe(3.3);
    expect(metrics.avgActiveDays).toBe(15);
  });

  it('menghasilkan output CSV umum yang valid dan bebas PII', () => {
    const csv = convertToCSV(anonymized);
    const lines = csv.split('\n');

    expect(lines.length).toBe(11); // Header + 10 baris data
    expect(lines[0]).toContain('participant_id,region_province,region_regency');
    expect(lines[1]).toContain('PARTICIPANT_001');
    expect(csv).not.toContain('Siti Aminah'); // Anti PII
  });

  it('menghasilkan output CSV khusus SPSS/SmartPLS/R dengan kode numerik terstandarisasi', () => {
    const spssCsv = convertToSpssCSV(anonymized);
    const lines = spssCsv.split('\n');

    expect(lines.length).toBe(11);
    expect(lines[0]).toContain('PART_ID,GENDER,AGE_GRP,EDU_LVL');
    expect(lines[1]).toContain('PARTICIPANT_001');
    expect(RESEARCH_CODEBOOK.length).toBeGreaterThan(15);
  });

  it('menangani dataset kosong secara aman tanpa error pembagian nol', () => {
    const emptyMetrics = calculateAggregateMetrics([]);
    expect(emptyMetrics.totalParticipants).toBe(0);
    expect(emptyMetrics.activeQrisAdoptionRatePercent).toBe(0);
    expect(emptyMetrics.overallVerificationRatePercent).toBe(0);

    const emptyCsv = convertToCSV([]);
    expect(emptyCsv).toBe('');
    const emptySpss = convertToSpssCSV([]);
    expect(emptySpss).toBe('');
  });
});

