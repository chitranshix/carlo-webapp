export const AudioService = {
    speak(word, rate = 0.9) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.rate = rate;
            window.speechSynthesis.speak(utterance);
        }
    }
};