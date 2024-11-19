// composables/useSpeech.js
import { ref } from 'vue';

export function useSpeech() {
  const utterance = ref(null);
  const isPlaying = ref(false);

  function speak(text, onWord, onComplete) {
    stop();

    if (!('speechSynthesis' in window)) {
      console.error('Speech synthesis not supported');
      return;
    }

    utterance.value = new SpeechSynthesisUtterance(text);
    utterance.value.lang = 'en-US';
    utterance.value.rate = 1;

    // Add space to handle last word
    const textWithSpace = text + ' ';

    utterance.value.onboundary = (event) => {
      if (event.type === 'word') {
        const charIndex = event.charIndex;
        const textUpToChar = textWithSpace.slice(0, charIndex);
        const wordIndex = textUpToChar.trim().split(/\s+/).length - 1;
        onWord(wordIndex);
      }
    };

    utterance.value.onend = () => {
      isPlaying.value = false;
      onComplete?.();
    };

    isPlaying.value = true;
    window.speechSynthesis.speak(utterance.value);
  }

  function stop() {
    if (utterance.value) {
      window.speechSynthesis.cancel();
      isPlaying.value = false;
      utterance.value = null;
    }
  }

  return {
    speak,
    stop,
    isPlaying
  };
}