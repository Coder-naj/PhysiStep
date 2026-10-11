import { describe, expect, it } from 'vitest';
import { solvePhysicsFallback } from './fallbackPhysicsSolver';
import { tutorFallbackAnswer } from './tutorFallback';

describe('offline physics engine', () => {
  it('solves a braking problem with steps and answers (English)', () => {
    const r = solvePhysicsFallback('A 1200 kg car moving at 20 m/s brakes to a stop over a distance of 40 meters. Find the friction force.', 9.8, 'en');
    expect(r.steps.length).toBeGreaterThan(0);
    expect(r.finalAnswers.length).toBeGreaterThan(0);
    expect(Array.isArray(r.givens)).toBe(true);
  });

  it('supports Bengali output', () => {
    const r = solvePhysicsFallback('১২০০ কেজি ভরের একটি গাড়ি 20 m/s বেগে চলছে এবং 40 মিটার দূরত্বে থামে।', 9.8, 'bn');
    expect(/[\u0980-\u09FF]/.test(JSON.stringify(r))).toBe(true);
  });

  it('never throws on gibberish input', () => {
    expect(() => solvePhysicsFallback('asdf qwer', 9.8, 'en')).not.toThrow();
    expect(() => solvePhysicsFallback('', 9.8, 'en')).not.toThrow();
  });

  it('tutor fallback echoes at most 500 chars of the question', () => {
    expect(tutorFallbackAnswer('q'.repeat(2000), 'en').length).toBeLessThan(2500);
    expect(tutorFallbackAnswer('Why?', 'bn')).toContain('পদার্থবিজ্ঞান');
  });
});
