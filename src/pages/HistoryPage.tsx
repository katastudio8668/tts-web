import { useQuery } from '@tanstack/react-query';
import { Clock3 } from 'lucide-react';
import { useAuth } from '../features/auth/AuthProvider';
import GenerationHistoryItem from '../features/generation/GenerationHistoryItem';
import { apiRequest, type Generation } from '../lib/api';

export default function HistoryPage() {
  const { session } = useAuth();
  const token = session?.access_token ?? '';

  const generations = useQuery({
    queryKey: ['generations'],
    queryFn: () => apiRequest<Generation[]>('/generations', token),
    enabled: Boolean(token),
  });

  return (
    <div className="page-stack">
      <div className="page-title">
        <div className="eyebrow">YOUR LIBRARY</div>
        <h1>Lịch sử tạo giọng nói</h1>
        <p>Quản lý và xem lại những bản audio bạn đã tạo.</p>
      </div>

      <section className="history-card">
        {generations.isLoading && (
          <div className="empty-state">Đang tải…</div>
        )}
        {generations.isError && (
          <div className="empty-state">
            Không thể tải lịch sử. Vui lòng thử lại.
          </div>
        )}
        {generations.data?.length === 0 && (
          <div className="empty-state">
            <Clock3 size={25} />
            <strong>Chưa có bản ghi nào</strong>
            <span>Các bản audio sẽ được lưu tại đây.</span>
          </div>
        )}
        {generations.data?.map((item) => (
          <GenerationHistoryItem key={item.id} item={item} token={token} />
        ))}
      </section>
    </div>
  );
}
