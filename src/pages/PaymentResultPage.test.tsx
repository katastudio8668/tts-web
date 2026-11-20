import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PaymentResultPage from './PaymentResultPage';
import type { PaymentOrder } from '../lib/api';

const { apiRequestMock } = vi.hoisted(() => ({
  apiRequestMock: vi.fn(),
}));

vi.mock('../features/auth/AuthProvider', () => ({
  useAuth: () => ({ session: { access_token: 'test-token' } }),
}));

vi.mock('../lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/api')>();
  return { ...actual, apiRequest: apiRequestMock };
});

const createOrder = (status: PaymentOrder['status']): PaymentOrder => ({
  id: 'order-1',
  orderCode: 'KATA-ORDER-1',
  amountVnd: 125000,
  credits: 500,
  currency: 'VND',
  provider: 'VNPAY',
  status,
  expiresAt: '2026-11-20T10:00:00.000Z',
  createdAt: '2026-11-20T09:00:00.000Z',
  updatedAt: '2026-11-20T09:01:00.000Z',
});

function renderPage(orderCode = 'KATA-ORDER-1') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/payment/result?orderCode=${orderCode}`]}>
        <PaymentResultPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('PaymentResultPage', () => {
  it('renders the server-confirmed paid result and order summary', async () => {
    apiRequestMock.mockResolvedValueOnce(createOrder('PAID'));
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Thanh toán thành công' }))
      .toBeInTheDocument();
    expect(screen.getByText('KATA-ORDER-1')).toBeInTheDocument();
    expect(screen.getByText('125.000', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Đã thanh toán')).toBeInTheDocument();
  });

  it('explains that a pending VNPay order is awaiting IPN confirmation', async () => {
    apiRequestMock.mockResolvedValueOnce(createOrder('PENDING'));
    renderPage();

    expect(await screen.findByRole('heading', {
      name: 'Đang chờ xác nhận thanh toán',
    })).toBeInTheDocument();
    expect(screen.getByText(/đang chờ xác nhận IPN từ ngân hàng/i)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/tự kiểm tra mỗi 5 giây/i);
  });
});
