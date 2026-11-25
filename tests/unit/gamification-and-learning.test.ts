import { describe, it, expect } from 'vitest';
import { calculateLevelProgress, DEFAULT_LEVELS } from '@/modules/gamification/level-calculator';
import { evaluateQuiz, QuizQuestion } from '@/modules/learning/learning.service';

describe('Gamification Level Calculator', () => {
  it('menghitung level 1 (Pemula) untuk XP 0', () => {
    const res = calculateLevelProgress(0, DEFAULT_LEVELS);
    expect(res.currentLevel.levelNumber).toBe(1);
    expect(res.currentLevel.name).toBe('Pemula QRIS');
    expect(res.nextLevel?.levelNumber).toBe(2);
    expect(res.progressPercent).toBe(0);
    expect(res.xpToNextLevel).toBe(100);
  });

  it('menghitung level 2 (Pedagang Cakap) pada 150 XP', () => {
    const res = calculateLevelProgress(150, DEFAULT_LEVELS);
    expect(res.currentLevel.levelNumber).toBe(2);
    expect(res.currentLevel.name).toBe('Pedagang Cakap');
    expect(res.nextLevel?.levelNumber).toBe(3);
    // Range lv 2 adalah 100 s.d. 250 (range = 150). Gained = 50. 50/150 = 33%
    expect(res.progressPercent).toBe(33);
    expect(res.xpToNextLevel).toBe(100);
  });

  it('menangani level maksimal (Jawara QRIS) tanpa nextLevel', () => {
    const res = calculateLevelProgress(600, DEFAULT_LEVELS);
    expect(res.currentLevel.levelNumber).toBe(4);
    expect(res.currentLevel.name).toBe('Jawara QRIS');
    expect(res.nextLevel).toBeNull();
    expect(res.progressPercent).toBe(100);
    expect(res.xpToNextLevel).toBeNull();
  });
});

describe('Learning Center Quiz Evaluation', () => {
  const dummyQuiz: QuizQuestion[] = [
    {
      id: 'q1',
      question: 'Soal 1',
      options: ['A', 'B', 'C'],
      correctOptionIndex: 1, // B
      explanation: 'Penjelasan 1',
    },
    {
      id: 'q2',
      question: 'Soal 2',
      options: ['X', 'Y', 'Z'],
      correctOptionIndex: 0, // X
      explanation: 'Penjelasan 2',
    },
  ];

  it('lulus jika semua jawaban benar (100%)', () => {
    const answers = { q1: 1, q2: 0 };
    const result = evaluateQuiz(dummyQuiz, answers);
    expect(result.score).toBe(100);
    expect(result.passed).toBe(true);
    expect(result.correctCount).toBe(2);
  });

  it('tidak lulus jika 1 dari 2 soal salah (50% < ambang 70%)', () => {
    const answers = { q1: 1, q2: 1 }; // q2 salah
    const result = evaluateQuiz(dummyQuiz, answers);
    expect(result.score).toBe(50);
    expect(result.passed).toBe(false);
    expect(result.correctCount).toBe(1);
  });

  it('menangani jawaban kosong tanpa error', () => {
    const result = evaluateQuiz(dummyQuiz, {});
    expect(result.score).toBe(0);
    expect(result.passed).toBe(false);
  });
});

