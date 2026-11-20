import {
  ArrowUpRight,
  Check,
  Clock3,
  CreditCard,
  History,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  formatVnd,
  paymentStatusLabel,
  type CreditPackage,
  type PaymentOrder,
  type Plan,
  type Usage,
} from '../../lib/api';

function orderTone(status: PaymentOrder['status']) {
  return status === 'PAID'
    ? 'paid'
    : status === 'FAILED' || status === 'EXPIRED' || status === 'CANCELLED'
      ? 'failed'
      : 'pending';
}

export function UsageBalanceCard({
  usage,
  onRefresh,
}: {
  usage: Usage | undefined;
  onRefresh: () => void;
}) {
  return (
    <section className="usage-highlight">
      <div className="usage-icon"><Wallet size={22} /></div>
      <div>
        <span>Credit khả dụng</span>
        <strong>{usage?.balance?.toLocaleString('vi-VN') ?? '—'}</strong>
      </div>
      <small>{usage?.planName ?? 'Tín dụng mua thêm không phải gói thuê bao'}</small>
      <button className="secondary-button balance-refresh" onClick={onRefresh}>
        <RefreshCw size={14} /> Làm mới
      </button>
    </section>
  );
}

export function CreditPackagesSection({
  packages,
  isLoading,
  isError,
  isPurchasing,
  busyCode,
  purchaseError,
  onRetry,
  onBuy,
}: {
  packages: CreditPackage[] | undefined;
  isLoading: boolean;
  isError: boolean;
  isPurchasing: boolean;
  busyCode: string;
  purchaseError?: string;
  onRetry: () => void;
  onBuy: (pkg: CreditPackage) => void;
}) {
  return (
    <section className="billing-section">
      <div className="billing-heading">
        <div>
          <span className="eyebrow">CHỌN GÓI NẠP</span>
          <h2>Thêm credit vào tài khoản</h2>
          <p>Giá và số credit được xác định từ máy chủ.</p>
        </div>
        <span className="secure-note"><ShieldCheck size={15} /> Thanh toán bảo mật</span>
      </div>
      {isLoading && <div className="billing-state"><LoaderCircle className="spin-icon" /> Đang tải gói nạp…</div>}
      {isError && (
        <div className="billing-state error">
          Không tải được danh sách gói nạp. <button className="text-link" onClick={onRetry}>Thử lại</button>
        </div>
      )}
      {packages?.length === 0 && <div className="billing-state">Hiện chưa có gói credit được mở bán.</div>}
      <div className="credit-package-grid">
        {packages?.map((pkg, index) => (
          <article className={`credit-package-card ${index === 1 ? 'featured' : ''}`} key={pkg.id}>
            {index === 1 && <span className="package-ribbon">Được lựa chọn</span>}
            <div className="package-symbol"><Sparkles size={19} /></div>
            <h3>{pkg.name}</h3>
            <strong className="package-credits">{pkg.credits.toLocaleString('vi-VN')} <small>credit</small></strong>
            <p>{pkg.description || 'Bổ sung credit vào số dư tài khoản KATA TTS.'}</p>
            <div className="package-price">{formatVnd(pkg.priceVnd)}</div>
            <button className="primary-button package-buy" disabled={isPurchasing} onClick={() => onBuy(pkg)}>
              {busyCode === pkg.code && isPurchasing
                ? <><LoaderCircle size={16} className="spin-icon" /> Đang tạo đơn…</>
                : <>Mua gói này <ArrowUpRight size={16} /></>}
            </button>
          </article>
        ))}
      </div>
      {purchaseError && <p className="inline-error" role="alert">{purchaseError}</p>}
      <div className="billing-footnote">
        <ShieldCheck size={16} />
        <span>Chúng tôi chỉ chuyển bạn sang cổng VNPay sau khi máy chủ tạo đơn. Credit chỉ được cộng khi máy chủ xác nhận IPN hợp lệ.</span>
      </div>
    </section>
  );
}

export function SubscriptionPlansSection({ plans }: { plans: Plan[] | undefined }) {
  return (
    <section className="billing-section plan-section">
      <div className="billing-heading">
        <div>
          <span className="eyebrow">SUBSCRIPTION</span>
          <h2>Gói dịch vụ hiện tại</h2>
          <p>Quyền sử dụng và giới hạn theo gói.</p>
        </div>
      </div>
      <div className="plan-grid">
        {plans?.map((plan) => (
          <article className="plan-card" key={plan.id}>
            <span className="eyebrow">{plan.code}</span>
            <h2>{plan.name}</h2>
            <strong>{plan.monthlyCredits.toLocaleString('vi-VN')} <small>credit / tháng</small></strong>
            <ul>
              <li><Check size={15} /> Tối đa {plan.maxCharacters.toLocaleString('vi-VN')} ký tự / lượt</li>
              <li><Check size={15} /> {plan.maxConcurrentJobs} tác vụ đồng thời</li>
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

export function PaymentHistorySection({
  orders,
  isLoading,
  isError,
}: {
  orders: PaymentOrder[] | undefined;
  isLoading: boolean;
  isError: boolean;
}) {
  return (
    <section className="billing-section">
      <div className="billing-heading">
        <div>
          <span className="eyebrow">PAYMENT HISTORY</span>
          <h2>Lịch sử giao dịch</h2>
          <p>Theo dõi trạng thái các lần nạp credit.</p>
        </div>
        <span className="history-count"><History size={15} />{orders?.length ?? 0} giao dịch</span>
      </div>
      {isLoading && <div className="billing-state">Đang tải lịch sử giao dịch…</div>}
      {isError && <div className="billing-state error">Không tải được lịch sử giao dịch.</div>}
      {orders?.length === 0 && <div className="billing-state"><Clock3 size={22} /> Chưa có giao dịch nào.</div>}
      {orders && orders.length > 0 && (
        <div className="payment-order-list">
          {orders.map((order) => (
            <div className="payment-order-row" key={order.id}>
              <div className="order-leading">
                <span className="order-icon"><CreditCard size={17} /></span>
                <div>
                  <strong>{order.orderCode}</strong>
                  <small>{new Date(order.createdAt).toLocaleString('vi-VN')}</small>
                </div>
              </div>
              <div className="order-credits">
                <strong>+{order.credits.toLocaleString('vi-VN')}</strong>
                <small>credit</small>
              </div>
              <div className="order-amount">{formatVnd(order.amountVnd)}</div>
              <span className={`payment-status ${orderTone(order.status)}`}>{paymentStatusLabel(order.status)}</span>
              <Link to={`/payment/result?orderCode=${encodeURIComponent(order.orderCode)}`} className="order-detail-link" aria-label={`Xem đơn ${order.orderCode}`}>
                <ArrowUpRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
