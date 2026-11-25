import { apiRequest, fetchBlob } from '../../lib/api';
import type {
  PreviewPlanResponse, RenderJob, VideoProject, VideoProjectSummary, VideoSpec, VideoTemplate, VideoTemplateSummary, VoiceEstimate, VoiceProgress,
} from './types';

const json = (method: string, body: unknown): RequestInit => ({ method, body: JSON.stringify(body) });

export const videoApi = {
  listProjects: (token: string) => apiRequest<VideoProjectSummary[]>('/video-projects', token),
  getProject: (token: string, id: string) => apiRequest<VideoProject>(`/video-projects/${id}`, token),
  createProject: (token: string, input: { title?: string; templateId?: string; spec?: VideoSpec }) =>
    apiRequest<VideoProject>('/video-projects', token, json('POST', input)),
  updateProject: (token: string, id: string, revision: number, spec: VideoSpec) =>
    apiRequest<VideoProject>(`/video-projects/${id}`, token, json('PUT', { revision, spec })),
  deleteProject: (token: string, id: string) => apiRequest<{ deleted: boolean }>(`/video-projects/${id}`, token, { method: 'DELETE' }),
  previewPlan: (token: string, spec: VideoSpec, signal?: AbortSignal) =>
    apiRequest<PreviewPlanResponse>('/video-projects/preview-plan', token, { ...json('POST', { spec }), signal }),
  estimateVoices: (token: string, id: string) => apiRequest<VoiceEstimate>(`/video-projects/${id}/voices/estimate`, token),
  advanceVoices: (token: string, id: string, waitSeconds: number) =>
    apiRequest<{ project: VideoProject; progress: VoiceProgress }>(`/video-projects/${id}/voices`, token, json('POST', { waitSeconds }), 60_000),
  listTemplates: (token: string) => apiRequest<VideoTemplateSummary[]>('/video-templates', token),
  getTemplate: (token: string, id: string) => apiRequest<VideoTemplate>(`/video-templates/${id}`, token),
  saveTemplate: (token: string, input: { id?: string; name: string; description?: string; spec: VideoSpec }) =>
    apiRequest<VideoTemplate>(input.id ? `/video-templates/${input.id}` : '/video-templates', token,
      json(input.id ? 'PUT' : 'POST', { name: input.name, description: input.description, spec: input.spec })),
  deleteTemplate: (token: string, id: string) => apiRequest<{ deleted: boolean }>(`/video-templates/${id}`, token, { method: 'DELETE' }),
  /** Media files travel with the request (never stored server-side); large uploads get 15 minutes. */
  createRender: (token: string, input: { projectId: string; destination: 'GOOGLE_DRIVE' | 'DOWNLOAD'; files: Record<string, Blob>; idempotencyKey: string }) => {
    const form = new FormData();
    form.set('projectId', input.projectId);
    form.set('destination', input.destination);
    for (const [assetId, blob] of Object.entries(input.files)) {form.set(`asset:${assetId}`, blob, assetId);}
    return apiRequest<RenderJob>('/video-renders', token, { method: 'POST', body: form, headers: { 'Idempotency-Key': input.idempotencyKey } }, 15 * 60_000);
  },
  getRender: (token: string, id: string) => apiRequest<RenderJob>(`/video-renders/${id}`, token),
  downloadRender: (token: string, id: string) => fetchBlob(`/video-renders/${id}/download`, token),
};
