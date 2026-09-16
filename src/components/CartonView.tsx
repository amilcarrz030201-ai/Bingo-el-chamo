import React, { useState } from "react";
import { BingoCard } from "../types";
import { ShoppingCart, Wand2, Trophy, ArrowRight, Search, CheckCircle2 } from "lucide-react";

interface Props {
  carton: BingoCard;
  isPurchased: boolean;
  drawnBalls: number[];
  userBalance: number;
  onToggleCell: (row: number, col: number) => void;
  onAutoDaub: () => void;
  onCheckBingo: () => void;
  onBuyCarton: (cartonId: number) => void;
  onSelectCartonId: (id: number) => void;
}

export const CartonView: React.FC<Props> = ({
  carton,
  isPurchased,
  drawnBalls,
  userBalance,
  onToggleCell,
  onAutoDaub,
  onCheckBingo,
  onBuyCarton,
  onSelectCartonId,
}) => {
  const [searchInput, setSearchInput] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(searchInput, 10);
    if (!isNaN(num) && num >= 1 && num <= 200) {
      onSelectCartonId(num);
      setSearchInput("");
    }
  };

  const headers = [
    { label: "B", bg: "bg-red-900/70 border-red-700 text-red-200" },
    { label: "I", bg: "bg-amber-900/70 border-amber-700 text-amber-200" },
    { label: "N", bg: "bg-emerald-900/70 border-emerald-700 text-emerald-200" },
    { label: "G", bg: "bg-blue-900/70 border-blue-700 text-blue-200" },
    { label: "O", bg: "bg-purple-900/70 border-purple-700 text-purple-200" },
  ];

  return (
    <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col gap-4">
      {/* Carton Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 font-fredoka font-black text-xs sm:text-sm px-3 py-1.5 rounded-xl shadow">
            Cartón #{carton.id}
          </span>
          {isPurchased ? (
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1">
              <CheckCircle2 size={13} /> Adquirido
            </span>
          ) : (
            <span className="bg-slate-950 text-amber-300 border border-slate-800 px-2.5 py-1 rounded-xl text-[11px] font-mono">
              Precio: 60 VES
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onAutoDaub}
            className="bg-slate-800 hover:bg-slate-700 text-yellow-300 font-fredoka text-xs font-bold px-3 py-1.5 rounded-xl border border-amber-500/30 shadow flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            title="Marcar automáticamente números que ya salieron en la tómbola"
          >
            <Wand2 size={13} /> Auto-Marcar
          </button>

          <button
            onClick={onCheckBingo}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-fredoka text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <Trophy size={13} /> ¡Cantar Bingo!
          </button>

          {!isPurchased && (
            <button
              onClick={() => onBuyCarton(carton.id)}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-fredoka text-xs font-bold px-3.5 py-1.5 rounded-xl shadow flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <ShoppingCart size={13} /> Comprar (60 VES)
            </button>
          )}
        </div>
      </div>

      {/* 5x5 Matrix */}
      <div className="bg-slate-950 p-3 sm:p-4 rounded-2xl border border-slate-800 flex flex-col gap-2">
        {/* B I N G O Header Row */}
        <div className="grid grid-cols-5 gap-2 text-center font-fredoka font-black text-base sm:text-lg">
          {headers.map((h) => (
            <div
              key={h.label}
              className={`py-1.5 rounded-xl border shadow-inner ${h.bg}`}
            >
              {h.label}
            </div>
          ))}
        </div>

        {/* 5x5 Cells */}
        <div className="grid grid-cols-5 gap-2">
          {carton.numeros.map((row, r) =>
            row.map((cell, c) => {
              const isFree = cell.num === "FREE";
              const isDrawn = typeof cell.num === "number" && drawnBalls.includes(cell.num);
              const isMarked = cell.marcado;

              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => onToggleCell(r, c)}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center font-fredoka font-bold text-sm sm:text-base md:text-lg transition-all duration-200 select-none shadow-md border cursor-pointer ${
                    isFree
                      ? "bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 border-amber-300 shadow-amber-500/20"
                      : isMarked
                      ? "bg-gradient-to-tr from-yellow-400 to-amber-600 text-slate-950 border-yellow-300 ring-2 ring-yellow-300 shadow-lg shadow-amber-500/30 scale-[0.97]"
                      : isDrawn
                      ? "bg-slate-800/90 text-yellow-300 border-amber-400/80 hover:bg-slate-700/90 animate-pulse"
                      : "bg-slate-900 text-slate-200 border-slate-800 hover:border-amber-500/40 hover:bg-slate-800/60"
                  }`}
                  title={
                    isFree
                      ? "Casilla Central Libre"
                      : isDrawn
                      ? `Número ${cell.num} ya cantado en tómbola. Haz clic para marcar.`
                      : `Número ${cell.num}`
                  }
                >
                  {isFree ? (
                    <>
                      <span className="text-sm">⭐</span>
                      <span className="text-[9px] font-black tracking-wider">LIBRE</span>
                    </>
                  ) : (
                    <>
                      <span>{cell.num}</span>
                      {isMarked && (
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

      {/* Cartons selector 1 to 200 */}
      <div className="flex flex-col gap-2 pt-1 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300">
            Explorar Cartones Disponibles (1 al 200):
          </span>
          <form onSubmit={handleSearch} className="flex items-center gap-1.5 max-w-[140px]">
            <input
              type="number"
              min={1}
              max={200}
              placeholder="# (1-200)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-amber-300 w-full outline-none focus:border-amber-500 font-mono"
            />
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-2 py-1 rounded-xl text-xs font-bold font-fredoka"
            >
              Ir
            </button>
          </form>
        </div>

        {/* Quick pagination chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 scrollbar-thin">
          {Array.from({ length: 25 }, (_, i) => i + 1).map((id) => (
            <button
              key={id}
              onClick={() => onSelectCartonId(id)}
              className={`w-8 h-8 rounded-xl text-xs font-fredoka font-bold shrink-0 transition ${
                carton.id === id
                  ? "bg-amber-500 text-slate-950 shadow-md scale-105"
                  : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-amber-300 hover:border-amber-500/50"
              }`}
            >
              {id}
            </button>
          ))}
          <span className="text-xs text-slate-500 px-2">...</span>
          {[50, 100, 150, 200].map((id) => (
            <button
              key={id}
              onClick={() => onSelectCartonId(id)}
              className={`px-2.5 h-8 rounded-xl text-xs font-fredoka font-bold shrink-0 transition ${
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
    </div>
  );
};
