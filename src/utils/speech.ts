/**
 * speech.ts
 * Uses the browser SpeechSynthesis API to read Byeol's responses aloud.
 * Also includes speech recognition (voice input) stub.
 */

let speaking = false;
let speechQueue: string[] = [];
let currentUtterance: SpeechSynthesisUtterance | null = null;

// ------------------------------------------------------------------
// Speech Synthesis (speaking)
// ------------------------------------------------------------------

function getBestVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined') return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const preferred = [
    'Karen', 'Samantha', 'Victoria', 'Google US English',
    'Microsoft Zira', 'Microsoft Hazel',
  ];

  for (const name of preferred) {
    const match = voices.find((v) => v.name.includes(name));
    if (match) return match;
  }

  const female = voices.find(
    (v) =>
      v.lang.startsWith('en') &&
      (v.name.toLowerCase().includes('female') ||
       v.name.toLowerCase().includes('woman') ||
       v.name.toLowerCase().includes('girl'))
  );
  if (female) return female;

  return voices.find((v) => v.lang.startsWith('en')) || voices[0];
}

export function speakText(
  text: string,
  onEnd?: () => void,
  onStart?: () => void
): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  if (speaking) {
    speechQueue.push(text);
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.92;
  utterance.pitch = 1.08;
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

// ✅ Alias for components that import 'speak'
export const speak = speakText;

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    speaking = false;
    speechQueue = [];
    currentUtterance = null;
  }
}

export function pauseSpeaking(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.pause();
  }
}

export function resumeSpeaking(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.resume();
  }
}

export function isSpeaking(): boolean {
  return speaking;
}

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

// ------------------------------------------------------------------
// Speech Recognition (voice input) – stub that logs and can be expanded
// ------------------------------------------------------------------

/**
 * Start speech recognition (microphone).
 * @param onResult Callback when speech is recognized (receives transcript)
 * @param onEnd Callback when recognition ends
 * @returns A function to stop recognition
 */
export function startSpeechRecognition(
  onResult: (transcript: string) => void,
  onEnd?: () => void
): () => void {
  if (typeof window === 'undefined') {
    console.warn('Speech recognition not available in this environment');
    return () => {};
  }

  const SpeechRecognitionAPI =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognitionAPI) {
    console.warn('Speech recognition not supported in this browser');
    return () => {};
  }

  const recognition = new SpeechRecognitionAPI();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event: any) => {
    let finalTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      }
    }
    if (finalTranscript) {
      onResult(finalTranscript);
    }
  };

  recognition.onerror = (event: any) => {
    console.error('Speech recognition error:', event.error);
    onEnd?.();
  };

  recognition.onend = () => {
    onEnd?.();
  };

  recognition.start();
  return () => recognition.stop();
}
