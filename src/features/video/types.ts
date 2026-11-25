import type { RenderPlan } from './plan';

/** Video spec v1, as stored and validated by the API (korva-tts-api src/videos/video-spec.ts). */
export type AspectRatio = '16:9' | '9:16' | '1:1';
export type Transition = 'none' | 'fade' | 'blurry' | 'zoom-in' | 'zoom-out' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' | 'push-left' | 'push-right';
export type Layout = 'title' | 'caption' | 'quote' | 'list' | 'media';
export type TextAnimation = 'none' | 'fade' | 'pop' | 'slide-up' | 'typewriter';
export type TextPosition = 'top' | 'center' | 'bottom';
export type CaptionAnimation = 'karaoke' | 'fade' | 'pop' | 'slide-up' | 'typewriter';
export type MediaMotion = 'none' | 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right';
export type AssetType = 'image' | 'video' | 'audio';

export type SceneBackground =
  | { type: 'color'; color: string }
  | { type: 'gradient'; from: string; to: string; angle: number }
  | { type: 'media'; assetId: string; fitMode: 'cover' | 'contain'; motion: MediaMotion };

export type SceneVoice = { text: string; voiceId: string | null; generationId: string | null; textHash: string | null; durationSeconds: number | null };

export type VideoScene = {
  id: string; durationSeconds: number; minDurationSeconds: number; transition: Transition; transitionSeconds: number;
  background: SceneBackground; layout: Layout; heading: string; body: string; bullets: string[];
  textAnimation: TextAnimation; textPosition: TextPosition; voice: SceneVoice | null; keepOriginalAudio: boolean; mediaVolume: number;
};

export type VideoAsset = { id: string; type: AssetType; name: string; source: 'local' | 'placeholder' };

export type VideoSpec = {
  version: 1; title: string; aspectRatio: AspectRatio; fps: number; resolution: '720p' | '1080p';
  theme: { fontFamily: 'sans' | 'serif' | 'display'; textColor: string; accentColor: string; overlayOpacity: number };
  defaultVoiceId: string | null;
  voiceSync: { leadSeconds: number; tailSeconds: number };
  captions: { enabled: boolean; animation: CaptionAnimation; position: TextPosition; fontSize: number; textColor: string; highlightColor: string; outlineColor: string };
  music: { assetId: string | null; volume: number; startSeconds: number };
  voiceVolume: number;
  watermark: { enabled: boolean; text: string };
  assets: VideoAsset[];
  scenes: VideoScene[];
};

export type ProjectStatus = {
  durationSeconds: number; sceneCount: number; voicedScenes: number; scenesNeedingVoice: string[]; voiceCharacters: number;
  localAssetsNeeded: { id: string; type: AssetType; name: string; source: string }[];
};

export type VideoProjectSummary = { id: string; title: string; templateId: string | null; createdVia: string; revision: number; createdAt: string; updatedAt: string; status: ProjectStatus };
export type VideoProject = VideoProjectSummary & { spec: VideoSpec; warnings: string[] };
export type VideoTemplateSummary = {
  id: string; name: string; description: string; tags: string[]; builtIn: boolean; createdVia: string; revision: number;
  durationSeconds: number; sceneCount: number; updatedAt: string;
};
export type VideoTemplate = VideoTemplateSummary & { spec: VideoSpec };

export type RequiredAsset = { assetId: string; kind: 'generation'; generationId: string } | { assetId: string; kind: 'local'; type: AssetType };
export type PreviewPlanResponse = { plan: RenderPlan; requiredAssets: RequiredAsset[]; warnings: string[]; status: ProjectStatus };

export type VoiceProgress = {
  voicedScenes: number; readyScenes: number; generatingSceneId: string | null; waitingSceneIds: string[];
  failed: { sceneId: string; reason: string }[]; blockedReason: string | null; done: boolean;
};
export type VoiceEstimate = { scenes: number; characters: number; estimatedCredits: number; availableCredits: number; note: string };

export type RenderJob = {
  id: string; projectId: string | null; status: 'QUEUED' | 'RENDERING' | 'UPLOADING' | 'SUCCEEDED' | 'FAILED' | 'EXPIRED';
  destination: 'GOOGLE_DRIVE' | 'DOWNLOAD'; errorMessage: string | null; driveFileId: string | null; driveWebViewLink: string | null;
  fileName: string; outputBytes: number | null; durationSeconds: number; expiresAt: string | null; createdAt: string; completedAt: string | null;
};
