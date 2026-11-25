import { Bot, Check, Copy, Download, Plug } from 'lucide-react';
import { useState } from 'react';
import { API_BASE_URL } from '../lib/api';

const MCP_URL = `${API_BASE_URL}/mcp`;
const DOWNLOADS = [
  { file: '/plugins/kata-tts-claude-plugin.zip', title: 'Gói cho Claude', note: 'Kỹ năng + kết nối, dùng cho Claude Code / Claude Desktop.' },
  { file: '/plugins/kata-tts-chatgpt-plugin.zip', title: 'Gói cho ChatGPT', note: 'Kỹ năng + kết nối theo định dạng plugin của ChatGPT.' },
];

/** How users connect their AI assistant to KATA TTS; the plugin packages are public downloads. */
export default function AiPluginPage() {
  const [copied, setCopied] = useState(false);
  return (
    <div className="page-stack">
      <div className="page-title">
        <div className="eyebrow">AI PLUGIN</div>
        <h1>Dùng trợ lý AI để tạo voice và video</h1>
        <p>Kết nối Claude hoặc ChatGPT với KATA TTS. Trợ lý có thể viết kịch bản, tạo mẫu video ngay trên tài khoản của bạn, tạo voice khớp từng cảnh và xuất video.</p>
      </div>

      <section className="panel">
        <div className="panel-heading"><div><span className="step-label">BƯỚC 1</span><h2>Địa chỉ kết nối</h2></div><Plug size={18} /></div>
        <div className="copy-row">
          <code>{MCP_URL}</code>
          <button type="button" className="secondary-button small" onClick={() => { void navigator.clipboard.writeText(MCP_URL).then(() => setCopied(true)); }}>
            {copied ? <><Check size={14} /> Đã chép</> : <><Copy size={14} /> Chép</>}
          </button>
        </div>
        <ul className="setup-list">
          <li><strong>Claude (web / desktop):</strong> mở phần Connectors trong cài đặt, thêm custom connector với địa chỉ trên, rồi đăng nhập KATA TTS khi được hỏi.</li>
          <li><strong>Claude Code:</strong> <code>claude mcp add --transport http kata-tts {MCP_URL}</code>, hoặc cài gói Claude bên dưới.</li>
          <li><strong>ChatGPT:</strong> thêm connector/app mới với địa chỉ trên (cần chế độ nhà phát triển), hoặc dùng gói ChatGPT bên dưới.</li>
        </ul>
        <p className="vf-hint">Lần đầu kết nối, KATA TTS sẽ mở trang xin phép. Trợ lý chỉ tiêu credit khi bạn đồng ý trong cuộc trò chuyện.</p>
      </section>

      <section className="panel">
        <div className="panel-heading"><div><span className="step-label">BƯỚC 2 (TÙY CHỌN)</span><h2>Tải gói kỹ năng</h2></div><Bot size={18} /></div>
        <p className="vf-hint">Gói kỹ năng dạy trợ lý cách khớp voice với video và cách thiết kế mẫu video đẹp. Ai cũng tải được.</p>
        <div className="template-grid">
          {DOWNLOADS.map((item) => (
            <a key={item.file} className="template-card" href={item.file} download>
              <Download size={18} />
              <strong>{item.title}</strong>
              <small>{item.note}</small>
            </a>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading"><div><span className="step-label">THỬ NGAY</span><h2>Gợi ý câu lệnh</h2></div></div>
        <ul className="setup-list">
          <li>“Tạo cho mình một mẫu video dọc 9:16 giới thiệu quán cà phê, 5 cảnh, có phụ đề karaoke.”</li>
          <li>“Viết kịch bản 45 giây về 3 mẹo tiết kiệm tiền, tạo dự án video từ đó và ước tính credit voice.”</li>
          <li>“Tạo voice cho các cảnh còn thiếu rồi xuất video vào Google Drive của mình.”</li>
        </ul>
      </section>
    </div>
  );
}
