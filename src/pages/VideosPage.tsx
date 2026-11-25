import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Clapperboard, LayoutTemplate, Plus, Sparkles, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';
import { blankSpec } from '../features/video/specEditing';
import type { AspectRatio } from '../features/video/types';
import { videoApi } from '../features/video/videoApi';

const FORMATS: { ratio: AspectRatio; label: string }[] = [{ ratio: '9:16', label: 'Dọc 9:16' }, { ratio: '16:9', label: 'Ngang 16:9' }, { ratio: '1:1', label: 'Vuông 1:1' }];

export default function VideosPage() {
  const { session } = useAuth();
  const token = session?.access_token ?? '';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const projects = useQuery({ queryKey: ['video-projects'], queryFn: () => videoApi.listProjects(token), enabled: Boolean(token) });
  const templates = useQuery({ queryKey: ['video-templates'], queryFn: () => videoApi.listTemplates(token), enabled: Boolean(token) });
  const create = useMutation({
    mutationFn: (input: { templateId?: string; ratio?: AspectRatio }) => videoApi.createProject(token, input.templateId
      ? { templateId: input.templateId } : { spec: blankSpec('Video mới', input.ratio ?? '9:16') }),
    onSuccess: (project) => { void queryClient.invalidateQueries({ queryKey: ['video-projects'] }); navigate(`/videos/${project.id}`); },
  });
  const removeProject = useMutation({
    mutationFn: (id: string) => videoApi.deleteProject(token, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['video-projects'] }),
  });
  const removeTemplate = useMutation({
    mutationFn: (id: string) => videoApi.deleteTemplate(token, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['video-templates'] }),
  });

  return (
    <div className="page-stack">
      <div className="page-title">
        <div className="eyebrow">VIDEO STUDIO</div>
        <h1>Tạo video có giọng đọc</h1>
        <p>Dựng video từng cảnh, voice tự khớp thời lượng và phụ đề. Video lưu vào Google Drive hoặc thư mục của bạn.</p>
      </div>

      <section className="panel">
        <div className="panel-heading"><div><span className="step-label">BẮT ĐẦU</span><h2>Video trống</h2></div></div>
        <div className="format-row">
          {FORMATS.map((format) => (
            <button key={format.ratio} type="button" className="secondary-button" disabled={create.isPending} onClick={() => create.mutate({ ratio: format.ratio })}>
              <Plus size={15} /> {format.label}
            </button>
          ))}
          <Link to="/ai-plugin" className="text-link"><Sparkles size={14} /> Để trợ lý AI dựng video cho bạn</Link>
        </div>
        {create.isError && <p className="inline-error" role="alert">{create.error.message}</p>}
      </section>

      <section>
        <div className="section-heading"><div><h2>Mẫu video</h2><p>Chọn mẫu, thay nội dung, tạo voice và xuất video.</p></div></div>
        {templates.isLoading && <div className="inline-loading">Đang tải mẫu…</div>}
        <div className="template-grid">
          {templates.data?.map((template) => (
            <article key={template.id} className="template-card">
              <LayoutTemplate size={18} />
              <strong>{template.name}</strong>
              <small>{template.description}</small>
              <span className="soft-tag">{template.builtIn ? 'Mẫu có sẵn' : template.createdVia === 'AI' ? 'Tạo bởi AI' : 'Mẫu của bạn'} · {template.sceneCount} cảnh · ~{Math.round(template.durationSeconds)}s</span>
              <div className="form-actions">
                <button type="button" className="primary-button small" disabled={create.isPending} onClick={() => create.mutate({ templateId: template.id })}>Dùng mẫu</button>
                {!template.builtIn && <button type="button" className="icon-button" aria-label={`Xóa mẫu ${template.name}`} onClick={() => removeTemplate.mutate(template.id)}><Trash2 size={15} /></button>}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="history-card">
        <div className="panel-heading" style={{ padding: '16px 17px 0' }}><div><span className="step-label">CỦA BẠN</span><h2>Dự án video</h2></div></div>
        {projects.data?.length === 0 && <div className="empty-state"><Clapperboard size={22} /><span>Chưa có dự án nào.</span></div>}
        {projects.data?.map((project) => (
          <div key={project.id} className="history-row">
            <span className="history-wave"><Clapperboard size={16} /></span>
            <Link to={`/videos/${project.id}`} className="history-title">
              <strong>{project.title}</strong>
              <small>{project.status.sceneCount} cảnh · {project.status.durationSeconds.toFixed(0)}s{project.createdVia === 'AI' ? ' · tạo bởi AI' : ''} · {new Date(project.updatedAt).toLocaleString('vi-VN')}</small>
            </Link>
            <button type="button" className="icon-button" aria-label={`Xóa ${project.title}`} onClick={() => { if (window.confirm(`Xóa "${project.title}"?`)) {removeProject.mutate(project.id);} }}><Trash2 size={15} /></button>
          </div>
        ))}
      </section>
    </div>
  );
}
