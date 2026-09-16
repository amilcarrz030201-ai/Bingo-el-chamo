import React from "react";
import { getBallLetter } from "../utils/bingo";

interface Props {
  drawnBalls: number[];
}

export const MasterBoard: React.FC<Props> = ({ drawnBalls }) => {
  const letters = ["B", "I", "N", "G", "O"];

  const ranges = [
    { letter: "B", start: 1, end: 15, color: "from-red-600 to-rose-700" },
    { letter: "I", start: 16, end: 30, color: "from-amber-500 to-yellow-600" },
    { letter: "N", start: 31, end: 45, color: "from-emerald-600 to-teal-700" },
    { letter: "G", start: 46, end: 60, color: "from-blue-600 to-cyan-700" },
    { letter: "O", start: 61, end: 75, color: "from-purple-600 to-indigo-700" },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 font-bold text-sm">📋</span>
          <h3 className="font-fredoka text-xs sm:text-sm font-bold text-yellow-300 uppercase tracking-wider">
            Tablero Maestro (1 - 75)
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono bg-slate-950 px-2.5 py-1 rounded-xl text-amber-300 border border-slate-800 font-bold">
            {drawnBalls.length} / 75 Cantadas
          </span>
          <span className="text-[11px] font-mono bg-slate-950 px-2 py-1 rounded-xl text-slate-400 border border-slate-800 hidden sm:inline">
            {75 - drawnBalls.length} restantes
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 overflow-x-auto pb-1">
        {ranges.map((row) => (
          <div key={row.letter} className="flex items-center gap-1.5 min-w-[580px]">
            {/* Row Letter Header */}
            <div
              className={`w-7 h-7 rounded-xl bg-gradient-to-tr ${row.color} text-white font-fredoka font-black text-xs flex items-center justify-center shadow shrink-0`}
            >
              {row.letter}
            </div>

            {/* 15 Numbers in this range */}
            <div className="flex-1 grid grid-cols-15 gap-1">
              {Array.from(
                { length: row.end - row.start + 1 },
                (_, i) => row.start + i
              ).map((num) => {
                const isDrawn = drawnBalls.includes(num);
                const isLatest = drawnBalls[drawnBalls.length - 1] === num;

                return (
                  <div
                    key={num}
                    className={`aspect-square rounded-lg flex items-center justify-center font-mono font-bold text-[10px] sm:text-xs transition-all duration-300 ${
                      isLatest
                        ? "bg-gradient-to-tr from-yellow-300 to-amber-500 text-slate-950 font-black shadow-lg shadow-yellow-500/30 ring-2 ring-yellow-200 scale-110 z-10"
                        : isDrawn
                        ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                        : "bg-slate-950 text-slate-600 border border-slate-900"
                    }`}
                  >
                    {num}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
