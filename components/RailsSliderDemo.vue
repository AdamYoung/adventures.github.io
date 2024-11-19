
<template>
  <div class="demo-container">
    <RailsSlider
      :left-items="leftShapes"
      :right-items="rightShapes"
      :horizon-y="25"
      :rail-offset="30"
      :speed="4"
      direction="in"
    >
      <template #left-item="{ item }">
        <div 
          class="shape-item"
          :style="{
            background: item.color,
            width: `${item.size}px`,
            height: `${item.size}px`,
            borderRadius: item.type === 'circle' ? '50%' : '8px'
          }"
        >
          {{ item.label }}
        </div>
      </template>

      <template #right-item="{ item }">
        <div 
          class="shape-item"
          :style="{
            background: item.color,
            width: `${item.size}px`,
            height: `${item.size}px`,
            borderRadius: item.type === 'circle' ? '50%' : '8px'
          }"
        >
          {{ item.label }}
        </div>
      </template>
    </RailsSlider>
  </div>
</template>

<script setup lang="ts">
import RailsSlider from './rails_slider.vue'

// Left rail uses circles
const leftShapes = [
  { type: 'circle', size: 100, color: '#FF6B6B', label: '1' },
  { type: 'circle', size: 100, color: '#4ECDC4', label: '2' },
  { type: 'circle', size: 100, color: '#45B7D1', label: '3' },
  { type: 'circle', size: 100, color: '#96CEB4', label: '4' },
]

// Right rail uses squares
const rightShapes = [
  { type: 'square', size: 80, color: '#FFEEAD', label: 'A' },
  { type: 'square', size: 80, color: '#D4A5A5', label: 'B' },
  { type: 'square', size: 80, color: '#FFB6B9', label: 'C' },
  { type: 'square', size: 80, color: '#8785A2', label: 'D' },
]
</script>

<style scoped>
.demo-container {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(180deg, #2C3E50 0%, #1A1A1A 100%);
  overflow: hidden;
}

.shape-item {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: box-shadow 0.3s ease;
}

.shape-item:hover {
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3);
}
</style>