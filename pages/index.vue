<!-- pages/index.vue -->
<template>
  <div class="home">
   <div ref="textContainer" class="text-container">
      <machine-gun
         :text="`A world of wonder awaits. Get ready for the epic adventures of Mya and Khita!`"
         :speed="6"
         :loop="false"
         :repeat="0"
         :max-length="50"
         :on-complete="handleComplete"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import gsap from 'gsap'
const totalPages = 6;
const assetPreloader = useAssetPreloader();

// Separate image loading from other assets
const preloadAllImages = async () => {
  const imagePromises = Array.from({ length: totalPages }, (_, i) => 
    assetPreloader.preloadSingle({ type: 'image', src: `/page${i + 1}.png` })
  );
  await Promise.all(imagePromises);
  console.log('All images loaded');
  startMediaLoading();
};

// Generate assets array without images
const getPageAssets = (pageNum) => [
  { type: 'audio', src: `/page${pageNum}.mp3` },
  { type: 'video', src: `/page${pageNum}.mp4` }
];

// Load media sequentially
let currentPage = 1;
const startMediaLoading = () => {
  if (currentPage <= totalPages) {
    assetPreloader.queueBatch(getPageAssets(currentPage), () => {
      console.log(`Page ${currentPage} media loaded`);
      currentPage++;
      startMediaLoading();
    });
  }
};

// Start with image loading
preloadAllImages();

const textContainer = ref(null)
const COLLAPSE_DURATION = 2.5

const handleComplete = () => {
  gsap.to(textContainer.value, {
    height: 0,
    opacity: 0,
    duration: COLLAPSE_DURATION,
    onComplete: () => navigateTo('/shapes')
  })
}
</script>

<style scoped>
.text-container {
  overflow: hidden;
  min-height: 50px;
}

.home {
   position:absolute;
   top:0;
   bottom:0;
   right:0;
   left:0;  
   display:flex;
   justify-content:center;
   align-items: center;
}
machine-gun{ 
   width:100%;
}
</style>