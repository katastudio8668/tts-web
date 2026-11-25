export type VoiceToneGroupId = 'tone' | 'character' | 'space';
export type VoiceToneGroup = { id: VoiceToneGroupId; label: { vi: string; en: string } };
export type VoiceToneEffect = { id: string; group: VoiceToneGroupId; label: { vi: string; en: string }; hint: { vi: string; en: string } };
export type VoiceToneCatalog = { groups: VoiceToneGroup[]; effects: VoiceToneEffect[] };
export type VoiceToneSetting = { id: string; intensity: number };
