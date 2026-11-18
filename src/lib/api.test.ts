import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiRequest } from './api';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('apiRequest', () => {
  it('uses the versioned local API base URL and attaches the bearer token', async () => {
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
