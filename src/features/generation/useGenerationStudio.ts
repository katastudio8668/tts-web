import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthProvider';
import {
  API_BASE_URL,
  ApiError,
  apiRequest,
  fetchAudio,
  type Generation,
  type Voice,
} from '../../lib/api';
import {
  getGenerationPollingInterval,
  GENERATION_POLL_MAX_DURATION_MS,
} from './generationPolling';
import { DEFAULT_SAMPLE_TEXT, isSampleText, sampleTextFor } from './sampleText';
import { getGenerationRequestIntent, type GenerationPayload, type GenerationRequestIntent } from './generationRequest';

export function useGenerationStudio() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const token = session?.access_token ?? '';

  const [text, setText] = useState(DEFAULT_SAMPLE_TEXT);
  const [voiceId, setVoiceId] = useState('');
  const [speed, setSpeed] = useState(1);
  const [sentencePause, setSentencePause] = useState(0.5);
  const [paragraphPause, setParagraphPause] = useState(1.5);
  const [job, setJob] = useState<Generation | null>(null);
  const [pollingStartedAt, setPollingStartedAt] = useState<number | null>(null);
  const [pollingTimedOut, setPollingTimedOut] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [audioError, setAudioError] = useState('');
  const [audioLoading, setAudioLoading] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<GenerationRequestIntent | null>(null);
  const audioAbortController = useRef<AbortController | null>(null);

  const voices = useQuery({
    queryKey: ['voices'],
    queryFn: () => apiRequest<Voice[]>('/voices', token),
    enabled: Boolean(token),
  });

  const create = useMutation({
    mutationFn: (request: { payload: GenerationPayload; idempotencyKey: string }) =>
      apiRequest<Generation>('/generations', token, {
        method: 'POST',
        headers: { 'Idempotency-Key': request.idempotencyKey },
        body: JSON.stringify(request.payload),
      }),
    onSuccess: (data) => {
      audioAbortController.current?.abort();
      audioAbortController.current = null;
      setAudioLoading(false);
      setJob(data);
      setAudioUrl('');
      void queryClient.invalidateQueries({ queryKey: ['usage'] });
    },
  });

  const status = useQuery({
    queryKey: ['generation', job?.id],
    queryFn: () => apiRequest<Generation>(`/generations/${job!.id}`, token),
    enabled: Boolean(job?.id) && ['QUEUED', 'RUNNING'].includes(job?.status ?? ''),
    refetchInterval: (query) =>
      getGenerationPollingInterval(
        query.state.data?.status ?? job?.status,
        pollingStartedAt,
        Date.now(),
      ),
  });

  useEffect(() => {
    setPollingStartedAt(job?.id ? Date.now() : null);
    setPollingTimedOut(false);
  }, [job?.id]);

  useEffect(() => {
    if (pollingStartedAt === null) return;

    const remaining = Math.max(
      0,
      GENERATION_POLL_MAX_DURATION_MS - (Date.now() - pollingStartedAt),
    );
    const timer = window.setTimeout(() => setPollingTimedOut(true), remaining);

    return () => window.clearTimeout(timer);
  }, [pollingStartedAt]);

  useEffect(() => {
    if (!job?.id || !token || !['QUEUED', 'RUNNING'].includes(job.status)) return;
    const controller = new AbortController();
    let retryTimer: number | undefined;
    const connect = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/generations/${job.id}/events`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'text/event-stream' },
          signal: controller.signal,
        });
        if (!response.ok || !response.body) throw new Error('Progress stream unavailable');
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        while (!controller.signal.aborted) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const frames = buffer.split('\n\n');
          buffer = frames.pop() ?? '';
          for (const frame of frames) {
            const data = frame.split('\n').find((line) => line.startsWith('data: '))?.slice(6);
            if (!data || data === '{}') continue;
            try {
              const next = JSON.parse(data) as Generation;
              setJob(next);
              if (['SUCCEEDED', 'FAILED', 'CANCELLED'].includes(next.status)) {
                setPendingRequest(null);
                void queryClient.invalidateQueries({ queryKey: ['usage'] });
                void queryClient.invalidateQueries({ queryKey: ['generations'] });
                return;
              }
            } catch {
              // Keep the polling query as a fallback for malformed events.
            }
          }
        }
      } catch {
        // Reconnect below; polling remains the fallback.
      }
      if (!controller.signal.aborted) retryTimer = window.setTimeout(() => void connect(), 2000);
    };
    void connect();
    return () => {
      controller.abort();
      if (retryTimer !== undefined) window.clearTimeout(retryTimer);
    };
  }, [job?.id, job?.status, token, queryClient]);

  useEffect(() => {
    if (!status.data) return;

    setJob(status.data);
    if (['SUCCEEDED', 'FAILED', 'CANCELLED'].includes(status.data.status)) {
      setPendingRequest(null);
    }
    if (status.data.status === 'SUCCEEDED') {
      void queryClient.invalidateQueries({ queryKey: ['usage'] });
      void queryClient.invalidateQueries({ queryKey: ['generations'] });
    }
  }, [status.data, queryClient]);

  useEffect(() => () => {
    audioAbortController.current?.abort();
  }, []);

  useEffect(() => () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  function submitGeneration() {
    const payload: GenerationPayload = {
      text: text.trim(),
      voiceId,
      language: 'vi',
      speed,
      totalSteps: 32,
      sentencePause,
      paragraphPause,
    };
    const intent = getGenerationRequestIntent(payload, pendingRequest);

    setPendingRequest(intent);
    create.mutate({ payload, idempotencyKey: intent.key });
  }

  async function playAudio() {
    if (!job || audioLoading) return;

    const controller = new AbortController();
    audioAbortController.current?.abort();
    audioAbortController.current = controller;
    setAudioLoading(true);
    setAudioError('');
    try {
      const nextUrl = await fetchAudio(
        `/generations/${job.id}/audio`,
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
    } catch (error) {
      if (!controller.signal.aborted) {
        setAudioError(error instanceof Error ? error.message : 'Không thể tải audio.');
      }
    } finally {
      if (!controller.signal.aborted) {
        setAudioLoading(false);
        if (audioAbortController.current === controller) {
          audioAbortController.current = null;
        }
      }
    }
  }

  const selectedVoice = voices.data?.find((voice) => voice.id === voiceId);

  /** Selects a voice; an untouched sample text follows the voice's TTS group (the group 2 sample has emotion cues). */
  function selectVoice(nextVoiceId: string) {
    setVoiceId(nextVoiceId);
    const group = voices.data?.find((voice) => voice.id === nextVoiceId)?.group;
    setText((current) => (isSampleText(current) ? sampleTextFor(group) : current));
  }

  return {
    text,
    setText,
    voiceId,
    setVoiceId: selectVoice,
    samplePlaceholder: sampleTextFor(selectedVoice?.group),
    speed,
    setSpeed,
    sentencePause,
    setSentencePause,
    paragraphPause,
    setParagraphPause,
    job,
    voices,
    create,
    status,
    pollingTimedOut,
    audioUrl,
    audioError,
    audioLoading,
    selectedVoice,
    canSubmit: text.trim().length > 0 && Boolean(voiceId) && !create.isPending,
    submitGeneration,
    playAudio,
    isPaymentRequired: create.error instanceof ApiError && create.error.status === 402,
  };
}
