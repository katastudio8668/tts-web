import type { Voice } from '../../../lib/api';
import { setDefaultVoice } from '../specEditing';
import type { VideoSpec } from '../types';
import { ColorInput, Field, NumberInput, POSITION_OPTIONS, Select, Toggle } from './fields';

type Props = { spec: VideoSpec; voices: Voice[]; edit: (change: (spec: VideoSpec) => VideoSpec) => void; locked: boolean };

/** Whole-video settings: format, look, default voice, captions, music and watermark. */
export function ProjectSettings({ spec, voices, edit, locked }: Props) {
  const set = (patch: Partial<VideoSpec>) => edit((current) => ({ ...current, ...patch }));
  const audioAssets = spec.assets.filter((asset) => asset.type === 'audio');
  return (
    <div className="inspector">
      <fieldset disabled={locked}>
        <legend>Video</legend>
        <Field label="Tên video"><input value={spec.title} maxLength={96} onChange={(e) => set({ title: e.target.value })} /></Field>
        <div className="vf-row">
          <Field label="Khung hình"><Select value={spec.aspectRatio} options={[{ value: '16:9', label: 'Ngang 16:9' }, { value: '9:16', label: 'Dọc 9:16' }, { value: '1:1', label: 'Vuông 1:1' }] as const} onChange={(aspectRatio) => set({ aspectRatio })} /></Field>
          <Field label="Chất lượng"><Select value={spec.resolution} options={[{ value: '720p', label: '720p' }, { value: '1080p', label: '1080p' }] as const} onChange={(resolution) => set({ resolution })} /></Field>
        </div>
      </fieldset>
      <fieldset disabled={locked}>
        <legend>Phong cách</legend>
        <div className="vf-row">
          <Field label="Phông chữ"><Select value={spec.theme.fontFamily} options={[{ value: 'sans', label: 'Hiện đại' }, { value: 'display', label: 'Nổi bật' }, { value: 'serif', label: 'Có chân' }] as const} onChange={(fontFamily) => set({ theme: { ...spec.theme, fontFamily } })} /></Field>
          <Field label="Chữ"><ColorInput value={spec.theme.textColor} onChange={(textColor) => set({ theme: { ...spec.theme, textColor } })} /></Field>
          <Field label="Điểm nhấn"><ColorInput value={spec.theme.accentColor} onChange={(accentColor) => set({ theme: { ...spec.theme, accentColor } })} /></Field>
        </div>
        <Field label="Độ tối khi có chữ trên ảnh"><NumberInput value={spec.theme.overlayOpacity} min={0} max={0.85} step={0.05} onChange={(overlayOpacity) => set({ theme: { ...spec.theme, overlayOpacity } })} /></Field>
      </fieldset>
      <fieldset disabled={locked}>
        <legend>Voice</legend>
        <Field label="Giọng mặc định">
          <Select value={spec.defaultVoiceId ?? ''} options={[{ value: '', label: 'Chọn giọng…' }, ...voices.map((voice) => ({ value: voice.id, label: `${voice.displayName} · TTS Group ${voice.group ?? 1}` }))]}
            onChange={(voiceId) => edit((current) => setDefaultVoice(current, voiceId || null))} />
        </Field>
        <div className="vf-row">
          <Field label="Nghỉ trước lời (giây)"><NumberInput value={spec.voiceSync.leadSeconds} min={0} max={3} step={0.1} onChange={(leadSeconds) => set({ voiceSync: { ...spec.voiceSync, leadSeconds } })} /></Field>
          <Field label="Nghỉ sau lời (giây)"><NumberInput value={spec.voiceSync.tailSeconds} min={0} max={3} step={0.1} onChange={(tailSeconds) => set({ voiceSync: { ...spec.voiceSync, tailSeconds } })} /></Field>
          <Field label="Âm lượng voice"><NumberInput value={spec.voiceVolume} min={0} max={2} step={0.1} onChange={(voiceVolume) => set({ voiceVolume })} /></Field>
        </div>
      </fieldset>
      <fieldset disabled={locked}>
        <legend>Phụ đề theo voice</legend>
        <Toggle checked={spec.captions.enabled} label="Hiện phụ đề" onChange={(enabled) => set({ captions: { ...spec.captions, enabled } })} />
        {spec.captions.enabled && (
          <>
            <div className="vf-row">
              <Field label="Kiểu"><Select value={spec.captions.animation} options={[{ value: 'karaoke', label: 'Karaoke' }, { value: 'fade', label: 'Hiện dần' }, { value: 'pop', label: 'Bật lên' }, { value: 'slide-up', label: 'Trượt lên' }, { value: 'typewriter', label: 'Gõ chữ' }] as const} onChange={(animation) => set({ captions: { ...spec.captions, animation } })} /></Field>
              <Field label="Vị trí"><Select value={spec.captions.position} options={POSITION_OPTIONS} onChange={(position) => set({ captions: { ...spec.captions, position } })} /></Field>
              <Field label="Cỡ chữ"><NumberInput value={spec.captions.fontSize} min={24} max={120} step={2} onChange={(fontSize) => set({ captions: { ...spec.captions, fontSize } })} /></Field>
            </div>
            <div className="vf-row">
              <Field label="Chữ"><ColorInput value={spec.captions.textColor} onChange={(textColor) => set({ captions: { ...spec.captions, textColor } })} /></Field>
              <Field label="Tô sáng"><ColorInput value={spec.captions.highlightColor} onChange={(highlightColor) => set({ captions: { ...spec.captions, highlightColor } })} /></Field>
              <Field label="Viền"><ColorInput value={spec.captions.outlineColor} onChange={(outlineColor) => set({ captions: { ...spec.captions, outlineColor } })} /></Field>
            </div>
          </>
        )}
      </fieldset>
      <fieldset disabled={locked}>
        <legend>Nhạc nền & logo chữ</legend>
        <Field label="Nhạc nền">
          <Select value={spec.music.assetId ?? ''} options={[{ value: '', label: audioAssets.length ? 'Không dùng' : 'Thêm tệp nhạc ở thẻ Media' }, ...audioAssets.map((asset) => ({ value: asset.id, label: asset.name }))]}
            onChange={(assetId) => set({ music: { ...spec.music, assetId: assetId || null } })} />
        </Field>
        {spec.music.assetId && (
          <div className="vf-row">
            <Field label="Âm lượng nhạc"><NumberInput value={spec.music.volume} min={0} max={1} step={0.05} onChange={(volume) => set({ music: { ...spec.music, volume } })} /></Field>
            <Field label="Bắt đầu từ giây"><NumberInput value={spec.music.startSeconds} min={0} max={3600} step={1} onChange={(startSeconds) => set({ music: { ...spec.music, startSeconds } })} /></Field>
          </div>
        )}
        <Toggle checked={spec.watermark.enabled} label="Hiện tên kênh / thương hiệu" onChange={(enabled) => set({ watermark: { ...spec.watermark, enabled } })} />
        {spec.watermark.enabled && <input value={spec.watermark.text} maxLength={40} placeholder="Tên kênh" onChange={(e) => set({ watermark: { ...spec.watermark, text: e.target.value } })} />}
      </fieldset>
    </div>
  );
}
