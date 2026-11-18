import React, { useState, useMemo } from "react";
import { AdminGameEarning } from "../types";
import {
  Coins,
  Building,
  Trophy,
  Calendar,
  Search,
  Sparkles,
  CheckCircle2,
  X,
  TrendingUp,
  Percent,
  RotateCcw,
  Store,
  DollarSign,
  User,
  Users,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { ChristmasLights } from "./ChristmasLights";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  earnings: AdminGameEarning[];
  currentPlataEnJuego: number; // Current game pot (80%)
  onClearHistory?: () => void;
}

export const AdminDineroPorPartidaModal: React.FC<Props> = ({
  isOpen,
  onClose,
  earnings = [],
  currentPlataEnJuego,
  onClearHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "JUEGO_NORMAL" | "TORNEO_BILLETAL">("ALL");

  if (!isOpen) return null;

  // Total accumulated 20% by the administrator
  const totalAdminEarnings20 = useMemo(() => {
    return earnings.reduce((sum, item) => sum + (Number(item.adminEarnings20) || 0), 0);
  }, [earnings]);

  // Total 80% accredited to winning players
  const totalWinnersPrizes80 = useMemo(() => {
    return earnings.reduce((sum, item) => sum + (Number(item.winnerPrize) || 0), 0);
  }, [earnings]);

  // Total gross volume processed
  const totalGrossVolume = useMemo(() => {
    return earnings.reduce((sum, item) => sum + (Number(item.grossPot) || 0), 0);
  }, [earnings]);

  // Filtered earnings list
  const filteredEarnings = useMemo(() => {
    return earnings.filter((item) => {
      if (filterType !== "ALL" && item.gameType !== filterType) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          item.winnerName.toLowerCase().includes(q) ||
          item.winnerEmail.toLowerCase().includes(q) ||
          item.gameId.toLowerCase().includes(q) ||
          item.date.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [earnings, filterType, searchTerm]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/80 border-2 border-amber-500/70 rounded-3xl shadow-2xl text-slate-100 flex flex-col overflow-hidden">
        {/* Festive lights */}
        <ChristmasLights count={24} compact={true} className="-mt-1 mb-1" />

        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-amber-500/30 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-500 to-amber-600 p-0.5 shadow-lg border border-yellow-200 flex items-center justify-center text-slate-950 shrink-0">
              <Building size={24} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-fredoka text-lg sm:text-xl font-black text-yellow-300 uppercase tracking-wide">
                  Dinero por Partida
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold font-mono">
                  Comisión 20% Administrador
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Registro oficial de ingresos por ronda: El admin retiene el 20% y el ganador recibe el 80% acreditado automáticamente.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition cursor-pointer"
            title="Cerrar ventana"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4">
          {/* Rule Banner Explanation */}
          <div className="bg-gradient-to-r from-emerald-950/60 via-slate-950 to-amber-950/60 border border-emerald-500/40 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center gap-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shrink-0">
              <DollarSign size={20} className="animate-pulse" />
            </div>
            <div className="flex-1 text-xs text-slate-200 leading-relaxed text-center sm:text-left">
              <strong className="text-emerald-300 font-fredoka font-bold text-sm block mb-0.5">
                Panel del Administrador: Dinero por Partida (Comisión 20%)
              </strong>
              <span>
                A los usuarios <strong className="text-yellow-300">solo se les muestra el 80%</strong> en plata en juego. El otro <strong className="text-emerald-400 font-bold">20%</strong> se te suma a ti aquí en este menú: tienes 20% de una partida, tienes 20% de 2 partidas, y así sucesivamente por cada partida jugada. Al terminar la partida, el 80% se acredita automáticamente al jugador y todos los cartones vuelven a la tienda.
              </span>
            </div>
          </div>

          {/* Top Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Admin 20% Total - Tienes 20% de una partida así sucesivamente */}
            <div className="bg-slate-950/90 border-2 border-emerald-500/60 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                <span className="flex items-center gap-1.5">
                  <Building size={15} />
                  {earnings.length === 0
                    ? "Tienes 20% de cada partida"
                    : earnings.length === 1
                    ? "Tienes 20% de 1 partida"
                    : `Tienes 20% de ${earnings.length} partidas`}
                </span>
                <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                  20% Admin
                </span>
              </div>
              <div className="font-fredoka font-black text-2xl sm:text-3xl text-emerald-400 tracking-tight font-mono">
                +{totalAdminEarnings20.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-sans font-bold">VES</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 border-t border-slate-800 pt-1.5">
                {earnings.length === 0
                  ? "Se sumará automáticamente al ganar la partida"
                  : earnings.length === 1
                  ? "Tienes el 20% acumulado de 1 partida finalizada"
                  : `Tienes el 20% acumulado de ${earnings.length} partidas finalizadas sucesivamente`}
              </span>
            </div>

            {/* 2. Winners 80% Total */}
            <div className="bg-slate-950/90 border-2 border-yellow-500/60 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
              <div className="flex items-center justify-between text-xs font-bold text-yellow-300 uppercase tracking-wider mb-1">
                <span className="flex items-center gap-1.5">
                  <Trophy size={15} className="text-yellow-400" />
                  Premios Entregados (80%)
                </span>
                <span className="bg-amber-500 text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-black">
                  80% Jugadores
                </span>
              </div>
              <div className="font-fredoka font-black text-2xl sm:text-3xl text-yellow-400 tracking-tight font-mono">
                {totalWinnersPrizes80.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-sans font-bold">VES</span>
              </div>
              <span className="text-[11px] text-yellow-200/70 mt-1 border-t border-slate-800 pt-1.5">
                Acreditado automáticamente a cuentas de jugadores
              </span>
            </div>

            {/* 3. Total Gross Volume */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                <span className="flex items-center gap-1.5">
                  <Coins size={15} className="text-amber-400" />
                  Pozo Bruto Total (100%)
                </span>
                <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-mono">
                  100% Recaudado
                </span>
              </div>
              <div className="font-fredoka font-black text-2xl sm:text-3xl text-white tracking-tight font-mono">
                {totalGrossVolume.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-sans font-bold">VES</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 border-t border-slate-800 pt-1.5 flex items-center gap-1">
                <Store size={12} className="text-cyan-400" /> Cartones regresan a tienda al terminar
              </span>
            </div>
          </div>

          {/* Filters & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setFilterType("ALL")}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-fredoka font-bold transition cursor-pointer ${
                  filterType === "ALL" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                Todas ({earnings.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("JUEGO_NORMAL")}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-fredoka font-bold transition cursor-pointer ${
                  filterType === "JUEGO_NORMAL" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                Juego Normal
              </button>
              <button
                type="button"
                onClick={() => setFilterType("TORNEO_BILLETAL")}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-fredoka font-bold transition cursor-pointer ${
                  filterType === "TORNEO_BILLETAL" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                Torneo Billetal
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por ganador, correo o fecha..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Earnings Records List */}
          <div className="flex flex-col gap-2.5 max-h-[350px] overflow-y-auto pr-1">
            {filteredEarnings.length === 0 ? (
              <div className="bg-slate-950/70 rounded-2xl p-8 text-center border border-slate-800 flex flex-col items-center justify-center gap-2">
                <Building size={32} className="text-slate-600" />
                <p className="text-sm text-slate-300 font-fredoka font-bold">
                  Aún no hay partidas liquidadas en el historial.
                </p>
                <p className="text-xs text-slate-500 max-w-md">
                  Al completar una partida (cuando un jugador canta Bingo o el Administrador liquida la ronda), el 80% se acreditará automáticamente a la cuenta del ganador y el 20% se sumará aquí.
                </p>
              </div>
            ) : (
              filteredEarnings.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950/80 border border-amber-500/30 hover:border-amber-400/60 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md transition"
                >
                  {/* Left: Winner info & Game Type */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-yellow-400 to-amber-600 p-0.5 shadow flex items-center justify-center shrink-0 text-lg">
                      <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                        {item.winnerAvatar || "👤"}
                      </div>
                    </div>

                    <div className="flex flex-col text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-fredoka text-sm font-bold text-white">
                          {item.winnerName}
                        </span>
                        <span className={`text-[10px] font-fredoka font-bold px-2 py-0.2 rounded-full border ${
                          item.gameType === "TORNEO_BILLETAL"
                            ? "bg-purple-950 text-purple-300 border-purple-500/50"
                            : "bg-blue-950 text-blue-300 border-blue-500/50"
                        }`}>
                          {item.gameType === "TORNEO_BILLETAL" ? "🏆 Torneo Billetal" : "🎯 Juego Normal"}
                        </span>
                        {item.isDuoWin && (
                          <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-500/50 px-2 py-0.2 rounded-full font-bold flex items-center gap-1">
                            <Users size={11} /> Victoria en Dúo
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        {item.winnerEmail} • Cartón #{item.cartonId || 1} ({item.patternName || "Bingo"})
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock size={11} /> {item.date}
                      </span>
                    </div>
                  </div>

                  {/* Right: Breakdown of 80% (Winner) & 20% (Admin) */}
                  <div className="flex items-center gap-3 sm:gap-4 self-end sm:self-center bg-slate-900/90 border border-slate-800 p-2 sm:px-3 rounded-xl">
                    {/* Gross Pot */}
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] text-slate-500 font-mono">Pozo Total (100%)</span>
                      <span className="text-xs font-mono font-bold text-slate-300">
                        {Number(item.grossPot).toFixed(2)} VES
                      </span>
                    </div>

                    {/* Winner 80% */}
                    <div className="flex flex-col text-right border-l border-slate-800 pl-3">
                      <span className="text-[10px] text-yellow-300/80 font-mono">Ganador (80%)</span>
                      <span className="text-xs font-mono font-black text-yellow-400">
                        +{Number(item.winnerPrize).toFixed(2)} VES
                      </span>
                    </div>

                    {/* Admin 20% */}
                    <div className="flex flex-col text-right border-l border-emerald-500/30 pl-3 bg-emerald-950/40 p-1.5 rounded-lg">
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">
                        Tienes 20% de esta partida:
                      </span>
                      <span className="text-xs sm:text-sm font-mono font-black text-emerald-300">
                        +{Number(item.adminEarnings20).toFixed(2)} VES
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-amber-500/30 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Liquidación 80%/20% ejecutada automáticamente</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-fredoka font-black px-5 py-2 rounded-xl text-xs transition cursor-pointer active:scale-95 shadow"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
