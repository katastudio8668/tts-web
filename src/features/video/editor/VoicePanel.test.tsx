import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type React from 'react';
import { blankSpec } from '../specEditing';
import { VoicePanel } from './VoicePanel';

const { estimateMock, apiRequestMock } = vi.hoisted(() => ({ estimateMock: vi.fn(), apiRequestMock: vi.fn() }));
vi.mock('../videoApi', () => ({ videoApi: { estimateVoices: estimateMock } }));
vi.mock('../../../lib/api', async (importOriginal) => ({ ...(await importOriginal<typeof import('../../../lib/api')>()), apiRequest: apiRequestMock }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

const status = { durationSeconds: 4, sceneCount: 1, voicedScenes: 1, scenesNeedingVoice: ['s1'], voiceCharacters: 20, localAssetsNeeded: [] };

function withQueryClient(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{ui}</QueryClientProvider>;
}

describe('VoicePanel', () => {
  it('shows the credit estimate and only generates after the user agrees', async () => {
    estimateMock.mockResolvedValue({ scenes: 1, characters: 20, estimatedCredits: 20, availableCredits: 100, note: 'Free credits first.' });
    const runVoices = vi.fn(async () => undefined);
    const spec = { ...blankSpec('Demo', '9:16'), defaultVoiceId: 'g2_adam' };
    apiRequestMock.mockImplementation(async (path: string) => (path === '/voice-tone/catalog'
      ? { groups: [{ id: 'tone', label: { vi: 'Sắc giọng', en: 'Tone' } }], effects: [{ id: 'original', group: 'tone', label: { vi: 'Gốc', en: 'Original' }, hint: { vi: '', en: '' } }] }
      : { id: 'original', intensity: 0.7 }));
    render(withQueryClient(<VoicePanel spec={spec} status={status} token="t" projectId="p1" voice={{ running: false, progress: null, error: '' }}
      runVoices={runVoices} stopVoices={vi.fn()} save={vi.fn(async () => undefined)} />));
    await userEvent.click(screen.getByRole('button', { name: /Tạo 1 voice/ }));
    expect(await screen.findByText(/20 credit/)).toBeInTheDocument();
    expect(runVoices).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Đồng ý, tạo voice' }));
    expect(runVoices).toHaveBeenCalledTimes(1);
  });

  it('asks for a default voice before anything can be generated', () => {
    const spec = blankSpec('Demo', '9:16');
    const withVoice = { ...spec, scenes: [{ ...spec.scenes[0], voice: { text: 'Xin chào', voiceId: null, generationId: null, textHash: null, durationSeconds: null } }] };
    apiRequestMock.mockImplementation(async (path: string) => (path === '/voice-tone/catalog'
      ? { groups: [{ id: 'tone', label: { vi: 'Sắc giọng', en: 'Tone' } }], effects: [{ id: 'original', group: 'tone', label: { vi: 'Gốc', en: 'Original' }, hint: { vi: '', en: '' } }] }
      : { id: 'original', intensity: 0.7 }));
    render(withQueryClient(<VoicePanel spec={withVoice} status={status} token="t" projectId="p1" voice={{ running: false, progress: null, error: '' }}
      runVoices={vi.fn()} stopVoices={vi.fn()} save={vi.fn(async () => undefined)} />));
    expect(screen.getByRole('button', { name: /Tạo 1 voice/ })).toBeDisabled();
    expect(screen.getByText(/Chọn giọng mặc định/)).toBeInTheDocument();
  });
});
