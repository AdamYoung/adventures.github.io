<template>
   <div ref="demo" class="textContainer">
      <h3 v-for="(chunk, index) in chunks" :key="index" class="textChunk">{{ chunk.text }}</h3>
   </div>
</template>
 
<script setup>
import { onMounted, ref, nextTick } from 'vue';
import { gsap } from 'gsap';
import { SlowMo } from "gsap/EasePack";
gsap.registerPlugin(SlowMo);

const props = defineProps({
  text: { type: String, default: '' },
  maxLength: { type: Number, default: 12 },
  speed: { type: Number, default: 4 }, // 1-10 range that equates to a per letter speed of 0.05 - 0.4
  loop: { type: Boolean, default: false },
  repeat: { type: Number, default: 0 },
  onComplete: { type: Function, default: () => {} },
});

const demo = ref(null);
const chunks = ref([]);
if( props.speed < 1 || props.speed > 10 ) props.speed = 5;
if( props.loop ) props.repeat = -1;

const letterTime = 0.05 + (10 - props.speed) * (0.4 - 0.05) / (10 - 1);

const _sentenceEndExp = /(\.|\?|!)$/g;

const buildChunks = (text, maxLength) => {
  if (typeof maxLength === 'undefined') {
    return text.split(' ');
  }
  const words = text.split(' ');
  const wordCount = words.length;
  let chunk = [];
  const myChunks = [];
  for (let i = 0; i < wordCount; i++) {
    chunk.push(words[i]);
    if (
      _sentenceEndExp.test(words[i]) ||
      i === wordCount - 1 ||
      chunk.join(' ').length + words[i + 1].length > maxLength
    ) {
      myChunks.push(chunk.join(' '));
      chunk = [];
    }
  }
  return myChunks;
};

const machineGun = async () => {
   const textChunks = buildChunks(props.text, props.maxlength);
   console.log(textChunks);

   for (let i = 0; i < textChunks.length; i++) {
      chunks.value.push({ text: textChunks[i], id: i  });
      console.log(textChunks[i]);
   }
  
   await nextTick(); // wait to make sure the elements from the chunks array exist in the DOM
  
   const tl = gsap.timeline({ delay: 0.6, repeat: props.repeat, repeatDelay: 4,  onComplete: props.onComplete });
   let time = 0;
   let chunk, element, duration, isSentenceEnd;
   for (let i = 0; i < chunks.value.length; i++) {
      chunk = chunks.value[i];
      console.log(chunk);
      isSentenceEnd = _sentenceEndExp.test(chunk.text) || i === chunks.value.length - 1;
      element = demo.value.children[i];
      
      duration = Math.max(0.5, chunk.text.length * letterTime);
   
      if (isSentenceEnd) {
         duration += 0.6;
      }
      
      gsap.set(element, { autoAlpha: 0, scale: 0, z: 0.01 });  

      tl.to(element, { duration: duration, scale: 1.2, ease: "slow(0.25, 0.9)"}, time )
        .to(element, { duration: duration, autoAlpha: 1, ease: "slow(0.25, 0.9, true)"}, time);        

      time += duration - 0.05;
      
   }
  
};

onMounted(() => {
   machineGun();
});
</script>

<style scoped>
.textContainer {
   position: relative;
   width: 100%;
   aspect-ratio: 8/3;
   background-color: rgba(0,0,0,0.6);
   margin: auto;
   overflow: hidden;
   display: flex;
   align-items: center;
   justify-content: center;
}

.textContainer .textChunk {
   position: absolute;
   font-family: "Asap", sans-serif;
   font-weight: 700;
   margin: 0;
   padding: 0;
   width: 100%;
   text-align: center;
   visibility: hidden;
   font-size: clamp(40px, 10vw, 120px);
   left: 50%;
   top: 50%;
   transform: translate(-50%, -50%);
}
</style>