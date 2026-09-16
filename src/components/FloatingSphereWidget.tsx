import React, { useState } from "react";
import { getBallLetter } from "../utils/bingo";
import { ChevronDown, ChevronUp, Sparkles, Disc } from "lucide-react";
import { RotatingMeshTombola } from "./RotatingMeshTombola";

interface Props {
  currentBall: number | null;
  drawnBalls: number[];
  totalBalls: number;
  isAdmin: boolean;
  onDrawNext?: () => void;
}

export const FloatingSphereWidget: React.FC<Props> = ({
  currentBall,
  drawnBalls,
  totalBalls,
  isAdmin,
  onDrawNext,
}) => {
  const [minimized, setMinimized] = useState(false);

  const remaining = totalBalls - drawnBalls.length;
  const letter = currentBall ? getBallLetter(currentBall) : "";

  return (
    <aside
      aria-label="Tómbola de esfera de malla giratoria"
      className={`fixed bottom-4 right-4 z-40 transition-all duration-300 ease-in-out ${
        minimized ? "translate-y-1" : ""
      }`}
    >
      <div className="bg-slate-900/95 backdrop-blur-md border border-amber-500/60 rounded-3xl p-3.5 shadow-2xl shadow-amber-500/20 flex flex-col items-center gap-2 max-w-[170px] border-t-amber-300">
        {/* Header with minimize button */}
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-1.5 text-[11px] font-fredoka">
          <span className="text-yellow-300 font-bold flex items-center gap-1">
            <Disc size={13} className="text-amber-400 animate-spin" /> Esfera de Malla
          </span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono bg-slate-950 px-1.5 py-0.5 rounded-full text-amber-400 font-bold border border-slate-800" title="Bolas restantes">
              {remaining}
            </span>
            <button
              onClick={() => setMinimized(!minimized)}
              className="text-slate-400 hover:text-white p-0.5 rounded transition cursor-pointer"
              title={minimized ? "Expandir esfera de malla" : "Minimizar esfera"}
            >
              {minimized ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {/* Rotating Wire-Mesh Tombola with tumbling numbered balls */}
        {!minimized && (
          <div className="flex flex-col items-center gap-2 my-1">
            <RotatingMeshTombola
              currentBall={currentBall}
              isSpinning={true}
              size="sm"
              showDrawnBall={true}
            />

            {/* Ball Announcement Pill */}
            <div className="text-[10px] font-fredoka text-center leading-tight">
              {currentBall ? (
                <span className="bg-slate-950 border border-amber-500/40 px-2.5 py-1 rounded-xl text-yellow-300 flex items-center gap-1 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Bola: <strong className="text-white text-xs">{letter}-{currentBall}</strong>
                </span>
              ) : (
                <span className="text-slate-400 italic">Girando tómbola...</span>
              )}
            </div>

            {/* Admin trigger button if admin */}
            {isAdmin && onDrawNext && (
              <button
                onClick={onDrawNext}
                className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 text-[10px] font-fredoka font-black py-1 px-2 rounded-xl shadow transition cursor-pointer"
              >
                ¡Cantar Siguiente Bola!
              </button>
            )}
          </div>
        )}

        {/* Minimized View */}
        {minimized && currentBall && (
          <div className="flex items-center gap-2 py-0.5">
            <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-600 text-slate-950 font-fredoka font-black text-xs flex flex-col items-center justify-center shadow border border-white/50">
              <span className="text-[7px] text-red-900 leading-none">{letter}</span>
              <span className="leading-none">{currentBall}</span>
            </span>
            <span className="font-fredoka text-xs text-yellow-300 font-bold">
              {letter}-{currentBall}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};
