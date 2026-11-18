import React from "react";
import { WonGameRecord, WinnerAnnouncement } from "../types";
import {
  Trophy,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Coins,
} from "lucide-react";

interface Props {
  currentWonGame: WonGameRecord | null;
  winnerAnnouncement: WinnerAnnouncement | null;
  currentUserEmail?: string;
  plataEnJuego?: number;
}

export const PlayerPaymentStatusBanner: React.FC<Props> = ({
  currentWonGame,
  winnerAnnouncement,
  currentUserEmail,
  plataEnJuego,
}) => {
  if (!currentWonGame && !winnerAnnouncement) return null;

  const winnerName = currentWonGame?.winnerName || winnerAnnouncement?.winnerName || "Jugador";
  const winnerEmail = currentWonGame?.winnerEmail || winnerAnnouncement?.winnerEmail || "";
  const cartonId = currentWonGame?.cartonId || winnerAnnouncement?.cartonId || 1;
  const patternName = currentWonGame?.patternName || winnerAnnouncement?.patternName || "Figura Oficial";
  const status = currentWonGame?.status || (winnerAnnouncement?.prizeStatus ?? "PENDING_AMOUNT");
  const prizeAmountVES = currentWonGame?.prizeAmountVES || winnerAnnouncement?.prizeAmount || 0;
  const pot = plataEnJuego ?? currentWonGame?.plataEnJuego ?? winnerAnnouncement?.plataEnJuego ?? 0;
  const isDuoWin = Boolean(currentWonGame?.isDuoWin || winnerAnnouncement?.isDuoWin);
  const estimatedPrize = isDuoWin ? Number((pot * 0.4).toFixed(2)) : Number((pot * 0.8).toFixed(2));
  const isPaid = status === "PAID";
  const isSelf = currentUserEmail?.toLowerCase() === winnerEmail.toLowerCase();

  return (
    <div
      id="player-payment-status-banner"
      className={`rounded-3xl border-2 p-4 sm:p-5 shadow-2xl transition-all ${
        isPaid
          ? "bg-gradient-to-r from-emerald-950/90 via-slate-900 to-emerald-950/90 border-emerald-400/80 shadow-emerald-500/10 text-emerald-100"
          : "bg-gradient-to-r from-yellow-950/90 via-slate-900 to-amber-950/90 border-yellow-400/80 shadow-yellow-500/10 text-yellow-100 animate-pulse"
      }`}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left icon and message */}
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-lg shrink-0 ${
              isPaid
                ? "bg-gradient-to-tr from-emerald-400 to-teal-500 text-slate-950"
                : "bg-gradient-to-tr from-yellow-400 to-amber-500 text-slate-950"
            }`}
          >
            {isPaid ? <Coins size={24} /> : <Trophy size={24} />}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider border ${
                  isPaid
                    ? "bg-emerald-950 text-emerald-300 border-emerald-700 shadow"
                    : "bg-amber-950 text-yellow-300 border-amber-500 animate-pulse shadow"
                }`}
              >
                {isPaid
                  ? "✓ Premio Aprobado y Acreditado"
                  : "⏳ En Espera de Aprobación del Administrador"}
              </span>
              <span className="text-xs font-bold text-slate-300">
                Cartón #{cartonId} • "{patternName}"
              </span>
            </div>

            <h3 className="font-fredoka font-black text-sm sm:text-base tracking-tight mt-0.5 text-white">
              {isSelf
                ? isPaid
                  ? `¡FELICITACIONES! El Administrador aprobó y acreditó tu premio oficial de ${prizeAmountVES.toFixed(2)} VES.`
                  : "¡GANASTE ESTA PARTIDA! Tu premio ha sido puesto en espera para que el Administrador apruebe y te pase el monto que se acreditará a tu cuenta."
                : isPaid
                ? `Partida ganada por ${winnerName}. Monto oficial aprobado y acreditado: ${prizeAmountVES.toFixed(2)} VES.`
                : `Partida ganada por ${winnerName}. En espera de que el Administrador apruebe y le transfiera el monto a su cuenta.`}
            </h3>

            <p className="text-xs text-slate-300/90 mt-0.5">
              {isPaid
                ? isSelf
                  ? `El monto de ${prizeAmountVES.toFixed(2)} VES ya fue sumado a tu saldo en cuenta. ¡Puedes revisarlo en tu billetera!`
                  : `El premio fue transferido exitosamente a la cuenta del ganador. La partida ha concluido.`
                : isSelf
                ? `El administrador está revisando tu jugada para aprobar el monto en Bolívares (VES) que se sumará a tu saldo.`
                : `La partida se detuvo automáticamente. El juego está en espera de la aprobación del monto.`}
            </p>
          </div>
        </div>

        {/* Right prize badge */}
        <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl px-4 py-2.5 flex flex-col items-end">
            <span className="text-[9px] uppercase font-bold text-slate-400 flex items-center gap-1">
              {isPaid ? <CheckCircle2 size={12} className="text-emerald-400" /> : <Clock size={12} className="text-yellow-400 animate-spin" />}
              {isPaid ? "Monto Acreditado:" : "Estado del Monto:"}
            </span>
            <span
              className={`font-fredoka font-black text-base sm:text-lg font-mono ${
                isPaid ? "text-emerald-400" : "text-yellow-300 animate-pulse"
              }`}
            >
              {isPaid ? `${prizeAmountVES.toFixed(2)} VES` : `${isDuoWin ? "40% Dúo" : "80% Solo"}: ${estimatedPrize.toFixed(2)} VES`}
            </span>
            {!isPaid && (
              <span className="text-[9px] text-amber-400 font-bold">
                (En espera de aprobación)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
