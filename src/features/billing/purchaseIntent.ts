export type PurchaseIntent = { packageCode: string; idempotencyKey: string };

export function getPurchaseIntent(
  current: PurchaseIntent | null,
  packageCode: string,
  createKey: () => string = () => crypto.randomUUID(),
): PurchaseIntent {
  if (current?.packageCode === packageCode) return current;
  return { packageCode, idempotencyKey: createKey() };
}
