import { useState } from 'react';
import { getPaymentOrdersRefreshInterval } from './paymentOrdersRefresh';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getPurchaseIntent,
  type PurchaseIntent,
} from './purchaseIntent';
import {
  apiRequest,
  type CreatePaymentOrderResponse,
  type CreditPackage,
  type PaymentOrder,
  type Plan,
  type Usage,
} from '../../lib/api';

export function usePlansBilling(token: string) {
  const queryClient = useQueryClient();
  const [busyCode, setBusyCode] = useState('');
  const [pendingIntent, setPendingIntent] = useState<PurchaseIntent | null>(null);

  const plans = useQuery({
    queryKey: ['plans'],
    queryFn: () => apiRequest<Plan[]>('/plans', token),
    enabled: Boolean(token),
  });
  const usage = useQuery({
    queryKey: ['usage'],
    queryFn: () => apiRequest<Usage>('/usage', token),
    enabled: Boolean(token),
  });
  const packages = useQuery({
    queryKey: ['credit-packages'],
    queryFn: () => apiRequest<CreditPackage[]>('/credit-packages', token),
    enabled: Boolean(token),
  });
  const orders = useQuery({
    queryKey: ['payment-orders'],
    queryFn: () => apiRequest<PaymentOrder[]>('/payments/orders', token),
    enabled: Boolean(token),
    refetchInterval: (query) => getPaymentOrdersRefreshInterval(query.state.data),
  });

  const purchase = useMutation({
    mutationFn: (request: { packageCode: string; idempotencyKey: string }) =>
      apiRequest<CreatePaymentOrderResponse>('/payments/orders', token, {
        method: 'POST',
        headers: { 'Idempotency-Key': request.idempotencyKey },
        body: JSON.stringify({ packageCode: request.packageCode }),
      }),
    onSuccess: async (result, variables) => {
      setPendingIntent((current) =>
        current?.idempotencyKey === variables.idempotencyKey ? null : current,
      );
      await queryClient.invalidateQueries({ queryKey: ['payment-orders'] });
      if (result.paymentUrl) {
        window.location.assign(result.paymentUrl);
      } else {
        setBusyCode('');
        await queryClient.invalidateQueries({ queryKey: ['usage'] });
      }
    },
    onError: () => setBusyCode(''),
  });

  function buy(pkg: CreditPackage) {
    const intent = getPurchaseIntent(pendingIntent, pkg.code);
    setPendingIntent(intent);
    setBusyCode(pkg.code);
    purchase.mutate(intent);
  }

  function refreshBilling() {
    void queryClient.invalidateQueries({ queryKey: ['usage'] });
    void queryClient.invalidateQueries({ queryKey: ['payment-orders'] });
  }

  return { plans, usage, packages, orders, purchase, busyCode, buy, refreshBilling };
}
