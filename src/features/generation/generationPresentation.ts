import type { Generation } from '../../lib/api';

export function generationStatusLabel(status: Generation['status']): string {
  return {
    QUEUED: 'Đang chờ',
    RUNNING: 'Đang tạo',
    SUCCEEDED: 'Hoàn tất',
    FAILED: 'Thất bại',
    CANCELLED: 'Đã hủy',
  }[status];
}
