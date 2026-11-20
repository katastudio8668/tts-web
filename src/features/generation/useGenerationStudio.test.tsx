import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useGenerationStudio } from './useGenerationStudio';

const { apiRequestMock, fetchAudioMock } = vi.hoisted(() => ({
  apiRequestMock: vi.fn(),
  fetchAudioMock: vi.fn(),
}));

vi.mock('../auth/AuthProvider', () => ({
  useAuth: () => ({ session: { access_token: 'test-token' } }),
}));

vi.mock('../../lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../lib/api')>();
  return {
    ...actual,
    apiRequest: apiRequestMock,
    fetchAudio: fetchAudioMock,
  };
});

const createdJob = {
  id: 'job-1',
  status: 'QUEUED' as const,
  text: 'Xin chào',
  textCharacters: 8,
  voiceId: 'voice-1',
  createdAt: '2026-11-20T09:00:00.000Z',
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('useGenerationStudio', () => {
  it('loads voices and reuses the idempotency key when retrying an unchanged request', async () => {
    apiRequestMock.mockImplementation((path: string, _token: string, init?: RequestInit) => {
      if (path === '/voices') {
        return Promise.resolve([
          { id: 'voice-1', displayName: 'Giọng mẫu', language: 'vi' },
        ]);
      }
      if (path === '/generations' && init?.method === 'POST') {
        return Promise.resolve(createdJob);
      }
      if (path === '/generations/job-1') {
        return new Promise(() => {});
      }
      return Promise.resolve(null);
    });

    const { result } = renderHook(() => useGenerationStudio(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.voices.data).toHaveLength(1));
    act(() => {
      result.current.setText('Xin chào');
      result.current.setVoiceId('voice-1');
    });

    await act(async () => {
      result.current.submitGeneration();
    });
    await waitFor(() => expect(result.current.job?.id).toBe('job-1'));

    const firstPost = apiRequestMock.mock.calls.find(
      ([path, , init]) => path === '/generations' && init?.method === 'POST',
    );
    expect(firstPost).toBeDefined();

    await act(async () => {
      result.current.submitGeneration();
    });

    const postCalls = apiRequestMock.mock.calls.filter(
      ([path, , init]) => path === '/generations' && init?.method === 'POST',
    );
    expect(postCalls).toHaveLength(2);
    expect(new Headers(postCalls[0][2].headers).get('Idempotency-Key'))
      .toBe(new Headers(postCalls[1][2].headers).get('Idempotency-Key'));
    expect(JSON.parse(postCalls[0][2].body as string)).toEqual({
      text: 'Xin chào',
      voiceId: 'voice-1',
      language: 'vi',
      speed: 1,
      totalSteps: 32,
    });
  });
  it('aborts an in-flight audio download when the studio unmounts', async () => {
    apiRequestMock.mockImplementation((path: string, _token: string, init?: RequestInit) => {
      if (path === '/generations' && init?.method === 'POST') {
        return Promise.resolve({ ...createdJob, status: 'SUCCEEDED' });
      }
      return Promise.resolve([]);
    });
    fetchAudioMock.mockImplementation(
      (_path: string, _token: string, _init?: RequestInit) => new Promise(() => {}),
    );

    const { result, unmount } = renderHook(() => useGenerationStudio(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.submitGeneration();
    });
    await waitFor(() => expect(result.current.job?.id).toBe('job-1'));

    act(() => {
      void result.current.playAudio();
    });
    await waitFor(() => expect(fetchAudioMock).toHaveBeenCalledTimes(1));
    const requestSignal = fetchAudioMock.mock.calls[0][2].signal as AbortSignal;

    unmount();

    expect(requestSignal.aborted).toBe(true);
  });

});
