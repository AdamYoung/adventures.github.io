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
const totalPages = 6; // Set your total number of pages here
const assetPreloader = useAssetPreloader();

// Generate assets array for a specific page
const getPageAssets = (pageNum) => [
  { type: 'image', src: `/page${pageNum}.png` },
  { type: 'audio', src: `/page${pageNum}.mp3` },
  { type: 'video', src: `/page${pageNum}.mp4` }
];

// Load pages sequentially
let currentPage = 1;
const loadNextPage = () => {
  if (currentPage <= totalPages) {
    assetPreloader.queueBatch(getPageAssets(currentPage), () => {
      console.log(`Page ${currentPage} loaded`);
      currentPage++;
      loadNextPage();
    });
  }
};

// Start loading the first page
loadNextPage();

const textContainer = ref(null)
const COLLAPSE_DURATION = 2.5

const handleComplete = () => {
  gsap.to(textContainer.value, {
    height: 0,
    opacity: 0,
    duration: COLLAPSE_DURATION,
    onComplete: () => navigateTo('/story')
  })
}
</script>

<style scoped>
.text-container {
  overflow: hidden;
  width: 100%;
  /*max-width: 800px;*/
  display: flex;
  justify-content: center;
  align-items: center;
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
machine-gun { 
  width: 100%;
  display: block;
  font-size: 1.2rem;
  text-align: center;
}
</style>