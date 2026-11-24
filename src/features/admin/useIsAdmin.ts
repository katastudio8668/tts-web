import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthProvider';
import { apiRequest, type Me } from '../../lib/api';

/** Role comes from the API (`/me`); the API enforces it again on every admin route. */
export function useIsAdmin() {
  const { session } = useAuth();
  const token = session?.access_token ?? '';
  const me = useQuery({
    queryKey: ['me'],
    queryFn: () => apiRequest<Me>('/me', token),
    enabled: Boolean(token),
  });
  return { isAdmin: me.data?.role === 'ADMIN', isLoading: me.isLoading, token };
}
