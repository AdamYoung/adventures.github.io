<template>
   <div
     class="character-display"
     :style="characterStyle"
     ref="containerRef"
   >
     <!-- Inject the raw SVG content -->
     <div v-if="svgContent" v-html="svgContent"></div>
     <div v-else>Loading SVG...</div>
   </div>
 </template>
 
 <script setup>
 import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
 import { useWalkAnimation } from './useWalkAnimation'; // Animation logic
 
 // Import SVGs as raw text using Vite's ?raw suffix
 import humanSkeletonRaw from './HumanSkeleton.svg?raw';
 import dogSkeletonRaw from './DogSkeleton.svg?raw';
 
 const props = defineProps({
   characterType: { // 'human' or 'dog'
     type: String,
     required: true,
     validator: (value) => ['human', 'dog'].includes(value),
   },
   skinConfig: { // The JSON object with texture mappings
     type: Object,
     required: true,
   },
   // Prop to control animation state (optional)
   isWalking: {
     type: Boolean,
     default: true,
   }
   // Add other props for position, scale etc. if needed
 });
 
 const containerRef = ref(null); // Ref for the main container
 const svgContent = ref(null); // Holds the raw SVG string
 
 // Determine the correct skeleton ID and raw content based on prop
 const skeletonId = computed(() => {
   return props.characterType === 'human' ? 'human-rig' : 'dog-rig';
 });
 
 const currentSvgRaw = computed(() => {
     return props.characterType === 'human' ? humanSkeletonRaw : dogSkeletonRaw;
 });
 
 // Compute the inline style object containing CSS variables
 const characterStyle = computed(() => {
   if (!props.skinConfig || !props.skinConfig.textures) {
     return {};
   }
   // Convert the textures object into CSS variables
   const variables = {};
   for (const [key, value] of Object.entries(props.skinConfig.textures)) {
      // Ensure keys start with '--' as expected for CSS variables
      if(key.startsWith('--')) {
         // For image textures using patterns, we set the variable used in the pattern's href
          variables[key] = value;
      }
   }
   return variables;
 });
 
 // --- Animation Setup ---
 // We need to pass the skeletonId to the composable.
 // The composable uses onMounted internally, but we need to ensure the SVG
 // is actually in the DOM when it runs. We also need to potentially
 // restart it if the characterType changes.
 let animationControls = null; // To hold play/pause if returned by composable
 
 function setupAnimation() {
   // Clean up previous animation if character type changed
   if (animationControls && typeof animationControls.kill === 'function') {
     animationControls.kill();
   }
    // Ensure the composable targets the correct ID dynamically
   animationControls = useWalkAnimation(skeletonId.value); // Pass the ID
 
   // Optional: Control playback based on prop
    if (animationControls && typeof animationControls.play === 'function') {
        if (props.isWalking) {
            animationControls.play();
        } else {
            animationControls.pause();
        }
    }
 }
 
 // Watch for changes in character type or the SVG content itself
 watch([skeletonId, svgContent], ([newId, newContent], [oldId, oldContent]) => {
     if (newContent && containerRef.value) {
          // SVG content is loaded and container exists, setup/reset animation
          console.log(`Setting up animation for: ${newId}`);
          setupAnimation();
     }
 }, { immediate: true }); // Run once initially if content loads fast
 
 // Watch for changes in walking state
 watch(() => props.isWalking, (walking) => {
     if (!animationControls) return;
     if (walking && typeof animationControls.play === 'function') {
         animationControls.play();
     } else if (!walking && typeof animationControls.pause === 'function') {
         animationControls.pause();
     }
 });
 
 // Load SVG content when the component mounts or character type changes
 watch(() => props.characterType, (newType) => {
      console.log(`Loading SVG for type: ${newType}`);
      svgContent.value = newType === 'human' ? humanSkeletonRaw : dogSkeletonRaw;
      // The watch on [skeletonId, svgContent] will trigger animation setup
 }, { immediate: true });
 
 
 onUnmounted(() => {
   // Ensure GSAP timeline is killed when component unmounts
   if (animationControls && typeof animationControls.kill === 'function') {
     animationControls.kill();
   }
 });
 
 </script>
 
 <style scoped>
 .character-display {
   /* Style the container if needed */
   width: 200px; /* Example size */
   height: 300px;
 }
 
 /* Ensure the injected SVG scales correctly */
 .character-display > div > svg {
   display: block;
   width: 100%;
   height: 100%;
   /* Preserve aspect ratio based on viewBox */
   /* object-fit: contain; */
 }
 </style>