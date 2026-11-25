import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthProvider';
import {
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
import { isSampleText, KORVA_SAMPLE_TEXT, sampleTextFor } from './sampleText';
import { getGenerationRequestIntent, type GenerationPayload, type GenerationRequestIntent } from './generationRequest';

export function useGenerationStudio() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const token = session?.access_token ?? '';

  const [text, setText] = useState(KORVA_SAMPLE_TEXT);
  const [voiceId, setVoiceId] = useState('');
  const [speed, setSpeed] = useState(1);
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

  /** Selects a voice; an untouched sample text follows the voice's model family (VieNeu sample has emotion cues). */
  function selectVoice(nextVoiceId: string) {
    setVoiceId(nextVoiceId);
    const engine = voices.data?.find((voice) => voice.id === nextVoiceId)?.engine;
    setText((current) => (isSampleText(current) ? sampleTextFor(engine) : current));
  }

  return {
    text,
    setText,
    voiceId,
    setVoiceId: selectVoice,
    samplePlaceholder: sampleTextFor(selectedVoice?.engine),
    speed,
    setSpeed,
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
