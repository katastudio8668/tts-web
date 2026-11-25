import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BookmarkPlus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';
import { useSaveTarget } from '../features/storage/useSaveTarget';
import { assetKey, browserStore } from '../features/video/browserStore';
import { MediaPanel } from '../features/video/editor/MediaPanel';
import { ProjectSettings } from '../features/video/editor/ProjectSettings';
import { RenderPanel } from '../features/video/editor/RenderPanel';
import { SceneInspector } from '../features/video/editor/SceneInspector';
import { SceneList } from '../features/video/editor/SceneList';
import { VoicePanel } from '../features/video/editor/VoicePanel';
import { usePreviewMedia } from '../features/video/usePreviewMedia';
import { useVideoEditor } from '../features/video/useVideoEditor';
import { videoApi } from '../features/video/videoApi';
import { VideoPreview } from '../features/video/VideoPreview';
import { apiRequest, type Voice } from '../lib/api';

type Tab = 'scene' | 'video' | 'media';
const SAVE_LABELS = { saved: 'Đã lưu', dirty: 'Chưa lưu…', saving: 'Đang lưu…', conflict: 'Có thay đổi ở nơi khác', error: 'Lưu thất bại' } as const;

export default function VideoEditorPage() {
  const { id = '' } = useParams();
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const editor = useVideoEditor(id);
  const saveTarget = useSaveTarget();
  const voices = useQuery({ queryKey: ['voices'], queryFn: () => apiRequest<Voice[]>('/voices', editor.token), enabled: Boolean(editor.token) });
  const [tab, setTab] = useState<Tab>('scene');
  const [selectedId, setSelectedId] = useState('');
  const [mediaVersion, setMediaVersion] = useState(0);
  const [available, setAvailable] = useState<Set<string>>(new Set());
  const [templateMessage, setTemplateMessage] = useState('');
  const spec = editor.spec;

  useEffect(() => { if (spec && !spec.scenes.some((scene) => scene.id === selectedId)) {setSelectedId(spec.scenes[0]?.id ?? '');} }, [spec, selectedId]);

  // Which media files this browser holds for the project.
  const assetIds = useMemo(() => spec?.assets.map((asset) => asset.id).join('|') ?? '', [spec]);
  useEffect(() => {
    let active = true;
    void Promise.all((assetIds ? assetIds.split('|') : []).map(async (assetId) =>
      ((await browserStore.get('assets', assetKey(userId, id, assetId)).catch(() => undefined)) ? assetId : null)))
      .then((ids) => { if (active) {setAvailable(new Set(ids.filter((value): value is string => Boolean(value))));} });
    return () => { active = false; };
  }, [assetIds, userId, id, mediaVersion]);

  const assetUrls = usePreviewMedia({ requiredAssets: editor.preview?.requiredAssets ?? [], userId, projectId: id, token: editor.token, version: mediaVersion });

  if (editor.project.isLoading || !spec) {
    return <div className="empty-state">{editor.project.isError ? <><strong>Không mở được video</strong><Link to="/videos" className="text-link">Về thư viện</Link></> : <><span className="spinner" />Đang mở video…</>}</div>;
  }
  const scene = spec.scenes.find((item) => item.id === selectedId) ?? spec.scenes[0];

  async function saveAsTemplate() {
    setTemplateMessage('');
    try {
      await videoApi.saveTemplate(editor.token, { name: spec!.title, description: 'Lưu từ trình dựng video', spec: spec! });
      setTemplateMessage('Đã lưu thành mẫu của bạn.');
    } catch (error) {
      setTemplateMessage((error as Error).message);
    }
  }

  return (
    <div className="video-editor">
      <div className="video-editor-top">
        <Link to="/videos" className="icon-button" aria-label="Về thư viện video"><ArrowLeft size={18} /></Link>
        <h1>{spec.title}</h1>
        <span className={`save-state ${editor.saveState}`}>{SAVE_LABELS[editor.saveState]}</span>
        {editor.saveState === 'conflict' && <button type="button" className="secondary-button small" onClick={() => void editor.reload()}>Tải lại</button>}
        <button type="button" className="secondary-button small" onClick={() => void saveAsTemplate()}><BookmarkPlus size={14} /> Lưu thành mẫu</button>
      </div>
      {templateMessage && <p className="vf-hint" role="status">{templateMessage}</p>}
      {editor.saveError && <p className="inline-error" role="alert">{editor.saveError}</p>}
      {editor.problems.length > 0 && <p className="inline-error" role="alert">{editor.problems.join(' ')}</p>}

      <div className="video-editor-grid">
        <aside className="panel">
          <SceneList spec={spec} selectedId={scene.id} onSelect={(sceneId) => { setSelectedId(sceneId); setTab('scene'); }} edit={editor.edit} locked={editor.locked} />
        </aside>
        <section className="video-editor-center">
          <VideoPreview plan={editor.preview?.plan ?? null} assetUrls={assetUrls} />
          <div className="panel">
            <VoicePanel spec={spec} status={editor.status} token={editor.token} projectId={id} voice={editor.voice}
              runVoices={editor.runVoices} stopVoices={editor.stopVoices} save={editor.save} />
          </div>
          <div className="panel">
            <RenderPanel status={editor.status} projectId={id} available={available} save={editor.save} saveTarget={saveTarget}
              disabled={editor.locked || editor.saveState === 'conflict'} />
          </div>
        </section>
        <aside className="panel">
          <div className="tabs" role="tablist">
            {(['scene', 'video', 'media'] as const).map((key) => (
              <button key={key} type="button" role="tab" aria-selected={tab === key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>
                {key === 'scene' ? 'Cảnh' : key === 'video' ? 'Video' : 'Media'}
              </button>
            ))}
          </div>
          {tab === 'scene' && <SceneInspector spec={spec} scene={scene} voices={voices.data ?? []} edit={editor.edit} locked={editor.locked} />}
          {tab === 'video' && <ProjectSettings spec={spec} voices={voices.data ?? []} edit={editor.edit} locked={editor.locked} />}
          {tab === 'media' && <MediaPanel spec={spec} edit={editor.edit} locked={editor.locked} userId={userId} projectId={id} available={available}
            onStored={() => setMediaVersion((value) => value + 1)} />}
        </aside>
      </div>
    </div>
  );
}
