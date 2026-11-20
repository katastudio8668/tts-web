import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';
import {
  getPaymentPollingInterval,
  PAYMENT_POLL_MAX_DURATION_MS,
} from '../features/billing/paymentPolling';
import {
  formatVnd,
  paymentStatusLabel,
} from '../features/billing/billingPresentation';
import { apiRequest, type PaymentOrder } from '../lib/api';

export default function PaymentResultPage() {
  const { session } = useAuth();
  const token = session?.access_token ?? '';
  const [params] = useSearchParams();
  const orderCode = params.get('orderCode') ?? '';
  const [pollingStartedAt, setPollingStartedAt] = useState<number | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    setPollingStartedAt(orderCode ? Date.now() : null);
  }, [orderCode]);

  const orderQuery = useQuery({
    queryKey: ['payment-order', orderCode],
    queryFn: () => apiRequest<PaymentOrder>(
      `/payments/orders/${encodeURIComponent(orderCode)}`,
      token,
    ),
    enabled: Boolean(token && orderCode),
    refetchInterval: (query) => getPaymentPollingInterval(
      query.state.data?.status,
      pollingStartedAt,
      Date.now(),
    ),
  });

  useEffect(() => {
    if (orderQuery.data?.status === 'PAID') {
      void queryClient.invalidateQueries({ queryKey: ['usage'] });
      void queryClient.invalidateQueries({ queryKey: ['payment-orders'] });
    }
  }, [orderQuery.data?.status, queryClient]);

  const order = orderQuery.data;
  const paid = order?.status === 'PAID';
  const pending = order?.status === 'PENDING';
  const pollingInterval = order
    ? getPaymentPollingInterval(order.status, pollingStartedAt, Date.now())
    : false;

  return (
    <div className="page-stack payment-result-page">
      <div className="page-title">
        <div className="eyebrow">PAYMENT STATUS</div>
        <h1>Kết quả thanh toán</h1>
        <p>Trạng thái đơn hàng được xác nhận từ máy chủ KATA.</p>
      </div>

      <section className="panel payment-result-card">
        {!orderCode && (
          <>
            <AlertCircle size={38} className="result-warning" />
            <h2>Thiếu mã đơn hàng</h2>
            <p>Không tìm thấy mã đơn trong đường dẫn trả về.</p>
          </>
        )}

        {orderCode && orderQuery.isLoading && (
          <>
            <LoaderCircle size={38} className="spin-icon result-icon-large" />
            <h2>Đang kiểm tra giao dịch</h2>
            <p>Đang truy vấn trạng thái đơn hàng từ máy chủ.</p>
          </>
        )}

        {orderQuery.isError && (
          <>
            <AlertCircle size={38} className="result-warning" />
            <h2>Chưa thể xác minh đơn hàng</h2>
            <p>{orderQuery.error.message}</p>
            <button
              className="secondary-button"
              onClick={() => void orderQuery.refetch()}
            >
              <RefreshCw size={15} />
              Thử lại
            </button>
          </>
        )}

        {order && (
          <>
            <div className={`payment-result-symbol ${paid ? 'success' : pending ? 'waiting' : 'failure'}`}>
              {paid
                ? <CheckCircle2 size={40} />
                : pending
                  ? <Clock3 size={40} />
                  : <XCircle size={40} />}
            </div>

            <h2>
              {paid
                ? 'Thanh toán thành công'
                : pending
                  ? 'Đang chờ xác nhận thanh toán'
                  : paymentStatusLabel(order.status)}
            </h2>
            <p>
              {paid
                ? 'Credit đã được ghi nhận vào tài khoản của bạn.'
                : pending
                  ? 'VNPay đã chuyển bạn trở lại. Hệ thống đang chờ xác nhận IPN từ ngân hàng. Trạng thái sẽ tự động cập nhật.'
                  : 'Giao dịch chưa hoàn tất. Bạn có thể quay lại trang nạp credit để tạo đơn mới.'}
            </p>

            <div className="result-order-summary">
              <div>
                <span>Mã đơn hàng</span>
                <strong>{order.orderCode}</strong>
              </div>
              <div>
                <span>Số tiền</span>
                <strong>{formatVnd(order.amountVnd)}</strong>
              </div>
              <div>
                <span>Credit</span>
                <strong>{order.credits.toLocaleString('vi-VN')}</strong>
              </div>
              <div>
                <span>Trạng thái</span>
                <strong className={`payment-status ${paid ? 'paid' : pending ? 'pending' : 'failed'}`}>
                  {paymentStatusLabel(order.status)}
                </strong>
              </div>
            </div>

            {pending && (
              <div className="pending-note" role="status">
                <LoaderCircle
                  size={16}
                  className={pollingInterval === false ? '' : 'spin-icon'}
                />
                {pollingInterval === false
                  ? 'Đã dừng tự kiểm tra tự động sau 2 phút. Bạn có thể kiểm tra lại thủ công bất cứ lúc nào.'
                  : `Đang tự kiểm tra mỗi 5 giây (tối đa ${PAYMENT_POLL_MAX_DURATION_MS / 60000} phút). Bạn có thể làm mới thủ công.`}
              </div>
            )}

            {paid && (
              <div className="confirmed-note">
                <ShieldCheck size={16} />
                Đã được máy chủ xác nhận. Số dư credit đã được cập nhật.
              </div>
            )}

            <div className="result-actions">
              <Link className="primary-button" to="/plans">
                Quay lại nạp credit
              </Link>
              <Link className="secondary-button" to="/">
                Về tổng quan
              </Link>
              {pending && (
                <button
                  className="icon-button result-refresh"
                  onClick={() => void orderQuery.refetch()}
                  aria-label="Làm mới trạng thái"
                >
                  <RefreshCw size={17} />
                </button>
              )}
            </div>
          </>
        )}

        {orderQuery.isError && (
          <Link className="secondary-button" to="/plans">
            <ArrowLeft size={15} />
            Quay lại
          </Link>
        )}
      </section>
    </div>
  );
}
