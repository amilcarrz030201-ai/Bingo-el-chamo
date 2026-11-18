import React, { useState } from "react";
import { WINNING_PATTERNS } from "../constants/patterns";
import { X, Sparkles, Trophy, HelpCircle, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const WinningFiguresModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<string>("TODAS");
  const [selectedPatternId, setSelectedPatternId] = useState<string>("cuadrito_cualquier_lugar");
  const [variationIndex, setVariationIndex] = useState<Record<string, number>>({});

  if (!isOpen) return null;

  const categories = ["TODAS", "Cuadros", "Líneas", "Especiales"];

  const filteredPatterns =
    activeTab === "TODAS"
      ? WINNING_PATTERNS
      : WINNING_PATTERNS.filter((p) => p.category === activeTab);

  const selectedPattern =
    filteredPatterns.find((p) => p.id === selectedPatternId) || filteredPatterns[0] || WINNING_PATTERNS[0];

  const currentVariationIdx = variationIndex[selectedPattern.id] || 0;
  const currentGrid =
    selectedPattern.alternateGrids && selectedPattern.alternateGrids.length > 0
      ? selectedPattern.alternateGrids[currentVariationIdx % selectedPattern.alternateGrids.length].grid
      : selectedPattern.grid;
  const currentTitle =
    selectedPattern.alternateGrids && selectedPattern.alternateGrids.length > 0
      ? selectedPattern.alternateGrids[currentVariationIdx % selectedPattern.alternateGrids.length].title
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-amber-500/50 rounded-3xl shadow-2xl shadow-amber-500/20 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/30 text-slate-950 font-black text-xl">
              ⭐
            </div>
            <div>
              <h2 className="font-fredoka text-base sm:text-lg font-black text-yellow-300 flex items-center gap-2">
                ¿Cómo Se Gana? - Guía Oficial de Figuras
              </h2>
              <p className="text-xs text-slate-300">
                ¡Todas las formas válidas para gritar <strong className="text-yellow-400">¡BINGO!</strong> y ganar!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 bg-slate-950 border-b border-slate-800 overflow-x-auto scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                activeTab === cat
                  ? "bg-amber-400 text-slate-950 shadow"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex flex-col gap-4">
          {/* Spotlight Hero Card */}
          <div className="bg-gradient-to-br from-amber-950/50 via-slate-950 to-slate-900 border-2 border-amber-500/60 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-5 shadow-xl">
            {/* 5x5 Spotlight Grid */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="grid grid-cols-5 gap-1.5 w-36 h-36 bg-slate-950 p-2.5 rounded-2xl border-2 border-amber-400 shadow-xl shadow-amber-500/20">
                {currentGrid.flatMap((row, r) =>
                  row.map((cell, c) => (
                    <div
                      key={`${r}-${c}`}
                      className={`rounded-md transition-all duration-300 flex items-center justify-center font-black text-[10px] ${
                        cell === 1
                          ? r === 2 && c === 2
                            ? "bg-yellow-300 text-slate-950 ring-2 ring-yellow-100 shadow-md shadow-amber-300/80 scale-105"
                            : "bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/50 scale-105"
                          : r === 2 && c === 2
                          ? "bg-slate-800 text-amber-300 border border-amber-500/40"
                          : "bg-slate-800/60 text-transparent"
                      }`}
                    >
                      {r === 2 && c === 2 ? "★" : ""}
                    </div>
                  ))
                )}
              </div>

              {/* Variation Navigator */}
              {selectedPattern.alternateGrids && selectedPattern.alternateGrids.length > 1 && (
                <div className="flex flex-col items-center gap-1 w-full">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setVariationIndex((prev) => ({
                          ...prev,
                          [selectedPattern.id]:
                            ((prev[selectedPattern.id] || 0) -
                              1 +
                              selectedPattern.alternateGrids!.length) %
                            selectedPattern.alternateGrids!.length,
                        }))
                      }
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                      title="Posición previa"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <span className="text-xs font-mono text-amber-300 font-bold px-1">
                      {currentVariationIdx + 1} de {selectedPattern.alternateGrids.length}
                    </span>
                    <button
                      onClick={() =>
                        setVariationIndex((prev) => ({
                          ...prev,
                          [selectedPattern.id]:
                            ((prev[selectedPattern.id] || 0) + 1) %
                            selectedPattern.alternateGrids!.length,
                        }))
                      }
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                      title="Siguiente posición"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                  {currentTitle && (
                    <span className="text-[11px] text-yellow-300 font-fredoka text-center max-w-[170px] leading-tight">
                      {currentTitle}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Pattern Description */}
            <div className="flex flex-col gap-2 flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="font-fredoka text-lg sm:text-xl font-black text-yellow-400">
                  {selectedPattern.name}
                </h3>
                {selectedPattern.badge && (
                  <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/50 px-2.5 py-0.5 rounded-full font-bold font-mono">
                    {selectedPattern.badge}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {selectedPattern.details || selectedPattern.description}
              </p>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-start gap-2 text-left">
                <Sparkles size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300">
                  {selectedPattern.id === "cuadrito_cualquier_lugar" && (
                    <>
                      <strong>¡Regla Clave:</strong> No importa si está en la esquina superior derecha, izquierda, abajo o en el centro. ¡Cualquier bloque de 4 casillas juntas (2x2) te da la victoria!
                    </>
                  )}
                  {selectedPattern.id === "cuatro_esquinas" && (
                    <>
                      <strong>¡Regla Clave:</strong> Solo necesitas marcar las 4 esquinas extremas del cartón: B1, B5, O1 y O5.
                    </>
                  )}
                  {selectedPattern.id === "linea_diagonal" && (
                    <>
                      <strong>¡Regla Clave:</strong> Línea diagonal completa de esquina a esquina pasando por el centro (FREE ⭐). ¡Solo necesitas 4 números para cantar Bingo!
                    </>
                  )}
                  {selectedPattern.id === "linea_horizontal" && (
                    <>
                      <strong>¡Regla Clave:</strong> Cualquier fila horizontal completa de izquierda a derecha (Filas 1, 2, 3 con FREE ⭐, 4 o 5).
                    </>
                  )}
                  {selectedPattern.id === "linea_vertical" && (
                    <>
                      <strong>¡Regla Clave:</strong> Cualquier columna vertical completa de arriba a abajo (Columnas B, I, N con FREE ⭐, G u O).
                    </>
                  )}
                  {selectedPattern.id === "doble_linea" && (
                    <>
                      <strong>¡Regla Clave:</strong> Completa dos líneas completas en el cartón: ya sean dos filas horizontales o dos columnas verticales.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* CUADRITO PEQUEÑO: EXPLORADOR DE LAS 16 FORMAS DE GANAR */}
          {selectedPattern.id === "cuadrito_cualquier_lugar" && selectedPattern.alternateGrids && (
            <div className="bg-slate-950/90 border border-amber-500/40 rounded-2xl p-3.5 sm:p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold text-sm flex items-center gap-1.5 font-fredoka">
                    <Sparkles size={16} />
                    Las 16 Formas de Ganar Cuadrito Pequeño (2x2)
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                    Cualquier lugar es válido
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  Toca una forma para verla en el cartón:
                </span>
              </div>

              {/* Grid of 16 Positions with Visual Mini-Grids */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                {selectedPattern.alternateGrids.map((alt, idx) => {
                  const isCurrent = (currentVariationIdx % selectedPattern.alternateGrids!.length) === idx;
                  const touchesFree = idx === 5 || idx === 6 || idx === 9 || idx === 10;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setVariationIndex((prev) => ({ ...prev, [selectedPattern.id]: idx }))}
                      className={`p-2 rounded-2xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                        isCurrent
                          ? "bg-gradient-to-r from-amber-500/30 to-yellow-500/20 border-amber-400 text-yellow-200 ring-2 ring-amber-400 shadow-md shadow-amber-500/20"
                          : "bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                      }`}
                    >
                      {/* 5x5 Micro-Grid Thumbnail */}
                      <div className="grid grid-cols-5 gap-0.5 w-8 h-8 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                        {alt.grid.flatMap((row, r) =>
                          row.map((cell, c) => (
                            <div
                              key={`${r}-${c}`}
                              className={`rounded-[1.5px] ${
                                cell === 1
                                  ? r === 2 && c === 2
                                    ? "bg-yellow-300 ring-1 ring-yellow-200"
                                    : "bg-amber-400 shadow-[0_0_2px_rgba(251,191,36,0.8)]"
                                  : r === 2 && c === 2
                                  ? "bg-slate-800 text-amber-300 flex items-center justify-center text-[5px]"
                                  : "bg-slate-800/60"
                              }`}
                            />
                          ))
                        )}
                      </div>

                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-bold text-[10px] text-amber-400">
                            #{idx + 1}
                          </span>
                          <span className="text-[11px] font-fredoka font-bold truncate">
                            {alt.title.split("(")[0].replace(/^\d+\.\s*/, "")}
                          </span>
                        </div>
                        <span className="text-[9.5px] font-mono truncate mt-0.5 font-semibold text-slate-400">
                          {touchesFree ? (
                            <strong className="text-yellow-300">⭐ FREE (3 núms)</strong>
                          ) : (
                            alt.title.includes("(") ? alt.title.split("(")[1].replace(")", "") : "4 números"
                          )}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Informative Tip Banner */}
              <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-2.5 text-xs text-amber-200/90 leading-snug">
                💡 <strong>Regla Oficial del Chamo:</strong> Puedes cantar ¡BINGO! con un Cuadrito Pequeño (2x2) en <strong>CUALQUIER lugar</strong> del cartón (esquinas, bordes o centro). Las posiciones <strong>#6, #7, #10 y #11</strong> tocan la estrella central (FREE ⭐), por lo que ¡solo necesitas <strong>3 números</strong> para ganar la partida!
              </div>
            </div>
          )}

          {/* Quick Selector of All Figures */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Toca una figura para ver sus detalles y posiciones:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {filteredPatterns.map((pat) => {
                const isSelected = pat.id === selectedPatternId;
                return (
                  <button
                    key={pat.id}
                    onClick={() => setSelectedPatternId(pat.id)}
                    className={`p-3 rounded-2xl border text-left flex flex-col items-center gap-1.5 transition cursor-pointer ${
                      isSelected
                        ? "bg-slate-950 border-amber-400 ring-2 ring-amber-400/50 shadow-md shadow-amber-500/20"
                        : "bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-950"
                    }`}
                  >
                    <div className="grid grid-cols-5 gap-0.5 w-12 h-12 bg-slate-900 p-1 rounded-xl border border-slate-800">
                      {pat.grid.flatMap((row, r) =>
                        row.map((cell, c) => (
                          <div
                            key={`${r}-${c}`}
                            className={`rounded-[1px] ${
                              cell === 1
                                ? r === 2 && c === 2
                                  ? "bg-amber-300 ring-1 ring-amber-200"
                                  : "bg-amber-400"
                                : "bg-slate-800/80"
                            }`}
                          />
                        ))
                      )}
                    </div>
                    <span className="font-fredoka font-bold text-xs text-yellow-300 text-center line-clamp-1">
                      {pat.name}
                    </span>
                    <span className="text-[10px] text-slate-400 text-center line-clamp-1">
                      {pat.badge || pat.category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>El sistema valida tus figuras automáticamente durante la partida.</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-fredoka font-black px-6 py-2.5 rounded-2xl shadow transition active:scale-95 cursor-pointer text-sm"
          >
            ¡Entendido, a Jugar!
          </button>
        </div>
      </div>
    </div>
  );
};
