<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
interface PreloadAsset {
  type: 'image' | 'audio' | 'video';
  src: string;
}

const router = useRouter();
const assetPreloader = useAssetPreloader();

router.beforeEach((to, from, next) => {
  const assets = to.meta.preloadAssets as PreloadAsset[] | undefined;
  
  if (assets) {
    assetPreloader.queueBatch(assets, () => {
      console.log(`Finished preloading assets for route: ${to.path}`);
    });
  }
  next();
});
</script>

<style>
:root {
  --font-editorial: "Editorial New", serif;
}

body {
  margin: 0;
  padding: 0;
  background: #000;
  color: #fff;
  font-family: "Source Serif 4", 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  font-optical-sizing: auto;
  font-weight: normal;
  font-style: normal;  
}
</style>