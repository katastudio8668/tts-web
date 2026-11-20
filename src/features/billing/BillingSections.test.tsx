import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { CreditPackagesSection, PaymentHistorySection } from './BillingSections';
import type { CreditPackage, PaymentOrder } from '../../lib/api';

const creditPackage: CreditPackage = {
  id: 'pkg-1',
  code: 'credits-100',
  name: 'Gói 100',
  description: 'Dùng thử',
  priceVnd: 50000,
  credits: 100,
};

const order: PaymentOrder = {
  id: 'order-1',
  orderCode: 'KORVA-ORDER-1',
  amountVnd: 50000,
  credits: 100,
  currency: 'VND',
  provider: 'VNPAY',
  status: 'PAID',
  expiresAt: '2026-11-20T10:00:00.000Z',
  createdAt: '2026-11-20T09:00:00.000Z',
  updatedAt: '2026-11-20T09:01:00.000Z',
};

describe('BillingSections', () => {
  it('renders a package and sends the selected package to the purchase handler', () => {
    const onBuy = vi.fn();
    render(
      <CreditPackagesSection
        packages={[creditPackage]}
        isLoading={false}
        isError={false}
        isPurchasing={false}
        busyCode=""
        onRetry={vi.fn()}
        onBuy={onBuy}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Mua gói này/i }));
    expect(onBuy).toHaveBeenCalledWith(creditPackage);
  });

  it('renders payment history status and its order details link', () => {
    render(
      <MemoryRouter>
        <PaymentHistorySection orders={[order]} isLoading={false} isError={false} />
      </MemoryRouter>,
    );

    expect(screen.getByText('KORVA-ORDER-1')).toBeInTheDocument();
    expect(screen.getByText('Đã thanh toán')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Xem đơn KORVA-ORDER-1' }))
      .toHaveAttribute('href', '/payment/result?orderCode=KORVA-ORDER-1');
  });
});
