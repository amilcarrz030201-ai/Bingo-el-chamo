import React, { useEffect } from "react";
import { UserProfile, CharacterModel, DuoTeam, TorneoBilletalConfig } from "../types";
import { OFFICIAL_WHATSAPP } from "../constants/contact";
import { BINGO_LOGO_SRC } from "../constants/logo";
import { ChristmasLights } from "./ChristmasLights";
import {
  Menu,
  X,
  MessageSquare,
  MessageCircle,
  Shirt,
  Trophy,
  BarChart3,
  HelpCircle,
  Camera,
  LogOut,
  Wallet,
  PlusCircle,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Info,
  Award,
  Users,
  HeartHandshake,
  Bell,
  Lock,
  Receipt,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  userBalance: number;
  activeCharacter: CharacterModel;
  unreadChatCount: number;
  activeDuo?: DuoTeam | null;
  onOpenDuoModal?: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
  torneoConfig?: TorneoBilletalConfig;
  onOpenTorneoBilletal?: () => void;
  onOpenChat: () => void;
  onOpenCharacterSelect: () => void;
  onOpenHowToWin: () => void;
  onOpenTopRankings: () => void;
  onOpenStats: () => void;
  onOpenHelp: () => void;
  onOpenTransactionHistory?: () => void;
  onOpenProfile: () => void;
  onOpenRecharge: () => void;
  onLogout: () => void;
}

export const PlayerSideDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  user,
  userBalance,
  activeCharacter,
  unreadChatCount,
  activeDuo,
  onOpenDuoModal,
  onOpenNotifications,
  unreadNotificationsCount = 0,
  torneoConfig,
  onOpenTorneoBilletal,
  onOpenChat,
  onOpenCharacterSelect,
  onOpenHowToWin,
  onOpenTopRankings,
  onOpenStats,
  onOpenHelp,
  onOpenTransactionHistory,
  onOpenProfile,
  onOpenRecharge,
  onLogout,
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock background scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const userWins = user.stats?.victorias ?? user.stats?.bingos ?? 0;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Side Drawer Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menú lateral de navegación"
        className={`fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[380px] max-w-full bg-slate-900 border-l-2 border-amber-500/40 shadow-2xl flex flex-col transition-transform duration-300 ease-out transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Glow decorative gradients */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-0 w-56 h-56 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* 1. Header of the Side Menu with Christmas Lights */}
        <div className="bg-slate-950/90 border-b border-amber-500/30 p-4 sm:p-5 flex flex-col relative z-10 shrink-0 overflow-hidden">
          <ChristmasLights count={16} compact={true} className="-mt-3 mb-2" />
          <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-400 to-amber-600 p-0.5 shadow-md border border-amber-300 flex items-center justify-center shrink-0">
              <img
                src={BINGO_LOGO_SRC}
                alt="Logo Bingo"
                className="w-full h-full object-cover rounded-[10px]"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <Menu size={16} className="text-amber-400" />
                <h2 className="font-fredoka text-base sm:text-lg font-bold text-yellow-300">
                  Menú Lateral
                </h2>
              </div>
              <span className="text-[11px] text-slate-400 font-sans block">
                Bingo el Chamo • Opciones rápidas
              </span>
            </div>
          </div>

          {/* Close 'X' Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 flex items-center justify-center transition cursor-pointer active:scale-95 shadow"
            title="Cerrar menú lateral"
          >
            <X size={18} />
          </button>
          </div>
        </div>

        {/* 2. User Profile Summary Banner */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40 relative z-10 shrink-0">
          <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenProfile();
                }}
                className="relative group cursor-pointer"
                title="Cambiar foto de perfil"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-yellow-400 to-amber-600 p-0.5 overflow-hidden flex items-center justify-center shadow">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || "Perfil"}
                      className="w-full h-full object-cover rounded-[10px]"
                    />
                  ) : (
                    <span className="text-base font-fredoka font-bold text-slate-950">
                      {(user.name || user.email).charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-0.5 rounded-full border border-slate-950 shadow">
                  <Camera size={10} />
                </div>
              </button>

              <div className="min-w-0">
                <p className="font-fredoka font-bold text-sm text-yellow-300 truncate">
                  {user.name || "Jugador"}
                </p>
                <p className="text-[11px] text-slate-400 font-mono truncate">{user.email}</p>
                <span className="text-[10px] text-amber-400/90 font-mono flex items-center gap-1 mt-0.5">
                  <Award size={11} className="text-amber-400" />
                  {userWins} {userWins === 1 ? "Victoria" : "Victorias"}
                </span>
              </div>
            </div>

            {/* Saldo + Quick Recharge */}
            <div className="flex flex-col items-end shrink-0">
              <div className="text-right">
                <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">
                  Saldo en Cuenta
                </span>
                <span className="font-fredoka text-sm font-black text-emerald-300 font-mono">
                  {userBalance.toFixed(2)} VES
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRecharge();
                }}
                className="mt-1 bg-emerald-700 hover:bg-emerald-600 text-white font-fredoka text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 transition active:scale-95 shadow cursor-pointer"
                title="Recargar saldo vía Pago Móvil"
              >
                <PlusCircle size={11} />
                <span>Recargar</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Main Navigation List (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 relative z-10 overscroll-contain">
          {/* Section: Funciones Principales Solicitadas */}
          <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400/80 font-bold px-1 flex items-center gap-1.5">
            <Sparkles size={11} className="text-amber-400" />
            <span>Opciones Principales</span>
          </div>

          {/* ITEM TORNEO BILLETAL PARA BINGO EL CHAMO (HABILITADO / USUARIOS CERRADOS) */}
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenTorneoBilletal) onOpenTorneoBilletal();
            }}
            className={`w-full rounded-2xl p-3.5 flex items-center justify-between gap-3 text-left transition group cursor-pointer shadow-xl active:scale-[0.98] ${
              torneoConfig?.isEnabled
                ? "bg-gradient-to-r from-amber-950 via-yellow-950/80 to-amber-900 border-2 border-yellow-400 hover:border-yellow-300 ring-2 ring-yellow-400/30"
                : "bg-gradient-to-r from-slate-950 via-slate-900 to-red-950/50 border border-red-500/40 hover:border-red-400/70"
            }`}
            title={
              torneoConfig?.isEnabled
                ? "🏆 Torneo Billetal ACTIVO. ¡Toca para inscribirte o jugar!"
                : "🔒 Torneo Billetal: CERRADO a usuarios por administración"
            }
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-lg shrink-0 group-hover:scale-105 transition font-black border ${
                  torneoConfig?.isEnabled
                    ? "bg-gradient-to-tr from-yellow-400 via-amber-500 to-yellow-600 text-slate-950 border-yellow-200 shadow-yellow-500/40 animate-pulse"
                    : "bg-slate-900 text-slate-400 border-red-500/40"
                }`}
              >
                {torneoConfig?.isEnabled ? (
                  <Trophy size={22} className="text-slate-950" />
                ) : (
                  <Lock size={20} className="text-red-400" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`font-fredoka font-black text-sm truncate ${
                      torneoConfig?.isEnabled
                        ? "text-yellow-300 group-hover:text-white"
                        : "text-slate-300 group-hover:text-red-200"
                    }`}
                  >
                    {torneoConfig?.isEnabled ? "Torneo Billetal" : "Torneo Billetal"}
                  </span>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-black uppercase tracking-wider shrink-0 ${
                      torneoConfig?.isEnabled
                        ? "bg-emerald-500 text-slate-950 border border-emerald-300 shadow-emerald-500/50 animate-pulse"
                        : "bg-red-950 text-red-300 border border-red-500/60"
                    }`}
                  >
                    {torneoConfig?.isEnabled ? "🟢 ACTIVO" : "🔒 USUARIOS CERRADOS"}
                  </span>
                </div>
                <p
                  className={`text-[11px] truncate mt-0.5 ${
                    torneoConfig?.isEnabled ? "text-amber-200" : "text-slate-400"
                  }`}
                >
                  {torneoConfig?.isEnabled
                    ? `Pozo: ${(torneoConfig?.prizeVES || 15000).toLocaleString()} VES · Toca para entrar`
                    : "Acceso cerrado temporalmente por la Administración"}
                </p>
              </div>
            </div>
            <ChevronRight
              size={18}
              className={`shrink-0 transition group-hover:translate-x-1 ${
                torneoConfig?.isEnabled ? "text-yellow-300" : "text-slate-500"
              }`}
            />
          </button>

          {/* ITEM CAMPANITA DE NOTIFICACIONES */}
          {onOpenNotifications && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenNotifications();
              }}
              className="w-full bg-gradient-to-r from-amber-950/80 via-slate-900 to-yellow-950/70 hover:from-amber-900/80 hover:to-yellow-900/70 border border-amber-500/50 hover:border-yellow-400 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-left transition group cursor-pointer shadow-lg active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center text-slate-950 shadow shrink-0 group-hover:scale-105 transition font-black relative">
                  <Bell size={20} className={unreadNotificationsCount > 0 ? "animate-bounce" : ""} />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border-2 border-slate-900" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-fredoka font-bold text-sm text-yellow-300 group-hover:text-white">
                      Notificaciones
                    </span>
                    {unreadNotificationsCount > 0 && (
                      <span className="bg-red-600 text-white text-[10px] font-mono px-2 py-0.5 rounded-full font-bold animate-pulse">
                        {unreadNotificationsCount} nuevas
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Avisos de pagos acreditados, invitaciones y solicitudes
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-amber-400 group-hover:translate-x-1 transition shrink-0" />
            </button>
          )}

          {/* ITEM DÚOS: JUGAR EN PAREJA (40% / 40%) */}
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenDuoModal) onOpenDuoModal();
            }}
            className="w-full bg-gradient-to-r from-amber-950/80 via-slate-900 to-purple-950/80 hover:from-amber-900/80 hover:to-purple-900/80 border border-amber-500/50 hover:border-yellow-400 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-left transition group cursor-pointer shadow-lg active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-500 flex items-center justify-center text-slate-950 shadow shrink-0 group-hover:scale-105 transition font-black">
                <Users size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-fredoka font-bold text-sm text-yellow-300 group-hover:text-white">
                    Modo Dúos (Parejas)
                  </span>
                  <span className="bg-amber-500/30 text-yellow-300 border border-yellow-400/40 text-[9px] font-mono px-1.5 py-0.2 rounded font-bold">
                    40% / 40%
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {activeDuo
                    ? `Dúo Activo: ${activeDuo.player1Email.toLowerCase() === user.email.toLowerCase() ? activeDuo.player2Name : activeDuo.player1Name}`
                    : "Si uno gana, se reparten 40% y 40%. Solo: 80%"}
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-500 group-hover:text-yellow-300 transition" />
          </button>

          {/* ITEM 1: CHAT */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenChat();
            }}
            className="w-full bg-gradient-to-r from-sky-950/80 via-slate-900 to-slate-950 hover:from-sky-900/80 hover:to-slate-900 border border-sky-500/40 hover:border-sky-400 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-left transition group cursor-pointer shadow-lg active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow shrink-0 group-hover:scale-105 transition">
                <MessageSquare size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-fredoka font-bold text-sm text-sky-200 group-hover:text-white">
                    Chat en Vivo
                  </span>
                  {unreadChatCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                      {unreadChatCount} nuevo{unreadChatCount > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  Conversa con otros jugadores en la sala
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-500 group-hover:text-sky-300 transition" />
          </button>

          {/* ITEM 2: SOPORTE */}
          <a
            href={OFFICIAL_WHATSAPP.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 hover:from-emerald-900/80 hover:to-slate-900 border border-emerald-500/40 hover:border-emerald-400 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-left transition group cursor-pointer shadow-lg active:scale-[0.98]"
            title="Abrir WhatsApp oficial de soporte 04245389992"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 shadow shrink-0 group-hover:scale-105 transition">
                <MessageCircle size={20} className="fill-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-fredoka font-bold text-sm text-emerald-300 group-hover:text-white">
                    Soporte Oficial
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono px-1.5 py-0.2 rounded font-bold">
                    WhatsApp 24/7
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  {OFFICIAL_WHATSAPP.phoneFormatted} • Atención directa
                </p>
              </div>
            </div>
            <ExternalLink size={17} className="text-emerald-400 group-hover:text-white transition" />
          </a>

          {/* ITEM 3: MUÑECO */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenCharacterSelect();
            }}
            className="w-full bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-950 hover:from-purple-900/80 hover:to-slate-900 border border-purple-500/40 hover:border-purple-400 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-left transition group cursor-pointer shadow-lg active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow shrink-0 group-hover:scale-105 transition">
                <Shirt size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-fredoka font-bold text-sm text-purple-200 group-hover:text-white">
                    Muñeco / Personaje
                  </span>
                  <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[9px] font-mono px-1.5 py-0.2 rounded font-bold">
                    {activeCharacter.gender === "MALE" ? "Varón 🧢" : "Hembra 👗"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Equipado: <strong className="text-yellow-300">{activeCharacter.name}</strong> • Vestidor 3D
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-500 group-hover:text-purple-300 transition" />
          </button>

          {/* ITEM 4: CÓMO GANAR */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenHowToWin();
            }}
            className="w-full bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-950 hover:from-amber-900/80 hover:to-slate-900 border border-amber-500/40 hover:border-amber-400 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-left transition group cursor-pointer shadow-lg active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center text-slate-950 shadow shrink-0 group-hover:scale-105 transition font-fredoka font-black text-lg">
                ⭐
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-fredoka font-bold text-sm text-yellow-300 group-hover:text-white">
                    ¿Cómo Ganar?
                  </span>
                  <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 text-[9px] font-mono px-1.5 py-0.2 rounded font-bold">
                    Reglas Oficiales
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Líneas, Cuadrito, 4 Esquinas y Cartón Lleno
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-500 group-hover:text-yellow-300 transition" />
          </button>

          {/* ITEM 5: TOP ESTADÍSTICAS */}
          <div className="bg-slate-950/90 border border-amber-500/40 rounded-2xl p-3 shadow-lg flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 shadow shrink-0">
                  <Trophy size={16} />
                </div>
                <div>
                  <span className="font-fredoka font-bold text-sm text-yellow-300 block">
                    Top Estadísticas
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Podio y ranking semanal de la sala
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenTopRankings();
                }}
                className="bg-amber-500/20 hover:bg-amber-500/30 text-yellow-300 border border-amber-500/40 py-2 px-2.5 rounded-xl text-xs font-fredoka font-bold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 shadow"
                title="Ver el podio semanal de ganadores"
              >
                <Trophy size={13} className="text-yellow-400" />
                <span>Podio Semanal</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenStats();
                }}
                className="bg-slate-900 hover:bg-slate-800 text-yellow-300 border border-slate-700 py-2 px-2.5 rounded-xl text-xs font-fredoka font-bold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 shadow"
                title="Ver mis estadísticas de juego"
              >
                <BarChart3 size={13} className="text-amber-400" />
                <span>Mis Estadísticas</span>
              </button>
            </div>
          </div>

          {/* ITEM 6: HISTORIAL DE TRANSACCIONES */}
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenTransactionHistory) onOpenTransactionHistory();
            }}
            className="w-full bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-950 hover:from-amber-900/70 hover:to-slate-900 border border-amber-500/40 hover:border-amber-400 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-left transition group cursor-pointer shadow-lg active:scale-[0.98]"
            title="Ver compras, recargas, retiros y premios"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center text-slate-950 shadow shrink-0 group-hover:scale-105 transition">
                <Receipt size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-fredoka font-bold text-sm text-yellow-300 group-hover:text-white">
                    Historial de Transacciones
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Compras de cartones, recargas, retiros y premios
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-500 group-hover:text-yellow-300 transition" />
          </button>

          {/* Section: Utilidades adicionales */}
          <div className="pt-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold px-1 mb-2">
              Utilidades & Ajustes
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Reglas del Juego */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenHelp();
                }}
                className="bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 p-2.5 rounded-xl text-xs font-fredoka font-bold flex items-center gap-2 transition cursor-pointer"
                title="Manual y preguntas frecuentes"
              >
                <HelpCircle size={15} className="text-sky-400" />
                <span>Reglas / Ayuda</span>
              </button>

              {/* Mi Foto */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenProfile();
                }}
                className="bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 p-2.5 rounded-xl text-xs font-fredoka font-bold flex items-center gap-2 transition cursor-pointer"
                title="Cambiar foto de perfil"
              >
                <Camera size={15} className="text-amber-400" />
                <span>Mi Foto Perfil</span>
              </button>

              {/* Salir de la Cuenta */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="col-span-2 bg-red-950/40 hover:bg-red-900/60 text-rose-300 border border-red-900/60 p-2.5 rounded-xl text-xs font-fredoka font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                title="Cerrar sesión de forma segura"
              >
                <LogOut size={15} className="text-rose-400" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4. Footer of the Side Menu */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800/80 text-center relative z-10 shrink-0">
          <p className="text-[11px] text-slate-500 font-mono flex items-center justify-center gap-1">
            <Info size={12} className="text-amber-400" />
            Bingo el Chamo • Venezuela 2026
          </p>
        </div>
      </aside>
    </>
  );
};
