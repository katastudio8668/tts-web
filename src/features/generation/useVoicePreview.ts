import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { fetchAudio } from '../../lib/api';

export type VoicePreviewError = { voiceId: string; message: string };

/**
 * Plays the free, server-cached sample of a voice. Samples are fetched once per mount and kept as
 * object URLs; only one sample plays at a time and toggling the playing voice stops it.
 */
export function useVoicePreview() {
  const { session } = useAuth();
  const token = session?.access_token ?? '';
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<VoicePreviewError | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urls = useRef(new Map<string, string>());
  const controller = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    setPlayingId(null);
  }, []);

  useEffect(() => {
    const cache = urls.current;
    return () => {
      controller.current?.abort();
      audioRef.current?.pause();
      cache.forEach((url) => URL.revokeObjectURL(url));
      cache.clear();
    };
  }, []);

  const toggle = useCallback(async (voiceId: string) => {
    if (playingId === voiceId) {
      stop();
      return;
    }
    controller.current?.abort();
    audioRef.current?.pause();
    setPlayingId(null);
    setError(null);

    let url = urls.current.get(voiceId);
    if (!url) {
      const request = new AbortController();
      controller.current = request;
      setLoadingId(voiceId);
      try {
        url = await fetchAudio(`/voices/${encodeURIComponent(voiceId)}/preview`, token, { signal: request.signal });
      } catch (cause) {
        if (!request.signal.aborted) {
          setError({ voiceId, message: cause instanceof Error ? cause.message : 'Không phát được giọng mẫu.' });
          setLoadingId(null);
        }
        return;
      }
      if (request.signal.aborted) {
        URL.revokeObjectURL(url);
        return;
      }
      controller.current = null;
      urls.current.set(voiceId, url);
      setLoadingId(null);
    }

    const audio = audioRef.current ?? new Audio();
    audioRef.current = audio;
    audio.onended = () => setPlayingId(null);
    audio.src = url;
    setPlayingId(voiceId);
    try {
      await audio.play();
    } catch {
      setPlayingId(null);
      setError({ voiceId, message: 'Trình duyệt không phát được audio.' });
    }
  }, [playingId, stop, token]);

  return { playingId, loadingId, error, toggle, stop };
}
