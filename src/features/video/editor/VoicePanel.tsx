import { Mic, Square } from 'lucide-react';
import { useState } from 'react';
import { formatCharacters } from '../../billing/freeTier';
import type { ProjectStatus, VideoSpec, VoiceEstimate, VoiceProgress } from '../types';
import { videoApi } from '../videoApi';
import { VoiceTonePanel } from '../../voice-tone/VoiceTonePanel';

type Props = {
  spec: VideoSpec; status: ProjectStatus | null; token: string; projectId: string;
  voice: { running: boolean; progress: VoiceProgress | null; error: string };
  runVoices: () => Promise<void>; stopVoices: () => void; save: () => Promise<void>;
};

/** Generates the missing scene voices (with an explicit credit confirmation) and fits scene timing to them. */
export function VoicePanel({ spec, status, token, projectId, voice, runVoices, stopVoices, save }: Props) {
  const [estimate, setEstimate] = useState<VoiceEstimate | null>(null);
  const [error, setError] = useState('');
  const missing = status?.scenesNeedingVoice.length ?? 0;
  const noVoiceSelected = spec.scenes.some((scene) => scene.voice && !scene.voice.voiceId) && !spec.defaultVoiceId;
  const progress = voice.progress;

  async function prepare() {
    setError('');
    try {
      await save();
      setEstimate(await videoApi.estimateVoices(token, projectId));
    } catch (failure) {
      setError((failure as Error).message);
    }
  }

  return (
    <div className="voice-panel">
      <div className="voice-panel-head">
        <Mic size={16} />
        <strong>Voice & khớp thời lượng</strong>
        <span>{status ? `${status.voicedScenes - missing}/${status.voicedScenes} cảnh đã có voice` : ''}</span>
      </div>
      <VoiceTonePanel token={token} />
      {voice.running ? (
        <div className="voice-progress" role="status">
          <span className="spinner" />
          <span>Đang tạo voice {progress ? `${progress.readyScenes}/${progress.voicedScenes}` : ''}… Thời lượng cảnh tự khớp theo voice.</span>
          <button type="button" className="secondary-button small" onClick={stopVoices}><Square size={12} /> Dừng</button>
        </div>
      ) : missing === 0 ? (
        <p className="vf-hint">{status?.voicedScenes ? 'Tất cả voice đã sẵn sàng; thời lượng cảnh đã khớp.' : 'Thêm lời đọc vào cảnh để tạo voice.'}</p>
      ) : estimate ? (
        <div className="voice-confirm">
          <span>Tạo {estimate.scenes} voice · {formatCharacters(estimate.characters)} ký tự · khoảng <strong>{formatCharacters(estimate.estimatedCredits)} credit</strong>. {estimate.note}</span>
          <div className="form-actions">
            <button type="button" className="primary-button" onClick={() => { setEstimate(null); void runVoices(); }}>Đồng ý, tạo voice</button>
            <button type="button" className="secondary-button" onClick={() => setEstimate(null)}>Hủy</button>
          </div>
        </div>
      ) : (
        <button type="button" className="primary-button" disabled={noVoiceSelected} onClick={() => void prepare()}>
          Tạo {missing} voice và khớp thời lượng
        </button>
      )}
      {noVoiceSelected && !voice.running && missing > 0 && <p className="inline-error">Chọn giọng mặc định ở thẻ Video trước.</p>}
      {progress?.blockedReason && <p className="inline-error" role="alert">{progress.blockedReason}</p>}
      {progress?.failed.map((item) => <p key={item.sceneId} className="inline-error">Cảnh {item.sceneId}: {item.reason}</p>)}
      {(voice.error || error) && <p className="inline-error" role="alert">{voice.error || error}</p>}
    </div>
  );
}
