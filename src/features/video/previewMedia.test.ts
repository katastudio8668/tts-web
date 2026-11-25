import { describe, expect, it } from 'vitest';
import type { RenderPlan } from './plan';
import { previewablePlan } from './previewMedia';

describe('previewablePlan', () => {
  it('replaces missing media and drops missing audio', () => {
    const plan = {
      scenes: [{ id: 'a', background: { type: 'media', assetId: 'img', fitMode: 'cover', motion: 'none' } }, { id: 'b', background: { type: 'media', assetId: 'ok', fitMode: 'cover', motion: 'none' } }],
      audio: [{ assetId: 'voice-a' }, { assetId: 'voice-b' }],
    } as unknown as RenderPlan;
    const result = previewablePlan(plan, { ok: 'blob:1', 'voice-b': 'blob:2' });
    expect(result.scenes.map((s) => s.background.type)).toEqual(['color', 'media']);
    expect(result.audio.map((a) => a.assetId)).toEqual(['voice-b']);
  });
});
