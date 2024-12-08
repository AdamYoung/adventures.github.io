import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { SlowMo } from "gsap/EasePack";

export default defineNuxtPlugin(() => {
   if (!import.meta.env.SSR) {
      gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, SlowMo);
    }
  
    return {
      provide: {
        gsap,
        ScrollTrigger,
      },
    };
});