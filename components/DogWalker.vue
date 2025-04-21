<template>
  <div class="dog-walker-container">
    <!-- Inline SVG embedding without style tag in defs -->
    <svg id="dog-rig" viewBox="0 0 150 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Empty defs -->
      </defs>
      <g id="dog-skeleton">
        <!-- Torso -->
        <line id="dog-spine" class="bone" x1="30" y1="40" x2="100" y2="50" />
        <circle id="dog-tail-base-joint" class="joint" cx="30" cy="40" r="3"/>
        <circle id="dog-shoulder-center-joint" class="joint" cx="100" cy="50" r="3"/>
        <line id="dog-neck-bone" class="bone" x1="100" y1="50" x2="115" y2="30" />
        <circle id="dog-neck-base-joint" class="joint" cx="115" cy="30" r="3"/>
        <!-- Head -->
        <g id="dog-head">
          <line id="dog-head-bone" class="bone" x1="115" y1="30" x2="135" y2="25" />
          <circle id="dog-head-joint" class="joint" cx="135" cy="25" r="5"/>
        </g>
        <!-- Tail -->
        <g id="dog-tail">
          <line id="dog-tail-bone-1" class="bone" x1="30" y1="40" x2="15" y2="45" />
          <g id="dog-tail-segment-2">
            <circle id="dog-tail-joint-1" class="joint" cx="15" cy="45" r="2"/>
            <line id="dog-tail-bone-2" class="bone" x1="15" y1="45" x2="5" y2="48" />
            <circle id="dog-tail-joint-2" class="joint" cx="5" cy="48" r="1.5"/>
          </g>
        </g>
        <!-- Front Left Leg -->
        <g id="dog-leg-fl">
          <circle id="dog-shoulder-fl-joint" class="joint" cx="100" cy="45" r="3"/>
          <line id="dog-upper-leg-fl-bone" class="bone" x1="100" y1="45" x2="105" y2="65" />
          <g id="dog-lower-leg-fl">
            <circle id="dog-elbow-fl-joint" class="joint" cx="105" cy="65" r="3"/>
            <line id="dog-lower-leg-fl-bone" class="bone" x1="105" y1="65" x2="108" y2="85" />
            <g id="dog-paw-fl">
              <circle id="dog-wrist-fl-joint" class="joint" cx="108" cy="85" r="2.5"/>
              <line id="dog-paw-fl-bone" class="bone" x1="108" y1="85" x2="115" y2="90" />
            </g>
          </g>
        </g>
        <!-- Front Right Leg (Slightly offset Y for perspective) -->
        <g id="dog-leg-fr">
          <circle id="dog-shoulder-fr-joint" class="joint" cx="100" cy="55" r="3"/>
          <line id="dog-upper-leg-fr-bone" class="bone" x1="100" y1="55" x2="105" y2="75" />
          <g id="dog-lower-leg-fr">
            <circle id="dog-elbow-fr-joint" class="joint" cx="105" cy="75" r="3"/>
            <line id="dog-lower-leg-fr-bone" class="bone" x1="105" y1="75" x2="108" y2="95" />
            <g id="dog-paw-fr">
              <circle id="dog-wrist-fr-joint" class="joint" cx="108" cy="95" r="2.5"/>
              <line id="dog-paw-fr-bone" class="bone" x1="108" y1="95" x2="115" y2="100" />
            </g>
          </g>
        </g>
        <!-- Rear Left Leg -->
        <g id="dog-leg-rl">
          <circle id="dog-hip-rl-joint" class="joint" cx="40" cy="45" r="3"/>
          <line id="dog-thigh-rl-bone" class="bone" x1="40" y1="45" x2="35" y2="65" />
          <g id="dog-lower-leg-rl">
            <circle id="dog-knee-rl-joint" class="joint" cx="35" cy="65" r="3"/>
            <line id="dog-calf-rl-bone" class="bone" x1="35" y1="65" x2="40" y2="85" />
            <g id="dog-hock-rl">
              <circle id="dog-hock-rl-joint" class="joint" cx="40" cy="85" r="2.5"/>
              <line id="dog-metatarsal-rl-bone" class="bone" x1="40" y1="85" x2="35" y2="95" />
              <g id="dog-paw-rl">
                <circle id="dog-ankle-rl-joint" class="joint" cx="35" cy="95" r="2.5"/>
                <line id="dog-paw-rl-bone" class="bone" x1="35" y1="95" x2="42" y2="100" />
              </g>
            </g>
          </g>
        </g>
        <!-- Rear Right Leg (Slightly offset Y) -->
        <g id="dog-leg-rr">
          <circle id="dog-hip-rr-joint" class="joint" cx="40" cy="55" r="3"/>
          <line id="dog-thigh-rr-bone" class="bone" x1="40" y1="55" x2="35" y2="75" />
          <g id="dog-lower-leg-rr">
            <circle id="dog-knee-rr-joint" class="joint" cx="35" cy="75" r="3"/>
            <line id="dog-calf-rr-bone" class="bone" x1="35" y1="75" x2="40" y2="95" />
            <g id="dog-hock-rr">
              <circle id="dog-hock-rr-joint" class="joint" cx="40" cy="95" r="2.5"/>
              <line id="dog-metatarsal-rr-bone" class="bone" x1="40" y1="95" x2="35" y2="105" />
              <g id="dog-paw-rr">
                <circle id="dog-ankle-rr-joint" class="joint" cx="35" cy="105" r="2.5"/>
                <line id="dog-paw-rr-bone" class="bone" x1="35" y1="105" x2="42" y2="110" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { gsap } from 'gsap';

const props = defineProps({
  // Control whether the dog should be walking
  isWalking: {
    type: Boolean,
    default: true, // Start walking by default
  }
});

let timeline = null;

// Create a function to animate the SVG
const createAnimation = () => {
  // Select the SVG elements directly in this component
  const svg = document.querySelector('.dog-walker-container svg');
  
  if (!svg) {
    console.warn('Dog SVG not found in DOM');
    return;
  }
  
  console.log('Dog SVG found, setting up animation');
  
  // Create a timeline for the animation
  const duration = 1.2; // Faster cycle for a dog trot
  
  // Ensure clean state
  gsap.set(svg.querySelector("#dog-skeleton"), { y: 0, rotation: 0 });
  gsap.set(svg.querySelector("#dog-head"), { rotation: 0 });
  gsap.set(svg.querySelectorAll("#dog-leg-fl, #dog-leg-fr, #dog-leg-rl, #dog-leg-rr"), { rotation: 0 });
  
  timeline = gsap.timeline({
    paused: true, // Start paused, control via play/pause
    repeat: -1,
    defaults: { duration: duration / 2, ease: 'sine.inOut' } // Each half-cycle uses sinusoidal ease
  });

  // Simplified Trot Gait (Diagonal Pairs) + Tail Wag
  timeline
    // Body Bounce/Sway
    .to(svg.querySelector("#dog-skeleton"), { y: -1.5, duration: duration / 4, ease:'sine.out' }, 0)
    .to(svg.querySelector("#dog-skeleton"), { y: 0, duration: duration / 4, ease:'sine.in' }, duration / 4)
    .to(svg.querySelector("#dog-skeleton"), { y: -1.5, duration: duration / 4, ease:'sine.out' }, duration / 2)
    .to(svg.querySelector("#dog-skeleton"), { y: 0, duration: duration / 4, ease:'sine.in' }, duration * 3/4 )
    // Subtle body rock
    .to(svg.querySelector("#dog-skeleton"), { rotation: 0.5 }, 0)
    .to(svg.querySelector("#dog-skeleton"), { rotation: -0.5 }, duration / 2)

    // Tail Wag (Continuous side-to-side)
    .to(svg.querySelector("#dog-tail"), { rotation: 25, ease: 'sine.inOut' }, 0)
    .to(svg.querySelector("#dog-tail-segment-2"), { rotation: 15, ease: 'sine.inOut' }, 0) // Secondary wag
    .to(svg.querySelector("#dog-tail"), { rotation: -25, ease: 'sine.inOut' }, duration / 2)
    .to(svg.querySelector("#dog-tail-segment-2"), { rotation: -15, ease: 'sine.inOut' }, duration / 2)

    // Subtle Head Bob/Movement
    .to(svg.querySelector("#dog-head"), { rotation: 1, y: -0.5 }, 0)
    .to(svg.querySelector("#dog-head"), { rotation: -1, y: 0 }, duration / 2)

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
    .to(svg.querySelector("#dog-leg-fl"), { rotation: -30 }, duration / 2)
    .to(svg.querySelector("#dog-lower-leg-fl"), { rotation: 25 }, duration / 2)
    .to(svg.querySelector("#dog-paw-fl"), { rotation: -15 }, duration / 2)

    // FR Leg (Forward)
    .to(svg.querySelector("#dog-leg-fr"), { rotation: 30 }, duration / 2)
    .to(svg.querySelector("#dog-lower-leg-fr"), { rotation: -35 }, duration / 2)
    .to(svg.querySelector("#dog-paw-fr"), { rotation: 10 }, duration / 2)

    // RL Leg (Forward)
    .to(svg.querySelector("#dog-leg-rl"), { rotation: 25 }, duration / 2)
    .to(svg.querySelector("#dog-lower-leg-rl"), { rotation: -40 }, duration / 2)
    .to(svg.querySelector("#dog-hock-rl"), { rotation: 25 }, duration / 2)
    .to(svg.querySelector("#dog-paw-rl"), { rotation: 15 }, duration / 2)

    // RR Leg (Backward)
    .to(svg.querySelector("#dog-leg-rr"), { rotation: -25 }, duration / 2)
    .to(svg.querySelector("#dog-lower-leg-rr"), { rotation: 35 }, duration / 2)
    .to(svg.querySelector("#dog-hock-rr"), { rotation: -30 }, duration / 2)
    .to(svg.querySelector("#dog-paw-rr"), { rotation: -20 }, duration / 2);

  // Start playing if needed
  if (props.isWalking) {
    timeline.play();
  }
  
  return timeline;
};

// Initialize animation on mount with retry mechanism
onMounted(() => {
  console.log('DogWalker component mounted');
  
  // Wait a bit for the SVG to be in the DOM
  setTimeout(() => {
    if (!timeline) {
      timeline = createAnimation();
    }
  }, 200);
});

// Watch the isWalking prop to control the animation
watch(() => props.isWalking, (newVal) => {
  console.log('Dog walking state changed:', newVal);
  
  if (!timeline) {
    timeline = createAnimation();
  }
  
  if (newVal) {
    timeline?.play();
  } else {
    timeline?.pause();
  }
});

// Clean up on unmount
onUnmounted(() => {
  if (timeline) {
    timeline.kill();
    timeline = null;
  }
});
</script>

<style scoped>
.dog-walker-container {
  width: 300px; /* Adjust size as needed */
  height: 200px;
  overflow: hidden; /* Hide parts moving outside bounds if desired */
}

/* Style the SVG element */
.dog-walker-container svg {
  display: block;
  width: 100%;
  height: 100%;
}

/* Visible skeleton styles - moved from inline SVG */
.bone { 
  stroke: #333; 
  stroke-width: 2.5; 
  stroke-linecap: round; 
}
.joint { 
  fill: #e74c3c; /* Red joints */ 
}

/* Transform Origins - Essential for correct rotation */
#dog-head { transform-origin: 115px 30px; } /* Neck base */
#dog-tail { transform-origin: 30px 40px; } /* Tail base */
#dog-tail-segment-2 { transform-origin: 15px 45px; } /* First tail joint */
#dog-leg-fl { transform-origin: 100px 45px; } /* Front Left Shoulder */
#dog-lower-leg-fl { transform-origin: 105px 65px; } /* Front Left Elbow */
#dog-paw-fl { transform-origin: 108px 85px; } /* Front Left Wrist */
#dog-leg-fr { transform-origin: 100px 55px; } /* Front Right Shoulder */
#dog-lower-leg-fr { transform-origin: 105px 75px; } /* Front Right Elbow */
#dog-paw-fr { transform-origin: 108px 95px; } /* Front Right Wrist */
#dog-leg-rl { transform-origin: 40px 45px; } /* Rear Left Hip */
#dog-lower-leg-rl { transform-origin: 35px 65px; } /* Rear Left Knee */
#dog-hock-rl { transform-origin: 40px 85px; } /* Rear Left Hock */
#dog-paw-rl { transform-origin: 35px 95px; } /* Rear Left Ankle */
#dog-leg-rr { transform-origin: 40px 55px; } /* Rear Right Hip */
#dog-lower-leg-rr { transform-origin: 35px 75px; } /* Rear Right Knee */
#dog-hock-rr { transform-origin: 40px 95px; } /* Rear Right Hock */
#dog-paw-rr { transform-origin: 35px 105px; } /* Rear Right Ankle */
/* Main group for overall movement */
#dog-skeleton { transform-origin: 70px 50px; } /* Approx center of mass */
</style>