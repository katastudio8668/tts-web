/**
 * Sample texts, one per model family: the studio's default editor text and the text each voice preview reads.
 * Must stay identical to KORVA_PREVIEW_TEXT / VIENEU_PREVIEW_TEXT in korva-tts-api
 * (src/voices/voice-preview.service.ts), which pre-generates the preview audio.
 */
export const KORVA_SAMPLE_TEXT =
  'Xin chào, mình là Korva. Chỉ cần dán văn bản và chọn một giọng đọc, bạn sẽ có ngay bản thu rõ ràng, '
  + 'truyền cảm cho video, sách nói hay bản tin. Chúc bạn một ngày làm việc thật hiệu quả!';

/** VieNeu v3 understands inline emotion cues and English words in Vietnamese text. */
export const VIENEU_SAMPLE_TEXT =
  'Ơ, bạn tới rồi à? [cười] Mình là giọng đọc thế hệ mới, nói chuyện tự nhiên như người thật, '
  + 'chen chút tiếng Anh kiểu deadline hay meeting cũng không sao. [thở dài] Hôm nay hơi nhiều việc, '
  + 'nhưng nghe xong đoạn này chắc bạn sẽ thấy vui hơn đấy!';

/** Inline emotion cues supported by VieNeu v3 voices. */
export const EMOTION_CUES = ['[cười]', '[thở dài]', '[hắng giọng]'] as const;

export function sampleTextFor(engine: string | undefined): string {
  return engine === 'vieneu' ? VIENEU_SAMPLE_TEXT : KORVA_SAMPLE_TEXT;
}

export function isSampleText(text: string): boolean {
  return text === KORVA_SAMPLE_TEXT || text === VIENEU_SAMPLE_TEXT;
}
