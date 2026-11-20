import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

type AuthValue = {
  session: Session | null;
  loading: boolean;
  configured: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  const currentUserId = useRef<string | null>(null);
  const authStateChanged = useRef(false);

  useEffect(() => {
    if (!supabase) return;

    let active = true;
    supabase.auth.getSession()
      .then(({ data }) => {
        if (active && !authStateChanged.current) {
          currentUserId.current = data.session?.user.id ?? null;
          setSession(data.session);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active && !authStateChanged.current) setLoading(false);
      });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      authStateChanged.current = true;
      const nextUserId = nextSession?.user.id ?? null;

      // Private query data must never survive a change of authenticated principal.
      if (currentUserId.current !== nextUserId) {
        queryClient.clear();
        currentUserId.current = nextUserId;
      }

      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [queryClient]);

  const value = useMemo<AuthValue>(() => ({
    session,
    loading,
    configured: Boolean(supabase),
    signInWithGoogle: async () => {
      if (!supabase) {
        throw new Error('Chưa cấu hình Supabase. Hãy thiết lập VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY.');
      }
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/signin` },
      });
      if (error) throw error;
    },
    signOut: async () => {
      if (!supabase) return;
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Do not wait for the auth event to remove the previous user's cached data.
      queryClient.clear();
      currentUserId.current = null;
    },
  }), [loading, queryClient, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
