export type GenerationPayload = {
  text: string;
  voiceId: string;
  language: string;
  speed: number;
  totalSteps: number;
};

export type GenerationRequestIntent = {
  fingerprint: string;
  key: string;
};

export function getGenerationRequestIntent(
  payload: GenerationPayload,
  previous: GenerationRequestIntent | null,
  createKey: () => string = () => crypto.randomUUID(),
): GenerationRequestIntent {
  const fingerprint = JSON.stringify(payload);

  if (previous?.fingerprint === fingerprint) {
    return previous;
  }

  return {
    fingerprint,
    key: createKey(),
  };
}
