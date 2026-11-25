import { describe, expect, it } from 'vitest';
import type { Voice } from '../../lib/api';
import { estimateCredits, filterVoices, paginate, voiceLabel, voiceMeta } from './voiceCatalog';

const voices: Voice[] = [
  { id: 'ngoc_huyen', displayName: 'Ngọc Huyền', language: 'vi', gender: 'female', group: 1, creditsPerCharacter: 1 },
  { id: 'g2_ngoc_huyen', displayName: 'Ngọc Huyền', language: 'vi', gender: 'female', group: 2, creditsPerCharacter: 1 },
  { id: 'g2_adam', displayName: 'Adam', language: 'vi', gender: 'male', group: 2, creditsPerCharacter: 2 },
  { id: 'gia_bao', displayName: 'Gia Bảo', language: 'vi', gender: 'male' },
];

describe('voice catalog', () => {
  it('shows plain voice names', () => {
    expect(voiceLabel(voices[1])).toBe('Ngọc Huyền');
    expect(voiceLabel(voices[2])).toBe('Adam');
  });

  it('searches by name ignoring case and Vietnamese accents', () => {
    expect(filterVoices(voices, 'ngoc').map((v) => v.id)).toEqual(['ngoc_huyen', 'g2_ngoc_huyen']);
    expect(filterVoices(voices, 'GIA BAO').map((v) => v.id)).toEqual(['gia_bao']);
    expect(filterVoices(voices, 'xyz')).toEqual([]);
    expect(filterVoices(voices, '  ')).toHaveLength(4);
  });

  it('paginates and clamps the page into range', () => {
    const items = Array.from({ length: 21 }, (_, i) => i);
    expect(paginate(items, 1, 8)).toEqual({ items: [0, 1, 2, 3, 4, 5, 6, 7], page: 1, pageCount: 3 });
    expect(paginate(items, 3, 8).items).toEqual([16, 17, 18, 19, 20]);
    expect(paginate(items, 9, 8).page).toBe(3);
    expect(paginate([], 2, 8)).toEqual({ items: [], page: 1, pageCount: 1 });
  });

  it('describes gender and TTS group, and flags VIP rates', () => {
    expect(voiceMeta(voices[0])).toBe('Nữ · TTS Group 1');
    expect(voiceMeta(voices[1])).toBe('Nữ · TTS Group 2');
    expect(voiceMeta(voices[2])).toBe('Nam · TTS Group 2 · VIP ×2');
  });

  it('estimates credits like the API: rounded up, without float artefacts', () => {
    expect(estimateCredits(10, voices[0])).toBe(50);
    expect(estimateCredits(11, { ...voices[0], creditsPerCharacter: 1.5 })).toBe(83);
    expect(estimateCredits(10, { ...voices[0], creditsPerCharacter: 1.1 })).toBe(55);
    expect(estimateCredits(10, voices[3])).toBe(50);
    expect(estimateCredits(10, voices[0], 1)).toBe(10);
  });
});
