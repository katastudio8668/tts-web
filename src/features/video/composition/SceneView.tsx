import type { CSSProperties } from 'react';
/* Shared with the video renderer (korva-tts-api/video-renderer/src/composition): keep both copies identical. */
import { AbsoluteFill, getRemotionEnvironment, Img, interpolate, OffthreadVideo, useCurrentFrame, useVideoConfig, Video } from 'remotion';
import type { PlanScene, RenderPlan } from '../plan';
import { FONT_STACKS } from './fonts';
import { mediaMotion, textEnter, transitionStyle } from './motion';

type Props = { scene: PlanScene; theme: RenderPlan['theme']; assetUrls: Record<string, string>; assetTypes: Record<string, string> };

export function SceneView({ scene, theme, assetUrls, assetTypes }: Props) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const durationFrames = Math.max(1, Math.round(scene.duration * fps));
  const motion = transitionStyle(scene.transition, frame, durationFrames, Math.round(scene.transitionSeconds * fps));
  const progress = Math.min(1, frame / durationFrames);
  const unit = Math.min(width, height);
  const hasText = Boolean(scene.heading || scene.body || scene.bullets.length);

  return (
    <AbsoluteFill style={{ opacity: motion.opacity, filter: motion.filter, transform: motion.transform, overflow: 'hidden' }}>
      <Background scene={scene} assetUrls={assetUrls} assetTypes={assetTypes} transform={`scale(${motion.mediaScale}) ${scene.background.type === 'media' ? mediaMotion(scene.background.motion, progress) : ''}`} />
      {scene.background.type === 'media' && hasText && scene.layout !== 'media' && (
        <AbsoluteFill style={{ background: `rgba(2, 6, 23, ${theme.overlayOpacity})` }} />
      )}
      {scene.layout !== 'media' && hasText && <SceneText scene={scene} theme={theme} unit={unit} frame={frame} fps={fps} durationFrames={durationFrames} />}
    </AbsoluteFill>
  );
}

function Background({ scene, assetUrls, assetTypes, transform }: { scene: PlanScene; assetUrls: Record<string, string>; assetTypes: Record<string, string>; transform: string }) {
  const background = scene.background;
  if (background.type === 'color') {return <AbsoluteFill style={{ background: background.color }} />;}
  if (background.type === 'gradient') {
    return <AbsoluteFill style={{ background: `linear-gradient(${background.angle}deg, ${background.from}, ${background.to})` }} />;
  }
  const src = assetUrls[background.assetId];
  const style: CSSProperties = { width: '100%', height: '100%', objectFit: background.fitMode, transform };
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {assetTypes[background.assetId] === 'video'
        // OffthreadVideo is frame-accurate when rendering; the browser preview (Player) needs <Video>.
        ? (getRemotionEnvironment().isRendering
          ? <OffthreadVideo src={src} muted={!scene.keepOriginalAudio} volume={scene.mediaVolume} style={style} />
          : <Video src={src} muted={!scene.keepOriginalAudio} volume={scene.mediaVolume} style={style} />)
        : <Img src={src} style={style} />}
    </AbsoluteFill>
  );
}

function SceneText({ scene, theme, unit, frame, fps, durationFrames }: {
  scene: PlanScene; theme: RenderPlan['theme']; unit: number; frame: number; fps: number; durationFrames: number;
}) {
  const justify = scene.textPosition === 'top' ? 'flex-start' : scene.textPosition === 'bottom' ? 'flex-end' : 'center';
  const headingSize = unit * (scene.layout === 'title' ? 0.09 : 0.065);
  const bodySize = unit * (scene.layout === 'quote' ? 0.058 : 0.042);
  const shadow = '0 4px 24px rgba(0,0,0,0.45)';
  const typewriter = (text: string, delay: number) => {
    if (scene.textAnimation !== 'typewriter') {return text;}
    const chars = Array.from(text);
    const shown = Math.ceil(chars.length * interpolate(frame, [delay * fps, (delay + 1.2) * fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
    return chars.slice(0, shown).join('');
  };
  const block = (delay: number) => textEnter(scene.textAnimation, frame, fps, delay);
  const headingStyle: CSSProperties = { fontSize: headingSize, fontWeight: 800, lineHeight: 1.12, letterSpacing: '-0.02em', margin: 0, textShadow: shadow, whiteSpace: 'pre-wrap' };
  const bodyStyle: CSSProperties = { fontSize: bodySize, fontWeight: 500, lineHeight: 1.4, margin: 0, opacity: 0.92, textShadow: shadow, whiteSpace: 'pre-wrap' };
  const align = scene.layout === 'list' ? 'left' : 'center';

  return (
    <AbsoluteFill style={{
      padding: `${unit * 0.09}px ${unit * 0.08}px`, display: 'flex', flexDirection: 'column', justifyContent: justify,
      alignItems: align === 'left' ? 'flex-start' : 'center', textAlign: align, gap: unit * 0.03,
      color: theme.textColor, fontFamily: FONT_STACKS[theme.fontFamily],
    }}>
      {scene.layout === 'quote' ? (
        <>
          <div style={{ ...block(0), fontSize: unit * 0.16, lineHeight: 0.6, color: theme.accentColor, fontFamily: FONT_STACKS.serif }}>“</div>
          {scene.body && <p style={{ ...bodyStyle, ...block(0.1), fontStyle: 'italic', fontWeight: 600, opacity: 1 }}>{typewriter(scene.body, 0.1)}</p>}
          {scene.heading && <p style={{ ...bodyStyle, ...block(0.5), fontSize: bodySize * 0.7, color: theme.accentColor }}>— {scene.heading}</p>}
        </>
      ) : (
        <>
          {scene.heading && <h1 style={{ ...headingStyle, ...block(0) }}>{typewriter(scene.heading, 0)}</h1>}
          {scene.heading && (scene.body || scene.bullets.length > 0) && (
            <div style={{ ...block(0.15), width: unit * 0.12, height: unit * 0.012, borderRadius: 99, background: theme.accentColor }} />
          )}
          {scene.body && <p style={{ ...bodyStyle, ...block(0.25) }}>{typewriter(scene.body, 0.25)}</p>}
          {scene.layout === 'list' && scene.bullets.map((bullet, index) => {
            // Bullets are revealed across the first 60% of the scene.
            const delay = 0.4 + (index * (durationFrames / fps) * 0.6) / Math.max(1, scene.bullets.length);
            return (
              <div key={index} style={{ ...bodyStyle, ...block(delay), display: 'flex', gap: unit * 0.025, alignItems: 'baseline', opacity: block(delay).opacity }}>
                <span style={{ color: theme.accentColor, fontWeight: 800 }}>{index + 1}.</span>
                <span>{bullet}</span>
              </div>
            );
          })}
        </>
      )}
    </AbsoluteFill>
  );
}
