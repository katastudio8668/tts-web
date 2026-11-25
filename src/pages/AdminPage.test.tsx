import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AdminPage from './AdminPage';

const { apiRequestMock } = vi.hoisted(() => ({ apiRequestMock: vi.fn() }));

vi.mock('../features/auth/AuthProvider', () => ({
  useAuth: () => ({ session: { access_token: 'test-token' } }),
}));

vi.mock('../lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/api')>();
  return { ...actual, apiRequest: apiRequestMock };
});

function mockApi(role: string, weeklyCredits = 1000) {
  apiRequestMock.mockImplementation(async (path: string, _token: string, init?: RequestInit) => {
    if (path === '/me') return { id: 'u1', role };
    if (path === '/admin/free-tier' && init?.method === 'PUT') {
      return { weeklyCredits: JSON.parse(String(init.body)).weeklyCredits, updatedAt: '2026-11-24T10:00:00.000Z', updatedBy: 'u1' };
    }
    if (path === '/admin/free-tier') return { weeklyCredits, updatedAt: '2026-11-24T09:00:00.000Z', updatedBy: null };
    throw new Error(`unexpected ${path}`);
  });
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter><AdminPage /></MemoryRouter>
    </QueryClientProvider>,
  );
}

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe('AdminPage', () => {
  it('blocks non-admin users without loading admin settings', async () => {
    mockApi('USER');
    renderPage();
    expect(await screen.findByText('Không có quyền truy cập')).toBeInTheDocument();
    expect(apiRequestMock).not.toHaveBeenCalledWith('/admin/free-tier', expect.anything());
  });

  it('loads and saves the weekly free credit allowance', async () => {
    mockApi('ADMIN', 1000);
    renderPage();
    const input = await screen.findByLabelText(/Số credit miễn phí/);
    expect(input).toHaveValue(1000);
    await userEvent.clear(input);
    await userEvent.type(input, '5000');
    await userEvent.click(screen.getByRole('button', { name: 'Lưu cấu hình' }));
    expect(await screen.findByText('Đã lưu.')).toBeInTheDocument();
    expect(apiRequestMock).toHaveBeenCalledWith('/admin/free-tier', 'test-token', {
      method: 'PUT', body: JSON.stringify({ weeklyCredits: 5000 }),
    });
  });

  it('rejects invalid values before calling the API', async () => {
    mockApi('ADMIN', 1000);
    renderPage();
    const input = await screen.findByLabelText(/Số credit miễn phí/);
    await userEvent.clear(input);
    await userEvent.type(input, '-5');
    expect(screen.getByRole('button', { name: 'Lưu cấu hình' })).toBeDisabled();
  });
});
