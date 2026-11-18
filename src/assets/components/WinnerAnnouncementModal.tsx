import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { WinnerAnnouncement } from "../types";
import {
  Trophy,
  Sparkles,
  PartyPopper,
  X,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Volume2,
  Clock,
  Users,
  HeartHandshake,
  Home,
} from "lucide-react";
import { ChristmasLights } from "./ChristmasLights";
import { ChristmasTree } from "./ChristmasTree";

interface Props {
  announcement: WinnerAnnouncement | null;
  onClose: () => void;
  onReturnToLobby?: () => void;
  onNewGame?: () => void;
}

export const WinnerAnnouncementModal: React.FC<Props> = ({
  announcement,
  onClose,
  onReturnToLobby,
  onNewGame,
}) => {
  useEffect(() => {
    if (!announcement) return;

    // Trigger powerful festive confetti celebration
    const end = Date.now() + 3500;
    const colors = ["#fbbf24", "#f59e0b", "#10b981", "#ef4444", "#3b82f6", "#ec4899"];

    const interval: any = setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }
      // Left burst
      confetti({
        particleCount: 40,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      // Right burst
      confetti({
        particleCount: 40,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });
      // Center star burst
      confetti({
        particleCount: 25,
        spread: 100,
        origin: { x: 0.5, y: 0.5 },
        colors,
      });
    }, 280);

    return () => clearInterval(interval);
  }, [announcement]);

  if (!announcement) return null;

  const avatarToDisplay = announcement.winnerAvatar || announcement.avatar;

  const handleReturnToLobbyClick = () => {
    if (onReturnToLobby) {
      onReturnToLobby();
    }
    onClose();
    // Dispatch global event for any listening subcomponents to return view to lobby
    window.dispatchEvent(new CustomEvent("chamo_return_to_lobby"));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[92vh] bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/85 border-2 border-yellow-400/80 rounded-3xl shadow-2xl text-slate-100 flex flex-col overflow-hidden">
        {/* Festive Christmas Lights on Winner Modal */}
        <ChristmasLights count={20} compact={true} className="-mt-1 mb-0.5" />

        {/* Glowing top rays accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-40 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close icon */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition cursor-pointer"
          title="Cerrar ventana"
        >
          <X size={20} />
        </button>

        {/* Scrollable Modal Content */}
        <div className="w-full flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center text-center">
          {/* Top Trophy & Winner Avatar Badge with Christmas Trees */}
          <div className="relative mb-3 mt-1 flex items-center justify-center gap-2">
            <ChristmasTree size="compact" interactive={true} className="hidden sm:inline-flex" />
            <div className="relative">
              {avatarToDisplay ? (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-yellow-400 via-amber-500 to-yellow-300 p-1 shadow-2xl shadow-yellow-500/50 flex items-center justify-center overflow-hidden animate-bounce">
                  <div className="w-full h-full bg-slate-950 rounded-[22px] overflow-hidden flex items-center justify-center">
                    {avatarToDisplay.startsWith("data:") || avatarToDisplay.startsWith("http") ? (
                      <img
                        src={avatarToDisplay}
                        alt={announcement.winnerName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl">{avatarToDisplay}</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-yellow-400 via-amber-500 to-yellow-300 p-1 shadow-2xl shadow-yellow-500/50 flex items-center justify-center animate-bounce">
                  <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-yellow-400">
                    <Trophy size={46} className="stroke-[2.5]" />
                  </div>
                </div>
              )}
              <div className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-1.5 shadow-lg animate-pulse">
                <PartyPopper size={16} />
              </div>
            </div>
            <ChristmasTree size="compact" interactive={true} className="hidden sm:inline-flex" />
          </div>

          {/* Big Winner Announcement Heading */}
          <div className="flex flex-col items-center gap-1.5 mb-2">
            <div className="inline-flex items-center gap-1.5 bg-yellow-500/20 text-yellow-300 border border-yellow-400/40 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest font-fredoka">
              {announcement.isDuoWin ? (
                <>
                  <Users size={14} className="text-yellow-400" /> ¡VICTORIA EN DÚO (40% + 40%)!
                </>
              ) : (
                <>
                  <Sparkles size={14} /> ¡HA GANADO UN JUGADOR!
                </>
              )}
            </div>

            {/* Live Supabase badge */}
            <div className="inline-flex items-center gap-1.5 bg-emerald-950/70 border border-emerald-500/50 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold text-emerald-300 shadow">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>🔥 Supabase En Vivo para Todos los Jugadores</span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-fredoka font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 tracking-tight leading-tight drop-shadow-md">
            ¡HA GANADO EL JUGADOR {announcement.winnerName.toUpperCase()}!
          </h2>

          {/* Duo Partner Banner if Duo Win */}
          {announcement.isDuoWin && announcement.duoPartnerName && (
            <div className="w-full bg-gradient-to-r from-amber-950/90 via-purple-950/90 to-amber-950/90 border border-yellow-400/60 rounded-2xl p-3 my-2 text-center shadow-lg">
              <div className="flex items-center justify-center gap-2 text-xs font-fredoka font-bold text-yellow-300">
                <Users size={15} />
                <span>Jugaron en Pareja / Dúo Oficial</span>
              </div>
              <p className="text-[11px] text-slate-200 mt-1">
                Como jugaron en Dúo, el 80% en juego se reparte a la mitad:{" "}
                <strong>40% para {announcement.winnerName}</strong> y{" "}
                <strong>40% para su compañero {announcement.duoPartnerName}</strong>.
              </p>
            </div>
          )}

          {/* Winner Email & Details */}
          <div className="flex items-center justify-center gap-2 mt-1.5 flex-wrap">
            <span className="text-xs sm:text-sm font-mono font-bold bg-slate-950 border border-amber-500/40 text-amber-300 px-3 py-1 rounded-full shadow">
              ✉️ {announcement.winnerEmail}
            </span>
            {announcement.claimedAt && (
              <span className="text-xs text-slate-300 font-mono bg-slate-950/80 border border-slate-800 px-2.5 py-1 rounded-full">
                ⏰ {announcement.claimedAt}
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-amber-200/90 font-medium mt-2">
            {announcement.isSelf
              ? announcement.isDuoWin
                ? `¡Felicitaciones! Has cantado bingo en Dúo. Te llevas tu 40% y tu compañero ${announcement.duoPartnerName || "amigo"} se lleva el otro 40%.`
                : "¡Felicitaciones! Has cantado bingo jugando en SOLO. Te llevas el 80% completo de la plata en juego."
              : announcement.isSelfPartner
              ? `¡Tu compañero de Dúo ${announcement.winnerName} cantó Bingo! Como jugaban en pareja, se repartieron las ganancias y recibiste tu 40%.`
              : `¡El jugador ${announcement.winnerName} completó la figura oficial y cantó Bingo en la sala!`}
          </p>

          {/* Info Grid Card */}
          <div className="w-full bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 my-3 flex flex-col gap-2.5 text-left">
            <div className="flex items-center justify-between text-xs sm:text-sm border-b border-slate-800 pb-2">
              <span className="text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-yellow-400" />
                Figura Ganadora:
              </span>
              <span className="font-fredoka font-bold text-yellow-300">
                {announcement.patternName}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm border-b border-slate-800 pb-2">
              <span className="text-slate-400">Cartón Premiado:</span>
              <span className="font-mono font-bold text-amber-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                Cartón #{announcement.cartonId}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm border-b border-slate-800 pb-2">
              <span className="text-slate-400">Balota de la Cantada:</span>
              <span className="font-fredoka font-black text-yellow-300 flex items-center gap-1">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 inline-flex items-center justify-center text-xs font-black">
                  {announcement.winningBallLetter}
                </span>
                #{announcement.winningBall}
              </span>
            </div>

            {/* Breakdown of Duo 40%/40% vs Solo 80% */}
            {announcement.isDuoWin ? (
              <div className="bg-slate-900/90 rounded-xl p-3 border border-amber-500/30 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-fredoka font-bold text-yellow-300">
                  <span className="flex items-center gap-1.5">
                    <Users size={14} className="text-amber-400" />
                    Reparto en Dúo (80% del Pozo):
                  </span>
                  <span className="text-emerald-400 font-mono">
                    Total: {((announcement.winnerPrizeVES || announcement.prizeAmount) * 2).toFixed(2)} VES
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800">
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex flex-col">
                    <span className="text-slate-400">Ganador ({announcement.winnerName}):</span>
                    <span className="font-bold text-emerald-400 font-mono text-xs">
                      +{(announcement.winnerPrizeVES || announcement.prizeAmount).toFixed(2)} VES (40%)
                    </span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex flex-col">
                    <span className="text-slate-400">Compañero ({announcement.duoPartnerName || "Dúo"}):</span>
                    <span className="font-bold text-emerald-400 font-mono text-xs">
                      +{(announcement.duoPartnerPrizeVES || announcement.prizeAmount).toFixed(2)} VES (40%)
                    </span>
                  </div>
                </div>
                <div className="text-[10px] text-amber-200/90 bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg text-center mt-1">
                  💡 <strong>Ganancia asegurada:</strong> Si alguno abandona el dúo tras la partida, el 40% ya acreditado permanece 100% intacto en su saldo. La salida del dúo aplica exclusivamente para la próxima partida.
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-400">Premio de la Plata en Juego:</span>
                  <span className="font-fredoka font-black text-emerald-400 text-base">
                    +{announcement.prizeAmount.toFixed(2)} VES
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 bg-emerald-950/70 border border-emerald-500/50 p-2 rounded-xl">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span><strong>¡Acreditación Automática!</strong> La plata en juego ya fue sumada a tu cuenta de Bingo el Chamo.</span>
                </div>
              </div>
            )}

            {/* Cartons returned to store badge */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-amber-300 bg-amber-950/60 border border-yellow-500/40 p-2 rounded-xl text-center">
              <span>🏪 <strong>Todos los cartones han vuelto a la tienda</strong> para que compres cartones nuevos en la siguiente ronda.</span>
            </div>

            <div className="text-[11px] text-slate-400 italic text-center pt-1 border-t border-slate-900">
              Regla de la Sala: Cada partida se gana una sola vez. ¡Felicidades por tu victoria!
            </div>

            {/* Missed Opportunity Warning if applicable */}
            {announcement.missedBalls > 0 && (
              <div className="mt-1 p-2.5 bg-orange-950/60 border border-orange-500/50 rounded-xl text-xs text-orange-200 flex items-start gap-2">
                <AlertTriangle size={16} className="text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Advertencia de bola pasada:</span>{" "}
                  La figura se había completado {announcement.missedBalls}{" "}
                  {announcement.missedBalls === 1 ? "bola" : "bolas"} atrás.
                  ¡En el Bingo oficial debes cantar inmediatamente para no dejar pasar la ganancia!
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action Footer - Always visible & pinned */}
        <div className="w-full p-3.5 sm:p-4 bg-slate-950/95 border-t border-amber-500/30 flex flex-col gap-2 backdrop-blur-md shadow-2xl shrink-0">
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
            {/* BOTÓN VOLVER AL LOBBY */}
            <button
              type="button"
              onClick={handleReturnToLobbyClick}
              className="w-full sm:flex-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-fredoka font-black py-3 px-4 rounded-2xl shadow-xl shadow-yellow-500/25 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer text-sm sm:text-base border border-yellow-200"
            >
              <Home size={19} className="stroke-[2.5]" />
              <span>Volver al Lobby</span>
            </button>

            {onNewGame && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNewGame();
                }}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-amber-300 font-fredoka font-bold py-3 px-4 rounded-2xl border border-amber-500/40 flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer text-xs sm:text-sm whitespace-nowrap"
              >
                <RotateCcw size={15} /> Iniciar Nueva Partida
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-xs font-medium py-1 transition cursor-pointer text-center"
          >
            Permanecer en la sala
          </button>
        </div>
      </div>
    </div>
  );
};
