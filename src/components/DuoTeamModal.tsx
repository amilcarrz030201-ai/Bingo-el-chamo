import React, { useState } from "react";
import { DuoTeam, DuoInvitation, OnlinePlayer, UserProfile } from "../types";
import {
  Users,
  UserPlus,
  ShieldCheck,
  Sparkles,
  X,
  UserX,
  Check,
  Send,
  Trophy,
  Info,
  HeartHandshake,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  activeDuo: DuoTeam | null;
  pendingInvite: DuoInvitation | null;
  onlinePlayers: OnlinePlayer[];
  friendEmails: string[];
  plataEnJuego: number;
  onSendInvite: (targetEmail: string, targetName: string, targetAvatar?: string) => void;
  onAcceptInvite: (invite: DuoInvitation) => void;
  onDeclineInvite: () => void;
  onLeaveDuo: () => void;
}

export const DuoTeamModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUser,
  activeDuo,
  pendingInvite,
  onlinePlayers,
  friendEmails,
  plataEnJuego,
  onSendInvite,
  onAcceptInvite,
  onDeclineInvite,
  onLeaveDuo,
}) => {
  const [manualEmail, setManualEmail] = useState("");
  const [invitedFeedback, setInvitedFeedback] = useState<string | null>(null);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);

  if (!isOpen) return null;

  const currentEmail = currentUser.email.toLowerCase();

  // Find partner in active duo
  const partner = activeDuo
    ? activeDuo.player1Email.toLowerCase() === currentEmail
      ? {
          name: activeDuo.player2Name,
          email: activeDuo.player2Email,
          avatar: activeDuo.player2Avatar,
        }
      : {
          name: activeDuo.player1Name,
          email: activeDuo.player1Email,
          avatar: activeDuo.player1Avatar,
        }
    : null;

  const handleManualInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = manualEmail.trim().toLowerCase();
    if (!clean) return;
    if (clean === currentEmail) {
      alert("¡No puedes invitarte a ti mismo!");
      return;
    }

    const found = onlinePlayers.find((p) => p.email.toLowerCase() === clean);
    const targetName = found ? found.name : clean.split("@")[0];
    onSendInvite(clean, targetName, found?.avatar);
    setInvitedFeedback(`¡Invitación a Dúo enviada a ${clean}!`);
    setManualEmail("");
    setTimeout(() => setInvitedFeedback(null), 4000);
  };

  const handleInvitePlayer = (p: OnlinePlayer) => {
    onSendInvite(p.email, p.name, p.avatar);
    setInvitedFeedback(`¡Invitación enviada a ${p.name}!`);
    setTimeout(() => setInvitedFeedback(null), 4000);
  };

  // 40% and 80% calculations
  const totalPot = Number(plataEnJuego) || 0;
  const prizeSolo80 = totalPot * 0.8;
  const prizeDuo40 = totalPot * 0.4;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/60 border-2 border-amber-500/60 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-100 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center shadow-lg font-black text-xl">
              <Users size={24} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-fredoka font-black text-yellow-300 flex items-center gap-2">
                Modo Dúos (Jugar en Pareja)
                <span className="text-[10px] bg-amber-500/20 text-yellow-400 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                  40% / 40%
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Invita a tus amigos y si gana cualquiera de los dos, ¡se reparten el premio!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Feedback message */}
        {invitedFeedback && (
          <div className="bg-emerald-950 border border-emerald-500 text-emerald-200 text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2 animate-in fade-in">
            <Sparkles size={14} className="text-yellow-400 shrink-0" />
            <span className="font-fredoka font-bold">{invitedFeedback}</span>
          </div>
        )}

        {/* Incoming Invite Notification Banner if any */}
        {pendingInvite && !partner && (
          <div className="bg-gradient-to-r from-amber-950 via-purple-950 to-slate-900 border-2 border-yellow-400 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-3 text-left">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-yellow-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-lg border border-yellow-300">
                {pendingInvite.fromAvatar ? (
                  <span>{pendingInvite.fromAvatar}</span>
                ) : (
                  <HeartHandshake size={24} />
                )}
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-yellow-400">
                  ¡Te han invitado a jugar en Dúo!
                </span>
                <h4 className="text-sm font-fredoka font-bold text-white">
                  {pendingInvite.fromName} ({pendingInvite.fromEmail})
                </h4>
                <p className="text-[11px] text-slate-300">
                  Si juegan juntos y uno canta Bingo, se reparten 40% y 40% de la plata en juego.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => onAcceptInvite(pendingInvite)}
                className="flex-1 sm:flex-initial bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-fredoka font-black text-xs px-4 py-2 rounded-xl shadow-lg transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check size={14} /> Aceptar Dúo
              </button>
              <button
                onClick={onDeclineInvite}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-fredoka font-bold text-xs px-3 py-2 rounded-xl transition cursor-pointer"
              >
                Rechazar
              </button>
            </div>
          </div>
        )}

        {/* Explanatory Rule Comparison Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Card Modo Dúo */}
          <div
            className={`p-3.5 rounded-2xl border transition ${
              partner
                ? "bg-amber-950/40 border-yellow-400/80 ring-2 ring-amber-400/30"
                : "bg-slate-950/80 border-slate-800"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-yellow-400" />
                <span className="text-xs font-fredoka font-black text-yellow-300">
                  Jugando en DÚO (40% / 40%)
                </span>
              </div>
              {partner && (
                <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full">
                  ACTIVO
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Juegas con tu amigo. Si <strong>cualquiera de los dos gana</strong> la partida, la ganancia se reparte en:
            </p>
            <div className="mt-2 flex items-center justify-between bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono font-bold">
              <span className="text-amber-400">40% para ti</span>
              <span className="text-slate-500">+</span>
              <span className="text-amber-400">40% para tu amigo</span>
            </div>
            <div className="text-[10px] text-slate-400 text-right mt-1 font-mono">
              Premio actual por persona: <strong>{prizeDuo40.toFixed(2)} VES</strong>
            </div>
          </div>

          {/* Card Modo Solo */}
          <div
            className={`p-3.5 rounded-2xl border transition ${
              !partner
                ? "bg-slate-950/90 border-emerald-500/60 ring-2 ring-emerald-500/20"
                : "bg-slate-950/50 border-slate-800 opacity-70"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-emerald-400" />
                <span className="text-xs font-fredoka font-black text-emerald-300">
                  Jugando en SOLO (80%)
                </span>
              </div>
              {!partner && (
                <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full">
                  ACTIVO
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Juegas individualmente sin pareja. Si cantas Bingo, ¡te llevas el <strong>80% completo</strong> de la plata en juego!
            </p>
            <div className="mt-2 flex items-center justify-between bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono font-bold">
              <span className="text-emerald-400">80% todo para el ganador</span>
            </div>
            <div className="text-[10px] text-slate-400 text-right mt-1 font-mono">
              Premio actual individual: <strong>{prizeSolo80.toFixed(2)} VES</strong>
            </div>
          </div>
        </div>

        {/* Current Active Duo Status */}
        {partner ? (
          <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/70 border-2 border-yellow-400/70 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 p-0.5 shadow-lg border border-yellow-200 overflow-hidden flex items-center justify-center shrink-0">
                  {partner.avatar ? (
                    <span>{partner.avatar}</span>
                  ) : (
                    <Users size={22} className="text-slate-950" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] bg-yellow-400 text-slate-950 font-black px-2 py-0.5 rounded-md uppercase">
                    👥 Tu Compañero de Dúo
                  </span>
                  <h3 className="text-base font-fredoka font-black text-yellow-300 mt-0.5">
                    {partner.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">{partner.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {!confirmLeaveOpen ? (
                  <button
                    onClick={() => setConfirmLeaveOpen(true)}
                    className="w-full sm:w-auto bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800 px-3 py-2 rounded-xl text-xs font-fredoka font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    title="Abandonar dúo para la próxima partida"
                  >
                    <UserX size={14} /> Salir del Dúo (Para Próxima Partida)
                  </button>
                ) : (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        setConfirmLeaveOpen(false);
                        onLeaveDuo();
                      }}
                      className="bg-red-600 hover:bg-red-500 text-white font-fredoka font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition cursor-pointer shadow-lg active:scale-95"
                    >
                      <Check size={14} /> Confirmar Salida
                    </button>
                    <button
                      onClick={() => setConfirmLeaveOpen(false)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-fredoka font-bold px-3 py-2 rounded-xl text-xs transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Informative Guarantee Banner: Earnings already won in duo are 100% retained */}
            <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-3 text-left flex items-start gap-2.5">
              <ShieldCheck size={18} className="text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 leading-relaxed">
                <span className="font-bold text-yellow-300">Garantía de Ganancias en Dúo:</span>{" "}
                Si ya ganaron una partida en dúo, el <strong>40% acreditado ya es tuyo de forma definitiva y no se te descuenta</strong> bajo ningún concepto. Salir del dúo es exclusivamente para la <strong>próxima partida</strong>, en la que volverás a competir de manera individual por el <strong>80% completo</strong> del pozo.
              </div>
            </div>
          </div>
        ) : (
          /* Form & List to Invite Partner */
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-fredoka font-bold text-slate-200 flex items-center gap-2">
                <UserPlus size={15} className="text-amber-400" />
                Invitar a un Amigo para Formar Dúo
              </h3>
              <span className="text-[10px] text-slate-400">
                {friendEmails.length} amigos guardados
              </span>
            </div>

            {/* Quick Email Form */}
            <form onSubmit={handleManualInvite} className="flex gap-2">
              <input
                type="email"
                placeholder="Escribe el correo de tu amigo (ej: pana@gmail.com)..."
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-amber-300 outline-none focus:border-amber-500 flex-1 font-mono"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-fredoka font-black flex items-center gap-1.5 shadow transition cursor-pointer shrink-0"
              >
                <Send size={13} /> Invitar
              </button>
            </form>

            {/* Available Friends & Players list */}
            <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
              {onlinePlayers.filter((p) => p.email.toLowerCase() !== currentEmail).length === 0 ? (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center text-xs text-slate-400">
                  No hay otros amigos conectados en este momento. Puedes invitar escribiendo el correo arriba.
                </div>
              ) : (
                onlinePlayers
                  .filter((p) => p.email.toLowerCase() !== currentEmail)
                  .map((player) => {
                    const isFriend = friendEmails.includes(player.email.toLowerCase());
                    return (
                      <div
                        key={player.id}
                        className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 hover:border-amber-500/40 flex items-center justify-between gap-2 transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-sm font-bold text-yellow-300 shrink-0">
                            {player.avatar ? (
                              <span>{player.avatar}</span>
                            ) : (
                              "👤"
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-fredoka font-bold text-yellow-300 truncate">
                                {player.name}
                              </span>
                              {isFriend && (
                                <span className="text-[9px] bg-purple-950 text-purple-300 border border-purple-800 px-1 rounded font-bold">
                                  Amigo
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono truncate">
                              {player.email}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleInvitePlayer(player)}
                          className="bg-amber-500/20 hover:bg-amber-500/30 text-yellow-300 border border-amber-500/50 hover:border-amber-400 px-3 py-1.5 rounded-lg text-xs font-fredoka font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer shrink-0"
                        >
                          <UserPlus size={12} /> Invitar a Dúo
                        </button>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-2 text-[11px] text-slate-400">
          <Info size={15} className="text-yellow-400 shrink-0" />
          <span>
            En modo Dúo se reparte 40% y 40% entre la pareja de ganadores. Si juegas Solo, te llevas el 80% completo del dinero en juego automáticamente.
          </span>
        </div>
      </div>
    </div>
  );
};
