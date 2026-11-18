import React, { useState, useEffect } from "react";
import { X, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music, Disc3, Radio, ArrowLeft } from "lucide-react";
import { audioEngine } from "../utils/audio";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const MusicPlayerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(audioEngine.isPlaying());
  const [currentIndex, setCurrentIndex] = useState(audioEngine.getTrackIndex());
  const [volume, setVolume] = useState(0.25);
  const [isMuted, setIsMuted] = useState(audioEngine.getMuted());

  useEffect(() => {
    setIsPlaying(audioEngine.isPlaying());
    setCurrentIndex(audioEngine.getTrackIndex());
    setIsMuted(audioEngine.getMuted());
  }, [isOpen]);

  // Handle ESC key to smoothly return to previous screen without interrupting playback
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tracks = audioEngine.tracks;
  const currentTrack = tracks[currentIndex];

  const handleTogglePlay = () => {
    const active = audioEngine.toggleMusic();
    setIsPlaying(active);
    setCurrentIndex(audioEngine.getTrackIndex());
  };

  const handleNext = () => {
    const nextIdx = audioEngine.nextTrack();
    setCurrentIndex(nextIdx);
    setIsPlaying(audioEngine.isPlaying());
  };

  const handlePrev = () => {
    const prevIdx = audioEngine.prevTrack();
    setCurrentIndex(prevIdx);
    setIsPlaying(audioEngine.isPlaying());
  };

  const handleSelectTrack = (idx: number) => {
    audioEngine.playTrack(idx);
    setCurrentIndex(idx);
    setIsPlaying(true);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioEngine.setVolume(val);
    if (val === 0 && !isMuted) {
      audioEngine.toggleMute();
      setIsMuted(true);
    } else if (val > 0 && isMuted) {
      audioEngine.toggleMute();
      setIsMuted(false);
    }
  };

  const handleToggleMute = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
    setIsPlaying(audioEngine.isPlaying());
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 flex flex-col gap-4 shadow-2xl relative">
        {/* Top Navigation Bar with prominent 'Atrás' button */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-3">
          <button
            id="btn-music-back-top"
            onClick={onClose}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 active:scale-95 text-yellow-300 hover:text-yellow-200 border border-amber-500/50 transition cursor-pointer font-fredoka font-bold text-xs sm:text-sm shrink-0 shadow"
            title="Volver atrás a la sala"
          >
            <ArrowLeft size={16} className="text-yellow-400" />
            <span>Atrás</span>
          </button>

          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="p-2 rounded-xl bg-amber-500/20 text-yellow-300 border border-amber-500/40 shrink-0 hidden xs:flex">
              <Radio size={18} className={isPlaying ? "animate-pulse" : ""} />
            </div>
            <div className="min-w-0">
              <h3 className="font-fredoka text-sm sm:text-base font-bold text-yellow-300 truncate">
                Reproductor de Música
              </h3>
              <p className="text-[11px] text-slate-400 truncate">
                Música criolla & ambiente de bingo
              </p>
            </div>
          </div>

          <button
            id="btn-music-close"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer text-xs font-fredoka shrink-0"
            title="Cerrar y volver a la sala"
          >
            <span className="hidden sm:inline font-bold">Cerrar</span>
            <X size={16} />
          </button>
        </div>

        {/* Vinyl Player Center Display */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col items-center gap-3 text-center relative overflow-hidden">
          {/* Animated Visualizer Bars */}
          {isPlaying && (
            <div className="absolute top-3 left-4 right-4 flex items-end justify-center gap-1.5 h-6 pointer-events-none opacity-60">
              {[40, 75, 100, 60, 85, 30, 90, 50, 70, 95, 45, 80].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-gradient-to-t from-amber-500 to-yellow-300 rounded-full animate-pulse"
                  style={{
                    height: `${h}%`,
                    animationDuration: `${0.4 + (i % 4) * 0.15}s`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Album Vinyl Art */}
          <div className="relative mt-2">
            <div
              className={`w-28 h-28 rounded-full bg-gradient-to-tr from-slate-950 via-slate-900 to-black flex items-center justify-center shadow-2xl border-4 border-amber-500/60 select-none ${
                isPlaying ? "animate-spin" : ""
              }`}
              style={{ animationDuration: "5s" }}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-600 flex items-center justify-center border-2 border-slate-950 text-slate-950 font-black text-xs">
                <Disc3 size={20} className="text-slate-950" />
              </div>
            </div>
          </div>

          <div className="mt-1">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-yellow-300 border border-amber-500/40">
              {currentTrack.genre}
            </span>
            <h4 className="font-fredoka text-base sm:text-lg font-bold text-white mt-1.5">
              {currentTrack.title}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentTrack.description}
            </p>
          </div>

          {/* Player Buttons */}
          <div className="flex items-center gap-5 mt-2">
            <button
              onClick={handlePrev}
              className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 flex items-center justify-center transition border border-slate-800 cursor-pointer shadow"
              title="Pista anterior"
            >
              <SkipBack size={18} />
            </button>

            <button
              onClick={handleTogglePlay}
              className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-yellow-500 to-amber-600 hover:from-yellow-400 text-slate-950 flex items-center justify-center text-xl shadow-lg transition active:scale-95 font-bold cursor-pointer"
              title={isPlaying ? "Pausar música" : "Reproducir música"}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
            </button>

            <button
              onClick={handleNext}
              className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 flex items-center justify-center transition border border-slate-800 cursor-pointer shadow"
              title="Siguiente pista"
            >
              <SkipForward size={18} />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3 w-full max-w-xs mt-2 px-2">
            <button
              onClick={handleToggleMute}
              className="text-slate-400 hover:text-yellow-300 transition cursor-pointer"
            >
              {isMuted ? <VolumeX size={16} className="text-red-400" /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] font-mono text-slate-400 w-8 text-right">
              {isMuted ? "0%" : `${Math.round(volume * 100)}%`}
            </span>
          </div>
        </div>

        {/* Playlist Selection (Varias Músicas) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Músicas Disponibles ({tracks.length}):
          </label>
          <div className="flex flex-col gap-1.5 max-h-[170px] overflow-y-auto pr-1">
            {tracks.map((track, idx) => {
              const isSelected = idx === currentIndex;

              return (
                <button
                  key={track.id}
                  onClick={() => handleSelectTrack(idx)}
                  className={`p-2.5 rounded-xl text-left text-xs font-fredoka flex items-center justify-between transition cursor-pointer ${
                    isSelected
                      ? "bg-amber-500/20 border border-amber-500/50 text-yellow-300 shadow"
                      : "bg-slate-950/80 hover:bg-slate-950 text-slate-300 border border-slate-800/80"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                        isSelected && isPlaying
                          ? "bg-amber-500 text-slate-950 animate-bounce"
                          : "bg-slate-900 text-slate-400 border border-slate-800"
                      }`}
                    >
                      {isSelected && isPlaying ? "▶" : idx + 1}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold truncate text-white">
                        {track.title}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate">
                        {track.description}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 text-amber-300 border border-slate-800 shrink-0 font-mono">
                    {track.genre}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 text-center">
          🎵 La música continúa sonando de fondo mientras juegas y compras tus cartones.
        </div>

        {/* Footer Navigation Buttons with explicit "Atrás" */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
          <button
            id="btn-music-back-bottom"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white font-fredoka font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer shadow"
            title="Volver atrás a la sala"
          >
            <ArrowLeft size={16} />
            <span>Atrás</span>
          </button>
          <button
            id="btn-music-done"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:scale-95 text-slate-950 font-fredoka font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg"
            title="Aceptar y continuar jugando"
          >
            <span>Listo (Jugar)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
