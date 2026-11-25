import type { AspectRatio, AssetType, VideoScene, VideoSpec } from './types';

/** Pure editing helpers for the video spec. The API re-validates everything on save. */

const randomId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

function uniqueId(taken: Set<string>, prefix: string): string {
  let id = randomId(prefix);
  while (taken.has(id)) {id = randomId(prefix);}
  return id;
}

export function newScene(spec: Pick<VideoSpec, 'scenes'>, partial: Partial<VideoScene> = {}): VideoScene {
  return {
    id: uniqueId(new Set(spec.scenes.map((scene) => scene.id)), 'scene'),
    durationSeconds: 4, minDurationSeconds: 0.5, transition: 'fade', transitionSeconds: 0.5,
    background: { type: 'gradient', from: '#312e81', to: '#0f172a', angle: 135 },
    layout: 'title', heading: 'Tiêu đề cảnh', body: '', bullets: [], textAnimation: 'fade', textPosition: 'center',
    voice: null, keepOriginalAudio: false, mediaVolume: 1,
    ...partial,
  };
}

export function blankSpec(title: string, aspectRatio: AspectRatio): VideoSpec {
  const spec: VideoSpec = {
    version: 1, title, aspectRatio, fps: 30, resolution: '1080p',
    theme: { fontFamily: 'sans', textColor: '#ffffff', accentColor: '#8e7df8', overlayOpacity: 0.35 },
    defaultVoiceId: null,
    voiceSync: { leadSeconds: 0.3, tailSeconds: 0.5 },
    captions: { enabled: true, animation: 'karaoke', position: 'bottom', fontSize: 54, textColor: '#ffffff', highlightColor: '#22d3ee', outlineColor: '#020617' },
    music: { assetId: null, volume: 0.2, startSeconds: 0 },
    voiceVolume: 1,
    watermark: { enabled: false, text: '' },
    assets: [],
    scenes: [],
  };
  return { ...spec, scenes: [newScene(spec, { heading: title })] };
}

/** Scene length as rendered: voiced scenes stretch to lead + voice + tail (mirrors the API's applyVoiceTiming). */
export function sceneDuration(scene: VideoScene, spec: Pick<VideoSpec, 'voiceSync'>): number {
  const voice = scene.voice?.durationSeconds;
  if (!voice) {return scene.durationSeconds;}
  return Math.min(60, Math.max(scene.minDurationSeconds, spec.voiceSync.leadSeconds + voice + spec.voiceSync.tailSeconds));
}

export function specDuration(spec: VideoSpec): number {
  return spec.scenes.reduce((sum, scene) => sum + sceneDuration(scene, spec), 0);
}

export function updateScene(spec: VideoSpec, sceneId: string, patch: Partial<VideoScene>): VideoSpec {
  return {
    ...spec,
    scenes: spec.scenes.map((scene) => {
      if (scene.id !== sceneId) {return scene;}
      const next = { ...scene, ...patch };
      const before = scene.voice;
      const after = next.voice;
      // New voice text or voice: the generated audio no longer matches.
      if (after && (!before || before.text !== after.text || before.voiceId !== after.voiceId)) {
        next.voice = { ...after, generationId: null, textHash: null, durationSeconds: null };
      }
      return next;
    }),
  };
}

/** Changing the default voice invalidates the audio of every scene that uses it. */
export function setDefaultVoice(spec: VideoSpec, voiceId: string | null): VideoSpec {
  if (spec.defaultVoiceId === voiceId) {return spec;}
  return {
    ...spec,
    defaultVoiceId: voiceId,
    scenes: spec.scenes.map((scene) => (scene.voice && !scene.voice.voiceId
      ? { ...scene, voice: { ...scene.voice, generationId: null, textHash: null, durationSeconds: null } } : scene)),
  };
}

export function duplicateScene(spec: VideoSpec, sceneId: string): VideoSpec {
  const index = spec.scenes.findIndex((scene) => scene.id === sceneId);
  if (index < 0) {return spec;}
  const copy = { ...structuredClone(spec.scenes[index]), id: uniqueId(new Set(spec.scenes.map((scene) => scene.id)), 'scene') };
  return { ...spec, scenes: [...spec.scenes.slice(0, index + 1), copy, ...spec.scenes.slice(index + 1)] };
}

export function moveScene(spec: VideoSpec, sceneId: string, delta: number): VideoSpec {
  const index = spec.scenes.findIndex((scene) => scene.id === sceneId);
  const target = Math.min(spec.scenes.length - 1, Math.max(0, index + delta));
  if (index < 0 || target === index) {return spec;}
  const scenes = [...spec.scenes];
  const [moved] = scenes.splice(index, 1);
  scenes.splice(target, 0, moved);
  return { ...spec, scenes };
}

/** A video always keeps at least one scene. */
export function removeScene(spec: VideoSpec, sceneId: string): VideoSpec {
  if (spec.scenes.length <= 1) {return spec;}
  return { ...spec, scenes: spec.scenes.filter((scene) => scene.id !== sceneId) };
}

export function addAsset(spec: VideoSpec, file: { type: AssetType; name: string }): { spec: VideoSpec; assetId: string } {
  const assetId = uniqueId(new Set(spec.assets.map((asset) => asset.id)), file.type);
  return { assetId, spec: { ...spec, assets: [...spec.assets, { id: assetId, type: file.type, name: file.name.slice(0, 120), source: 'local' }] } };
}

export function removeAsset(spec: VideoSpec, assetId: string): VideoSpec {
  return {
    ...spec,
    assets: spec.assets.filter((asset) => asset.id !== assetId),
    music: spec.music.assetId === assetId ? { ...spec.music, assetId: null } : spec.music,
    scenes: spec.scenes.map((scene) => (scene.background.type === 'media' && scene.background.assetId === assetId
      ? { ...scene, background: { type: 'color', color: '#10131c' }, layout: scene.layout === 'media' ? 'title' : scene.layout } : scene)),
  };
}

export function assetTypeOfFile(file: File): AssetType | null {
  if (file.type.startsWith('image/')) {return 'image';}
  if (file.type.startsWith('video/')) {return 'video';}
  if (file.type.startsWith('audio/')) {return 'audio';}
  return null;
}
