import { describe, expect, it } from 'vitest';
import { freeTierSummary } from './freeTier';

describe('freeTierSummary', () => {
  it('is hidden when the free tier is disabled or unknown', () => {
    expect(freeTierSummary(undefined)).toBeNull();
    expect(freeTierSummary({ balance: 0, reserved: 0, usedThisMonth: 0 })).toBeNull();
    expect(freeTierSummary({ balance: 0, reserved: 0, usedThisMonth: 0, freeTier: {
      weeklyCredits: 0, usedThisWeek: 0, remainingThisWeek: 0, weekStartsAt: '', resetsAt: '' } })).toBeNull();
  });

  it('summarizes the remaining allowance and the reset time in Vietnam time', () => {
    const summary = freeTierSummary({ balance: 0, reserved: 0, usedThisMonth: 0, freeTier: {
      weeklyCredits: 5000, usedThisWeek: 1200, remainingThisWeek: 3800,
      weekStartsAt: '2026-11-22T17:00:00.000Z', resetsAt: '2026-11-29T17:00:00.000Z' } });
    expect(summary).toMatchObject({ remaining: 3800, weekly: 5000, used: 1200 });
    expect(summary?.resetsLabel).toContain('30');
  });
});
