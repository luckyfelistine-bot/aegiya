"use client";

import { useState, useRef } from "react";
import { MicIcon, LoaderIcon } from "./SvgIcons";
import { startSpeechRecognition } from "@/utils/speech";

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
}

export default function VoiceButton({ onTranscript }: VoiceButtonProps) {
  const [recording, setRecording] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);

  const handleStart = () => {
    setRecording(true);
    stopRef.current = startSpeechRecognition({
      onResult: (text, isFinal) => {
        if (isFinal && text.trim()) {
          onTranscript(text.trim());
        }
      },
      onError: () => {
        setRecording(false);
      },
      onEnd: () => {
        setRecording(false);
      },
      lang: "en-US",
    });
  };

  const handleStop = () => {
    if (stopRef.current) {
      stopRef.current();
      stopRef.current = null;
    }
    setRecording(false);
  };

  return (
    <button
      className={`voice-btn ${recording ? "recording" : ""}`}
      onClick={recording ? handleStop : handleStart}
      aria-label={recording ? "Stop recording" : "Start voice input"}
    >
      {recording ? <LoaderIcon size={20} /> : <MicIcon size={20} />}
    </button>
  );
}
