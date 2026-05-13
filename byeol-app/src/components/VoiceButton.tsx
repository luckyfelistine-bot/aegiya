"use client";

import React, { useState, useRef, useCallback } from "react";
import { MicIcon } from "./SvgIcons";

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
}

export default function VoiceButton({ onTranscript }: VoiceButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const initRecognition = useCallback(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SR();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onresult = (e: SpeechRecognitionEvent) => {
      let text = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
      }
      if (e.results[e.results.length - 1].isFinal) {
        onTranscript(text);
        stopRecording();
      }
    };

    recognitionRef.current.onerror = () => stopRecording();
    recognitionRef.current.onend = () => stopRecording();
  }, [onTranscript]);

  const startRecording = () => {
    if (!recognitionRef.current) initRecognition();
    if (!recognitionRef.current) return;
    setIsRecording(true);
    recognitionRef.current.start();
  };

  const stopRecording = () => {
    setIsRecording(false);
    recognitionRef.current?.stop();
  };

  return (
    <button
      className={`dock-btn ${isRecording ? "recording" : ""}`}
      title="Hold to talk"
      onMouseDown={startRecording}
      onMouseUp={stopRecording}
      onMouseLeave={stopRecording}
      onTouchStart={startRecording}
      onTouchEnd={stopRecording}
    >
      <MicIcon size={22} />
    </button>
  );
}
