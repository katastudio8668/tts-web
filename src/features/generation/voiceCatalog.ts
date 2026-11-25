import type { Voice } from '../../lib/api';

export const VOICE_PAGE_SIZE = 8;

const ENGINE_PREFIX = /^(vieneu|korva)\s+/i;
const ENGINE_LABELS: Record<string, string> = { korva: 'Korva', vieneu: 'VieNeu v3' };
const GENDER_LABELS: Record<string, string> = { female: 'Nữ', male: 'Nam' };

/** Voice name without the engine prefix (older API data may still carry "VieNeu …"). */
export function voiceLabel(voice: Pick<Voice, 'displayName'>): string {
  return voice.displayName.replace(ENGINE_PREFIX, '');
}

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
}

/** Name search, case- and accent-insensitive ("ngoc" finds "Ngọc Huyền"). */
export function filterVoices(voices: Voice[], query: string): Voice[] {
  const needle = normalize(query);
  if (!needle) return voices;
  return voices.filter((voice) => normalize(voiceLabel(voice)).includes(needle));
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, page), pageCount);
  return { items: items.slice((current - 1) * pageSize, current * pageSize), page: current, pageCount };
}

export function voiceRate(voice: Pick<Voice, 'creditsPerCharacter'>): number {
  const rate = Number(voice.creditsPerCharacter ?? 1);
  return Number.isFinite(rate) && rate > 0 ? rate : 1;
}

export function voiceMeta(voice: Voice): string {
  const parts = [GENDER_LABELS[voice.gender ?? ''] ?? 'Tiếng Việt'];
  if (voice.engine) parts.push(ENGINE_LABELS[voice.engine] ?? voice.engine);
  const rate = voiceRate(voice);
  if (rate > 1) parts.push(`VIP ×${rate.toLocaleString('vi-VN')}`);
  return parts.join(' · ');
}

/** Display-only estimate; the API is authoritative and uses the same rounding (thousandths, rounded up). */
export function estimateCredits(characters: number, voice: Pick<Voice, 'creditsPerCharacter'>): number {
  const milliRate = Math.round(voiceRate(voice) * 1000);
  return Math.floor((characters * milliRate + 999) / 1000);
}
