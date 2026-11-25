import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/api';
import type { VoiceToneCatalog, VoiceToneSetting } from './voiceToneApi';

/**
 * The account-wide voice tone (warm/cold/etc + intensity). One choice applies to every voice
 * generated afterwards, on both the voice screen and the video editor, like KATA Studio's voice
 * changer -- but persisted server-side so it follows the account across devices.
 */
export function useVoiceTone(token: string) {
  const queryClient = useQueryClient();
  const catalog = useQuery({
    queryKey: ['voice-tone', 'catalog'],
    queryFn: () => apiRequest<VoiceToneCatalog>('/voice-tone/catalog', token),
    enabled: Boolean(token),
    staleTime: Infinity,
  });
  const setting = useQuery({
    queryKey: ['voice-tone', 'setting'],
    queryFn: () => apiRequest<VoiceToneSetting>('/voice-tone', token),
    enabled: Boolean(token),
  });
  const update = useMutation({
    mutationFn: (next: VoiceToneSetting) => apiRequest<VoiceToneSetting>('/voice-tone', token, {
      method: 'PUT', body: JSON.stringify(next),
    }),
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: ['voice-tone', 'setting'] });
      const previous = queryClient.getQueryData<VoiceToneSetting>(['voice-tone', 'setting']);
      queryClient.setQueryData(['voice-tone', 'setting'], next);
      return { previous };
    },
    onError: (_error, _next, context) => {
      if (context?.previous) queryClient.setQueryData(['voice-tone', 'setting'], context.previous);
    },
    onSuccess: (data) => queryClient.setQueryData(['voice-tone', 'setting'], data),
  });
  return { catalog, setting, update };
}
