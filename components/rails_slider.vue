<template>
  <div class="rails-slider" :class="{ hasHover: isHovering }" ref="sliderContainer">
    <!-- Audio Element -->
    <audio ref="audioPlayer" loop>
      <source src="/Mya_and_Kita_Adventure.mp3" type="audio/mpeg">
    </audio>

    <!-- SVG Guidelines with Paths -->
    <svg class="guide-lines" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
      <path id="leftPath"
            d="M 12 120 L 35 5"
            stroke="rgba(255,255,255,0)"
            fill="none" />
      <path id="rightPath"
            d="M 88 120 L 65 5"
            stroke="rgba(255,255,255,0)"
            fill="none" />
    </svg>

    <!-- Left Rail -->
    <div class="rail">
      <div v-for="(item, index) in leftItems" 
           :key="`left-${index}`"
           class="rail-item"
           @mouseenter="onItemHover($event.currentTarget, true)"
           @mouseleave="onItemHover($event.currentTarget, false)"
           :ref="el => setItemRef(el, 'left', index)">
        <slot name="left-item" :item="item" :index="index">
          {{ item }}
        </slot>
      </div>
    </div>

    <!-- Right Rail -->
    <div class="rail">
      <div v-for="(item, index) in rightItems" 
           :key="`right-${index}`"
           class="rail-item"
           @mouseenter="onItemHover($event.currentTarget, true)"
           @mouseleave="onItemHover($event.currentTarget, false)"
           :ref="el => setItemRef(el, 'right', index)">
        <slot name="right-item" :item="item" :index="index">
          {{ item }}
        </slot>
      </div>
    </div>

    <!-- Debug Controls -->
    <div v-if="debug" class="debug-controls">
      <button @click="toggleAnimation">
        {{ isPaused ? 'Play' : 'Pause' }}
      </button>
      <select v-model="selectedEase" @change="updateEasing">
        <option v-for="ease in easingOptions" 
                :key="ease" 
                :value="ease">
          {{ ease }}
        </option>
      </select>
      <div class="debug-info">
        Time: {{ currentTime.toFixed(2) }}s
      </div>
    </div>

    <!-- Simple Audio Toggle -->
    <button class="audio-toggle" @click="toggleAudio">
      {{ isPlaying ? '🔊' : '🔇' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import gsap from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

gsap.registerPlugin(MotionPathPlugin)

interface Props {
  leftItems: any[]
  rightItems: any[]
  horizonY?: number // % from top where rails converge
  railOffset?: number // % from center (25 means left rail at 25%, right at 75%)
  speed?: number // seconds for full animation
  direction?: 'in' | 'out' // towards or away from horizon
  startDelay?: number // seconds to delay start
  debug?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  horizonY: 20,
  railOffset: 25,
  speed: 3,
  direction: 'in',
  startDelay: 0,
  debug: false
})

const leftRailItems = ref<HTMLElement[]>([])
const rightRailItems = ref<HTMLElement[]>([])
const timeline = ref<gsap.core.Timeline>()

const isPaused = ref(false)
const currentTime = ref(0)
const isPortrait = ref(true);
const showOrientationOverlay = ref(false);

const perspective = ref(3000); // Increased perspective for larger view
const windowWidth = ref(1920);
const windowHeight = ref(1080);

// Add orientation check function
const checkOrientation = () => {
  if (typeof window !== 'undefined') {
    const isPortraitMode = window.innerHeight > window.innerWidth;
    isPortrait.value = isPortraitMode;
    showOrientationOverlay.value = isPortraitMode;
    isPaused.value = isPortraitMode;
    
    if (!isPortraitMode && isPaused.value) {
      isPaused.value = false;      
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

// Add easing options
const easingOptions = [
  'none',
  'power1.in', 'power1.out', 'power1.inOut',
  'power2.in', 'power2.out', 'power2.inOut',
  'power3.in', 'power3.out', 'power3.inOut',
  'power4.in', 'power4.out', 'power4.inOut',
  'back.in', 'back.out', 'back.inOut',
  'elastic.in', 'elastic.out', 'elastic.inOut',
  'bounce.in', 'bounce.out', 'bounce.inOut',
  'circ.in', 'circ.out', 'circ.inOut',
  'expo.in', 'expo.out', 'expo.inOut',
  'sine.in', 'sine.out', 'sine.inOut'
]

const selectedEase = ref('power1.in')

const setItemRef = (el: HTMLElement | null, rail: 'left' | 'right', index: number) => {
  if (!el) return
  const collection = rail === 'left' ? leftRailItems : rightRailItems
  collection.value[index] = el
}

const toggleAnimation = () => {
  if (isPaused.value) {
    timeline.value?.play()
  } else {
    timeline.value?.pause()
  }
  isPaused.value = !isPaused.value
}

const updateEasing = () => {
  // Kill existing timeline
  timeline.value?.kill()
  // Reinitialize with new easing
  initializeAnimation()
}

const initializeAnimation = () => {
  const tl = gsap.timeline({ 
    repeat: -1,
    onUpdate: () => {
      currentTime.value = tl.time()
    },
    delay: props.startDelay // Add delay before animation starts
  })
  timeline.value = tl

  const setupItem = (item: HTMLElement, isLeft: boolean, index: number) => {
    const startScale = 0.15  // Reduced from 0.2 for smaller far view
    const endScale = 1
    const fadeThreshold = 0.15  // Increased from 0.1 for longer fade
    
    gsap.set(item, {
      opacity: 0,
      scale: startScale,
      immediateRender: true,
      zIndex: 1 // Base z-index
    })

    // Create a repeating timeline for each item
    const itemTl = gsap.timeline({ repeat: -1 })
    
    // Add the movement animation
    itemTl.to(item, {
      motionPath: {
        path: isLeft ? '#leftPath' : '#rightPath',
        align: isLeft ? '#leftPath' : '#rightPath',
        autoRotate: false,
        alignOrigin: [0.5, 0.5],
        start: props.direction === 'in' ? 1 : 0,
        end: props.direction === 'in' ? 0 : 1
      },
      scale: props.direction === 'in' ? endScale : startScale,
      duration: props.speed,
      ease: selectedEase.value,
      onUpdate: function() {
        const progress = this.progress()
        // Longer fade in/out
        const opacity = progress < fadeThreshold 
          ? progress * (1 / fadeThreshold)
          : progress > (1 - fadeThreshold)
            ? (1 - progress) * (1 / fadeThreshold)
            : 1
        item.style.opacity = String(opacity)
        
        // Update z-index based on progress
        // Higher z-index when closer (lower progress for 'in', higher for 'out')
        const zIndex = props.direction === 'in'
          ? Math.round(10 - progress * 10)
          : Math.round(progress * 10)
        item.style.zIndex = String(zIndex)
      }
    })

    return itemTl
  }

  // Create separate master timelines for left and right rails
  const leftMaster = gsap.timeline()
  const rightMaster = gsap.timeline()

  // Setup items with improved stagger
  const itemsPerRail = 3
  const stagger = props.speed / itemsPerRail
  const railOffset = stagger / 2 // Half stagger between rails

  // Add left items
  leftRailItems.value.forEach((item, i) => {
    const position = i * stagger
    leftMaster.add(setupItem(item, true, i), position)
  })

  // Add right items with offset
  rightRailItems.value.forEach((item, i) => {
    const position = i * stagger
    rightMaster.add(setupItem(item, false, i), position)
  })

  // Add both rails to main timeline with offset
  tl.add(leftMaster, 0)
  tl.add(rightMaster, railOffset)

  return tl
}

// Add new refs for audio control
const audioPlayer = ref<HTMLAudioElement>()
const isPlaying = ref(false)

const toggleAudio = () => {
  if (!audioPlayer.value) return
  
  if (isPlaying.value) {
    audioPlayer.value.pause()
  } else {
    audioPlayer.value.play()
  }
  isPlaying.value = !isPlaying.value
}

const previousPauseState = ref(false)
const isHovering = ref(false)

const onItemHover = (target: HTMLElement, entering: boolean) => {
  if (entering) {
    isHovering.value = true
    previousPauseState.value = isPaused.value
    timeline.value?.pause()
    isPaused.value = true
    
    // Add hover class to target
    target.classList.add('isHover')
    

    
    // Handle left rail items
    leftRailItems.value.forEach(item => {
      if (item === target) {

      } else if (item.style.opacity !== '0') {
        // Handle video if present
        const video = item.querySelector('video')
        if (video) {
          //resum video
          video.pause() 
        }
      }
    })
    
    // Handle right rail items
    rightRailItems.value.forEach(item => {
      if (item === target) {
        
      } else if (item.style.opacity !== '0') {
        // Handle video if present
        const video = item.querySelector('video')
        if (video) {
          //resum video
          video.pause() 
        }
      }
    })

  } else {
    isHovering.value = false
    target.classList.remove('isHover')
    

    // Handle left rail items
    leftRailItems.value.forEach(item => {
      if (item === target) {

      } else if (item.style.opacity !== '0') {
        // Handle video if present
        const video = item.querySelector('video')
        if (video) {
          //resum video
          video.play() 
        }
      }
    })
    
    // Handle right rail items
    rightRailItems.value.forEach(item => {
      if (item === target) {
        
      } else if (item.style.opacity !== '0') {
        // Handle video if present
        const video = item.querySelector('video')
        if (video) {
          //resum video
          video.play() 
        }
      }
    })

    if (!previousPauseState.value) {
      timeline.value?.play()
      isPaused.value = false
    }
  }
}

onMounted(() => {
  updateWindowDimensions();
  checkOrientation();   

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
    //animate();
  }

  initializeAnimation()
  if (audioPlayer.value) {
    audioPlayer.value.volume = 0.5
  }
})

// Cleanup on unmount
onUnmounted(() => {
  timeline.value?.kill()
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', updateWindowDimensions);
    window.removeEventListener('orientationchange', checkOrientation);
  }  
})
</script>

<style scoped>
.rails-slider {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  /*background: #1a1a1a;*/
  transform-style: preserve-3d;
  perspective: 1000px;
}

.rails-slider.hasHover :deep(.video-item){
  opacity: 0.5;
  transition: opacity 0.3s ease;
}
.rail-item.isHover{
   z-index: 100 !important;
}
.rails-slider.hasHover .rail-item.isHover :deep(.video-item){
  opacity: 1 !important;
  transform: scale(1.5);  
  transition: transform 0.3s ease;
}
@media (max-width: 1024px) {
   .rails-slider.hasHover .rail-item.isHover :deep(.video-item){   
       transform: scale(2);  
   }
}
.guide-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.rail-item {
  position: absolute;
  transform-origin: center center;
  will-change: transform, opacity;
}

.debug-controls {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  gap: 10px;
  align-items: center;
  background: rgba(0, 0, 0, 0.8);
  padding: 10px;
  border-radius: 4px;
}

.debug-controls button {
  padding: 5px 10px;
  background: #444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.debug-controls select {
  padding: 5px 10px;
  background: #444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-family: monospace;
}

.debug-controls select option {
  background: #333;
}

.debug-info {
  color: white;
  font-family: monospace;
}

.audio-toggle {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  border: none;
  color: white;
  font-size: 24px;
  padding: 10px 20px;
  cursor: pointer;
  z-index: 1000;
  border-radius: 4px;
  transition: opacity 0.3s ease;
}

.audio-toggle:hover {
  opacity: 0.8;
}

/* Add Font Awesome CDN in your index.html or main template */
</style>