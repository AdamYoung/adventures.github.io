<template>
  <div class="slideshow">
    <!-- Add start overlay -->
    <div v-if="!hasStarted" class="start-overlay">
      <button class="start-button" @click="startStory">
        Start Story
      </button>
    </div>

    <transition-group name="fade">
      <!-- Preloaded Next Slide --> 
      <div 
        v-if="nextSlideBg"
        key="next"
        class="slide next"
      >
        <div
          class="slide-media"
          :style="{ backgroundImage: `url(${nextSlideBg.image || ''})` }"
        />
      </div>

      <!-- Current Slide -->
      <div 
        v-if="currentSlide"
        key="current"
        class="slide current"
      >
        <div
          class="slide-media"
          :style="{ backgroundImage: `url(${currentSlide.image || ''})` }"
        />
        <video
          v-if="currentSlide.video"
          ref="currentVideo"
          class="slide-media"
          :class="{ 'video-ready': videoReady }"
          :src="currentSlide.video"
          preload="auto"
          muted
          playsinline
          :loop="false"
          @loadeddata="onVideoLoaded"
          @ended="onVideoEnded"
          playbackRate="0.75"
        />
      </div>
    </transition-group>

    <audio ref="audioPlayer" :src="musicSrc" preload="auto" @timeupdate="checkSlideTransition" />

    <div class="controls">
      <button 
        v-show="currentIndex > 0"
        class="control-button left" 
        @click="previousSlide"
        aria-label="Previous slide"
      >
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path 
            d="M15.5 5.5L8.5 12l7 6.5"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <button 
        v-show="currentIndex < slides.length - 1"
        class="control-button right" 
        @click="nextSlide"
        aria-label="Next slide"
      >
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path 
            d="M8.5 5.5L15.5 12l-7 6.5"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  slides: {
    type: Array,
    required: true,
    validator: (value) => value.every(slide => 
      (typeof slide.image === 'string' || typeof slide.video === 'string') &&
      typeof slide.time === 'number'
    )
  },
  musicSrc: {
    type: String,
    required: true
  }
})

const currentIndex = ref(0)
const isTransitioning = ref(false)
const audioPlayer = ref(null)
const currentVideo = ref(null)
const videoReady = ref(false)
const hasStarted = ref(false)

const currentSlide = computed(() => props.slides[currentIndex.value])
const nextSlideBg = computed(() => 
  currentIndex.value < props.slides.length - 1 ? props.slides[currentIndex.value + 1] : null
)

function checkSlideTransition() {
  if (!audioPlayer.value || isTransitioning.value) return
  
  const currentTime = audioPlayer.value.currentTime
  const nextSlideIndex = currentIndex.value + 1
  
  // Add a small buffer (0.1s) to prevent premature transitions
  if (props.slides[nextSlideIndex] && 
      currentTime >= props.slides[nextSlideIndex].time && 
      currentTime - props.slides[nextSlideIndex].time < 0.1) {
    nextSlide()
  }
}

// Modify onMounted to remove auto-play
onMounted(() => {
  // Remove auto-play logic
})

onBeforeUnmount(() => {
  if (audioPlayer.value) {
    audioPlayer.value.pause()
  }
})

// Modify watch to only handle video
watch(() => currentIndex.value, (newVal) => {
  // Reset video state
  videoReady.value = false
  
  // Play video if exists
  if (currentVideo.value) {
    currentVideo.value.currentTime = 0
    currentVideo.value.playbackRate = 0.75
    currentVideo.value.play()
  }
}, { immediate: true })

function onVideoLoaded() {
  videoReady.value = true
  if (currentVideo.value && hasStarted.value) {
    currentVideo.value.playbackRate = 0.75
    currentVideo.value.play()
  }
}

function nextSlide() {
  if (currentIndex.value < props.slides.length - 1 && !isTransitioning.value) {
    isTransitioning.value = true
    if (currentVideo.value) {
      currentVideo.value.pause()
    }
    currentIndex.value++
    // Sync audio position only on manual navigation
    if (audioPlayer.value && props.slides[currentIndex.value]) {
      audioPlayer.value.currentTime = props.slides[currentIndex.value].time
    }
    setTimeout(() => {
      isTransitioning.value = false
    }, 500)
  }
}

function previousSlide() {
  if (currentIndex.value > 0 && !isTransitioning.value) {
    isTransitioning.value = true
    if (currentVideo.value) {
      currentVideo.value.pause()
    }
    currentIndex.value--
    // Sync audio position only on manual navigation
    if (audioPlayer.value && props.slides[currentIndex.value]) {
      audioPlayer.value.currentTime = props.slides[currentIndex.value].time
    }
    setTimeout(() => {
      isTransitioning.value = false
    }, 500)
  }
}

function onVideoEnded() {
  // Empty function - let video naturally hold its last frame
}

function startStory() {
  hasStarted.value = true
  if (audioPlayer.value) {
    audioPlayer.value.play()
  }
  if (currentVideo.value) {
    currentVideo.value.play()
  }
}
</script>

<style scoped>
.slideshow {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 1;
}

.slide.next {
  z-index: 1;
}

.slide.current {
  z-index: 2;
}

.controls {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 4;
}

.control-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 1rem;
  color: white;
  opacity: 0.7;
  transition: all 0.3s ease;
  pointer-events: auto;
}

.control-button:hover {
  opacity: 1;
  transform: translateY(-50%) scale(1.1);
}

.control-button.left {
  left: 1rem;
}

.control-button.right {
  right: 1rem;
}

.chevron {
  width: clamp(24px, 5vw, 48px);
  height: clamp(24px, 5vw, 48px);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.7));
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease;
  position: absolute;
  width: 100%;
  height: 100%;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: scale(1);
}

@keyframes pulse {
  0% { transform: translateY(-50%) scale(1); }
  50% { transform: translateY(-50%) scale(1.2); }
  100% { transform: translateY(-50%) scale(1); }
}

.pulse {
  animation: pulse 2s infinite;
}

.slide-media {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slide-media:not(video) {
  z-index: 1;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

video.slide-media {
  z-index: 2;
  opacity: 0;
  transition: opacity 1s ease;
}

video.slide-media.video-ready {
  opacity: 1;
}

@media (max-width: 768px) {
  .control-button {
    padding: 0.5rem;
  }
  
  .control-button.left {
    left: 0.5rem;
  }
  
  .control-button.right {
    right: 0.5rem;
  }
}

.start-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.start-button {
  padding: 1rem 2rem;
  font-size: 1.5rem;
  background: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.start-button:hover {
  transform: scale(1.1);
}
</style>