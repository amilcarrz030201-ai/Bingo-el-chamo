import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  UserProfile,
  BingoCard,
  HistoryRecord,
  OnlinePlayer,
  CharacterModel,
  RechargeRequest,
  WithdrawRequest,
  RegisteredUser,
  WonGameRecord,
  WinnerAnnouncement,
  DuoTeam,
  DuoInvitation,
  AppNotification,
} from "../types";
import { ALL_CHARACTERS } from "../data/characters";
import { getBallLetter } from "../utils/bingo";
import { audioEngine } from "../utils/audio";
import { MasterBoard } from "./MasterBoard";
import { WinningFiguresCard } from "./WinningFiguresCard";
import { WinningFiguresModal } from "./WinningFiguresModal";
import { CartonView } from "./CartonView";
import { BingoMascot } from "./BingoMascot";
import { SocialPlayersPanel } from "./SocialPlayersPanel";
import { CharacterSelectModal } from "./CharacterSelectModal";
import { TopRankingsModal } from "./TopRankingsModal";
import { TransactionHistoryModal } from "./TransactionHistoryModal";
import { SolicitudesJugadoresPanel } from "./SolicitudesJugadoresPanel";
import { PlayerPaymentStatusBanner } from "./PlayerPaymentStatusBanner";
import { CartonCatalogModal } from "./CartonCatalogModal";
import { LastWinnersList } from "./LastWinnersList";
import { DuoTeamModal } from "./DuoTeamModal";
import { NotificationsModal } from "./NotificationsModal";
import { ChristmasTree } from "./ChristmasTree";
import { ChristmasLights } from "./ChristmasLights";
import { ChristmasFestiveBanner, HangingBauble, ChristmasCornerGarland } from "./ChristmasOrnaments";
import { BINGO_LOGO_SRC } from "../constants/logo";
import { OFFICIAL_WHATSAPP } from "../constants/contact";
import {
  Wallet,
  Ticket,
  PlusCircle,
  ArrowDownRight,
  BarChart3,
  HelpCircle,
  LogOut,
  Sparkles,
  Users,
  Grid,
  ArrowLeft,
  ShoppingCart,
  ShoppingBag,
  Trophy,
  Shirt,
  Wand2,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Star,
  CheckCircle2,
  MessageCircle,
  MessageSquare,
  Coins,
  Menu,
  Camera,
  HeartHandshake,
  Clock,
  Eye,
  X,
  Bell,
  Maximize2,
} from "lucide-react";
import { ProfileModal } from "./ProfileModal";
import { PlayerChatModal } from "./PlayerChatModal";
import { PlayerSideDrawer } from "./PlayerSideDrawer";
import { TorneoBilletalModal } from "./TorneoBilletalModal";
import { TorneoBilletalConfig } from "../types";
import { subscribeToChatMessages } from "../supabase";

interface Props {
  user: UserProfile;
  activeCarton: BingoCard;
  purchasedCardIds: number[];
  drawnBalls: number[];
  history: HistoryRecord[];
  allCards: BingoCard[];
  roomCountdown: string;
  roomSeconds?: number;
  isRoomTimerPaused?: boolean;
  onlinePlayers: OnlinePlayer[];
  friendEmails: string[];
  registeredUsers?: RegisteredUser[];
  rechargeRequests?: RechargeRequest[];
  withdrawRequests?: WithdrawRequest[];
  currentWonGame?: WonGameRecord | null;
  wonGamesHistory?: WonGameRecord[];
  cartonPrice?: number;
  winnerAnnouncement?: WinnerAnnouncement | null;
  isGameCompleted?: boolean;
  plataEnJuego?: number;
  favoriteCardIds?: number[];
  onToggleFavorite?: (cartonId: number) => void;
  onToggleCell: (row: number, col: number, cartonId?: number) => void;
  onAutoDaub: (cartonId?: number) => void;
  onAutoDaubAll?: (cartonIds?: number[]) => void;
  onCheckBingo: (cartonId?: number) => void;
  onBuyCarton: (cartonId: number) => void;
  onSelectCartonId: (id: number) => void;
  onOpenRecharge: () => void;
  onOpenWithdraw: () => void;
  onOpenMyCartons: () => void;
  onOpenMusic?: () => void;
  onOpenStats: () => void;
  onOpenHelp: () => void;
  onLogout: () => void;
  onAddFriend: (email: string) => void;
  onRemoveFriend: (email: string) => void;
  activeDuo?: DuoTeam | null;
  pendingDuoInvite?: DuoInvitation | null;
  onInviteDuo?: (email: string, name: string, avatar?: string) => void;
  onAcceptDuoInvite?: (invite: DuoInvitation) => void;
  onDeclineDuoInvite?: () => void;
  onLeaveDuo?: () => void;
  onSelectCharacter?: (id: string) => void;
  onBuyCharacter?: (char: CharacterModel) => void;
  onUnlockByWins?: (char: CharacterModel) => void;
  drawIntervalSeconds?: number;
  onUpdateProfile?: (updates: {
    name?: string;
    avatar?: string;
    pagoMovilPhone?: string;
    pagoMovilBank?: string;
    pagoMovilId?: string;
  }) => void;
  currentBall?: number | null;
  notifications?: AppNotification[];
  onMarkNotificationAsRead?: (id: string) => void;
  onMarkAllNotificationsAsRead?: () => void;
  onDeleteNotification?: (id: string) => void;
  onAcceptFriendRequest?: (friendEmail: string, friendName: string, friendAvatar?: string) => void;
  onRejectFriendRequest?: (notifId: string) => void;
  torneoConfig?: TorneoBilletalConfig;
  onEnrollTorneo?: (cartonCount: number, totalAmount: number) => void;
  onEnterBattleArena?: () => void;
  isSpecialBall?: boolean;
  isWinningBall?: boolean;
  specialBallLabel?: string;
}

export const PlayerLobby: React.FC<Props> = ({
  user,
  activeCarton,
  purchasedCardIds,
  drawnBalls,
  currentBall,
  history,
  allCards,
  roomCountdown,
  roomSeconds = 1800,
  isRoomTimerPaused = false,
  onlinePlayers,
  friendEmails,
  registeredUsers = [],
  rechargeRequests = [],
  withdrawRequests = [],
  currentWonGame = null,
  wonGamesHistory = [],
  cartonPrice = 60,
  winnerAnnouncement = null,
  isGameCompleted = false,
  plataEnJuego = 0,
  drawIntervalSeconds = 4,
  isSpecialBall = false,
  isWinningBall = false,
  specialBallLabel,
  onUpdateProfile,
  favoriteCardIds = [],
  onToggleFavorite,
  onToggleCell,
  onAutoDaub,
  onAutoDaubAll,
  onCheckBingo,
  onBuyCarton,
  onSelectCartonId,
  onOpenRecharge,
  onOpenWithdraw,
  onOpenMyCartons,
  onOpenMusic,
  onOpenStats,
  onOpenHelp,
  onLogout,
  onAddFriend,
  onRemoveFriend,
  activeDuo = null,
  pendingDuoInvite = null,
  onInviteDuo,
  onAcceptDuoInvite,
  notifications = [],
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onDeleteNotification,
  onAcceptFriendRequest,
  onRejectFriendRequest,
  onDeclineDuoInvite,
  onLeaveDuo,
  onSelectCharacter,
  onBuyCharacter,
  onUnlockByWins,
  torneoConfig,
  onEnrollTorneo,
  onEnterBattleArena,
}) => {
  const [viewMode, setViewMode] = useState<"lobby" | "table">("lobby");
  const [quickCartonPick, setQuickCartonPick] = useState<number>(activeCarton.id);
  const [characterSelectOpen, setCharacterSelectOpen] = useState(false);
  const [topRankingsOpen, setTopRankingsOpen] = useState(false);
  const [duoModalOpen, setDuoModalOpen] = useState(false);
  const [cartonCatalogOpen, setCartonCatalogOpen] = useState(false);
  const [cartonCatalogTab, setCartonCatalogTab] = useState<"all" | "favorites">("all");
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [transactionHistoryOpen, setTransactionHistoryOpen] = useState(false);
  const [isTorneoModalOpen, setIsTorneoModalOpen] = useState(false);

  // Toggle for showing MasterBoard & Figures on table mode
  const [showTableBoard, setShowTableBoard] = useState(false);
  const [winningFiguresModalOpen, setWinningFiguresModalOpen] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
  const unreadNotificationsCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // Top header collapsed/expanded state (saved in localStorage)
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("chamo_header_collapsed_v1") === "true";
    } catch {
      return false;
    }
  });

  // Listen for Return to Lobby triggers from winner modal or global events
  useEffect(() => {
    const handleReturnToLobby = () => {
      setViewMode("lobby");
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.addEventListener("chamo_return_to_lobby", handleReturnToLobby);
    return () => {
      window.removeEventListener("chamo_return_to_lobby", handleReturnToLobby);
    };
  }, []);

  // Supabase Real-time Chat listener: Sincroniza contador de mensajes nuevos en todos los dispositivos
  useEffect(() => {
    let lastSeenCount = -1;
    const unsubscribe = subscribeToChatMessages((liveMessages) => {
      if (lastSeenCount === -1) {
        lastSeenCount = liveMessages.length;
        return;
      }
      if (!chatModalOpen && liveMessages.length > lastSeenCount) {
        const diff = liveMessages.length - lastSeenCount;
        setUnreadChatCount((prev) => prev + diff);
      }
      lastSeenCount = liveMessages.length;
    });

    return () => {
      unsubscribe();
    };
  }, [chatModalOpen]);

  // Real-time Called Ball Notifications:
  // - ACTIVATED when NOT on the game table (viewMode !== "table")
  // - DEACTIVATED automatically when entering the game table (viewMode === "table")
  const [calledBallNotification, setCalledBallNotification] = useState<{
    ball: number;
    letter: string;
    matchedCartonIds: number[];
  } | null>(null);

  const prevBallRef = useRef<number | null>(null);
  const prevDrawnCountRef = useRef<number>(drawnBalls.length);

  useEffect(() => {
    // When inside the game table: deactivate notifications completely
    if (viewMode === "table") {
      setCalledBallNotification(null);
      return;
    }

    // Determine the latest active ball
    const latestBall = currentBall || (drawnBalls.length > 0 ? drawnBalls[drawnBalls.length - 1] : null);

    if (
      latestBall &&
      (latestBall !== prevBallRef.current || drawnBalls.length > prevDrawnCountRef.current)
    ) {
      prevBallRef.current = latestBall;
      prevDrawnCountRef.current = drawnBalls.length;

      const letter = getBallLetter(latestBall);
      // Check which purchased cartons contain this called ball
      const matched = purchasedCardIds.filter((id) => {
        const c = allCards.find((card) => card.id === id);
        return c?.numeros.some((row) => row.some((cell) => cell.num === latestBall));
      });

      setCalledBallNotification({
        ball: latestBall,
        letter,
        matchedCartonIds: matched,
      });

      try {
        audioEngine.playBallDrawn(latestBall);
      } catch {}

      // Auto dismiss after 7 seconds
      const timer = setTimeout(() => {
        setCalledBallNotification((curr) => (curr?.ball === latestBall ? null : curr));
      }, 7000);

      return () => clearTimeout(timer);
    }
  }, [currentBall, drawnBalls, viewMode, purchasedCardIds, allCards]);

  const isMenuOpen = viewMode === "table" ? showTableMenu : !isHeaderCollapsed;

  const handleOpenMenu = () => {
    if (viewMode === "table") {
      setShowTableMenu(true);
    } else {
      setIsHeaderCollapsed(false);
      try {
        localStorage.setItem("chamo_header_collapsed_v1", "false");
      } catch {}
    }
  };

  const handleCloseMenu = () => {
    if (viewMode === "table") {
      setShowTableMenu(false);
    } else {
      setIsHeaderCollapsed(true);
      try {
        localStorage.setItem("chamo_header_collapsed_v1", "true");
      } catch {}
    }
  };

  const toggleHeaderCollapsed = () => {
    if (isMenuOpen) {
      handleCloseMenu();
    } else {
      handleOpenMenu();
    }
  };

  const userBalance = user.balance ?? 0.0;
  const userWins = user.stats?.victorias ?? user.stats?.bingos ?? 0;

  // Active character resolution
  const defaultCharId = user.gender === "FEMALE" ? "chama-glam" : "chamo-urbano";
  const activeCharId = user.selectedCharacterId || defaultCharId;
  const activeCharacter = ALL_CHARACTERS.find((c) => c.id === activeCharId) || ALL_CHARACTERS[0];
  const unlockedCharIds = user.unlockedCharacterIds || ["chamo-urbano", "chama-glam"];

  // Cartons to display on the table:
  // - 0 purchased: empty list [] -> Table stays completely free and clear for new purchases
  // - 1 carton purchased: shows 1 single carton
  // - 2 cartons purchased: 2 cartons side by side
  // - 3 cartons purchased: 2 cartons side by side, 1 below
  // - 4 cartons purchased: 2 cartons side by side, 2 below side by side (2x2 grid)
  const displayCartonList = useMemo(() => {
    if (purchasedCardIds.length === 0) {
      return [];
    }
    return purchasedCardIds.slice(0, 4).map((id) => ({
      card: allCards.find((c) => c.id === id) || allCards[0],
      isPurchased: true,
    }));
  }, [purchasedCardIds, allCards]);

  const activeSlotCartonIds = useMemo(() => {
    if (displayCartonList.length === 0) return [activeCarton.id];
    return displayCartonList.map((item) => item.card.id);
  }, [displayCartonList, activeCarton.id]);


  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-red-950/40 text-slate-100 relative">
      {/* Real-time Called Ball Notification Banner (ACTIVATED ONLY when NOT on the game table, DEACTIVATED on the table) */}
      {viewMode !== "table" && calledBallNotification && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-14 sm:top-16 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md animate-in slide-in-from-top-4 duration-300"
        >
          <div className="bg-slate-900/95 border-2 border-yellow-400 rounded-3xl p-3 sm:p-3.5 shadow-2xl shadow-yellow-500/30 flex items-center justify-between gap-3 backdrop-blur-md">
            {/* 3D Ball Sphere Badge */}
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 border-2 border-white shadow-[0_0_15px_rgba(245,158,11,0.8)] flex flex-col items-center justify-center text-slate-950 font-black shrink-0 animate-bounce">
              {/* 3D specular shine */}
              <div className="absolute top-1 left-1.5 w-2.5 h-1.5 bg-white/80 rounded-full -rotate-45 pointer-events-none" />
              <span className="text-[9px] font-fredoka font-black leading-none text-red-700 tracking-wider">
                {calledBallNotification.letter}
              </span>
              <span className="font-fredoka font-black text-sm text-slate-950 leading-tight">
                {calledBallNotification.ball}
              </span>
            </div>

            {/* Text description */}
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] uppercase font-mono font-bold bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 px-1.5 py-0.2 rounded-md">
                  ¡Bola Cantada!
                </span>
                <span className="font-fredoka font-black text-sm text-white">
                  {calledBallNotification.letter}-{calledBallNotification.ball}
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-0.5 truncate">
                {calledBallNotification.matchedCartonIds.length > 0 ? (
                  <span className="text-emerald-300 font-bold flex items-center gap-1">
                    🎯 ¡La tienes en Cartón #{calledBallNotification.matchedCartonIds.join(", #")}!
                  </span>
                ) : (
                  <span className="text-slate-300 text-[11px]">
                    Extrayendo de la tómbola oficial
                  </span>
                )}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setViewMode("table");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-fredoka font-black text-xs px-3 py-1.5 rounded-xl shadow transition active:scale-95 cursor-pointer whitespace-nowrap"
                title="Entrar a la mesa de juego para ver tus cartones"
              >
                Mesa →
              </button>
              <button
                type="button"
                onClick={() => setCalledBallNotification(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
                title="Cerrar notificación"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </aside>
      )}
      {/* ========================================================================= */}
      {/* TOP NAVIGATION BAR (COLLAPSIBLE & HIDDEN IN TABLE MODE FOR MAXIMUM VISION) */}
      {/* ========================================================================= */}

      {/* 1. Minimized Slim Bar when collapsed (Works in BOTH Lobby and Table modes!) */}
      {!isMenuOpen && (
        <header className="bg-slate-900/95 border-b border-amber-500/40 sticky top-0 z-30 px-3 py-2 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 flex-wrap">
            {/* Logo & title mini */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-yellow-400 to-amber-600 p-0.5 shadow border border-amber-300 overflow-hidden shrink-0 flex items-center justify-center">
                <img
                  src={BINGO_LOGO_SRC}
                  alt="Logo Bingo el Chamo"
                  className="w-full h-full object-cover rounded-[9px]"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h1 className="font-fredoka text-xs sm:text-sm font-bold text-yellow-300 leading-tight">
                  Bingo el Chamo
                </h1>
                <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="truncate max-w-[150px]">{user.email}</span>
                </p>
              </div>
            </div>

            {/* Profile Photo Thumbnail Button */}
            <button
              type="button"
              onClick={() => setProfileModalOpen(true)}
              className="flex items-center gap-1.5 bg-slate-950/80 hover:bg-slate-800 border border-amber-500/40 hover:border-yellow-400 p-1 pr-2 rounded-xl transition cursor-pointer shadow"
              title="Cambiar Foto de Perfil"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-600 p-0.5 flex items-center justify-center overflow-hidden shrink-0">
                {user.avatar ? (
                  user.avatar.startsWith("data:") || user.avatar.startsWith("http") ? (
                    <img src={user.avatar} alt="Foto" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span className="text-xs">{user.avatar}</span>
                  )
                ) : (
                  <span className="text-[11px]">👤</span>
                )}
              </div>
              <span className="text-[10px] font-fredoka font-bold text-yellow-300 truncate max-w-[80px]">
                {user.name || user.email.split("@")[0]}
              </span>
              <Camera size={11} className="text-amber-400 opacity-80" />
            </button>

            {/* Quick Balances & Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="bg-slate-950 border border-amber-500/40 rounded-xl px-2.5 py-1 flex items-center gap-1.5 shadow">
                <Wallet size={13} className="text-amber-400" />
                <span className="text-xs font-fredoka font-black text-yellow-300 font-mono">
                  {userBalance.toFixed(2)} VES
                </span>
              </div>

              <div className="hidden sm:flex bg-slate-950 border border-amber-500/40 rounded-xl px-2.5 py-1 items-center gap-1.5 shadow">
                <Coins size={13} className="text-amber-400" />
                <span className="text-xs font-fredoka font-black text-amber-300 font-mono">
                  {plataEnJuego.toFixed(2)} VES
                </span>
              </div>

              {/* Countdown Próxima Partida */}
              <div
                className={`border rounded-xl px-2.5 py-1 flex items-center gap-1.5 text-xs font-mono shadow ${
                  isRoomTimerPaused
                    ? "bg-amber-950/70 border-amber-500/50 text-amber-300"
                    : roomSeconds < 60
                    ? "bg-red-950/80 border-red-500/60 text-red-200 animate-pulse ring-1 ring-red-400"
                    : "bg-blue-950/70 border-cyan-500/40 text-cyan-300"
                }`}
                title="Tiempo restante para el inicio de la próxima partida"
              >
                <Clock
                  size={12}
                  className={
                    isRoomTimerPaused
                      ? "text-amber-400"
                      : roomSeconds < 60
                      ? "text-red-400 animate-spin"
                      : "text-cyan-400 animate-spin"
                  }
                />
                <span className="text-[10px] text-slate-400 hidden xs:inline uppercase font-bold">
                  Próxima:
                </span>
                <span className="font-fredoka font-black text-yellow-300">
                  {isRoomTimerPaused ? `⏸️ ${roomCountdown}` : roomCountdown}
                </span>
              </div>

              {/* Cadencia Cantado Badge */}
              <div className="hidden md:flex bg-slate-950 border border-amber-500/40 rounded-xl px-2.5 py-1 items-center gap-1 text-xs font-mono shadow">
                <span className="text-amber-400">⏱️</span>
                <span className="text-[10px] text-slate-400">Cantado:</span>
                <span className="text-yellow-300 font-bold">{drawIntervalSeconds}s</span>
              </div>

              {viewMode === "lobby" ? (
                <button
                  onClick={() => setViewMode("table")}
                  className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white px-3 py-1.5 rounded-xl text-xs font-fredoka font-bold flex items-center gap-1 shadow active:scale-95 transition cursor-pointer"
                  title="Ir a Mesa de Juego"
                >
                  <Grid size={13} />
                  <span>Mesa ({displayCartonList.length})</span>
                </button>
              ) : (
                <button
                  onClick={() => setViewMode("lobby")}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-fredoka font-bold flex items-center gap-1 shadow active:scale-95 transition cursor-pointer border border-slate-700"
                  title="Volver a Sala Principal"
                >
                  <ArrowLeft size={13} />
                  <span>Lobby</span>
                </button>
              )}

              <button
                onClick={onOpenRecharge}
                className="bg-emerald-700 hover:bg-emerald-600 text-white px-2.5 py-1.5 rounded-xl text-xs font-fredoka font-bold flex items-center gap-1 shadow active:scale-95 transition cursor-pointer"
                title="Recargar Saldo"
              >
                <PlusCircle size={13} />
                <span className="hidden sm:inline">Recargar</span>
              </button>

              {/* Campanita de Notificaciones en Barra Reducida */}
              <button
                type="button"
                onClick={() => setNotificationsModalOpen(true)}
                className="relative bg-amber-500/20 hover:bg-amber-500/30 text-yellow-300 p-1.5 rounded-xl border border-amber-500/40 flex items-center justify-center transition active:scale-95 cursor-pointer shadow"
                title="Notificaciones (Invitaciones, Pagos, Amigos)"
              >
                <Bell
                  size={14}
                  className={
                    unreadNotificationsCount > 0
                      ? "animate-bounce text-yellow-300"
                      : "text-amber-400"
                  }
                />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-mono w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse border border-slate-950">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Botón Acceso Torneo Billetal en Barra Reducida */}
              <button
                type="button"
                onClick={() => setIsTorneoModalOpen(true)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-fredoka font-bold flex items-center gap-1.5 shadow active:scale-95 transition cursor-pointer border ${
                  torneoConfig?.isEnabled
                    ? "bg-gradient-to-r from-amber-500/30 to-yellow-500/30 text-yellow-300 border-yellow-400/80 ring-1 ring-yellow-400/50 animate-pulse"
                    : "bg-slate-900/90 text-slate-400 border-slate-700 hover:text-slate-200"
                }`}
                title={
                  torneoConfig?.isEnabled
                    ? "🏆 Torneo Billetal ACTIVO. ¡Toca para participar!"
                    : "🔒 Torneo Billetal: CERRADO a usuarios por administración"
                }
              >
                <Trophy size={13} className={torneoConfig?.isEnabled ? "text-yellow-400 animate-bounce" : "text-slate-400"} />
                <span className="hidden sm:inline font-black">
                  {torneoConfig?.isEnabled ? "Torneo Billetal" : "Torneo Billetal"}
                </span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                    torneoConfig?.isEnabled
                      ? "bg-emerald-500 text-slate-950 font-black"
                      : "bg-red-950 text-red-300 border border-red-500/50"
                  }`}
                >
                  {torneoConfig?.isEnabled ? "ACTIVO" : "CERRADO"}
                </span>
              </button>

              {/* Botón de Tres Rayitas en Barra Reducida */}
              <button
                type="button"
                onClick={() => setSideDrawerOpen(true)}
                className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-fredoka font-black flex items-center gap-1.5 shadow-lg active:scale-95 transition cursor-pointer border border-yellow-200 ring-1 ring-amber-400/40"
                title="Abrir Menú Lateral (Chat, Soporte, Muñeco, Cómo Ganar, Top Estadísticas)"
              >
                <div className="flex flex-col gap-[2.5px] items-center justify-center">
                  <span className="w-3.5 h-[2px] bg-slate-950 rounded-full"></span>
                  <span className="w-3.5 h-[2px] bg-slate-950 rounded-full"></span>
                  <span className="w-3.5 h-[2px] bg-slate-950 rounded-full"></span>
                </div>
                <span>Menú</span>
                {unreadChatCount > 0 && (
                  <span className="bg-red-600 text-white text-[9px] font-mono px-1 rounded-full animate-pulse">
                    {unreadChatCount}
                  </span>
                )}
              </button>

              {/* Expandir cabecera completa */}
              <button
                onClick={handleOpenMenu}
                className="bg-slate-950 hover:bg-slate-800 text-amber-300 px-2 py-1.5 rounded-xl text-xs font-fredoka font-bold flex items-center border border-slate-800 transition cursor-pointer"
                title="Ver cabecera completa"
              >
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
        </header>
      )}

      {/* 2. Full Header Bar (shown when isMenuOpen is true) */}
      {isMenuOpen && (
        <header className="bg-slate-900/95 border-b border-amber-500/30 sticky top-0 z-30 px-4 py-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Brand & Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-400 to-amber-600 p-0.5 shadow-xl border-2 border-amber-300 overflow-hidden shrink-0 flex items-center justify-center">
                <img
                  src={BINGO_LOGO_SRC}
                  alt="Logo Bingo el Chamo"
                  className="w-full h-full object-cover rounded-[14px]"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-fredoka text-base sm:text-lg font-bold text-yellow-300">
                    Bingo el Chamo
                  </h1>
                  <span className="text-[10px] bg-emerald-700 text-emerald-100 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-sans border border-emerald-500/50">
                    Sala de Juego
                  </span>
                </div>
                <p className="text-xs text-slate-300 flex items-center gap-1.5 truncate max-w-[220px] font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {user.email}
                </p>
              </div>
            </div>

            {/* View Switcher: Lobby Principal vs Mesa de Cartones */}
            <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 shadow-inner">
              <button
                onClick={() => setViewMode("lobby")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-fredoka font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === "lobby"
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Users size={14} /> Lobby Principal
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-fredoka font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === "table"
                    ? "bg-gradient-to-r from-red-600 to-amber-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Grid size={14} /> Mesa de Juego ({displayCartonList.length} {displayCartonList.length === 1 ? "Cartón" : "Cartones"})
                {purchasedCardIds.length > 0 && (
                  <span className="ml-1 bg-yellow-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    {purchasedCardIds.length}
                  </span>
                )}
              </button>
            </div>

            {/* Financial & Action Controls */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {/* Plata en juego Badge (Solo se muestra el 80% a los usuarios) */}
              <div className="bg-gradient-to-r from-amber-950/90 to-slate-950 border border-amber-500/50 rounded-2xl px-3.5 py-1.5 flex items-center gap-2 shadow">
                <Coins size={16} className="text-amber-400" />
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] uppercase font-bold text-amber-300 font-fredoka">Plata en juego</span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      ({purchasedCardIds.length} {purchasedCardIds.length === 1 ? "cartón" : "cartones"})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="font-fredoka text-sm sm:text-base font-black text-yellow-300">
                      {plataEnJuego.toFixed(2)} VES
                    </span>
                  </div>
                </div>
              </div>

              {/* Balance Badge */}
              <div className="bg-slate-950 border border-amber-500/40 rounded-2xl px-3 py-1.5 flex items-center gap-2 shadow">
                <Wallet size={15} className="text-amber-400" />
                <div className="flex flex-col text-left">
                  <span className="text-[9px] uppercase font-bold text-slate-400">Saldo en Cuenta</span>
                  <span className="font-fredoka text-xs sm:text-sm font-bold text-yellow-300 font-mono">
                    {userBalance.toFixed(2)} VES
                  </span>
                </div>
              </div>

              {/* Recargar Pago Móvil Button */}
              <button
                onClick={onOpenRecharge}
                className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-fredoka font-bold px-3 py-2 rounded-xl shadow flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                title="Recarga tu saldo vía Pago Móvil con ID de transacción"
              >
                <PlusCircle size={14} /> Recargar Saldo
              </button>

              {/* Botón Mi Foto de Perfil */}
              <button
                type="button"
                onClick={() => setProfileModalOpen(true)}
                className="bg-amber-500/20 hover:bg-amber-500/30 text-yellow-300 text-xs font-fredoka font-bold px-3 py-2 rounded-xl border border-amber-500/40 flex items-center gap-1.5 transition cursor-pointer shadow"
                title="Subir o cambiar tu foto de perfil"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-500 p-0.5 overflow-hidden flex items-center justify-center shrink-0">
                  {user.avatar ? (
                    user.avatar.startsWith("data:") || user.avatar.startsWith("http") ? (
                      <img src={user.avatar} alt="Foto" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span className="text-[10px]">{user.avatar}</span>
                    )
                  ) : (
                    <Camera size={11} className="text-amber-400" />
                  )}
                </div>
                <span>Mi Foto</span>
              </button>

              {/* BOTÓN COMPRAR CARTONES ARRIBA + FAVORITOS */}
              <div className="flex items-center rounded-xl bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 p-0.5 shadow-lg border border-yellow-300">
                <button
                  id="top-buy-cartons-button"
                  onClick={() => {
                    setCartonCatalogTab("all");
                    setCartonCatalogOpen(true);
                  }}
                  className="hover:bg-yellow-300/30 text-slate-950 text-xs font-fredoka font-black px-3 py-1.5 rounded-l-[10px] flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                  title="Ver todos los 200 cartones disponibles y comprar con saldo de cuenta"
                >
                  <ShoppingCart size={15} />
                  <span>Comprar Cartones</span>
                  <span className="bg-slate-950 text-yellow-300 text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold">
                    200 Disp.
                  </span>
                </button>
                <button
                  id="top-favorite-cartons-button"
                  onClick={() => {
                    setCartonCatalogTab("favorites");
                    setCartonCatalogOpen(true);
                  }}
                  className="bg-slate-950/20 hover:bg-slate-950/40 text-slate-950 border-l border-amber-600/40 text-xs font-fredoka font-black px-2.5 py-1.5 rounded-r-[10px] flex items-center gap-1 transition active:scale-95 cursor-pointer"
                  title="Ver y comprar tus cartones favoritos"
                >
                  <Star size={13} className="fill-slate-950 text-slate-950" />
                  <span>Favoritos ({favoriteCardIds.length})</span>
                </button>
              </div>

              {/* Retirar Button */}
              <button
                onClick={onOpenWithdraw}
                className="bg-blue-800/80 hover:bg-blue-700 text-white text-xs font-fredoka font-bold px-2.5 py-2 rounded-xl shadow border border-blue-700/60 flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                title="Retirar saldo acumulado"
              >
                <ArrowDownRight size={14} /> Retirar
              </button>

              {/* Cartones Comprados */}
              <button
                onClick={onOpenMyCartons}
                className="bg-purple-900/70 hover:bg-purple-800 text-purple-200 text-xs font-fredoka font-bold px-2.5 py-2 rounded-xl shadow border border-purple-700/60 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Ticket size={14} /> Mis Cartones ({purchasedCardIds.length})
              </button>

              {/* CAMPANITA DE NOTIFICACIONES (Invitaciones, Pagos Acreditados, Solicitudes de Amistad) */}
              <button
                type="button"
                onClick={() => setNotificationsModalOpen(true)}
                className="relative bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-yellow-300 px-3 py-2 rounded-xl border border-amber-500/40 flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow hover:scale-[1.03]"
                title="Campanita de Notificaciones (Invitaciones, Pagos, Amigos)"
              >
                <div className="relative flex items-center justify-center">
                  <Bell
                    size={16}
                    className={
                      unreadNotificationsCount > 0
                        ? "animate-bounce text-amber-300"
                        : "text-amber-400"
                    }
                  />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.9)] animate-ping" />
                  )}
                </div>
                <span className="font-fredoka text-xs font-bold text-yellow-300">
                  Avisos
                </span>
                {unreadNotificationsCount > 0 && (
                  <span className="bg-red-600 text-white text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold animate-pulse shadow">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* BOTÓN TORNEO BILLETAL EN BARRA EXPANDIDA */}
              <button
                type="button"
                onClick={() => setIsTorneoModalOpen(true)}
                className={`font-fredoka font-black text-xs sm:text-sm px-3.5 py-2 rounded-xl shadow-lg border-2 flex items-center gap-2 transition active:scale-95 cursor-pointer hover:scale-[1.03] ${
                  torneoConfig?.isEnabled
                    ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 border-yellow-200 ring-2 ring-yellow-400/50 shadow-yellow-950/70"
                    : "bg-slate-950 text-slate-300 border-slate-700/80 hover:text-white"
                }`}
                title={
                  torneoConfig?.isEnabled
                    ? "🏆 Torneo Billetal ACTIVO. ¡Toca para participar!"
                    : "🔒 Torneo Billetal: CERRADO a usuarios por administración"
                }
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    torneoConfig?.isEnabled ? "bg-slate-950 text-yellow-400" : "bg-slate-900 text-slate-400"
                  }`}
                >
                  <Trophy size={14} className={torneoConfig?.isEnabled ? "animate-bounce text-yellow-400" : "text-slate-400"} />
                </div>
                <div className="flex flex-col text-left leading-none">
                  <span className="text-[9px] uppercase font-mono tracking-wider font-bold">
                    {torneoConfig?.isEnabled ? "🏆 ACTIVO" : "🔒 CERRADO"}
                  </span>
                  <span className="text-xs font-black">
                    Torneo Billetal
                  </span>
                </div>
              </button>

              {/* BOTÓN PRINCIPAL DE TRES RAYITAS: Abre el Menú Lateral con Chat, Soporte, Muñeco, Cómo Ganar, Top Estadísticas */}
              <button
                type="button"
                onClick={() => setSideDrawerOpen(true)}
                className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-fredoka font-black text-xs sm:text-sm px-4 py-2 rounded-xl shadow-xl border-2 border-yellow-200 flex items-center gap-2 transition active:scale-95 cursor-pointer ring-2 ring-amber-400/50 hover:scale-[1.03]"
                title="Abrir Menú Lateral (Chat, Soporte, Muñeco, Cómo Ganar, Top Estadísticas)"
              >
                <div className="flex flex-col gap-[3px] items-center justify-center py-0.5">
                  <span className="w-4 h-[2.5px] bg-slate-950 rounded-full"></span>
                  <span className="w-4 h-[2.5px] bg-slate-950 rounded-full"></span>
                  <span className="w-4 h-[2.5px] bg-slate-950 rounded-full"></span>
                </div>
                <span>Menú</span>
                {unreadChatCount > 0 && (
                  <span className="bg-red-600 text-white text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                    {unreadChatCount}
                  </span>
                )}
              </button>

              {/* BOTÓN OCULTAR MENÚ (Se contrae al Slim Top Bar de forma limpia) */}
              <button
                onClick={handleCloseMenu}
                className="bg-slate-950 hover:bg-slate-800 text-amber-300 border border-amber-500/50 hover:border-amber-400 p-2 rounded-xl text-xs font-fredoka font-bold flex items-center justify-center transition active:scale-95 shadow cursor-pointer ml-1"
                title="Guardar menú hacia arriba (Ocultar)"
              >
                <ChevronUp size={16} />
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Payment and Winner Status Banner */}
        <PlayerPaymentStatusBanner
          currentWonGame={currentWonGame}
          winnerAnnouncement={winnerAnnouncement}
          currentUserEmail={user.email}
          plataEnJuego={plataEnJuego}
        />

        {viewMode === "lobby" ? (
          /* ==================== LOBBY PRINCIPAL ==================== */
          <div className="flex flex-col gap-6">
            {/* Festive Christmas Banner with Lights */}
            <ChristmasFestiveBanner
              title="¡Feliz Navidad en Bingo el Chamo!"
              subtitle="Tómbola Navideña con Muñecos, Tops y 80% de Premio al Ganador"
            />

            {/* Incoming Duo Invite Notification Banner */}
            {pendingDuoInvite && (
              <div className="bg-gradient-to-r from-amber-950 via-purple-950 to-slate-900 border-2 border-yellow-400 rounded-3xl p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in slide-in-from-top-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg border border-yellow-300 shrink-0">
                    <HeartHandshake size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-yellow-400 font-mono tracking-wider">
                      ¡Invitación a Dúo Recibida!
                    </span>
                    <h4 className="text-sm sm:text-base font-fredoka font-black text-white">
                      {pendingDuoInvite.fromName} ({pendingDuoInvite.fromEmail})
                    </h4>
                    <p className="text-xs text-slate-300">
                      Te invitó a jugar en Dúo. Si uno gana, se reparten <strong>40% y 40%</strong> de la plata en juego.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  {onAcceptDuoInvite && (
                    <button
                      onClick={() => onAcceptDuoInvite(pendingDuoInvite)}
                      className="flex-1 sm:flex-initial bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 text-slate-950 font-fredoka font-black text-xs px-4 py-2.5 rounded-xl shadow transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 size={15} /> Aceptar Dúo
                    </button>
                  )}
                  {onDeclineDuoInvite && (
                    <button
                      onClick={onDeclineDuoInvite}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-fredoka font-bold text-xs px-3 py-2.5 rounded-xl transition cursor-pointer"
                    >
                      Rechazar
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Duo Mode Widget Card */}
            <div className="bg-gradient-to-r from-slate-900/95 via-slate-900 to-amber-950/50 border border-amber-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-400 via-amber-500 to-yellow-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg border border-yellow-300 shrink-0">
                  <Users size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-fredoka font-bold text-base text-yellow-300">
                      {activeDuo ? "👥 Jugando en Dúo Oficial" : "👤 Modo Individual (Solo)"}
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-yellow-400 border border-amber-500/40">
                      {activeDuo ? "Reparto 40% / 40%" : "Premio 80% Completo"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    {activeDuo ? (
                      <>
                        Compañero:{" "}
                        <strong className="text-yellow-300 font-fredoka">
                          {activeDuo.player1Email.toLowerCase() === user.email.toLowerCase()
                            ? activeDuo.player2Name
                            : activeDuo.player1Name}
                        </strong>{" "}
                        ({activeDuo.player1Email.toLowerCase() === user.email.toLowerCase() ? activeDuo.player2Email : activeDuo.player1Email}). Si cualquiera de los 2 canta BINGO, ¡se reparten 40% y 40% de la ganancia! Si luego abandonas el dúo, tu ganancia ya acreditada no se quita (la separación aplica exclusivamente para la próxima partida).
                      </>
                    ) : (
                      <>
                        Si juegas sin dúo y cantas BINGO te llevas el <strong>80% completo</strong> de la plata en juego. Puedes invitar a un amigo para jugar en DÚO (40% y 40%).
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setDuoModalOpen(true)}
                  className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-fredoka font-black px-4 py-2.5 rounded-2xl text-xs shadow-lg transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <HeartHandshake size={15} />
                  <span>{activeDuo ? "Gestionar Dúo" : "Invitar Amigo a Dúo 👥"}</span>
                </button>
              </div>
            </div>

            {/* Banner: Partida Culminada - Cartones y números marcados se conservan */}
            {(winnerAnnouncement || currentWonGame || isGameCompleted) && (
              <div className="w-full bg-gradient-to-r from-amber-950/95 via-slate-900 to-amber-950/95 border-2 border-yellow-400/70 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left animate-fadeIn">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-yellow-300 shrink-0 shadow">
                    <Trophy size={26} className="text-yellow-400 animate-bounce" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                      <span className="font-fredoka text-xs uppercase tracking-wider text-amber-300 font-bold bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                        ¡Partida Culminada!
                      </span>
                      {(winnerAnnouncement?.winnerName || currentWonGame?.winnerName) && (
                        <span className="text-xs sm:text-sm text-yellow-300 font-fredoka font-black bg-yellow-500/20 px-3 py-1 rounded-full border border-yellow-400/40 shadow-sm flex items-center gap-1.5 animate-pulse">
                          <span>👑</span>
                          <span>¡GANÓ {winnerAnnouncement?.winnerName || currentWonGame?.winnerName}!</span>
                        </span>
                      )}
                      <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                        Supabase En Vivo
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 font-medium mt-1">
                      ¡Los cartones se han desmarcado y limpiado de la mesa de juego! Esperando a que inicie la próxima partida automáticamente al cumplirse el tiempo.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
                  {purchasedCardIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setViewMode("table")}
                      className="bg-slate-800 hover:bg-slate-700 text-yellow-300 font-fredoka font-bold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-amber-500/40 shadow flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                    >
                      <Eye size={15} />
                      <span>Ver Mesa de Juego</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setCartonCatalogTab("all");
                      setCartonCatalogOpen(true);
                    }}
                    className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-fredoka font-black text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer whitespace-nowrap shrink-0 border border-yellow-200"
                  >
                    <ShoppingCart size={16} />
                    <span>Comprar Cartones para Próxima Partida</span>
                  </button>
                </div>
              </div>
            )}

            {/* Mascot Greeting Area */}
            <BingoMascot
              character={activeCharacter}
              userName={user.name || user.email.split("@")[0]}
              cartonesCount={purchasedCardIds.length}
              userBalance={userBalance}
              roomCountdown={isRoomTimerPaused ? `⏸️ ${roomCountdown}` : roomCountdown}
              onOpenCharacterSelect={() => setCharacterSelectOpen(true)}
              onOpenRecharge={onOpenRecharge}
              onEnterGame={() => setViewMode("table")}
              onBuyCartonsClick={() => {
                setCartonCatalogTab("all");
                setCartonCatalogOpen(true);
              }}
            />


            {/* Middle Section: Quick Carton Buying & Social Players */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Pre-game Carton Shop & Transaction History */}
              <div className="lg:col-span-6 flex flex-col gap-5">
                {/* Buy Cartons Box */}
                <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Ticket size={18} className="text-amber-400" />
                      <h3 className="font-fredoka text-sm sm:text-base font-bold text-yellow-300 uppercase tracking-wide">
                        Adquirir Cartones para la Partida
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 rounded-xl">
                      {cartonPrice.toFixed(2)} VES / Cartón
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">
                    Compra tus cartones directamente con el saldo de tu cuenta. ¡Puedes ver todos los cartones disponibles y jugar con hasta 4 cartones a la vez!
                  </p>

                  {/* Prominent button to open full catalog (scrollable down) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setCartonCatalogTab("all");
                        setCartonCatalogOpen(true);
                      }}
                      className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-fredoka font-black py-2.5 px-3 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-xs transition active:scale-98 cursor-pointer"
                    >
                      <ShoppingCart size={15} />
                      <span>Ver Todos los 200 Cartones ({cartonPrice.toFixed(2)} VES c/u)</span>
                    </button>
                    <button
                      onClick={() => {
                        setCartonCatalogTab("favorites");
                        setCartonCatalogOpen(true);
                      }}
                      className="bg-slate-950 hover:bg-slate-900 border border-yellow-500/50 text-yellow-300 font-fredoka font-bold py-2.5 px-3 rounded-2xl shadow flex items-center justify-center gap-2 text-xs transition active:scale-98 cursor-pointer"
                    >
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      <span>Mis Cartones Favoritos ({favoriteCardIds.length})</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                    <select
                      value={quickCartonPick}
                      onChange={(e) => {
                        const id = Number(e.target.value);
                        setQuickCartonPick(id);
                        onSelectCartonId(id);
                      }}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-300 outline-none focus:border-amber-500 font-fredoka flex-1"
                    >
                      {allCards.map((c) => (
                        <option key={c.id} value={c.id}>
                          Cartón #{c.id} {purchasedCardIds.includes(c.id) ? "★ (Ya Comprado)" : favoriteCardIds.includes(c.id) ? "⭐ (Favorito)" : ""}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => onToggleFavorite && onToggleFavorite(quickCartonPick)}
                      className={`p-2 rounded-xl border text-xs transition cursor-pointer flex items-center justify-center ${
                        favoriteCardIds.includes(quickCartonPick)
                          ? "bg-amber-500/20 text-yellow-300 border-yellow-400"
                          : "bg-slate-950 text-slate-400 hover:text-yellow-300 border-slate-800"
                      }`}
                      title={favoriteCardIds.includes(quickCartonPick) ? "Quitar de favoritos" : "Guardar como favorito"}
                    >
                      <Star
                        size={14}
                        className={favoriteCardIds.includes(quickCartonPick) ? "fill-yellow-400 text-yellow-400" : ""}
                      />
                    </button>

                    <button
                      onClick={() => onBuyCarton(quickCartonPick)}
                      disabled={purchasedCardIds.includes(quickCartonPick) || purchasedCardIds.length >= 4}
                      className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-fredoka font-black px-4 py-2 rounded-xl text-xs shadow transition active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      <ShoppingCart size={13} />
                      {purchasedCardIds.includes(quickCartonPick)
                        ? "Adquirido"
                        : purchasedCardIds.length >= 4
                        ? "Límite 4/4"
                        : `Comprar (${cartonPrice.toFixed(2)} VES)`}
                    </button>
                  </div>

                  {/* Vista Previa Inmediata de los números del Cartón Seleccionado */}
                  {(() => {
                    const pickedCard = allCards.find((c) => c.id === quickCartonPick);
                    if (!pickedCard) return null;
                    const isPickedPurchased = purchasedCardIds.includes(pickedCard.id);
                    const isPickedFavorite = favoriteCardIds.includes(pickedCard.id);

                    return (
                      <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-col gap-2 shadow-inner">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="font-fredoka font-bold text-yellow-300">
                              Revisión de Números: Cartón #{pickedCard.id}
                            </span>
                            {isPickedFavorite && (
                              <span className="text-[10px] text-amber-400 font-bold">⭐ Favorito</span>
                            )}
                            {isPickedPurchased && (
                              <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-1.5 py-0.2 rounded-full">
                                Comprado
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              onSelectCartonId(pickedCard.id);
                              setCartonCatalogTab("all");
                              setCartonCatalogOpen(true);
                            }}
                            className="text-[11px] text-amber-400 hover:text-yellow-300 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Maximize2 size={12} />
                            <span>Abrir Tienda Grande</span>
                          </button>
                        </div>

                        {/* 5x5 Matrix Preview */}
                        <div className="bg-slate-900 rounded-xl p-2 border border-slate-800 flex flex-col gap-1">
                          <div className="grid grid-cols-5 gap-1 text-center font-fredoka font-black text-[10px]">
                            <div className="py-0.5 rounded bg-red-900/90 text-white border border-red-700">B</div>
                            <div className="py-0.5 rounded bg-amber-600/90 text-slate-950 border border-amber-500 font-black">I</div>
                            <div className="py-0.5 rounded bg-emerald-800/90 text-white border border-emerald-600">N</div>
                            <div className="py-0.5 rounded bg-blue-900/90 text-white border border-blue-700">G</div>
                            <div className="py-0.5 rounded bg-purple-900/90 text-white border border-purple-700">O</div>
                          </div>
                          <div className="grid grid-cols-5 gap-1 text-center">
                            {pickedCard.numeros.map((row, rIdx) =>
                              row.map((cell, cIdx) => (
                                <div
                                  key={`quick-preview-${pickedCard.id}-${rIdx}-${cIdx}`}
                                  className={`h-6 rounded flex items-center justify-center font-fredoka text-[11px] font-bold border select-none ${
                                    cell.num === "FREE"
                                      ? "bg-amber-400 text-slate-950 border-amber-300 text-[8px] font-black"
                                      : "bg-slate-950 text-slate-200 border-slate-800"
                                  }`}
                                >
                                  {cell.num === "FREE" ? "⭐" : cell.num}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Favorite Cartons Section */}
                  <div className="bg-slate-950 p-3 rounded-2xl border border-amber-500/30 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-yellow-300 font-fredoka font-bold flex items-center gap-1">
                        <Star size={13} className="fill-yellow-400 text-yellow-400" />
                        Tus Cartones Favoritos ({favoriteCardIds.length}):
                      </span>
                      <button
                        onClick={() => {
                          setCartonCatalogTab("favorites");
                          setCartonCatalogOpen(true);
                        }}
                        className="text-[11px] text-amber-400 hover:text-yellow-300 font-bold underline cursor-pointer"
                      >
                        Ver en Catálogo
                      </button>
                    </div>

                    {favoriteCardIds.length === 0 ? (
                      <div className="text-[11px] text-slate-400 italic flex items-center justify-between">
                        <span>Aún no tienes favoritos guardados.</span>
                        <button
                          onClick={() => {
                            setCartonCatalogTab("all");
                            setCartonCatalogOpen(true);
                          }}
                          className="text-[10px] bg-slate-900 border border-slate-700 text-yellow-300 px-2 py-0.5 rounded-lg hover:border-yellow-400 transition"
                        >
                          Explorar y Marcar ⭐
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {favoriteCardIds.map((favId) => {
                          const isBought = purchasedCardIds.includes(favId);
                          return (
                            <div
                              key={favId}
                              className={`flex items-center gap-1.5 px-2 py-1 rounded-xl text-xs border ${
                                isBought
                                  ? "bg-purple-950/80 border-purple-600/60 text-purple-200"
                                  : "bg-slate-900 border-amber-500/40 text-yellow-300"
                              }`}
                            >
                              <span className="font-fredoka font-bold">#{favId}</span>
                              {isBought ? (
                                <span className="text-[10px] bg-purple-900 px-1.5 py-0.2 rounded-md font-bold text-purple-300">
                                  En Juego
                                </span>
                              ) : (
                                <button
                                  onClick={() => onBuyCarton(favId)}
                                  disabled={purchasedCardIds.length >= 4}
                                  className="text-[10px] bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black px-1.5 py-0.5 rounded-md transition cursor-pointer"
                                  title={purchasedCardIds.length >= 4 ? "Límite de 4 cartones alcanzado" : "Comprar este cartón favorito"}
                                >
                                  {purchasedCardIds.length >= 4 ? "Límite 4" : "Comprar"}
                                </button>
                              )}
                              <button
                                onClick={() => onToggleFavorite && onToggleFavorite(favId)}
                                className="text-slate-500 hover:text-red-400 ml-0.5 text-xs"
                                title="Quitar de favoritos"
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <p className="text-[10px] text-slate-400 italic">
                      Regla: Al reiniciar cada partida, todos los cartones vuelven a la tienda. Tus favoritos se mantienen guardados para que los compres de primero. Si no los compras, otro jugador los puede adquirir. (Máximo 4 cartones por partida).
                    </p>
                  </div>

                  {/* Purchased Quick Preview */}
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Tus cartones activos para jugar:</span>
                      <span className="font-bold text-amber-300 font-mono">
                        {purchasedCardIds.length} de 4 máx
                      </span>
                    </div>

                    {purchasedCardIds.length === 0 ? (
                      <span className="text-[11px] text-slate-500 italic">
                        No tienes cartones aún. Recarga saldo por Pago Móvil y compra tus cartones favoritos.
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {purchasedCardIds.map((id) => (
                          <button
                            key={id}
                            onClick={() => {
                              onSelectCartonId(id);
                              setViewMode("table");
                            }}
                            className="bg-purple-950 hover:bg-purple-900 border border-purple-700/60 text-purple-200 text-xs font-fredoka font-bold px-2.5 py-1 rounded-xl transition cursor-pointer"
                            title="Ir a jugar este cartón"
                          >
                            #{id}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Last Winners List */}
                <LastWinnersList winners={wonGamesHistory} />
              </div>

              {/* Right Column: Ventana "Solicitudes" con todas las personas registradas y solicitudes de amistad */}
              <div className="lg:col-span-6 flex flex-col gap-5">
                <SolicitudesJugadoresPanel
                  currentUser={user}
                  registeredUsers={registeredUsers}
                  friendEmails={friendEmails}
                  onAddFriend={onAddFriend}
                  onRemoveFriend={onRemoveFriend}
                  onInviteDuo={onInviteDuo}
                  onOpenDuoModal={() => setDuoModalOpen(true)}
                />
              </div>
            </div>
          </div>
        ) : (
          /* ==================== MESA DE JUEGO MULTI-CARTÓN ==================== */
          <div className="flex flex-col gap-5">
            {/* Top Control Bar for Table */}
            <div className="flex flex-col gap-2 bg-slate-900/95 border border-amber-500/30 rounded-3xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
              {/* Christmas Lights on Table header */}
              <ChristmasLights count={28} compact={true} className="-mt-3 mb-1" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setViewMode("lobby");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3.5 py-2 rounded-xl text-xs font-fredoka font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md active:scale-95"
                  title="Regresar a la pantalla del Lobby"
                >
                  <ArrowLeft size={15} />
                  <span>Volver al Lobby</span>
                </button>
                <div>
                  <h2 className="font-fredoka text-base sm:text-lg font-bold text-yellow-300 flex items-center gap-2">
                    <span>Mesa Oficial de Juego</span>
                    <span className="text-[11px] bg-amber-500/20 text-yellow-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                      {displayCartonList.length === 1
                        ? "1 Cartón"
                        : displayCartonList.length === 2
                        ? "2 Cartones (Lado a Lado)"
                        : displayCartonList.length === 3
                        ? "3 Cartones (2 Arriba, 1 Abajo)"
                        : "4 Cartones (Cuadrícula 2x2)"}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    {displayCartonList.length === 1
                      ? "Mostrando tu cartón en pantalla completa."
                      : displayCartonList.length === 2
                      ? "Mostrando tus 2 cartones uno al lado del otro."
                      : displayCartonList.length === 3
                      ? "Mostrando 2 cartones arriba y 1 abajo abarcando la pantalla."
                      : "Mostrando tus 4 cartones completos en pantalla (máximo 4 por partida)."}
                  </p>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Saldo y Plata en juego en la mesa */}
                <div className="bg-slate-950 border border-amber-500/40 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 shadow">
                  <Wallet size={14} className="text-amber-400" />
                  <span className="text-xs font-fredoka font-black text-yellow-300 font-mono">
                    {userBalance.toFixed(2)} VES
                  </span>
                </div>

                <div className="hidden sm:flex bg-slate-950 border border-amber-500/40 rounded-xl px-2.5 py-1.5 items-center gap-1.5 shadow">
                  <Coins size={14} className="text-amber-400" />
                  <span className="text-xs font-fredoka font-black text-amber-300 font-mono">
                    {plataEnJuego.toFixed(2)} VES
                  </span>
                </div>

                {/* Próxima Partida Countdown on Table */}
                <div
                  className={`border rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 shadow text-xs font-mono ${
                    isRoomTimerPaused
                      ? "bg-amber-950/70 border-amber-500/40 text-amber-300"
                      : roomSeconds < 60
                      ? "bg-red-950/80 border-red-500/60 text-red-200 animate-pulse ring-1 ring-red-400"
                      : "bg-blue-950/70 border-cyan-500/40 text-cyan-300"
                  }`}
                  title="Tiempo restante para el inicio de la próxima partida"
                >
                  <Clock
                    size={13}
                    className={
                      isRoomTimerPaused
                        ? "text-amber-400"
                        : roomSeconds < 60
                        ? "text-red-400 animate-spin"
                        : "text-cyan-400 animate-spin"
                    }
                  />
                  <span className="text-[10px] text-slate-400 hidden xs:inline uppercase font-bold">
                    Próxima:
                  </span>
                  <span className="font-fredoka font-black text-yellow-300">
                    {isRoomTimerPaused ? `⏸️ ${roomCountdown}` : roomCountdown}
                  </span>
                </div>

                {/* Duo status badge on table */}
                <button
                  type="button"
                  onClick={() => setDuoModalOpen(true)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-fredoka font-bold flex items-center gap-1.5 shadow transition active:scale-95 cursor-pointer border ${
                    activeDuo
                      ? "bg-amber-500/20 text-yellow-300 border-amber-400/60"
                      : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                  }`}
                  title="Configurar o ver Modo Dúos (40% / 40%)"
                >
                  <Users size={13} className={activeDuo ? "text-yellow-400" : "text-slate-400"} />
                  <span>{activeDuo ? "Dúo (40%/40%)" : "Solo (80%)"}</span>
                </button>

                <button
                  onClick={onOpenRecharge}
                  className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-fredoka font-bold px-2.5 py-2 rounded-xl shadow flex items-center gap-1 transition active:scale-95 cursor-pointer"
                  title="Recargar saldo vía Pago Móvil"
                >
                  <PlusCircle size={13} />
                  <span className="hidden xs:inline">Recargar</span>
                </button>

                <button
                  onClick={onOpenWithdraw}
                  className="hidden md:flex bg-blue-800/80 hover:bg-blue-700 text-white text-xs font-fredoka font-bold px-2.5 py-2 rounded-xl shadow border border-blue-700/60 items-center gap-1 transition active:scale-95 cursor-pointer"
                  title="Retirar saldo acumulado"
                >
                  <ArrowDownRight size={13} />
                  <span>Retirar</span>
                </button>

                {/* Auto-Daub All Active Cartons */}
                {onAutoDaubAll && (
                  <button
                    onClick={() => onAutoDaubAll(activeSlotCartonIds)}
                    className="bg-slate-800 hover:bg-slate-700 text-yellow-300 font-fredoka text-xs font-bold px-3 py-2 rounded-xl border border-amber-500/30 shadow flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                    title="Auto-marcar todos los números extraídos en los cartones en pantalla"
                  >
                    <Wand2 size={13} /> Auto-Marcar Todos ({displayCartonList.length})
                  </button>
                )}

                {/* Buy Cartons Button */}
                {purchasedCardIds.length < 4 ? (
                  <button
                    onClick={() => setCartonCatalogOpen(true)}
                    className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-fredoka font-black text-xs px-3.5 py-2 rounded-xl shadow flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <ShoppingCart size={13} /> + Comprar Cartón ({purchasedCardIds.length}/4)
                  </button>
                ) : (
                  <span className="bg-purple-950/90 border border-purple-600/70 text-purple-200 font-fredoka font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 shadow">
                    <CheckCircle2 size={13} className="text-purple-400" />
                    4/4 Cartones (Máximo)
                  </span>
                )}

                <button
                  onClick={() => setWinningFiguresModalOpen(true)}
                  className="bg-amber-500/20 hover:bg-amber-500/30 text-yellow-300 border border-amber-500/40 text-xs font-fredoka font-bold px-2.5 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer"
                  title="Ver todas las figuras oficiales y cómo ganarlas"
                >
                  <span className="text-amber-400">⭐</span>
                  <span>Figuras</span>
                </button>

                {/* Toggle MasterBoard & Winning Patterns */}
                <button
                  onClick={() => setShowTableBoard(!showTableBoard)}
                  className="bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-fredoka px-2.5 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer"
                  title="Mostrar/Ocultar Tablero Maestro y Figuras Ganadoras"
                >
                  <span>Tablero y Figuras</span>
                  {showTableBoard ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {/* Ver/Ocultar Menú Completo */}
                <button
                  onClick={toggleHeaderCollapsed}
                  className="bg-slate-950 hover:bg-slate-800 text-amber-300 border border-slate-800 text-xs font-fredoka px-2.5 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer"
                  title="Ver u ocultar el menú de navegación superior en la mesa de juego"
                >
                  <Menu size={13} />
                  <span>{isMenuOpen ? "Ocultar Menú" : "Abrir Menú"}</span>
                  {isMenuOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
              </div>
            </div>
            </div>

            {/* Optional Collapsible MasterBoard and Winning Figures Row */}
            {showTableBoard && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-in fade-in duration-200">
                <div className="lg:col-span-5">
                  <WinningFiguresCard onOpenModal={() => setWinningFiguresModalOpen(true)} />
                </div>
                <div className="lg:col-span-7">
                  <MasterBoard drawnBalls={drawnBalls} />
                </div>
              </div>
            )}


            {/* ========================================================================= */}
            {/* MULTI-CARTON SCREEN: 1, 2, 3, or 4 Cartones according to exact user layout */}
            {/* ========================================================================= */}
            {displayCartonList.length === 0 ? (
              /* CASO 0: Mesa Libre - No hay cartones comprados todavía (Espacio completamente libre) */
              <div className="w-full max-w-3xl mx-auto p-6 sm:p-10 rounded-3xl bg-slate-950/70 border-2 border-dashed border-amber-500/35 shadow-2xl backdrop-blur-md flex flex-col items-center justify-center text-center gap-4 animate-in fade-in duration-200 my-4">
                <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-yellow-300 shadow-lg">
                  <Ticket size={32} className="text-yellow-400" />
                </div>
                <div className="max-w-md">
                  <h3 className="font-fredoka text-lg sm:text-xl font-black text-yellow-300">
                    Mesa de Juego Libre
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                    El espacio de la mesa está libre. Solo se mostrarán aquí los cartones que compres nuevos para esta partida (hasta 4 cartones simultáneos).
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setCartonCatalogTab("all");
                      setCartonCatalogOpen(true);
                    }}
                    className="w-full flex-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-fredoka font-black text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer border border-yellow-200"
                  >
                    <ShoppingCart size={17} />
                    <span>+ Comprar Nuevos Cartones ({cartonPrice.toFixed(2)} VES)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode("lobby");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 font-fredoka font-bold text-xs sm:text-sm px-4 py-3 rounded-2xl transition cursor-pointer"
                  >
                    Volver al Lobby
                  </button>
                </div>
              </div>
            ) : displayCartonList.length === 1 ? (
              /* CASO 1: Un solo cartón */
              <div className="max-w-xl mx-auto w-full animate-in fade-in duration-200">
                <CartonView
                  carton={displayCartonList[0].card}
                  isPurchased={displayCartonList[0].isPurchased}
                  drawnBalls={drawnBalls}
                  currentBall={currentBall}
                  userBalance={userBalance}
                  isGameCompleted={isGameCompleted}
                  gameWinnerName={currentWonGame?.winnerName || winnerAnnouncement?.winnerName}
                  compact={false}
                  slotNumber={1}
                  onToggleCell={onToggleCell}
                  onAutoDaub={onAutoDaub}
                  onCheckBingo={onCheckBingo}
                  onBuyCarton={onBuyCarton}
                  onSelectCartonId={onSelectCartonId}
                  onOpenShopModal={() => setCartonCatalogOpen(true)}
                  onOpenWinningFigures={() => setWinningFiguresModalOpen(true)}
                />
              </div>
            ) : displayCartonList.length === 2 ? (
              /* CASO 2: Dos cartones uno al lado del otro exactamente como la imagen de referencia */
              <div className="w-full max-w-5xl mx-auto p-2 sm:p-4 rounded-3xl bg-slate-950/60 border-2 border-amber-500/30 shadow-2xl backdrop-blur-md animate-in fade-in duration-200">
                <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:gap-5 w-full items-start">
                  {/* Cartón 1 - Izquierda */}
                  <div className="w-full">
                    <CartonView
                      carton={displayCartonList[0].card}
                      isPurchased={displayCartonList[0].isPurchased}
                      drawnBalls={drawnBalls}
                      currentBall={currentBall}
                      userBalance={userBalance}
                      isGameCompleted={isGameCompleted}
                      gameWinnerName={currentWonGame?.winnerName || winnerAnnouncement?.winnerName}
                      compact={true}
                      slotNumber={1}
                      onToggleCell={onToggleCell}
                      onAutoDaub={onAutoDaub}
                      onCheckBingo={onCheckBingo}
                      onBuyCarton={onBuyCarton}
                      onSelectCartonId={onSelectCartonId}
                      onOpenShopModal={() => setCartonCatalogOpen(true)}
                      onOpenWinningFigures={() => setWinningFiguresModalOpen(true)}
                    />
                  </div>

                  {/* Cartón 2 - Derecha */}
                  <div className="w-full">
                    <CartonView
                      carton={displayCartonList[1].card}
                      isPurchased={displayCartonList[1].isPurchased}
                      drawnBalls={drawnBalls}
                      currentBall={currentBall}
                      userBalance={userBalance}
                      isGameCompleted={isGameCompleted}
                      gameWinnerName={currentWonGame?.winnerName || winnerAnnouncement?.winnerName}
                      compact={true}
                      slotNumber={2}
                      onToggleCell={onToggleCell}
                      onAutoDaub={onAutoDaub}
                      onCheckBingo={onCheckBingo}
                      onBuyCarton={onBuyCarton}
                      onSelectCartonId={onSelectCartonId}
                      onOpenShopModal={() => setCartonCatalogOpen(true)}
                      onOpenWinningFigures={() => setWinningFiguresModalOpen(true)}
                    />
                  </div>
                </div>
              </div>
            ) : displayCartonList.length === 3 ? (
              /* CASO 3: Tres cartones -> Exactamente como la imagen: 2 arriba y 1 abajo a la izquierda (bajo el cartón 1) */
              <div className="w-full max-w-5xl mx-auto p-2 sm:p-4 rounded-3xl bg-slate-950/60 border-2 border-amber-500/30 shadow-2xl backdrop-blur-md animate-in fade-in duration-200">
                <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:gap-5 w-full items-start">
                  {/* Cartón 1 - Arriba Izquierda */}
                  <div className="w-full">
                    <CartonView
                      carton={displayCartonList[0].card}
                      isPurchased={displayCartonList[0].isPurchased}
                      drawnBalls={drawnBalls}
                      currentBall={currentBall}
                      userBalance={userBalance}
                      isGameCompleted={isGameCompleted}
                      gameWinnerName={currentWonGame?.winnerName || winnerAnnouncement?.winnerName}
                      compact={true}
                      slotNumber={1}
                      onToggleCell={onToggleCell}
                      onAutoDaub={onAutoDaub}
                      onCheckBingo={onCheckBingo}
                      onBuyCarton={onBuyCarton}
                      onSelectCartonId={onSelectCartonId}
                      onOpenShopModal={() => setCartonCatalogOpen(true)}
                      onOpenWinningFigures={() => setWinningFiguresModalOpen(true)}
                    />
                  </div>

                  {/* Cartón 2 - Arriba Derecha */}
                  <div className="w-full">
                    <CartonView
                      carton={displayCartonList[1].card}
                      isPurchased={displayCartonList[1].isPurchased}
                      drawnBalls={drawnBalls}
                      currentBall={currentBall}
                      userBalance={userBalance}
                      isGameCompleted={isGameCompleted}
                      gameWinnerName={currentWonGame?.winnerName || winnerAnnouncement?.winnerName}
                      compact={true}
                      slotNumber={2}
                      onToggleCell={onToggleCell}
                      onAutoDaub={onAutoDaub}
                      onCheckBingo={onCheckBingo}
                      onBuyCarton={onBuyCarton}
                      onSelectCartonId={onSelectCartonId}
                      onOpenShopModal={() => setCartonCatalogOpen(true)}
                      onOpenWinningFigures={() => setWinningFiguresModalOpen(true)}
                    />
                  </div>

                  {/* Cartón 3 - Abajo Izquierda (directamente debajo del Cartón 1) */}
                  <div className="w-full">
                    <CartonView
                      carton={displayCartonList[2].card}
                      isPurchased={displayCartonList[2].isPurchased}
                      drawnBalls={drawnBalls}
                      currentBall={currentBall}
                      userBalance={userBalance}
                      isGameCompleted={isGameCompleted}
                      gameWinnerName={currentWonGame?.winnerName || winnerAnnouncement?.winnerName}
                      compact={true}
                      slotNumber={3}
                      onToggleCell={onToggleCell}
                      onAutoDaub={onAutoDaub}
                      onCheckBingo={onCheckBingo}
                      onBuyCarton={onBuyCarton}
                      onSelectCartonId={onSelectCartonId}
                      onOpenShopModal={() => setCartonCatalogOpen(true)}
                      onOpenWinningFigures={() => setWinningFiguresModalOpen(true)}
                    />
                  </div>

                  {/* Espacio Abajo a la Derecha - Slot para completar los 4 cartones */}
                  <div className="w-full h-full min-h-[260px] sm:min-h-[340px] rounded-3xl border-2 border-dashed border-amber-500/25 bg-slate-900/40 flex flex-col items-center justify-center text-center p-4 gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Ticket size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-fredoka font-bold text-yellow-300">
                        4to Cartón Disponible
                      </p>
                      <p className="text-[11px] text-slate-400 max-w-[200px] mt-0.5">
                        Puedes adquirir el 4to cartón para completar la hoja 2x2.
                      </p>
                    </div>
                    <button
                      onClick={() => setCartonCatalogOpen(true)}
                      className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-fredoka font-black text-xs px-3.5 py-1.5 rounded-xl shadow flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                    >
                      <ShoppingCart size={12} /> Comprar 4to Cartón
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* CASO 4: Cuatro cartones -> Modelo de 4 cartones en cuadrícula 2x2 exacto como la imagen de referencia (2 arriba, 2 abajo) */
              <div className="w-full max-w-5xl mx-auto p-2 sm:p-4 rounded-3xl bg-slate-950/60 border-2 border-amber-500/30 shadow-2xl backdrop-blur-md animate-in fade-in duration-200">
                <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:gap-5 w-full items-start">
                  {displayCartonList.slice(0, 4).map((item, idx) => (
                    <div key={`carton-slot-${item.card.id}-${idx}`} className="w-full">
                      <CartonView
                        carton={item.card}
                        isPurchased={item.isPurchased}
                        drawnBalls={drawnBalls}
                        currentBall={currentBall}
                        userBalance={userBalance}
                        isGameCompleted={isGameCompleted}
                        gameWinnerName={currentWonGame?.winnerName || winnerAnnouncement?.winnerName}
                        compact={true}
                        slotNumber={idx + 1}
                        onToggleCell={onToggleCell}
                        onAutoDaub={onAutoDaub}
                        onCheckBingo={onCheckBingo}
                        onBuyCarton={onBuyCarton}
                        onSelectCartonId={onSelectCartonId}
                        onOpenShopModal={() => setCartonCatalogOpen(true)}
                        onOpenWinningFigures={() => setWinningFiguresModalOpen(true)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick banner indicating multi-carton tips */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-yellow-400" />
                <span>
                  Estás viendo <strong>{displayCartonList.length} {displayCartonList.length === 1 ? "cartón" : "cartones simultáneos"}</strong>. Los números de la tómbola que coincidan se resaltan en cada uno de tus cartones.
                </span>
              </span>
              <button
                onClick={() => setCartonCatalogOpen(true)}
                className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
              >
                + Comprar más cartones disponibles
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL CATALOGO DE CARTONES (1 AL 200 - COMPRA CON SALDO DE CUENTA) */}
      {/* ========================================================================= */}
      <CartonCatalogModal
        isOpen={cartonCatalogOpen}
        onClose={() => setCartonCatalogOpen(false)}
        allCards={allCards}
        purchasedCardIds={purchasedCardIds}
        favoriteCardIds={favoriteCardIds}
        userBalance={userBalance}
        cartonPrice={cartonPrice}
        initialFilter={cartonCatalogTab}
        onBuyCarton={(cartonId) => {
          onBuyCarton(cartonId);
        }}
        onToggleFavorite={onToggleFavorite}
        onSelectCartonId={(id) => {
          onSelectCartonId(id);
        }}
        onOpenRecharge={onOpenRecharge}
        onEnterTableWithCarton={(id) => {
          onSelectCartonId(id);
          setViewMode("table");
        }}
      />

      {/* Vestidor & Tienda de Muñecos Modal */}
      <CharacterSelectModal
        isOpen={characterSelectOpen}
        onClose={() => setCharacterSelectOpen(false)}
        selectedCharacterId={activeCharacter.id}
        unlockedCharacterIds={unlockedCharIds}
        userBalance={userBalance}
        userWins={userWins}
        userGender={user.gender}
        onSelectCharacter={(id) => {
          if (onSelectCharacter) onSelectCharacter(id);
        }}
        onBuyCharacter={(char) => {
          if (onBuyCharacter) onBuyCharacter(char);
        }}
        onUnlockByWins={(char) => {
          if (onUnlockByWins) onUnlockByWins(char);
        }}
      />

      {/* Profile Modal for Player */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={user}
        onSaveProfile={onUpdateProfile || (() => {})}
      />

      {/* Top Rankings Modal */}
      <TopRankingsModal
        isOpen={topRankingsOpen}
        onClose={() => setTopRankingsOpen(false)}
        currentUserEmail={user.email}
        registeredUsers={registeredUsers}
      />

      {/* Winning Figures Guide Modal */}
      <WinningFiguresModal
        isOpen={winningFiguresModalOpen}
        onClose={() => setWinningFiguresModalOpen(false)}
      />

      {/* Floating Chat Button for quick access on table and lobby */}
      <button
        type="button"
        onClick={() => {
          setChatModalOpen(true);
          setUnreadChatCount(0);
        }}
        className="fixed bottom-5 right-5 z-40 bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 hover:from-sky-500 hover:to-indigo-500 text-white font-fredoka font-bold text-xs sm:text-sm px-4 py-3 rounded-full shadow-2xl border-2 border-sky-300 flex items-center gap-2 transition hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-sky-500/30 group"
        title="Abrir Chat para hablar con otros jugadores"
      >
        <div className="relative">
          <MessageSquare size={18} className="text-sky-200 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border border-slate-900 rounded-full animate-ping" />
        </div>
        <span>Chat Jugadores</span>
        {unreadChatCount > 0 && (
          <span className="bg-red-500 text-white text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold animate-pulse">
            {unreadChatCount}
          </span>
        )}
      </button>

      {/* Player-to-Player Live Chat Modal */}
      <PlayerChatModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        currentUser={user}
        friendEmails={friendEmails}
        activeDuo={activeDuo}
        onAddFriend={onAddFriend}
        onRemoveFriend={onRemoveFriend}
        onInviteDuo={onInviteDuo}
        onOpenDuoModal={() => setDuoModalOpen(true)}
      />

      {/* Duo Mode Team & Invitation Modal */}
      <DuoTeamModal
        isOpen={duoModalOpen}
        onClose={() => setDuoModalOpen(false)}
        currentUser={user}
        activeDuo={activeDuo}
        pendingInvite={pendingDuoInvite}
        onlinePlayers={onlinePlayers}
        friendEmails={friendEmails}
        plataEnJuego={plataEnJuego}
        onSendInvite={(targetEmail, targetName, targetAvatar) => {
          if (onInviteDuo) {
            onInviteDuo(targetEmail, targetName, targetAvatar);
          }
        }}
        onAcceptInvite={(invite) => {
          if (onAcceptDuoInvite) {
            onAcceptDuoInvite(invite);
          }
        }}
        onDeclineInvite={() => {
          if (onDeclineDuoInvite) {
            onDeclineDuoInvite();
          }
        }}
        onLeaveDuo={() => {
          if (onLeaveDuo) {
            onLeaveDuo();
          }
          setDuoModalOpen(false);
        }}
      />

      {/* Menú Lateral Desplegable (3 Rayitas) */}
      <PlayerSideDrawer
        isOpen={sideDrawerOpen}
        onClose={() => setSideDrawerOpen(false)}
        user={user}
        userBalance={userBalance}
        activeCharacter={activeCharacter}
        unreadChatCount={unreadChatCount}
        activeDuo={activeDuo}
        onOpenDuoModal={() => setDuoModalOpen(true)}
        onOpenChat={() => {
          setChatModalOpen(true);
          setUnreadChatCount(0);
        }}
        onOpenCharacterSelect={() => setCharacterSelectOpen(true)}
        onOpenHowToWin={() => setWinningFiguresModalOpen(true)}
        onOpenTopRankings={() => setTopRankingsOpen(true)}
        onOpenStats={onOpenStats}
        onOpenHelp={onOpenHelp}
        onOpenTransactionHistory={() => setTransactionHistoryOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenRecharge={onOpenRecharge}
        onOpenNotifications={() => setNotificationsModalOpen(true)}
        unreadNotificationsCount={unreadNotificationsCount}
        torneoConfig={torneoConfig}
        onOpenTorneoBilletal={() => setIsTorneoModalOpen(true)}
        onLogout={onLogout}
      />

      {/* Historial de Transacciones Modal (Solo accesible desde el menú) */}
      <TransactionHistoryModal
        isOpen={transactionHistoryOpen}
        onClose={() => setTransactionHistoryOpen(false)}
        history={history}
        rechargeRequests={rechargeRequests}
        withdrawRequests={withdrawRequests}
        userEmail={user.email}
      />

      {/* Campanita de Notificaciones Modal */}
      <NotificationsModal
        isOpen={notificationsModalOpen}
        onClose={() => setNotificationsModalOpen(false)}
        notifications={notifications}
        onMarkAsRead={(id) => onMarkNotificationAsRead?.(id)}
        onMarkAllAsRead={() => onMarkAllNotificationsAsRead?.()}
        onDeleteNotification={(id) => onDeleteNotification?.(id)}
        onAcceptDuoInvite={(inviteId, fromEmail, fromName, fromAvatar) => {
          if (onAcceptDuoInvite) {
            onAcceptDuoInvite({
              id: inviteId,
              fromEmail,
              fromName,
              fromAvatar,
              toEmail: user.email,
              toName: user.name || user.email.split("@")[0],
              status: "ACCEPTED",
              timestamp: Date.now(),
            });
          }
          setNotificationsModalOpen(false);
        }}
        onRejectDuoInvite={() => {
          if (onDeclineDuoInvite) onDeclineDuoInvite();
        }}
        onAcceptFriendRequest={(friendEmail, friendName, friendAvatar) => {
          if (onAcceptFriendRequest) {
            onAcceptFriendRequest(friendEmail, friendName, friendAvatar);
          } else if (onAddFriend) {
            onAddFriend(friendEmail);
          }
        }}
        onRejectFriendRequest={(notifId) => {
          if (onRejectFriendRequest) onRejectFriendRequest(notifId);
        }}
        onOpenRecharge={onOpenRecharge}
      />

      {/* Torneo Billetal Modal (Habilitado / Usuarios Cerrados) */}
      {torneoConfig && (
        <TorneoBilletalModal
          isOpen={isTorneoModalOpen}
          onClose={() => setIsTorneoModalOpen(false)}
          config={torneoConfig}
          user={user}
          onEnroll={onEnrollTorneo}
          onEnterBattleArena={onEnterBattleArena}
          onOpenRecharge={onOpenRecharge}
        />
      )}
    </div>
  );
};
