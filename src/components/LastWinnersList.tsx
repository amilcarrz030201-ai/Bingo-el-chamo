import React from "react";
import { WonGameRecord } from "../types";
import { Trophy, Calendar, Coins, Sparkles, Award, UserCheck, Flame } from "lucide-react";

interface Props {
  winners: WonGameRecord[];
}

export const LastWinnersList: React.FC<Props> = ({ winners }) => {
  // Known bot/mock emails to exclude
  const BOT_EMAILS = new Set([
    "carlos.elchamo@gmail.com",
    "mariagomez.ccs@gmail.com",
    "jose.francisco.maracay@gmail.com",
    "andreavalentina.bingo@gmail.com",
    "laninita.bingo@gmail.com",
    "jugador.chamo@gmail.com",
  ]);

  // Strictly real winners (Zero bots)
  const combinedWinners: WonGameRecord[] = React.useMemo(() => {
    return winners
      .filter((w) => !BOT_EMAILS.has((w.winnerEmail || "").toLowerCase().trim()))
      .slice(0, 10);
  }, [winners]);

  const totalPrizeDistributed = React.useMemo(() => {
    return combinedWinners.reduce((acc, curr) => acc + (curr.prizeAmountVES || curr.plataEnJuego * 0.8), 0);
  }, [combinedWinners]);

  return (
    <div
      id="last-10-winners-section"
      className="bg-slate-900/95 border border-amber-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col gap-4 text-slate-100 relative overflow-hidden"
    >
      {/* Background ambient accents */}
      <div className="absolute -top-10 -right-10 w-44 h-44 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-yellow-400 via-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/20 shrink-0">
            <Trophy size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-fredoka text-sm sm:text-base font-bold text-yellow-300 uppercase tracking-wide">
                Últimos 10 Ganadores
              </h3>
              <span className="text-[10px] bg-yellow-500/20 text-yellow-300 font-bold px-2 py-0.5 rounded-full border border-yellow-500/40 font-mono flex items-center gap-1">
                <Flame size={10} className="text-yellow-400" />
                80% Solo / 40% Dúo
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Historial oficial de las últimas partidas premiadas de la sala.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
          <span className="text-slate-400">Repartido:</span>
          <span className="font-bold text-emerald-400">
            {totalPrizeDistributed.toFixed(2)} VES
          </span>
        </div>
      </div>

      {/* List Component of Last 10 Winners */}
      {combinedWinners.length === 0 ? (
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center text-xs text-slate-500 italic">
          Aún no se han registrado ganadores en esta sesión.
        </div>
      ) : (
        <ul className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1 divide-y-0">
          {combinedWinners.map((winner, index) => {
            const prizeVES = winner.prizeAmountVES || (winner.plataEnJuego ? winner.plataEnJuego * 0.8 : 0);
            const isTop1 = index === 0;
            const isTop2 = index === 1;
            const isTop3 = index === 2;

            return (
              <li
                key={winner.id || `win-row-${index}`}
                className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isTop1
                    ? "bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-950 border-amber-500/60 shadow-lg shadow-amber-500/10"
                    : isTop2
                    ? "bg-slate-950/90 border-slate-700/80 hover:border-amber-500/40"
                    : isTop3
                    ? "bg-slate-950/80 border-slate-800 hover:border-slate-700"
                    : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                }`}
              >
                {/* Left: Position Rank + Winner Details */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Position Badge */}
                  <div
                    className={`w-8 h-8 rounded-xl font-fredoka font-black text-xs flex items-center justify-center shrink-0 shadow ${
                      isTop1
                        ? "bg-gradient-to-tr from-yellow-400 to-amber-500 text-slate-950 ring-2 ring-yellow-300"
                        : isTop2
                        ? "bg-gradient-to-tr from-slate-300 to-slate-400 text-slate-950"
                        : isTop3
                        ? "bg-gradient-to-tr from-amber-600 to-amber-800 text-amber-100"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {index + 1}°
                  </div>

                  {/* Name + Victory Date */}
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-fredoka font-bold text-sm text-yellow-200 truncate max-w-[180px]">
                        {winner.winnerName}
                      </span>
                      {winner.cartonId && (
                        <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-1.5 py-0.2 rounded-md font-mono font-bold">
                          Cartón #{winner.cartonId}
                        </span>
                      )}
                      {isTop1 && (
                        <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded font-sans uppercase">
                          Último Bingo
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1 font-sans">
                        <Calendar size={11} className="text-slate-500" />
                        {winner.wonAt || "Fecha reciente"}
                      </span>
                      {winner.patternName && (
                        <>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-400 italic text-[11px] truncate max-w-[150px]">
                            {winner.patternName}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Prize Amount Awarded */}
                <div className="flex items-center sm:flex-col sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-900 shrink-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 sm:text-right">
                    Premio Recibido:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Coins size={14} className="text-yellow-400" />
                    <span className="font-fredoka text-base sm:text-lg font-black text-emerald-400 font-mono tracking-tight">
                      +{prizeVES.toFixed(2)} VES
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Footer Note */}
      <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between gap-2 flex-wrap">
        <span className="flex items-center gap-1.5">
          <Sparkles size={13} className="text-yellow-400 shrink-0" />
          <span>Cada ganador recibe el <strong>80%</strong> automático del dinero en juego (o <strong>40% y 40%</strong> en modo Dúo).</span>
        </span>
        <span className="font-mono text-slate-500 text-[10px]">Actualizado en tiempo real</span>
      </div>
    </div>
  );
};
