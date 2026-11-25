import { Player } from '@remotion/player';
import { useMemo } from 'react';
import { PlanVideo } from './composition/PlanVideo';
import type { RenderPlan } from './plan';
import { previewablePlan } from './previewMedia';

/** In-browser preview, drawn by the same composition the server renders with. */
export function VideoPreview({ plan, assetUrls }: { plan: RenderPlan | null; assetUrls: Record<string, string> }) {
  const inputProps = useMemo(() => (plan ? { plan: previewablePlan(plan, assetUrls), assetUrls } : null), [plan, assetUrls]);
  if (!inputProps) {return <div className="video-preview-empty"><span className="spinner" /> Đang dựng bản xem trước…</div>;}
  const { width, height, fps, durationSeconds } = inputProps.plan;
  return (
    <div className="video-preview" style={{ aspectRatio: `${width} / ${height}` }}>
      <Player
        component={PlanVideo}
        inputProps={inputProps}
        durationInFrames={Math.max(1, Math.round(durationSeconds * fps))}
        fps={fps}
        compositionWidth={width}
        compositionHeight={height}
        style={{ width: '100%', height: '100%' }}
        controls
        acknowledgeRemotionLicense
      />
    </div>
  );
}
