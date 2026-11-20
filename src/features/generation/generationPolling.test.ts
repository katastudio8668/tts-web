import { describe, expect, it } from 'vitest';
import {
  GENERATION_POLL_INITIAL_INTERVAL_MS,
  GENERATION_POLL_MAX_DURATION_MS,
  GENERATION_POLL_MAX_INTERVAL_MS,
  getGenerationPollingInterval,
} from './generationPolling';

describe('getGenerationPollingInterval', () => {
  it('polls active jobs with an increasing interval capped at ten seconds', () => {
    expect(getGenerationPollingInterval('QUEUED', 1_000, 1_000))
      .toBe(GENERATION_POLL_INITIAL_INTERVAL_MS);
    expect(getGenerationPollingInterval('RUNNING', 1_000, 31_000)).toBe(4_000);
    expect(getGenerationPollingInterval('RUNNING', 1_000, 151_000))
      .toBe(GENERATION_POLL_MAX_INTERVAL_MS);
  });

  it('stops polling at the five-minute deadline', () => {
    expect(getGenerationPollingInterval(
      'RUNNING',
      1_000,
      1_000 + GENERATION_POLL_MAX_DURATION_MS,
    )).toBe(false);
  });

  it('does not poll terminal jobs or before the polling clock starts', () => {
    expect(getGenerationPollingInterval('SUCCEEDED', 1_000, 2_000)).toBe(false);
    expect(getGenerationPollingInterval('FAILED', 1_000, 2_000)).toBe(false);
    expect(getGenerationPollingInterval('QUEUED', null, 2_000)).toBe(false);
  });
});
