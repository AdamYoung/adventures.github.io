import { gsap } from 'gsap';
import { onMounted, onUnmounted, ref } from 'vue';

export function useHumanWalkAnimation(options = {}) {
  const defaults = {
    duration: 1.5, // Duration of one full walk cycle
    ease: 'none',
  };
  const config = { ...defaults, ...options };
  const tl = ref(null); // Use ref for the timeline

  const animateHumanWalk = () => {
    // Now directly target the embedded SVG without needing to wait for an external load
    const svg = document.querySelector('.human-walker-container svg');
    if (!svg) {
      console.warn('Human SVG not found in DOM yet');
      return;
    }

    // Reset initial state if needed
    gsap.set(svg.querySelector("#human-skeleton"), { y: 0, rotation: 0 });
    gsap.set(svg.querySelector("#human-head"), { rotation: 0 });
    gsap.set(svg.querySelectorAll("#human-arm-l, #human-arm-r, #human-leg-l, #human-leg-r"), { rotation: 0 });
    // ... reset others like lower limbs, hands, feet

    tl.value = gsap.timeline({
      paused: true, // Start paused
      repeat: -1,
      defaults: { duration: config.duration / 2, ease: 'sine.inOut' } // Each half-cycle
    });

    // Walk Cycle Key Poses
    tl.value
      // Body Bounce (Subtle up/down motion)
      .to(svg.querySelector("#human-skeleton"), { y: -2, duration: config.duration / 4, ease:'sine.out' }, 0)
      .to(svg.querySelector("#human-skeleton"), { y: 0, duration: config.duration / 4, ease:'sine.in' }, config.duration / 4)
      .to(svg.querySelector("#human-skeleton"), { y: -2, duration: config.duration / 4, ease:'sine.out' }, config.duration / 2)
      .to(svg.querySelector("#human-skeleton"), { y: 0, duration: config.duration / 4, ease:'sine.in' }, config.duration * 3/4 )

      // Subtle Head Bob
       .to(svg.querySelector("#human-head"), { rotation: 0.5, y: -0.2 }, 0)
       .to(svg.querySelector("#human-head"), { rotation: -0.5, y: 0 }, config.duration / 2)


      // === First Half Cycle ===
      // Arms (Swing from shoulder)
      .to(svg.querySelector("#human-arm-l"), { rotation: 35 }, 0) // L forward
      .to(svg.querySelector("#human-arm-r"), { rotation: -35 }, 0) // R backward
      // Lower Arms (Natural bend)
      .to(svg.querySelector("#human-lower-arm-l"), { rotation: 25 }, 0) // Bend forward
      .to(svg.querySelector("#human-lower-arm-r"), { rotation: -20 }, 0) // Straightens slightly when back
      // Hands (Subtle follow-through)
      .to(svg.querySelector("#human-hand-l"), { rotation: 10 }, 0)
      .to(svg.querySelector("#human-hand-r"), { rotation: -5 }, 0)

      // Legs (Swing from hip)
      .to(svg.querySelector("#human-leg-l"), { rotation: -30 }, 0) // L backward (push off)
      .to(svg.querySelector("#human-leg-r"), { rotation: 30 }, 0) // R forward (reach)
      // Lower Legs (Bend/Straighten)
      .to(svg.querySelector("#human-lower-leg-l"), { rotation: 40 }, 0) // Bend backward on push
      .to(svg.querySelector("#human-lower-leg-r"), { rotation: -50 }, 0) // Bend forward sharply on reach
       // Feet (Ankle flex - heel strike / toe off)
      .to(svg.querySelector("#human-foot-l"), { rotation: 20 }, 0) // Toe off
      .to(svg.querySelector("#human-foot-r"), { rotation: -25 }, 0) // Heel strike / foot flat

      // === Second Half Cycle (Reverse Limbs) ===
      // Arms
      .to(svg.querySelector("#human-arm-l"), { rotation: -35 }, config.duration / 2) // L backward
      .to(svg.querySelector("#human-arm-r"), { rotation: 35 }, config.duration / 2) // R forward
      // Lower Arms
      .to(svg.querySelector("#human-lower-arm-l"), { rotation: -20 }, config.duration / 2)
      .to(svg.querySelector("#human-lower-arm-r"), { rotation: 25 }, config.duration / 2)
      // Hands
      .to(svg.querySelector("#human-hand-l"), { rotation: -5 }, config.duration / 2)
      .to(svg.querySelector("#human-hand-r"), { rotation: 10 }, config.duration / 2)

      // Legs
      .to(svg.querySelector("#human-leg-l"), { rotation: 30 }, config.duration / 2) // L forward
      .to(svg.querySelector("#human-leg-r"), { rotation: -30 }, config.duration / 2) // R backward
      // Lower Legs
      .to(svg.querySelector("#human-lower-leg-l"), { rotation: -50 }, config.duration / 2)
      .to(svg.querySelector("#human-lower-leg-r"), { rotation: 40 }, config.duration / 2)
      // Feet
      .to(svg.querySelector("#human-foot-l"), { rotation: -25 }, config.duration / 2)
      .to(svg.querySelector("#human-foot-r"), { rotation: 20 }, config.duration / 2);
  };

  // Play function that will try to initialize animation if not already initialized
  const play = () => {
    if (!tl.value) {
      animateHumanWalk();
    }
    tl.value?.play();
  };

  const pause = () => tl.value?.pause();
  
  const kill = () => {
    tl.value?.kill();
    tl.value = null;
  };

  // Initialize animation on mount
  onMounted(() => {
    // Short delay to ensure the SVG is in the DOM
    setTimeout(() => {
      animateHumanWalk();
    }, 100);
  });

  // Clean up on unmount
  onUnmounted(() => {
    kill();
  });

  return { play, pause, kill, timeline: tl };
}