<template>
   <div>
     <!--<Story :slides="slides" />-->
     <Story_new :slides="slides" musicSrc="easter/easter_song.mp3" />
   </div>
 </template>
 <script setup>

var  slides = [
        {image:"easter/page_1.png",audio:"",video:"easter/page_1.mp4",videoStart:4.2,text:""},
        {image:"easter/page_2.png",audio:"",video:"easter/page_2.mp4",videoStart:5.5,text:""},
        {image:"easter/page_3.png",audio:"",video:"easter/page_3.mp4",videoStart:6.2,text:""},        
        {image:"easter/page_4.png",audio:"",video:"easter/page_4.mp4",videoStart:5.4,text:""},
        {image:"easter/page_5.png",audio:"",video:"easter/page_5.mp4",videoStart:6.2,text:""},
        {image:"easter/page_6.png",audio:"",video:"easter/page_6.mp4",videoStart:7.1,text:""},
        {image:"easter/page_7.png",audio:"",video:"",videoStart:4.9,text:""},        
        {image:"easter/page_8.png",audio:"",video:"easter/page_8.mp4",videoStart:4.9,text:""},   
        {image:"easter/page_9.png",audio:"",video:"easter/page_9.mp4",videoStart:4.9,text:""},   
        {image:"easter/page_10.png",audio:"",video:"",videoStart:4.9,text:""},         
        {image:"easter/page_11.png",audio:"",video:"",videoStart:4.2,text:""},
        {image:"easter/page_12.png",audio:"",video:"",videoStart:5.5,text:""},
        {image:"easter/page_13.png",audio:"",video:"",videoStart:6.2,text:""},        
        {image:"easter/page_14.png",audio:"",video:"easter/page_14.mp4",videoStart:5.4,text:""},
        {image:"easter/page_15.png",audio:"",video:"",videoStart:6.2,text:""},
        {image:"easter/page_16.png",audio:"",video:"easter/page_16.mp4",videoStart:7.1,text:""},
        {image:"easter/page_17.png",audio:"",video:"easter/page_17.mp4",videoStart:4.9,text:""},        
        {image:"easter/page_18.png",audio:"",video:"easter/page_18.mp4",videoStart:4.9,text:""},   
        {image:"easter/page_19.png",audio:"",video:"easter/page_19.mp4",videoStart:4.9,text:""},   
        {image:"easter/page_20.png",audio:"",video:"easter/page_20.mp4",videoStart:4.9,text:""},                 
        {image:"easter/page_21.png",audio:"",video:"easter/page_21.mp4",videoStart:4.9,text:""},                 
        {image:"easter/page_22.png",audio:"",video:"easter/page_22.mp4",videoStart:4.9,text:""},                 
        {image:"easter/page_23.png",audio:"",video:"easter/page_23.mp4",videoStart:4.9,text:""},                                         
      ]      
 </script>