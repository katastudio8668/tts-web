import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useVoicePreview } from './useVoicePreview';

const { fetchAudioMock } = vi.hoisted(() => ({ fetchAudioMock: vi.fn() }));
vi.mock('../auth/AuthProvider', () => ({ useAuth: () => ({ session: { access_token: 'test-token' } }) }));
vi.mock('../../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../lib/api')>()),
  fetchAudio: fetchAudioMock,
}));

let playSpy: ReturnType<typeof vi.fn>;
let pauseSpy: ReturnType<typeof vi.fn>;
const revokeSpy = vi.fn();

beforeEach(() => {
  playSpy = vi.fn().mockResolvedValue(undefined);
  pauseSpy = vi.fn();
  Object.defineProperty(HTMLMediaElement.prototype, 'play', { configurable: true, value: playSpy });
  Object.defineProperty(HTMLMediaElement.prototype, 'pause', { configurable: true, value: pauseSpy });
  URL.revokeObjectURL = revokeSpy;
  fetchAudioMock.mockImplementation((path: string) => Promise.resolve(`blob:${path}`));
});
afterEach(() => vi.clearAllMocks());

describe('useVoicePreview', () => {
  it('downloads a voice sample once, then replays it from memory', async () => {
    const { result } = renderHook(() => useVoicePreview());
    await act(async () => { await result.current.toggle('bao_kim'); });
    expect(fetchAudioMock).toHaveBeenCalledWith('/voices/bao_kim/preview', 'test-token', expect.objectContaining({ signal: expect.any(AbortSignal) }));
    expect(result.current.playingId).toBe('bao_kim');

    await act(async () => { await result.current.toggle('bao_kim'); });
    expect(result.current.playingId).toBeNull();
    expect(pauseSpy).toHaveBeenCalled();

    await act(async () => { await result.current.toggle('bao_kim'); });
    expect(fetchAudioMock).toHaveBeenCalledTimes(1);
    expect(playSpy).toHaveBeenCalledTimes(2);
  });

  it('encodes the voice id and reports a failed download for that voice', async () => {
    fetchAudioMock.mockRejectedValueOnce(new Error('Máy chủ chưa thể xử lý yêu cầu.'));
    const { result } = renderHook(() => useVoicePreview());
    await act(async () => { await result.current.toggle('a/b'); });
    expect(fetchAudioMock.mock.calls[0][0]).toBe('/voices/a%2Fb/preview');
    expect(result.current.error).toEqual({ voiceId: 'a/b', message: 'Máy chủ chưa thể xử lý yêu cầu.' });
    expect(result.current.playingId).toBeNull();
  });

  it('aborts pending downloads and frees cached audio on unmount', async () => {
    fetchAudioMock.mockImplementationOnce((path: string) => Promise.resolve(`blob:${path}`));
    const { result, unmount } = renderHook(() => useVoicePreview());
    await act(async () => { await result.current.toggle('bao_kim'); });
    fetchAudioMock.mockImplementationOnce(() => new Promise(() => {}));
    act(() => { void result.current.toggle('khanh_vy'); });
    await waitFor(() => expect(result.current.loadingId).toBe('khanh_vy'));
    const signal = fetchAudioMock.mock.calls[1][2].signal as AbortSignal;
    unmount();
    expect(signal.aborted).toBe(true);
    expect(revokeSpy).toHaveBeenCalledWith('blob:/voices/bao_kim/preview');
  });
});
