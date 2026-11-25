import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Gift, ShieldAlert, SlidersHorizontal } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { useIsAdmin } from '../features/admin/useIsAdmin';
import { apiRequest, type GenerationSettings } from '../lib/api';
import { TtsGroupsCard } from '../features/admin/TtsGroupsCard';
import { VideoLimitsCard } from '../features/admin/VideoLimitsCard';

const MAX_WEEKLY_CREDITS = 100_000_000;
const MAX_TEXT_CHARACTERS = 100_000;
const MAX_CREDITS_PER_CHARACTER = 100_000;

export default function AdminPage() {
  const { isAdmin, isLoading, token } = useIsAdmin();
  const queryClient = useQueryClient();
  const [maxCharacters, setMaxCharacters] = useState('3500');
  const [creditsPerCharacter, setCreditsPerCharacter] = useState('5');
  const [weeklyCredits, setWeeklyCredits] = useState('30000');
  const [saved, setSaved] = useState(false);

  const setting = useQuery({
    queryKey: ['admin', 'generation-settings'],
    queryFn: () => apiRequest<GenerationSettings>('/admin/generation-settings', token),
    enabled: Boolean(token) && isAdmin,
  });

  useEffect(() => {
    if (!setting.data) return;
    setMaxCharacters(String(setting.data.maxTextCharacters));
    setCreditsPerCharacter(String(setting.data.creditsPerCharacter));
    setWeeklyCredits(String(setting.data.weeklyCredits));
  }, [setting.data]);

  const save = useMutation({
    mutationFn: (payload: Pick<GenerationSettings, 'maxTextCharacters' | 'creditsPerCharacter' | 'weeklyCredits'>) =>
      apiRequest<GenerationSettings>('/admin/generation-settings', token, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(['admin', 'generation-settings'], data);
      queryClient.setQueryData(['admin', 'free-tier'], data);
      void queryClient.invalidateQueries({ queryKey: ['usage'] });
      setSaved(true);
    },
  });

  const parsedMaxCharacters = Number(maxCharacters);
  const parsedRate = Number(creditsPerCharacter);
  const parsedWeeklyCredits = Number(weeklyCredits);
  const validMax = maxCharacters.trim() !== '' && Number.isInteger(parsedMaxCharacters)
    && parsedMaxCharacters >= 1 && parsedMaxCharacters <= MAX_TEXT_CHARACTERS;
  const validRate = creditsPerCharacter.trim() !== '' && Number.isFinite(parsedRate)
    && parsedRate >= 0.001 && parsedRate <= MAX_CREDITS_PER_CHARACTER
    && /^\\d+(?:\\.\\d{1,3})?$/.test(creditsPerCharacter);
  const validWeekly = weeklyCredits.trim() !== '' && Number.isInteger(parsedWeeklyCredits)
    && parsedWeeklyCredits >= 0 && parsedWeeklyCredits <= MAX_WEEKLY_CREDITS;
  const valid = validMax && validRate && validWeekly;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!valid) return;
    setSaved(false);
    save.mutate({
      maxTextCharacters: parsedMaxCharacters,
      creditsPerCharacter: parsedRate,
      weeklyCredits: parsedWeeklyCredits,
    });
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

      <TtsGroupsCard token={token} />
      <VideoLimitsCard token={token} />

      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="step-label">CẤU HÌNH TẠO GIỌNG</span>
            <h2>Giới hạn và định mức credit</h2>
          </div>
          <span className="stat-icon green"><SlidersHorizontal size={18} /></span>
        </div>

        {setting.isLoading && <div className="inline-loading">Đang tải cấu hình…</div>}
        {setting.isError && <p className="inline-error" role="alert">Không tải được cấu hình tạo giọng.</p>}

        {setting.data && (
          <form className="admin-form" onSubmit={submit}>
            <label htmlFor="max-text-characters">
              Số ký tự tối đa trong một lần tạo
              <input id="max-text-characters" type="number" inputMode="numeric" min={1}
                max={MAX_TEXT_CHARACTERS} step={1} value={maxCharacters}
                onChange={(event) => { setMaxCharacters(event.target.value); setSaved(false); }} />
            </label>
            <p className="admin-meta">Áp dụng toàn hệ thống. Nếu gói thuê bao có giới hạn thấp hơn thì vẫn áp dụng giới hạn thấp hơn của gói. Mặc định 3.500 ký tự.</p>
            {!validMax && <p className="inline-error" role="alert">Nhập số nguyên từ 1 đến {MAX_TEXT_CHARACTERS.toLocaleString('vi-VN')}.</p>}

            <label htmlFor="credits-per-character">
              Giá credit cơ bản cho mỗi ký tự
              <input id="credits-per-character" type="number" inputMode="decimal" min={0.001}
                max={MAX_CREDITS_PER_CHARACTER} step={0.001} value={creditsPerCharacter}
                onChange={(event) => { setCreditsPerCharacter(event.target.value); setSaved(false); }} />
            </label>
            <p className="admin-meta">Giá thực tế = giá cơ bản × hệ số của giọng đọc. Ví dụ giọng thường hệ số 1 sẽ tốn 5 credit/ký tự. Mặc định 5 credit/ký tự.</p>
            {!validRate && <p className="inline-error" role="alert">Nhập số từ 0,001 đến {MAX_CREDITS_PER_CHARACTER.toLocaleString('vi-VN')}, tối đa 3 chữ số thập phân.</p>}

            <label htmlFor="weekly-credits">
              Credit miễn phí / người dùng / tuần
              <input id="weekly-credits" type="number" inputMode="numeric" min={0}
                max={MAX_WEEKLY_CREDITS} step={1} value={weeklyCredits}
                onChange={(event) => { setWeeklyCredits(event.target.value); setSaved(false); }} />
            </label>
            <p className="admin-meta">Tuần bắt đầu lúc 00:00 thứ Hai (giờ Việt Nam). Credit miễn phí được dùng trước, phần vượt quá mới trừ số dư. Đặt 0 để tắt. Mặc định 30.000 credit/tuần.</p>
            {!validWeekly && <p className="inline-error" role="alert">Nhập số nguyên từ 0 đến {MAX_WEEKLY_CREDITS.toLocaleString('vi-VN')}.</p>}

            <div className="form-actions">
              <button className="primary-button" type="submit" disabled={!valid || save.isPending}>
                {save.isPending ? 'Đang lưu…' : 'Lưu cấu hình'}
              </button>
              {saved && <span className="form-success" role="status">Đã lưu.</span>}
              {save.isError && <span className="inline-error" role="alert">{save.error.message}</span>}
            </div>
            <span className="admin-meta">
              <Gift size={13} /> Cập nhật lần cuối: {new Date(setting.data.updatedAt).toLocaleString('vi-VN')}
            </span>
          </form>
        )}
      </section>
    </div>
  );
}
