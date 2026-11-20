export const PAYMENT_POLL_INTERVAL_MS = 5_000;
export const PAYMENT_POLL_MAX_DURATION_MS = 2 * 60_000;

export function getPaymentPollingInterval(
  status: string | undefined,
  startedAt: number | null,
  now: number,
): number | false {
  if (status !== 'PENDING' || startedAt === null) return false;
  if (now - startedAt >= PAYMENT_POLL_MAX_DURATION_MS) return false;
  return PAYMENT_POLL_INTERVAL_MS;
}
