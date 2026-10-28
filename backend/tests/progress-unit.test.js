import { describe, it, expect } from 'vitest';

describe('Unit Tests: Progress Calculation & Domain Rules', () => {
  function calculateProgress(completedCount, publishedCount) {
    if (!publishedCount || publishedCount === 0) return 0;
    return Math.floor((completedCount / publishedCount) * 100);
  }

  it('calculates 0% progress when course has zero published lessons', () => {
    expect(calculateProgress(0, 0)).toBe(0);
  });

  it('calculates 0% progress when no lessons are completed', () => {
    expect(calculateProgress(0, 5)).toBe(0);
  });

  it('calculates 50% progress accurately for partial completions', () => {
    expect(calculateProgress(2, 4)).toBe(50);
  });

  it('calculates floor percentage for uneven fractions (1/3 -> 33%)', () => {
    expect(calculateProgress(1, 3)).toBe(33);
  });

  it('calculates 100% progress when all published lessons are completed', () => {
    expect(calculateProgress(5, 5)).toBe(100);
  });

  it('re-evaluates progress to active if a new lesson is published', () => {
    // Originally completed: 4 of 4 (100%)
    const originalProgress = calculateProgress(4, 4);
    expect(originalProgress).toBe(100);

    // New lesson published: 4 of 5 (80%)
    const recalculatedProgress = calculateProgress(4, 5);
    expect(recalculatedProgress).toBe(80);
    expect(recalculatedProgress).toBeLessThan(100);
  });
});
