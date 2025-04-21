import { gsap } from 'gsap';
import { onMounted, onUnmounted, ref } from 'vue';

export function useDogWalkAnimation(options = {}) {
  const defaults = {
    duration: 1.2, // Faster cycle for a dog trot
    ease: 'none',
  };
  const config = { ...defaults, ...options };
  const tl = ref(null); // Use ref for the timeline

  const animateDogWalk = () => {
    // Now directly target the embedded SVG without needing to wait for an external load
    const svg = document.querySelector('.dog-walker-container svg');
    if (!svg) {
      console.warn('Dog SVG not found in DOM yet');
      return;
    }

    // Ensure clean state
    gsap.set(svg.querySelector("#dog-skeleton"), { y: 0, rotation: 0 });
    gsap.set(svg.querySelector("#dog-head"), { rotation: 0 });
    gsap.set(svg.querySelectorAll("#dog-leg-fl, #dog-leg-fr, #dog-leg-rl, #dog-leg-rr"), { rotation: 0 });
    // ... reset others if needed

    tl.value = gsap.timeline({
        paused: true, // Start paused, control via play/pause
        repeat: -1,
        defaults: { duration: config.duration / 2, ease: 'sine.inOut' } // Each half-cycle uses sinusoidal ease
    });

    // Simplified Trot Gait (Diagonal Pairs) + Tail Wag
    tl.value
      // Body Bounce/Sway
      .to(svg.querySelector("#dog-skeleton"), { y: -1.5, duration: config.duration / 4, ease:'sine.out' }, 0)
      .to(svg.querySelector("#dog-skeleton"), { y: 0, duration: config.duration / 4, ease:'sine.in' }, config.duration / 4)
      .to(svg.querySelector("#dog-skeleton"), { y: -1.5, duration: config.duration / 4, ease:'sine.out' }, config.duration / 2)
      .to(svg.querySelector("#dog-skeleton"), { y: 0, duration: config.duration / 4, ease:'sine.in' }, config.duration * 3/4 )
      // Subtle body rock
      .to(svg.querySelector("#dog-skeleton"), { rotation: 0.5 }, 0)
      .to(svg.querySelector("#dog-skeleton"), { rotation: -0.5 }, config.duration / 2)


      // Tail Wag (Continuous side-to-side)
      .to(svg.querySelector("#dog-tail"), { rotation: 25, ease: 'sine.inOut' }, 0)
      .to(svg.querySelector("#dog-tail-segment-2"), { rotation: 15, ease: 'sine.inOut' }, 0) // Secondary wag
      .to(svg.querySelector("#dog-tail"), { rotation: -25, ease: 'sine.inOut' }, config.duration / 2)
      .to(svg.querySelector("#dog-tail-segment-2"), { rotation: -15, ease: 'sine.inOut' }, config.duration / 2)

      // Subtle Head Bob/Movement
       .to(svg.querySelector("#dog-head"), { rotation: 1, y: -0.5 }, 0)
       .to(svg.querySelector("#dog-head"), { rotation: -1, y: 0 }, config.duration / 2)


      // === First Half Cycle (e.g., Front Left & Rear Right Forward) ===
      // FL Leg (Forward)
      .to(svg.querySelector("#dog-leg-fl"), { rotation: 30 }, 0) // Shoulder forward
      .to(svg.querySelector("#dog-lower-leg-fl"), { rotation: -35 }, 0) // Elbow bend forward
      .to(svg.querySelector("#dog-paw-fl"), { rotation: 10 }, 0) // Paw slightly up

      // FR Leg (Backward)
      .to(svg.querySelector("#dog-leg-fr"), { rotation: -30 }, 0) // Shoulder backward
      .to(svg.querySelector("#dog-lower-leg-fr"), { rotation: 25 }, 0) // Elbow bend back
      .to(svg.querySelector("#dog-paw-fr"), { rotation: -15 }, 0) // Paw pushes off

      // RL Leg (Backward)
      .to(svg.querySelector("#dog-leg-rl"), { rotation: -25 }, 0) // Hip backward
      .to(svg.querySelector("#dog-lower-leg-rl"), { rotation: 35 }, 0) // Knee bend back
      .to(svg.querySelector("#dog-hock-rl"), { rotation: -30 }, 0) // Hock bend back
      .to(svg.querySelector("#dog-paw-rl"), { rotation: -20 }, 0) // Paw pushes off

      // RR Leg (Forward)
      .to(svg.querySelector("#dog-leg-rr"), { rotation: 25 }, 0) // Hip forward
      .to(svg.querySelector("#dog-lower-leg-rr"), { rotation: -40 }, 0) // Knee bend forward
      .to(svg.querySelector("#dog-hock-rr"), { rotation: 25 }, 0) // Hock extends forward
      .to(svg.querySelector("#dog-paw-rr"), { rotation: 15 }, 0) // Paw reaches forward


      // === Second Half Cycle (Reverse Diagonal Pairs) ===
      // FL Leg (Backward)
      .to(svg.querySelector("#dog-leg-fl"), { rotation: -30 }, config.duration / 2)
      .to(svg.querySelector("#dog-lower-leg-fl"), { rotation: 25 }, config.duration / 2)
      .to(svg.querySelector("#dog-paw-fl"), { rotation: -15 }, config.duration / 2)

      // FR Leg (Forward)
      .to(svg.querySelector("#dog-leg-fr"), { rotation: 30 }, config.duration / 2)
      .to(svg.querySelector("#dog-lower-leg-fr"), { rotation: -35 }, config.duration / 2)
      .to(svg.querySelector("#dog-paw-fr"), { rotation: 10 }, config.duration / 2)

      // RL Leg (Forward)
      .to(svg.querySelector("#dog-leg-rl"), { rotation: 25 }, config.duration / 2)
      .to(svg.querySelector("#dog-lower-leg-rl"), { rotation: -40 }, config.duration / 2)
      .to(svg.querySelector("#dog-hock-rl"), { rotation: 25 }, config.duration / 2)
      .to(svg.querySelector("#dog-paw-rl"), { rotation: 15 }, config.duration / 2)

      // RR Leg (Backward)
      .to(svg.querySelector("#dog-leg-rr"), { rotation: -25 }, config.duration / 2)
      .to(svg.querySelector("#dog-lower-leg-rr"), { rotation: 35 }, config.duration / 2)
      .to(svg.querySelector("#dog-hock-rr"), { rotation: -30 }, config.duration / 2)
      .to(svg.querySelector("#dog-paw-rr"), { rotation: -20 }, config.duration / 2);
  };

  // Play function that will try to initialize animation if not already initialized
  const play = () => {
    if (!tl.value) {
      animateDogWalk();
    }
    tl.value?.play();
  };

  const pause = () => tl.value?.pause();
  
  const kill = () => {
    tl.value?.kill();
    tl.value = null;
  };

  // Clean up on unmount
  onUnmounted(() => {
    kill();
  });

  // Initialize animation on mount
  onMounted(() => {
    // Short delay to ensure the SVG is in the DOM
    setTimeout(() => {
      animateDogWalk();
    }, 100);
  });

  return { play, pause, kill, timeline: tl }; // Expose timeline ref if needed
}