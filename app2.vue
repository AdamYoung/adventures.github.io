<template>
  <div>
    <!--<Story :slides="slides" />-->
    <StoryMusic :slides="slides" musicSrc="Mya and Kita's Adventure.mp3" />
  </div>
</template>
<script setup>
var slides = [
  {image:"page1.png", time: 0},
  {video:"page1.mp4", time: 5},
  {image:"page2.png", time: 20},
  {video:"page2.mp4", time: 25},
  {image:"page3.png", time: 45},
  {video:"page3.mp4", time: 46},
  {image:"page4.png", time: 41},
  {video:"page4.mp4", time: 42},
  {image:"page5.png", time: 60},
  {video:"page5.mp4", time: 62},
  {image:"page6.png", time: 97},
  {video:"page6.mp4", time: 98}
]
</script>
<style>
body {
  font-family: 'Arial', sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f0f0f0;
}
</style>