import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AudioLines } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';

type TtsGroupSetting = { enabledGroups: number[]; updatedAt: string; updatedBy: string | null };
const GROUPS = [
  { id: 1, label: 'TTS Group 1', hint: 'Giọng đọc rõ ràng, ổn định.' },
  { id: 2, label: 'TTS Group 2', hint: 'Giọng tự nhiên, hỗ trợ thẻ cảm xúc [cười] [thở dài] [hắng giọng]. Mặc định.' },
];

/** Admin switch for which TTS groups users can pick voices from. */
export function TtsGroupsCard({ token }: { token: string }) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<number[]>([]);
  const [saved, setSaved] = useState(false);
  const setting = useQuery({
    queryKey: ['admin', 'tts-groups'],
    queryFn: () => apiRequest<TtsGroupSetting>('/admin/tts-groups', token),
    enabled: Boolean(token),
  });
  useEffect(() => { if (setting.data) setSelected(setting.data.enabledGroups); }, [setting.data]);
  const save = useMutation({
    mutationFn: (enabledGroups: number[]) => apiRequest<TtsGroupSetting>('/admin/tts-groups', token, {
      method: 'PUT', body: JSON.stringify({ enabledGroups }),
    }),
    onSuccess: (data) => {
      queryClient.setQueryData(['admin', 'tts-groups'], data);
      void queryClient.invalidateQueries({ queryKey: ['voices'] });
      setSaved(true);
    },
  });
  const toggle = (id: number) => {
    setSaved(false);
    setSelected((current) => (current.includes(id) ? current.filter((g) => g !== id) : [...current, id].sort()));
  };

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <span className="step-label">GIỌNG ĐỌC</span>
          <h2>Nhóm giọng TTS</h2>
        </div>
        <span className="stat-icon violet"><AudioLines size={18} /></span>
      </div>
      {setting.isLoading && <div className="inline-loading">Đang tải cấu hình…</div>}
      {setting.isError && <p className="inline-error" role="alert">Không tải được cấu hình nhóm giọng.</p>}
      {setting.data && (
        <div className="admin-form">
          {GROUPS.map((group) => (
            <label key={group.id} className="check-row">
              <input type="checkbox" checked={selected.includes(group.id)} onChange={() => toggle(group.id)} />
              <span><strong>{group.label}</strong><small>{group.hint}</small></span>
            </label>
          ))}
          <p className="admin-meta">Người dùng chỉ thấy và dùng được giọng của các nhóm đang bật. Cần bật ít nhất một nhóm.</p>
          <div className="form-actions">
            <button className="primary-button" type="button" disabled={selected.length === 0 || save.isPending} onClick={() => save.mutate(selected)}>
              {save.isPending ? 'Đang lưu…' : 'Lưu nhóm giọng'}
            </button>
            {saved && <span className="form-success" role="status">Đã lưu.</span>}
            {save.isError && <span className="inline-error" role="alert">{save.error.message}</span>}
          </div>
        </div>
      )}
    </section>
  );
}
