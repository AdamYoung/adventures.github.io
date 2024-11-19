<script setup>
// Remove import as Nuxt 3 auto-imports components

const leftVideos = [
  {
    id: 1,
    thumbnail: '/page1.mp4',
    videoUrl: '/page1.mp4',
    author: 'Page 1',
    authorLink: '#'
  },
  {
    id: 2,
    thumbnail: '/page2.mp4',
    videoUrl: '/page2.mp4',
    author: 'Page 2',
    authorLink: '#'
  },
  {
    id: 3,
    thumbnail: '/page3.mp4',
    videoUrl: '/page3.mp4',
    author: 'Page 3',
    authorLink: '#'
  },
  {
    id: 1,
    thumbnail: '/page1.mp4',
    videoUrl: '/page1.mp4',
    author: 'Page 1',
    authorLink: '#'
  },
  {
    id: 2,
    thumbnail: '/page2.mp4',
    videoUrl: '/page2.mp4',
    author: 'Page 2',
    authorLink: '#'
  },
  {
    id: 3,
    thumbnail: '/page3.mp4',
    videoUrl: '/page3.mp4',
    author: 'Page 3',
    authorLink: '#'
  }  
];

const rightVideos = [
  {
    id: 4,
    thumbnail: '/page4.png',
    videoUrl: '/page4.mp4',
    author: 'Page 4',
    authorLink: '#'
  },
  {
    id: 5,
    thumbnail: '/page5.png',
    videoUrl: '/page5.mp4',
    author: 'Page 5',
    authorLink: '#'
  },
  {
    id: 6,
    thumbnail: '/page6.png',
    videoUrl: '/page6.mp4',
    author: 'Page 6',
    authorLink: '#'
  },
  {
    id: 4,
    thumbnail: '/page4.png',
    videoUrl: '/page4.mp4',
    author: 'Page 4',
    authorLink: '#'
  },
  {
    id: 5,
    thumbnail: '/page5.png',
    videoUrl: '/page5.mp4',
    author: 'Page 5',
    authorLink: '#'
  },
  {
    id: 6,
    thumbnail: '/page6.png',
    videoUrl: '/page6.mp4',
    author: 'Page 6',
    authorLink: '#'
  }  
];
</script>

<template>
  <VideoRails 
    :left-videos="leftVideos"
    :right-videos="rightVideos"
  />
</template>