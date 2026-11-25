// Copy of korva-tts-api/video-renderer/src/plan.ts (render plan contract). Keep both identical.
/**
 * Render plan contract, produced by korva-tts-api (src/videos/video-spec.ts → compileRenderPlan).
 * The renderer only draws a plan; it trusts nothing, so the plan is re-validated here.
 */
export type Transition = 'none' | 'fade' | 'blurry' | 'zoom-in' | 'zoom-out' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' | 'push-left' | 'push-right';
export type Background =
  | { type: 'color'; color: string }
  | { type: 'gradient'; from: string; to: string; angle: number }
  | { type: 'media'; assetId: string; fitMode: 'cover' | 'contain'; motion: 'none' | 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right' };
export type PlanScene = {
  id: string; start: number; duration: number; transition: Transition; transitionSeconds: number; background: Background;
  layout: 'title' | 'caption' | 'quote' | 'list' | 'media'; heading: string; body: string; bullets: string[];
  textAnimation: 'none' | 'fade' | 'pop' | 'slide-up' | 'typewriter'; textPosition: 'top' | 'center' | 'bottom';
  keepOriginalAudio: boolean; mediaVolume: number;
};
export type PlanAudio = { assetId: string; kind: 'voice' | 'music'; start: number; volume: number; trimStart: number; duration: number | null };
export type CaptionCue = { id: string; start: number; end: number; text: string; words: { text: string; start: number; end: number }[] };
export type RenderPlan = {
  version: 1; title: string; width: number; height: number; fps: number; durationSeconds: number;
  theme: { fontFamily: 'sans' | 'serif' | 'display'; textColor: string; accentColor: string; overlayOpacity: number };
  watermark: { enabled: boolean; text: string };
  scenes: PlanScene[];
  audio: PlanAudio[];
  captions: { enabled: boolean; animation: 'karaoke' | 'fade' | 'pop' | 'slide-up' | 'typewriter'; position: 'top' | 'center' | 'bottom';
    fontSize: number; textColor: string; highlightColor: string; outlineColor: string; cues: CaptionCue[] };
  assets: { id: string; type: 'image' | 'video' | 'audio' }[];
};

const SIZES = new Set(['1280x720', '1920x1080', '720x1280', '1080x1920', '720x720', '1080x1080']);
const COLOR = /^#[0-9a-f]{6}$/i;
const ID = /^[A-Za-z0-9_-]{1,72}$/;

export function validatePlan(raw: unknown, maxDurationSeconds = 600): RenderPlan {
  const plan = raw as RenderPlan;
  const fail = (reason: string): never => { throw new Error(`Invalid render plan: ${reason}`); };
  if (!plan || typeof plan !== 'object' || plan.version !== 1) {fail('version');}
  if (!SIZES.has(`${plan.width}x${plan.height}`)) {fail('size');}
  if (![24, 25, 30].includes(plan.fps)) {fail('fps');}
  if (!(plan.durationSeconds > 0 && plan.durationSeconds <= maxDurationSeconds)) {fail('duration');}
  if (!Array.isArray(plan.scenes) || plan.scenes.length < 1 || plan.scenes.length > 60) {fail('scenes');}
  if (!Array.isArray(plan.assets) || plan.assets.some((asset) => !ID.test(asset.id))) {fail('assets');}
  const assetIds = new Set(plan.assets.map((asset) => asset.id));
  for (const scene of plan.scenes) {
    if (!ID.test(scene.id) || !(scene.duration > 0) || !(scene.start >= 0)) {fail(`scene ${scene.id}`);}
    if (scene.background.type === 'media' && !assetIds.has(scene.background.assetId)) {fail(`scene ${scene.id} media`);}
    if (scene.background.type === 'color' && !COLOR.test(scene.background.color)) {fail(`scene ${scene.id} color`);}
  }
  for (const track of plan.audio ?? []) {if (!assetIds.has(track.assetId)) {fail(`audio ${track.assetId}`);}}
  for (const color of [plan.theme?.textColor, plan.theme?.accentColor, plan.captions?.textColor, plan.captions?.highlightColor, plan.captions?.outlineColor]) {
    if (!COLOR.test(color ?? '')) {fail('colors');}
  }
  return plan;
}
