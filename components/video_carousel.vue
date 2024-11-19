<script setup lang="ts">
interface VideoItem {
  id: number;
  thumbnail: string;
  videoUrl: string;
  author: string;
  authorLink: string;
  title?: string;
}

const props = defineProps<{
  leftVideos: VideoItem[];
  rightVideos: VideoItem[];
}>()

const isHovering = ref(false);
const perspective = ref(3000); // Increased perspective for larger view
const baseDepth = 6000; // Increased depth
const spacing = 1000; // More space between larger videos
const yOffset = 200; // Move starting point lower

const videoRefs = ref([]);
const videoKeys = reactive({
  left: Array(props.leftVideos.length).fill(0),
  right: Array(props.rightVideos.length).fill(0)
});

// Add window width reactive reference at the top with other refs
const windowWidth = ref(1920);
const windowHeight = ref(1080);
let animationFrame: number;

// Initialize positions with safe defaults
const positions = reactive({
  left: Array(props.leftVideos.length).fill(0).map((_, i) => ({
    x: -500, // safe default
    y: 500,  // safe default
    z: i * spacing,
    rotation: -0.3,
    scale: 1.4
  })),
  right: Array(props.rightVideos.length).fill(0).map((_, i) => ({
    x: 500,  // safe default
    y: 600,  // safe default
    z: (i * spacing) + 400,
    rotation: 0.3,
    scale: 1.4
  }))
});

// Add tilt effect state
const tiltX = ref(0);
const tiltY = ref(0);

// Add new reactive states
const isPortrait = ref(true);
const showOrientationOverlay = ref(false);
const isAnimationPaused = ref(true);

// Add orientation check function
const checkOrientation = () => {
  if (typeof window !== 'undefined') {
    const isPortraitMode = window.innerHeight > window.innerWidth;
    isPortrait.value = isPortraitMode;
    showOrientationOverlay.value = isPortraitMode;
    isAnimationPaused.value = isPortraitMode;
    
    if (!isPortraitMode && isAnimationPaused.value) {
      isAnimationPaused.value = false;
      animate();
    }
  }
};

// Update window dimensions function
const updateWindowDimensions = () => {
  if (typeof window !== 'undefined') {
    windowWidth.value = window.innerWidth;
    windowHeight.value = window.innerHeight;
    
    // Update perspective based on window width for better mobile experience
    perspective.value = Math.min(2200, window.innerWidth * 1.5);
  }
};

// Update z-index calculation and animation constants
const Z_INDEX_BASE = 100000;
const FADE_START = 0.9; // Start fade out at 90%
const START_Y_OFFSET = 0.6; // Move starting point lower (60% of screen height)

// Update animate function for better positioning
const animate = () => {
  if (isAnimationPaused.value) return;
  
  ['left', 'right'].forEach(side => {
    positions[side] = positions[side].map(pos => {
      pos.z -= 8;
      const progress = 1 - (pos.z / baseDepth);
      
      // Wider spread for larger videos (x position remains same)
      pos.x = side === 'right' ? 
        mapRange(progress, 0, 1, windowWidth.value * 0.9, windowWidth.value * 0.15) :
        mapRange(progress, 0, 1, -windowWidth.value * 0.9, -windowWidth.value * 0.15);
      
      // Adjusted vertical movement - start lower but keep same end point
      pos.y = side === 'right' ?
        mapRange(progress, 0, 1, windowHeight.value * START_Y_OFFSET + 100, -200) :
        mapRange(progress, 0, 1, windowHeight.value * START_Y_OFFSET, -250);
      
      pos.scale = mapRange(progress, 0, 1, 1.8, 0.4);
      
      if (pos.z < -1000) {
        pos.z = baseDepth;
        pos.scale = 1.8;
        pos.y = windowHeight.value * START_Y_OFFSET + (side === 'right' ? 100 : 0);
        videoKeys[side][positions[side].indexOf(pos)]++;
      }
      
      return pos;
    });
  });
  
  animationFrame = requestAnimationFrame(animate);
};

// Update the onMounted hook
onMounted(() => {
  updateWindowDimensions();
  checkOrientation();
  
  // Initialize positions with actual window dimensions
  ['left', 'right'].forEach(side => {
    positions[side].forEach(pos => {
      if (side === 'right') {
        pos.x = windowWidth.value * 0.7;
        pos.y = windowHeight.value * START_Y_OFFSET + 100;
      } else {
        pos.x = -windowWidth.value * 0.7;
        pos.y = windowHeight.value * START_Y_OFFSET;
      }
    });
  });

  window.addEventListener('resize', () => {
    updateWindowDimensions();
    checkOrientation();
  });
  
  // Add orientation change event listener
  window.addEventListener('orientationchange', () => {
    setTimeout(checkOrientation, 100); // Small delay to ensure proper dimension updates
  });

  // Only start animation if not in portrait mode
  if (!isPortrait.value) {
    animate();
  }
});

// Update onUnmounted to clean up new event listener
onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', updateWindowDimensions);
    window.removeEventListener('orientationchange', checkOrientation);
  }
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }
});

// Update getVideoStyle for better z-indexing and fade
const getVideoStyle = (video: VideoItem, index: number, isRight: boolean) => {
  const pos = positions[isRight ? 'right' : 'left'][index];
  const side = isRight ? 'right' : 'left';
  const isFocused = focusedVideo.value?.id === video.id;
  const isOtherFocused = focusedVideo.value && focusedVideo.value.id !== video.id;
  
  // Calculate normalized position and opacity
  const normalizedZ = (baseDepth + pos.z) / (baseDepth + 1000);
  let opacity = 1;
  
  // Handle fade in/out
  if (normalizedZ > FADE_START) {
    opacity = mapRange(normalizedZ, FADE_START, 1, 1, 0);
  } else if (normalizedZ < 0.05) {
    opacity = mapRange(normalizedZ, 0, 0.05, 0, 1);
  }
  
  if (isFocused) {
    return {
      transform: `
        translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px)
        rotateY(0rad)
        scale(${pos.scale})
      `,
      opacity: 1,
      zIndex: Z_INDEX_BASE + 1000,
      transition: 'all 0.5s ease-out'
    };
  }
  
  // Ensure z-index properly sorts videos front to back
  const zIndex = Math.round(Z_INDEX_BASE - (normalizedZ * Z_INDEX_BASE));
  
  return {
    transform: `
      translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px)
      rotateY(${pos.rotation}rad)
      scale(${pos.scale})
    `,
    opacity: isOtherFocused ? 0.2 : Math.max(0, Math.min(1, opacity)),
    zIndex,
    transition: isOtherFocused ? 'opacity 0.3s ease-out' : undefined
  };
};

// Helper function to map range
const mapRange = (value: number, in_min: number, in_max: number, out_min: number, out_max: number) => {
  return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
};

// Add easing functions
const easeInExpo = (x: number): number => {
  return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
};

const easeOutExpo = (x: number): number => {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
};

// Add method to handle video loading
const handleVideoLoad = (video) => {
  video.play().catch(() => {
    // Handle autoplay restrictions
    video.muted = true;
    video.play();
  });
};

// Add mouse move handler for tilt effect
const handleMouseMove = (e: MouseEvent) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  tiltX.value = ((y - rect.height / 2) / rect.height) * -10;
  tiltY.value = ((x - rect.width / 2) / rect.width) * 10;
};

const resetTilt = () => {
  tiltX.value = 0;
  tiltY.value = 0;
};

// Add new reactive states for interactions
const hoveredVideoId = ref<number | null>(null);
const focusedVideo = ref<{ id: number; side: 'left' | 'right'; index: number } | null>(null);
const originalPositions = ref<any>(null);

// Add hover handlers
const handleVideoHover = (videoId: number) => {
  if (!focusedVideo.value) {
    hoveredVideoId.value = videoId;
    isAnimationPaused.value = true;
  }
};

const handleVideoLeave = () => {
  if (!focusedVideo.value) {
    hoveredVideoId.value = null;
    isAnimationPaused.value = false;
    animate();
  }
};

// Add click/touch handlers
const handleVideoFocus = (video: VideoItem, index: number, side: 'left' | 'right') => {
  if (focusedVideo.value?.id === video.id) {
    // Unfocus
    focusedVideo.value = null;
    positions[side][index] = originalPositions.value;
    originalPositions.value = null;
    isAnimationPaused.value = false;
    animate();
  } else {
    // Focus
    isAnimationPaused.value = true;
    focusedVideo.value = { id: video.id, side, index };
    
    // Store original position
    originalPositions.value = { ...positions[side][index] };
    
    // Move to center
    positions[side][index] = {
      x: 0,
      y: windowHeight.value * 0.1,
      z: 0,
      rotation: 0,
      scale: 2.2
    };
  }
}

const { $gsap } = useNuxtApp();

// Replace all gsap. references with $gsap.
// ...existing code...
</script>

<template>
  <div class="carousel-container"
       @mousemove="handleMouseMove"
       @mouseleave="resetTilt"
       :style="`perspective: ${perspective}px`">
    
    <!-- Add orientation overlay -->
    <div v-if="showOrientationOverlay" class="orientation-overlay">
      <div class="orientation-message">
        <i class="rotate-phone-icon">📱</i>
        <p>Please rotate your device to landscape mode for the best experience</p>
      </div>
    </div>

    <!-- Left side videos -->
    <div v-for="(video, index) in leftVideos" 
         :key="`left-${video.id}-${videoKeys.left[index]}`" 
         class="video-card"
         :class="{ 'focused': focusedVideo?.id === video.id }"
         :style="getVideoStyle(video, index, false)"
         @mouseenter="handleVideoHover(video.id)"
         @mouseleave="handleVideoLeave"
         @click="handleVideoFocus(video, index, 'left')">
      <div class="video-wrapper">
        <video ref="videoRefs"
               :src="video.videoUrl"
               :poster="video.thumbnail"
               @loadedmetadata="handleVideoLoad($event.target)"
               loop
               muted
               playsinline />
      </div>
      <div class="author-tag" v-if="video.author">
        <a :href="video.authorLink" target="_blank" rel="noreferrer">
          {{ video.author }}
        </a>
      </div>
    </div>

    <!-- Right side videos -->
    <div v-for="(video, index) in rightVideos"
         :key="`right-${video.id}-${videoKeys.right[index]}`"
         class="video-card"
         :class="{ 'focused': focusedVideo?.id === video.id }"
         :style="getVideoStyle(video, index, true)"
         @mouseenter="handleVideoHover(video.id)"
         @mouseleave="handleVideoLeave"
         @click="handleVideoFocus(video, index, 'right')">
      <div class="video-wrapper">
        <video ref="videoRefs"
               :src="video.videoUrl"
               :poster="video.thumbnail"
               @loadedmetadata="handleVideoLoad($event.target)"
               loop
               muted
               playsinline />
      </div>
      <div class="author-tag" v-if="video.author">
        <a :href="video.authorLink" target="_blank" rel="noreferrer">
          {{ video.author }}
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.carousel-container {
  perspective: calc(100vw * 2.5);
  perspective-origin: 50% 60%;
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-end; /* Align to bottom */
  background: linear-gradient(180deg, #000 0%, #111 100%);
  overflow: hidden;
}

.video-card {
  position: absolute;
  width: 50vw; /* Increased from 40vw */
  max-width: 1000px; /* Increased from 800px */
  left: 50%;
  bottom: 2vh; /* Moved closer to bottom */
  height: 60vh; /* Use viewport height instead of fixed height */
  margin-left: -25vw;
  transform-style: preserve-3d;
  will-change: transform;
  transition: transform 0.1s ease-out;
  cursor: pointer;
}

.video-card.focused {
  cursor: zoom-out;
}

.video-card:not(.focused):hover {
  transform: scale(1.05);
}

.video-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 0 50px rgba(0,0,0,0.7); /* Stronger shadow */
  background: #000;
  transform-style: preserve-3d;
}

video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author-tag {
  position: absolute;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  padding: 10px 18px; /* Larger padding */
  margin: 15px; /* Larger margin */
  font-size: 18px; /* Slightly larger font */
  color: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.author-tag a {
  color: inherit;
  text-decoration: none;
}

.author-tag a:hover {
  text-decoration: underline;
}

.orientation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999;
}

.orientation-message {
  text-align: center;
  color: white;
  padding: 20px;
}

.rotate-phone-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 20px;
  animation: rotate 2s infinite;
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(-90deg); }
  75% { transform: rotate(-90deg); }
  100% { transform: rotate(0deg); }
}

/* Add responsive adjustments */
@media (max-width: 1024px) {
  .video-card {
    width: 60vw;
    margin-left: -30vw;
    height: 50vh;
  }
}

@media (max-width: 768px) {
  .video-card {
    width: 70vw;
    margin-left: -35vw;
    height: 40vh;
  }
}
</style>