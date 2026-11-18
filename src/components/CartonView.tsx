import React, { useState } from "react";
import { BingoCard } from "../types";
import { evaluateCardFigureDetailed, getBallLetter } from "../utils/bingo";
import {
  ShoppingCart,
  Wand2,
  Trophy,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

interface Props {
  carton: BingoCard;
  isPurchased: boolean;
  drawnBalls: number[];
  userBalance: number;
  isGameCompleted?: boolean;
  gameWinnerName?: string;
  compact?: boolean;
  slotNumber?: number;
  currentBall?: number | null;
  onToggleCell: (row: number, col: number, cartonId?: number) => void;
  onAutoDaub: (cartonId?: number) => void;
  onCheckBingo: (cartonId?: number) => void;
  onBuyCarton: (cartonId: number) => void;
  onSelectCartonId: (id: number) => void;
  onOpenShopModal?: () => void;
  onOpenWinningFigures?: () => void;
}

export const CartonView: React.FC<Props> = ({
  carton,
  isPurchased,
  drawnBalls,
  userBalance,
  isGameCompleted,
  gameWinnerName,
  compact = false,
  slotNumber,
  currentBall,
  onToggleCell,
  onAutoDaub,
  onCheckBingo,
  onBuyCarton,
  onSelectCartonId,
  onOpenShopModal,
  onOpenWinningFigures,
}) => {
  const [searchInput, setSearchInput] = useState("");

  // Evaluate if this card is currently a winner or has missed opportunity
  const figureStatus = evaluateCardFigureDetailed(carton, drawnBalls);

  // Effective current ball for the sphere display (either prop or last drawn ball)
  const effectiveBall = currentBall !== undefined && currentBall !== null
    ? currentBall
    : (drawnBalls.length > 0 ? drawnBalls[drawnBalls.length - 1] : null);
  const ballLetter = effectiveBall ? getBallLetter(effectiveBall) : "";

  // Check if this carton contains the currently drawn ball
  const hasBallInCarton = Boolean(
    effectiveBall &&
      carton.numeros.some((row) => row.some((cell) => cell.num === effectiveBall))
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(searchInput, 10);
    if (!isNaN(num) && num >= 1 && num <= 200) {
      onSelectCartonId(num);
      setSearchInput("");
    }
  };

  const headers = [
    { label: "B", bg: "bg-red-900/80 border-red-700 text-red-200" },
    { label: "I", bg: "bg-amber-900/80 border-amber-700 text-amber-200" },
    { label: "N", bg: "bg-emerald-900/80 border-emerald-700 text-emerald-200" },
    { label: "G", bg: "bg-blue-900/80 border-blue-700 text-blue-200" },
    { label: "O", bg: "bg-purple-900/80 border-purple-700 text-purple-200" },
  ];

  return (
    <div
      id={`carton-view-${carton.id}`}
      className={`bg-slate-900/95 border rounded-3xl shadow-2xl flex flex-col transition-all duration-200 ${
        figureStatus.isWinner && isPurchased && !isGameCompleted
          ? "border-yellow-400 ring-2 ring-yellow-400/50"
          : isPurchased
          ? "border-purple-500/40"
          : "border-slate-800 hover:border-amber-500/40"
      } ${compact ? "p-3 sm:p-4 gap-2.5" : "p-4 sm:p-5 gap-4"}`}
    >
      {/* Game Completed Banner - Single Win Rule Notice */}
      {isGameCompleted && (
        <div className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-amber-950/90 via-slate-900 to-yellow-950/90 border border-yellow-400/80 text-yellow-200 text-xs flex items-center justify-between gap-2 shadow-lg">
          <div className="flex items-center gap-2">
            <Trophy className="text-yellow-400 shrink-0" size={16} />
            <div>
              <span className="font-fredoka font-black text-white">
                Partida Finalizada {gameWinnerName ? `— ¡Ganó ${gameWinnerName}!` : ""}
              </span>
              <p className="text-[10px] sm:text-[11px] text-amber-200/90 mt-0.5">
                Esta partida ya culminó. Los cartones han sido limpiados y desmarcados para la siguiente partida.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Figure Ready Alert Banner */}
      {!isGameCompleted && isPurchased && figureStatus.isWinner && (
        <div
          className={`p-2.5 sm:p-3 rounded-2xl border flex items-center justify-between gap-2 text-xs animate-pulse ${
            figureStatus.missedBalls === 0
              ? "bg-gradient-to-r from-yellow-950 via-amber-900 to-slate-900 border-yellow-400 text-yellow-200 ring-2 ring-yellow-400/60 shadow-lg shadow-yellow-500/20"
              : "bg-gradient-to-r from-orange-950 to-slate-900 border-orange-500 text-orange-200"
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            {figureStatus.missedBalls === 0 ? (
              <Sparkles className="text-yellow-400 shrink-0 animate-spin" size={16} />
            ) : (
              <AlertTriangle className="text-orange-400 shrink-0" size={16} />
            )}
            <div className="truncate">
              <span className="font-fredoka font-black block truncate">
                {figureStatus.missedBalls === 0
                  ? `¡FIGURA: "${figureStatus.patternName}"!`
                  : `¡Pasaste bola (${figureStatus.missedBalls} atrás)!`}
              </span>
              <p className="text-[10px] opacity-90 truncate">
                ¡Presiona cantar bingo ahora!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onCheckBingo(carton.id)}
            className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-fredoka font-black px-3 py-1.5 rounded-xl shadow text-[11px] sm:text-xs uppercase tracking-wider shrink-0 transition active:scale-95 cursor-pointer"
          >
            ¡Cantar Bingo!
          </button>
        </div>
      )}

      {/* Carton Action Header with Esfera de los Números */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 border-b border-slate-800 pb-2">
        {/* Left column: Carton identity + Auto & Bingo action buttons */}
        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
          {/* Row 1: Identification & match count */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {slotNumber && (
              <span className="bg-slate-800 text-amber-300 border border-slate-700 text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-lg shrink-0">
                #{slotNumber}
              </span>
            )}
            <span className="bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 font-fredoka font-black text-xs sm:text-sm px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl shadow shrink-0">
              Cartón #{carton.id}
            </span>
            {isPurchased ? (
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 sm:px-2 py-0.5 rounded-xl text-[10px] sm:text-[11px] font-bold flex items-center gap-1 shrink-0">
                <CheckCircle2 size={11} /> {isGameCompleted ? "0/25 (Limpio)" : `${figureStatus.matchedCells}/25`}
              </span>
            ) : (
              <span className="bg-slate-950 text-amber-300 border border-slate-800 px-2 py-0.5 rounded-xl text-[10px] sm:text-[11px] font-mono shrink-0">
                60.00 VES
              </span>
            )}
          </div>

          {/* Row 2: Auto & Bingo / Comprar Buttons & Cuadrito Guide Button */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {isPurchased ? (
              <>
                <button
                  type="button"
                  onClick={() => onAutoDaub(carton.id)}
                  className="bg-slate-800 hover:bg-slate-700 text-yellow-300 font-fredoka text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-1 rounded-xl border border-amber-500/30 shadow flex items-center gap-1 transition active:scale-95 cursor-pointer"
                  title="Marcar automáticamente números que ya salieron"
                >
                  <Wand2 size={11} /> Auto
                </button>

                <button
                  type="button"
                  onClick={() => onCheckBingo(carton.id)}
                  disabled={isGameCompleted}
                  className={`font-fredoka text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-xl shadow-lg flex items-center gap-1 transition active:scale-95 ${
                    isGameCompleted
                      ? "bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700"
                      : figureStatus.isWinner
                      ? "bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 text-slate-950 ring-2 ring-yellow-300 font-black animate-bounce shadow-yellow-500/40 cursor-pointer"
                      : "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-emerald-600/20 cursor-pointer"
                  }`}
                >
                  <Trophy size={11} /> {isGameCompleted ? "Fin" : "¡Bingo!"}
                </button>

                {onOpenWinningFigures && (
                  <button
                    type="button"
                    onClick={onOpenWinningFigures}
                    className="bg-amber-500/15 hover:bg-amber-500/25 text-yellow-300 font-fredoka text-[10px] sm:text-[11px] font-bold px-2 py-1 rounded-xl border border-amber-500/40 shadow flex items-center gap-1 transition cursor-pointer"
                    title="Ver las 16 formas válidas de ganar con Cuadrito Pequeño (2x2) en cualquier lugar del cartón"
                  >
                    <span>⭐ Cuadrito (16)</span>
                  </button>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={() => onBuyCarton(carton.id)}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-fredoka text-[10px] sm:text-xs font-black px-2.5 sm:px-3 py-1 rounded-xl shadow flex items-center gap-1 transition active:scale-95 cursor-pointer"
              >
                <ShoppingCart size={11} /> Comprar (60 VES)
              </button>
            )}
          </div>
        </div>

        {/* Right column: LA ESFERA DE LOS NÚMEROS (Zona marcada en círculo verde arriba de los cartones) */}
        <div className="flex flex-col items-center justify-center shrink-0 pl-1">
          {effectiveBall ? (
            <div
              key={effectiveBall}
              className={`relative ${
                compact ? "w-11 h-11 sm:w-13 sm:h-13" : "w-13 h-13 sm:w-15 sm:h-15"
              } rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 border-2 ${
                hasBallInCarton ? "border-emerald-300 ring-2 ring-emerald-400/90 shadow-[0_0_15px_rgba(16,185,129,0.7)]" : "border-white shadow-[0_0_12px_rgba(245,158,11,0.6)]"
              } flex flex-col items-center justify-center text-slate-950 select-none animate-in zoom-in-75 duration-200`}
              title={`Esfera Bola Cantada: ${ballLetter}-${effectiveBall}`}
            >
              {/* Specular shine highlight */}
              <div className="absolute top-1 left-1.5 w-2.5 h-1.5 bg-white/80 rounded-full -rotate-45 pointer-events-none" />

              {/* Letter */}
              <span className="text-[8px] sm:text-[9px] font-fredoka font-black leading-none text-red-700 tracking-wider">
                {ballLetter}
              </span>

              {/* Number */}
              <span className="font-fredoka font-black text-xs sm:text-sm md:text-base text-slate-950 leading-tight drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]">
                {effectiveBall}
              </span>

              {/* Mini tag if player has this ball */}
              {hasBallInCarton && (
                <span className="absolute -bottom-1 bg-emerald-600 text-white font-fredoka text-[6.5px] font-black px-1 rounded-full border border-emerald-300 shadow leading-none uppercase tracking-tighter">
                  ¡Tuyo!
                </span>
              )}
            </div>
          ) : (
            <div
              className={`relative ${
                compact ? "w-11 h-11 sm:w-13 sm:h-13" : "w-13 h-13 sm:w-15 sm:h-15"
              } rounded-full border-2 border-amber-400/60 bg-slate-950 shadow-[inset_0_0_10px_rgba(245,158,11,0.4)] flex flex-col items-center justify-center select-none overflow-hidden`}
              title="Esfera tómbola esperando bola..."
            >
              {/* Spinning Mesh Cage */}
              <div className="absolute inset-0 rounded-full pointer-events-none flex items-center justify-center animate-spin" style={{ animationDuration: "4s" }}>
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-70">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="#f59e0b" strokeWidth="2" />
                  <ellipse cx="50" cy="50" rx="16" ry="46" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3 2" />
                  <ellipse cx="50" cy="50" rx="34" ry="46" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3 2" />
                  <ellipse cx="50" cy="30" rx="38" ry="12" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 2" />
                  <ellipse cx="50" cy="70" rx="38" ry="12" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 2" />
                </svg>
              </div>

              {/* Centered blinking dot */}
              <div className="w-2 h-2 rounded-full bg-amber-400 shadow animate-ping" />
              <span className="text-[6.5px] font-fredoka text-amber-300/90 font-bold leading-none mt-0.5 z-10">
                Esfera
              </span>
            </div>
          )}
          <span className="text-[7.5px] font-fredoka font-bold text-amber-300/80 tracking-tight leading-none mt-1">
            {effectiveBall ? "Bola Actual" : "En Giro"}
          </span>
        </div>
      </div>

      {/* 5x5 Matrix */}
      <div className="bg-slate-950 p-2 sm:p-3 rounded-2xl border border-slate-800 flex flex-col gap-1.5">
        {/* B I N G O Header Row (estilo clásico idéntico a la imagen de referencia) */}
        <div className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 p-1 rounded-xl border-2 border-slate-900 shadow-md">
          <div className="grid grid-cols-5 text-center font-fredoka font-black text-sm sm:text-base md:text-lg text-slate-950 tracking-wider">
            <span className="drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]">B</span>
            <span className="drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]">I</span>
            <span className="drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]">N</span>
            <span className="drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]">G</span>
            <span className="drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]">O</span>
          </div>
        </div>

        {/* 5x5 Cells */}
        <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
          {carton.numeros.map((row, r) =>
            row.map((cell, c) => {
              const isFree = cell.num === "FREE";
              const isDrawn = !isGameCompleted && typeof cell.num === "number" && drawnBalls.includes(cell.num);
              const isMarked = !isGameCompleted && cell.marcado;
              const isWinningCell = Boolean(
                !isGameCompleted &&
                isPurchased &&
                figureStatus.isWinner &&
                figureStatus.winningCells?.some(([wr, wc]) => wr === r && wc === c)
              );

              return (
                <button
                  key={`${carton.id}-${r}-${c}`}
                  type="button"
                  onClick={() => {
                    if (isGameCompleted) return;
                    onToggleCell(r, c, carton.id);
                  }}
                  className={`aspect-square rounded-xl sm:rounded-2xl flex flex-col items-center justify-center font-fredoka font-bold transition-all duration-150 select-none shadow border cursor-pointer relative ${
                    compact
                      ? "text-xs sm:text-sm md:text-base"
                      : "text-sm sm:text-base md:text-lg"
                  } ${
                    isWinningCell
                      ? "bg-gradient-to-tr from-yellow-300 via-amber-400 to-yellow-500 text-slate-950 border-2 border-white ring-4 ring-yellow-400 shadow-[0_0_20px_rgba(250,204,21,1)] animate-pulse scale-[1.03] z-10 font-black"
                      : isFree
                      ? "bg-gradient-to-tr from-amber-300 to-yellow-400 text-slate-950 border-2 border-slate-900 shadow-md"
                      : isMarked
                      ? "bg-gradient-to-tr from-yellow-400 to-amber-500 text-slate-950 border-2 border-slate-900 ring-2 ring-yellow-400 shadow-lg scale-[0.96]"
                      : isDrawn
                      ? "bg-slate-800 text-yellow-300 border-2 border-amber-400 hover:bg-slate-700 animate-pulse"
                      : "bg-slate-900 text-slate-100 border-slate-700 hover:border-amber-400 hover:bg-slate-800/80"
                  }`}
                  title={
                    isWinningCell
                      ? `¡Casilla Ganadora de "${figureStatus.patternName}"!`
                      : isFree
                      ? "Casilla Central Libre"
                      : isDrawn
                      ? `Número ${cell.num} ya cantado en tómbola. Haz clic para marcar.`
                      : `Número ${cell.num}`
                  }
                >
                  {isWinningCell && (
                    <span className="absolute -top-1 -right-1 bg-yellow-400 text-slate-950 text-[7px] font-black rounded-full px-1 border border-slate-950 shadow z-20">
                      👑
                    </span>
                  )}
                  {isFree ? (
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-[10px] sm:text-xs font-fredoka font-black tracking-wider text-slate-950 leading-tight">
                        FREE
                      </span>
                      <span className="text-[6px] sm:text-[7px] font-bold text-slate-900 leading-none">
                        ★
                      </span>
                    </div>
                  ) : (
                    <>
                      <span className="font-black">{cell.num}</span>
                      {isMarked && !isWinningCell && (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-950 mt-0.5" />
                      )}
                    </>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Footer controls only for single mode */}
      {!compact && (
        <div className="flex flex-col gap-2 pt-1 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">
              Explorar Cartones Disponibles (1 al 200):
            </span>
            <div className="flex items-center gap-2">
              {onOpenShopModal && (
                <button
                  type="button"
                  onClick={onOpenShopModal}
                  className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-xl text-xs font-fredoka font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <ShoppingCart size={12} /> Ver Todos los Cartones
                </button>
              )}
              <form onSubmit={handleSearch} className="flex items-center gap-1 max-w-[120px]">
                <input
                  type="number"
                  min={1}
                  max={200}
                  placeholder="# 1-200"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-xs text-amber-300 w-full outline-none focus:border-amber-500 font-mono"
                />
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-2 py-1 rounded-xl text-xs font-bold font-fredoka"
                >
                  Ir
                </button>
              </form>
            </div>
          </div>

          {/* Quick pagination chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-thin">
            {Array.from({ length: 20 }, (_, i) => i + 1).map((id) => (
              <button
                key={id}
                onClick={() => onSelectCartonId(id)}
                className={`w-7 h-7 rounded-xl text-xs font-fredoka font-bold shrink-0 transition ${
                  carton.id === id
                    ? "bg-amber-500 text-slate-950 shadow-md scale-105"
                    : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-amber-300 hover:border-amber-500/50"
                }`}
              >
                {id}
              </button>
            ))}
            <span className="text-xs text-slate-500 px-1">...</span>
            {[50, 100, 150, 200].map((id) => (
              <button
                key={id}
                onClick={() => onSelectCartonId(id)}
                className={`px-2 h-7 rounded-xl text-xs font-fredoka font-bold shrink-0 transition ${
                  carton.id === id
                    ? "bg-amber-500 text-slate-950 shadow-md scale-105"
                    : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-amber-300 hover:border-amber-500/50"
                }`}
              >
                #{id}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
