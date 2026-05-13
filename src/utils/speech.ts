/**
 * speech.ts
 * Uses the browser SpeechSynthesis API to read Byeol's responses aloud.
 */

let speaking = false;

/**
 * Speaks the given text in a warm, feminine voice if available.
 * @param text - The message Byeol wants to say.
 * @param onEnd - Callback when speech finishes.
 */
export function speakText(text: string, onEnd?: () => void): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;        // Slightly slower, warmer
  utterance.pitch = 1.1;        // Slightly higher, sweeter
  utterance.volume = 0.9;

  // Try to find a kind, soft voice – preferably female
  const voices = window.speechSynthesis.getVoices();
  if (voices.length) {
    // Prefer a voice like "Karen" (Australian female) or any female voice with "female" in name
    const preferred = voices.find(
      (v) => v.name.includes('female') || v.name.includes('Female') || v.name === 'Karen'
    );
    if (preferred) utterance.voice = preferred;
  }

  utterance.onend = () => {
    speaking = false;
    onEnd?.();
  };

  utterance.onerror = () => {
    speaking = false;
    onEnd?.();
  };

  speaking = true;
  window.speechSynthesis.speak(utterance);
}

/**
 * Stops any ongoing speech immediately.
 */
export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    speaking = false;
  }
}
