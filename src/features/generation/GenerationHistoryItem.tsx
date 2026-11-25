import { useEffect, useRef, useState } from 'react';
import { Download, Play } from 'lucide-react';
import { fetchAudio, type Generation } from '../../lib/api';
import { generationStatusLabel } from './generationPresentation';

export default function GenerationHistoryItem({ item, token }: { item: Generation; token: string }) {
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const audioAbortController = useRef<AbortController | null>(null);

  useEffect(() => () => {
    audioAbortController.current?.abort();
  }, []);

  useEffect(() => () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  async function loadAudio() {
    if (loading) return;

    const controller = new AbortController();
    audioAbortController.current?.abort();
    audioAbortController.current = controller;
    setLoading(true);
    setError('');
    try {
      const nextUrl = await fetchAudio(
        `/generations/${item.id}/audio`,
        token,
        { signal: controller.signal },
      );
      if (controller.signal.aborted) {
        URL.revokeObjectURL(nextUrl);
        return;
      }
      setAudioUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return nextUrl;
      });
    } catch (cause) {
      if (!controller.signal.aborted) {
        setError(cause instanceof Error ? cause.message : 'Không thể tải audio.');
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        if (audioAbortController.current === controller) {
          audioAbortController.current = null;
        }
      }
    }
  }

  return (
    <div className="history-row history-row-expanded">
      <span className="history-wave"><Play size={17} /></span>
      <div className="history-title">
        <strong>{item.text.slice(0, 90) || 'Nội dung audio'}</strong>
        <small>{new Date(item.createdAt).toLocaleString('vi-VN')} · {item.voiceId} · {item.textCharacters.toLocaleString('vi-VN')} ký tự</small>
        {audioUrl && <audio className="history-audio" controls preload="none" src={audioUrl} />}
        {error && <span className="inline-error" role="alert">{error}</span>}
      </div>
      <div className="history-actions">
        <span className={`job-status ${item.status.toLowerCase()}`}>{generationStatusLabel(item.status)}</span>
        {item.status === 'SUCCEEDED' && !audioUrl && (
          <button className="icon-button" type="button" aria-label="Nghe audio" disabled={loading} onClick={() => void loadAudio()}>
            <Play size={16} />
          </button>
        )}
        {audioUrl && <a className="icon-button" aria-label="Tải WAV" href={audioUrl} download={`kata-tts-${item.id}.wav`}><Download size={16}/></a>}
      </div>
    </div>
  );
}
