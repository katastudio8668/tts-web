import { useAuth } from '../features/auth/AuthProvider';
import {
  CreditPackagesSection,
  PaymentHistorySection,
  SubscriptionPlansSection,
  UsageBalanceCard,
} from '../features/billing/BillingSections';
import { usePlansBilling } from '../features/billing/usePlansBilling';

export default function PlansPage() {
  const { session } = useAuth();
  const billing = usePlansBilling(session?.access_token ?? '');

  return (
    <div className="page-stack">
      <div className="page-title">
        <div className="eyebrow">CREDIT & BILLING</div>
        <h1>Nạp credit</h1>
        <p>Mua thêm tín dụng để tiếp tục sáng tạo giọng nói. Thanh toán một lần qua VNPay.</p>
      </div>

      <UsageBalanceCard
        usage={billing.usage.data}
        onRefresh={billing.refreshBilling}
      />

      <CreditPackagesSection
        packages={billing.packages.data}
        isLoading={billing.packages.isLoading}
        isError={billing.packages.isError}
        isPurchasing={billing.purchase.isPending}
        busyCode={billing.busyCode}
        purchaseError={billing.purchase.error?.message}
        onRetry={() => void billing.packages.refetch()}
        onBuy={billing.buy}
      />

      <SubscriptionPlansSection plans={billing.plans.data} />

      <PaymentHistorySection
        orders={billing.orders.data}
        isLoading={billing.orders.isLoading}
        isError={billing.orders.isError}
      />
    </div>
  );
}
