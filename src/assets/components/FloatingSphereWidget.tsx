import React, { useState, useEffect, useRef } from "react";
import { getBallLetter } from "../utils/bingo";
import { ChevronDown, ChevronUp, Disc, Move, X } from "lucide-react";
import { RotatingMeshTombola } from "./RotatingMeshTombola";

interface Props {
  currentBall: number | null;
  drawnBalls: number[];
  totalBalls: number;
  isAdmin: boolean;
  onDrawNext?: () => void;
  isSpecialBall?: boolean;
  isWinningBall?: boolean;
  specialBallLabel?: string;
}

export const FloatingSphereWidget: React.FC<Props> = ({
  currentBall,
  drawnBalls,
  totalBalls,
  isAdmin,
  onDrawNext,
  isSpecialBall = false,
  isWinningBall = false,
  specialBallLabel,
}) => {
  // Never show floating sphere to Admin
  if (isAdmin) {
    return null;
  }

  const [minimized, setMinimized] = useState(false);
  const [closed, setClosed] = useState(false);

  // Position state (default: safe corner)
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem("chamo_sphere_pos_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          typeof parsed.x === "number" &&
          typeof parsed.y === "number" &&
          parsed.y >= 90 &&
          parsed.x >= 0
        ) {
          return parsed;
        }
      }
    } catch {}
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    const initX = typeof window !== "undefined" ? Math.max(12, window.innerWidth - (isMobile ? 180 : 190)) : 250;
    const initY = typeof window !== "undefined" ? Math.max(90, window.innerHeight - (isMobile ? 140 : 250)) : 380;
    return { x: initX, y: initY };
  });

  const isDraggingRef = useRef(false);
  const dragStartOffset = useRef({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);

  // Keep inside window bounds on resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        const maxX = Math.max(10, window.innerWidth - 185);
        const maxY = Math.max(10, window.innerHeight - 100);
        return {
          x: Math.min(Math.max(10, prev.x), maxX),
          y: Math.min(Math.max(10, prev.y), maxY),
        };
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Save position when it changes
  useEffect(() => {
    try {
      localStorage.setItem("chamo_sphere_pos_v1", JSON.stringify(position));
    } catch {}
  }, [position]);

  // Pointer drag event handlers for mouse & touch
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only trigger drag if clicked on header or drag handle, or if directly dragging
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("input")) {
      return;
    }

    isDraggingRef.current = true;
    dragStartOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;

    const newX = e.clientX - dragStartOffset.current.x;
    const newY = e.clientY - dragStartOffset.current.y;

    const maxX = Math.max(10, window.innerWidth - 180);
    const maxY = Math.max(10, window.innerHeight - 80);

    setPosition({
      x: Math.min(Math.max(10, newX), maxX),
      y: Math.min(Math.max(10, newY), maxY),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const remaining = totalBalls - drawnBalls.length;
  const letter = currentBall ? getBallLetter(currentBall) : "";

  if (closed) {
    return (
      <button
        onClick={() => setClosed(false)}
        className="fixed bottom-3 right-3 z-40 bg-slate-900/90 border border-amber-500/50 hover:border-amber-400 text-yellow-300 rounded-full px-3 py-1.5 shadow-xl flex items-center gap-1.5 text-xs font-fredoka font-bold cursor-pointer transition active:scale-95 hover:bg-slate-800"
        title="Mostrar tómbola de esfera flotante"
      >
        <Disc size={14} className="animate-spin text-amber-400" />
        <span>Esfera Malla</span>
      </button>
    );
  }

  return (
    <aside
      ref={widgetRef}
      aria-label="Tómbola de esfera de malla giratoria movible"
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 45,
        touchAction: "none",
      }}
      className="select-none transition-shadow"
    >
      <div className="bg-slate-900/95 border border-amber-500/60 rounded-3xl p-3 shadow-2xl shadow-amber-500/20 flex flex-col items-center gap-2 w-[170px] border-t-amber-300">
        {/* Draggable Header */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full flex items-center justify-between border-b border-slate-800 pb-1.5 text-[11px] font-fredoka cursor-grab active:cursor-grabbing hover:bg-slate-800/40 rounded-t-xl px-1 py-0.5 transition"
          title="Arrastra para mover la esfera a cualquier lugar de la pantalla"
        >
          <div className="flex items-center gap-1 text-yellow-300 font-bold min-w-0">
            <Move size={12} className="text-amber-400 shrink-0 opacity-70" />
            <Disc size={13} className="text-amber-400 animate-spin shrink-0" />
            <span className="truncate">Esfera Malla</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span
              className="text-[10px] font-mono bg-slate-950 px-1.5 py-0.5 rounded-full text-amber-400 font-bold border border-slate-800"
              title="Bolas restantes"
            >
              {remaining}
            </span>
            <button
              onClick={() => setMinimized(!minimized)}
              className="text-slate-400 hover:text-white p-0.5 rounded transition cursor-pointer"
              title={minimized ? "Expandir esfera de malla" : "Minimizar esfera"}
            >
              {minimized ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <button
              onClick={() => setClosed(true)}
              className="text-slate-400 hover:text-red-400 p-0.5 rounded transition cursor-pointer ml-0.5"
              title="Cerrar / Ocultar esfera"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Rotating Wire-Mesh Tombola with tumbling numbered balls */}
        {!minimized && (
          <div className="flex flex-col items-center gap-2 my-1 w-full">
            <RotatingMeshTombola
              currentBall={currentBall}
              isSpinning={true}
              size="sm"
              showDrawnBall={true}
              isSpecialBall={isSpecialBall}
              isWinningBall={isWinningBall}
              specialBallLabel={specialBallLabel}
            />

            {/* Ball Announcement Pill */}
            <div className="text-[10px] font-fredoka text-center leading-tight">
              {currentBall ? (
                <span className="bg-slate-950 border border-amber-500/40 px-2.5 py-1 rounded-xl text-yellow-300 flex items-center gap-1 font-bold shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Bola: <strong className="text-white text-xs">{letter}-{currentBall}</strong>
                </span>
              ) : (
                <span className="text-slate-400 italic">Girando tómbola...</span>
              )}
            </div>

            <div className="text-[9px] text-slate-400 font-mono flex items-center gap-1 text-center">
              <span>Mueve arrastrando ✥</span>
            </div>
          </div>
        )}

        {/* Minimized View */}
        {minimized && (
          <div className="flex items-center justify-between w-full py-0.5 px-1">
            {currentBall ? (
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-600 text-slate-950 font-fredoka font-black text-xs flex flex-col items-center justify-center shadow border border-white/50">
                  <span className="text-[7px] text-red-900 leading-none">{letter}</span>
                  <span className="leading-none">{currentBall}</span>
                </span>
                <span className="font-fredoka text-xs text-yellow-300 font-bold">
                  {letter}-{currentBall}
                </span>
              </div>
            ) : (
              <span className="text-[10px] text-slate-400 italic">Girando...</span>
            )}
            <Move size={11} className="text-slate-500 opacity-60" />
          </div>
        )}
      </div>
    </aside>
  );
};
