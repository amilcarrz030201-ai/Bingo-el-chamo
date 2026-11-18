import React, { useState, useEffect } from "react";
import { WINNING_PATTERNS } from "../constants/patterns";
import { WinningPattern } from "../types";
import { ChevronLeft, ChevronRight, Sparkles, Layers, Info } from "lucide-react";

interface Props {
  onOpenModal?: () => void;
}

export const WinningFiguresCard: React.FC<Props> = ({ onOpenModal }) => {
  const [activeCategory, setActiveCategory] = useState<string>("TODAS");
  const [selectedPatternId, setSelectedPatternId] = useState<string>("cuadrito_cualquier_lugar");
  const [patternVariationIndexes, setPatternVariationIndexes] = useState<Record<string, number>>({});

  const categories = ["TODAS", "Cuadros", "Líneas", "Especiales"];

  const filteredPatterns = activeCategory === "TODAS"
    ? WINNING_PATTERNS
    : WINNING_PATTERNS.filter((p) => p.category === activeCategory);

  const selectedPattern = filteredPatterns.find((p) => p.id === selectedPatternId) || filteredPatterns[0] || WINNING_PATTERNS[0];

  const handleNextVariation = (patternId: string, max: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setPatternVariationIndexes((prev) => ({
      ...prev,
      [patternId]: ((prev[patternId] || 0) + 1) % max,
    }));
  };

  const handlePrevVariation = (patternId: string, max: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setPatternVariationIndexes((prev) => ({
      ...prev,
      [patternId]: ((prev[patternId] || 0) - 1 + max) % max,
    }));
  };

  // Auto-cycle variations for Cuadrito periodically so players immediately see they apply anywhere!
  useEffect(() => {
    const timer = setInterval(() => {
      setPatternVariationIndexes((prev) => {
        const next = { ...prev };
        WINNING_PATTERNS.forEach((p) => {
          if (p.alternateGrids && p.alternateGrids.length > 1) {
            const cur = prev[p.id] || 0;
            next[p.id] = (cur + 1) % p.alternateGrids.length;
          }
        });
        return next;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-slate-900/95 border border-amber-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="font-fredoka text-sm sm:text-base font-bold text-yellow-300 uppercase tracking-wider flex items-center gap-2">
            <span className="text-amber-400 text-lg">⭐</span> Formas Oficiales de Ganar
          </h3>
          <p className="text-[11px] text-slate-300 mt-0.5">
            ¡El Cuadrito aplica en <strong className="text-yellow-300">cualquier lugar</strong> del cartón (16 combinaciones posibles)!
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onOpenModal && (
            <button
              onClick={onOpenModal}
              className="text-[11px] bg-amber-500/20 hover:bg-amber-500/30 text-yellow-300 border border-amber-500/40 px-2.5 py-1 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Info size={13} />
              <span>Ver Guía Detallada</span>
            </button>
          )}
          <span className="text-[10px] bg-red-950 text-red-300 border border-red-800 px-2.5 py-1 rounded-full font-bold shadow">
            Premio: 500 VES
          </span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
              activeCategory === cat
                ? "bg-amber-400 text-slate-950 shadow"
                : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Highlight Box for currently inspected or primary selected pattern */}
      {selectedPattern && (
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-900 border border-amber-500/50 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center gap-4">
          {/* Interactive Mini-Grid */}
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            {(() => {
              const varIdx = patternVariationIndexes[selectedPattern.id] || 0;
              const gridToRender =
                selectedPattern.alternateGrids && selectedPattern.alternateGrids.length > 0
                  ? selectedPattern.alternateGrids[varIdx % selectedPattern.alternateGrids.length].grid
                  : selectedPattern.grid;
              const variationTitle =
                selectedPattern.alternateGrids && selectedPattern.alternateGrids.length > 0
                  ? selectedPattern.alternateGrids[varIdx % selectedPattern.alternateGrids.length].title
                  : null;

              return (
                <>
                  <div className="grid grid-cols-5 gap-1 w-24 h-24 bg-slate-950 p-1.5 rounded-2xl border-2 border-amber-400/80 shadow-lg shadow-amber-500/20">
                    {gridToRender.flatMap((row, r) =>
                      row.map((cell, c) => (
                        <div
                          key={`${r}-${c}`}
                          className={`rounded transition-all duration-300 flex items-center justify-center text-[8px] font-bold ${
                            cell === 1
                              ? r === 2 && c === 2
                                ? "bg-amber-300 text-slate-950 ring-1 ring-yellow-200"
                                : "bg-amber-400 text-slate-950 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                              : r === 2 && c === 2
                              ? "bg-slate-800/90 text-amber-400 border border-amber-500/30"
                              : "bg-slate-800/60"
                          }`}
                        >
                          {r === 2 && c === 2 ? "★" : ""}
                        </div>
                      ))
                    )}
                  </div>

                  {selectedPattern.alternateGrids && selectedPattern.alternateGrids.length > 1 && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <button
                        onClick={(e) =>
                          handlePrevVariation(selectedPattern.id, selectedPattern.alternateGrids!.length, e)
                        }
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                        title="Posición anterior"
                      >
                        <ChevronLeft size={13} />
                      </button>
                      <span className="text-[10px] font-mono text-amber-300 px-1 font-bold">
                        {varIdx + 1}/{selectedPattern.alternateGrids.length}
                      </span>
                      <button
                        onClick={(e) =>
                          handleNextVariation(selectedPattern.id, selectedPattern.alternateGrids!.length, e)
                        }
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                        title="Siguiente posición"
                      >
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  )}

                  {variationTitle && (
                    <span className="text-[10px] text-yellow-300 font-fredoka text-center max-w-[130px] leading-tight">
                      {variationTitle}
                    </span>
                  )}
                </>
              );
            })()}
          </div>

          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-fredoka text-sm sm:text-base font-black text-yellow-400">
                {selectedPattern.name}
              </h4>
              {selectedPattern.badge && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold font-mono">
                  {selectedPattern.badge}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {selectedPattern.details || selectedPattern.description}
            </p>
            {selectedPattern.variationsCount && (
              <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5 mt-0.5">
                <Sparkles size={13} />
                <span>¡Tiene {selectedPattern.variationsCount} posiciones válidas en cualquier lugar del cartón!</span>
              </div>
            )}

            {/* Quick 16 Positions Selector for Cuadrito Pequeño */}
            {selectedPattern.id === "cuadrito_cualquier_lugar" && selectedPattern.alternateGrids && (
              <div className="mt-1 pt-2 border-t border-slate-800/80 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>16 Formas en Cualquier Lugar:</span>
                  <span className="text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                    ⭐ #6, #7, #10, #11 con FREE (3 núms)
                  </span>
                </div>

                {/* 16 Clickable Shape Numbers */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {selectedPattern.alternateGrids.map((alt, idx) => {
                    const varIdx = patternVariationIndexes[selectedPattern.id] || 0;
                    const isCurr = (varIdx % selectedPattern.alternateGrids!.length) === idx;
                    const touchesFree = idx === 5 || idx === 6 || idx === 9 || idx === 10;
                    const isCorner = idx === 0 || idx === 3 || idx === 12 || idx === 15;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPatternVariationIndexes((prev) => ({ ...prev, [selectedPattern.id]: idx }));
                        }}
                        className={`w-6 h-6 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center transition cursor-pointer ${
                          isCurr
                            ? "bg-amber-400 text-slate-950 font-black shadow-md ring-2 ring-yellow-200 scale-105"
                            : touchesFree
                            ? "bg-amber-950/90 text-yellow-300 border border-amber-500/60 hover:bg-amber-800 shadow-sm"
                            : isCorner
                            ? "bg-slate-900 text-amber-200 border border-slate-700 hover:bg-slate-800"
                            : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800"
                        }`}
                        title={`Forma #${idx + 1}: ${alt.title}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-[9.5px] text-slate-400">
                  <span>🎯 Toca cualquier número (1-16) para ver su ubicación exacta en la cuadrícula.</span>
                  <span className="text-emerald-400 font-bold">¡Válido en cualquier sector!</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grid of All Patterns */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {filteredPatterns.map((pat) => {
          const varIdx = patternVariationIndexes[pat.id] || 0;
          const gridToRender =
            pat.alternateGrids && pat.alternateGrids.length > 0
              ? pat.alternateGrids[varIdx % pat.alternateGrids.length].grid
              : pat.grid;
          const isSelected = pat.id === selectedPatternId;

          return (
            <div
              key={pat.id}
              onClick={() => setSelectedPatternId(pat.id)}
              className={`p-3 rounded-2xl border flex flex-col items-center gap-2 shadow transition cursor-pointer relative ${
                isSelected
                  ? "bg-slate-950 border-amber-400 ring-2 ring-amber-400/40 shadow-amber-500/10"
                  : "bg-slate-950/80 border-slate-800 hover:border-amber-500/50 hover:bg-slate-950"
              }`}
            >
              {/* Badge */}
              {pat.badge && (
                <span className="text-[9px] bg-slate-900 text-amber-300 px-1.5 py-0.5 rounded-md border border-slate-700 font-bold font-mono">
                  {pat.badge}
                </span>
              )}

              <div className="font-fredoka font-bold text-yellow-300 text-xs text-center line-clamp-1">
                {pat.name}
              </div>

              {/* 5x5 Mini Preview Grid */}
              <div className="grid grid-cols-5 gap-0.5 w-16 h-16 bg-slate-900 p-1 rounded-xl border border-slate-800 relative">
                {gridToRender.flatMap((row, r) =>
                  row.map((cell, c) => (
                    <div
                      key={`${r}-${c}`}
                      className={`rounded-[2px] transition-all duration-300 ${
                        cell === 1
                          ? r === 2 && c === 2
                            ? "bg-amber-300 ring-1 ring-amber-200"
                            : "bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.8)]"
                          : r === 2 && c === 2
                          ? "bg-slate-800 text-amber-300 flex items-center justify-center text-[7px]"
                          : "bg-slate-800/80"
                      }`}
                    >
                      {r === 2 && c === 2 && cell !== 1 ? "★" : ""}
                    </div>
                  ))
                )}
              </div>

              {/* Controls if multiple variations */}
              {pat.alternateGrids && pat.alternateGrids.length > 1 && (
                <div className="flex items-center justify-between w-full px-1">
                  <button
                    type="button"
                    onClick={(e) => handlePrevVariation(pat.id, pat.alternateGrids!.length, e)}
                    className="text-slate-400 hover:text-white p-0.5"
                    title="Anterior posición"
                  >
                    <ChevronLeft size={12} />
                  </button>
                  <span className="text-[9px] font-mono text-slate-400">
                    {varIdx + 1}/{pat.alternateGrids.length}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleNextVariation(pat.id, pat.alternateGrids!.length, e)}
                    className="text-slate-400 hover:text-white p-0.5"
                    title="Siguiente posición"
                  >
                    <ChevronRight size={12} />
                  </button>
                </div>
              )}

              <span className="text-[10px] text-slate-400 text-center leading-tight line-clamp-2">
                {pat.description}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
