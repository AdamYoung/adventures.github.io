<template>
  <div class="demo-container">
    <img 
      ref="logo" 
      src="/adventures_of_logo.png" 
      class="intro-logo" 
      alt="Adventures Logo"
    />
    
    <div class="coming-soon">
      <span v-for="(letter, index) in 'COMING SOON'.split('')" 
            :key="index"
            class="letter"
            :style="{ '--index': index }">
        {{ letter }}
      </span>
    </div>
    
    <RailsSlider
      :left-items="leftVideos"
      :right-items="rightVideos"
      :horizon-y="25"
      :rail-offset="30"
      :speed="4"
      :start-delay="2.5"
      :debug="false"
      direction="in"
    >
      <template #left-item="{ item }">
        <div class="video-item">
          <video
            :src="`${baseURL}page${item.id}.mp4`"
            :poster="`${baseURL}page${item.id}.png`"
            preload="auto"
            autoplay
            muted
            loop
            playsinline
          />
        </div>
      </template>

      <template #right-item="{ item }">
        <div class="video-item">
          <video
            :src="`${baseURL}page${item.id}.mp4`"
            :poster="`${baseURL}page${item.id}.png`"
            preload="auto"
            autoplay
            muted
            loop
            playsinline
          />
        </div>
      </template>
    </RailsSlider>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import gsap from 'gsap'
import { Bounce } from 'gsap'
import RailsSlider from './rails_slider.vue'

// Generate video arrays
const generateVideos = (start: number, count: number) => 
  Array.from({ length: count }, (_, i) => ({
    id: start + i,
    size: 200 // size in pixels
  }))

const leftVideos = generateVideos(1, 3)  // page1.mp4 - page3.mp4
const rightVideos = generateVideos(4, 3)  // page4.mp4 - page6.mp4

const logo = ref<HTMLImageElement>()

onMounted(() => {
  if (logo.value) {
    gsap.fromTo(logo.value, 
      {
        scale: 0.1,
        opacity: 0
      },
      {
        scale: 1,
        opacity: 1,
        duration: 2,
        ease: Bounce.easeOut,
        onComplete: () => {
          // Move logo up
          gsap.to(logo.value, {
            top: "25%",
            duration: 1,
            delay: 0.5,
            ease: "power2.inOut",
          })
          
          // Animate letters
          gsap.to('.letter', {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            delay: 1,
            ease: "back.out(1.7)"
          })
        }
      }
    )
  }
})
</script>

<style scoped>
.demo-container {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(180deg, #2C3E50 0%, #1A1A1A 100%);
  overflow: hidden;
}

.video-item {
  width: 500px;
  height: 300px;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  transition: box-shadow 0.3s ease;
}

.video-item:hover {
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3);
}

.video-item video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.intro-logo {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: auto;
  z-index: 1000;
  pointer-events: none;
}

.coming-soon {
  position: fixed;
  top: 60%;
  left: 50%;
  transform: translateX(-50%);
  width: 80vw;
  text-align: center;
  z-index: 0;
  opacity: 0.5;
}

.letter {
  display: inline-block;
  font-size: 8vw;
  font-weight: bold;
  color: white;
  text-shadow: 0 0 20px rgba(255,255,255,0.3);
  opacity: 0;
  transform: translateY(50px);
  font-family: Arial, sans-serif;
  letter-spacing: 0.1em;
  padding: 0 0.05em;
}
</style>