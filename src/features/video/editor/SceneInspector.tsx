import type { Voice } from '../../../lib/api';
import { updateScene } from '../specEditing';
import type { SceneBackground, VideoScene, VideoSpec } from '../types';
import {
  ColorInput, Field, LAYOUT_OPTIONS, MOTION_OPTIONS, NumberInput, POSITION_OPTIONS, Select, TEXT_ANIMATION_OPTIONS, TRANSITION_OPTIONS,
} from './fields';

type Props = { spec: VideoSpec; scene: VideoScene; voices: Voice[]; edit: (change: (spec: VideoSpec) => VideoSpec) => void; locked: boolean };

/** Every setting of one scene: text, background, motion, timing and its voice line. */
export function SceneInspector({ spec, scene, voices, edit, locked }: Props) {
  const patch = (value: Partial<VideoScene>) => edit((current) => updateScene(current, scene.id, value));
  const background = scene.background;
  const setBackground = (value: SceneBackground) => patch({ background: value });
  const media = spec.assets.filter((asset) => asset.type !== 'audio');
  const voiceSeconds = scene.voice?.durationSeconds;

  return (
    <div className="inspector" aria-disabled={locked}>
      <fieldset disabled={locked}>
        <legend>Nội dung</legend>
        <Field label="Bố cục"><Select value={scene.layout} options={LAYOUT_OPTIONS} onChange={(layout) => patch({ layout })} /></Field>
        {scene.layout !== 'media' && (
          <>
            <Field label={scene.layout === 'quote' ? 'Tác giả' : 'Tiêu đề'}><input value={scene.heading} maxLength={160} onChange={(e) => patch({ heading: e.target.value })} /></Field>
            {scene.layout !== 'list' && <Field label={scene.layout === 'quote' ? 'Câu trích dẫn' : 'Nội dung'}><textarea rows={3} value={scene.body} maxLength={600} onChange={(e) => patch({ body: e.target.value })} /></Field>}
            {scene.layout === 'list' && (
              <Field label="Các ý (mỗi dòng một ý, tối đa 6)">
                <textarea rows={4} value={scene.bullets.join('\n')} onChange={(e) => patch({ bullets: e.target.value.split('\n').slice(0, 6) })} />
              </Field>
            )}
            <div className="vf-row">
              <Field label="Hiệu ứng chữ"><Select value={scene.textAnimation} options={TEXT_ANIMATION_OPTIONS} onChange={(textAnimation) => patch({ textAnimation })} /></Field>
              <Field label="Vị trí"><Select value={scene.textPosition} options={POSITION_OPTIONS} onChange={(textPosition) => patch({ textPosition })} /></Field>
            </div>
          </>
        )}
      </fieldset>

      <fieldset disabled={locked}>
        <legend>Nền</legend>
        <Select value={background.type} options={[{ value: 'color', label: 'Màu' }, { value: 'gradient', label: 'Chuyển màu' }, { value: 'media', label: 'Ảnh / video' }] as const}
          onChange={(type) => setBackground(type === 'color' ? { type, color: '#10131c' } : type === 'gradient'
            ? { type, from: '#312e81', to: '#0f172a', angle: 135 } : { type, assetId: media[0]?.id ?? '', fitMode: 'cover', motion: 'zoom-in' })} />
        {background.type === 'color' && <Field label="Màu nền"><ColorInput value={background.color} onChange={(color) => setBackground({ ...background, color })} /></Field>}
        {background.type === 'gradient' && (
          <div className="vf-row">
            <Field label="Từ"><ColorInput value={background.from} onChange={(from) => setBackground({ ...background, from })} /></Field>
            <Field label="Đến"><ColorInput value={background.to} onChange={(to) => setBackground({ ...background, to })} /></Field>
            <Field label="Góc"><NumberInput value={background.angle} min={0} max={360} step={15} onChange={(angle) => setBackground({ ...background, angle })} /></Field>
          </div>
        )}
        {background.type === 'media' && (media.length === 0
          ? <p className="inline-loading">Thêm ảnh hoặc video ở thẻ Media trước.</p>
          : (
            <>
              <Field label="Tệp"><Select value={background.assetId} options={media.map((asset) => ({ value: asset.id, label: asset.name }))} onChange={(assetId) => setBackground({ ...background, assetId })} /></Field>
              <div className="vf-row">
                <Field label="Khung"><Select value={background.fitMode} options={[{ value: 'cover', label: 'Lấp đầy' }, { value: 'contain', label: 'Vừa khung' }] as const} onChange={(fitMode) => setBackground({ ...background, fitMode })} /></Field>
                <Field label="Chuyển động"><Select value={background.motion} options={MOTION_OPTIONS} onChange={(motion) => setBackground({ ...background, motion })} /></Field>
              </div>
            </>
          ))}
      </fieldset>

      <fieldset disabled={locked}>
        <legend>Thời gian & chuyển cảnh</legend>
        <div className="vf-row">
          <Field label={voiceSeconds ? 'Tối thiểu (giây)' : 'Thời lượng (giây)'} hint={voiceSeconds ? `Khớp theo voice: ${voiceSeconds.toFixed(1)}s` : undefined}>
            <NumberInput value={voiceSeconds ? scene.minDurationSeconds : scene.durationSeconds} min={0.5} max={60} step={0.5}
              onChange={(value) => patch(voiceSeconds ? { minDurationSeconds: value } : { durationSeconds: value })} />
          </Field>
          <Field label="Chuyển cảnh"><Select value={scene.transition} options={TRANSITION_OPTIONS} onChange={(transition) => patch({ transition })} /></Field>
        </div>
      </fieldset>

      <fieldset disabled={locked}>
        <legend>Voice của cảnh</legend>
        <textarea rows={3} maxLength={1500} placeholder="Lời đọc cho cảnh này (để trống nếu không cần voice)"
          value={scene.voice?.text ?? ''}
          onChange={(e) => patch({ voice: e.target.value ? { text: e.target.value, voiceId: scene.voice?.voiceId ?? null, generationId: scene.voice?.generationId ?? null, textHash: scene.voice?.textHash ?? null, durationSeconds: scene.voice?.durationSeconds ?? null } : null })} />
        {scene.voice && (
          <Field label="Giọng">
            <Select value={scene.voice.voiceId ?? ''} options={[{ value: '', label: 'Giọng mặc định của video' }, ...voices.map((voice) => ({ value: voice.id, label: `${voice.displayName} · TTS Group ${voice.group ?? 1}` }))]}
              onChange={(voiceId) => patch({ voice: { ...scene.voice!, voiceId: voiceId || null } })} />
          </Field>
        )}
        <small className="vf-hint">{scene.voice ? (voiceSeconds ? `Đã có voice · ${voiceSeconds.toFixed(1)} giây` : 'Chưa tạo voice cho nội dung này.') : 'Cảnh không có voice.'}</small>
      </fieldset>
    </div>
  );
}
