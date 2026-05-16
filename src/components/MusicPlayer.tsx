"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Track {
  id: string;
  title: string;
  artist: string;
  src: string;
}

export default function MusicPlayer() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [loaded, setLoaded] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch("/api/music/library")
      .then((r) => r.json())
      .then((data) => {
        if (data.tracks?.length) {
          setTracks(data.tracks);
          setLoaded(true);
        } else {
          setTracks([
            { id: "demo1", title: "Starlight Voyage", artist: "Cosmic Waves", src: "" },
            { id: "demo2", title: "Midnight in Paris", artist: "Luna Tone", src: "" },
            { id: "demo3", title: "Neon Drive", artist: "Synth Runner", src: "" },
          ]);
          setLoaded(true);
        }
      })
      .catch(() => setLoaded(true));
  }, []);

  const currentTrack = tracks[current];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onLoadedMeta = () => setDuration(audio.duration);
    const onEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        handleNext();
      }
    };
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMeta);
    audio.addEventListener("ended", onEnded);
    audio.volume = volume;
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMeta);
      audio.removeEventListener("ended", onEnded);
    };
  }, [currentTrack, isRepeat, volume]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        togglePlay();
      }
      if (e.code === "ArrowRight") handleNext();
      if (e.code === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPlaying, current, tracks]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setProgress(0);
  };

  const handleNext = useCallback(() => {
    if (tracks.length <= 1) return;
    if (isShuffle) {
      let next = Math.floor(Math.random() * tracks.length);
      while (next === current && tracks.length > 1) {
        next = Math.floor(Math.random() * tracks.length);
      }
      setCurrent(next);
    } else {
      setCurrent((prev) => (prev + 1) % tracks.length);
    }
    setIsPlaying(true);
  }, [tracks.length, current, isShuffle]);

  const handlePrev = () => {
    if (tracks.length <= 1) return;
    setCurrent((prev) => (prev - 1 + tracks.length) % tracks.length);
    setIsPlaying(true);
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const val = parseFloat(e.target.value);
    audio.currentTime = val;
    setProgress(val);
  };

  const formatTime = (t: number) => {
    if (!t || isNaN(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!loaded) {
    return (
      <div className="player-shell loading">
        <style>{` .loading { color:#fff; padding:40px; text-align:center; font-family:sans-serif; } `}</style>
        🎵 Loading your universe...
      </div>
    );
  }

  return (
    <div className="player-shell">
      <style jsx>{`
        .player-shell {
          width: 100%;
          max-width: 420px;
          background: linear-gradient(145deg, rgba(20,20,35,0.95), rgba(10,10,20,0.98));
          border-radius: 24px;
          padding: 28px;
          color: #fff;
          font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
          box-shadow:
            0 20px 60px rgba(0,0,0,0.6),
            inset 0 1px 0 rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(24px);
          display: flex;
          flex-direction: column;
          gap: 20px;
          position: relative;
          overflow: hidden;
        }
        .player-shell::before {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at 30% 30%, rgba(255,100,100,0.08), transparent 60%),
                        radial-gradient(circle at 70% 70%, rgba(100,200,255,0.06), transparent 60%);
          pointer-events: none;
          z-index: 0;
        }
        .player-content { position: relative; z-index: 1; }

        .album-art {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          margin: 0 auto 20px;
          background: linear-gradient(135deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3);
          background-size: 400% 400%;
          animation: gradientShift 8s ease infinite;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 4rem;
          box-shadow:
            0 10px 40px rgba(255,100,100,0.3),
            inset 0 0 0 4px rgba(255,255,255,0.1);
          position: relative;
          transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .album-art.spinning {
          animation: gradientShift 8s ease infinite, spin 8s linear infinite;
        }
        .album-art::after {
          content: "";
          position: absolute;
          inset: 10px;
          border-radius: 50%;
          background: rgba(0,0,0,0.3);
          backdrop-filter: blur(4px);
        }
        .album-inner {
          position: relative;
          z-index: 2;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .track-info {
          text-align: center;
          margin-bottom: 8px;
        }
        .track-title {
          font-size: 1.35rem;
          font-weight: 800;
          margin: 0;
          background: linear-gradient(90deg, #fff, #e0e0e0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }
        .track-artist {
          font-size: 0.95rem;
          color: #a0a0b8;
          margin-top: 6px;
          font-weight: 500;
        }

        .equalizer {
          display: flex;
          justify-content: center;
          gap: 4px;
          height: 32px;
          align-items: flex-end;
          margin: 16px 0;
          opacity: 0.7;
        }
        .eq-bar {
          width: 5px;
          border-radius: 3px;
          background: linear-gradient(to top, #ff6b6b, #feca57);
          animation: eqBounce 0.8s ease-in-out infinite;
        }
        .eq-bar:nth-child(1) { height: 30%; animation-delay: 0s; }
        .eq-bar:nth-child(2) { height: 60%; animation-delay: 0.1s; }
        .eq-bar:nth-child(3) { height: 90%; animation-delay: 0.2s; }
        .eq-bar:nth-child(4) { height: 50%; animation-delay: 0.15s; }
        .eq-bar:nth-child(5) { height: 70%; animation-delay: 0.05s; }
        .eq-bar:nth-child(6) { height: 40%; animation-delay: 0.25s; }
        .eq-bar:nth-child(7) { height: 80%; animation-delay: 0.1s; }
        @keyframes eqBounce {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
        .paused .eq-bar {
          animation-play-state: paused;
          height: 15% !important;
          transition: height 0.3s ease;
        }

        .progress-area {
          margin: 8px 0 4px;
        }
        .time-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: #6e6e8a;
          margin-bottom: 6px;
          font-variant-numeric: tabular-nums;
        }
        .progress-slider {
          width: 100%;
          -webkit-appearance: none;
          height: 6px;
          border-radius: 3px;
          background: rgba(255,255,255,0.08);
          outline: none;
          cursor: pointer;
        }
        .progress-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff6b6b, #feca57);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(255,107,107,0.5);
          transition: transform 0.2s;
        }
        .progress-slider::-webkit-slider-thumb:hover {
          transform: scale(1.3);
        }

        .controls {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 14px;
          margin: 10px 0;
        }
        .ctrl-btn {
          background: rgba(255,255,255,0.06);
          border: none;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          color: #d0d0e0;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          position: relative;
          overflow: hidden;
        }
        .ctrl-btn:hover {
          background: rgba(255,255,255,0.14);
          color: #fff;
          transform: scale(1.15) translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.3);
        }
        .ctrl-btn:active { transform: scale(0.95); }
        .ctrl-btn.active-mode {
          background: linear-gradient(135deg, #ff6b6b, #feca57);
          color: #1a1a2e;
          font-weight: 700;
        }
        .play-btn {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #ff6b6b, #feca57);
          color: #1a1a2e;
          font-size: 1.6rem;
          box-shadow: 0 8px 30px rgba(255,107,107,0.35);
        }
        .play-btn:hover {
          box-shadow: 0 12px 40px rgba(255,107,107,0.5);
          transform: scale(1.1);
        }
        .stop-btn:hover { color: #ff6b6b; }

        .volume-area {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 4px;
        }
        .volume-area span { font-size: 0.85rem; color: #6e6e8a; }
        .vol-slider {
          flex: 1;
          -webkit-appearance: none;
          height: 5px;
          border-radius: 3px;
          background: rgba(255,255,255,0.08);
          outline: none;
        }
        .vol-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #feca57;
          cursor: pointer;
        }

        .playlist-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
          cursor: pointer;
          padding: 8px 0;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .playlist-header h4 {
          margin: 0;
          font-size: 0.9rem;
          color: #a0a0b8;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .playlist {
          max-height: 220px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding-right: 4px;
        }
        .playlist::-webkit-scrollbar { width: 5px; }
        .playlist::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 3px;
        }
        .pl-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
        }
        .pl-item:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.06);
          transform: translateX(4px);
        }
        .pl-item.active {
          background: linear-gradient(90deg, rgba(255,107,107,0.15), rgba(254,202,87,0.1));
          border-left: 3px solid #ff6b6b;
        }
        .pl-num {
          font-size: 0.75rem;
          color: #6e6e8a;
          width: 20px;
          text-align: center;
          font-variant-numeric: tabular-nums;
        }
        .pl-info { flex: 1; }
        .pl-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: #e0e0e8;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .pl-artist {
          font-size: 0.78rem;
          color: #6e6e8a;
          margin: 2px 0 0;
        }
        .pl-playing-icon {
          color: #feca57;
          font-size: 0.9rem;
        }

        .hint {
          font-size: 0.78rem;
          color: #4a4a60;
          text-align: center;
          margin-top: 8px;
          font-style: italic;
        }
      `}</style>

      <div className="player-content">
        <div className={`album-art ${isPlaying ? "spinning" : ""}`}>
          <div className="album-inner">🎧</div>
        </div>

        <div className="track-info">
          <h2 className="track-title">{currentTrack?.title || "No Track"}</h2>
          <p className="track-artist">{currentTrack?.artist || "Add music to /public/music"}</p>
        </div>

        <div className={`equalizer ${!isPlaying ? "paused" : ""}`}>
          {[1,2,3,4,5,6,7].map(i => <div key={i} className="eq-bar" />)}
        </div>

        <div className="progress-area">
          <div className="time-row">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={progress}
            onChange={seek}
            className="progress-slider"
          />
        </div>

        <div className="controls">
          <button className={`ctrl-btn ${isShuffle ? "active-mode" : ""}`} onClick={() => setIsShuffle(!isShuffle)} title="Shuffle">🔀</button>
          <button className="ctrl-btn" onClick={handlePrev} title="Previous (⏮)">⏮</button>
          <button className="ctrl-btn" onClick={handleStop} title="Stop (⏹)">⏹</button>
          <button className="ctrl-btn play-btn" onClick={togglePlay} title="Play/Pause (Space)">{isPlaying ? "⏸" : "▶"}</button>
          <button className="ctrl-btn" onClick={handleNext} title="Next (⏭)">⏭</button>
          <button className={`ctrl-btn ${isRepeat ? "active-mode" : ""}`} onClick={() => setIsRepeat(!isRepeat)} title="Repeat">🔁</button>
        </div>

        <div className="volume-area">
          <span>🔊</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setVolume(v);
              if (audioRef.current) audioRef.current.volume = v;
            }}
            className="vol-slider"
          />
          <span>{Math.round(volume * 100)}%</span>
        </div>

        <div className="playlist-header" onClick={() => setShowPlaylist(!showPlaylist)}>
          <h4>📂 Playlist ({tracks.length})</h4>
          <span style={{ color: "#6e6e8a", fontSize: "0.85rem" }}>{showPlaylist ? "▲" : "▼"}</span>
        </div>

        {showPlaylist && (
          <div className="playlist">
            {tracks.map((t, i) => (
              <div key={t.id} className={`pl-item ${i === current ? "active" : ""}`} onClick={() => { setCurrent(i); setIsPlaying(true); }}>
                <div className="pl-num">{i === current && isPlaying ? <span className="pl-playing-icon">♫</span> : i + 1}</div>
                <div className="pl-info">
                  <p className="pl-title">{t.title}</p>
                  <p className="pl-artist">{t.artist}</p>
                </div>
                {i === current && <span style={{ color: "#ff6b6b", fontSize: "0.75rem" }}>▶</span>}
              </div>
            ))}
          </div>
        )}

        <p className="hint">
          Drop MP3/OGG/WAV files into <code style={{ color: "#feca57" }}>public/music/</code> — they appear here automatically.
        </p>
      </div>

      <audio ref={audioRef} src={currentTrack?.src || ""} preload="metadata" />
    </div>
  );
}
