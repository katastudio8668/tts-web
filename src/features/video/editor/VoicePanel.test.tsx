import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { blankSpec } from '../specEditing';
import { VoicePanel } from './VoicePanel';

const { estimateMock } = vi.hoisted(() => ({ estimateMock: vi.fn() }));
vi.mock('../videoApi', () => ({ videoApi: { estimateVoices: estimateMock } }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

const status = { durationSeconds: 4, sceneCount: 1, voicedScenes: 1, scenesNeedingVoice: ['s1'], voiceCharacters: 20, localAssetsNeeded: [] };

describe('VoicePanel', () => {
  it('shows the credit estimate and only generates after the user agrees', async () => {
    estimateMock.mockResolvedValue({ scenes: 1, characters: 20, estimatedCredits: 20, availableCredits: 100, note: 'Free credits first.' });
    const runVoices = vi.fn(async () => undefined);
    const spec = { ...blankSpec('Demo', '9:16'), defaultVoiceId: 'g2_adam' };
    render(<VoicePanel spec={spec} status={status} token="t" projectId="p1" voice={{ running: false, progress: null, error: '' }}
      runVoices={runVoices} stopVoices={vi.fn()} save={vi.fn(async () => undefined)} />);
    await userEvent.click(screen.getByRole('button', { name: /Tạo 1 voice/ }));
    expect(await screen.findByText(/20 credit/)).toBeInTheDocument();
    expect(runVoices).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Đồng ý, tạo voice' }));
    expect(runVoices).toHaveBeenCalledTimes(1);
  });

  it('asks for a default voice before anything can be generated', () => {
    const spec = blankSpec('Demo', '9:16');
    const withVoice = { ...spec, scenes: [{ ...spec.scenes[0], voice: { text: 'Xin chào', voiceId: null, generationId: null, textHash: null, durationSeconds: null } }] };
    render(<VoicePanel spec={withVoice} status={status} token="t" projectId="p1" voice={{ running: false, progress: null, error: '' }}
      runVoices={vi.fn()} stopVoices={vi.fn()} save={vi.fn(async () => undefined)} />);
    expect(screen.getByRole('button', { name: /Tạo 1 voice/ })).toBeDisabled();
    expect(screen.getByText(/Chọn giọng mặc định/)).toBeInTheDocument();
  });
});
