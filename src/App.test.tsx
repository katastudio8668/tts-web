import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('Korva TTS application shell', () => {
  it('renders the product name and primary navigation', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /korva tts/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /tạo giọng nói/i })).toBeInTheDocument();
  });
});