<template>
   <div>
      
     <h1>Watch the Dog Walk!</h1>
     <DogWalker :isWalking="shouldDogWalk" />
     <button @click="toggleWalk">{{ shouldDogWalk ? 'Stop' : 'Walk' }}</button>

     <h2>Animated Human Skeleton</h2>     
     <HumanWalker :isWalking="walkState" />
     <button @click="walkState = !walkState">
        {{ walkState ? 'Stop Walking' : 'Start Walking' }}
     </button>

   </div>
 </template>
 
 <script setup>
 import { ref } from 'vue';
 import DogWalker from '../components/DogWalker.vue';
 import HumanWalker from '../components/HumanWalker.vue';

 const walkState = ref(true);
 const shouldDogWalk = ref(true);
 
 function toggleWalk() {
   shouldDogWalk.value = !shouldDogWalk.value;
 }
 </script>