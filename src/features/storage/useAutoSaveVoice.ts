import { useEffect, useRef, useState } from 'react';
import { chargeToneDownload, fetchBlob } from '../../lib/api';
import { saveToFolder } from '../video/localFolder';

/** Saves each finished voice into the user's folder once, when they do not use Google Drive. */
export function useAutoSaveVoice(params: { jobId: string | null; succeeded: boolean; enabled: boolean; token: string; userId: string }) {
  const saved = useRef(new Set<string>());
  const [message, setMessage] = useState('');
  useEffect(() => {
    const { jobId, succeeded, enabled, token, userId } = params;
    if (!jobId || !succeeded || !enabled || !token || saved.current.has(jobId)) {return;}
    saved.current.add(jobId);
    chargeToneDownload(token, jobId);
    const controller = new AbortController();
    void fetchBlob(`/generations/${jobId}/audio`, token, { signal: controller.signal }, 120_000)
      .then((blob) => saveToFolder(userId, blob, `kata-tts-${jobId}.wav`))
      .then((where) => setMessage(where === 'folder' ? 'Đã lưu voice vào thư mục của bạn.' : 'Đã tải voice xuống máy.'))
      .catch(() => { if (!controller.signal.aborted) {saved.current.delete(jobId); setMessage('Chưa lưu được voice; hãy bấm Tải WAV.');} });
    return () => controller.abort();
  }, [params.jobId, params.succeeded, params.enabled, params.token, params.userId]);
  return message;
}
