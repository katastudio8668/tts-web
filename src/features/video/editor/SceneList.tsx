import { ArrowDown, ArrowUp, Copy, Mic, Plus, Trash2 } from 'lucide-react';
import { duplicateScene, moveScene, newScene, removeScene, sceneDuration } from '../specEditing';
import type { VideoSpec } from '../types';

type Props = { spec: VideoSpec; selectedId: string; onSelect: (id: string) => void; edit: (change: (spec: VideoSpec) => VideoSpec) => void; locked: boolean };

/** Ordered scenes with their timing; the timeline of the video. */
export function SceneList({ spec, selectedId, onSelect, edit, locked }: Props) {
  let cursor = 0;
  return (
    <div className="scene-list">
      <div className="scene-list-head">
        <strong>Cảnh ({spec.scenes.length})</strong>
        <button type="button" className="secondary-button small" disabled={locked} onClick={() => {
          const scene = newScene(spec);
          edit((current) => {
            const index = current.scenes.findIndex((item) => item.id === selectedId);
            const scenes = [...current.scenes];
            scenes.splice(index + 1, 0, scene);
            return { ...current, scenes };
          });
          onSelect(scene.id);
        }}><Plus size={14} /> Thêm cảnh</button>
      </div>
      <ol>
        {spec.scenes.map((scene, index) => {
          const duration = sceneDuration(scene, spec);
          const start = cursor;
          cursor += duration;
          const voiceState = !scene.voice ? null : scene.voice.durationSeconds ? 'ready' : 'missing';
          return (
            <li key={scene.id} className={scene.id === selectedId ? 'selected' : ''}>
              <button type="button" className="scene-item" onClick={() => onSelect(scene.id)}>
                <span className="scene-index">{index + 1}</span>
                <span className="scene-title">
                  <strong>{scene.heading || scene.body || (scene.layout === 'media' ? 'Ảnh/video' : 'Cảnh trống')}</strong>
                  <small>{start.toFixed(1)}s · {duration.toFixed(1)}s</small>
                </span>
                {voiceState && <Mic size={14} className={`voice-state ${voiceState}`} aria-label={voiceState === 'ready' ? 'Đã có voice' : 'Chưa tạo voice'} />}
              </button>
              {scene.id === selectedId && (
                <div className="scene-actions">
                  <button type="button" className="icon-button" aria-label="Lên" disabled={locked || index === 0} onClick={() => edit((s) => moveScene(s, scene.id, -1))}><ArrowUp size={14} /></button>
                  <button type="button" className="icon-button" aria-label="Xuống" disabled={locked || index === spec.scenes.length - 1} onClick={() => edit((s) => moveScene(s, scene.id, 1))}><ArrowDown size={14} /></button>
                  <button type="button" className="icon-button" aria-label="Nhân bản" disabled={locked} onClick={() => edit((s) => duplicateScene(s, scene.id))}><Copy size={14} /></button>
                  <button type="button" className="icon-button" aria-label="Xóa cảnh" disabled={locked || spec.scenes.length <= 1} onClick={() => {
                    const next = spec.scenes[index + 1] ?? spec.scenes[index - 1];
                    edit((s) => removeScene(s, scene.id));
                    if (next) {onSelect(next.id);}
                  }}><Trash2 size={14} /></button>
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <p className="scene-total">Tổng: {cursor.toFixed(1)} giây</p>
    </div>
  );
}
