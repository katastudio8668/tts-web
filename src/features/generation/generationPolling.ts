export const GENERATION_POLL_MAX_DURATION_MS = 5 * 60_000;
export const GENERATION_POLL_INITIAL_INTERVAL_MS = 2_000;
export const GENERATION_POLL_MAX_INTERVAL_MS = 10_000;

const ACTIVE_STATUSES = new Set(['QUEUED', 'RUNNING']);

export function getGenerationPollingInterval(
  status: string | undefined,
  startedAt: number | null,
  now: number,
): number | false {
  if (!status || !ACTIVE_STATUSES.has(status) || startedAt === null) return false;

  const elapsed = Math.max(0, now - startedAt);
  if (elapsed >= GENERATION_POLL_MAX_DURATION_MS) return false;

  const backoffStep = Math.floor(elapsed / 30_000);
  return Math.min(
    GENERATION_POLL_INITIAL_INTERVAL_MS * 2 ** backoffStep,
    GENERATION_POLL_MAX_INTERVAL_MS,
  );
}
