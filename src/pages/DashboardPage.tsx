import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  AudioLines,
  Clock3,
  Coins,
  Gift,
  Sparkles,
  WandSparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';
import { formatCharacters, freeTierSummary } from '../features/billing/freeTier';
import { generationStatusLabel } from '../features/generation/generationPresentation';
import { apiRequest, type Generation, type Me, type Usage } from '../lib/api';

export default function DashboardPage() {
  const { session } = useAuth();
  const token = session?.access_token ?? '';

  const me = useQuery({
    queryKey: ['me'],
    queryFn: () => apiRequest<Me>('/me', token),
    enabled: Boolean(token),
  });
  const usage = useQuery({
    queryKey: ['usage'],
    queryFn: () => apiRequest<Usage>('/usage', token),
    enabled: Boolean(token),
  });
  const recent = useQuery({
    queryKey: ['generations', 'recent'],
    queryFn: () => apiRequest<Generation[]>('/generations?limit=5', token),
    enabled: Boolean(token),
  });

  const free = freeTierSummary(usage.data);

  const first = me.data?.displayName?.split(' ')[0]
    ?? session?.user.user_metadata?.full_name?.split(' ')[0]
    ?? 'bạn';

  return (
    <div className="page-stack">
      <section className="welcome-row">
        <div>
          <div className="eyebrow">YOUR VOICE WORKSPACE</div>
          <h1>Xin chào, {first} <span className="wave">✦</span></h1>
          <p>Sẵn sàng biến ý tưởng thành giọng nói chưa?</p>
        </div>
        <Link to="/generate" className="primary-button">
          <WandSparkles size={17} />
          Tạo giọng nói
          <ArrowRight size={16} />
        </Link>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <div className="stat-top">
            <span>Số dư tín dụng</span>
            <span className="stat-icon violet"><Coins size={18} /></span>
          </div>
          <strong>{usage.data?.balance?.toLocaleString('vi-VN') ?? '—'}</strong>
          <small>Credit khả dụng</small>
        </article>
        {free && (
          <article className="stat-card">
            <div className="stat-top">
              <span>Miễn phí tuần này</span>
              <span className="stat-icon green"><Gift size={18} /></span>
            </div>
            <strong>{formatCharacters(free.remaining)}</strong>
            <small>
              / {formatCharacters(free.weekly)} credit · làm mới {free.resetsLabel}
            </small>
          </article>
        )}
        <article className="stat-card">
          <div className="stat-top">
            <span>Đã sử dụng tháng này</span>
            <span className="stat-icon blue"><AudioLines size={18} /></span>
          </div>
          <strong>{usage.data?.usedThisMonth?.toLocaleString('vi-VN') ?? '—'}</strong>
          <small>Ký tự đã chuyển đổi</small>
        </article>
        <article className="stat-card">
          <div className="stat-top">
            <span>Gói hiện tại</span>
            <span className="stat-icon amber"><Sparkles size={18} /></span>
          </div>
          <strong className="stat-plan">{usage.data?.planName ?? 'Chưa kích hoạt'}</strong>
          <small>Thông tin từ tài khoản</small>
        </article>
      </section>

      <section className="section-heading">
        <div>
          <h2>Bắt đầu sáng tạo</h2>
          <p>Công cụ của bạn, ngay tại đây.</p>
        </div>
      </section>

      <Link to="/generate" className="create-banner">
        <div className="create-art">
          <AudioLines size={42} />
          <span />
          <span />
          <span />
        </div>
        <div className="create-copy">
          <span className="eyebrow">TEXT TO SPEECH</span>
          <h2>Studio tạo giọng nói</h2>
          <p>Chọn giọng, nhập nội dung và để Korva làm phần còn lại.</p>
        </div>
        <span className="banner-action">
          Bắt đầu
          <ArrowRight size={17} />
        </span>
      </Link>

      <section className="section-heading">
        <div>
          <h2>Gần đây</h2>
          <p>Những nội dung bạn đã tạo.</p>
        </div>
        <Link to="/history" className="text-link">
          Xem tất cả
          <ArrowRight size={15} />
        </Link>
      </section>

      <section className="history-card">
        {recent.isLoading && (
          <div className="empty-state">
            <span className="spinner" />
            Đang tải lịch sử…
          </div>
        )}
        {recent.isError && (
          <div className="empty-state">
            Chưa kết nối được API. Kiểm tra cấu hình máy chủ.
          </div>
        )}
        {recent.data?.length === 0 && (
          <div className="empty-state">
            <Clock3 size={24} />
            <strong>Chưa có bản ghi nào</strong>
            <span>Bản audio đầu tiên của bạn đang chờ được tạo.</span>
          </div>
        )}
        {recent.data?.map((item) => (
          <div className="history-row" key={item.id}>
            <span className="history-wave"><AudioLines size={18} /></span>
            <div className="history-title">
              <strong>{item.text.slice(0, 64) || 'Nội dung audio'}</strong>
              <small>
                {new Date(item.createdAt).toLocaleString('vi-VN')} · {item.voiceId}
              </small>
            </div>
            <span className={`job-status ${item.status.toLowerCase()}`}>
              {generationStatusLabel(item.status)}
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}
