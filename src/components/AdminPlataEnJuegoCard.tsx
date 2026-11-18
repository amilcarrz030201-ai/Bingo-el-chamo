import React, { useState } from "react";
import {
  Coins,
  Trophy,
  Percent,
  CheckCircle2,
  PlusCircle,
  RotateCcw,
  Sparkles,
  Calculator,
  Building,
  HelpCircle,
} from "lucide-react";

interface Props {
  plataEnJuego: number;
  totalCartonesEnJuego: number;
  cartonPrice?: number;
  onUpdatePlataEnJuego: (amount: number) => void;
  winnerName?: string;
  hasWinnerPending?: boolean;
  onOpenDineroPorPartida?: () => void;
}

export const AdminPlataEnJuegoCard: React.FC<Props> = ({
  plataEnJuego,
  totalCartonesEnJuego,
  cartonPrice = 60,
  onUpdatePlataEnJuego,
  winnerName,
  hasWinnerPending = false,
  onOpenDineroPorPartida,
}) => {
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Gross Pot is calculated from plataEnJuego (which is strictly the 80% shown to users)
  // Example: if grossPot is 1000 VES -> plataEnJuego shown to users is 800 VES (80%), admin fee is 200 VES (20%)
  const grossPot = Number((plataEnJuego / 0.8).toFixed(2));
  const winnerPrize80 = plataEnJuego;
  const houseFee20 = Number((grossPot * 0.2).toFixed(2));
  const cartonValueCalculated = Number((totalCartonesEnJuego * cartonPrice).toFixed(2));

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(customAmount);
    if (isNaN(parsed) || parsed < 0) {
      alert("Por favor ingresa una cantidad válida en Bolívares (VES).");
      return;
    }
    const clean = Number(parsed.toFixed(2));
    onUpdatePlataEnJuego(clean);
    setIsEditing(false);
    setCustomAmount("");
  };

  const handleAddQuick = (increment: number) => {
    const nextAmount = Number((plataEnJuego + increment).toFixed(2));
    onUpdatePlataEnJuego(nextAmount);
  };

  const handleSetCalculatedFromCartons = () => {
    if (cartonValueCalculated <= 0) {
      alert("Aún no hay cartones adquiridos en esta partida (0 cartones).");
      return;
    }
    onUpdatePlataEnJuego(cartonValueCalculated);
  };

  return (
    <div
      id="admin-plata-en-juego-card"
      className="bg-gradient-to-br from-slate-900 via-amber-950/30 to-slate-900 border-2 border-amber-500/60 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4 text-slate-100 relative overflow-hidden"
    >
      {/* Subtle background ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/30 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-500 to-amber-600 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/30 shrink-0">
            <Coins size={24} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-fredoka text-base sm:text-lg font-bold text-yellow-300 uppercase tracking-wide">
                Plata en Juego (Solo 80% Mostrado a Usuarios)
              </h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono">
                Admin gana 20%
              </span>
            </div>
            <p className="text-xs text-slate-300">
              A los usuarios solo se les muestra el 80% en plata en juego. El 20% restante va al menú del Administrador ("Dinero por Partida").
            </p>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-1 text-xs font-mono flex items-center gap-1.5">
            <span className="text-slate-400">Cartones en sala:</span>
            <span className="text-amber-300 font-bold">{totalCartonesEnJuego}</span>
            <span className="text-slate-500">({(totalCartonesEnJuego * cartonPrice).toFixed(2)} VES)</span>
          </div>

          {onOpenDineroPorPartida && (
            <button
              type="button"
              onClick={onOpenDineroPorPartida}
              className="bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 font-fredoka font-bold text-xs px-3 py-1.5 rounded-xl border border-emerald-500/50 transition cursor-pointer flex items-center gap-1.5 shadow"
              title="Abrir menú Dinero por Partida (Tienes 20% de una partida así sucesivamente)"
            >
              <Building size={14} className="text-emerald-400" />
              <span>Dinero por Partida (20%)</span>
            </button>
          )}

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-amber-500/20 hover:bg-amber-500/30 text-yellow-300 font-fredoka font-bold text-xs px-3 py-1.5 rounded-xl border border-amber-500/40 transition cursor-pointer"
          >
            {isEditing ? "Cerrar Ajustes" : "⚙️ Ajustar Pozo / Plata en Juego"}
          </button>
        </div>
      </div>

      {/* Main Stats Grid: Plata en juego 80% | Ganador 80% | Admin 20% */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {/* Card 1: Plata en juego mostrada a los usuarios (80%) */}
        <div className="bg-slate-950/80 border-2 border-amber-500/50 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-amber-300 tracking-wider flex items-center gap-1.5">
              <Coins size={15} className="text-amber-400" />
              Plata en Juego (Usuarios)
            </span>
            <span className="text-[10px] font-black uppercase bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md">
              Solo 80% Visible
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium">Monto que ven los usuarios:</span>
            <div className="font-fredoka font-black text-2xl sm:text-3xl text-yellow-300 tracking-tight flex items-baseline gap-1 font-mono">
              <span>{plataEnJuego.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="text-sm text-yellow-400/80 font-sans font-bold">VES</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 flex items-center justify-between">
            <span>Pozo bruto total: {grossPot.toFixed(2)} VES</span>
            <span className="font-mono text-slate-300">{totalCartonesEnJuego} cartones</span>
          </div>
        </div>

        {/* Card 2: Ganador se lleva el 80% acreditado automáticamente */}
        <div className="bg-gradient-to-br from-yellow-950/50 via-slate-950 to-amber-950/40 border-2 border-yellow-400 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-xl relative overflow-hidden ring-1 ring-yellow-400/40">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-black text-yellow-300 tracking-wider flex items-center gap-1.5">
              <Trophy size={16} className="text-yellow-400 fill-yellow-400/20" />
              Premio al Ganador
            </span>
            <span className="text-xs font-black uppercase bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 px-2.5 py-0.5 rounded-lg shadow">
              80% Acreditado Auto
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-yellow-200/90 font-medium">Monto que recibe el jugador:</span>
            <div className="font-fredoka font-black text-2xl sm:text-3xl text-yellow-400 tracking-tight flex items-baseline gap-1 font-mono">
              <span>{winnerPrize80.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="text-sm text-yellow-300 font-sans font-bold">VES</span>
            </div>
          </div>

          <div className="text-[11px] text-yellow-200/80 border-t border-yellow-500/20 pt-2 flex items-center justify-between">
            <span>Acreditación:</span>
            <span className="font-bold text-yellow-300">
              {hasWinnerPending ? `⏳ En espera (${winnerName || "Ganador"})` : "✓ Acreditación Automática en Saldo"}
            </span>
          </div>
        </div>

        {/* Card 3: Dinero por Partida (Tienes 20% de esta partida) */}
        <div className="bg-slate-950/80 border-2 border-emerald-500/40 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1.5">
              <Building size={15} className="text-emerald-400" />
              Dinero por Partida
            </span>
            <span className="text-[10px] font-black uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-md">
              20% Admin
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-slate-300 font-medium">Tienes 20% de esta partida:</span>
            <div className="font-fredoka font-black text-2xl sm:text-3xl text-emerald-400 tracking-tight flex items-baseline gap-1 font-mono">
              <span>+{houseFee20.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="text-sm text-emerald-300 font-sans font-bold">VES</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 flex items-center justify-between">
            <span>Se suma a tu menú:</span>
            <span className="font-mono text-emerald-300 font-semibold">Dinero por Partida</span>
          </div>
        </div>
      </div>

      {/* Editor & Quick-Set Panel (Toggles on button click or always accessible) */}
      {isEditing && (
        <div className="bg-slate-950/95 border border-amber-500/40 rounded-2xl p-4 flex flex-col gap-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Calculator size={14} /> Modificar o Fijar la Plata en Juego:
            </span>
            <span className="text-[11px] text-slate-400">
              El premio del 80% ({winnerPrize80.toFixed(2)} VES) se actualizará de forma instantánea.
            </span>
          </div>

          {/* Quick Increment Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Sumar a la bolsa:</span>
            <button
              type="button"
              onClick={() => handleAddQuick(60)}
              className="bg-amber-950/60 hover:bg-amber-900 text-yellow-300 border border-amber-500/40 font-mono text-xs font-bold px-2.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1"
              title="Sumar 1 cartón comprado (60 VES)"
            >
              +60 VES (+1 Cartón)
            </button>
            {[100, 200, 500, 1000].map((inc) => (
              <button
                key={inc}
                type="button"
                onClick={() => handleAddQuick(inc)}
                className="bg-slate-900 hover:bg-amber-500/20 text-yellow-300 border border-amber-500/30 hover:border-amber-400 font-mono text-xs font-bold px-2.5 py-1.5 rounded-xl transition cursor-pointer"
              >
                +{inc} VES
              </button>
            ))}

            <button
              type="button"
              onClick={handleSetCalculatedFromCartons}
              className="bg-blue-900/40 hover:bg-blue-800/60 text-blue-200 border border-blue-500/40 font-fredoka text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer ml-auto flex items-center gap-1"
              title="Calcular automáticamente sumando los 60 VES de cada cartón adquirido"
            >
              <Calculator size={13} /> Sincronizar con Cartones Vendidos ({cartonValueCalculated.toFixed(2)} VES)
            </button>
          </div>

          {/* Manual Input Form */}
          <form onSubmit={handleApplyCustom} className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
            <label className="text-xs text-slate-300 font-medium">Monto manual exacto:</label>
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <input
                type="number"
                step="0.01"
                min="0"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder={`Ej: ${plataEnJuego.toFixed(2)}`}
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs text-white font-mono outline-none"
              />
              <span className="absolute right-3 top-1.5 text-xs text-slate-400 font-bold">VES</span>
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-fredoka font-black text-xs px-4 py-1.5 rounded-xl transition shadow cursor-pointer"
            >
              Fijar Plata en Juego
            </button>

            <button
              type="button"
              onClick={() => {
                onUpdatePlataEnJuego(cartonValueCalculated);
                setIsEditing(false);
              }}
              className="text-slate-400 hover:text-yellow-300 text-xs underline cursor-pointer ml-2"
            >
              Sincronizar a Compras ({cartonValueCalculated.toFixed(2)} VES)
            </button>

            <button
              type="button"
              onClick={() => {
                onUpdatePlataEnJuego(0);
                setIsEditing(false);
              }}
              className="text-slate-400 hover:text-red-400 text-xs underline cursor-pointer ml-2"
            >
              Poner en 0.00 VES
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
