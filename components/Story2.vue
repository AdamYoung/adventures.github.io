<template>
    <div class="audio-slideshow">
      <div class="image-container">
        <img :src="currentSlide.image" alt="Slide Image" class="slide-image" />
      </div>
      <div class="audio-controls">
        <i class="fa-solid fa-arrow-left prev-btn" @click="previousSlide"></i>
        <i id="play-pause-btn" class="fa-solid fa-play-circle play-btn" @click="togglePlayPause"></i>
        <i class="fa-solid fa-arrow-right next-btn" @click="nextSlide"></i>
        <i class="fa-solid fa-volume-high volume-btn" @click="toggleOptionsMenu"></i>
      </div>
      <div class="lyrics-container">
        <p id="lyrics"></p>
      </div>
      <div class="options-menu" v-show="showOptionsMenu">
        <div class="option">
          <label for="volume">Volume:</label>
          <input type="range" id="volume" min="0" max="1" step="0.01" v-model="volume">
        </div>
        <div class="option">
          <label for="playbackRate">Playback Rate:</label>
          <input type="range" id="playbackRate" min="0.5" max="2" step="0.1" v-model="playbackRate">
        </div>
        <button id="mute" @click="toggleMute">Mute</button>
      </div>
      <audio ref="audioPlayer" :src="currentSlide.audio" controls @play="handlePlay" @timeupdate="handleTimeUpdate" @ended="handleEnded" />
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch, onMounted } from 'vue';
  import { Howl } from 'howler';
  
  const props = defineProps({
    slides: {
      type: Array,
      required: true,
    },
  });
  
  const currentIndex = ref(0);
  const words = ref([]);
  const isPlaying = ref(false);
  const sound = ref(null);
  const showOptionsMenu = ref(false);
  const volume = ref(1);
  const playbackRate = ref(1);
  let utterance = null;
  
  const currentSlide = computed(() => props.slides[currentIndex.value]);
  
  watch(currentSlide, () => {
    prepareSlide();
  });
  
  onMounted(() => {
    if ('speechSynthesis' in window) {
      prepareSlide();
    } else {
      console.warn('Text-to-speech functionality not supported');
    }
    sound.value = new Howl({ src: [] });
  });
  
  function prepareSlide() {
    if (utterance) {
      window.speechSynthesis.cancel();
    }
    words.value = currentSlide.value.text.split(' ');
    speakText();
    if (currentSlide.value.audio) {
      sound.value.unload();
      sound.value.src(currentSlide.value.audio);
      sound.value.volume(volume.value);
      sound.value.rate(playbackRate.value);
    }
  }
  
  function speakText() {
    if (!('speechSynthesis' in window)) return;
  
    const text = currentSlide.value.text;
    utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = playbackRate.value;
  
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        handleWordBoundary(event.charIndex);
      }
    };
  
    window.speechSynthesis.speak(utterance);
  }
  
  function handleWordBoundary(charIndex) {
    const textUpToChar = currentSlide.value.text.slice(0, charIndex);
    const currentWordIndex = textUpToChar.trim().split(/\s+/).length - 1;
    words.value.forEach((word, index) => {
      if (index === currentWordIndex) {
        words.value[index] = `<span class="highlight">${word}</span>`;
      }
    });
  }
  
  function isWordHighlighted(word) {
    return word.includes('highlight');
  }
  
  function togglePlayPause() {
    if (isPlaying.value) {
      sound.value.pause();
    } else {
      sound.value.play();
    }
    isPlaying.value = !isPlaying.value;
  }
  
  function handlePlay() {
    isPlaying.value = true;
  }
  
  function handleTimeUpdate() {
    // Implement word highlighting based on audio time here
  }
  
  function handleEnded() {
    isPlaying.value = false;
  }
  
  function nextSlide() {
    if (currentIndex.value < props.slides.length - 1) {
      currentIndex.value++;
    }
  }
  
  function previousSlide() {
    if (currentIndex.value > 0) {
      currentIndex.value--;
    }
  }
  
  function toggleOptionsMenu() {
    showOptionsMenu.value = !showOptionsMenu.value;
  }
  
  function toggleMute() {
    sound.value.mute(!sound.value.muted());
  }
  </script>
  <style scoped>
.audio-slideshow {
  position: relative;
  width: 100%;
  height: 100vh; /* Adjust height as needed */
}

.image-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.slide-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.audio-controls {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 20px;
}

.audio-controls i {
  font-size: 3rem;
  color: #fff;
  cursor: pointer;
}

@media (max-width: 768px) {
  .audio-controls i {
    font-size: 2rem;
  }
}

.lyrics-container {
  position: absolute;
  bottom: 20px;
  width: 100%;
  text-align: center;
  font-size: 1.5em; /* Adjust font size as needed */
  color: rgba(255, 255, 255, 0.8);
  padding: 0 10px; /* Adjust padding as needed */
  text-shadow: 2px 2px 4px #000;
}

.lyrics-container span {
  margin: 0 5px;
}

.lyrics-container .highlight {
  background-color: rgba(255, 255, 0, 0.8);
  color: black;
}

.options-menu {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.8);
  padding: 20px;
  border-radius: 10px; 

}

.options-menu .option {
  margin-bottom: 10px;
}

.options-menu input[type="range"] {
  width: 100%;
}

.options-menu button {
  padding: 10px 20px;
  background-color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
  </style>