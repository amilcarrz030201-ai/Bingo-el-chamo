import React, { useState } from "react";
import {
  Bell,
  X,
  CheckCircle2,
  CheckCheck,
  CreditCard,
  Users,
  UserPlus,
  Trash2,
  Sparkles,
  Clock,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { AppNotification, NotificationType } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onAcceptDuoInvite?: (inviteId: string, fromEmail: string, fromName: string, fromAvatar?: string) => void;
  onRejectDuoInvite?: (inviteId: string) => void;
  onAcceptFriendRequest?: (friendEmail: string, friendName: string, friendAvatar?: string) => void;
  onRejectFriendRequest?: (notifId: string) => void;
  onOpenRecharge?: () => void;
}

export const NotificationsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onAcceptDuoInvite,
  onRejectDuoInvite,
  onAcceptFriendRequest,
  onRejectFriendRequest,
  onOpenRecharge,
}) => {
  const [activeTab, setActiveTab] = useState<"ALL" | "PAYMENT" | "INVITATION" | "FRIEND_REQUEST">("ALL");

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "ALL") return true;
    return n.type === activeTab;
  });

  const formatRelativeTime = (timestamp: number) => {
    const diffSeconds = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSeconds < 60) return "Hace un momento";
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Hace ${diffHours} h`;
    const date = new Date(timestamp);
    return date.toLocaleDateString("es-VE", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getBadgeStyle = (type: NotificationType) => {
    switch (type) {
      case "PAYMENT":
        return {
          icon: CreditCard,
          label: "Pago Acreditado",
          badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
          iconColor: "text-emerald-400",
          cardBorder: "border-emerald-500/40 hover:border-emerald-500/70",
          highlight: "from-emerald-950/40 via-slate-900 to-slate-950",
        };
      case "INVITATION":
        return {
          icon: Users,
          label: "Invitación Dúo",
          badgeBg: "bg-purple-500/20 text-purple-300 border-purple-500/40",
          iconColor: "text-purple-400",
          cardBorder: "border-purple-500/40 hover:border-purple-500/70",
          highlight: "from-purple-950/40 via-slate-900 to-slate-950",
        };
      case "FRIEND_REQUEST":
        return {
          icon: UserPlus,
          label: "Solicitud Amistad",
          badgeBg: "bg-sky-500/20 text-sky-300 border-sky-500/40",
          iconColor: "text-sky-400",
          cardBorder: "border-sky-500/40 hover:border-sky-500/70",
          highlight: "from-sky-950/40 via-slate-900 to-slate-950",
        };
      default:
        return {
          icon: Bell,
          label: "Sistema",
          badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
          iconColor: "text-amber-400",
          cardBorder: "border-slate-800 hover:border-slate-700",
          highlight: "from-slate-900 via-slate-900 to-slate-950",
        };
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notif-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="w-full max-w-xl bg-slate-900 border-2 border-amber-500/40 rounded-3xl shadow-2xl shadow-yellow-500/20 flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 p-4 sm:p-5 flex items-center justify-between text-slate-950 shrink-0 border-b border-amber-400/40 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-950/20 border border-slate-950/30 flex items-center justify-center text-slate-950 shadow-inner relative">
              <Bell size={22} className="animate-bounce" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-600 rounded-full border-2 border-amber-500" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="notif-modal-title" className="font-fredoka text-lg sm:text-xl font-black">
                  Notificaciones
                </h2>
                {unreadCount > 0 ? (
                  <span className="bg-red-600 text-white font-mono text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                    {unreadCount} nuevas
                  </span>
                ) : (
                  <span className="bg-slate-950/30 text-slate-900 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Al día
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-900/90 font-medium">
                Avisos de pagos acreditados, invitaciones y solicitudes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="hidden sm:flex items-center gap-1 text-[11px] font-fredoka font-black bg-slate-950/20 hover:bg-slate-950/30 px-2.5 py-1.5 rounded-xl transition cursor-pointer text-slate-950"
                title="Marcar todas como leídas"
              >
                <CheckCheck size={14} />
                <span>Marcar leídas</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-950/20 hover:bg-slate-950/40 flex items-center justify-center transition cursor-pointer text-slate-950"
              title="Cerrar"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-slate-950/80 p-2 sm:p-2.5 border-b border-slate-800 flex items-center justify-between gap-1 overflow-x-auto shrink-0 scrollbar-none">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-fredoka font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === "ALL"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Sparkles size={13} />
              <span>Todas</span>
              <span className="font-mono text-[10px] px-1.5 rounded-md bg-slate-950/30">
                {notifications.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("PAYMENT")}
              className={`px-3 py-1.5 rounded-xl text-xs font-fredoka font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === "PAYMENT"
                  ? "bg-emerald-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <CreditCard size={13} />
              <span>💰 Pagos</span>
              <span className="font-mono text-[10px] px-1.5 rounded-md bg-slate-950/30">
                {notifications.filter((n) => n.type === "PAYMENT").length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("INVITATION")}
              className={`px-3 py-1.5 rounded-xl text-xs font-fredoka font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === "INVITATION"
                  ? "bg-purple-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Users size={13} />
              <span>👥 Invitaciones</span>
              <span className="font-mono text-[10px] px-1.5 rounded-md bg-slate-950/30">
                {notifications.filter((n) => n.type === "INVITATION").length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("FRIEND_REQUEST")}
              className={`px-3 py-1.5 rounded-xl text-xs font-fredoka font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === "FRIEND_REQUEST"
                  ? "bg-sky-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <UserPlus size={13} />
              <span>👋 Amigos</span>
              <span className="font-mono text-[10px] px-1.5 rounded-md bg-slate-950/30">
                {notifications.filter((n) => n.type === "FRIEND_REQUEST").length}
              </span>
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllAsRead}
              className="sm:hidden text-[10px] font-fredoka text-amber-400 hover:text-yellow-300 underline shrink-0 px-2 cursor-pointer"
            >
              Leídas
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 sm:py-16 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-3xl bg-slate-800/50 border border-slate-700 flex items-center justify-center text-slate-500">
                <Bell size={32} />
              </div>
              <h3 className="font-fredoka text-base sm:text-lg font-bold text-slate-300">
                No hay notificaciones {activeTab !== "ALL" ? "en esta categoría" : ""}
              </h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Cuando se acredite un pago, te llegue una invitación a Dúo o una solicitud de amistad, la verás aquí en tiempo real.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const theme = getBadgeStyle(notif.type);
              const BadgeIcon = theme.icon;

              return (
                <div
                  key={notif.id}
                  onClick={() => !notif.read && onMarkAsRead(notif.id)}
                  className={`relative p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 bg-gradient-to-br ${
                    theme.highlight
                  } ${
                    notif.read ? "border-slate-800/80 opacity-80" : `${theme.cardBorder} shadow-lg ring-1 ring-amber-500/20`
                  }`}
                >
                  {/* Unread Glowing Dot */}
                  {!notif.read && (
                    <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse" />
                  )}

                  <div className="flex items-start gap-3">
                    {/* Left Icon or Sender Avatar */}
                    <div className="shrink-0 relative">
                      {notif.senderAvatar ? (
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 p-0.5 overflow-hidden flex items-center justify-center shadow">
                          {notif.senderAvatar.startsWith("data:") || notif.senderAvatar.startsWith("http") ? (
                            <img
                              src={notif.senderAvatar}
                              alt="Avatar"
                              className="w-full h-full object-cover rounded-[14px]"
                            />
                          ) : (
                            <span className="text-base">{notif.senderAvatar}</span>
                          )}
                        </div>
                      ) : (
                        <div
                          className={`w-10 h-10 rounded-2xl bg-slate-950/80 border border-slate-700 flex items-center justify-center ${theme.iconColor} shadow`}
                        >
                          <BadgeIcon size={20} />
                        </div>
                      )}
                    </div>

                    {/* Middle: Content */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${theme.badgeBg}`}
                        >
                          {theme.label}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Clock size={11} />
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>

                      <h4 className="font-fredoka text-sm sm:text-base font-bold text-white leading-tight">
                        {notif.title}
                      </h4>

                      <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-snug">
                        {notif.message}
                      </p>

                      {/* PAYMENT specific details */}
                      {notif.type === "PAYMENT" && notif.data?.amount && (
                        <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <ShieldCheck size={15} className="text-emerald-400 shrink-0" />
                            <span className="text-xs text-emerald-300 font-medium">
                              Monto acreditado:
                            </span>
                          </div>
                          <span className="font-fredoka font-black text-sm text-yellow-300 font-mono">
                            +{Number(notif.data.amount).toFixed(2)} VES
                          </span>
                        </div>
                      )}

                      {/* INVITATION specific actions */}
                      {notif.type === "INVITATION" && (
                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                          {notif.data?.status === "ACCEPTED" ? (
                            <span className="text-xs font-fredoka font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-600 px-3 py-1 rounded-xl flex items-center gap-1">
                              <CheckCircle2 size={13} /> Dúo Aceptado
                            </span>
                          ) : notif.data?.status === "REJECTED" ? (
                            <span className="text-xs text-slate-400 font-mono">Invitación rechazada</span>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAcceptDuoInvite?.(
                                    notif.data?.inviteId || notif.id,
                                    notif.senderEmail || "",
                                    notif.senderName || "Compañero",
                                    notif.senderAvatar
                                  );
                                  onMarkAsRead(notif.id);
                                }}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-fredoka font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                              >
                                <Users size={13} />
                                <span>Aceptar Dúo (40%/40%)</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRejectDuoInvite?.(notif.data?.inviteId || notif.id);
                                  onDeleteNotification(notif.id);
                                }}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-fredoka text-xs px-2.5 py-1.5 rounded-xl transition cursor-pointer"
                              >
                                Rechazar
                              </button>
                            </>
                          )}
                        </div>
                      )}

                      {/* FRIEND_REQUEST specific actions */}
                      {notif.type === "FRIEND_REQUEST" && (
                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                          {notif.data?.status === "ACCEPTED" ? (
                            <span className="text-xs font-fredoka font-bold text-sky-400 bg-sky-950/80 border border-sky-600 px-3 py-1 rounded-xl flex items-center gap-1">
                              <CheckCircle2 size={13} /> Amigo Agregado
                            </span>
                          ) : notif.data?.status === "REJECTED" ? (
                            <span className="text-xs text-slate-400 font-mono">Solicitud descartada</span>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAcceptFriendRequest?.(
                                    notif.data?.friendEmail || notif.senderEmail || "",
                                    notif.data?.friendName || notif.senderName || "Amigo",
                                    notif.data?.friendAvatar || notif.senderAvatar
                                  );
                                  onMarkAsRead(notif.id);
                                }}
                                className="bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white font-fredoka font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                              >
                                <UserPlus size={13} />
                                <span>Aceptar Solicitud</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRejectFriendRequest?.(notif.id);
                                  onDeleteNotification(notif.id);
                                }}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-fredoka text-xs px-2.5 py-1.5 rounded-xl transition cursor-pointer"
                              >
                                Rechazar
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: Delete Icon */}
                    <div className="shrink-0 flex flex-col items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNotification(notif.id);
                        }}
                        className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800/80 transition cursor-pointer"
                        title="Eliminar notificación"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-3 sm:p-4 border-t border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Sincronizado en tiempo real con Supabase</span>
          </div>

          {onOpenRecharge && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenRecharge();
              }}
              className="text-amber-400 hover:text-yellow-300 font-fredoka font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Recargar Saldo</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
