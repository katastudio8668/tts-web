import { AudioLines, ChevronLeft, ChevronRight, Loader2, Play, Search, Square } from 'lucide-react';
import { useState } from 'react';
import type { Voice } from '../../lib/api';
import { filterVoices, paginate, VOICE_PAGE_SIZE, voiceLabel, voiceMeta } from './voiceCatalog';
import type { VoicePreviewError } from './useVoicePreview';

type Props = {
  voices: Voice[];
  selectedId: string;
  onSelect: (voiceId: string) => void;
  preview: {
    playingId: string | null;
    loadingId: string | null;
    error: VoicePreviewError | null;
    toggle: (voiceId: string) => Promise<void>;
  };
};

export function VoicePicker({ voices, selectedId, onSelect, preview }: Props) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const matches = filterVoices(voices, query);
  const current = paginate(matches, page, VOICE_PAGE_SIZE);

  return (
    <div className="voice-picker">
      <label className="voice-search">
        <Search size={15} aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => { setQuery(event.target.value); setPage(1); }}
          placeholder="Tìm giọng theo tên…"
          aria-label="Tìm giọng theo tên"
        />
      </label>

      {matches.length === 0 && <p className="inline-loading">Không có giọng nào khớp “{query.trim()}”.</p>}

      <div className="voice-grid">
        {current.items.map((voice) => {
          const label = voiceLabel(voice);
          const playing = preview.playingId === voice.id;
          const loading = preview.loadingId === voice.id;
          return (
            <div key={voice.id} className={`voice-option ${selectedId === voice.id ? 'selected' : ''}`}>
              <button
                type="button"
                className="voice-play"
                aria-label={playing ? `Dừng nghe thử ${label}` : `Nghe thử ${label}`}
                onClick={() => void preview.toggle(voice.id)}
              >
                {loading ? <Loader2 size={15} className="spin" /> : playing ? <Square size={13} /> : <Play size={15} />}
              </button>
              <button
                type="button"
                className="voice-select"
                aria-pressed={selectedId === voice.id}
                onClick={() => onSelect(voice.id)}
              >
                <span>
                  <strong>{label}</strong>
                  <small>{voiceMeta(voice)}</small>
                  {preview.error?.voiceId === voice.id && <small className="voice-error">{preview.error.message}</small>}
                </span>
                {playing ? <AudioLines size={15} className="voice-wave" aria-hidden="true" /> : <i aria-hidden="true" />}
              </button>
            </div>
          );
        })}
      </div>

      {current.pageCount > 1 && (
        <nav className="voice-pager" aria-label="Phân trang giọng đọc">
          <button type="button" className="icon-button" disabled={current.page <= 1}
            onClick={() => setPage(current.page - 1)} aria-label="Trang trước">
            <ChevronLeft size={16} />
          </button>
          <span>Trang {current.page} / {current.pageCount}</span>
          <button type="button" className="icon-button" disabled={current.page >= current.pageCount}
            onClick={() => setPage(current.page + 1)} aria-label="Trang sau">
            <ChevronRight size={16} />
          </button>
        </nav>
      )}
    </div>
  );
}
