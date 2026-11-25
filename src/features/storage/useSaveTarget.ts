import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { apiRequest } from '../../lib/api';
import { folderPickerSupported, pickSaveFolder, savedFolder } from '../video/localFolder';

export type StorageStatus = {
  defaultProvider: 'SUPABASE' | 'GOOGLE_DRIVE';
  googleDrive: { configured: boolean; connected: boolean; accountId: string | null };
};

/**
 * Where the user's voices and videos end up: their Google Drive when connected and selected,
 * otherwise a folder on this computer they must pick (or a normal download where folders are unsupported).
 */
export function useSaveTarget() {
  const { session } = useAuth();
  const token = session?.access_token ?? '';
  const userId = session?.user.id ?? '';
  const queryClient = useQueryClient();
  const [folderName, setFolderName] = useState<string | null>(null);
  const [folderChecked, setFolderChecked] = useState(false);
  const status = useQuery({
    queryKey: ['storage-status'],
    queryFn: () => apiRequest<StorageStatus>('/storage', token),
    enabled: Boolean(token),
  });

  useEffect(() => {
    let active = true;
    if (!userId) {return;}
    void savedFolder(userId).then((folder) => { if (active) {setFolderName(folder?.name ?? null); setFolderChecked(true);} });
    return () => { active = false; };
  }, [userId]);

  const pickFolder = useCallback(async () => {
    const folder = await pickSaveFolder(userId);
    setFolderName(folder.name);
  }, [userId]);

  const usesDrive = Boolean(status.data?.googleDrive.connected && status.data.defaultProvider === 'GOOGLE_DRIVE');
  const folderSupported = folderPickerSupported();
  return {
    status,
    usesDrive,
    driveConnected: Boolean(status.data?.googleDrive.connected),
    folderSupported,
    folderName,
    pickFolder,
    /** Without Drive, a local folder must be chosen first (where the browser supports it). */
    needsFolder: status.isSuccess && folderChecked && !usesDrive && folderSupported && !folderName,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['storage-status'] }),
    userId,
    token,
  };
}
