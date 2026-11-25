import { browserStore } from './browserStore';

/**
 * Where videos and voices are saved when the user has no Google Drive: a folder picked with the
 * File System Access API (Chrome, Edge). Other browsers fall back to a normal download.
 */
type PermissionMode = { mode: 'readwrite' };
export type FolderHandle = {
  name: string;
  queryPermission(options: PermissionMode): Promise<PermissionState>;
  requestPermission(options: PermissionMode): Promise<PermissionState>;
  getFileHandle(name: string, options: { create: boolean }): Promise<{ createWritable(): Promise<{ write(data: Blob): Promise<void>; close(): Promise<void> }> }>;
};
type PickerWindow = Window & { showDirectoryPicker?: (options?: { mode: 'readwrite'; id?: string }) => Promise<FolderHandle> };

const handleKey = (userId: string) => `save-folder/${userId}`;

export function folderPickerSupported(): boolean {
  return typeof window !== 'undefined' && typeof (window as PickerWindow).showDirectoryPicker === 'function';
}

export async function pickSaveFolder(userId: string): Promise<FolderHandle> {
  const picker = (window as PickerWindow).showDirectoryPicker;
  if (!picker) {throw new Error('Trình duyệt này không chọn được thư mục; video sẽ được tải xuống bình thường.');}
  const handle = await picker({ mode: 'readwrite', id: 'kata-tts' });
  await browserStore.put('handles', handleKey(userId), handle);
  return handle;
}

export async function savedFolder(userId: string): Promise<FolderHandle | null> {
  if (!folderPickerSupported()) {return null;}
  return (await browserStore.get<FolderHandle>('handles', handleKey(userId)).catch(() => undefined)) ?? null;
}

export async function forgetSaveFolder(userId: string): Promise<void> {
  await browserStore.delete('handles', handleKey(userId));
}

/** Plain browser download (no folder access). */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

/** Writes into the chosen folder (asking for permission again if the browser dropped it), else downloads. */
export async function saveToFolder(userId: string, blob: Blob, fileName: string): Promise<'folder' | 'download'> {
  const folder = await savedFolder(userId);
  if (folder) {
    const permission = await folder.queryPermission({ mode: 'readwrite' });
    if (permission === 'granted' || (await folder.requestPermission({ mode: 'readwrite' })) === 'granted') {
      const writable = await (await folder.getFileHandle(fileName, { create: true })).createWritable();
      await writable.write(blob);
      await writable.close();
      return 'folder';
    }
  }
  downloadBlob(blob, fileName);
  return 'download';
}
