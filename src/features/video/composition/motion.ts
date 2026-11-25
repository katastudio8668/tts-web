import { interpolate } from 'remotion';
import type { Transition } from '../plan';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** Enter/exit motion of a whole scene (ported from KATA Studio's TimelineComposition). */
export function transitionStyle(transition: Transition, frame: number, duration: number, edgeFrames: number) {
  const fade = Math.max(1, Math.min(Math.floor(duration / 2), edgeFrames));
  const endStart = Math.max(fade + 1, duration - fade);
  const opacity = interpolate(frame, [0, fade, endStart, duration], [0, 1, 1, 0], clamp);
  const enter = interpolate(frame, [0, fade], [1, 0], clamp);
  const exit = interpolate(frame, [endStart, duration], [0, 1], clamp);
  const edge = Math.max(enter, exit);
  const progress = interpolate(frame, [0, duration], [0, 1], clamp);
  const base = { opacity: 1, filter: 'none', transform: 'none', mediaScale: 1 };
  switch (transition) {
    case 'none': return base;
    case 'fade': return { ...base, opacity };
    case 'blurry': return { ...base, opacity, filter: `blur(${edge * 18}px)`, mediaScale: 1.04 + edge * 0.03 };
    case 'zoom-in': return { ...base, opacity, mediaScale: interpolate(progress, [0, 1], [1, 1.12]) };
    case 'zoom-out': return { ...base, opacity, mediaScale: interpolate(progress, [0, 1], [1.12, 1]) };
    case 'slide-left': return { ...base, opacity, transform: `translateX(${enter * 24 - exit * 24}%)` };
    case 'slide-right': return { ...base, opacity, transform: `translateX(${-enter * 24 + exit * 24}%)` };
    case 'slide-up': return { ...base, opacity, transform: `translateY(${enter * 24 - exit * 24}%)` };
    case 'slide-down': return { ...base, opacity, transform: `translateY(${-enter * 24 + exit * 24}%)` };
    case 'push-left': return { ...base, transform: `translateX(${enter * 100 - exit * 100}%)` };
    case 'push-right': return { ...base, transform: `translateX(${-enter * 100 + exit * 100}%)` };
    default: return base;
  }
}

/** Slow camera move on a media background. */
export function mediaMotion(motion: 'none' | 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right', progress: number): string {
  switch (motion) {
    case 'zoom-in': return `scale(${1 + 0.12 * progress})`;
    case 'zoom-out': return `scale(${1.12 - 0.12 * progress})`;
    case 'pan-left': return `scale(1.12) translateX(${4 - 8 * progress}%)`;
    case 'pan-right': return `scale(1.12) translateX(${-4 + 8 * progress}%)`;
    default: return 'none';
  }
}

/** Entrance of a text block, `delay` seconds after the scene starts. */
export function textEnter(animation: 'none' | 'fade' | 'pop' | 'slide-up' | 'typewriter', frame: number, fps: number, delay = 0) {
  const t = interpolate(frame, [delay * fps, (delay + 0.5) * fps], [0, 1], clamp);
  if (animation === 'none' || animation === 'typewriter') {return { opacity: frame >= delay * fps ? 1 : 0, transform: 'none' };}
  if (animation === 'pop') {return { opacity: t, transform: `scale(${interpolate(t, [0, 0.7, 1], [0.8, 1.05, 1], clamp)})` };}
  if (animation === 'slide-up') {return { opacity: t, transform: `translateY(${(1 - t) * 60}px)` };}
  return { opacity: t, transform: 'none' };
}
