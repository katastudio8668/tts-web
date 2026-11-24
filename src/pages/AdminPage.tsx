import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Gift, ShieldAlert } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { useIsAdmin } from '../features/admin/useIsAdmin';
import { apiRequest, type FreeTierSetting } from '../lib/api';

const MAX_WEEKLY_CHARACTERS = 10_000_000;

export default function AdminPage() {
  const { isAdmin, isLoading, token } = useIsAdmin();
  const queryClient = useQueryClient();
  const [value, setValue] = useState('');
  const [saved, setSaved] = useState(false);

  const setting = useQuery({
    queryKey: ['admin', 'free-tier'],
    queryFn: () => apiRequest<FreeTierSetting>('/admin/free-tier', token),
    enabled: Boolean(token) && isAdmin,
  });

  useEffect(() => {
    if (setting.data) setValue(String(setting.data.weeklyCharacters));
  }, [setting.data]);

  const save = useMutation({
    mutationFn: (weeklyCharacters: number) => apiRequest<FreeTierSetting>('/admin/free-tier', token, {
      method: 'PUT',
      body: JSON.stringify({ weeklyCharacters }),
    }),
    onSuccess: (data) => {
      queryClient.setQueryData(['admin', 'free-tier'], data);
      void queryClient.invalidateQueries({ queryKey: ['usage'] });
      setSaved(true);
    },
  });

  const parsed = Number(value);
  const valid = value.trim() !== '' && Number.isInteger(parsed) && parsed >= 0 && parsed <= MAX_WEEKLY_CHARACTERS;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!valid) return;
    setSaved(false);
    save.mutate(parsed);
  }

  if (isLoading) {
    return <div className="empty-state"><span className="spinner" />Đang kiểm tra quyền…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="empty-state">
        <ShieldAlert size={24} />
        <strong>Không có quyền truy cập</strong>
        <span>Trang này chỉ dành cho quản trị viên.</span>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <div className="page-title">
        <div className="eyebrow">ADMIN</div>
        <h1>Quản trị</h1>
        <p>Cấu hình áp dụng cho toàn bộ người dùng KATA TTS.</p>
      </div>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="step-label">GÓI MIỄN PHÍ</span>
            <h2>Ký tự miễn phí mỗi tuần</h2>
          </div>
          <span className="stat-icon green"><Gift size={18} /></span>
        </div>

        {setting.isLoading && <div className="inline-loading">Đang tải cấu hình…</div>}
        {setting.isError && <p className="inline-error" role="alert">Không tải được cấu hình gói miễn phí.</p>}

        {setting.data && (
          <form className="admin-form" onSubmit={submit}>
            <label htmlFor="weekly-characters">
              Số ký tự miễn phí / người dùng / tuần
              <input
                id="weekly-characters"
                type="number"
                inputMode="numeric"
                min={0}
                max={MAX_WEEKLY_CHARACTERS}
                step={1}
                value={value}
                onChange={(event) => { setValue(event.target.value); setSaved(false); }}
              />
            </label>
            <p className="admin-meta">
              Tuần bắt đầu lúc 00:00 thứ Hai (giờ Việt Nam). Ký tự miễn phí được dùng trước, phần vượt quá mới trừ credit.
              Đặt 0 để tắt gói miễn phí.
            </p>
            {!valid && value.trim() !== '' && (
              <p className="inline-error" role="alert">Nhập số nguyên từ 0 đến {MAX_WEEKLY_CHARACTERS.toLocaleString('vi-VN')}.</p>
            )}
            <div className="form-actions">
              <button className="primary-button" type="submit" disabled={!valid || save.isPending}>
                {save.isPending ? 'Đang lưu…' : 'Lưu cấu hình'}
              </button>
              {saved && <span className="form-success" role="status">Đã lưu.</span>}
              {save.isError && <span className="inline-error" role="alert">{save.error.message}</span>}
            </div>
            <span className="admin-meta">
              Cập nhật lần cuối: {new Date(setting.data.updatedAt).toLocaleString('vi-VN')}
            </span>
          </form>
        )}
      </section>
    </div>
  );
}
