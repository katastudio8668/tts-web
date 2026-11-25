import { FileAudio, FileImage, FileVideo, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { assetKey, browserStore } from '../browserStore';
import { addAsset, assetTypeOfFile, removeAsset } from '../specEditing';
import type { VideoSpec } from '../types';

type Props = {
  spec: VideoSpec; edit: (change: (spec: VideoSpec) => VideoSpec) => void; locked: boolean;
  userId: string; projectId: string; available: Set<string>; onStored: () => void;
};
const MAX_FILE_BYTES = 300 * 1024 * 1024;
const ICONS = { image: FileImage, video: FileVideo, audio: FileAudio };

/** Media of the project. Files stay in this browser and are only sent when rendering. */
export function MediaPanel({ spec, edit, locked, userId, projectId, available, onStored }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [target, setTarget] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function store(assetId: string, file: File) {
    await browserStore.put('assets', assetKey(userId, projectId, assetId), file);
  }

  async function onFiles(files: FileList | null) {
    setError('');
    let working = spec;
    const added: VideoSpec['assets'] = [];
    for (const file of Array.from(files ?? [])) {
      const type = assetTypeOfFile(file);
      if (!type) {setError(`"${file.name}" không phải ảnh, video hay âm thanh.`); continue;}
      if (file.size > MAX_FILE_BYTES) {setError(`"${file.name}" lớn hơn 300 MB.`); continue;}
      if (target) {
        const asset = spec.assets.find((item) => item.id === target);
        if (asset && asset.type !== type) {setError(`Ô "${asset.name}" cần tệp ${asset.type}.`); continue;}
        await store(target, file);
        const name = file.name.slice(0, 120);
        edit((current) => ({ ...current, assets: current.assets.map((item) => (item.id === target ? { ...item, name, source: 'local' } : item)) }));
        break;
      }
      // Ids are allocated against a working copy so several files never get the same id.
      const result = addAsset(working, { type, name: file.name });
      working = result.spec;
      await store(result.assetId, file);
      added.push(working.assets[working.assets.length - 1]);
    }
    if (added.length) {edit((current) => ({ ...current, assets: [...current.assets, ...added.filter((asset) => !current.assets.some((item) => item.id === asset.id))] }));}
    setTarget(null);
    onStored();
  }

  return (
    <div className="inspector media-panel">
      <p className="vf-hint">Ảnh, video và nhạc chỉ lưu trong trình duyệt này và chỉ được gửi lên khi bạn xuất video. Máy chủ không giữ lại.</p>
      <input ref={input} type="file" multiple={!target} hidden accept="image/*,video/*,audio/*" onChange={(event) => { void onFiles(event.target.files); event.target.value = ''; }} />
      <button type="button" className="secondary-button" disabled={locked} onClick={() => { setTarget(null); input.current?.click(); }}><Upload size={15} /> Thêm tệp</button>
      {error && <p className="inline-error" role="alert">{error}</p>}
      <ul className="asset-list">
        {spec.assets.map((asset) => {
          const Icon = ICONS[asset.type];
          const missing = !available.has(asset.id);
          return (
            <li key={asset.id} className={missing ? 'missing' : ''}>
              <Icon size={16} />
              <span><strong>{asset.name}</strong><small>{asset.source === 'placeholder' && missing ? 'Ô chờ tệp của bạn' : missing ? 'Tệp không có trong trình duyệt này' : asset.type}</small></span>
              {missing && <button type="button" className="secondary-button small" disabled={locked} onClick={() => { setTarget(asset.id); input.current?.click(); }}>Chọn tệp</button>}
              <button type="button" className="icon-button" aria-label={`Xóa ${asset.name}`} disabled={locked} onClick={() => {
                edit((current) => removeAsset(current, asset.id));
                void browserStore.delete('assets', assetKey(userId, projectId, asset.id));
              }}><Trash2 size={14} /></button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
