import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import type { RenderPlan } from '../plan';
import { FONT_STACKS } from './fonts';

/** Voice captions (ported from KATA Studio's TimelineLyricsOverlay). */
export function Captions({ captions, fontFamily }: { captions: RenderPlan['captions']; fontFamily: RenderPlan['theme']['fontFamily'] }) {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  if (!captions.enabled) {return null;}
  const time = frame / fps;
  const cue = captions.cues.find((item) => time >= item.start && time < item.end);
  if (!cue) {return null;}
  const progress = Math.min(1, Math.max(0, (time - cue.start) / Math.max(0.08, cue.end - cue.start)));
  const fontSize = Math.round(captions.fontSize * (height / 1080));
  const enter = interpolate(progress, [0, 0.12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const animation = captions.animation === 'pop'
    ? { opacity: enter, transform: `scale(${0.85 + 0.15 * enter})` }
    : captions.animation === 'slide-up' ? { opacity: enter, transform: `translateY(${(1 - enter) * 40}px)` }
      : captions.animation === 'fade' ? { opacity: enter } : {};
  const position = captions.position === 'top' ? { top: '12%' } : captions.position === 'center' ? { top: '50%', transform: 'translateY(-50%)' } : { bottom: '10%' };

  return (
    <div style={{ position: 'absolute', left: '6%', right: '6%', display: 'flex', justifyContent: 'center', textAlign: 'center', zIndex: 20, ...position }}>
      <div style={{
        color: captions.textColor, fontSize, fontWeight: 900, lineHeight: 1.15, fontFamily: FONT_STACKS[fontFamily],
        WebkitTextStroke: `${Math.max(2, fontSize * 0.05)}px ${captions.outlineColor}`, paintOrder: 'stroke fill',
        textShadow: `0 4px 18px ${captions.outlineColor}`, ...animation,
      }}>
        {captions.animation === 'karaoke'
          ? cue.words.map((word, index) => <span key={index} style={{ color: time >= word.start ? captions.highlightColor : captions.textColor }}>{word.text}</span>)
          : captions.animation === 'typewriter' ? cue.text.slice(0, Math.max(1, Math.ceil(cue.text.length * Math.min(1, progress * 1.6)))) : cue.text}
      </div>
    </div>
  );
}
