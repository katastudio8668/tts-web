import type { ReactNode } from 'react';

/** Compact labelled controls used across the video editor panels. */
export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="vf-field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

export function Select<T extends string>({ value, options, onChange, disabled }: {
  value: T; options: readonly { value: T; label: string }[]; onChange: (value: T) => void; disabled?: boolean;
}) {
  return (
    <select value={value} disabled={disabled} onChange={(event) => onChange(event.target.value as T)}>
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  );
}

export function NumberInput({ value, min, max, step, onChange, disabled }: {
  value: number; min: number; max: number; step: number; onChange: (value: number) => void; disabled?: boolean;
}) {
  return (
    <input type="number" value={value} min={min} max={max} step={step} disabled={disabled}
      onChange={(event) => { const next = Number(event.target.value); if (Number.isFinite(next)) {onChange(Math.min(max, Math.max(min, next)));} }} />
  );
}

export function ColorInput({ value, onChange, disabled }: { value: string; onChange: (value: string) => void; disabled?: boolean }) {
  return <input type="color" value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} />;
}

export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (value: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <label className="vf-toggle">
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export const TRANSITION_OPTIONS = [
  { value: 'none', label: 'Không' }, { value: 'fade', label: 'Mờ dần' }, { value: 'blurry', label: 'Nhòe' },
  { value: 'zoom-in', label: 'Phóng to' }, { value: 'zoom-out', label: 'Thu nhỏ' }, { value: 'slide-left', label: 'Trượt trái' },
  { value: 'slide-right', label: 'Trượt phải' }, { value: 'slide-up', label: 'Trượt lên' }, { value: 'slide-down', label: 'Trượt xuống' },
  { value: 'push-left', label: 'Đẩy trái' }, { value: 'push-right', label: 'Đẩy phải' },
] as const;
export const LAYOUT_OPTIONS = [
  { value: 'title', label: 'Tiêu đề lớn' }, { value: 'caption', label: 'Chú thích' }, { value: 'quote', label: 'Trích dẫn' },
  { value: 'list', label: 'Danh sách' }, { value: 'media', label: 'Chỉ ảnh/video' },
] as const;
export const TEXT_ANIMATION_OPTIONS = [
  { value: 'none', label: 'Không' }, { value: 'fade', label: 'Hiện dần' }, { value: 'pop', label: 'Bật lên' },
  { value: 'slide-up', label: 'Trượt lên' }, { value: 'typewriter', label: 'Gõ chữ' },
] as const;
export const POSITION_OPTIONS = [{ value: 'top', label: 'Trên' }, { value: 'center', label: 'Giữa' }, { value: 'bottom', label: 'Dưới' }] as const;
export const MOTION_OPTIONS = [
  { value: 'none', label: 'Đứng yên' }, { value: 'zoom-in', label: 'Zoom vào' }, { value: 'zoom-out', label: 'Zoom ra' },
  { value: 'pan-left', label: 'Lia trái' }, { value: 'pan-right', label: 'Lia phải' },
] as const;
