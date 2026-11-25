import { AudioLines, Check, FileAudio2, Mic2, Sparkles, Upload, WandSparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

const models = [
  { id: 'qwen3', name: 'Qwen3-TTS', detail: 'Clone giọng & điều khiển biểu cảm', tag: 'Đề xuất' },
  { id: 'cosyvoice', name: 'CosyVoice 3', detail: 'Zero-shot voice cloning đa ngôn ngữ' },
  { id: 'moss', name: 'MOSS-TTS', detail: 'Tùy chọn model nhẹ hơn' },
];

export function VoiceCharacterStudio() {
  const [name, setName] = useState('');
  const [model, setModel] = useState('qwen3');
  const [sample, setSample] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (!sample) { setPreviewUrl(''); return; }
    const url = URL.createObjectURL(sample);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [sample]);

  return (
    <section className="character-studio">
      <div className="character-studio-heading">
        <div className="character-studio-title">
          <span className="character-studio-icon"><Mic2 size={19}/></span>
          <div>
            <span className="step-label">VOICE CHARACTER STUDIO</span>
            <h2>Tạo giọng nhân vật</h2>
            <p>Tạo hồ sơ giọng riêng từ một đoạn ghi âm mẫu.</p>
          </div>
        </div>
        <span className="character-beta"><Sparkles size={13}/> BETA UI</span>
      </div>

      <div className="character-studio-grid">
        <div className="character-upload-column">
          <label className="character-field-label" htmlFor="character-name">Tên nhân vật</label>
          <input id="character-name" className="character-name-input" value={name}
            onChange={event => setName(event.target.value)} placeholder="Ví dụ: Người kể chuyện — giọng nam trầm"/>

          <label className="character-field-label" htmlFor="character-audio">Mẫu giọng</label>
          <label className="character-dropzone" htmlFor="character-audio">
            <span className="character-upload-icon"><Upload size={20}/></span>
            <strong>{sample ? sample.name : 'Tải lên đoạn ghi âm mẫu'}</strong>
            <span>{sample ? `${(sample.size / 1024 / 1024).toFixed(1)} MB · Đã chọn` : 'WAV, MP3, M4A · Khuyến nghị 10–30 giây'}</span>
            <small><FileAudio2 size={13}/> Chọn tệp âm thanh từ thiết bị</small>
            <input id="character-audio" type="file" accept="audio/*"
              onChange={event => setSample(event.target.files?.[0] ?? null)}/>
          </label>
          {previewUrl && <audio className="character-audio-preview" controls src={previewUrl}/>}
          <p className="character-privacy"><Check size={13}/> Chỉ sử dụng bản ghi âm bạn có quyền sử dụng.</p>
        </div>

        <div className="character-model-column">
          <div className="character-section-label">CHỌN MODEL CLONE</div>
          <div className="character-model-list">
            {models.map(item => (
              <button type="button" key={item.id}
                className={`character-model-option ${model === item.id ? 'selected' : ''}`}
                onClick={() => setModel(item.id)} aria-pressed={model === item.id}>
                <span className="character-model-radio">{model === item.id && <i/>}</span>
                <span className="character-model-copy"><strong>{item.name}</strong><small>{item.detail}</small></span>
                {item.tag && <span className="character-model-tag">{item.tag}</span>}
              </button>
            ))}
          </div>
          <div className="character-selected-model">
            <AudioLines size={16}/>
            <span><strong>{models.find(item => item.id === model)?.name}</strong><small>Model đã chọn cho hồ sơ này</small></span>
          </div>
          <button className="character-create-button" type="button" disabled={!sample || !name.trim()}>
            <WandSparkles size={16}/> Tạo hồ sơ giọng
          </button>
          <p className="character-integration-note">Giao diện đang được chuẩn bị. Chức năng clone sẽ được kết nối với engine ở bước tích hợp tiếp theo.</p>
        </div>
      </div>
    </section>
  );
}
