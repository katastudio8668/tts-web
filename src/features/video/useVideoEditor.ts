import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../../lib/api';
import { useAuth } from '../auth/AuthProvider';
import type { PreviewPlanResponse, ProjectStatus, VideoProject, VideoSpec, VoiceProgress } from './types';
import { videoApi } from './videoApi';

const SAVE_DEBOUNCE_MS = 1200;
const PREVIEW_DEBOUNCE_MS = 400;

export type SaveState = 'saved' | 'dirty' | 'saving' | 'conflict' | 'error';

/**
 * Editor state for one video project: local spec, autosave guarded by the project revision,
 * a debounced server-compiled preview plan, and the voice generation loop.
 */
export function useVideoEditor(projectId: string) {
  const { session } = useAuth();
  const token = session?.access_token ?? '';
  const queryClient = useQueryClient();
  const project = useQuery({ queryKey: ['video-project', projectId], queryFn: () => videoApi.getProject(token, projectId), enabled: Boolean(token) });

  const [spec, setSpec] = useState<VideoSpec | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [saveError, setSaveError] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [status, setStatus] = useState<ProjectStatus | null>(null);
  const [preview, setPreview] = useState<PreviewPlanResponse | null>(null);
  const [problems, setProblems] = useState<string[]>([]);
  const [voice, setVoice] = useState<{ running: boolean; progress: VoiceProgress | null; error: string }>({ running: false, progress: null, error: '' });
  const revision = useRef(0);
  const specRef = useRef<VideoSpec | null>(null);
  const savedSpec = useRef<VideoSpec | null>(null);
  const saving = useRef<Promise<void> | null>(null);
  const voiceAbort = useRef(false);

  const adopt = useCallback((loaded: VideoProject) => {
    revision.current = loaded.revision;
    specRef.current = loaded.spec;
    savedSpec.current = loaded.spec;
    setSpec(loaded.spec);
    setStatus(loaded.status);
    setWarnings(loaded.warnings ?? []);
    setSaveState('saved');
  }, []);

  useEffect(() => { if (project.data && !specRef.current) {adopt(project.data);} }, [project.data, adopt]);

  const edit = useCallback((change: (current: VideoSpec) => VideoSpec) => {
    if (!specRef.current) {return;}
    const next = change(specRef.current);
    specRef.current = next;
    setSpec(next);
    setSaveState((state) => (state === 'conflict' ? state : 'dirty'));
  }, []);

  const save = useCallback(async (): Promise<void> => {
    if (saving.current) {await saving.current;}
    const current = specRef.current;
    if (!current || current === savedSpec.current) {return;}
    setSaveState('saving');
    saving.current = (async () => {
      try {
        const saved = await videoApi.updateProject(token, projectId, revision.current, current);
        revision.current = saved.revision;
        savedSpec.current = current;
        setStatus(saved.status);
        setWarnings(saved.warnings ?? []);
        setSaveError('');
        setSaveState(specRef.current === current ? 'saved' : 'dirty');
        void queryClient.invalidateQueries({ queryKey: ['video-projects'] });
      } catch (error) {
        if (error instanceof ApiError && error.status === 409) {setSaveState('conflict');} else {
          setSaveState('error');
          setSaveError(error instanceof ApiError && error.details?.problems?.length ? error.details.problems.join(' ') : (error as Error).message);
        }
        throw error;
      } finally {
        saving.current = null;
      }
    })();
    return saving.current;
  }, [projectId, queryClient, token]);

  // Autosave after a pause in editing.
  useEffect(() => {
    if (saveState !== 'dirty') {return;}
    const timer = window.setTimeout(() => { void save().catch(() => undefined); }, SAVE_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [spec, saveState, save]);

  // Live preview plan, compiled by the API (single source of truth for timing and captions).
  useEffect(() => {
    if (!spec || !token) {return;}
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      videoApi.previewPlan(token, spec, controller.signal)
        .then((result) => { setPreview(result); setProblems([]); })
        .catch((error: unknown) => {
          if (controller.signal.aborted) {return;}
          setProblems(error instanceof ApiError && error.details?.problems?.length ? error.details.problems : [(error as Error).message]);
        });
    }, PREVIEW_DEBOUNCE_MS);
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [spec, token]);

  /** Generates missing voices one by one (credits!), refitting scene timing; the caller confirms the cost first. */
  const runVoices = useCallback(async () => {
    voiceAbort.current = false;
    setVoice({ running: true, progress: null, error: '' });
    try {
      await save();
      for (let round = 0; round < 400 && !voiceAbort.current; round += 1) {
        const result = await videoApi.advanceVoices(token, projectId, 15);
        // Edits are locked while voices run, so the server copy is authoritative here.
        adopt(result.project);
        setVoice({ running: true, progress: result.progress, error: '' });
        if (result.progress.done || result.progress.blockedReason) {break;}
      }
      setVoice((state) => ({ ...state, running: false }));
      void queryClient.invalidateQueries({ queryKey: ['usage'] });
    } catch (error) {
      setVoice((state) => ({ ...state, running: false, error: (error as Error).message }));
    }
  }, [adopt, projectId, queryClient, save, token]);

  useEffect(() => () => { voiceAbort.current = true; }, []);

  const reload = useCallback(async () => {
    const fresh = await videoApi.getProject(token, projectId);
    adopt(fresh);
    queryClient.setQueryData(['video-project', projectId], fresh);
  }, [adopt, projectId, queryClient, token]);

  return {
    project, spec, edit, save, saveState, saveError, warnings, status, preview, problems,
    voice, runVoices, stopVoices: () => { voiceAbort.current = true; }, reload, token,
    locked: voice.running,
  };
}
