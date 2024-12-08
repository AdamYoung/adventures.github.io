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
        <div 
          class="slide-text"
          :class="{ 'fade-out': !textVisible }"
        >
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
      class="control-button auto-play"
      @click="toggleAutoPlay"
      aria-label="Toggle auto play"
    >
      <svg v-if="!autoPlay" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path 
          d="M5 3l14 9-14 9V3z"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path 
          d="M6 4h4v16H6V4zM14 4h4v16h-4V4z"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <span>Auto<br>Play</span>
    </button>

    <button 
      v-show="isTextDone && !autoPlay"
      class="control-button replay"
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

    <button 
      class="control-button speech-toggle"
      @click="toggleSpeech"
      aria-label="Toggle speech"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path v-if="!speechMuted"
          d="M12 6L8 10H4v4h4l4 4V6z M16 8.5a5 5 0 0 1 0 7 M19 6a8 8 0 0 1 0 12"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path v-else
          d="M12 6L8 10H4v4h4l4 4V6z M18 12l3-3 M18 12l3 3"
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
const autoPlay = ref(true)
const textVisible = ref(true)
const speechMuted = ref(false)

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
  //prepareSlide()
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

function resetCurrentVideo() {
  if (currentVideo.value) {
    currentVideo.value.pause();
    currentVideo.value.currentTime = 0;
  }
}

function prepareSlide() {
  stop()
  resetCurrentVideo()
  words.value = currentSlide.value.text.split(' ')
  currentWordIndex.value = -1
  isTextDone.value = false
  videoReady.value = false
  textVisible.value = true
  console.log('here',currentSlide.value,currentVideo.value);
  if (currentSlide.value.video && currentVideo.value) {
    currentVideo.value.load()
    
    setTimeout(() => {
      if (!speechMuted.value) {
        speak(
          currentSlide.value.text,
          (index) => currentWordIndex.value = index,
          () => {
            isTextDone.value = true
            currentVideo.value.currentTime = 0;
            videoReady.value = true
            textVisible.value = false // Hide text when video starts
            currentVideo.value.play().catch(err => console.warn('Video playback failed:', err))
          }
        )
      } else {
        isTextDone.value = true
        videoReady.value = true
        textVisible.value = false
        currentVideo.value.play().catch(err => console.warn('Video playback failed:', err))
      }
    }, 500)
  } else {
    // Image-only slides behavior remains the same
    setTimeout(() => {
      if (!speechMuted.value) {
        speak(
          currentSlide.value.text,
          (index) => currentWordIndex.value = index,
          () => {
            isTextDone.value = true
            if (autoPlay.value) {
              // Add slight delay before moving to next slide for image-only slides
              setTimeout(() => nextSlide(), 1500)
            }
          }
        )
      } else {
        isTextDone.value = true
        if (autoPlay.value) {
          setTimeout(() => nextSlide(), 1500)
        }
      }
    }, 500)
  }
}

function onVideoEnded() {
  if (autoPlay.value) {
   setTimeout(() => {
      nextSlide()
    }, 300)       
  }
}

function nextSlide() {
  if (currentIndex.value < props.slides.length - 1 && !isTransitioning.value) {
    isTransitioning.value = true
    videoReady.value = false
    resetCurrentVideo()
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
    resetCurrentVideo()
    stop()
    
    currentIndex.value--
    // Reset transition flag after animation completes
    setTimeout(() => {
      isTransitioning.value = false
      prepareSlide()
    }, 500)
  }
}

function toggleAutoPlay() {
  autoPlay.value = !autoPlay.value
  if (autoPlay.value && isTextDone.value) {
    if (currentVideo.value) {
      videoReady.value = true
      currentVideo.value.play().catch(err => console.warn('Video playback failed:', err))
    } else {
      nextSlide()
    }
  }
}

function toggleSpeech() {
  speechMuted.value = !speechMuted.value
  if (speechMuted.value) {
    stop()
  } else if (!isTextDone.value) {
    prepareSlide() // Restart speech for current slide
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
  opacity: 1;
  transition: opacity 0.5s ease;
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

.slide-text.fade-out {
  opacity: 0;
  pointer-events: none;
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

/* Replace the existing replay-button styles with these */
.control-button.auto-play,
.control-button.replay {
  position: fixed;
  bottom: 2rem;
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
  pointer-events: auto;
  transform: none; /* Remove the translateY that was affecting these buttons */
  top:auto;
}

.control-button.auto-play {
  right: 2rem;
}

.control-button.replay {
  right: 6rem;
}

.control-button.auto-play:hover,
.control-button.replay:hover {
  background: rgba(0, 0, 0, 0.7);
  transform: scale(1.1);
}

.control-button.auto-play svg,
.control-button.replay svg {
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
  /*transition: opacity 1s ease;*/
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
.control-button.auto-play span{
   position: absolute;
   text-transform: uppercase;
   font-size:12px;
   opacity:0.6;
   font-weight:bold;
   top:10px;
}

/* Replace the speech-toggle button styles */
.control-button.speech-toggle {
  position: fixed;
  bottom: 2rem;
  left: 2rem;
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
  pointer-events: auto;
  transform: none; /* Reset any transform */
  top: auto;
}

.control-button.speech-toggle:hover {
  background: rgba(0, 0, 0, 0.7);
  transform: scale(1.1); /* Only scale, no translation */
}

/* Make sure span behaves the same as auto-play span */
.control-button.speech-toggle span {
  position: absolute;
  text-transform: uppercase;
  font-size: 12px;
  opacity: 0.6;
  font-weight: bold;
  top: 10px;
}
</style>