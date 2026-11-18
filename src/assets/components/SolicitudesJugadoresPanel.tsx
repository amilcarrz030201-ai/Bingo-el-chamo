import React, { useState, useEffect, useMemo } from "react";
import { UserProfile, RegisteredUser } from "../types";
import {
  Users,
  UserPlus,
  UserCheck,
  Search,
  Sparkles,
  Send,
  ShieldCheck,
  Check,
  X,
  Clock,
  HeartHandshake,
  UserMinus,
  Mail,
  Flame,
} from "lucide-react";
import { sendNotificationToSupabase } from "../supabase";
import { isBotAccount } from "../data/communityUsers";

interface Props {
  currentUser: UserProfile;
  registeredUsers: RegisteredUser[];
  friendEmails: string[];
  onAddFriend: (email: string) => void;
  onRemoveFriend: (email: string) => void;
  onInviteDuo?: (email: string, name: string, avatar?: string) => void;
  onOpenDuoModal?: () => void;
}

export const SolicitudesJugadoresPanel: React.FC<Props> = ({
  currentUser,
  registeredUsers,
  friendEmails,
  onAddFriend,
  onRemoveFriend,
  onInviteDuo,
  onOpenDuoModal,
}) => {
  const [activeTab, setActiveTab] = useState<"todos" | "solicitudes" | "amigos">("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [newFriendEmail, setNewFriendEmail] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. Sent friend requests state (persisted)
  const [sentRequests, setSentRequests] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("chamo_sent_friend_reqs_v1");
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  // 2. Received friend requests state (persisted)
  const [receivedRequests, setReceivedRequests] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("chamo_received_friend_reqs_v1");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Clean out any legacy mock bots like Mariana
          return parsed.filter((e: string) => !isBotAccount(e));
        }
      }
    } catch {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem("chamo_sent_friend_reqs_v1", JSON.stringify(sentRequests));
    } catch {}
  }, [sentRequests]);

  useEffect(() => {
    try {
      localStorage.setItem("chamo_received_friend_reqs_v1", JSON.stringify(receivedRequests));
    } catch {}
  }, [receivedRequests]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Enviar solicitud de amistad
  const handleSendRequest = async (targetUser: RegisteredUser) => {
    const targetEmail = targetUser.email.toLowerCase().trim();
    if (targetEmail === currentUser.email.toLowerCase().trim()) return;

    if (friendEmails.includes(targetEmail)) {
      showToast("Ya eres amigo de este jugador.");
      return;
    }

    if (sentRequests.includes(targetEmail)) {
      showToast("Ya le has enviado una solicitud a este jugador.");
      return;
    }

    // Add to sent requests
    setSentRequests((prev) => [...prev, targetEmail]);

    // Send notification to Supabase
    try {
      await sendNotificationToSupabase({
        id: `friend_req_${Date.now()}`,
        recipientEmail: targetEmail,
        senderEmail: currentUser.email,
        senderName: currentUser.name || currentUser.email.split("@")[0],
        senderAvatar: currentUser.avatar || "👤",
        type: "FRIEND_REQUEST",
        title: "Nueva Solicitud de Amistad",
        message: `${currentUser.name || currentUser.email} te ha enviado una solicitud de amistad en Bingo el Chamo.`,
        createdAt: Date.now(),
        read: false,
        data: {
          friendEmail: currentUser.email,
          friendName: currentUser.name,
          friendAvatar: currentUser.avatar,
          status: "PENDING",
        },
      });
    } catch {}

    showToast(`✉️ Solicitud de amistad enviada a ${targetUser.name || targetEmail}.`);
  };

  // Cancelar solicitud enviada
  const handleCancelRequest = (targetEmail: string) => {
    setSentRequests((prev) => prev.filter((e) => e !== targetEmail.toLowerCase()));
    showToast("Solicitud cancelada.");
  };

  // Aceptar solicitud de amistad
  const handleAcceptRequest = async (senderEmail: string, senderName?: string) => {
    const cleanEmail = senderEmail.toLowerCase().trim();
    onAddFriend(cleanEmail);

    // Remove from received requests
    setReceivedRequests((prev) => prev.filter((e) => e !== cleanEmail));

    // Send notification confirmation
    try {
      await sendNotificationToSupabase({
        id: `friend_accept_${Date.now()}`,
        recipientEmail: cleanEmail,
        senderEmail: currentUser.email,
        senderName: currentUser.name || currentUser.email.split("@")[0],
        senderAvatar: currentUser.avatar || "👤",
        type: "SYSTEM",
        title: "¡Solicitud Aceptada!",
        message: `${currentUser.name || currentUser.email} aceptó tu solicitud de amistad. ¡Ahora son amigos!`,
        createdAt: Date.now(),
        read: false,
      });
    } catch {}

    showToast(`🎉 ¡Ahora eres amigo de ${senderName || cleanEmail}! Ya pueden jugar en Dúo.`);
  };

  // Rechazar solicitud de amistad
  const handleRejectRequest = (senderEmail: string) => {
    const cleanEmail = senderEmail.toLowerCase().trim();
    setReceivedRequests((prev) => prev.filter((e) => e !== cleanEmail));
    showToast("Solicitud de amistad declinada.");
  };

  // Agregar directamente por correo
  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newFriendEmail.trim().toLowerCase();
    if (!clean) return;
    if (clean === currentUser.email.toLowerCase()) {
      showToast("¡No puedes añadirte a ti mismo como amigo!");
      return;
    }
    if (friendEmails.includes(clean)) {
      showToast("Este jugador ya está en tu lista de amigos.");
      return;
    }

    // Find if user exists in registered list
    const found = registeredUsers.find((u) => u.email.toLowerCase() === clean);
    if (found) {
      handleSendRequest(found);
    } else {
      // Direct send request
      setSentRequests((prev) => [...prev, clean]);
      showToast(`✉️ Solicitud enviada a ${clean}.`);
    }
    setNewFriendEmail("");
  };

  // Filter list of genuine registered users (strictly excluding bots & admin)
  const genuineUsers = useMemo(() => {
    return registeredUsers.filter((p) => {
      if (!p || !p.email) return false;
      if (isBotAccount(p.email, p.id)) return false;
      if ((p as any).role === "ADMIN" || p.email.toLowerCase().trim() === "admin@bingoelchamo.com") return false;
      return true;
    });
  }, [registeredUsers]);

  const myFriends = useMemo(() => {
    return genuineUsers.filter((p) => friendEmails.includes(p.email.toLowerCase().trim()));
  }, [genuineUsers, friendEmails]);

  const displayList = useMemo(() => {
    return genuineUsers.filter((p) => {
      // Don't show myself
      if (p.email.toLowerCase().trim() === currentUser.email.toLowerCase().trim()) return false;

      const cleanEmail = p.email.toLowerCase().trim();
      const isFriend = friendEmails.includes(cleanEmail);
      const isReceived = receivedRequests.includes(cleanEmail);
      const isSent = sentRequests.includes(cleanEmail);

      if (activeTab === "amigos" && !isFriend) return false;
      if (activeTab === "solicitudes" && !isReceived && !isSent) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
      }
      return true;
    });
  }, [genuineUsers, currentUser.email, friendEmails, receivedRequests, sentRequests, activeTab, searchQuery]);

  return (
    <div className="bg-slate-900/95 border-2 border-amber-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4 relative overflow-hidden">
      {/* Ambient background decoration */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-950 border border-emerald-400 text-emerald-200 text-xs px-3.5 py-2.5 rounded-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 shadow-lg z-20">
          <Sparkles size={15} className="text-yellow-400 shrink-0 animate-spin" />
          <span className="font-fredoka">{toastMessage}</span>
        </div>
      )}

      {/* Header Bar: "Solicitudes" Window */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-yellow-400 via-amber-500 to-amber-600 p-0.5 shadow-lg border border-yellow-200 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-yellow-300">
              <Users size={22} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-fredoka text-base sm:text-lg font-black text-yellow-300 uppercase tracking-wide">
                Solicitudes
              </h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 font-mono">
                <ShieldCheck size={11} className="text-emerald-400" /> Jugadores Registrados
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Personas registradas en la app. Envíales o acéptales solicitudes de amistad para ser amigos y jugar en Dúo.
            </p>
          </div>
        </div>

        {/* Global Stats Counter */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-xs bg-slate-950 text-slate-300 border border-slate-800 px-3 py-1 rounded-xl font-mono">
            Total: <strong className="text-yellow-300">{genuineUsers.length}</strong> {genuineUsers.length === 1 ? "persona registrada" : "personas registradas"}
          </span>
        </div>
      </div>

      {/* Tabs Selector: Todas las Personas / Solicitudes / Mis Amigos */}
      <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("todos")}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-fredoka font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === "todos"
              ? "bg-amber-500 text-slate-950 shadow"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Users size={14} />
          <span>Todos Registrados</span>
          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
            activeTab === "todos" ? "bg-slate-950 text-yellow-300" : "bg-slate-800 text-slate-300"
          }`}>
            {genuineUsers.filter((u) => u.email.toLowerCase().trim() !== currentUser.email.toLowerCase().trim()).length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("solicitudes")}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-fredoka font-bold flex items-center justify-center gap-1.5 transition cursor-pointer relative ${
            activeTab === "solicitudes"
              ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 shadow font-black"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <UserPlus size={14} />
          <span>Solicitudes</span>
          {(receivedRequests.length > 0 || sentRequests.length > 0) && (
            <span className={`text-[10px] font-mono font-black px-1.5 py-0.2 rounded-full ${
              receivedRequests.length > 0
                ? "bg-red-600 text-white animate-pulse"
                : activeTab === "solicitudes"
                ? "bg-slate-950 text-yellow-300"
                : "bg-slate-800 text-slate-300"
            }`}>
              {receivedRequests.length + sentRequests.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("amigos")}
          className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-fredoka font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === "amigos"
              ? "bg-emerald-600 text-white shadow"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <UserCheck size={14} />
          <span>Mis Amigos</span>
          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
            activeTab === "amigos" ? "bg-emerald-950 text-emerald-200" : "bg-slate-800 text-slate-300"
          }`}>
            {myFriends.length}
          </span>
        </button>
      </div>

      {/* Search Input & Quick Direct Add */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o correo de la persona..."
            className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-medium"
          />
        </div>

        {/* Direct Add by Email input */}
        <form onSubmit={handleManualAdd} className="flex gap-1.5 shrink-0">
          <div className="relative">
            <Mail size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              value={newFriendEmail}
              onChange={(e) => setNewFriendEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-44 bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-2 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-2 rounded-xl text-xs font-fredoka font-bold flex items-center gap-1 transition cursor-pointer active:scale-95 shadow"
            title="Enviar solicitud directamente por correo"
          >
            <Send size={13} />
            <span>Enviar</span>
          </button>
        </form>
      </div>

      {/* List of Registered Users / Friend Requests */}
      <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
        {displayList.length === 0 ? (
          <div className="bg-slate-950/60 rounded-2xl p-6 text-center border border-slate-800 flex flex-col items-center justify-center gap-2">
            <Users size={28} className="text-slate-600" />
            <p className="text-xs text-slate-300 font-medium">
              {activeTab === "amigos"
                ? "Aún no tienes amigos agregados. ¡Envía solicitudes a los jugadores registrados!"
                : activeTab === "solicitudes"
                ? "No tienes solicitudes pendientes en este momento."
                : "No se encontraron personas con ese nombre o correo."}
            </p>
            {activeTab !== "todos" && (
              <button
                type="button"
                onClick={() => setActiveTab("todos")}
                className="mt-1 text-xs text-amber-400 hover:underline font-fredoka font-bold"
              >
                Ver todos los usuarios registrados
              </button>
            )}
          </div>
        ) : (
          displayList.map((player) => {
            const cleanEmail = player.email.toLowerCase().trim();
            const isFriend = friendEmails.includes(cleanEmail);
            const hasReceived = receivedRequests.includes(cleanEmail);
            const hasSent = sentRequests.includes(cleanEmail);

            return (
              <div
                key={player.id || player.email}
                className={`p-3 sm:p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md ${
                  hasReceived
                    ? "bg-gradient-to-r from-amber-950/60 via-slate-950 to-slate-950 border-yellow-400/80 ring-1 ring-yellow-400/40"
                    : isFriend
                    ? "bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-950 border-emerald-500/40"
                    : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* User Info */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-yellow-400 to-amber-600 p-0.5 shadow flex items-center justify-center shrink-0 text-lg">
                      <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                        {player.avatar || "👤"}
                      </div>
                    </div>
                    {/* Online status indicator */}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                        player.isOnline !== false ? "bg-emerald-400" : "bg-slate-500"
                      }`}
                      title={player.isOnline !== false ? "En línea" : "Desconectado"}
                    />
                  </div>

                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-fredoka text-sm font-bold text-white">
                        {player.name}
                      </span>
                      {hasReceived && (
                        <span className="text-[9px] bg-yellow-500/20 text-yellow-300 border border-yellow-400/50 px-2 py-0.2 rounded-full font-bold animate-pulse">
                          🔔 Te envió solicitud
                        </span>
                      )}
                      {isFriend && (
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.2 rounded-full font-bold flex items-center gap-1 font-mono">
                          <Check size={10} /> Amigo
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-mono truncate max-w-[200px]">
                      {player.email}
                    </span>
                    {player.stats && (
                      <span className="text-[10px] text-amber-300 font-mono flex items-center gap-1 mt-0.5">
                        <Flame size={11} className="text-amber-400" />
                        {player.stats.victorias ?? player.stats.bingos ?? 0} victorias acumuladas
                      </span>
                    )}
                  </div>
                </div>

                {/* Friend Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                  {/* CASO 1: Recibiste una solicitud de esta persona */}
                  {hasReceived && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAcceptRequest(player.email, player.name)}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-fredoka font-black text-xs px-3.5 py-1.5 rounded-xl shadow-md border border-emerald-400 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                        title="Aceptar solicitud de amistad"
                      >
                        <Check size={14} />
                        <span>Aceptar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRejectRequest(player.email)}
                        className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-red-400 border border-slate-700 font-fredoka font-bold text-xs px-2.5 py-1.5 rounded-xl transition cursor-pointer"
                        title="Rechazar solicitud"
                      >
                        <X size={14} />
                        <span>Rechazar</span>
                      </button>
                    </div>
                  )}

                  {/* CASO 2: Ya son amigos */}
                  {!hasReceived && isFriend && (
                    <div className="flex items-center gap-1.5">
                      {onInviteDuo && (
                        <button
                          type="button"
                          onClick={() => onInviteDuo(player.email, player.name, player.avatar)}
                          className="bg-gradient-to-r from-purple-800 to-indigo-700 hover:from-purple-700 hover:to-indigo-600 text-white font-fredoka font-bold text-xs px-3 py-1.5 rounded-xl shadow border border-purple-400/50 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                          title="Invitar a jugar en Equipo Dúo (Reparto 40% / 40%)"
                        >
                          <HeartHandshake size={14} className="text-yellow-300" />
                          <span>Invitar Dúo</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onRemoveFriend(player.email)}
                        className="bg-slate-900 hover:bg-red-950/60 text-slate-400 hover:text-red-300 border border-slate-800 hover:border-red-800/60 p-1.5 rounded-xl transition cursor-pointer"
                        title="Eliminar de mi lista de amigos"
                      >
                        <UserMinus size={14} />
                      </button>
                    </div>
                  )}

                  {/* CASO 3: Ya le enviaste solicitud y está pendiente */}
                  {!hasReceived && !isFriend && hasSent && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-fredoka font-bold text-sky-300 bg-sky-950/80 border border-sky-500/50 px-2.5 py-1 rounded-xl flex items-center gap-1 shadow">
                        <Clock size={12} className="animate-spin text-sky-400" />
                        <span>Solicitud Enviada</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleCancelRequest(player.email)}
                        className="text-[10px] text-slate-400 hover:text-red-300 p-1 rounded hover:bg-slate-900 transition"
                        title="Cancelar solicitud enviada"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}

                  {/* CASO 4: No son amigos y no hay solicitud pendiente -> Enviar solicitud */}
                  {!hasReceived && !isFriend && !hasSent && (
                    <button
                      type="button"
                      onClick={() => handleSendRequest(player)}
                      className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-fredoka font-black text-xs px-3.5 py-1.5 rounded-xl shadow border border-yellow-200 flex items-center gap-1.5 transition active:scale-95 cursor-pointer hover:scale-[1.02]"
                      title={`Enviar solicitud de amistad a ${player.name}`}
                    >
                      <UserPlus size={14} className="text-slate-950" />
                      <span>Enviar Solicitud</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
