import { AbsoluteFill, Audio, Sequence, useVideoConfig } from 'remotion';
import type { RenderPlan } from '../plan';
import { Captions } from './Captions';
import { FONT_STACKS } from './fonts';
import { SceneView } from './SceneView';

export type PlanVideoProps = { plan: RenderPlan; assetUrls: Record<string, string> };

export function PlanVideo({ plan, assetUrls }: PlanVideoProps) {
  const { fps } = useVideoConfig();
  const assetTypes = Object.fromEntries(plan.assets.map((asset) => [asset.id, asset.type]));
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {plan.scenes.map((scene) => (
        <Sequence key={scene.id} from={Math.round(scene.start * fps)} durationInFrames={Math.max(1, Math.round(scene.duration * fps))}>
          <SceneView scene={scene} theme={plan.theme} assetUrls={assetUrls} assetTypes={assetTypes} />
        </Sequence>
      ))}
      {plan.audio.map((track, index) => (
        <Sequence key={`${track.assetId}-${index}`} from={Math.round(track.start * fps)}
          durationInFrames={track.duration ? Math.max(1, Math.round(track.duration * fps) + 2) : undefined}>
          <Audio src={assetUrls[track.assetId]} volume={track.volume} startFrom={Math.round(track.trimStart * fps)} />
        </Sequence>
      ))}
      <Captions captions={plan.captions} fontFamily={plan.theme.fontFamily} />
      {plan.watermark.enabled && plan.watermark.text && (
        <div style={{ position: 'absolute', top: '3%', left: '4%', color: 'rgba(255,255,255,0.85)', fontWeight: 800,
          fontSize: Math.round(plan.height * 0.022), fontFamily: FONT_STACKS[plan.theme.fontFamily], textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>
          {plan.watermark.text}
        </div>
      )}
    </AbsoluteFill>
  );
}
