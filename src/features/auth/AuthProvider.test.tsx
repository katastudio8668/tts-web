import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthProvider';

const { authState, mockSupabase } = vi.hoisted(() => {
  const state: { callback: ((event: string, session: unknown) => void) | null } = { callback: null };
  const supabaseMock = {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signOut: vi.fn(),
      signInWithOAuth: vi.fn(),
    },
  };
  return { authState: state, mockSupabase: supabaseMock };

  it('keeps the current user cache when the server rejects sign-out', async () => {
    queryClient = new QueryClient();
    queryClient.setQueryData(['usage'], { balance: 900 });
    mockSupabase.auth.signOut.mockRejectedValueOnce(new Error('Sign-out failed'));

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider><AuthActions /></AuthProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => expect(authState.callback).toBeTypeOf('function'));
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    await waitFor(() => expect(mockSupabase.auth.signOut).toHaveBeenCalledTimes(1));
    expect(queryClient.getQueryData(['usage'])).toEqual({ balance: 900 });
  });

  it('clears cached account data after the server confirms sign-out', async () => {
    queryClient = new QueryClient();
    queryClient.setQueryData(['usage'], { balance: 900 });
    mockSupabase.auth.signOut.mockResolvedValueOnce({ error: null });

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider><AuthActions /></AuthProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => expect(authState.callback).toBeTypeOf('function'));
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    await waitFor(() => expect(mockSupabase.auth.signOut).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(queryClient.getQueryCache().getAll()).toHaveLength(0));
  });

});

vi.mock('../../lib/supabase', () => ({ supabase: mockSupabase }));

function AuthActions() {
  const { signOut } = useAuth();
  return <button onClick={() => void signOut().catch(() => undefined)}>Sign out</button>;
}

const session = (userId: string) => ({
  access_token: `token-${userId}`,
  user: { id: userId, email: `${userId}@example.com`, user_metadata: {} },
});

describe('AuthProvider query cache isolation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    authState.callback = null;
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: session('user-a') } });
    mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
      authState.callback = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });
  });

  afterEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  it('clears cached account data when the authenticated user changes', async () => {
    queryClient = new QueryClient();
    queryClient.setQueryData(['usage'], { balance: 900 });
    queryClient.setQueryData(['generations'], [{ id: 'private-user-a-job' }]);

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider><div>child</div></AuthProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => expect(authState.callback).toBeTypeOf('function'));
    await waitFor(() => expect(queryClient.getQueryData(['usage'])).toEqual({ balance: 900 }));

    act(() => {
      authState.callback?.('SIGNED_IN', session('user-b'));
    });

    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
  });

  it('clears cached account data when the current user signs out', async () => {
    queryClient = new QueryClient();
    queryClient.setQueryData(['usage'], { balance: 900 });

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider><div>child</div></AuthProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => expect(authState.callback).toBeTypeOf('function'));
    await waitFor(() => expect(queryClient.getQueryData(['usage'])).toEqual({ balance: 900 }));

    act(() => {
      authState.callback?.('SIGNED_OUT', null);
    });

    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
  });
});
