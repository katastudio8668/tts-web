import { ArrowLeft, Mic2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { VoiceCharacterStudio } from '../features/generation/VoiceCharacterStudio';

export default function VoiceCharactersPage() {
  return (
    <div className="page-stack">
      <div className="page-title">
        <div className="eyebrow">VOICE CHARACTERS</div>
        <h1>Giọng nhân vật</h1>
        <p>Tạo cấu hình giọng riêng từ bản ghi âm mẫu và lựa chọn model clone.</p>
      </div>
      <div className="character-page-intro">
        <div className="character-page-intro-icon"><Mic2 size={20} /></div>
        <div>
          <strong>Không gian dành riêng cho giọng nhân vật</strong>
          <span>Phần tạo giọng thông thường đã được tách riêng để bạn thao tác nhanh hơn.</span>
        </div>
        <Link to="/generate" className="text-link"><ArrowLeft size={15} /> Quay lại tạo giọng</Link>
      </div>
      <VoiceCharacterStudio />
    </div>
  );
}
