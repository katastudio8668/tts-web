import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VoiceCharacterStudio } from './VoiceCharacterStudio';

describe('VoiceCharacterStudio', () => {
  it('shows character voice configuration independently of generation', () => {
    render(<VoiceCharacterStudio />);
    expect(screen.getByRole('heading', { name: 'Tạo giọng nhân vật' })).toBeInTheDocument();
    expect(screen.getByLabelText('Tên nhân vật')).toBeInTheDocument();
    expect(screen.getByText('Mẫu giọng', { selector: 'label' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tính năng clone sắp ra mắt/ })).toBeDisabled();
  });
});
