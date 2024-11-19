<template>
  <div class="rails-container">
    <div v-for="(rail, index) in rails" :key="index" class="rail" :style="getRailStyle(index)">
      <slot :name="'rail-' + index"></slot>
    </div>
  </div>
  <div class="controls">
    <button @click="startAnimation">Start</button>
    <button @click="pauseAnimation">Pause</button>
    <button @click="restartAnimation">Restart</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { gsap } from 'gsap';

const rails = ref([{}, {}, {}]); // Three rails

const easing = ref('power1.inOut');
const duration = ref(2);
const delay = ref(0.5);

const timelines = ref([]);

const getRailStyle = (index) => {
  return {
    transform: `translateY(${index * 100}px) scale(${1 - index * 0.2})`,
    opacity: 1 - index * 0.3,
    // ...additional styles...
  };
};

const createTimelines = () => {
  rails.value.forEach((_, index) => {
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
    tl.to(`.rail:nth-child(${index + 1})`, {
      y: -window.innerHeight,
      scale: 0.5,
      opacity: 0,
      ease: easing.value,
      duration: duration.value,
      delay: index * delay.value,
    });
    timelines.value.push(tl);
  });
};

const startAnimation = () => {
  timelines.value.forEach(tl => tl.play());
};

const pauseAnimation = () => {
  timelines.value.forEach(tl => tl.pause());
};

const restartAnimation = () => {
  timelines.value.forEach(tl => tl.restart());
};

onMounted(() => {
  createTimelines();
});
</script>

<style scoped>
.rails-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.rail {
  position: absolute;
  width: 100%;
  height: 100%;
  // ...additional styles...
}

.controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
}
</style>