import React, { useState } from "react";
import { TopPlayer } from "../types";
import { WEEKLY_TOP_PLAYERS } from "../data/tops";
import {
  Trophy,
  Crown,
  Medal,
  Sparkles,
  MapPin,
  TrendingUp,
  X,
  Flame,
  Calendar,
  DollarSign,
  Award,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail?: string;
}

export const TopRankingsModal: React.FC<Props> = ({ isOpen, onClose, currentUserEmail }) => {
  const [filter, setFilter] = useState<"ALL" | "GLOBAL" | "REGIONAL" | "FUTURO">("ALL");

  if (!isOpen) return null;

  const filteredTops = WEEKLY_TOP_PLAYERS.filter((player) => {
    if (filter === "ALL") return true;
    return player.category === filter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/50 rounded-3xl max-w-2xl w-full p-5 sm:p-7 flex flex-col gap-4 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-yellow-300 border border-amber-500/40 shadow">
              <Trophy size={22} className="animate-bounce" />
            </div>
            <div>
              <h3 className="font-fredoka text-lg sm:text-xl font-bold text-yellow-300 flex items-center gap-2">
                Tabla de Tops Semanal
                <span className="text-[10px] font-mono bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-black">
                  EN VIVO
                </span>
              </h3>
              <p className="text-xs text-slate-300 flex items-center gap-1.5">
                <Calendar size={12} className="text-amber-400" /> Basado en las ganancias acumuladas durante la semana
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Category Tiers Explanation Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-gradient-to-r from-amber-500/15 to-yellow-500/25 border border-amber-500/50 rounded-2xl p-2.5 flex flex-col items-center">
            <span className="font-fredoka font-bold text-yellow-300 flex items-center gap-1">
              <Crown size={14} className="text-amber-400" /> Tops Globales (1 - 3)
            </span>
            <span className="text-[10px] text-slate-300">Máximos ganadores nacionales</span>
          </div>

          <div className="bg-gradient-to-r from-blue-500/15 to-cyan-500/25 border border-blue-500/50 rounded-2xl p-2.5 flex flex-col items-center">
            <span className="font-fredoka font-bold text-blue-300 flex items-center gap-1">
              <MapPin size={14} className="text-cyan-400" /> Tops Regionales (4 - 6)
            </span>
            <span className="text-[10px] text-slate-300">Líderes por estados y regiones</span>
          </div>

          <div className="bg-gradient-to-r from-emerald-500/15 to-teal-500/25 border border-emerald-500/50 rounded-2xl p-2.5 flex flex-col items-center">
            <span className="font-fredoka font-bold text-emerald-300 flex items-center gap-1">
              <TrendingUp size={14} className="text-emerald-400" /> Futuros / En Ascenso (7+)
            </span>
            <span className="text-[10px] text-slate-300">Nivel promisorio en racha</span>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 gap-1 overflow-x-auto">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-fredoka font-bold transition cursor-pointer whitespace-nowrap ${
              filter === "ALL"
                ? "bg-amber-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Todos los Tops ({WEEKLY_TOP_PLAYERS.length})
          </button>
          <button
            onClick={() => setFilter("GLOBAL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-fredoka font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              filter === "GLOBAL"
                ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-yellow-300"
            }`}
          >
            👑 Tops Globales (1-3)
          </button>
          <button
            onClick={() => setFilter("REGIONAL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-fredoka font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              filter === "REGIONAL"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-400 hover:text-blue-300"
            }`}
          >
            📍 Tops Regionales (4-6)
          </button>
          <button
            onClick={() => setFilter("FUTURO")}
            className={`px-3 py-1.5 rounded-xl text-xs font-fredoka font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              filter === "FUTURO"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-400 hover:text-emerald-300"
            }`}
          >
            🚀 Futuros (7+)
          </button>
        </div>

        {/* Rankings List */}
        <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
          {filteredTops.map((player) => {
            const isGlobal = player.category === "GLOBAL";
            const isRegional = player.category === "REGIONAL";
            const isMe = currentUserEmail && player.email.toLowerCase() === currentUserEmail.toLowerCase();

            return (
              <div
                key={player.rank}
                className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition shadow ${
                  isGlobal
                    ? "bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-950 border-amber-500/50 hover:border-amber-400"
                    : isRegional
                    ? "bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-950 border-blue-500/40 hover:border-blue-400"
                    : "bg-slate-950 border-slate-800 hover:border-emerald-500/30"
                } ${isMe ? "ring-2 ring-yellow-400" : ""}`}
              >
                {/* Left: Position Rank Badge & Avatar */}
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-fredoka font-black text-sm shrink-0 shadow border ${
                      player.rank === 1
                        ? "bg-gradient-to-tr from-yellow-400 to-amber-500 text-slate-950 border-yellow-300 scale-105"
                        : player.rank === 2
                        ? "bg-gradient-to-tr from-slate-200 to-slate-400 text-slate-950 border-slate-200"
                        : player.rank === 3
                        ? "bg-gradient-to-tr from-amber-700 to-yellow-800 text-white border-amber-600"
                        : player.rank <= 6
                        ? "bg-blue-950 text-blue-300 border-blue-700"
                        : "bg-slate-900 text-slate-400 border-slate-800"
                    }`}
                  >
                    {player.rank === 1 ? (
                      "🥇 1"
                    ) : player.rank === 2 ? (
                      "🥈 2"
                    ) : player.rank === 3 ? (
                      "🥉 3"
                    ) : (
                      `#${player.rank}`
                    )}
                  </div>

                  <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xl shrink-0">
                    {player.avatar}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-fredoka font-bold text-sm text-yellow-300">
                        {player.name}
                      </span>
                      {isGlobal && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <Crown size={10} /> Top Global
                        </span>
                      )}
                      {isRegional && (
                        <span className="text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <MapPin size={10} /> Top Regional
                        </span>
                      )}
                      {player.category === "FUTURO" && (
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <TrendingUp size={10} /> Futuro
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin size={11} className="text-slate-500" /> {player.region}
                    </span>
                  </div>
                </div>

                {/* Right: Weekly Earnings & Victories */}
                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-800/80 pt-2 sm:pt-0">
                  <div className="flex flex-col text-left sm:text-right">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Ganancias Semana</span>
                    <span className="font-fredoka text-sm sm:text-base font-black text-emerald-400 font-mono flex items-center sm:justify-end gap-1">
                      <DollarSign size={14} className="text-emerald-500" />
                      {player.weeklyEarnings.toLocaleString("es-VE", { minimumFractionDigits: 2 })} VES
                    </span>
                  </div>

                  <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 flex flex-col items-center shrink-0">
                    <span className="text-[8px] uppercase font-bold text-slate-400">Bingos</span>
                    <span className="font-fredoka text-xs font-bold text-yellow-300">
                      {player.weeklyWins} 🏆
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info note */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-yellow-400" />
            <span>Los Tops se actualizan automáticamente en tiempo real con cada partida ganada.</span>
          </div>
          <span className="font-mono text-amber-300 font-bold shrink-0">
            Reinicio: Domingo 23:59
          </span>
        </div>
      </div>
    </div>
  );
};
