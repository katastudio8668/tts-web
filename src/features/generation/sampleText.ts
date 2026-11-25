/**
 * Sample texts, one per TTS group: the studio's default editor text and the text each voice preview reads.
 * Must stay identical to GROUP1_PREVIEW_TEXT / GROUP2_PREVIEW_TEXT in korva-tts-api
 * (src/voices/voice-preview.service.ts), which pre-generates the preview audio.
 */
export const GROUP1_SAMPLE_TEXT =
  'Xin chào, mình là KATA TTS. Chỉ cần dán văn bản và chọn một giọng đọc, bạn sẽ có ngay bản thu rõ ràng, '
  + 'truyền cảm cho video, sách nói hay bản tin. Chúc bạn một ngày làm việc thật hiệu quả!';

/** Group 2 voices understand inline emotion cues and English words in Vietnamese text. */
export const GROUP2_SAMPLE_TEXT =
  'Ơ, bạn tới rồi à? [cười] Mình là giọng đọc thế hệ mới, nói chuyện tự nhiên như người thật, '
  + 'chen chút tiếng Anh kiểu deadline hay meeting cũng không sao. [thở dài] Hôm nay hơi nhiều việc, '
  + 'nhưng nghe xong đoạn này chắc bạn sẽ thấy vui hơn đấy!';

/** Inline emotion cues supported by TTS Group 2 voices. */
export const EMOTION_CUES = ['[cười]', '[thở dài]', '[hắng giọng]'] as const;

/** Default text: group 2 is the default group. */
export const DEFAULT_SAMPLE_TEXT = GROUP2_SAMPLE_TEXT;

export function sampleTextFor(group: number | undefined): string {
  return group === 1 ? GROUP1_SAMPLE_TEXT : GROUP2_SAMPLE_TEXT;
}

export function isSampleText(text: string): boolean {
  return text === GROUP1_SAMPLE_TEXT || text === GROUP2_SAMPLE_TEXT;
}
