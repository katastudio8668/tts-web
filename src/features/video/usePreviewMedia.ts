import { useEffect, useRef, useState } from 'react';
import { fetchAudio } from '../../lib/api';
import { assetKey, browserStore } from './browserStore';
import type { RequiredAsset } from './types';

/** Object URLs for the preview: local files from this browser's store, voices downloaded once from the API. */
export function usePreviewMedia(params: { requiredAssets: RequiredAsset[]; userId: string; projectId: string; token: string; version: number }) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const cache = useRef(new Map<string, string>());

  useEffect(() => {
    let active = true;
    const { requiredAssets, userId, projectId, token } = params;
    void (async () => {
      const next: Record<string, string> = {};
      for (const asset of requiredAssets) {
        const cacheKey = asset.kind === 'generation' ? `gen:${asset.generationId}` : `local:${asset.assetId}:${params.version}`;
        let url = cache.current.get(cacheKey);
        if (!url) {
          try {
            if (asset.kind === 'generation') {url = await fetchAudio(`/generations/${asset.generationId}/audio`, token);} else {
              const blob = await browserStore.get<Blob>('assets', assetKey(userId, projectId, asset.assetId));
              url = blob ? URL.createObjectURL(blob) : undefined;
            }
          } catch {
            url = undefined;
          }
          if (url) {cache.current.set(cacheKey, url);}
        }
        if (url) {next[asset.assetId] = url;}
      }
      if (active) {setUrls(next);}
    })();
    return () => { active = false; };
  }, [params.requiredAssets, params.userId, params.projectId, params.token, params.version]);

  useEffect(() => {
    const store = cache.current;
    return () => { store.forEach((url) => URL.revokeObjectURL(url)); store.clear(); };
  }, []);

  return urls;
}
