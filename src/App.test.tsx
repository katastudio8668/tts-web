import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('Korva TTS application shell', () => {
  it('renders the sign-in screen and Google authentication action', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /chào mừng đến với korva/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tiếp tục với google/i })).toBeInTheDocument();
    expect(screen.getByRole('contentinfo', { name: /thông tin thương hiệu/i })).toBeInTheDocument();
    expect(screen.getByText('KATA STUDIO')).toBeInTheDocument();
  });
});
