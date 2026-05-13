/**
 * speech.ts
 * Uses the browser SpeechSynthesis API to read Byeol's responses aloud.
 * Upgraded: voice selection, queue management, pause/resume, event hooks.
 */

let speaking = false;
let speechQueue: string[] = [];
let currentUtterance: SpeechSynthesisUtterance | null = null;

/**
 * Get the best available voice for Byeol.
 * Priority: Karen (AU female) > Samantha > any female > default
 */
function getBestVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined') return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const preferred = [
    'Karen',           // Australian female — warm, clear
    'Samantha',        // iOS female
    'Victoria',        // macOS female
    'Google US English',
    'Microsoft Zira',
    'Microsoft Hazel',
  ];

  for (const name of preferred) {
    const match = voices.find((v) => v.name.includes(name));
    if (match) return match;
  }

  // Fallback: any English female voice
  const female = voices.find(
    (v) =>
      (v.lang.startsWith('en') &&
        (v.name.toLowerCase().includes('female') ||
         v.name.toLowerCase().includes('woman') ||
         v.name.toLowerCase().includes('girl')))
  );
  if (female) return female;

  // Last resort: any English voice
  return voices.find((v) => v.lang.startsWith('en')) || voices[0];
}

/**
 * Speaks the given text in a warm, feminine voice.
 * @param text - The message Byeol wants to say.
 * @param onEnd - Callback when speech finishes.
 * @param onStart - Callback when speech starts.
 */
export function speakText(
  text: string,
  onEnd?: () => void,
  onStart?: () => void
): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  // Queue if already speaking
  if (speaking) {
    speechQueue.push(text);
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.92;        // Slightly slower, warmer
  utterance.pitch = 1.08;       // Slightly higher, sweeter
  utterance.volume = 0.9;

  const voice = getBestVoice();
  if (voice) utterance.voice = voice;

  utterance.onstart = () => {
    speaking = true;
    onStart?.();
  };

  utterance.onend = () => {
    speaking = false;
    onEnd?.();
    // Process queue
    if (speechQueue.length > 0) {
      const next = speechQueue.shift()!;
      speakText(next, onEnd, onStart);
    }
  };

  utterance.onerror = (e) => {
    console.warn('Speech error:', e);
    speaking = false;
    onEnd?.();
  };

  currentUtterance = utterance;
  speaking = true;
  window.speechSynthesis.speak(utterance);
}

/**
 * Stops any ongoing speech immediately and clears the queue.
 */
export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    speaking = false;
    speechQueue = [];
    currentUtterance = null;
  }
}

/**
 * Pause current speech (if supported).
 */
export function pauseSpeaking(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.pause();
  }
}

/**
 * Resume paused speech.
 */
export function resumeSpeaking(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.resume();
  }
}

/**
 * Check if currently speaking.
 */
export function isSpeaking(): boolean {
  return speaking;
}

/**
 * Preload voices (call on app init to avoid delay on first speak).
 */
export function preloadVoices(): void {
  if (typeof window === 'undefined') return;
  const load = () => {
    window.speechSynthesis.getVoices();
  };
  load();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = load;
  }
}
