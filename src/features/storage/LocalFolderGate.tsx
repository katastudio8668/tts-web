import { FolderOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

/** Shown when the user has no Google Drive and has not picked a folder yet. */
export function LocalFolderGate({ onPick, what }: { onPick: () => Promise<void>; what: string }) {
  return (
    <div className="folder-gate" role="status">
      <FolderOpen size={18} />
      <div>
        <strong>Chọn nơi lưu {what}</strong>
        <span>KATA TTS không lưu {what} trên máy chủ. Chọn một thư mục trên máy, hoặc <Link to="/account" className="text-link inline">kết nối Google Drive</Link>.</span>
      </div>
      <button type="button" className="primary-button" onClick={() => void onPick().catch(() => undefined)}>Chọn thư mục</button>
    </div>
  );
}
