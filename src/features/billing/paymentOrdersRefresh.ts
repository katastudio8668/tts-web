import type { PaymentOrder } from '../../lib/api';

export const PAYMENT_ORDERS_REFRESH_INTERVAL_MS = 30_000;

export function getPaymentOrdersRefreshInterval(
  orders: PaymentOrder[] | undefined,
): number | false {
  if (!orders?.some((order) => order.status === 'PENDING')) return false;
  return PAYMENT_ORDERS_REFRESH_INTERVAL_MS;
}
