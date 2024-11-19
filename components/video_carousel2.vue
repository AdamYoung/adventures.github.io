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
const perspective = ref(1400);
const baseDepth = 3000; // Reduced depth
const spacing = 400; // Much tighter spacing
const flipAngle = 0.4; // Angle for rolodex effect

const videoRefs = ref([]);
const videoKeys = reactive({
  left: Array(props.leftVideos.length).fill(0),
  right: Array(props.rightVideos.length).fill(0)
});

// Add window width reactive reference
const windowWidth = ref(0);
const baseVideoWidth = computed(() => Math.min(windowWidth.value * 0.3, 600)); // 30% of viewport width, max 600px

// Initialize with offset positions
const positions = reactive({
  left: Array(props.leftVideos.length).fill(0).map((_, i) => ({
    x: -windowWidth.value * 0.45,
    y: 0,
    z: i * spacing,
    rotation: -flipAngle * (i + 1), // Progressive rotation
    scale: 1.4
  })),
  right: Array(props.rightVideos.length).fill(0).map((_, i) => ({
    x: windowWidth.value * 0.45,
    y: 0,
    z: (i * spacing) + 200, // Reduced stagger
    rotation: flipAngle * (i + 1), // Progressive rotation
    scale: 1.4
  }))
});

// Add tilt effect state
const tiltX = ref(0);
const tiltY = ref(0);

const animate = () => {
  ['left', 'right'].forEach(side => {
    positions[side] = positions[side].map(pos => {
      pos.z -= 12; // Slightly faster movement
      const progress = 1 - (pos.z / baseDepth);
      
      // Tighter convergence points
      pos.x = side === 'right' ? 
        mapRange(progress, 0, 1, windowWidth.value * 0.45, windowWidth.value * 0.08) :
        mapRange(progress, 0, 1, -windowWidth.value * 0.45, -windowWidth.value * 0.08);
      
      // More dramatic Y movement for rolodex effect
      pos.y = mapRange(progress, 0, 1, 300, -100);
      
      // Enhanced rotation for rolodex effect
      const baseRotation = side === 'right' ? flipAngle : -flipAngle;
      pos.rotation = side === 'right' ? 
        mapRange(progress, 0, 1, baseRotation, -baseRotation * 0.5) :
        mapRange(progress, 0, 1, baseRotation, -baseRotation * 0.5);

      // Scale with more dramatic change
      pos.scale = mapRange(progress, 0, 1, 1.4, 0.3);

      // Reset position when too close
      if (pos.z < -600) { // Reset sooner
        pos.z = baseDepth;
        pos.scale = 1.4; // Reset to larger scale
        pos.rotation = side === 'right' ? flipAngle : -flipAngle;
        videoKeys[side][positions[side].indexOf(pos)]++;
      }
      
      return pos;
    });
  });
  
  requestAnimationFrame(animate);
};

onMounted(() => {
  // Set initial window width
  windowWidth.value = window.innerWidth;
  
  // Add resize listener
  window.addEventListener('resize', () => {
    windowWidth.value = window.innerWidth;
  });
  
  animate();
});

onUnmounted(() => {
  window.removeEventListener('resize', () => {
    windowWidth.value = window.innerWidth;
  });
  cancelAnimationFrame(animationFrame);
});

const getVideoStyle = (video: VideoItem, index: number, isRight: boolean) => {
  const pos = positions[isRight ? 'right' : 'left'][index];
  
  return {
    transform: `
      translateX(${pos.x}px) 
      translateY(${pos.y}px) 
      translateZ(${pos.z}px)
      rotateY(${pos.rotation}rad)
      scale(${pos.scale})
    `,
    opacity: mapRange(pos.z, baseDepth, -600, 0.2, 1),
    zIndex: Math.round(baseDepth - pos.z)
  };
};

// Helper function to map range
const mapRange = (value: number, in_min: number, in_max: number, out_min: number, out_max: number) => {
  return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
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
</script>

<template>
  <div class="carousel-container"
       @mousemove="handleMouseMove"
       @mouseleave="resetTilt"
       :style="`perspective: ${perspective}px`">
    
    <!-- Left side videos -->
    <div v-for="(video, index) in leftVideos" 
         :key="`left-${video.id}-${videoKeys.left[index]}`" 
         class="video-card"
         :style="getVideoStyle(video, index, false)">
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
         :style="getVideoStyle(video, index, true)">
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
  perspective: calc(100vw * 1.6);
  perspective-origin: 50% 40%;
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
  overflow: hidden;
}

.video-card {
  position: absolute;
  width: 38vw; /* Slightly larger */
  max-width: 800px; 
  aspect-ratio: 16/9;
  transform-origin: center center;
  pointer-events: none;
  will-change: transform, opacity;
  transition: transform 0.05s linear; /* Snappier transitions */
}

.video-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: min(1.5vw, 13px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.6);
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
  left: 0;
  background: rgba(0, 0, 0, 0.7);
  padding: min(1.5vw, 12px) min(2vw, 24px);
  margin: 24px;
  font-size: min(1.5vw, 18px);
  letter-spacing: -0.18px;
  color: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  transition: opacity 0.2s ease;
}

.author-tag a {
  color: inherit;
  text-decoration: none;
}

.author-tag a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .video-card {
    width: 50vw; /* Wider on mobile */
  }
  
  .author-tag {
    font-size: 14px;
    padding: 8px 16px;
  }
}
</style>