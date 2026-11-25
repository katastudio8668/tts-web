import { describe, expect, it, vi } from 'vitest';
import { getGenerationRequestIntent, type GenerationPayload } from './generationRequest';

const payload: GenerationPayload = {
  text: 'Xin chào',
  voiceId: 'voice-1',
  language: 'vi',
  speed: 1,
  totalSteps: 32,
  sentencePause: 0.5,
  paragraphPause: 1.5,
};

describe('getGenerationRequestIntent', () => {
  it('reuses the same idempotency key for an identical retry', () => {
    const createKey = vi.fn(() => 'generation-key-1');
    const first = getGenerationRequestIntent(payload, null, createKey);
    const retry = getGenerationRequestIntent(payload, first, createKey);

    expect(retry).toBe(first);
    expect(retry.key).toBe('generation-key-1');
    expect(createKey).toHaveBeenCalledTimes(1);
  });

  it('creates a new key when any payload field changes', () => {
    const createKey = vi.fn()
      .mockReturnValueOnce('generation-key-1')
      .mockReturnValueOnce('generation-key-2');
    const first = getGenerationRequestIntent(payload, null, createKey);
    const changed = getGenerationRequestIntent(
      { ...payload, speed: 1.1 },
      first,
      createKey,
    );

    expect(changed).toEqual({
      fingerprint: JSON.stringify({ ...payload, speed: 1.1 }),
      key: 'generation-key-2',
    });
    expect(createKey).toHaveBeenCalledTimes(2);
  });
});
