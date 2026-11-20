import { describe, expect, it } from 'vitest';
import { generationStatusLabel } from './generationPresentation';

describe('generationStatusLabel', () => {
  it.each([
    ['QUEUED', 'Đang chờ'],
    ['RUNNING', 'Đang tạo'],
    ['SUCCEEDED', 'Hoàn tất'],
    ['FAILED', 'Thất bại'],
    ['CANCELLED', 'Đã hủy'],
  ] as const)('maps %s to its Vietnamese label', (status, label) => {
    expect(generationStatusLabel(status)).toBe(label);
  });
});
