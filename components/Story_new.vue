<template>
  <div class="slideshow">
    <!-- Add background music -->
    <audio
      v-if="musicSrc"
      ref="backgroundMusic"
      :src="musicSrc"
      loop
      preload="auto"
      @loadeddata="onBackgroundMusicLoaded"
    ></audio>
    
    <!-- Only show overlay if we actually need user interaction -->
    <div 
      v-if="needsUserInteraction && !hasAutoplayCapability" 
      class="interaction-overlay"
      @click="startPresentation"
    >
      <button class="start-button" aria-label="Start presentation">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path 
            d="M8 5v14l11-7z"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span>Start<br>Story</span>
      </button>
    </div>
    
    <transition name="fade" mode="out-in">
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
        />
        <audio
          v-if="currentSlide.audio"
          ref="currentAudio"
          :src="currentSlide.audio"
          preload="auto"
          @loadeddata="onAudioLoaded"
          @ended="onAudioEnded"
          @timeupdate="onAudioTimeUpdate"
        ></audio>
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
    </transition>

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

    <!-- Update music toggle button SVG -->
    <button 
      class="control-button music-toggle"
      @click="toggleMusic"
      aria-label="Toggle background music"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path
          d="M9 18V6l12-2v12 M9 9h4"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <g v-if="!musicMuted">
          <circle cx="17" cy="16" r="3" stroke-width="2"/>
        </g>
        <g v-else>
          <circle cx="17" cy="16" r="3" stroke-width="2"/>
          <line x1="14" y1="13" x2="20" y2="19" stroke-width="2" stroke-linecap="round"/>
        </g>
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
  },
  musicSrc: {
    type: String,
    default: ''
  }
})

// Add refs for background music
const backgroundMusic = ref(null)
const backgroundMusicLoaded = ref(false)

const currentIndex = ref(0)
const words = ref([])
const currentWordIndex = ref(-1)
const isTextDone = ref(false)
const isTransitioning = ref(false)

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
const currentAudio = ref(null)
const audioLoaded = ref(false)
const audioEnded = ref(false)
const videoEnded = ref(false)

// Add timeout refs
const slideTransitionTimeout = ref(null)
const autoPlayTimeout = ref(null)
const videoStartTimeout = ref(null)
const speechInitTimeout = ref(null)

// Add new ref for video loaded state
const videoLoaded = ref(false)

// Add constant for video fade duration
const VIDEO_FADE_DURATION = 500

// Add new refs for media durations
const videoDuration = ref(0)
const audioDuration = ref(0)

// Add new ref for user interaction state
const needsUserInteraction = ref(true)

// Add ref for autoplay capability
const hasAutoplayCapability = ref(false)

// Add new ref to track if first load
const isFirstLoad = ref(true)

// Add new ref to track audio initialization
const isAudioInitializing = ref(false)

// Add music mute state
const musicMuted = ref(false)

// Add music toggle function
function toggleMusic() {
  musicMuted.value = !musicMuted.value
  if (backgroundMusic.value) {
    if (musicMuted.value) {
      backgroundMusic.value.pause()
    } else if (!needsUserInteraction.value) {
      backgroundMusic.value.play().catch(err => console.warn('Background music playback failed:', err))
    }
  }
}

// Modify onMounted
onMounted(async () => {
  if ('speechSynthesis' in window) {
    try {
      const audio = new Audio();
      audio.muted = true;
      await audio.play();
      hasAutoplayCapability.value = true;
      needsUserInteraction.value = false;
      // Don't call prepareSlide directly, use startPresentation
      startPresentation();
    } catch (err) {
      hasAutoplayCapability.value = false;
      needsUserInteraction.value = true;
    }
  } else {
    console.error('Speech synthesis not supported')
  }
})

// Add new function to handle initial start
function startPresentation() {
  needsUserInteraction.value = false
  
  // Start background music if available and not muted
  if (backgroundMusic.value && backgroundMusicLoaded.value && !musicMuted.value) {
    backgroundMusic.value.volume = 0.2 // Set lower volume for background music
    backgroundMusic.value.play().catch(err => console.warn('Background music playback failed:', err))
  }
  
  // Ensure media elements are properly initialized on first load
  if (isFirstLoad.value) {
    isFirstLoad.value = false;
    // Force a brief delay to ensure DOM is ready
    requestAnimationFrame(() => {
      clearTimeout(speechInitTimeout.value);
      speechInitTimeout.value = setTimeout(() => {
        prepareSlide();
      }, 100);
    });
  } else {
    prepareSlide();
  }
}

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

onBeforeUnmount(() => {
  // Clear all timeouts
  clearTimeout(slideTransitionTimeout.value)
  clearTimeout(autoPlayTimeout.value)
  clearTimeout(videoStartTimeout.value)
  clearTimeout(speechInitTimeout.value)
  stop()
  if (backgroundMusic.value) {
    backgroundMusic.value.pause()
  }
})

function resetCurrentVideo() {
  if (currentVideo.value) {
    currentVideo.value.pause();
    currentVideo.value.currentTime = 0;
  }
}

function resetCurrentAudio() {
  if (currentAudio.value) {
    isAudioInitializing.value = false
    currentAudio.value.pause()
    currentAudio.value.currentTime = 0
  }
}

function prepareSlide() {
  words.value = currentSlide.value.text.split(' ')
  currentWordIndex.value = -1
  isTextDone.value = false
  videoReady.value = false
  textVisible.value = true
  audioLoaded.value = false
  audioEnded.value = false
  videoEnded.value = false

  videoLoaded.value = false
  videoReady.value = false
  
  videoDuration.value = 0
  audioDuration.value = 0
  
  if (currentSlide.value.video && currentVideo.value) {
    currentVideo.value.load();
    
    const handleVideoLoad = () => {
      if (!speechMuted.value && currentAudio.value && !isAudioInitializing.value) {
        isAudioInitializing.value = true
        currentAudio.value.load();
      } else {
        videoReady.value = true;
        currentVideo.value.play().catch(err => console.warn('Video playback failed:', err));
      }
    };

    // Remove any existing loadeddata listeners
    currentVideo.value.removeEventListener('loadeddata', handleVideoLoad);
    // Add new listener
    currentVideo.value.addEventListener('loadeddata', handleVideoLoad, { once: true });
  } else {
    // Image-only slides
    if (!speechMuted.value && currentAudio.value && !isAudioInitializing.value) {
      isAudioInitializing.value = true
      currentAudio.value.load()
      currentAudio.value.play().catch(err => {
        console.warn('Audio playback failed:', err)
        isAudioInitializing.value = false
      })
    } else if (autoPlay.value) {
      clearTimeout(autoPlayTimeout.value)
      autoPlayTimeout.value = setTimeout(() => nextSlide(), 3000)
    }
  }
  isTransitioning.value = false
}

function calculateVideoStart() {
  if (!currentVideo.value || !currentAudio.value) return 0
  
  // Calculate how much later to start video so it ends with audio
  const vDuration = videoDuration.value
  const aDuration = audioDuration.value
  
  // If audio is longer than video, start video later
  if (aDuration > vDuration) {
    return (aDuration - vDuration) * 1000 // Convert to milliseconds
  }
  return 0 // Start immediately if video is shorter
}

function onVideoLoaded() {
  videoLoaded.value = true
  if (currentVideo.value) {
    videoDuration.value = currentVideo.value.duration
  }
}

function onAudioLoaded() {
  if (isAudioInitializing.value && currentAudio.value) {
    audioLoaded.value = true
    audioDuration.value = currentAudio.value.duration
    currentAudio.value.currentTime = 0
    
    currentAudio.value.play().catch(err => console.warn('Audio playback failed:', err))
    
    if (currentSlide.value.video && currentVideo.value && videoLoaded.value) {
      const videoDelay = calculateVideoStart()
      clearTimeout(videoStartTimeout.value)
      videoStartTimeout.value = setTimeout(() => {
        videoReady.value = true
        currentVideo.value.currentTime = 0
        currentVideo.value.play().catch(err => console.warn('Video playback failed:', err))
      }, videoDelay)
    }
    
    isAudioInitializing.value = false
  }
}

function onAudioEnded() {
  isAudioInitializing.value = false
  audioEnded.value = true
  textVisible.value = false
  checkSlideCompletion()
}

function onVideoEnded() {
  videoEnded.value = true
  checkSlideCompletion()
}

function checkSlideCompletion() {
  const isComplete = 
    (audioEnded.value || speechMuted.value) && 
    (!currentSlide.value.video || videoEnded.value)

  if (isComplete) {
    isTextDone.value = true
    if (autoPlay.value) {
      clearTimeout(autoPlayTimeout.value)
      autoPlayTimeout.value = setTimeout(() => nextSlide(), 1500)
    }
  }
}

function nextSlide() {
  if (currentIndex.value < props.slides.length - 1 && !isTransitioning.value) {
    isTransitioning.value = true
    videoReady.value = false
    audioEnded.value = false
    videoEnded.value = false
    
    currentIndex.value++
    // Reset transition flag after animation completes
    clearTimeout(slideTransitionTimeout.value)
    slideTransitionTimeout.value = setTimeout(() => {      
      prepareSlide()
    }, 500)
  }
}

function previousSlide() {
  if (currentIndex.value > 0 && !isTransitioning.value) {
    isTransitioning.value = true
    videoReady.value = false
    resetCurrentVideo()
    resetCurrentAudio()
    audioEnded.value = false
    videoEnded.value = false
    
    currentIndex.value--
    // Reset transition flag after animation completes
    clearTimeout(slideTransitionTimeout.value)
    slideTransitionTimeout.value = setTimeout(() => {
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
    if (currentAudio.value) {
      currentAudio.value.pause()
      audioEnded.value = true
      checkSlideCompletion()
    }
    if (backgroundMusic.value) {
      backgroundMusic.value.pause()
    }
  } else {
    if (currentAudio.value && audioLoaded.value) {
      audioEnded.value = false
      currentAudio.value.play()
      textVisible.value = true
    }
    if (backgroundMusic.value && backgroundMusicLoaded.value) {
      backgroundMusic.value.play()
    }
  }
}

function onAudioTimeUpdate() {
  if (currentAudio.value) {
    const time = currentAudio.value.currentTime
    const duration = currentAudio.value.duration
    const wordCount = words.value.length
    const wordIndex = Math.floor((time / duration) * wordCount)
    currentWordIndex.value = Math.min(wordIndex, wordCount - 1)
  }
}

// Add background music loaded handler
function onBackgroundMusicLoaded() {
  backgroundMusicLoaded.value = true
  if (!needsUserInteraction.value) {
    backgroundMusic.value.volume = 0.2
    backgroundMusic.value.play().catch(err => console.warn('Background music playback failed:', err))
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
  bottom: max(2%, 10px);
  width: min(82%, 800px);
  margin: 0 auto;
  left: 0;
  right: 0;
  text-align: center;
  font-size: clamp(0.75rem, 2.2vw, 1.4rem);
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
  padding: clamp(0.4rem, 1.5vh, 0.8rem) clamp(2.5rem, 6vw, 4rem);
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
  color: rgba(255, 255, 0, 0.8);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7),0px 0px 8px rgba(0, 0, 0, 0.9);
  
  border-radius: 4px;
  /*
  padding: 0.1em 0.2em;
  transform: scale(1.1);
  */
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
  left: max(0.5rem, 2%);
}

.control-button.right {
  right: max(0.5rem, 2%);
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
  bottom: max(0.5rem, 2%);
  width: clamp(36px, 8vw, 48px);
  height: clamp(36px, 8vw, 48px);
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
  right: max(0.5rem, 2%);
}

.control-button.replay {
  right: clamp(3.5rem, 12vw, 6rem);
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
  z-index: 1; /* Change to same z-index as image */
  opacity: 0;
  transition: opacity 500ms ease;
  will-change: opacity;
}

video.slide-media.video-ready {
  opacity: 1;
}

@media (max-width: 768px) {
  .slide-text {
    width: 76%;
    bottom: max(2%, 10px);
    padding: 0.4rem clamp(2rem, 4vw, 2.5rem);
    font-size: clamp(0.7rem, 2vw, 1.2rem);
  }
  
  .control-button {
    padding: 0.4rem;
  }

  .control-button.auto-play svg,
  .control-button.replay svg,
  .control-button.speech-toggle svg {
    width: clamp(18px, 4vw, 24px);
    height: clamp(18px, 4vw, 24px);
  }

  .control-button.auto-play span {
    font-size: clamp(8px, 2vw, 10px);
  }
}
@media (max-height: 480px) {
   .control-button{ transform:scale(0.7) !important; }
   .control-button.music-toggle {
     bottom: clamp(3rem, 10vw, 2rem)
   }
}
@media (max-width: 480px) {
  .slide-text {
    width: 70%;
    padding: 0.3rem clamp(1.5rem, 3vw, 2rem);
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
  bottom: max(0.5rem, 2%);
  left: max(0.5rem, 2%);
  width: clamp(36px, 8vw, 48px);
  height: clamp(36px, 8vw, 48px);
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

/* Add music toggle button styles */
.control-button.music-toggle {
  position: fixed;
  bottom: clamp(3.5rem, 12vw, 6rem);
  left: max(0.5rem, 2%);
  width: clamp(36px, 8vw, 48px);
  height: clamp(36px, 8vw, 48px);
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
  transform: none;
  top: auto;
}

.control-button.music-toggle:hover {
  background: rgba(0, 0, 0, 0.7);
  transform: scale(1.1);
}

.interaction-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: pointer;
}

.start-button {
  background: none;
  border: 2px solid white;
  border-radius: 50%;
  width: 120px;
  height: 120px;
  color: white;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  padding: 0;
}

.start-button:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.1);
}

.start-button svg {
  width: 48px;
  height: 48px;
  margin-bottom: 8px;
}

.start-button span {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
}
</style>