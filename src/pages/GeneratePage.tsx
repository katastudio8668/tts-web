import {
  AudioLines,
  Download,
  Loader2,
  Play,
  Sparkles,
  Square,
  WandSparkles,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';
import { formatCharacters, freeTierSummary } from '../features/billing/freeTier';
import { apiRequest, type Usage } from '../lib/api';
import { generationStatusLabel } from '../features/generation/generationPresentation';
import { useGenerationStudio } from '../features/generation/useGenerationStudio';
import { useVoicePreview } from '../features/generation/useVoicePreview';
import { VoicePicker } from '../features/generation/VoicePicker';
import { EMOTION_CUES } from '../features/generation/sampleText';
import { estimateCredits, voiceLabel } from '../features/generation/voiceCatalog';
import { LocalFolderGate } from '../features/storage/LocalFolderGate';
import { useAutoSaveVoice } from '../features/storage/useAutoSaveVoice';
import { useSaveTarget } from '../features/storage/useSaveTarget';

export default function GeneratePage() {
  const studio = useGenerationStudio();
  const { session } = useAuth();
  const token = session?.access_token ?? '';
  const usage = useQuery({
    queryKey: ['usage'],
    queryFn: () => apiRequest<Usage>('/usage', token),
    enabled: Boolean(token),
  });
  const free = freeTierSummary(usage.data);
  const preview = useVoicePreview();
  const saveTarget = useSaveTarget();
  const {
    text,
    setText,
    voiceId,
    setVoiceId,
    samplePlaceholder,
    speed,
    setSpeed,
    job,
    voices,
    create,
    status,
    pollingTimedOut,
    audioUrl,
    audioError,
    audioLoading,
    selectedVoice,
    canSubmit,
    submitGeneration,
    playAudio,
    isPaymentRequired,
  } = studio;
  const autoSaveMessage = useAutoSaveVoice({
    jobId: job?.id ?? null, succeeded: job?.status === 'SUCCEEDED', enabled: !saveTarget.usesDrive && saveTarget.status.isSuccess,
    token, userId: saveTarget.userId,
  });

  return (
    <div className="page-stack">
      <div className="page-title">
        <div className="eyebrow">VOICE GENERATION</div>
        <h1>Studio tạo giọng nói</h1>
        <p>Chuyển văn bản thành âm thanh với giọng đọc tiếng Việt tự nhiên.</p>
      </div>

      <div className="studio-grid">
        <section className="panel editor-panel">
          <div className="panel-heading">
            <div>
              <span className="step-label">01 / NỘI DUNG</span>
              <h2>Văn bản của bạn</h2>
            </div>
            <span className="soft-tag">Tiếng Việt</span>
          </div>

          <textarea
            className="text-editor"
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={10000}
            placeholder={samplePlaceholder}
          />
          <div className="editor-footer">
            <span>
              {text.length.toLocaleString('vi-VN')} / 10.000 ký tự
              {selectedVoice && text.trim() && (
                <> · ước tính {formatCharacters(estimateCredits(text.trim().length, selectedVoice))} credit</>
              )}
            </span>
            <span>Giọng TTS Group 2 hỗ trợ thẻ cảm xúc {EMOTION_CUES.join(' ')}.</span>
          </div>
          {free && (
            <p className="free-tier-note" role="status">
              Miễn phí tuần này còn <strong>{formatCharacters(free.remaining)}</strong> / {formatCharacters(free.weekly)} credit.
              {' '}Credit miễn phí được dùng trước, phần vượt quá mới trừ số dư. Giọng thường: 1 ký tự = 1 credit.
            </p>
          )}

          <div className="panel-divider" />

          <div className="panel-heading">
            <div>
              <span className="step-label">02 / GIỌNG ĐỌC</span>
              <h2>Chọn giọng</h2>
            </div>
            <span className="voice-count">{voices.data?.length ?? 0} giọng</span>
          </div>

          {voices.isLoading && (
            <div className="inline-loading">Đang tải danh sách giọng…</div>
          )}
          {voices.isError && (
            <p className="inline-error">Không tải được danh sách giọng.</p>
          )}

          {voices.data && (
            <VoicePicker voices={voices.data} selectedId={voiceId} onSelect={setVoiceId} preview={preview} />
          )}

          <div className="settings-row">
            <label htmlFor="speed">
              Tốc độ đọc <strong>{speed.toFixed(2)}×</strong>
            </label>
            <input
              id="speed"
              type="range"
              min=".8"
              max="1.2"
              step=".05"
              value={speed}
              onChange={(event) => setSpeed(Number(event.target.value))}
            />
          </div>

          <div className="generate-actions">
            <button
              type="button"
              className="secondary-button"
              disabled={!voiceId}
              title="Nghe giọng đang chọn đọc đoạn văn mẫu (miễn phí)"
              onClick={() => void preview.toggle(voiceId)}
            >
              {preview.loadingId === voiceId && voiceId
                ? <Loader2 size={16} className="spin" />
                : preview.playingId === voiceId && voiceId ? <Square size={14} /> : <Play size={16} />}
              {preview.playingId === voiceId && voiceId ? 'Dừng' : 'Nghe thử'}
            </button>
            <button
              className="primary-button generate-button"
              disabled={!canSubmit || saveTarget.needsFolder}
              onClick={submitGeneration}
            >
              <WandSparkles size={17} />
              {create.isPending ? 'Đang gửi yêu cầu…' : 'Tạo giọng nói'}
              <Sparkles size={16} />
            </button>
          </div>
          {saveTarget.needsFolder && <LocalFolderGate what="voice" onPick={saveTarget.pickFolder} />}
          {!voiceId && voices.data && voices.data.length > 0 && (
            <p className="inline-loading">Chọn một giọng để nghe thử hoặc tạo audio.</p>
          )}

          {create.isError && (
            <div className="generation-error" role="alert">
              <p className="inline-error">{create.error.message}</p>
              {isPaymentRequired && (
                <Link to="/plans" className="text-link">
                  Xem gói dịch vụ và số dư
                  <span aria-hidden="true">→</span>
                </Link>
              )}
            </div>
          )}
        </section>

        <aside className="panel output-panel">
          <div className="panel-heading">
            <div>
              <span className="step-label">03 / KẾT QUẢ</span>
              <h2>Audio của bạn</h2>
            </div>
          </div>

          {!job && (
            <div className="output-empty">
              <div className="output-visual">
                <AudioLines size={36} />
              </div>
              <strong>Chưa có audio</strong>
              <span>Kết quả sẽ xuất hiện ở đây sau khi tạo giọng nói.</span>
            </div>
          )}

          {job && (
            <div className="output-result">
              <div className="result-icon">
                <AudioLines size={24} />
              </div>
              <strong>
                {job.status === 'SUCCEEDED'
                  ? 'Đã tạo audio'
                  : job.status === 'FAILED'
                    ? 'Tạo audio thất bại'
                    : 'Đang xử lý audio'}
              </strong>
              <span className={`job-status ${job.status.toLowerCase()}`}>
                {generationStatusLabel(job.status)}
              </span>

              {job.status === 'FAILED' && (
                <p className="inline-error">
                  {job.errorMessage ?? 'Đã có lỗi khi tạo audio.'}
                </p>
              )}

              {status.isError && (
                <p className="inline-error" role="alert">
                  Không thể cập nhật trạng thái tác vụ. Hãy kiểm tra lại thủ công
                  hoặc xem lịch sử.
                </p>
              )}

              {['QUEUED', 'RUNNING'].includes(job.status) && pollingTimedOut && (
                <div className="generation-poll-paused">
                  <p role="status">
                    Đã tạm dừng tự động kiểm tra sau 5 phút. Tác vụ có thể vẫn
                    đang xử lý.
                  </p>
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={status.isFetching}
                    onClick={() => void status.refetch()}
                  >
                    {status.isFetching ? 'Đang kiểm tra…' : 'Kiểm tra trạng thái'}
                  </button>
                </div>
              )}

              {job.status === 'SUCCEEDED' && (
                <button
                  className="secondary-button"
                  disabled={audioLoading}
                  onClick={() => void playAudio()}
                >
                  <Play size={16} />
                  {audioLoading ? ' Đang tải…' : ' Nghe thử'}
                </button>
              )}

              {autoSaveMessage && <p className="form-success" role="status">{autoSaveMessage}</p>}

              {audioError && (
                <p className="inline-error" role="alert">{audioError}</p>
              )}

              {audioUrl && (
                <>
                  <audio controls src={audioUrl} />
                  <a
                    className="download-link"
                    href={audioUrl}
                    download={`kata-tts-${job.id}.wav`}
                  >
                    <Download size={16} />
                    Tải WAV
                  </a>
                </>
              )}
            </div>
          )}

          <div className="output-tip">
            <Sparkles size={16} />
            <span>
              <strong>Mẹo nhỏ</strong> Chia đoạn văn dài thành phần hợp lý để dễ
              kiểm soát nhịp đọc.
            </span>
          </div>
        </aside>
      </div>

      {selectedVoice && (
        <p className="selection-note">Đang chọn: {voiceLabel(selectedVoice)}</p>
      )}
    </div>
  );
}
