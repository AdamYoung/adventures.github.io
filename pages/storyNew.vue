<template>
   <div>
     <!--<Story :slides="slides" />-->
     <Story_new :slides="slides" musicSrc="story_background1.mp3" />
   </div>
 </template>
 <script setup>

var  slides = [
        {image:"page1.png",audio:"page1.mp3",video:"page1.mp4",videoStart:4.2,text:"Mya and Khita were ready to go, With giggles and grins that started to show. 'Let’s explore the forest, with tall whispering trees, With secrets that dance on the cool, gentle breeze!'"},
        {image:"page2.png",audio:"page2.mp3",video:"page2.mp4",videoStart:5.5,text:"They skipped through the meadow, so happy and free, With butterflies dancing as far as they'd see. Khita ran fast, her tail held high, While Mya spun round with a laugh and a sigh. 'Oh Khita, just look! The forest is near! Let's follow the butterflies our path is clear!'"},
        {image:"page3.png",audio:"page3.mp3",video:"page3.mp4",videoStart:6.2,text:"Into the forest, the sunlight grew dim, The trees whispered secrets, a magical hymn. Mya walked softly, her heart filled with cheer, While Khita's ears twitched adventure was near! Through rustling leaves and a soft earthy floor, They came to a river, with stories galore."},        
        {image:"page4.png",audio:"page4.mp3",video:"page4.mp4",videoStart:5.4,text:"They found a big leaf by the river's cool side, 'Let's use it,' said Mya, 'for a magical ride!' With Khita aboard and the water aglow, They floated along where the soft currents flow. The fish swam beneath, with a wiggle and flip, While Khita sat proud, the captain of their ship!"},
        {image:"page5.png",audio:"page5.mp3",video:"page5.mp4",videoStart:6.2,text:"At the base of the tree, so sturdy and tall, Mya gazed upward, feeling so small. 'Let's climb to the top and see what's around!' Khita barked twice and leapt from the ground. With paws and hands, they started their quest, For views from the treetops the very best!"},
        {image:"page6.png",audio:"page6.mp3",video:"page6.mp4",videoStart:7.1,text:"High in the branches, they sat side by side, With mountains and valleys stretching far and wide. The rivers below sparkled bright in the sun, And colorful birds made their flight look like fun. 'Oh Khita, just look! The world feels so wide!' Mya whispered in wonder, her heart full of pride."},
        {image:"page7.png",audio:"page7.mp3",video:"page7.mp4",videoStart:4.9,text:"As the sun went to sleep and the stars filled the skies, The forest lit up with bright fireflies. Mya skipped gently, her heart feeling light, While Khita chased bugs that blinked in the night. 'What a day we have had, so much to explore!' Mya laughed as they walked back home once more."},        
      ]      
 </script>