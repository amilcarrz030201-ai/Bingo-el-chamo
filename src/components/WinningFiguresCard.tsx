import React from "react";
import { WINNING_PATTERNS } from "../constants/patterns";

export const WinningFiguresCard: React.FC = () => {
  return (
    <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-4 shadow-xl flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h3 className="font-fredoka text-xs sm:text-sm font-bold text-yellow-300 uppercase tracking-wider flex items-center gap-1.5">
          <span className="text-amber-400">⭐</span> ¿Cómo Se Gana? - 8 Figuras Oficiales
        </h3>
        <span className="text-[10px] bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded-full font-bold">
          Premio: 500 VES
        </span>
      </div>

      <p className="text-[11px] text-slate-300">
        Completa cualquiera de estas 8 figuras con los números cantados para gritar ¡BINGO!:
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {WINNING_PATTERNS.map((pat) => (
          <div
            key={pat.id}
            className="bg-slate-950 p-2.5 rounded-2xl border border-amber-500/40 hover:border-amber-400 flex flex-col items-center gap-1.5 shadow transition"
          >
            <div className="font-fredoka font-bold text-yellow-400 text-[11px] text-center">
              {pat.name}
            </div>

            {/* 5x5 Mini Preview Grid */}
            <div className="grid grid-cols-5 gap-0.5 w-14 h-14 bg-slate-900 p-1 rounded-xl border border-slate-800">
              {pat.grid.flatMap((row, r) =>
                row.map((cell, c) => (
                  <div
                    key={`${r}-${c}`}
                    className={`rounded-[2px] transition-colors ${
                      cell === 1
                        ? r === 2 && c === 2
                          ? "bg-amber-300 ring-1 ring-amber-200"
                          : "bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.6)]"
                        : "bg-slate-800/80"
                    }`}
                  />
                ))
              )}
            </div>

            <span className="text-[9px] text-slate-400 text-center leading-tight">
              {pat.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
