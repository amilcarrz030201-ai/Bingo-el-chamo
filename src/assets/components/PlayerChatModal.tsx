import React, { useState, useEffect, useRef } from "react";
import { UserProfile, ChatMessage, DuoTeam } from "../types";
import {
  MessageSquare,
  Send,
  X,
  Smile,
  Sparkles,
  Users,
  ShieldCheck,
  Crown,
  MapPin,
  Zap,
  UserPlus,
  UserCheck,
  HeartHandshake,
  CheckCircle2,
  Info,
  Clock,
  Calendar,
} from "lucide-react";
import {
  subscribeToChatMessages,
  sendMessageToSupabase,
  purgeSundayHistoryFromSupabase,
  getLatestSundayMidnight,
} from "../supabase";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  friendEmails?: string[];
  activeDuo?: DuoTeam | null;
  onAddFriend?: (email: string) => void;
  onRemoveFriend?: (email: string) => void;
  onInviteDuo?: (email: string, name: string, avatar?: string) => void;
  onOpenDuoModal?: () => void;
}

const QUICK_PHRASES = [
  "🍀 ¡Buena suerte a todos!",
  "🔥 ¡Qué buena partida!",
  "😱 ¡Me falta solo un número!",
  "🎉 ¡Casi canto BINGO!",
  "👏 ¡Felicidades al ganador!",
  "🎱 ¡Canta el número Chamo!",
  "💪 ¡Vamos por ese premio!",
];

const LOCAL_STORAGE_CHAT_KEY = "chamo_player_chat_messages_v2";

/**
 * Calculates the next upcoming Sunday 00:00:00 AM timestamp.
 */
export function getNextSundayMidnight(now: Date = new Date()): number {
  const d = new Date(now);
  const day = d.getDay();
  const daysUntilNextSunday = day === 0 ? 7 : 7 - day;
  d.setDate(d.getDate() + daysUntilNextSunday);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export const PlayerChatModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUser,
  friendEmails = [],
  activeDuo,
  onAddFriend,
  onRemoveFriend,
  onInviteDuo,
  onOpenDuoModal,
}) => {
  const [selectedSender, setSelectedSender] = useState<{
    name: string;
    email: string;
    avatar?: string;
    badge?: string;
    role?: string;
  } | null>(null);

  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const cutoff = getLatestSundayMidnight();
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CHAT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed.filter((m) => {
            if (m.role === "ADMIN" && m.id.startsWith("msg-welcome")) return true;
            const t = new Date(m.timestamp).getTime();
            return !isNaN(t) && t >= cutoff;
          });
          if (valid.length > 0) return valid;
        }
      }
    } catch {}
    return [
      {
        id: "msg-welcome-1",
        senderEmail: "admin@bingoelchamo.com",
        senderName: "Bingo el Chamo Oficial",
        senderAvatar: "👑",
        role: "ADMIN",
        text: "¡Bienvenidos al Chat de Jugadores! Los mensajes se borran automáticamente los domingos a las 00:00 AM en tiempo real.",
        timestamp: new Date().toISOString(),
        badge: "Oficial",
      },
      {
        id: "msg-init-2",
        senderEmail: "carlos.soloq@gmail.com",
        senderName: "Carlos SoloQ",
        senderAvatar: "🧢",
        role: "PLAYER",
        text: "¡Buenas noches a todos! Preparado con mis cartones para la próxima ronda 🍀",
        timestamp: new Date().toISOString(),
        badge: "Chamo Competidor SoloQ",
      },
    ];
  });

  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll down when messages change or modal opens
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => scrollToBottom(false), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom(true);
    }
  }, [messages.length, isOpen]);

  // Real-time Supabase onSnapshot Listener & Sunday Purge
  // Sincroniza instantáneamente todos los dispositivos móviles y navegadores al enviar mensajes
  useEffect(() => {
    // 1. Escuchar mensajes en tiempo real desde Supabase
    const unsubscribe = subscribeToChatMessages((liveMessages) => {
      setMessages(liveMessages);
      try {
        localStorage.setItem(LOCAL_STORAGE_CHAT_KEY, JSON.stringify(liveMessages));
      } catch {}
    });

    // 2. Temporizador para verificar el borrado automático de cada domingo a las 00:00 AM (medianoche)
    const checkSundayPurge = () => {
      const cutoff = getLatestSundayMidnight();
      setMessages((prev) => {
        const hasExpired = prev.some((m) => {
          if (m.role === "ADMIN" && m.id.startsWith("msg-welcome")) return false;
          const t = typeof m.createdAt === "number" ? m.createdAt : new Date(m.timestamp).getTime();
          return !isNaN(t) && t < cutoff;
        });

        if (hasExpired) {
          // Ejecutar purga física en Supabase para no dejar mensajes antiguos
          purgeSundayHistoryFromSupabase().catch(() => {});
          const kept = prev.filter((m) => {
            if (m.role === "ADMIN" && m.id.startsWith("msg-welcome")) return true;
            const t = typeof m.createdAt === "number" ? m.createdAt : new Date(m.timestamp).getTime();
            return !isNaN(t) && t >= cutoff;
          });

          setFeedbackToast("🧹 Historial borrado: Se cumplió el reinicio de domingo a media noche");
          setTimeout(() => setFeedbackToast(null), 5000);
          return kept;
        }
        return prev;
      });
    };

    checkSundayPurge();
    const interval = setInterval(checkSundayPurge, 3000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  // Determine user category badge
  const getUserBadge = (): string => {
    const wins = currentUser.stats?.victorias ?? currentUser.stats?.bingos ?? 0;
    if (currentUser.role === "ADMIN") return "Administrador";
    if (wins >= 20) return "👑 Top Global (20+)";
    if (wins >= 10) return "📍 Top Regional (10-19)";
    if (wins >= 1) return "⚡ Chamo Competidor SoloQ (1-9)";
    return "Jugador";
  };

  // Send message - Sincronizado en tiempo real a Supabase con marca de tiempo precisa
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isSending) return;

    setIsSending(true);
    const now = new Date();
    const safeMsgId = `msg_${now.getTime()}_${Math.floor(Math.random() * 10000)}`;

    const newMsg: ChatMessage = {
      id: safeMsgId,
      senderEmail: currentUser.email,
      senderName: currentUser.name || currentUser.email.split("@")[0],
      senderAvatar:
        currentUser.avatar || (currentUser.gender === "FEMALE" ? "👗" : "🧢"),
      role: currentUser.role,
      text: text.slice(0, 500),
      timestamp: now.toISOString(),
      createdAt: now.getTime(),
      badge: getUserBadge(),
    };

    // Actualización optimista inmediata
    setMessages((prev) => {
      if (prev.some((m) => m.id === newMsg.id)) return prev;
      const updated = [...prev, newMsg];
      try {
        localStorage.setItem(LOCAL_STORAGE_CHAT_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setInputMessage("");

    // Enviar a Supabase (sincroniza en tiempo real a todos los dispositivos)
    try {
      await sendMessageToSupabase(newMsg);
    } catch (err) {
      console.error("Error guardando mensaje en Supabase:", err);
    }

    // Opcionalmente notificar también al servidor Node para consistencia en memoria
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderEmail: newMsg.senderEmail,
          senderName: newMsg.senderName,
          senderAvatar: newMsg.senderAvatar,
          role: newMsg.role,
          text: newMsg.text,
          badge: newMsg.badge,
        }),
      });
    } catch {} finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-sky-500/50 rounded-3xl w-full max-w-lg h-[620px] max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 p-4 border-b border-sky-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/50 flex items-center justify-center text-sky-300 shadow">
              <MessageSquare size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-fredoka text-base sm:text-lg font-bold text-sky-200">
                  Chat de Jugadores
                </h2>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Supabase en Vivo
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Sincronización en tiempo real en todos los dispositivos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Instant Phrases Bar */}
        <div className="p-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0 pl-1">
            Rápido:
          </span>
          {QUICK_PHRASES.map((phrase, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(phrase)}
              className="bg-slate-850 hover:bg-sky-900/60 text-slate-200 hover:text-sky-200 border border-slate-700 hover:border-sky-500/50 text-[11px] px-2.5 py-1 rounded-xl whitespace-nowrap transition cursor-pointer active:scale-95 shadow-sm"
            >
              {phrase}
            </button>
          ))}
        </div>

        {/* Sunday 00:00 AM Auto-Clean Real-time Banner */}
        <div className="bg-gradient-to-r from-amber-950/50 via-slate-900 to-sky-950/40 border-b border-amber-500/25 px-3 py-1.5 flex items-center justify-between text-[11px] text-amber-200/95 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-yellow-400 shrink-0" />
            <span>Sincronizado con Supabase: Marca de tiempo en cada mensaje y <strong>se borran cada domingo a las 00:00 AM</strong>.</span>
          </div>
          <span className="font-mono text-yellow-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/40 text-[10px] flex items-center gap-1">
            <Calendar size={11} className="text-yellow-400" />
            Reinicio: Domingo 00:00 AM
          </span>
        </div>

        {/* Discovery Hint Banner */}
        <div className="bg-sky-950/40 border-b border-sky-500/20 px-3 py-1.5 flex items-center gap-1.5 text-[10px] text-sky-300">
          <Sparkles size={12} className="text-yellow-400 shrink-0" />
          <span>
            <strong>Tip:</strong> Toca el nombre de cualquier jugador para <strong>Agregar Amigo</strong> o <strong>Jugar en Dúo (40%/40%)</strong>.
          </span>
        </div>

        {/* Temporary floating feedback notification */}
        {feedbackToast && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-emerald-950/95 border border-emerald-400 text-emerald-200 px-3.5 py-2 rounded-2xl text-xs font-fredoka font-bold shadow-2xl flex items-center gap-2 animate-in fade-in backdrop-blur-md">
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
            <span>{feedbackToast}</span>
          </div>
        )}

        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative">
          {messages.map((msg) => {
            const isMe =
              currentUser.email &&
              msg.senderEmail.toLowerCase().trim() ===
                currentUser.email.toLowerCase().trim();

            const timeInfo = (() => {
              try {
                const date =
                  typeof msg.createdAt === "number"
                    ? new Date(msg.createdAt)
                    : new Date(msg.timestamp);
                if (isNaN(date.getTime())) return { short: "", full: "" };
                const short = date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const full = date.toLocaleString([], {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                });
                return { short, full };
              } catch {
                return { short: "", full: "" };
              }
            })();

            const isPartner = Boolean(
              activeDuo &&
              (activeDuo.player1Email.toLowerCase() === msg.senderEmail.toLowerCase() ||
               activeDuo.player2Email.toLowerCase() === msg.senderEmail.toLowerCase())
            );

            const isFriend = friendEmails.some(
              (e) => e.toLowerCase() === msg.senderEmail.toLowerCase()
            );

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 items-start max-w-[88%] ${
                  isMe ? "self-end flex-row-reverse" : "self-start"
                }`}
              >
                {/* Sender Avatar - Clickable if not me */}
                <button
                  type="button"
                  onClick={() => {
                    if (!isMe) {
                      setSelectedSender({
                        name: msg.senderName,
                        email: msg.senderEmail,
                        avatar: msg.senderAvatar,
                        badge: msg.badge,
                        role: msg.role,
                      });
                    }
                  }}
                  disabled={isMe}
                  className={`w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden text-sm shadow transition ${
                    !isMe
                      ? "hover:ring-2 hover:ring-yellow-400 hover:border-yellow-400 cursor-pointer active:scale-95"
                      : ""
                  }`}
                  title={!isMe ? `Toca para agregar a ${msg.senderName} o invitar a dúo` : undefined}
                >
                  {msg.senderAvatar &&
                  (msg.senderAvatar.startsWith("data:") ||
                    msg.senderAvatar.startsWith("http")) ? (
                    <img
                      src={msg.senderAvatar}
                      alt={msg.senderName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{msg.senderAvatar || "👤"}</span>
                  )}
                </button>

                {/* Message Content Bubble */}
                <div
                  className={`flex flex-col gap-1 p-3 rounded-2xl shadow-md ${
                    isMe
                      ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 rounded-tr-none border border-yellow-300"
                      : msg.role === "ADMIN"
                      ? "bg-purple-950/80 border border-purple-500/60 text-purple-100 rounded-tl-none"
                      : "bg-slate-800/90 border border-slate-700 text-slate-100 rounded-tl-none"
                  }`}
                >
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Clickable Sender Name if not current user */}
                    {isMe ? (
                      <span className="text-xs font-fredoka font-bold text-slate-950">
                        Tú
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedSender({
                            name: msg.senderName,
                            email: msg.senderEmail,
                            avatar: msg.senderAvatar,
                            badge: msg.badge,
                            role: msg.role,
                          })
                        }
                        className={`text-xs font-fredoka font-bold flex items-center gap-1 transition cursor-pointer hover:underline ${
                          msg.role === "ADMIN"
                            ? "text-purple-300 hover:text-purple-200"
                            : "text-sky-300 hover:text-yellow-300"
                        }`}
                        title="Toca para agregar amigo o jugar en dúo"
                      >
                        <span>{msg.senderName}</span>
                        {isPartner && (
                          <span className="bg-yellow-400 text-slate-950 text-[9px] px-1 py-0.2 rounded font-mono font-black" title="Tu compañero de Dúo actual">
                            DÚO
                          </span>
                        )}
                        {isFriend && !isPartner && (
                          <span className="text-emerald-400 text-[10px]" title="Amigo">
                            ★
                          </span>
                        )}
                      </button>
                    )}

                    {msg.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                          isMe
                            ? "bg-slate-950 text-yellow-300"
                            : msg.role === "ADMIN"
                            ? "bg-purple-900 text-purple-200 border border-purple-400/50"
                            : "bg-slate-900 text-slate-300 border border-slate-700"
                        }`}
                      >
                        {msg.badge}
                      </span>
                    )}

                    {/* Short Timestamp with Clock */}
                    <span
                      className={`text-[10px] ml-auto font-mono flex items-center gap-1 font-semibold ${
                        isMe ? "text-amber-950 font-bold" : "text-sky-300"
                      }`}
                      title={`Marca de tiempo: ${timeInfo.full}`}
                    >
                      <Clock size={10} className="shrink-0" />
                      {timeInfo.short}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-sans break-words leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </p>

                  {/* Detailed timestamp badge on each message */}
                  {timeInfo.full && (
                    <div
                      className={`text-[9px] font-mono flex items-center justify-end gap-1 pt-0.5 border-t border-black/10 opacity-75 ${
                        isMe ? "text-amber-950/80" : "text-slate-400"
                      }`}
                      title="Marca de tiempo registrada en Supabase"
                    >
                      <span>{timeInfo.full}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Selected Sender Action Popup (Agregar Amigo / Jugar en Dúo) */}
        {selectedSender && (
          <div className="p-3.5 bg-slate-950/95 border-t-2 border-amber-500/70 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-yellow-400 via-amber-500 to-yellow-300 p-0.5 shadow flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-sm">
                    {selectedSender.avatar && (selectedSender.avatar.startsWith("data:") || selectedSender.avatar.startsWith("http")) ? (
                      <img src={selectedSender.avatar} alt={selectedSender.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{selectedSender.avatar || "👤"}</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-fredoka font-bold text-sm text-yellow-300">
                      {selectedSender.name}
                    </h4>
                    {selectedSender.badge && (
                      <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                        {selectedSender.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {selectedSender.email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSender(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                title="Cerrar opciones"
              >
                <X size={18} />
              </button>
            </div>

            {/* Action Buttons: JUGAR EN DÚO & AGREGAR AMIGO */}
            {selectedSender.role === "ADMIN" ? (
              <div className="bg-purple-950/60 border border-purple-500/30 rounded-xl p-2.5 text-center text-xs text-purple-200">
                👑 Este usuario es el Administrador Oficial del sistema.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {/* JUGAR EN DÚO BUTTON */}
                {activeDuo &&
                (activeDuo.player1Email.toLowerCase() === selectedSender.email.toLowerCase() ||
                 activeDuo.player2Email.toLowerCase() === selectedSender.email.toLowerCase()) ? (
                  <div className="bg-amber-500/20 border border-amber-400/50 rounded-xl p-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-yellow-300 font-fredoka font-bold">
                      <Users size={16} className="text-yellow-400" />
                      <span>👥 Ya es tu Compañero de Dúo Actual (40% / 40%)</span>
                    </div>
                  </div>
                ) : onInviteDuo ? (
                  <button
                    type="button"
                    onClick={() => {
                      onInviteDuo(selectedSender.email, selectedSender.name, selectedSender.avatar);
                      setFeedbackToast(`¡Invitaste a ${selectedSender.name} a jugar en Dúo (40% / 40%)!`);
                      setTimeout(() => setFeedbackToast(null), 4000);
                      setSelectedSender(null);
                    }}
                    className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-fredoka font-black py-2.5 px-3 rounded-xl shadow-lg flex items-center justify-between text-xs transition active:scale-98 cursor-pointer border border-yellow-300"
                    title="Invitar a formar Dúo en la partida"
                  >
                    <div className="flex items-center gap-2">
                      <HeartHandshake size={17} className="text-slate-950" />
                      <div className="text-left">
                        <span className="block font-bold">Jugar en Dúo (40% / 40%)</span>
                        <span className="text-[10px] text-amber-950/90 font-mono font-medium block">
                          Si cualquiera gana, se reparten 40% y 40% del dinero en juego
                        </span>
                      </div>
                    </div>
                    <span className="bg-slate-950 text-yellow-300 font-mono text-[10px] px-2 py-1 rounded-lg font-bold">
                      Invitar 👥
                    </span>
                  </button>
                ) : null}

                {/* AGREGAR AMIGO BUTTON */}
                <div className="flex items-center gap-2">
                  {friendEmails.some((e) => e.toLowerCase() === selectedSender.email.toLowerCase()) ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (onRemoveFriend) onRemoveFriend(selectedSender.email);
                        setFeedbackToast(`Quitaste a ${selectedSender.name} de tus amigos.`);
                        setTimeout(() => setFeedbackToast(null), 3000);
                        setSelectedSender(null);
                      }}
                      className="flex-1 bg-slate-900 hover:bg-red-950/60 text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-700/60 py-2 px-3 rounded-xl text-xs font-fredoka font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                    >
                      <UserCheck size={14} className="text-emerald-400" />
                      <span>Ya es tu amigo (Quitar)</span>
                    </button>
                  ) : onAddFriend ? (
                    <button
                      type="button"
                      onClick={() => {
                        onAddFriend(selectedSender.email);
                        setFeedbackToast(`¡Añadiste a ${selectedSender.name} a tus amigos!`);
                        setTimeout(() => setFeedbackToast(null), 3000);
                        setSelectedSender(null);
                      }}
                      className="flex-1 bg-purple-900/90 hover:bg-purple-800 text-purple-100 border border-purple-500/50 py-2 px-3 rounded-xl text-xs font-fredoka font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow"
                    >
                      <UserPlus size={14} className="text-purple-300" />
                      <span>Agregar como Amigo</span>
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => setSelectedSender(null)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 px-3 rounded-xl text-xs font-fredoka font-bold transition cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Escribe un mensaje a otros jugadores..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            maxLength={300}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 transition"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim() || isSending}
            className="bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:to-indigo-400 disabled:opacity-50 text-white font-fredoka font-bold text-xs p-2.5 rounded-2xl flex items-center justify-center transition cursor-pointer shadow active:scale-95 shrink-0"
            title="Enviar mensaje"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
