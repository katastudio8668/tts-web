import { AudioWaveform, Flame, Headphones, Mic, Radio, Smartphone, Snowflake, Sparkles, Speaker, Wand2, Waves } from 'lucide-react';
import { useState } from 'react';
import { useVoiceTone } from './useVoiceTone';
import type { VoiceToneGroupId } from './voiceToneApi';

const ICONS: Partial<Record<string, typeof Mic>> = {
  original: AudioWaveform, warm: Flame, cold: Snowflake, deep: Waves, bright: Sparkles, soft: Headphones, crisp: Wand2, 'bass-boost': Speaker,
  'studio-mic': Mic, radio: Radio, phone: Smartphone, megaphone: Speaker, vintage: Radio, robot: Wand2, room: Waves, hall: Waves, echo: Waves,
};

/**
 * Account-wide voice tone picker (warm/cold/etc + intensity), shared by the voice screen and the
 * video editor. One choice at a time, applied to every new voice generated afterwards.
 */
export function VoiceTonePanel({ token }: { token: string }) {
  const { catalog, setting, update } = useVoiceTone(token);
  const [group, setGroup] = useState<VoiceToneGroupId>('tone');

  if (!catalog.data || !setting.data) {
    return <div className="voice-tone-panel inline-loading">Đang tải tông giọng…</div>;
  }

  const current = setting.data;
  const active = current.id !== 'original';
  const currentDef = catalog.data.effects.find((e) => e.id === current.id);
  const effects = catalog.data.effects.filter((e) => e.group === group);

  return (
    <div className="voice-tone-panel">
      <div className="voice-tone-header">
        <p><Wand2 size={14} /> Tông giọng</p>
        <span className={`soft-tag ${active ? '' : 'muted-tag'}`}>
          {active ? `${currentDef?.label.vi ?? current.id} · ${Math.round(current.intensity * 100)}%` : 'Gốc'}
        </span>
      </div>
      <div className="voice-tone-groups">
        {catalog.data.groups.map((g) => (
          <button key={g.id} type="button" className={`tone-group-tab ${group === g.id ? 'active' : ''}`} onClick={() => setGroup(g.id)}>
            {g.label.vi}
          </button>
        ))}
      </div>
      <div className="voice-tone-grid">
        {(group === 'tone'
          ? [catalog.data.effects.find((e) => e.id === 'original'), ...effects.filter((e) => e.id !== 'original')].filter((e): e is NonNullable<typeof e> => Boolean(e))
          : effects
        ).map((effect) => {
          const Icon = ICONS[effect.id] ?? AudioWaveform;
          const selected = current.id === effect.id;
          return (
            <button
              key={effect.id}
              type="button"
              title={effect.hint.vi}
              className={`tone-option ${selected ? 'selected' : ''}`}
              disabled={update.isPending}
              onClick={() => update.mutate({ id: effect.id, intensity: current.intensity || 0.7 })}
            >
              <Icon size={16} />
              <span>{effect.label.vi}</span>
            </button>
          );
        })}
      </div>
      {active && (
        <div className="voice-tone-intensity">
          <div className="voice-tone-intensity-row">
            <span>Cường độ</span>
            <span>{Math.round(current.intensity * 100)}%</span>
          </div>
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={Math.round(current.intensity * 100)}
            disabled={update.isPending}
            onChange={(event) => update.mutate({ id: current.id, intensity: Number(event.target.value) / 100 })}
          />
          {currentDef && <p className="muted">{currentDef.hint.vi}</p>}
        </div>
      )}
      <p className="muted voice-tone-note">
        Tông giọng áp dụng cho mọi giọng tạo mới (cả ở đây và trong trình dựng video). Nghe thử trong app luôn miễn phí;
        chỉ tính thêm credit khi bạn tải/lưu audio đã qua xử lý tông giọng.
      </p>
    </div>
  );
}
