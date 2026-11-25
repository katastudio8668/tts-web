import { Cloud, Download, Film } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { LocalFolderGate } from '../../storage/LocalFolderGate';
import type { useSaveTarget } from '../../storage/useSaveTarget';
import { assetKey, browserStore } from '../browserStore';
import { saveToFolder } from '../localFolder';
import type { ProjectStatus, RenderJob } from '../types';
import { videoApi } from '../videoApi';

type Props = {
  status: ProjectStatus | null; projectId: string; available: Set<string>; save: () => Promise<void>;
  saveTarget: ReturnType<typeof useSaveTarget>; disabled: boolean;
};
const POLL_MS = 4000;
const MAX_POLL_MS = 2 * 60 * 60 * 1000;
const STAGES: Record<RenderJob['status'], string> = {
  QUEUED: 'Đang xếp hàng…', RENDERING: 'Đang dựng video…', UPLOADING: 'Đang lưu vào Google Drive…',
  SUCCEEDED: 'Hoàn tất', FAILED: 'Thất bại', EXPIRED: 'Đã hết hạn tải',
};

/** Exports the MP4 to Google Drive or into the user's folder; the server keeps no copy. */
export function RenderPanel({ status, projectId, available, save, saveTarget, disabled }: Props) {
  const [job, setJob] = useState<RenderJob | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const idempotencyKey = useRef<string | null>(null);
  const cancelled = useRef(false);
  useEffect(() => () => { cancelled.current = true; }, []);

  const destination = saveTarget.usesDrive ? 'GOOGLE_DRIVE' : 'DOWNLOAD';
  const missingVoices = status?.scenesNeedingVoice.length ?? 0;
  const missingFiles = (status?.localAssetsNeeded ?? []).filter((asset) => !available.has(asset.id));
  const blocked = disabled || busy || missingVoices > 0 || missingFiles.length > 0 || saveTarget.needsFolder;

  async function start() {
    setBusy(true); setError(''); setMessage(''); setJob(null);
    const { token, userId } = saveTarget;
    try {
      await save();
      const files: Record<string, Blob> = {};
      for (const asset of status?.localAssetsNeeded ?? []) {
        const blob = await browserStore.get<Blob>('assets', assetKey(userId, projectId, asset.id));
        if (!blob) {throw new Error(`Thiếu tệp "${asset.name}". Chọn lại ở thẻ Media.`);}
        files[asset.id] = blob;
      }
      // Same key on retry after a network error, so the server never queues the render twice.
      idempotencyKey.current ??= crypto.randomUUID();
      let current = await videoApi.createRender(token, { projectId, destination, files, idempotencyKey: idempotencyKey.current });
      setJob(current);
      const started = Date.now();
      while (['QUEUED', 'RENDERING', 'UPLOADING'].includes(current.status)) {
        if (cancelled.current) {return;}
        if (Date.now() - started > MAX_POLL_MS) {throw new Error('Video đang dựng lâu hơn dự kiến; kiểm tra lại sau ít phút.');}
        await new Promise((resolve) => setTimeout(resolve, POLL_MS));
        current = await videoApi.getRender(token, current.id);
        setJob(current);
      }
      idempotencyKey.current = null;
      if (current.status === 'FAILED') {throw new Error(current.errorMessage ?? 'Xuất video thất bại.');}
      if (current.destination === 'DOWNLOAD' && current.status === 'SUCCEEDED') {
        const blob = await videoApi.downloadRender(token, current.id);
        const where = await saveToFolder(userId, blob, current.fileName);
        setMessage(where === 'folder' ? `Đã lưu ${current.fileName} vào thư mục “${saveTarget.folderName}”.` : `Đã tải ${current.fileName} xuống máy.`);
      } else if (current.status === 'SUCCEEDED') {
        setMessage('Đã lưu video vào Google Drive của bạn.');
      }
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="render-panel">
      <div className="voice-panel-head">
        <Film size={16} />
        <strong>Xuất video MP4</strong>
        <span>{saveTarget.usesDrive ? <><Cloud size={13} /> Google Drive</> : <><Download size={13} /> {saveTarget.folderName ? `Thư mục “${saveTarget.folderName}”` : 'Tải xuống'}</>}</span>
      </div>
      {saveTarget.needsFolder && <LocalFolderGate what="video" onPick={saveTarget.pickFolder} />}
      {missingVoices > 0 && <p className="vf-hint">Tạo voice cho {missingVoices} cảnh trước khi xuất.</p>}
      {missingFiles.length > 0 && <p className="vf-hint">Chọn tệp cho: {missingFiles.map((asset) => asset.name).join(', ')} (thẻ Media).</p>}
      <button type="button" className="primary-button" disabled={blocked} onClick={() => void start()}>
        {busy ? (job ? STAGES[job.status] : 'Đang gửi…') : 'Xuất video'}
      </button>
      {busy && <p className="vf-hint">Dựng video mất vài phút. Giữ trang này mở để video được lưu vào thư mục của bạn.</p>}
      {message && <p className="form-success" role="status">{message}{job?.driveWebViewLink && <> <a className="text-link inline" href={job.driveWebViewLink} target="_blank" rel="noreferrer">Mở trong Drive</a></>}</p>}
      {error && <p className="inline-error" role="alert">{error}</p>}
    </div>
  );
}
