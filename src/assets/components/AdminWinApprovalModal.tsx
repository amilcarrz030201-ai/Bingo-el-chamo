import React, { useState, useEffect } from "react";
import { WonGameRecord, RegisteredUser } from "../types";
import {
  Trophy,
  CheckCircle2,
  Clock,
  DollarSign,
  Send,
  X,
  AlertTriangle,
  Sparkles,
  UserCheck,
  ShieldCheck,
  RotateCcw,
  Wallet,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentWonGame: WonGameRecord | null;
  registeredUsers?: RegisteredUser[];
  plataEnJuego: number;
  onApproveAndPay: (gameId: string, amountVES: number, ref?: string, notes?: string) => void;
  onRejectWin?: (gameId: string, reason?: string) => void;
}

export const AdminWinApprovalModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentWonGame,
  registeredUsers = [],
  plataEnJuego,
  onApproveAndPay,
  onRejectWin,
}) => {
  const winnerPrize80 = Number((plataEnJuego * 0.8).toFixed(2));
  const houseFee20 = Number((plataEnJuego * 0.2).toFixed(2));

  const [amountInput, setAmountInput] = useState<string>(winnerPrize80.toString());
  const [refInput, setRefInput] = useState<string>("");
  const [notesInput, setNotesInput] = useState<string>("");

  useEffect(() => {
    if (currentWonGame) {
      if (currentWonGame.prizeAmountVES && currentWonGame.prizeAmountVES > 0) {
        setAmountInput(currentWonGame.prizeAmountVES.toString());
      } else {
        setAmountInput(winnerPrize80.toString());
      }
      setRefInput(
        currentWonGame.adminPaymentRef || `PAGO-${Math.floor(100000 + Math.random() * 900000)}`
      );
      setNotesInput(currentWonGame.adminNotes || "Premio de bingo (80% oficial solo / 40% dúo) aprobado por administración");
    } else {
      setAmountInput(winnerPrize80.toString());
    }
  }, [currentWonGame, winnerPrize80]);

  if (!isOpen || !currentWonGame) return null;

  // Find winner current balance in registered users
  const winnerUser = registeredUsers.find(
    (u) => u.email.toLowerCase() === currentWonGame.winnerEmail.toLowerCase()
  );
  const currentWinnerBalance = winnerUser?.balance ?? 0;

  const quickPicks = [100, 200, 300, 500, 1000, 2000, 5000];

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amountInput);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Por favor ingresa un monto válido en Bolívares (VES) mayor a 0.");
      return;
    }

    const cleanAmount = Number(parsedAmount.toFixed(2));

    onApproveAndPay(
      currentWonGame.id,
      cleanAmount,
      refInput.trim() || `PAGO-${Date.now().toString().slice(-6)}`,
      notesInput.trim() || undefined
    );
    onClose();
  };

  const handleHoldInWaiting = () => {
    onClose();
  };

  const handleReject = () => {
    let reason = "Revisión de jugada inválida";
    try {
      const inputReason = window.prompt(
        `¿Deseas anular o rechazar este reclamo de Bingo de ${currentWonGame.winnerName}?\n\nIndica el motivo (opcional):`,
        "Revisión de jugada inválida"
      );
      if (inputReason !== null && inputReason.trim()) {
        reason = inputReason.trim();
      }
    } catch {
      // Iframe sandbox suppresses prompts
    }
    if (onRejectWin) {
      onRejectWin(currentWonGame.id, reason);
      onClose();
    }
  };

  const isAlreadyPaid = currentWonGame.status === "PAID";

  return (
    <div
      id="admin-win-approval-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/60 border-2 border-yellow-400/80 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-100 flex flex-col gap-4 overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Glow ambient background */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-40 bg-yellow-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header with Close */}
        <div className="flex items-start justify-between border-b border-amber-500/30 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-400 to-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-yellow-500/30 shrink-0 animate-bounce">
              <Trophy size={26} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] bg-red-600 text-white font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                  ¡Alerta Administrador!
                </span>
                <span
                  className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    isAlreadyPaid
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-700"
                      : "bg-amber-500 text-slate-950 font-bold"
                  }`}
                >
                  {isAlreadyPaid ? "Premio Aprobado" : "En Espera de Aprobación"}
                </span>
              </div>
              <h2 className="font-fredoka text-lg sm:text-xl font-bold text-yellow-300 mt-0.5">
                Aprobación de Monto para Ganador de Bingo
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition cursor-pointer"
            title="Cerrar ventana"
          >
            <X size={20} />
          </button>
        </div>

        {/* Winner Information Summary Card */}
        <div className="bg-slate-950/90 border border-yellow-400/40 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Jugador Ganador:
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-fredoka font-black text-yellow-300 text-base sm:text-lg">
                  {currentWonGame.winnerName}
                </span>
                <span className="text-xs font-mono text-amber-200/90 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-lg">
                  ✉️ {currentWonGame.winnerEmail}
                </span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center gap-2 self-start sm:self-center">
              <Wallet size={15} className="text-amber-400" />
              <div className="flex flex-col text-right">
                <span className="text-[9px] uppercase font-bold text-slate-400">Saldo Actual:</span>
                <span className="font-fredoka text-xs font-bold text-yellow-300 font-mono">
                  {currentWinnerBalance.toFixed(2)} VES
                </span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-slate-900/90 border border-slate-800/80 p-2 rounded-xl">
              <span className="text-[10px] text-slate-400 block">Cartón Ganador:</span>
              <span className="font-mono font-bold text-amber-300 text-sm">
                Cartón #{currentWonGame.cartonId}
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800/80 p-2 rounded-xl">
              <span className="text-[10px] text-slate-400 block">Figura Completada:</span>
              <span className="font-fredoka font-bold text-yellow-300 text-xs truncate block">
                {currentWonGame.patternName}
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800/80 p-2 rounded-xl">
              <span className="text-[10px] text-slate-400 block">Bola de la Cantada:</span>
              <span className="font-mono font-bold text-yellow-300 text-xs">
                #{currentWonGame.winningBall} ({currentWonGame.winningBallLetter})
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800/80 p-2 rounded-xl">
              <span className="text-[10px] text-slate-400 block">Hora de la Victoria:</span>
              <span className="font-mono text-slate-300 text-[11px] truncate block">
                {currentWonGame.wonAt}
              </span>
            </div>
          </div>
        </div>

        {/* Current State Info Banner */}
        <div
          className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
            isAlreadyPaid
              ? "bg-emerald-950/70 border-emerald-500 text-emerald-200"
              : "bg-amber-950/70 border-amber-500 text-amber-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {isAlreadyPaid ? (
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            ) : (
              <Clock size={18} className="text-yellow-400 shrink-0 animate-spin" />
            )}
            <div>
              <span className="font-bold block">
                {isAlreadyPaid
                  ? `Monto oficial de ${currentWonGame.prizeAmountVES.toFixed(2)} VES ya fue aprobado y acreditado.`
                  : "Estado: EN ESPERA para pasarle el monto que se le va a acreditar a su cuenta."}
              </span>
              <span className="text-[11px] opacity-80">
                {isAlreadyPaid
                  ? `Liquidado con Ref: ${currentWonGame.adminPaymentRef || "DIRECTA"} a las ${
                      currentWonGame.paidAt || currentWonGame.wonAt
                    }`
                  : "Ingresa o selecciona a continuación el monto en Bolívares (VES) y pulsa 'Aprobar y Acreditar Saldo'."}
              </span>
            </div>
          </div>
        </div>

        {/* Amount Input Form */}
        {!isAlreadyPaid ? (
          <form onSubmit={handleApprove} className="flex flex-col gap-3">
            {/* Plata en juego 80% distribution banner */}
            <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border border-amber-500/60 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-inner">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">💰 (Plata en juego):</span>
                <span className="font-mono font-bold text-yellow-300 text-sm">{plataEnJuego.toFixed(2)} VES</span>
              </div>
              <div className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-400/60 px-3 py-1 rounded-xl shadow">
                <span className="font-bold text-yellow-300">🏆 Ganador (80% Solo):</span>
                <span className="font-mono font-black text-yellow-400 text-base">{winnerPrize80.toFixed(2)} VES</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">🏦 Comisión Casa (20%):</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">{houseFee20.toFixed(2)} VES</span>
              </div>
            </div>

            {/* Quick Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-400">Montos rápidos sugeridos:</span>
              <button
                type="button"
                onClick={() => setAmountInput(winnerPrize80.toString())}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-black border-2 transition cursor-pointer flex items-center gap-1.5 shadow ${
                  amountInput === winnerPrize80.toString()
                    ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 border-yellow-300 shadow-yellow-500/40"
                    : "bg-yellow-500/20 text-yellow-300 border-yellow-400/50 hover:bg-yellow-500/30"
                }`}
              >
                <span>⭐ 80% Oficial: {winnerPrize80.toFixed(2)} VES</span>
              </button>
              {quickPicks.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmountInput(val.toString())}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition cursor-pointer ${
                    amountInput === val.toString()
                      ? "bg-yellow-400 text-slate-950 border-yellow-300 shadow"
                      : "bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500"
                  }`}
                >
                  {val.toFixed(2)} VES
                </button>
              ))}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-5">
                <label className="text-[11px] uppercase font-bold text-yellow-300 block mb-1">
                  Monto a Acreditar (VES): *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    min="1"
                    required
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    placeholder="Ej. 500.00"
                    className="w-full bg-slate-950 border-2 border-yellow-400 rounded-xl px-3 py-2.5 text-base text-yellow-300 font-mono font-bold outline-none focus:ring-2 focus:ring-yellow-400 pr-14 shadow-inner"
                  />
                  <span className="absolute right-3 top-3 text-xs text-slate-400 font-bold font-mono">
                    VES
                  </span>
                </div>
              </div>

              <div className="sm:col-span-4">
                <label className="text-[11px] uppercase font-bold text-slate-400 block mb-1">
                  N° de Referencia / ID Pago:
                </label>
                <input
                  type="text"
                  value={refInput}
                  onChange={(e) => setRefInput(e.target.value)}
                  placeholder="Ej. PAGO-829102"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-mono outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-[11px] uppercase font-bold text-slate-400 block mb-1">
                  Nuevo Saldo Estimado:
                </label>
                <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-emerald-400 flex items-center">
                  +{(currentWinnerBalance + (parseFloat(amountInput) || 0)).toFixed(2)} VES
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">
                Notas del Administrador (Opcional):
              </label>
              <input
                type="text"
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Ej. Liquidación oficial 1er lugar partida"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-500"
              />
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="submit"
                className="w-full sm:flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-fredoka font-black py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer text-sm uppercase tracking-wider"
              >
                <Send size={16} /> Aprobar y Acreditar Saldo a la Cuenta
              </button>

              <button
                type="button"
                onClick={handleHoldInWaiting}
                className="w-full sm:w-auto bg-amber-950/80 hover:bg-amber-900/90 text-amber-300 font-fredoka font-bold py-3 px-4 rounded-xl border border-amber-500/50 flex items-center justify-center gap-2 text-xs transition cursor-pointer"
                title="Cerrar y mantener en espera para aprobar más tarde"
              >
                <Clock size={15} /> Mantener en Espera
              </button>

              {onRejectWin && (
                <button
                  type="button"
                  onClick={handleReject}
                  className="w-full sm:w-auto bg-red-950/80 hover:bg-red-900 text-red-300 font-fredoka font-bold py-3 px-3.5 rounded-xl border border-red-800/80 flex items-center justify-center gap-1.5 text-xs transition cursor-pointer"
                  title="Anular o rechazar este bingo"
                >
                  <X size={15} /> Rechazar Bingo
                </button>
              )}
            </div>
          </form>
        ) : (
          /* When already paid */
          <div className="flex flex-col gap-3">
            <div className="bg-emerald-950/60 border border-emerald-500 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck size={26} className="text-emerald-400" />
                <div>
                  <span className="font-fredoka font-black text-sm text-emerald-300">
                    Monto de {currentWonGame.prizeAmountVES.toFixed(2)} VES acreditado con éxito
                  </span>
                  <p className="text-xs text-slate-300">
                    El saldo del usuario se actualizó y la transacción quedó registrada.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="bg-emerald-700 hover:bg-emerald-600 text-white font-fredoka font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
