import { describe, expect, it, vi } from 'vitest';
import { getPurchaseIntent } from './purchaseIntent';

describe('getPurchaseIntent', () => {
  it('reuses the idempotency key when retrying the same package', () => {
    const createKey = vi.fn(() => 'purchase-key-1');
    const first = getPurchaseIntent(null, 'credits-100', createKey);
    const retry = getPurchaseIntent(first, 'credits-100', createKey);

    expect(retry).toBe(first);
    expect(retry.idempotencyKey).toBe('purchase-key-1');
    expect(createKey).toHaveBeenCalledTimes(1);
  });

  it('creates a new key when the user selects a different package', () => {
    const createKey = vi.fn()
      .mockReturnValueOnce('purchase-key-1')
      .mockReturnValueOnce('purchase-key-2');
    const first = getPurchaseIntent(null, 'credits-100', createKey);
    const next = getPurchaseIntent(first, 'credits-500', createKey);

    expect(next).toEqual({
      packageCode: 'credits-500',
      idempotencyKey: 'purchase-key-2',
    });
    expect(createKey).toHaveBeenCalledTimes(2);
  });
});
