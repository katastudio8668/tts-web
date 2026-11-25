import { afterEach, describe, expect, it, vi } from 'vitest';

const store = new Map<string, unknown>();
vi.mock('./browserStore', () => ({ browserStore: {
  get: async (_s: string, key: string) => store.get(key),
  put: async (_s: string, key: string, value: unknown) => { store.set(key, value); },
  delete: async (_s: string, key: string) => { store.delete(key); },
} }));

import { pickSaveFolder, saveToFolder } from './localFolder';

afterEach(() => { store.clear(); delete (window as { showDirectoryPicker?: unknown }).showDirectoryPicker; });

function fakeFolder(permission: PermissionState) {
  const written: Blob[] = [];
  return { written, handle: {
    name: 'Videos',
    queryPermission: vi.fn(async () => permission),
    requestPermission: vi.fn(async () => permission),
    getFileHandle: vi.fn(async () => ({ createWritable: async () => ({ write: async (b: Blob) => { written.push(b); }, close: async () => undefined }) })),
  } };
}

describe('saveToFolder', () => {
  it('writes into the folder the user picked', async () => {
    const folder = fakeFolder('granted');
    (window as { showDirectoryPicker?: unknown }).showDirectoryPicker = vi.fn(async () => folder.handle);
    await pickSaveFolder('u1');
    await expect(saveToFolder('u1', new Blob(['x']), 'a.mp4')).resolves.toBe('folder');
    expect(folder.written).toHaveLength(1);
    expect(folder.handle.getFileHandle).toHaveBeenCalledWith('a.mp4', { create: true });
  });

  it('keeps folders per account and falls back to a download without permission', async () => {
    const folder = fakeFolder('denied');
    (window as { showDirectoryPicker?: unknown }).showDirectoryPicker = vi.fn(async () => folder.handle);
    URL.createObjectURL = vi.fn(() => 'blob:x');
    await pickSaveFolder('u1');
    await expect(saveToFolder('u2', new Blob(['x']), 'a.mp4')).resolves.toBe('download');
    await expect(saveToFolder('u1', new Blob(['x']), 'a.mp4')).resolves.toBe('download');
    expect(folder.written).toHaveLength(0);
  });
});
