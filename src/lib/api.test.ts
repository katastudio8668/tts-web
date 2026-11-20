import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiRequest, fetchAudio } from './api';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('apiRequest', () => {
  it('uses the development API base URL and attaches the bearer token', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'user-1' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiRequest<{ id: string }>('/me', 'access-token')).resolves.toEqual({ id: 'user-1' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://localhost:3058/api/v1/me');
    expect(new Headers(options.headers).get('Authorization')).toBe('Bearer access-token');
  });

  it('fails fast when the production API base URL is missing', async () => {
    vi.resetModules();
    vi.stubEnv('DEV', false);
    vi.stubEnv('PROD', true);
    vi.stubEnv('VITE_API_BASE_URL', '');

    await expect(import('./api')).rejects.toThrow(
      'VITE_API_BASE_URL must be configured outside development.',
    );
  });

  it('normalizes validation arrays from NestJS', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      statusCode: 400,
      message: ['text must be a string', 'voiceId should not be empty'],
    }), { status: 400, headers: { 'Content-Type': 'application/json' } })));

    await expect(apiRequest('/generations', 'token')).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
      message: 'text must be a string, voiceId should not be empty',
    });
  });

  it('returns a clear insufficient-credit message for HTTP 402', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: 'Insufficient credits.' }), {
      status: 402,
      headers: { 'Content-Type': 'application/json' },
    })));

    const request = apiRequest('/generations', 'token');
    await expect(request).rejects.toBeInstanceOf(ApiError);
    await expect(request).rejects.toMatchObject({ status: 402, message: 'Tài khoản không đủ credit để tạo giọng nói.' });
  });
});

describe('fetchAudio', () => {
  it('uses the shared bearer transport and returns a URL for binary audio', async () => {
    const blob = new Blob(['audio-bytes'], { type: 'audio/wav' });
    const fetchMock = vi.fn().mockResolvedValue(new Response(blob, { status: 200 }));
    const createObjectURL = vi.fn(() => 'blob:audio-result');
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL: vi.fn() });

    await expect(fetchAudio('/generations/job-1/audio', 'audio-token'))
      .resolves.toBe('blob:audio-result');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://localhost:3058/api/v1/generations/job-1/audio');
    expect(new Headers(options.headers).get('Authorization')).toBe('Bearer audio-token');
    expect(options.signal).toBeInstanceOf(AbortSignal);
    expect(createObjectURL).toHaveBeenCalledWith(blob);
  });

  it('normalizes server error messages and status just like apiRequest', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      message: ['audio is not ready', 'try again later'],
    }), { status: 409, headers: { 'Content-Type': 'application/json' } })));

    await expect(fetchAudio('/generations/job-1/audio', 'token')).rejects.toMatchObject({
      name: 'ApiError',
      status: 409,
      message: 'audio is not ready, try again later',
    });
  });

  it('normalizes timeout errors but preserves caller cancellation', async () => {
    const timeoutError = new DOMException('The operation timed out', 'TimeoutError');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(timeoutError));

    await expect(fetchAudio('/generations/job-1/audio', 'token')).rejects.toMatchObject({
      name: 'ApiError',
      status: 408,
    });

    const abortError = new DOMException('The operation was aborted', 'AbortError');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError));
    await expect(fetchAudio('/generations/job-1/audio', 'token')).rejects.toBe(abortError);
  });

  it('normalizes network failures into the shared ApiError model', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(fetchAudio('/generations/job-1/audio', 'token')).rejects.toMatchObject({
      name: 'ApiError',
      status: 0,
      message: 'Không thể kết nối máy chủ. Hãy kiểm tra kết nối mạng.',
    });
  });

  it('passes a caller-provided abort signal through the shared transport', async () => {
    const controller = new AbortController();
    let requestSignal: AbortSignal | null = null;
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (_url: string, options: RequestInit) => {
      requestSignal = options.signal as AbortSignal;
      return new Response(new Blob(['audio']), { status: 200 });
    }));

    await fetchAudio('/generations/job-1/audio', 'token', { signal: controller.signal });

    expect(requestSignal).toBeInstanceOf(AbortSignal);
    expect(requestSignal).not.toBe(controller.signal);
    controller.abort();
    expect(requestSignal?.aborted).toBe(true);
  });
});
