import type { Usage } from '../../lib/api';

export type FreeTierSummary = {
  remaining: number;
  weekly: number;
  used: number;
  resetsLabel: string;
};

/** Returns null when the administrator has not enabled a weekly free allowance. */
export function freeTierSummary(usage: Usage | undefined): FreeTierSummary | null {
  const free = usage?.freeTier;
  if (!free || free.weeklyCharacters <= 0) return null;
  const resetsAt = new Date(free.resetsAt);
  return {
    remaining: free.remainingThisWeek,
    weekly: free.weeklyCharacters,
    used: free.usedThisWeek,
    resetsLabel: Number.isNaN(resetsAt.getTime())
      ? ''
      : resetsAt.toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh', weekday: 'long', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
      }),
  };
}

export function formatCharacters(value: number): string {
  return value.toLocaleString('vi-VN');
}
