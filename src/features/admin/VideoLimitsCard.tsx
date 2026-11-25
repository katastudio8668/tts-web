import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Clapperboard } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';

type VideoLimitsSetting = { maxDurationSeconds: number; updatedAt: string; updatedBy: string | null };

/** Admin control for how long a video project may run (replaces what used to be a fixed env var). */
export function VideoLimitsCard({ token }: { token: string }) {
  const queryClient = useQueryClient();
  const [seconds, setSeconds] = useState('180');
  const [saved, setSaved] = useState(false);
  const setting = useQuery({
    queryKey: ['admin', 'video-limits'],
    queryFn: () => apiRequest<VideoLimitsSetting>('/admin/video-limits', token),
    enabled: Boolean(token),
  });
  useEffect(() => { if (setting.data) setSeconds(String(setting.data.maxDurationSeconds)); }, [setting.data]);
  const save = useMutation({
    mutationFn: (maxDurationSeconds: number) => apiRequest<VideoLimitsSetting>('/admin/video-limits', token, {
      method: 'PUT', body: JSON.stringify({ maxDurationSeconds }),
    }),
    onSuccess: (data) => {
      queryClient.setQueryData(['admin', 'video-limits'], data);
      setSaved(true);
    },
  });
  const parsed = Number(seconds);
  const valid = Number.isInteger(parsed) && parsed >= 10 && parsed <= 7200;

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <span className="step-label">VIDEO</span>
          <h2>Giới hạn độ dài video</h2>
        </div>
        <span className="stat-icon violet"><Clapperboard size={18} /></span>
      </div>
      {setting.isLoading && <div className="inline-loading">Đang tải cấu hình…</div>}
      {setting.isError && <p className="inline-error" role="alert">Không tải được cấu hình.</p>}
      {setting.data && (
        <div className="admin-form">
          <label>
            <span>Độ dài tối đa (giây)</span>
            <input
              type="number"
              min={10}
              max={7200}
              step={1}
              value={seconds}
              onChange={(event) => { setSaved(false); setSeconds(event.target.value); }}
            />
          </label>
          <p className="admin-meta">Áp dụng cho mọi video project mới hoặc được sửa (10–7200 giây). Đổi tại đây, không cần deploy lại.</p>
          <div className="form-actions">
            <button className="primary-button" type="button" disabled={!valid || save.isPending} onClick={() => save.mutate(parsed)}>
              {save.isPending ? 'Đang lưu…' : 'Lưu giới hạn'}
            </button>
            {saved && <span className="form-success" role="status">Đã lưu.</span>}
            {save.isError && <span className="inline-error" role="alert">{save.error.message}</span>}
          </div>
        </div>
      )}
    </section>
  );
}
