import {
  AudioLines,
  Download,
  Play,
  Sparkles,
  WandSparkles,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';
import { formatCharacters, freeTierSummary } from '../features/billing/freeTier';
import { apiRequest, type Usage } from '../lib/api';
import { generationStatusLabel } from '../features/generation/generationPresentation';
import { useGenerationStudio } from '../features/generation/useGenerationStudio';

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
  const {
    text,
    setText,
    voiceId,
    setVoiceId,
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
            placeholder="Nhập hoặc dán nội dung bạn muốn chuyển thành giọng nói..."
          />
          <div className="editor-footer">
            <span>{text.length.toLocaleString('vi-VN')} / 10.000 ký tự</span>
            <span>Kiểm tra dấu câu để giọng đọc tự nhiên hơn.</span>
          </div>
          {free && (
            <p className="free-tier-note" role="status">
              Miễn phí tuần này còn <strong>{formatCharacters(free.remaining)}</strong> / {formatCharacters(free.weekly)} ký tự.
              {' '}Ký tự miễn phí được dùng trước, phần vượt quá mới trừ credit.
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

          <div className="voice-grid">
            {voices.data?.map((voice) => (
              <button
                type="button"
                key={voice.id}
                className={`voice-option ${voiceId === voice.id ? 'selected' : ''}`}
                onClick={() => setVoiceId(voice.id)}
              >
                <span className="voice-avatar">
                  <AudioLines size={18} />
                </span>
                <span>
                  <strong>{voice.displayName}</strong>
                  <small>{voice.gender ?? 'Vietnamese'} · {voice.language}</small>
                </span>
                <i />
              </button>
            ))}
          </div>

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

          <button
            className="primary-button generate-button"
            disabled={!canSubmit}
            onClick={submitGeneration}
          >
            <WandSparkles size={17} />
            {create.isPending ? 'Đang gửi yêu cầu…' : 'Tạo giọng nói'}
            <Sparkles size={16} />
          </button>

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

              {audioError && (
                <p className="inline-error" role="alert">{audioError}</p>
              )}

              {audioUrl && (
                <>
                  <audio controls src={audioUrl} />
                  <a
                    className="download-link"
                    href={audioUrl}
                    download={`korva-${job.id}.wav`}
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
        <p className="selection-note">Đang chọn: {selectedVoice.displayName}</p>
      )}
    </div>
  );
}
