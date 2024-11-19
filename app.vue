<template>
  <div class="site-container">
    <ShapesRailDemo />
  </div>
</template>
<script setup>
// Remove import as Nuxt 3 auto-imports components

var  slides = [
        {image:"page1.png",video:"page1.mp4",text:"In a house by the hill where the wildflowers sway, Lived a baby and her husky who loved to play all day."},
        {image:"page2.png",video:"page2.mp4",text:"They danced with the clouds and chased butterflies, Painting the day with the colors of skies."},
        {image:"page3.png",video:"page3.mp4",text:"One morning they set off to see what they'd find, Through forests so lush and paths that wind."},        
        {image:"page4.png",video:"page4.mp4",text:"They sailed on a leaf down a glistening stream, Chasing the echoes of a faraway dream"},
        {image:"page5.png",video:"page5.mp4",text:"They climbed a tall tree to see the world wide, Discovering wonders from their perch up high."},
        {image:"page6.png",video:"page6.mp4",text:"As stars peeked out and the sun said goodnight, They headed back home by the moon's soft light."},
      ]
</script>
<style>
:root {
  --font-editorial: "Editorial New", serif;
}

body {
  margin: 0;
  padding: 0;
  background: #000;
  color: #fff;
  font-family: "Source Serif 4", 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  font-optical-sizing: auto;
  font-weight: normal;
  font-style: normal;  
}

.site-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #000 0%, #0a0a0a 100%);
}
</style>