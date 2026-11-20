import { describe, expect, it } from 'vitest';
import { formatVnd, paymentStatusLabel } from './billingPresentation';

describe('paymentStatusLabel', () => {
  it.each([
    ['PENDING', 'Chờ thanh toán'],
    ['PAID', 'Đã thanh toán'],
    ['FAILED', 'Thanh toán thất bại'],
    ['EXPIRED', 'Đã hết hạn'],
    ['CANCELLED', 'Đã hủy'],
  ] as const)('maps %s to its Vietnamese label', (status, label) => {
    expect(paymentStatusLabel(status)).toBe(label);
  });
});

describe('formatVnd', () => {
  it('formats Vietnamese dong without decimal places', () => {
    expect(formatVnd(125000)).toContain('125.000');
    expect(formatVnd(125000)).toContain('₫');
  });
});
