interface PreloadAsset {
  type: 'image' | 'audio' | 'video';
  src: string;
}

export const useAssetPreloader = () => {
  const preloadCache = new Set<string>();
  const batchQueue: Array<{ assets: PreloadAsset[], callback?: () => void }> = [];
  let isProcessingBatch = false;

  const preloadImage = (src: string): Promise<void> => {
    if (preloadCache.has(src)) return Promise.resolve();
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve(); // Resolve anyway to not block the batch
      img.src = src;
      preloadCache.add(src);
    });
  };

  const preloadAudio = (src: string): Promise<void> => {
    if (preloadCache.has(src)) return Promise.resolve();
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.oncanplaythrough = () => resolve();
      audio.onerror = () => resolve();
      audio.src = src;
      preloadCache.add(src);
    });
  };

  const preloadVideo = (src: string): Promise<void> => {
    if (preloadCache.has(src)) return Promise.resolve();
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => resolve();
      video.onerror = () => resolve();
      video.src = src;
      preloadCache.add(src);
    });
  };

  const processBatch = async () => {
    if (isProcessingBatch || batchQueue.length === 0) return;
    
    isProcessingBatch = true;
    const currentBatch = batchQueue.shift()!;
    
    const promises = currentBatch.assets.map(asset => {
      switch (asset.type) {
        case 'image': return preloadImage(asset.src);
        case 'audio': return preloadAudio(asset.src);
        case 'video': return preloadVideo(asset.src);
        default: return Promise.resolve();
      }
    });

    await Promise.all(promises);
    currentBatch.callback?.();
    
    isProcessingBatch = false;
    processBatch(); // Process next batch if available
  };

  const queueBatch = (assets: PreloadAsset[], callback?: () => void) => {
    batchQueue.push({ assets, callback });
    processBatch();
  };

  const preloadSingle = async (asset: PreloadAsset): Promise<void> => {
    switch (asset.type) {
      case 'image': return preloadImage(asset.src);
      case 'audio': return preloadAudio(asset.src);
      case 'video': return preloadVideo(asset.src);
      default: return Promise.resolve();
    }
  };

  return {
    queueBatch,
    preloadSingle
  };
};

// Make sure to export the interface if needed
export type { PreloadAsset };