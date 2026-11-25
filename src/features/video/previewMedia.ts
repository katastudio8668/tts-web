import type { RenderPlan } from './plan';

/**
 * The browser preview can only show media it has. Scenes whose file is not in this browser fall back to a
 * neutral background and missing audio tracks are dropped, instead of breaking the player.
 */
export function previewablePlan(plan: RenderPlan, assetUrls: Record<string, string>): RenderPlan {
  return {
    ...plan,
    scenes: plan.scenes.map((scene) => (scene.background.type === 'media' && !assetUrls[scene.background.assetId]
      ? { ...scene, background: { type: 'color', color: '#1b2130' } } : scene)),
    audio: plan.audio.filter((track) => Boolean(assetUrls[track.assetId])),
  };
}
