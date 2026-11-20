import { describe, expect, it } from 'vitest';
import {
  getPaymentOrdersRefreshInterval,
  PAYMENT_ORDERS_REFRESH_INTERVAL_MS,
} from './paymentOrdersRefresh';
import type { PaymentOrder } from '../../lib/api';

const order = (status: PaymentOrder['status']): PaymentOrder => ({
  id: 'order-1',
  orderCode: 'KORVA-ORDER-1',
  amountVnd: 50_000,
  credits: 100,
  currency: 'VND',
  provider: 'VNPAY',
  status,
  expiresAt: '2026-11-20T10:00:00.000Z',
  createdAt: '2026-11-20T09:00:00.000Z',
  updatedAt: '2026-11-20T09:00:00.000Z',
});

describe('getPaymentOrdersRefreshInterval', () => {
  it('refreshes while at least one payment order is pending', () => {
    expect(getPaymentOrdersRefreshInterval([order('PAID'), order('PENDING')]))
      .toBe(PAYMENT_ORDERS_REFRESH_INTERVAL_MS);
  });

  it('does not refresh when there are no pending orders', () => {
    expect(getPaymentOrdersRefreshInterval([order('PAID'), order('FAILED')])).toBe(false);
    expect(getPaymentOrdersRefreshInterval([])).toBe(false);
    expect(getPaymentOrdersRefreshInterval(undefined)).toBe(false);
  });
});
