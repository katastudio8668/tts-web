import { describe, expect, it } from 'vitest';
import {
  getPaymentPollingInterval,
  PAYMENT_POLL_INTERVAL_MS,
  PAYMENT_POLL_MAX_DURATION_MS,
} from './paymentPolling';

describe('getPaymentPollingInterval', () => {
  it('polls pending orders every five seconds while inside the time limit', () => {
    expect(getPaymentPollingInterval('PENDING', 1_000, 1_000 + 30_000))
      .toBe(PAYMENT_POLL_INTERVAL_MS);
  });

  it('stops polling when the two-minute limit is reached', () => {
    expect(getPaymentPollingInterval(
      'PENDING',
      1_000,
      1_000 + PAYMENT_POLL_MAX_DURATION_MS,
    )).toBe(false);
  });

  it('does not poll terminal orders or before the polling clock starts', () => {
    expect(getPaymentPollingInterval('PAID', 1_000, 2_000)).toBe(false);
    expect(getPaymentPollingInterval('PENDING', null, 2_000)).toBe(false);
  });
});
