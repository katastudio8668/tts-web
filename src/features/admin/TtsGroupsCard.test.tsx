import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TtsGroupsCard } from './TtsGroupsCard';

const { apiRequestMock } = vi.hoisted(() => ({ apiRequestMock: vi.fn() }));
vi.mock('../../lib/api', async (importOriginal) => ({ ...(await importOriginal<typeof import('../../lib/api')>()), apiRequest: apiRequestMock }));

function renderCard() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}><TtsGroupsCard token="t" /></QueryClientProvider>);
}
afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe('TtsGroupsCard', () => {
  it('shows the enabled groups and saves a change', async () => {
    apiRequestMock.mockImplementation(async (_path: string, _token: string, init?: RequestInit) =>
      init?.method === 'PUT' ? { enabledGroups: JSON.parse(String(init.body)).enabledGroups, updatedAt: '', updatedBy: 'u' } : { enabledGroups: [2], updatedAt: '', updatedBy: null });
    renderCard();
    const group1 = await screen.findByRole('checkbox', { name: /TTS Group 1/ });
    const group2 = screen.getByRole('checkbox', { name: /TTS Group 2/ });
    expect(group1).not.toBeChecked();
    expect(group2).toBeChecked();
    await userEvent.click(group1);
    await userEvent.click(screen.getByRole('button', { name: 'Lưu nhóm giọng' }));
    expect(apiRequestMock).toHaveBeenCalledWith('/admin/tts-groups', 't', { method: 'PUT', body: JSON.stringify({ enabledGroups: [1, 2] }) });
    expect(document.body.textContent).not.toMatch(/korva|vieneu/i);
  });

  it('does not allow turning every group off', async () => {
    apiRequestMock.mockResolvedValue({ enabledGroups: [2], updatedAt: '', updatedBy: null });
    renderCard();
    await userEvent.click(await screen.findByRole('checkbox', { name: /TTS Group 2/ }));
    expect(screen.getByRole('button', { name: 'Lưu nhóm giọng' })).toBeDisabled();
  });
});
