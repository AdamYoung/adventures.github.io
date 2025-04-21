<template>
  <div class="human-walker-container">
    <!-- Inline SVG embedding without style tag in defs -->
    <svg id="human-rig" viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Empty defs -->
      </defs>
      <g id="human-skeleton">
        <!-- Torso/Core -->
        <line id="human-spine" class="bone" x1="50" y1="35" x2="50" y2="85" />
        <circle id="human-neck-joint" class="joint" cx="50" cy="35" r="3"/>
        <circle id="human-hip-center-joint" class="joint" cx="50" cy="85" r="3"/>
        <!-- Head -->
        <g id="human-head">
          <line id="human-neck-bone" class="bone" x1="50" y1="35" x2="50" y2="25" />
          <circle id="human-head-joint" class="joint" cx="50" cy="25" r="5"/> <!-- Slightly larger head joint -->
        </g>
        <!-- Left Arm -->
        <g id="human-arm-l">
           <circle id="human-shoulder-l-joint" class="joint" cx="40" cy="45" r="3"/>
           <line id="human-upper-arm-l-bone" class="bone" x1="40" y1="45" x2="30" y2="60" />
           <g id="human-lower-arm-l">
             <circle id="human-elbow-l-joint" class="joint" cx="30" cy="60" r="3"/>
             <line id="human-lower-arm-l-bone" class="bone" x1="30" y1="60" x2="25" y2="75" />
             <g id="human-hand-l">
               <circle id="human-wrist-l-joint" class="joint" cx="25" cy="75" r="2.5"/>
               <line id="human-hand-l-bone" class="bone" x1="25" y1="75" x2="23" y2="85" />
             </g>
           </g>
        </g>
        <!-- Right Arm (Similar to Left) -->
        <g id="human-arm-r">
           <circle id="human-shoulder-r-joint" class="joint" cx="60" cy="45" r="3"/>
           <line id="human-upper-arm-r-bone" class="bone" x1="60" y1="45" x2="70" y2="60" />
           <g id="human-lower-arm-r">
             <circle id="human-elbow-r-joint" class="joint" cx="70" cy="60" r="3"/>
             <line id="human-lower-arm-r-bone" class="bone" x1="70" y1="60" x2="75" y2="75" />
             <g id="human-hand-r">
               <circle id="human-wrist-r-joint" class="joint" cx="75" cy="75" r="2.5"/>
               <line id="human-hand-r-bone" class="bone" x1="75" y1="75" x2="77" y2="85" />
             </g>
           </g>
        </g>
        <!-- Left Leg -->
        <g id="human-leg-l">
           <circle id="human-hip-l-joint" class="joint" cx="45" cy="85" r="3"/>
           <line id="human-thigh-l-bone" class="bone" x1="45" y1="85" x2="40" y2="110" />
           <g id="human-lower-leg-l">
              <circle id="human-knee-l-joint" class="joint" cx="40" cy="110" r="3"/>
              <line id="human-calf-l-bone" class="bone" x1="40" y1="110" x2="38" y2="135" />
              <g id="human-foot-l">
                 <circle id="human-ankle-l-joint" class="joint" cx="38" cy="135" r="2.5"/>
                 <line id="human-foot-l-bone" class="bone" x1="38" y1="135" x2="45" y2="140" /> <!-- Slightly longer foot bone -->
              </g>
           </g>
        </g>
        <!-- Right Leg (Similar to Left) -->
        <g id="human-leg-r">
           <circle id="human-hip-r-joint" class="joint" cx="55" cy="85" r="3"/>
           <line id="human-thigh-r-bone" class="bone" x1="55" y1="85" x2="60" y2="110" />
           <g id="human-lower-leg-r">
              <circle id="human-knee-r-joint" class="joint" cx="60" cy="110" r="3"/>
              <line id="human-calf-r-bone" class="bone" x1="60" y1="110" x2="62" y2="135" />
              <g id="human-foot-r">
                 <circle id="human-ankle-r-joint" class="joint" cx="62" cy="135" r="2.5"/>
                 <line id="human-foot-r-bone" class="bone" x1="62" y1="135" x2="55" y2="140" /> <!-- Slightly longer foot bone -->
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
  // Control whether the human should be walking
  isWalking: {
    type: Boolean,
    default: true, // Start walking by default
  }
});

let timeline = null;

// Create a function to manually animate the SVG
const createAnimation = () => {
  // Select the SVG elements directly in this component
  const svg = document.querySelector('.human-walker-container svg');
  
  if (!svg) {
    console.warn('Human SVG not found in DOM');
    return;
  }
  
  console.log('Human SVG found, setting up animation');
  
  // Create a timeline for the animation
  const duration = 1.6; // Duration for human walk cycle
  
  // Reset initial state if needed
  gsap.set(svg.querySelector("#human-skeleton"), { y: 0, rotation: 0 });
  gsap.set(svg.querySelector("#human-head"), { rotation: 0 });
  gsap.set(svg.querySelectorAll("#human-arm-l, #human-arm-r, #human-leg-l, #human-leg-r"), { rotation: 0 });
  
  timeline = gsap.timeline({
    paused: true, // Start paused
    repeat: -1,
    defaults: { duration: duration / 2, ease: 'sine.inOut' } // Each half-cycle
  });

  // Walk Cycle Key Poses
  timeline
    // Body Bounce (Subtle up/down motion)
    .to(svg.querySelector("#human-skeleton"), { y: -2, duration: duration / 4, ease:'sine.out' }, 0)
    .to(svg.querySelector("#human-skeleton"), { y: 0, duration: duration / 4, ease:'sine.in' }, duration / 4)
    .to(svg.querySelector("#human-skeleton"), { y: -2, duration: duration / 4, ease:'sine.out' }, duration / 2)
    .to(svg.querySelector("#human-skeleton"), { y: 0, duration: duration / 4, ease:'sine.in' }, duration * 3/4 )

    // Subtle Head Bob
    .to(svg.querySelector("#human-head"), { rotation: 0.5, y: -0.2 }, 0)
    .to(svg.querySelector("#human-head"), { rotation: -0.5, y: 0 }, duration / 2)


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
    .to(svg.querySelector("#human-arm-l"), { rotation: -35 }, duration / 2) // L backward
    .to(svg.querySelector("#human-arm-r"), { rotation: 35 }, duration / 2) // R forward
    // Lower Arms
    .to(svg.querySelector("#human-lower-arm-l"), { rotation: -20 }, duration / 2)
    .to(svg.querySelector("#human-lower-arm-r"), { rotation: 25 }, duration / 2)
    // Hands
    .to(svg.querySelector("#human-hand-l"), { rotation: -5 }, duration / 2)
    .to(svg.querySelector("#human-hand-r"), { rotation: 10 }, duration / 2)

    // Legs
    .to(svg.querySelector("#human-leg-l"), { rotation: 30 }, duration / 2) // L forward
    .to(svg.querySelector("#human-leg-r"), { rotation: -30 }, duration / 2) // R backward
    // Lower Legs
    .to(svg.querySelector("#human-lower-leg-l"), { rotation: -50 }, duration / 2)
    .to(svg.querySelector("#human-lower-leg-r"), { rotation: 40 }, duration / 2)
    // Feet
    .to(svg.querySelector("#human-foot-l"), { rotation: -25 }, duration / 2)
    .to(svg.querySelector("#human-foot-r"), { rotation: 20 }, duration / 2);

  // Start playing if needed
  if (props.isWalking) {
    timeline.play();
  }
  
  return timeline;
};

// Initialize animation on mount with retry mechanism
onMounted(() => {
  console.log('HumanWalker component mounted');
  
  // Wait a bit for the SVG to be in the DOM
  setTimeout(() => {
    if (!timeline) {
      timeline = createAnimation();
    }
  }, 200);
});

// Watch the isWalking prop to control the animation
watch(() => props.isWalking, (newVal) => {
  console.log('Human walking state changed:', newVal);
  
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
.human-walker-container {
  width: 150px; /* Adjust size as needed */
  height: 225px; /* Maintain aspect ratio based on viewBox */
  overflow: hidden; /* Optional */
}

/* Style the SVG element */
.human-walker-container svg {
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
  fill: #3498db; /* Blue joints */ 
}

/* Transform Origins - Essential for correct rotation */
#human-head { transform-origin: 50px 35px; } /* Neck joint */
#human-arm-l { transform-origin: 40px 45px; } /* Shoulder L */
#human-lower-arm-l { transform-origin: 30px 60px; } /* Elbow L */
#human-hand-l { transform-origin: 25px 75px; } /* Wrist L */
#human-arm-r { transform-origin: 60px 45px; } /* Shoulder R */
#human-lower-arm-r { transform-origin: 70px 60px; } /* Elbow R */
#human-hand-r { transform-origin: 75px 75px; } /* Wrist R */
#human-leg-l { transform-origin: 45px 85px; } /* Hip L */
#human-lower-leg-l { transform-origin: 40px 110px; } /* Knee L */
#human-foot-l { transform-origin: 38px 135px; } /* Ankle L */
#human-leg-r { transform-origin: 55px 85px; } /* Hip R */
#human-lower-leg-r { transform-origin: 60px 110px; } /* Knee R */
#human-foot-r { transform-origin: 62px 135px; } /* Ankle R */
/* Main group for overall movement */
#human-skeleton { transform-origin: 50px 85px; } /* Approx hip center */
</style>