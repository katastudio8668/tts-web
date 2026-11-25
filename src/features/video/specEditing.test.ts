import { describe, expect, it } from 'vitest';
import type { VideoSpec } from './types';
import { addAsset, blankSpec, duplicateScene, moveScene, newScene, removeAsset, removeScene, specDuration, updateScene } from './specEditing';

const voiced = (spec: VideoSpec): VideoSpec => ({
  ...spec, scenes: [{ ...spec.scenes[0], voice: { text: 'Xin chào', voiceId: null, generationId: 'g1', textHash: 'h', durationSeconds: 2 } }],
});

describe('spec editing', () => {
  it('starts with one scene and estimates duration with voice timing', () => {
    const spec = voiced(blankSpec('Demo', '9:16'));
    expect(spec.scenes).toHaveLength(1);
    expect(specDuration(spec)).toBeCloseTo(0.3 + 2 + 0.5);
  });

  it('clears generated audio when the voice text or voice changes, but not for other edits', () => {
    const spec = voiced(blankSpec('Demo', '16:9'));
    const id = spec.scenes[0].id;
    expect(updateScene(spec, id, { heading: 'Mới' }).scenes[0].voice?.generationId).toBe('g1');
    const edited = updateScene(spec, id, { voice: { ...spec.scenes[0].voice!, text: 'Chào bạn' } });
    expect(edited.scenes[0].voice).toMatchObject({ text: 'Chào bạn', generationId: null, textHash: null, durationSeconds: null });
  });

  it('adds, duplicates, moves and removes scenes with unique ids', () => {
    let spec = blankSpec('Demo', '16:9');
    spec = { ...spec, scenes: [...spec.scenes, newScene(spec)] };
    spec = duplicateScene(spec, spec.scenes[0].id);
    expect(new Set(spec.scenes.map((s) => s.id)).size).toBe(3);
    const last = spec.scenes[2].id;
    spec = moveScene(spec, last, -2);
    expect(spec.scenes[0].id).toBe(last);
    spec = removeScene(spec, last);
    expect(spec.scenes).toHaveLength(2);
    expect(removeScene(removeScene(spec, spec.scenes[0].id), spec.scenes[1].id).scenes).toHaveLength(1);
  });

  it('removing an asset resets the scenes and music that used it', () => {
    let spec = blankSpec('Demo', '16:9');
    const { spec: withAsset, assetId } = addAsset(spec, { type: 'image', name: 'a.png' });
    spec = updateScene(withAsset, withAsset.scenes[0].id, { background: { type: 'media', assetId, fitMode: 'cover', motion: 'none' } });
    const { spec: withSong, assetId: songId } = addAsset(spec, { type: 'audio', name: 's.mp3' });
    spec = { ...withSong, music: { ...withSong.music, assetId: songId } };
    spec = removeAsset(removeAsset(spec, assetId), songId);
    expect(spec.scenes[0].background.type).toBe('color');
    expect(spec.music.assetId).toBeNull();
    expect(spec.assets).toEqual([]);
  });
});
