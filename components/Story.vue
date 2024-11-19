<template>
  <div class="slideshow">
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
          @ended="onVideoEnded"
        />
        <div class="slide-text">
          <span
            v-for="(word, index) in words"
            :key="`${currentIndex}-${index}`"
            :class="{ highlight: index === currentWordIndex }"
          >
            {{ word }}
          </span>
        </div>
      </div>
    </transition-group>

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
        :class="{ pulse: isTextDone }"
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

    <button 
      v-show="isTextDone"
      class="replay-button"
      @click="replaySlide"
      aria-label="Replay slide"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path 
          d="M3 12a9 9 0 1 1 2.83 6.54M3 12V8m0 4h4" 
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  slides: {
    type: Array,
    required: true,
    validator: (value) => value.every(slide => 
      typeof slide.text === 'string' &&
      (typeof slide.image === 'string' || typeof slide.video === 'string')
    )
  }
})

const currentIndex = ref(0)
const words = ref([])
const currentWordIndex = ref(-1)
const isTextDone = ref(false)
const isTransitioning = ref(false)

const { speak, stop } = useSpeech()

const currentSlide = computed(() => props.slides[currentIndex.value])
const nextSlideBg = computed(() => {
  if (currentIndex.value < props.slides.length - 1) {
    return props.slides[currentIndex.value + 1]
  }
  return null
})

const currentVideo = ref(null)
const videoReady = ref(false)

function replaySlide() {
  isTextDone.value = false
  videoReady.value = false
  if (currentVideo.value) {
    currentVideo.value.currentTime = 0
    setTimeout(() => {
      videoReady.value = true
      currentVideo.value.play()
      prepareSlide()
    }, 500)
  } else {
    prepareSlide()
  }
}

watch(currentSlide, () => {
  prepareSlide()
}, { immediate: true })

onMounted(() => {
  if ('speechSynthesis' in window) {
    // Ensure browser is ready for speech synthesis
    setTimeout(() => {
      prepareSlide()
    }, 500)
  } else {
    console.error('Speech synthesis not supported')
  }
})

onBeforeUnmount(() => {
  stop()
})

function prepareSlide() {
  stop()
  words.value = currentSlide.value.text.split(' ')
  currentWordIndex.value = -1
  isTextDone.value = false
  videoReady.value = false
  
  // Handle video if present
  if (currentSlide.value.video && currentVideo.value) {
    currentVideo.value.currentTime = 0
    currentVideo.value.load() // Force video reload
    
    // Longer delay to show image first
    setTimeout(() => {
      videoReady.value = true
      currentVideo.value.play().catch(err => console.warn('Video playback failed:', err))
      speak(
        currentSlide.value.text,
        (index) => currentWordIndex.value = index,
        () => isTextDone.value = true
      )
    }, 1500) // Increased delay to 1.5s
  } else {
    // Start speech immediately for image-only slides
    setTimeout(() => {
      speak(
        currentSlide.value.text,
        (index) => currentWordIndex.value = index,
        () => isTextDone.value = true
      )
    }, 500)
  }
}

function onVideoEnded() {
  // Empty function - let video naturally hold its last frame
}

function nextSlide() {
  if (currentIndex.value < props.slides.length - 1 && !isTransitioning.value) {
    isTransitioning.value = true
    videoReady.value = false
    if (currentVideo.value) {
      currentVideo.value.pause()
    }
    stop()
    
    currentIndex.value++
    // Reset transition flag after animation completes
    setTimeout(() => {
      isTransitioning.value = false
      prepareSlide()
    }, 500)
  }
}

function previousSlide() {
  if (currentIndex.value > 0 && !isTransitioning.value) {
    isTransitioning.value = true
    videoReady.value = false
    if (currentVideo.value) {
      currentVideo.value.pause()
    }
    stop()
    
    currentIndex.value--
    // Reset transition flag after animation completes
    setTimeout(() => {
      isTransitioning.value = false
      prepareSlide()
    }, 500)
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

.slide-text {
  position: absolute;
  bottom: max(3%, 20px);
  width: min(98%, 1200px);
  margin: 0 auto;
  left: 0;
  right: 0;
  text-align: center;
  font-size: clamp(1rem, 4vw, 2rem);
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
  padding: 1rem;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(2px);
  z-index: 3;
}

.slide-text span {
  display: inline-block;
  margin: 0 0.25em;
  transition: all 0.2s ease;
}

.slide-text .highlight {
  background-color: rgba(255, 255, 0, 0.8);
  color: black;
  padding: 0.1em 0.2em;
  border-radius: 4px;
  transform: scale(1.1);
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

.replay-button {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 48px;
  height: 48px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 4;
}

.replay-button:hover {
  background: rgba(0, 0, 0, 0.7);
  transform: scale(1.1);
}

.replay-button svg {
  width: 24px;
  height: 24px;
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
</style>