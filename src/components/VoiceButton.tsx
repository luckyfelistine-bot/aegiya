"use client";
import { useState, useRef } from "react";

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  onSpeakStart?: () => void;   // optional: disable auto‑speak if needed
  onSpeakEnd?: () => void;
}

export default function VoiceButton({ onTranscript }: VoiceButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", audioBlob, "voice.webm");

        try {
          const res = await fetch("/api/whisper", { method: "POST", body: formData });
          const { text } = await res.json();
          if (text) onTranscript(text);
        } catch (err) {
          console.error("Whisper error:", err);
        }

        stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  return (
    <button
      onMouseDown={startRecording}
      onMouseUp={stopRecording}
      onMouseLeave={stopRecording}
      onTouchStart={startRecording}
      onTouchEnd={stopRecording}
      className={`p-2 rounded-full ${
        isRecording ? "bg-red-400 animate-pulse" : "bg-[var(--primary)]"
      }`}
      title="Hold to talk"
    >
      🎙️
    </button>
  );
}
