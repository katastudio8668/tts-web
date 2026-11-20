import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProtectedLayout } from './App';

const { authState } = vi.hoisted(() => ({
  authState: {
    session: { user: { id: 'user-a' } },
    loading: false,
  },
}));

vi.mock('./features/auth/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => authState,
}));

vi.mock('./components/AppShell', () => ({
  default: () => <div data-testid="app-shell"><Outlet /></div>,
}));

function StatefulPage() {
  const [value, setValue] = useState(0);

  return (
    <div>
      <output>{value}</output>
      <button type="button" onClick={() => setValue((current) => current + 1)}>
        Increase
      </button>
    </div>
  );
}

describe('ProtectedLayout session boundary', () => {
  beforeEach(() => {
    authState.session = { user: { id: 'user-a' } };
    authState.loading = false;
  });

  it('remounts the protected workspace when the authenticated user changes', () => {
    const app = () => (
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<StatefulPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    const view = render(app());
    fireEvent.click(screen.getByRole('button', { name: 'Increase' }));
    expect(screen.getByText('1')).toBeInTheDocument();

    authState.session = { user: { id: 'user-b' } };
    view.rerender(app());

    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
