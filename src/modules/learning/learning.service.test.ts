import { describe, it, expect } from 'vitest';
import {
  SAMPLE_LESSONS,
  generateLessonId,
  mergeWithDefaultLessons,
  evaluateQuiz,
} from './learning.service';

describe('learning.service', () => {
  it('provides 15 modules with clean unique slug lessonIds and 5 quiz questions each', () => {
    expect(SAMPLE_LESSONS).toHaveLength(15);

    const ids = SAMPLE_LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(15);

    for (const lesson of SAMPLE_LESSONS) {
      expect(lesson.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(lesson.quiz).toHaveLength(5);
    }
  });

  it('mergeWithDefaultLessons migrates legacy IDs, upgrades quizzes to 5 questions, and appends new default modules', () => {
    const legacy = [
      {
        ...SAMPLE_LESSONS[0],
        id: 'd1111111-1111-1111-1111-111111111111',
        quiz: SAMPLE_LESSONS[0].quiz.slice(0, 2),
      },
    ];
    const merged = mergeWithDefaultLessons(legacy);
    expect(merged[0].id).toBe('mengenal-qris-aman');
    expect(merged[0].quiz).toHaveLength(5);
    expect(merged.length).toBe(15);
  });

  it('generateLessonId creates clean URL-friendly slugs from titles', () => {
    expect(generateLessonId('Cara Mencegah Penipuan Transfer Palsu')).toBe(
      'cara-mencegah-penipuan-transfer-palsu'
    );
    expect(generateLessonId('QRIS: Aman & Cepat untuk Warung!')).toBe(
      'qris-aman-cepat-untuk-warung'
    );
    expect(generateLessonId('   ')).toBe('modul-qris');
  });

  it('generateLessonId appends numeric suffix when slug already exists', () => {
    const existing = ['panduan-qris', 'panduan-qris-2'];
    expect(generateLessonId('Panduan QRIS', existing)).toBe('panduan-qris-3');
  });

  it('evaluateQuiz calculates score and passing status correctly', () => {
    const lesson = SAMPLE_LESSONS[0];
    const allCorrect: Record<string, number> = {};
    lesson.quiz.forEach((q) => {
      allCorrect[q.id] = q.correctOptionIndex;
    });

    const result = evaluateQuiz(lesson.quiz, allCorrect);
    expect(result.score).toBe(100);
    expect(result.passed).toBe(true);
    expect(result.correctCount).toBe(lesson.quiz.length);
  });
});

