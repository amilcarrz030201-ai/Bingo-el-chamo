import React, { useState } from "react";
import { WonGameRecord } from "../types";
import {
  Trophy,
  CheckCircle2,
  DollarSign,
  Send,
  Sparkles,
  AlertCircle,
  FileCheck,
  RotateCcw,
  Clock,
  ShieldCheck,
} from "lucide-react";

interface Props {
  plataEnJuego: number;
  currentWonGame: WonGameRecord | null;
  wonGamesHistory: WonGameRecord[];
  onSetPrizeAndPay: (gameId: string, amountVES: number, ref?: string, notes?: string) => void;
  onResetTombola: () => void;
  onOpenApprovalModal?: () => void;
}

export const AdminPaymentBar: React.FC<Props> = ({
  plataEnJuego,
  currentWonGame,
  wonGamesHistory,
  onSetPrizeAndPay,
  onResetTombola,
  onOpenApprovalModal,
}) => {
  const winnerPrize80 = Number((plataEnJuego * 0.8).toFixed(2));
  const houseFee20 = Number((plataEnJuego * 0.2).toFixed(2));

  const [amountInput, setAmountInput] = useState<string>(
    currentWonGame?.prizeAmountVES && currentWonGame.prizeAmountVES > 0
      ? currentWonGame.prizeAmountVES.toString()
      : winnerPrize80.toString()
  );
  const [refInput, setRefInput] = useState<string>("");
  const [notesInput, setNotesInput] = useState<string>("");
  const [historyOpen, setHistoryOpen] = useState(false);

  // Synchronize when a new game is selected or plataEnJuego changes
  React.useEffect(() => {
    if (currentWonGame) {
      if (currentWonGame.prizeAmountVES > 0) {
        setAmountInput(currentWonGame.prizeAmountVES.toString());
      } else {
        setAmountInput(winnerPrize80.toString());
      }
      setRefInput(currentWonGame.adminPaymentRef || `PAGO-${Math.floor(100000 + Math.random() * 900000)}`);
    } else {
      setAmountInput(winnerPrize80.toString());
    }
  }, [currentWonGame, winnerPrize80]);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWonGame) return;

    const parsedAmount = parseFloat(amountInput);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    const cleanAmount = Number(parsedAmount.toFixed(2));

    onSetPrizeAndPay(
      currentWonGame.id,
      cleanAmount,
      refInput.trim() || `PAGO-${Date.now().toString().slice(-6)}`,
      notesInput.trim() || undefined
    );
  };

  const quickPicks = [100, 300, 500, 1000, 2000, 5000];

  return (
    <div
      id="admin-payment-bar"
      className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border-2 border-yellow-500/50 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4 text-slate-100"
    >
      {/* Header of Payment Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/30 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-yellow-400 to-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-yellow-500/30 shrink-0">
            <DollarSign size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-fredoka text-sm sm:text-base font-bold text-yellow-300 uppercase tracking-wide">
                Barra de Pago y Liquidación de Partidas
              </h3>
              {currentWonGame ? (
                <span
                  className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    currentWonGame.status === "PAID"
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      : "bg-yellow-500 text-slate-950 animate-pulse font-black"
                  }`}
                >
                  {currentWonGame.status === "PAID" ? "Premio Liquidado" : "Pendiente de Monto"}
                </span>
              ) : (
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                  En espera de ganador
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300">
              Control oficial para fijar el monto en Bolívares (VES) y pagar una sola vez al usuario ganador.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenApprovalModal && currentWonGame && currentWonGame.status === "PENDING_AMOUNT" && (
            <button
              type="button"
              onClick={onOpenApprovalModal}
              className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-fredoka font-black px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
            >
              <Trophy size={13} /> Abrir Ventana de Aprobación
            </button>
          )}

          {wonGamesHistory.length > 0 && (
            <button
              type="button"
              onClick={() => setHistoryOpen(!historyOpen)}
              className="bg-slate-950 hover:bg-slate-800 text-amber-300 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-fredoka flex items-center gap-1.5 transition cursor-pointer"
            >
              <Clock size={13} />
              <span>Historial ({wonGamesHistory.length})</span>
            </button>
          )}

          {currentWonGame && currentWonGame.status === "PAID" && (
            <button
              type="button"
              onClick={onResetTombola}
              className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-fredoka font-black px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
            >
              <RotateCcw size={13} /> Iniciar Nueva Partida
            </button>
          )}
        </div>
      </div>

      {/* Main Payment Workflow State */}
      {currentWonGame ? (
        <div className="flex flex-col gap-4">
          {/* Winner Details Card */}
          <div className="bg-slate-950/90 border-2 border-yellow-400/50 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 text-slate-950 flex items-center justify-center font-fredoka font-black text-xl shadow-lg shadow-yellow-500/30 shrink-0">
                <Trophy size={28} />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded-md">
                    ¡Partida Ganada!
                  </span>
                  <span className="font-fredoka font-black text-yellow-300 text-base sm:text-lg">
                    {currentWonGame.winnerName}
                  </span>
                  <span className="text-xs text-amber-200/90 font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-lg">
                    ✉️ {currentWonGame.winnerEmail}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-slate-300 flex-wrap">
                  <span className="text-slate-300 font-semibold flex items-center gap-1">
                    <Clock size={12} className="text-amber-400" />
                    Ganó la partida: <strong className="text-white font-mono">{currentWonGame.wonAt}</strong>
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-amber-300 font-mono font-bold">
                    Cartón #{currentWonGame.cartonId}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-yellow-200 font-bold">
                    Figura: "{currentWonGame.patternName}"
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300 font-mono">
                    Bola: #{currentWonGame.winningBall} ({currentWonGame.winningBallLetter})
                  </span>
                </div>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex flex-col items-start md:items-end gap-1 shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Estado de la Liquidación:
              </span>
              <div
                className={`flex items-center gap-1.5 font-fredoka font-bold text-xs px-3.5 py-1.5 rounded-xl border ${
                  currentWonGame.status === "PAID"
                    ? "bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-900/30"
                    : "bg-yellow-950/80 border-yellow-500 text-yellow-300 animate-pulse"
                }`}
              >
                {currentWonGame.status === "PAID" ? (
                  <>
                    <CheckCircle2 size={15} className="text-emerald-400" />
                    <span>Premio Acreditado: {currentWonGame.prizeAmountVES.toFixed(2)} VES</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={15} className="text-yellow-400" />
                    <span>Fijar Monto para Acreditar</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Form to Set Amount and Pay if not paid yet */}
          {currentWonGame.status === "PENDING_AMOUNT" ? (
            <form
              onSubmit={handlePay}
              className="bg-slate-950 p-4 rounded-2xl border border-yellow-400/40 flex flex-col gap-3 shadow-inner"
            >
              {/* Plata en juego 80% distribution banner */}
              <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border border-amber-500/50 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">💰 Plata en juego:</span>
                  <span className="font-mono font-bold text-yellow-300 text-sm">{plataEnJuego.toFixed(2)} VES</span>
                </div>
                <div className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-400/50 px-2.5 py-1 rounded-lg">
                  <span className="font-bold text-yellow-300">🏆 Ganador (80% Solo):</span>
                  <span className="font-mono font-black text-yellow-400 text-sm">{winnerPrize80.toFixed(2)} VES</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">🏦 Casa (20%):</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">{houseFee20.toFixed(2)} VES</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-fredoka font-bold text-xs sm:text-sm text-yellow-300 flex items-center gap-1.5">
                  <Sparkles size={15} className="text-yellow-400" />
                  Asignar Monto en Bolívares (VES) para esta Partida:
                </span>
                <span className="text-[11px] text-slate-400">
                  (El saldo se acreditará una sola vez al usuario)
                </span>
              </div>

              {/* Quick Amount Pills with 80% highlighted */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-400">Montos rápidos sugeridos:</span>
                <button
                  type="button"
                  onClick={() => setAmountInput(winnerPrize80.toString())}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-black border-2 transition cursor-pointer flex items-center gap-1 ${
                    amountInput === winnerPrize80.toString()
                      ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 border-yellow-300 shadow-md shadow-yellow-500/30"
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
                        ? "bg-yellow-400 text-slate-950 border-yellow-300"
                        : "bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500"
                    }`}
                  >
                    {val.toFixed(2)} VES
                  </button>
                ))}
              </div>

              {/* Input Fields Row */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-4">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Monto a Pagar (VES):
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
                      className="w-full bg-slate-900 border-2 border-yellow-400/60 rounded-xl px-3 py-2 text-sm text-yellow-300 font-mono font-bold outline-none focus:border-yellow-400 pr-14"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold font-mono">
                      VES
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-4">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    N° Referencia / Comprobante:
                  </label>
                  <input
                    type="text"
                    value={refInput}
                    onChange={(e) => setRefInput(e.target.value)}
                    placeholder="Ej. REF-829103"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-4 flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-fredoka font-black py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer text-xs uppercase tracking-wider"
                  >
                    <Send size={15} /> ✓ Aprobar y Acreditar Monto a su Cuenta
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Receipt of Paid Prize */
            <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-200">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
                <div>
                  <span className="font-fredoka font-bold text-sm text-emerald-300">
                    Premio liquidado por {currentWonGame.prizeAmountVES.toFixed(2)} VES
                  </span>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Acreditado al saldo de {currentWonGame.winnerName} • Ref:{" "}
                    <strong className="font-mono text-amber-300">
                      {currentWonGame.adminPaymentRef || "DIRECTA"}
                    </strong>{" "}
                    • Fecha: {currentWonGame.paidAt || currentWonGame.wonAt}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="bg-emerald-900/80 text-emerald-200 border border-emerald-700 px-2.5 py-1 rounded-xl text-[11px] font-bold">
                  ✓ Ganancia Acreditada (1 sola vez)
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State: Waiting for a game to be won */
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 text-center flex flex-col items-center justify-center gap-2">
          <FileCheck size={28} className="text-slate-600" />
          <p className="text-xs text-slate-400 font-medium">
            No hay partida ganada pendiente por liquidar en este momento.
          </p>
          <span className="text-[11px] text-slate-500">
            Tan pronto un jugador cante bingo en la sala, aparecerá aquí inmediatamente con su cartón
            y podrás fijarle el monto en Bolívares antes de que inicie la siguiente ronda.
          </span>
        </div>
      )}

      {/* History Drawer if open */}
      {historyOpen && wonGamesHistory.length > 0 && (
        <div className="border-t border-slate-800 pt-3 flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
            <Clock size={13} /> Historial de Partidas Ganadas y Premios Pagados:
          </span>
          <div className="max-h-48 overflow-y-auto flex flex-col gap-1.5 pr-1">
            {wonGamesHistory.map((g) => (
              <div
                key={g.id}
                className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-fredoka font-bold text-yellow-300">{g.winnerName}</span>
                  <span className="text-slate-400 text-[11px]">Cartón #{g.cartonId}</span>
                  <span className="text-slate-500 text-[10px] font-mono">({g.patternName})</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-emerald-400">
                    +{g.prizeAmountVES.toFixed(2)} VES
                  </span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded">
                    {g.status === "PAID" ? "Pagado" : "Pendiente"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
