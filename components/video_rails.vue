<script setup lang="ts">
const { $gsap: gsap } = useNuxtApp();

interface VideoItem {
    id: number;
    thumbnail: string;
    videoUrl: string;
    author: string;
    authorLink: string;
    title?: string;
}

const props = defineProps<{
    leftVideos: VideoItem[];
    rightVideos: VideoItem[];
}>()

const isHovering = ref(false);
const perspective = ref(3000); // Increased perspective for larger view
const baseDepth = 6000; // Increased depth
const spacing = 1000; // More space between larger videos
const yOffset = 200; // Move starting point lower

const videoRefs = ref([]);
const videoKeys = reactive({
    left: Array(props.leftVideos.length).fill(0),
    right: Array(props.rightVideos.length).fill(0)
});

// Add window width reactive reference at the top with other refs
const windowWidth = ref(1920);
const windowHeight = ref(1080);

// Replace animation frame with gsap logic 
//let animationFrame: number;
let mainTimeline: gsap.core.Timeline;
const videoTimelines = ref<{ [key: string]: gsap.core.Timeline }>({});

// Initialize positions with safe defaults
const positions = reactive({
    left: Array(props.leftVideos.length).fill(0).map((_, i) => ({
        x: -500, // safe default
        y: 500,  // safe default
        z: i * spacing,
        rotation: -0.3,
        scale: 1.4
    })),
    right: Array(props.rightVideos.length).fill(0).map((_, i) => ({
        x: 500,  // safe default
        y: 600,  // safe default
        z: (i * spacing) + 400,
        rotation: 0.3,
        scale: 1.4
    }))
});

// Add GSAP-specific refs for animation targets
const videoContainers = ref([]);

// Simplified getVideoStyle - only handle static properties
const getVideoStyle = (video: VideoItem, index: number, isRight: boolean) => {
    return {
        position: 'absolute',
        width: '100%',
        height: '100%',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        cursor: focusedVideo.value?.id === video.id ? 'zoom-out' : 'pointer'
    };
};

// Initialize GSAP animations
const initializeAnimations = () => {
    mainTimeline?.kill();
    Object.values(videoTimelines.value).forEach(tl => tl.kill());
    videoTimelines.value = {};

    ['left', 'right'].forEach(side => {
        positions[side].forEach((pos, index) => {
            const key = `${side}-${index}`;
            const element = videoContainers.value[`${side}-${index}`];
            if (!element) return;

            const timeline = gsap.timeline({
                repeat: -1,
                defaults: {
                    ease: "none",
                    modifiers: {
                        z: (value) => `${Math.round(value)}px`,
                        x: (value) => `${Math.round(value)}px`,
                        y: (value) => `${Math.round(value)}px`,
                        scale: (value) => value.toFixed(3),
                        opacity: (value) => value.toFixed(2)
                    }
                }
            });

            // Create animation for each video
            timeline.fromTo(element, {
                z: baseDepth,
                x: side === 'right' ? windowWidth.value * 0.9 : -windowWidth.value * 0.9,
                y: windowHeight.value * 0.7,
                scale: 1.8,
                opacity: 0,
                rotationY: side === 'right' ? 30 : -30,
                zIndex: 0
            }, {
                z: -1000,
                x: side === 'right' ? windowWidth.value * 0.15 : -windowWidth.value * 0.15,
                y: -250,
                scale: 0.4,
                opacity: 1,
                duration: 15,
                rotationY: side === 'right' ? 30 : -30,
                zIndex: 100,
                ease: "power1.inOut",
                onComplete: () => {
                    videoKeys[side][index]++;
                }
            })
                .to(element, {
                    opacity: 0,
                    duration: 2,
                    ease: "power2.in"
                }, ">-2");

            videoTimelines.value[key] = timeline;
        });
    });
};

// Replace animation pause/resume handlers
const pauseAnimations = () => {
    Object.values(videoTimelines.value).forEach(tl => tl.pause());
};

const resumeAnimations = () => {
    Object.values(videoTimelines.value).forEach(tl => tl.resume());
};

// Simplified focus handling
const handleVideoFocus = (video: VideoItem, index: number, side: 'left' | 'right') => {
    const element = videoContainers.value[`${side}-${index}`];
    if (!element) return;

    if (focusedVideo.value?.id === video.id) {
        // Unfocus
        focusedVideo.value = null;
        pauseAnimations();
        gsap.to(element, {
            x: originalPositions.value.x,
            y: originalPositions.value.y,
            z: originalPositions.value.z,
            rotationY: originalPositions.value.rotationY,
            scale: originalPositions.value.scale,
            opacity: 1,
            duration: 0.5,
            ease: "power2.inOut",
            onComplete: resumeAnimations
        });
    } else {
        // Focus
        pauseAnimations();
        focusedVideo.value = { id: video.id, side, index };
        originalPositions.value = gsap.getProperty(element);

        gsap.to(element, {
            x: 0,
            y: windowHeight.value * 0.1,
            z: 1000,
            rotationY: 0,
            scale: 2.2,
            opacity: 1,
            duration: 0.5,
            ease: "power2.inOut"
        });
    }
};

/************************************************/

// Section for checking if landscape or portrait mode and recommending orientation change
const isPortrait = ref(true);
const showOrientationOverlay = ref(false);
const isAnimationPaused = ref(true);
const updateWindowDimensions = () => {
    if (typeof window !== 'undefined') {
        windowWidth.value = window.innerWidth;
        windowHeight.value = window.innerHeight;
        perspective.value = Math.min(2200, window.innerWidth * 1.5);
    }
};

const checkOrientation = () => {
    if (typeof window !== 'undefined') {
        const isPortraitMode = window.innerHeight > window.innerWidth;
        isPortrait.value = isPortraitMode;
        showOrientationOverlay.value = isPortraitMode;
        isAnimationPaused.value = isPortraitMode;

        if (!isPortraitMode && isAnimationPaused.value) {
            isAnimationPaused.value = false;
            resumeAnimations();
        }
    }
};

// Update the onMounted hook
onMounted(() => {
    updateWindowDimensions();
    checkOrientation();
    initializeAnimations();

    if (!isPortrait.value) {
        resumeAnimations();
    }

    // Initialize positions with actual window dimensions
    ['left', 'right'].forEach(side => {
        positions[side].forEach(pos => {
            if (side === 'right') {
                pos.x = windowWidth.value * 0.7;
                pos.y = windowHeight.value * START_Y_OFFSET + 100;
            } else {
                pos.x = -windowWidth.value * 0.7;
                pos.y = windowHeight.value * START_Y_OFFSET;
            }
        });
    });

    window.addEventListener('resize', () => {
        updateWindowDimensions();
        checkOrientation();
    });

    // Add orientation change event listener
    window.addEventListener('orientationchange', () => {
        setTimeout(checkOrientation, 100); // Small delay to ensure proper dimension updates
    });

});

// Update onUnmounted to clean up new event listener
onUnmounted(() => {
    if (typeof window !== 'undefined') {
        window.removeEventListener('resize', updateWindowDimensions);
        window.removeEventListener('orientationchange', checkOrientation);
    }
    mainTimeline?.kill();
    Object.values(videoTimelines.value).forEach(tl => tl.kill());
});

// Helper function to map range
const mapRange = (value: number, in_min: number, in_max: number, out_min: number, out_max: number) => {
    return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
};

// Add easing functions
const easeInExpo = (x: number): number => {
    return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
};


const easeOutExpo = (x: number): number => {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
};
// Add missing constant
const Z_INDEX_BASE = 100000;
const FADE_START = 0.9; // Start fade out at 90%
const START_Y_OFFSET = 0.6; // Move starting point lower (60% of screen height)

// Add missing mouse handlers
const handleMouseMove = (e: MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    tiltX.value = ((y - rect.height / 2) / rect.height) * -10;
    tiltY.value = ((x - rect.width / 2) / rect.width) * 10;
};

const resetTilt = () => {
    tiltX.value = 0;
    tiltY.value = 0;
};

// Add method to handle video loading
const handleVideoLoad = (video) => {
    video.play().catch(() => {
        // Handle autoplay restrictions
        video.muted = true;
        video.play();
    });
};


// Add new reactive states for interactions
const hoveredVideoId = ref<number | null>(null);
const focusedVideo = ref<{ id: number; side: 'left' | 'right'; index: number } | null>(null);
const originalPositions = ref<any>(null);

// Add hover handlers
const handleVideoHover = (videoId: number) => {
    if (!focusedVideo.value) {
        hoveredVideoId.value = videoId;
        isAnimationPaused.value = true;
    }
};

const handleVideoLeave = () => {
    if (!focusedVideo.value) {
        hoveredVideoId.value = null;
        isAnimationPaused.value = false;
        resumeAnimations();
    }
};

</script>

<template>
    <div class="carousel-container" @mousemove="handleMouseMove" @mouseleave="resetTilt"
        :style="`perspective: ${perspective}px`">

        <!-- Add orientation overlay -->
        <div v-if="showOrientationOverlay" class="orientation-overlay">
            <div class="orientation-message">
                <i class="rotate-phone-icon">📱</i>
                <p>Please rotate your device to landscape mode for the best experience</p>
            </div>
        </div>

        <!-- Left side videos -->
        <div v-for="(video, index) in leftVideos" 
            :key="`left-${video.id}-${videoKeys.left[index]}`" 
            :ref="el => { videoContainers[`left-${index}`] = el }"
            class="video-card"
            :class="{ 'focused': focusedVideo?.id === video.id }"
            :style="getVideoStyle(video, index, false)"
            @mouseenter="handleVideoHover(video.id)" 
            @mouseleave="handleVideoLeave"
            @click="handleVideoFocus(video, index, 'left')">
            <div class="video-wrapper">
                <video ref="videoRefs" :src="video.videoUrl" :poster="video.thumbnail"
                    @loadedmetadata="handleVideoLoad($event.target)" loop muted playsinline />
            </div>
            <div class="author-tag" v-if="video.author">
                <a :href="video.authorLink" target="_blank" rel="noreferrer">
                    {{ video.author }}
                </a>
            </div>
        </div>

        <!-- Right side videos -->
        <div v-for="(video, index) in rightVideos" 
            :key="`right-${video.id}-${videoKeys.right[index]}`"
            :ref="el => { videoContainers[`right-${index}`] = el }"
            class="video-card" 
            :class="{ 'focused': focusedVideo?.id === video.id }"
            :style="getVideoStyle(video, index, true)" 
            @mouseenter="handleVideoHover(video.id)"
            @mouseleave="handleVideoLeave" 
            @click="handleVideoFocus(video, index, 'right')">
            <div class="video-wrapper">
                <video ref="videoRefs" :src="video.videoUrl" :poster="video.thumbnail"
                    @loadedmetadata="handleVideoLoad($event.target)" loop muted playsinline />
            </div>
            <div class="author-tag" v-if="video.author">
                <a :href="video.authorLink" target="_blank" rel="noreferrer">
                    {{ video.author }}
                </a>
            </div>
        </div>
    </div>
</template>

<style scoped>
.carousel-container {
    perspective: calc(100vw * 2.5);
    perspective-origin: 50% 60%;
    height: 100vh;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    /* Align to bottom */
    background: linear-gradient(180deg, #000 0%, #111 100%);
    overflow: hidden;
}

.video-card {
    position: absolute;
    width: 50vw;
    /* Increased from 40vw */
    max-width: 1000px;
    /* Increased from 800px */
    left: 50%;
    bottom: 2vh;
    /* Moved closer to bottom */
    height: 60vh;
    /* Use viewport height instead of fixed height */
    margin-left: -25vw;
    transform-style: preserve-3d;
    will-change: transform;
    cursor: pointer;
}

.video-card.focused {
    cursor: zoom-out;
}

.video-card:not(.focused):hover {
    transform: scale(1.05);
}

.video-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: 12px;
    box-shadow: 0 0 50px rgba(0, 0, 0, 0.7);
    /* Stronger shadow */
    background: #000;
    transform-style: preserve-3d;
}

video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.author-tag {
    position: absolute;
    bottom: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.5);
    padding: 10px 18px;
    /* Larger padding */
    margin: 15px;
    /* Larger margin */
    font-size: 18px;
    /* Slightly larger font */
    color: rgba(255, 255, 255, 0.6);
    border-radius: 8px;
    backdrop-filter: blur(10px);
}

.author-tag a {
    color: inherit;
    text-decoration: none;
}

.author-tag a:hover {
    text-decoration: underline;
}

.orientation-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 99999;
}

.orientation-message {
    text-align: center;
    color: white;
    padding: 20px;
}

.rotate-phone-icon {
    font-size: 48px;
    display: block;
    margin-bottom: 20px;
    animation: rotate 2s infinite;
}

@keyframes rotate {
    0% {
        transform: rotate(0deg);
    }

    25% {
        transform: rotate(-90deg);
    }

    75% {
        transform: rotate(-90deg);
    }

    100% {
        transform: rotate(0deg);
    }
}

/* Add responsive adjustments */
@media (max-width: 1024px) {
    .video-card {
        width: 60vw;
        margin-left: -30vw;
        height: 50vh;
    }
}

@media (max-width: 768px) {
    .video-card {
        width: 70vw;
        margin-left: -35vw;
        height: 40vh;
    }
}
</style>