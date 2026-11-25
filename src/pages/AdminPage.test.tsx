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

const defaultSettings = {
  maxTextCharacters: 3500,
  creditsPerCharacter: 5,
  weeklyCredits: 30000,
  updatedAt: '2026-11-24T09:00:00.000Z',
  updatedBy: null,
};

function mockApi(role: string) {
  apiRequestMock.mockImplementation(async (path: string, _token: string, init?: RequestInit) => {
    if (path === '/me') return { id: 'u1', role };
    if (path === '/admin/generation-settings' && init?.method === 'PUT') {
      return { ...defaultSettings, ...JSON.parse(String(init.body)), updatedAt: '2026-11-24T10:00:00.000Z', updatedBy: 'u1' };
    }
    if (path === '/admin/generation-settings') return defaultSettings;
    if (path === '/admin/tts-groups') return { enabledGroups: [2], updatedAt: '2026-11-24T09:00:00.000Z', updatedBy: null };
    if (path === '/admin/video-limits') return { maxDurationSeconds: 60, updatedAt: '2026-11-24T09:00:00.000Z', updatedBy: null };
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

describe('AdminPage generation settings', () => {
  it('blocks non-admin users without loading admin settings', async () => {
    mockApi('USER');
    renderPage();
    expect(await screen.findByText('Không có quyền truy cập')).toBeInTheDocument();
    expect(apiRequestMock).not.toHaveBeenCalledWith('/admin/generation-settings', expect.anything());
  });

  it('loads and saves all three settings together', async () => {
    mockApi('ADMIN');
    renderPage();
    const maxCharacters = await screen.findByLabelText(/Số ký tự tối đa/);
    const rate = screen.getByLabelText(/Giá credit cơ bản/);
    const freeCredits = screen.getByLabelText(/Credit miễn phí/);
    expect(maxCharacters).toHaveValue(3500);
    expect(rate).toHaveValue(5);
    expect(freeCredits).toHaveValue(30000);

    await userEvent.clear(maxCharacters);
    await userEvent.type(maxCharacters, '4200');
    await userEvent.clear(rate);
    await userEvent.type(rate, '6.5');
    await userEvent.clear(freeCredits);
    await userEvent.type(freeCredits, '45000');
    await userEvent.click(screen.getByRole('button', { name: 'Lưu cấu hình' }));

    expect(await screen.findByText('Đã lưu.')).toBeInTheDocument();
    expect(apiRequestMock).toHaveBeenCalledWith('/admin/generation-settings', 'test-token', {
      method: 'PUT',
      body: JSON.stringify({ maxTextCharacters: 4200, creditsPerCharacter: 6.5, weeklyCredits: 45000 }),
    });
  });

  it('rejects invalid limits and rates before calling the API', async () => {
    mockApi('ADMIN');
    renderPage();
    const maxCharacters = await screen.findByLabelText(/Số ký tự tối đa/);
    await userEvent.clear(maxCharacters);
    await userEvent.type(maxCharacters, '0');
    expect(screen.getByRole('button', { name: 'Lưu cấu hình' })).toBeDisabled();
    expect(apiRequestMock).not.toHaveBeenCalledWith('/admin/generation-settings', 'test-token', expect.objectContaining({ method: 'PUT' }));
  });
});
