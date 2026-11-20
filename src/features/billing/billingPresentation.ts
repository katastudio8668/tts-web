import type { PaymentOrder } from '../../lib/api';

export function paymentStatusLabel(status: PaymentOrder['status']): string {
  return {
    PENDING: 'Chờ thanh toán',
    PAID: 'Đã thanh toán',
    FAILED: 'Thanh toán thất bại',
    EXPIRED: 'Đã hết hạn',
    CANCELLED: 'Đã hủy',
  }[status];
}

export function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}
