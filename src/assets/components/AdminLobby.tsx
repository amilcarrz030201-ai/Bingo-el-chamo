import React, { useState, useEffect } from "react";
import { UserProfile, BingoCard, RechargeRequest, WithdrawRequest, RegisteredUser, WonGameRecord, HistoryRecord, TorneoBilletalConfig, AdminGameEarning } from "../types";
import { MasterBoard } from "./MasterBoard";
import { getBallLetter, evaluateCardFigure } from "../utils/bingo";
import { RotatingMeshTombola } from "./RotatingMeshTombola";
import { TopRankingsModal } from "./TopRankingsModal";
import { AdminUsersListModal } from "./AdminUsersListModal";
import { AdminActivePlayersModal } from "./AdminActivePlayersModal";
import { AdminBanManagerModal } from "./AdminBanManagerModal";
import { AdminTransactionHistoryModal } from "./AdminTransactionHistoryModal";
import { PlayerChatModal } from "./PlayerChatModal";
import { subscribeToChatMessages } from "../supabase";
import { AdminPaymentBar } from "./AdminPaymentBar";
import { AdminWinApprovalModal } from "./AdminWinApprovalModal";
import { AdminPlataEnJuegoCard } from "./AdminPlataEnJuegoCard";
import { AdminCartonPriceCard } from "./AdminCartonPriceCard";
import { AdminTorneoBilletalModal } from "./AdminTorneoBilletalModal";
import { AdminDineroPorPartidaModal } from "./AdminDineroPorPartidaModal";
import { ChristmasTree } from "./ChristmasTree";
import { ChristmasLights } from "./ChristmasLights";
import { ChristmasCornerGarland, HangingBauble, ChristmasFestiveBanner } from "./ChristmasOrnaments";
import { BINGO_LOGO_SRC } from "../constants/logo";
import {
  ShieldAlert,
  Dice5,
  RotateCcw,
  Bot,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Trophy,
  History,
  Eye,
  LogOut,
  Users,
  Sparkles,
  Radio,
  Clock,
  ArrowDownRight,
  PlusCircle,
  UserCheck,
  Coins,
  Ticket,
  ChevronUp,
  ChevronDown,
  Menu,
  Camera,
  Crown,
  MapPin,
  Zap,
  MessageSquare,
  BarChart3,
  Sliders,
  Wrench,
  Ban,
  AlertTriangle,
  Search,
  Check,
  DollarSign,
  Download,
} from "lucide-react";
import { DEFAULT_COMMUNITY_USERS, isBotAccount } from "../data/communityUsers";
import { AdminFinancialTrendsChart } from "./AdminFinancialTrendsChart";
import { CantadoSpeedConfig } from "./CantadoSpeedConfig";
import { ProfileModal } from "./ProfileModal";
import { AdminGameTimerModal } from "./AdminGameTimerModal";

interface Props {
  user: UserProfile;
  drawnBalls: number[];
  currentBall: number | null;
  totalBalls: number;
  allCards: BingoCard[];
  plataEnJuego: number;
  totalCartonesEnJuego?: number;
  cartonPrice?: number;
  onUpdateCartonPrice?: (newPrice: number) => void;
  onUpdatePlataEnJuego: (amount: number) => void;
  rechargeRequests: RechargeRequest[];
  withdrawRequests?: WithdrawRequest[];
  history?: HistoryRecord[];
  registeredUsers?: RegisteredUser[];
  onRefreshUsers?: () => void;
  currentWonGame?: WonGameRecord | null;
  wonGamesHistory?: WonGameRecord[];
  onSetPrizeAndPay?: (gameId: string, amountVES: number, ref?: string, notes?: string) => void;
  onRejectWin?: (gameId: string, reason?: string) => void;
  roomCountdown: string;
  roomSeconds?: number;
  configuredRoomDuration?: number;
  isRoomTimerPaused?: boolean;
  onUpdateRemainingSeconds?: (seconds: number) => void;
  onUpdateConfiguredRoomDuration?: (seconds: number) => void;
  onTogglePauseRoomTimer?: () => void;
  onResetRoomTimer?: () => void;
  onAdjustRemainingSeconds?: (deltaSeconds: number) => void;
  autoMode: boolean;
  drawIntervalSeconds?: number;
  onChangeDrawInterval?: (seconds: number) => void;
  secondsUntilNextBall?: number;
  onDrawNextBall: () => void;
  onResetTombola: () => void;
  onToggleAutoMode: () => void;
  onApproveRecharge: (id: string, approvedAmount?: number) => void;
  onRejectRecharge: (id: string, reason?: string) => void;
  onApproveWithdraw?: (id: string, approvedAmount?: number) => void;
  onRejectWithdraw?: (id: string, reason?: string) => void;
  onAdjustUserBalance?: (email: string, mode: "SET" | "ADD" | "SUBTRACT", amountVES: number, notes?: string) => void;
  onUpdateProfile?: (updates: {
    name?: string;
    avatar?: string;
    pagoMovilPhone?: string;
    pagoMovilBank?: string;
    pagoMovilId?: string;
  }) => void;
  isMaintenanceMode?: boolean;
  onToggleMaintenance?: (enabled: boolean) => void;
  onToggleBanUser?: (email: string, ban: boolean, reason?: string) => void;
  torneoConfig?: TorneoBilletalConfig;
  onUpdateTorneoConfig?: (config: TorneoBilletalConfig) => void;
  isSpecialBall?: boolean;
  isWinningBall?: boolean;
  specialBallLabel?: string;
  adminEarnings?: AdminGameEarning[];
  onLogout: () => void;
}

export const AdminLobby: React.FC<Props> = ({
  user,
  drawnBalls,
  currentBall,
  totalBalls,
  allCards,
  plataEnJuego,
  totalCartonesEnJuego = 0,
  cartonPrice = 60,
  onUpdateCartonPrice = () => {},
  onUpdatePlataEnJuego,
  isSpecialBall = false,
  isWinningBall = false,
  specialBallLabel,
  rechargeRequests,
  withdrawRequests = [],
  history = [],
  registeredUsers = [],
  onRefreshUsers,
  currentWonGame = null,
  wonGamesHistory = [],
  onSetPrizeAndPay,
  onRejectWin,
  roomCountdown,
  roomSeconds = 1800,
  configuredRoomDuration = 1800,
  isRoomTimerPaused = false,
  onUpdateRemainingSeconds,
  onUpdateConfiguredRoomDuration,
  torneoConfig,
  onUpdateTorneoConfig,
  onTogglePauseRoomTimer,
  onResetRoomTimer,
  onAdjustRemainingSeconds,
  autoMode,
  drawIntervalSeconds = 4,
  onChangeDrawInterval = () => {},
  secondsUntilNextBall,
  onDrawNextBall,
  onResetTombola,
  onToggleAutoMode,
  onApproveRecharge,
  onRejectRecharge,
  onApproveWithdraw,
  onRejectWithdraw,
  onAdjustUserBalance,
  onUpdateProfile,
  isMaintenanceMode = false,
  onToggleMaintenance,
  onToggleBanUser,
  adminEarnings = [],
  onLogout,
}) => {
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedVoucherModal, setSelectedVoucherModal] = useState<string | null>(null);
  const [topsModalOpen, setTopsModalOpen] = useState(false);
  const [selectedTopCategory, setSelectedTopCategory] = useState<"ALL" | "GLOBAL" | "REGIONAL" | "COMPETIDOR">("ALL");
  const [usersListModalOpen, setUsersListModalOpen] = useState(false);
  const [activePlayersModalOpen, setActivePlayersModalOpen] = useState(false);
  const [banManagerModalOpen, setBanManagerModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [adminChatModalOpen, setAdminChatModalOpen] = useState(false);
  const [adminUnreadChatCount, setAdminUnreadChatCount] = useState(0);
  const [winApprovalModalOpen, setWinApprovalModalOpen] = useState(false);
  const [timerConfigModalOpen, setTimerConfigModalOpen] = useState(false);
  const [torneoModalOpen, setTorneoModalOpen] = useState(false);
  const [dineroPorPartidaModalOpen, setDineroPorPartidaModalOpen] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  const handleDownloadProjectZip = async () => {
    if (isDownloadingZip) return;
    setIsDownloadingZip(true);
    try {
      const response = await fetch("/api/download/zip");
      if (!response.ok) throw new Error("No se pudo generar el ZIP");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "BingoElChamo_ProyectoCompleto.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (err) {
      console.error("Error downloading project ZIP:", err);
      // Fallback direct navigation if fetch blob fails
      window.location.href = "/api/download/zip";
    } finally {
      setIsDownloadingZip(false);
    }
  };

  // Total acumulado por el administrador (20% de cada partida terminada)
  const totalAdminEarnings20 = React.useMemo(() => {
    return adminEarnings.reduce((acc, curr) => acc + (Number(curr.adminEarnings20) || 0), 0);
  }, [adminEarnings]);

  // Escuchar mensajes en tiempo real desde Supabase para notificar al Admin
  useEffect(() => {
    let lastSeenCount = -1;
    const unsubscribe = subscribeToChatMessages((liveMessages) => {
      if (lastSeenCount === -1) {
        lastSeenCount = liveMessages.length;
        return;
      }
      if (!adminChatModalOpen && liveMessages.length > lastSeenCount) {
        const diff = liveMessages.length - lastSeenCount;
        setAdminUnreadChatCount((prev) => prev + diff);
      }
      lastSeenCount = liveMessages.length;
    });

    return () => {
      unsubscribe();
    };
  }, [adminChatModalOpen]);

  // Total banned accounts count
  const bannedPlayersCount = React.useMemo(() => {
    return registeredUsers.filter((u) => u.isBanned).length;
  }, [registeredUsers]);

  // Filter out bots & admin for real player tops in admin lobby (Cero Bots: Solo Personas Reales)
  const realPlayers = React.useMemo(() => {
    return registeredUsers.filter((u) => {
      if (!u || !u.email) return false;
      const cleanEmail = u.email.toLowerCase().trim();
      if (cleanEmail === "admin@bingoelchamo.com" || (u as any).role === "ADMIN") return false;
      if (isBotAccount(cleanEmail, u.id)) return false;
      return true;
    });
  }, [registeredUsers]);

  // Top Globales: 20 o más victorias
  const globalPlayers = React.useMemo(() => {
    return realPlayers
      .filter((u) => (u.stats?.victorias ?? u.stats?.bingos ?? 0) >= 20)
      .sort((a, b) => {
        const winsA = a.stats?.victorias ?? a.stats?.bingos ?? 0;
        const winsB = b.stats?.victorias ?? b.stats?.bingos ?? 0;
        if (winsB !== winsA) return winsB - winsA;
        return (b.balance || 0) - (a.balance || 0);
      });
  }, [realPlayers]);

  // Top Regionales: 10 a 19 victorias
  const regionalPlayers = React.useMemo(() => {
    return realPlayers
      .filter((u) => {
        const wins = u.stats?.victorias ?? u.stats?.bingos ?? 0;
        return wins >= 10 && wins <= 19;
      })
      .sort((a, b) => {
        const winsA = a.stats?.victorias ?? a.stats?.bingos ?? 0;
        const winsB = b.stats?.victorias ?? b.stats?.bingos ?? 0;
        if (winsB !== winsA) return winsB - winsA;
        return (b.balance || 0) - (a.balance || 0);
      });
  }, [realPlayers]);

  // Chamos Competidores SoloQ: 1 a 9 victorias
  const competidorPlayers = React.useMemo(() => {
    return realPlayers
      .filter((u) => {
        const wins = u.stats?.victorias ?? u.stats?.bingos ?? 0;
        return wins >= 1 && wins <= 9;
      })
      .sort((a, b) => {
        const winsA = a.stats?.victorias ?? a.stats?.bingos ?? 0;
        const winsB = b.stats?.victorias ?? b.stats?.bingos ?? 0;
        if (winsB !== winsA) return winsB - winsA;
        return (b.balance || 0) - (a.balance || 0);
      });
  }, [realPlayers]);

  const openTopCategory = (cat: "GLOBAL" | "REGIONAL" | "COMPETIDOR") => {
    setSelectedTopCategory(cat);
    setTopsModalOpen(true);
  };
  const [adminRequestsTab, setAdminRequestsTab] = useState<"recargas" | "retiros">("recargas");
  const [editApprovedAmounts, setEditApprovedAmounts] = useState<Record<string, string>>({});
  const [editWithdrawAmounts, setEditWithdrawAmounts] = useState<Record<string, string>>({});
  const [isAdminMenuMaximized, setIsAdminMenuMaximized] = useState<boolean>(() => {
    try {
      return localStorage.getItem("chamo_admin_menu_maximized") !== "false";
    } catch {
      return true;
    }
  });

  const toggleAdminMenu = () => {
    setIsAdminMenuMaximized((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("chamo_admin_menu_maximized", String(next));
      } catch {}
      return next;
    });
  };

  // State for top admin bar quick accounts visibility & search
  const [quickAccountsSearch, setQuickAccountsSearch] = useState<string>("");
  const [isAccountsBarExpanded, setIsAccountsBarExpanded] = useState<boolean>(true);

  // Guarantee all community players + registered users are visible in admin bar
  const displayAccounts = React.useMemo(() => {
    const map = new Map<string, RegisteredUser>();

    // 1. Default community players
    DEFAULT_COMMUNITY_USERS.forEach((p) => {
      map.set(p.email.toLowerCase().trim(), { ...p });
    });

    // 2. Incoming registeredUsers prop
    if (Array.isArray(registeredUsers)) {
      registeredUsers.forEach((u) => {
        if (u && u.email) {
          const clean = u.email.toLowerCase().trim();
          const existing = map.get(clean);
          map.set(clean, {
            ...existing,
            ...u,
            id: u.id || existing?.id || `user-${clean}`,
          });
        }
      });
    }

    // 3. Filter out admin accounts and bots so only genuine registered players are listed
    const list: RegisteredUser[] = [];
    map.forEach((player) => {
      const cleanEmail = player.email.toLowerCase().trim();
      if (
        cleanEmail === "admin@bingoelchamo.com" ||
        (player as any).role === "ADMIN" ||
        isBotAccount(cleanEmail, player.id)
      ) {
        return;
      }

      // Sync ban state from localStorage if present
      let isBanned = player.isBanned ?? false;
      let bannedReason = player.bannedReason;
      let bannedAt = player.bannedAt;
      try {
        const banData = localStorage.getItem(`chamo_banned_${cleanEmail}`);
        if (banData) {
          const parsed = JSON.parse(banData);
          if (parsed.isBanned) {
            isBanned = true;
            bannedReason = parsed.bannedReason || bannedReason;
            bannedAt = parsed.bannedAt || bannedAt;
          }
        }
      } catch {}

      list.push({
        ...player,
        isBanned,
        bannedReason,
        bannedAt,
      });
    });

    return list;
  }, [registeredUsers]);

  const filteredDisplayAccounts = React.useMemo(() => {
    const q = quickAccountsSearch.toLowerCase().trim();
    if (!q) return displayAccounts;
    return displayAccounts.filter((p) => {
      return (
        p.name?.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.pagoMovilPhone?.includes(q) ||
        p.pagoMovilBank?.toLowerCase().includes(q) ||
        p.pagoMovilId?.toLowerCase().includes(q) ||
        (p.isBanned ? "baneado" : "activo").includes(q)
      );
    });
  }, [displayAccounts, quickAccountsSearch]);

  // Auto-open win approval modal whenever a game is in PENDING_AMOUNT status
  React.useEffect(() => {
    if (currentWonGame && currentWonGame.status === "PENDING_AMOUNT") {
      setWinApprovalModalOpen(true);
    }
  }, [currentWonGame]);

  const remaining = totalBalls - drawnBalls.length;
  const currentLetter = currentBall ? getBallLetter(currentBall) : "BINGO";

  // Calculate top cartons progress in real time
  const cartonLeaderboard = allCards
    .map((card) => {
      const evalResult = evaluateCardFigure(card, drawnBalls);
      return {
        id: card.id,
        hits: evalResult.matchedCells,
        isWinner: evalResult.isWinner,
        patternName: evalResult.patternName,
      };
    })
    .sort((a, b) => b.hits - a.hits)
    .slice(0, 10);

  const pendingRequests = rechargeRequests.filter((r) => r.estado === "PENDIENTE");
  const historyRequests = rechargeRequests.filter((r) => r.estado !== "PENDIENTE");
  const pendingWithdrawals = withdrawRequests.filter((w) => w.estado === "PENDIENTE");
  const historyWithdrawals = withdrawRequests.filter((w) => w.estado !== "PENDIENTE");

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-red-950/50 text-slate-100">
      {/* ========================================================================= */}
      {/* 1. Collapsed / Minimized Admin Bar (When isAdminMenuMaximized is false) */}
      {/* ========================================================================= */}
      {!isAdminMenuMaximized && (
        <header className="bg-slate-900/95 border-b border-amber-500/40 sticky top-0 z-30 backdrop-blur-md px-3 py-2 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 flex-wrap">
            {/* Left: Logo & Title */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-500 p-0.5 shadow border border-yellow-300 overflow-hidden shrink-0 flex items-center justify-center">
                <img
                  src={BINGO_LOGO_SRC}
                  alt="Logo Bingo el Chamo"
                  className="w-full h-full object-cover rounded-[10px]"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-fredoka text-sm font-bold text-yellow-300">Bingo el Chamo</span>
                <span className="text-[9px] bg-yellow-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                  ADMIN
                </span>
              </div>
            </div>

            {/* Center: Essential Game Stats */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Plata en juego */}
              <div className="bg-amber-950/60 border border-yellow-500/50 rounded-xl px-2.5 py-1 flex items-center gap-1.5 text-xs font-mono">
                <Coins size={13} className="text-yellow-400 shrink-0" />
                <span className="font-black text-yellow-300">{plataEnJuego.toFixed(2)} VES</span>
              </div>

              {/* Countdown (Clickable to configure next game time) */}
              <button
                type="button"
                onClick={() => setTimerConfigModalOpen(true)}
                className={`border rounded-xl px-2.5 py-1 flex items-center gap-1.5 text-xs font-mono transition cursor-pointer shadow hover:scale-105 active:scale-95 ${
                  isRoomTimerPaused
                    ? "bg-amber-950/80 border-amber-500/60 text-amber-300 ring-1 ring-amber-400/40"
                    : "bg-blue-950/80 border-cyan-500/50 text-cyan-300 hover:border-cyan-300"
                }`}
                title="Configurar tiempo de la próxima partida (Hacer clic para editar)"
              >
                <Clock size={12} className={isRoomTimerPaused ? "text-amber-400" : "text-cyan-400 animate-spin"} />
                <span className="font-bold">
                  {isRoomTimerPaused ? `⏸️ ${roomCountdown}` : roomCountdown}
                </span>
                <span className="text-[10px] text-cyan-300 bg-cyan-950/80 px-1 py-0.2 rounded border border-cyan-700/60 font-fredoka">
                  Ajustar
                </span>
              </button>

              {/* Cadencia Cantado Badge */}
              <div className="bg-slate-950 border border-amber-500/40 rounded-xl px-2.5 py-1 flex items-center gap-1.5 text-xs font-mono">
                <span className="text-amber-400">⏱️</span>
                <span className="text-[11px] text-yellow-300 font-bold">{drawIntervalSeconds}s</span>
              </div>

              {/* Pending Requests alerts */}
              {(pendingRequests.length > 0 || pendingWithdrawals.length > 0) && (
                <button
                  type="button"
                  onClick={() => {
                    if (pendingWithdrawals.length > 0) {
                      setAdminRequestsTab("retiros");
                    } else {
                      setAdminRequestsTab("recargas");
                    }
                    toggleAdminMenu();
                  }}
                  className="bg-red-900/80 border border-red-500/60 text-white text-[11px] font-fredoka font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-md animate-pulse cursor-pointer"
                  title="Ver solicitudes pendientes"
                >
                  <span className="w-2 h-2 rounded-full bg-yellow-400" />
                  <span>
                    {pendingWithdrawals.length > 0 ? `${pendingWithdrawals.length} Retiros` : `${pendingRequests.length} Recargas`}
                  </span>
                </button>
              )}

              {/* Quick Separated Tops Pills in Minimized Bar */}
              <div className="hidden xl:flex items-center gap-1.5 border-l border-amber-500/30 pl-2">
                <button
                  type="button"
                  onClick={() => openTopCategory("GLOBAL")}
                  className="bg-amber-500/20 hover:bg-amber-500/30 text-yellow-300 border border-amber-500/50 px-2 py-1 rounded-xl text-xs font-fredoka font-bold flex items-center gap-1 cursor-pointer transition hover:scale-105 active:scale-95"
                  title="Ver listado de Tops Globales (20+ ganadas)"
                >
                  <Crown size={12} className="text-yellow-400" />
                  <span>Globales: {globalPlayers.length}</span>
                </button>
                <button
                  type="button"
                  onClick={() => openTopCategory("REGIONAL")}
                  className="bg-blue-500/20 hover:bg-blue-500/30 text-cyan-300 border border-blue-500/50 px-2 py-1 rounded-xl text-xs font-fredoka font-bold flex items-center gap-1 cursor-pointer transition hover:scale-105 active:scale-95"
                  title="Ver listado de Tops Regionales (10 a 19 ganadas)"
                >
                  <MapPin size={12} className="text-cyan-400" />
                  <span>Regionales: {regionalPlayers.length}</span>
                </button>
                <button
                  type="button"
                  onClick={() => openTopCategory("COMPETIDOR")}
                  className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 px-2 py-1 rounded-xl text-xs font-fredoka font-bold flex items-center gap-1 cursor-pointer transition hover:scale-105 active:scale-95"
                  title="Ver listado de Chamos Competidores SoloQ (1 a 9 ganadas)"
                >
                  <Zap size={12} className="text-emerald-400" />
                  <span>SoloQ: {competidorPlayers.length}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePlayersModalOpen(true)}
                  className="bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/50 px-2 py-1 rounded-xl text-xs font-fredoka font-bold flex items-center gap-1 cursor-pointer transition hover:scale-105 active:scale-95"
                  title="Ver lista de jugadores activos y tiempo que llevan desconectados"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Jugadores Activos</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDineroPorPartidaModalOpen(true)}
                  className="bg-emerald-500/25 hover:bg-emerald-500/35 text-emerald-300 border border-emerald-500/50 px-2.5 py-1 rounded-xl text-xs font-fredoka font-bold flex items-center gap-1.5 cursor-pointer transition hover:scale-105 active:scale-95 shadow"
                  title="Menú del Administrador: Dinero por Partida (Tienes el 20% de cada partida jugada)"
                >
                  <DollarSign size={12} className="text-emerald-400" />
                  <span>
                    {adminEarnings.length === 0
                      ? "Dinero por Partida (20%)"
                      : adminEarnings.length === 1
                      ? "Tienes 20% de 1 partida"
                      : `Tienes 20% de ${adminEarnings.length} partidas`}
                  </span>
                  <span className="bg-emerald-600 text-white text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold shadow">
                    +{totalAdminEarnings20.toFixed(0)} VES
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryModalOpen(true)}
                  className="bg-amber-500/20 hover:bg-amber-500/30 text-yellow-300 border border-amber-500/50 px-2 py-1 rounded-xl text-xs font-fredoka font-bold flex items-center gap-1 cursor-pointer transition hover:scale-105 active:scale-95"
                  title="Historial de Transacciones con Filtros"
                >
                  <History size={12} className="text-yellow-400" />
                  <span>Historial</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAdminChatModalOpen(true);
                    setAdminUnreadChatCount(0);
                  }}
                  className="relative bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/50 px-2 py-1 rounded-xl text-xs font-fredoka font-bold flex items-center gap-1 cursor-pointer transition hover:scale-105 active:scale-95"
                  title="Ver Chat de Jugadores en Vivo (Supabase)"
                >
                  <MessageSquare size={12} className="text-sky-400" />
                  <span>Chat Jugadores</span>
                  {adminUnreadChatCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold animate-pulse shadow">
                      {adminUnreadChatCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setBanManagerModalOpen(true)}
                  className="bg-red-600/25 hover:bg-red-600/40 text-red-300 hover:text-white border border-red-500/50 px-2 py-1 rounded-xl text-xs font-fredoka font-bold flex items-center gap-1 cursor-pointer transition hover:scale-105 active:scale-95 shadow"
                  title="Menú de Administrador: Banear Usuarios y ver cuentas activas"
                >
                  <Ban size={12} className="text-red-400" />
                  <span>Banear Usuarios</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTorneoModalOpen(true)}
                  className={`px-2 py-1 rounded-xl text-xs font-fredoka font-bold flex items-center gap-1 cursor-pointer transition hover:scale-105 active:scale-95 shadow ${
                    torneoConfig?.isEnabled
                      ? "bg-amber-500/30 text-yellow-300 border border-yellow-400/80 ring-1 ring-yellow-400/50 animate-pulse"
                      : "bg-slate-800/90 text-slate-300 border border-slate-700 hover:text-white"
                  }`}
                  title={
                    torneoConfig?.isEnabled
                      ? "Torneo Billetal Habilitado (Activo para usuarios). Clic para configurar o deshabilitar."
                      : "Torneo Billetal Deshabilitado (Cerrado a usuarios). Clic para habilitar."
                  }
                >
                  <Trophy size={12} className={torneoConfig?.isEnabled ? "text-yellow-400" : "text-slate-400"} />
                  <span>
                    {torneoConfig?.isEnabled ? "🏆 Torneo: ON" : "🔒 Torneo: OFF"}
                  </span>
                </button>
              </div>
            </div>

            {/* Right: Profile Photo, Ban Button, Maximize Button & Exit */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBanManagerModalOpen(true)}
                className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-fredoka font-black text-xs px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 border border-red-300 transition cursor-pointer active:scale-95"
                title="Menú de Administrador: Banear Usuarios y ver cuentas activas"
              >
                <Ban size={14} className="text-white animate-pulse" />
                <span>Banear</span>
                {bannedPlayersCount > 0 && (
                  <span className="bg-red-950 text-red-200 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold border border-red-400">
                    {bannedPlayersCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setProfileModalOpen(true)}
                className="flex items-center gap-1.5 bg-slate-950/80 hover:bg-slate-800 border border-amber-500/40 p-1 pr-2 rounded-xl transition cursor-pointer"
                title="Cambiar Foto de Perfil del Administrador"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-600 p-0.5 flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    user.avatar.startsWith("data:") || user.avatar.startsWith("http") ? (
                      <img src={user.avatar} alt="Admin" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span className="text-xs">{user.avatar}</span>
                    )
                  ) : (
                    <span className="text-[11px]">👑</span>
                  )}
                </div>
                <Camera size={11} className="text-amber-400" />
              </button>

              <button
                type="button"
                onClick={toggleAdminMenu}
                className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 active:scale-95 text-slate-950 font-fredoka font-black text-xs px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-1.5 border-2 border-yellow-200 transition cursor-pointer"
                title="Maximizar el menú para ver todas las herramientas de administración"
              >
                <Menu size={14} />
                <span>Maximizar Menú</span>
                <ChevronDown size={14} />
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="bg-red-950/80 hover:bg-red-900 text-red-300 text-xs font-fredoka font-bold px-2.5 py-1.5 rounded-xl border border-red-800/80 flex items-center gap-1 transition cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Floating Re-open / Maximize Pill (Always accessible on small screens when collapsed) */}
      {!isAdminMenuMaximized && (
        <div className="fixed top-2.5 right-2.5 z-40 flex items-center gap-1.5 md:hidden">
          <button
            type="button"
            onClick={() => setBanManagerModalOpen(true)}
            className="bg-gradient-to-r from-red-600 to-rose-600 text-white font-fredoka font-black text-xs px-3 py-1.5 rounded-full shadow-2xl flex items-center gap-1 border border-red-300 active:scale-95 transition cursor-pointer"
            title="Banear Usuarios"
          >
            <Ban size={13} />
            <span>Banear</span>
          </button>
          <button
            type="button"
            onClick={toggleAdminMenu}
            className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-fredoka font-bold text-xs px-3 py-1.5 rounded-full shadow-2xl flex items-center gap-1.5 border border-yellow-200 active:scale-95 transition cursor-pointer"
            title="Maximizar Menú Admin"
          >
            <Menu size={13} />
            <span>Menú Admin</span>
            <ChevronDown size={13} />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. Full Maximized Admin Bar (When isAdminMenuMaximized is true) */}
      {/* ========================================================================= */}
      {isAdminMenuMaximized && (
        <header className="bg-slate-900/95 border-b border-amber-500/40 sticky top-0 z-30 backdrop-blur-md px-4 py-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          {/* Banner de Mantenimiento Activo para el Administrador */}
          {isMaintenanceMode && (
            <div className="max-w-7xl mx-auto mb-3 bg-gradient-to-r from-red-950 via-amber-950 to-red-950 border-2 border-red-500/80 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs shadow-xl animate-pulse">
              <div className="flex items-center gap-2.5 text-red-200">
                <div className="w-8 h-8 rounded-xl bg-red-600/30 border border-red-400 flex items-center justify-center text-yellow-300 shrink-0">
                  <Wrench size={16} className="animate-spin" style={{ animationDuration: "6s" }} />
                </div>
                <div>
                  <strong className="text-white font-fredoka uppercase tracking-wider text-sm flex items-center gap-1.5">
                    <span>⚠️ MODO MANTENIMIENTO ACTIVO EN TODA LA APP</span>
                  </strong>
                  <p className="text-[11px] text-slate-300">
                    A todos los jugadores activos les aparece la pantalla de mantenimiento bloqueándoles el acceso.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onToggleMaintenance && onToggleMaintenance(false)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-fredoka font-black px-4 py-2 rounded-xl shadow-lg cursor-pointer text-xs shrink-0 transition active:scale-95 border border-emerald-400"
              >
                Reabrir App a Jugadores
              </button>
            </div>
          )}

          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center justify-between w-full md:w-auto gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 p-0.5 shadow-xl border-2 border-yellow-300 overflow-hidden shrink-0 flex items-center justify-center">
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
                    <span className="text-[10px] bg-yellow-500 text-slate-950 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider font-sans">
                      ADMINISTRADOR
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                    {user.email} (Acceso Total a la Sala)
                  </p>
                </div>
              </div>

              {/* Mobile button to hide menu right inside the logo row */}
              <button
                type="button"
                onClick={toggleAdminMenu}
                className="md:hidden bg-slate-950 hover:bg-slate-800 text-amber-300 font-fredoka font-bold text-xs px-2.5 py-1.5 rounded-xl border border-amber-500/50 flex items-center gap-1 transition cursor-pointer"
                title="Ocultar menú"
              >
                <ChevronUp size={14} className="text-amber-400" />
                <span>Ocultar</span>
              </button>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Plata en juego Badge */}
              <div className="bg-gradient-to-r from-amber-600/30 via-yellow-500/25 to-amber-700/30 border-2 border-yellow-400 rounded-2xl px-3.5 py-1.5 flex items-center gap-2.5 shadow-lg shadow-amber-500/20">
                <Coins size={18} className="text-yellow-400 shrink-0 animate-pulse" />
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] uppercase font-bold text-yellow-300 tracking-wider">
                      (Plata en juego)
                    </span>
                    <span className="text-[9px] text-amber-200 font-mono">
                      ({totalCartonesEnJuego} {totalCartonesEnJuego === 1 ? "cartón" : "cartones"})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-fredoka text-sm sm:text-base font-black text-yellow-300 font-mono">
                      {plataEnJuego.toFixed(2)} VES
                    </span>
                    <span className="text-[10px] text-emerald-950 font-black bg-emerald-400 px-1.5 py-0.2 rounded-md border border-emerald-300 font-mono shadow">
                      80%: {(plataEnJuego * 0.8).toFixed(2)} VES
                    </span>
                  </div>
                </div>
              </div>

              {/* Countdown Badge (Clickable to Configure Next Game Timer) */}
              <button
                type="button"
                onClick={() => setTimerConfigModalOpen(true)}
                className={`border-2 rounded-2xl px-3.5 py-1.5 flex items-center gap-2.5 shadow-md transition cursor-pointer text-left hover:scale-[1.02] active:scale-95 ${
                  isRoomTimerPaused
                    ? "bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-amber-500/80 text-amber-200 ring-2 ring-amber-400/40 shadow-amber-950/50"
                    : "bg-gradient-to-r from-blue-950 via-indigo-900/90 to-blue-950 border-cyan-400/70 hover:border-cyan-300 shadow-cyan-950/50"
                }`}
                title="Hacer clic para configurar el tiempo restante de las próximas partidas"
              >
                <div className={`p-1.5 rounded-xl border ${isRoomTimerPaused ? "bg-amber-500/20 border-amber-400/50 text-amber-300" : "bg-cyan-500/20 border-cyan-400/50 text-cyan-300"}`}>
                  <Clock size={16} className={isRoomTimerPaused ? "" : "animate-spin"} />
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] uppercase font-bold text-cyan-300">Próxima Partida</span>
                    <span className="text-[8px] bg-cyan-400/20 text-cyan-200 border border-cyan-400/30 px-1 py-0.2 rounded font-mono">
                      ⚙️ Ajustar
                    </span>
                  </div>
                  <span className="font-fredoka text-xs sm:text-sm font-black text-cyan-200 font-mono flex items-center gap-1">
                    {isRoomTimerPaused && <span className="text-amber-400 text-xs">⏸️</span>}
                    {roomCountdown}
                  </span>
                </div>
              </button>

              {/* Pending Recharges Badge */}
              <button
                type="button"
                onClick={() => setAdminRequestsTab("recargas")}
                className={`border-2 rounded-2xl px-3.5 py-1.5 flex items-center gap-2 transition cursor-pointer shadow-md ${
                  adminRequestsTab === "recargas"
                    ? "bg-gradient-to-r from-amber-500/40 via-orange-500/30 to-amber-500/40 border-yellow-300 text-yellow-200 ring-2 ring-yellow-400/50"
                    : "bg-slate-900 border-amber-500/50 text-amber-300 hover:border-yellow-400"
                }`}
                title="Ver Solicitudes de Recarga Pago Móvil"
              >
                <Users size={16} className="text-amber-400" />
                <div className="flex flex-col text-left">
                  <span className="text-[9px] uppercase font-bold text-slate-300">Recargas</span>
                  <span className="font-fredoka text-xs font-bold text-amber-300 font-mono">
                    {pendingRequests.length} pendientes
                  </span>
                </div>
              </button>

              {/* Pending Withdrawals Badge */}
              <button
                type="button"
                onClick={() => setAdminRequestsTab("retiros")}
                className={`border-2 rounded-2xl px-3.5 py-1.5 flex items-center gap-2 transition cursor-pointer shadow-lg ${
                  pendingWithdrawals.length > 0
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 border-white text-white ring-4 ring-sky-400/60 shadow-sky-500/40 animate-pulse"
                    : adminRequestsTab === "retiros"
                    ? "bg-blue-900/60 border-sky-400 text-sky-200 ring-2 ring-sky-500/40"
                    : "bg-slate-900 border-sky-500/50 text-sky-300 hover:border-sky-400"
                }`}
                title="Ver Solicitudes de Retiro de Fondos para Aprobar"
              >
                <ArrowDownRight size={16} className={pendingWithdrawals.length > 0 ? "text-white" : "text-sky-400"} />
                <div className="flex flex-col text-left">
                  <span className={`text-[9px] uppercase font-bold ${pendingWithdrawals.length > 0 ? "text-sky-100" : "text-slate-300"}`}>
                    Retiros
                  </span>
                  <span className={`font-fredoka text-xs font-black font-mono ${pendingWithdrawals.length > 0 ? "text-white" : "text-sky-400"}`}>
                    {pendingWithdrawals.length} pendientes
                  </span>
                </div>
              </button>

              {/* Botón Dinero por Partida (Comisión 20% Admin) */}
              <button
                type="button"
                onClick={() => setDineroPorPartidaModalOpen(true)}
                className="bg-gradient-to-r from-emerald-600/30 via-teal-600/30 to-emerald-600/30 hover:from-emerald-600/40 hover:to-teal-600/40 text-emerald-300 border-2 border-emerald-500/60 rounded-2xl px-3.5 py-1.5 flex items-center gap-2 transition cursor-pointer shadow-lg hover:scale-105 active:scale-95"
                title="Menú del Administrador: Dinero por Partida (El Administrador gana el 20% de cada partida jugada)"
              >
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
                  <DollarSign size={15} className="text-emerald-300 animate-pulse" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] uppercase font-bold text-slate-300">
                    {adminEarnings.length === 0
                      ? "Dinero por Partida (20%)"
                      : adminEarnings.length === 1
                      ? "Tienes 20% de 1 partida"
                      : `Tienes 20% de ${adminEarnings.length} partidas`}
                  </span>
                  <span className="font-fredoka text-xs font-black text-emerald-300 font-mono">
                    +{totalAdminEarnings20.toFixed(2)} VES
                  </span>
                </div>
              </button>

              {/* Botón Mi Foto de Perfil */}
              <button
                type="button"
                onClick={() => setProfileModalOpen(true)}
                className="bg-amber-500/20 hover:bg-amber-500/30 text-yellow-300 font-fredoka font-bold text-xs px-3.5 py-2 rounded-2xl border-2 border-amber-500/50 flex items-center gap-2 transition cursor-pointer shadow-lg shadow-amber-950/40"
                title="Subir o cambiar tu foto de perfil de Administrador"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-500 p-0.5 overflow-hidden flex items-center justify-center shrink-0">
                  {user.avatar ? (
                    user.avatar.startsWith("data:") || user.avatar.startsWith("http") ? (
                      <img src={user.avatar} alt="Admin" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span className="text-[10px]">{user.avatar}</span>
                    )
                  ) : (
                    <Camera size={11} className="text-slate-950" />
                  )}
                </div>
                <span>Mi Foto de Perfil</span>
              </button>

              {/* Registered Users List Button (Abonar y Quitar Saldo) */}
              <button
                type="button"
                onClick={() => setUsersListModalOpen(true)}
                className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-fredoka font-bold text-xs px-3.5 py-2 rounded-2xl border-2 border-emerald-300 flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-950/60 ring-2 ring-emerald-400/30"
                title="Abonar, quitar o ajustar saldo de usuarios registrados"
              >
                <Users size={15} className="text-emerald-200" />
                <span>Lista Usuarios ({registeredUsers.length}) [Abonar / Quitar]</span>
              </button>

              {/* Menú Jugadores Activos (Con minutos de desconexión en vivo) */}
              <button
                type="button"
                onClick={() => setActivePlayersModalOpen(true)}
                className="bg-gradient-to-r from-teal-700 via-emerald-600 to-cyan-700 hover:from-teal-600 hover:to-emerald-500 text-white font-fredoka font-bold text-xs px-3.5 py-1.5 rounded-2xl border-2 border-emerald-300 flex items-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-950/60 hover:scale-[1.03] active:scale-95 ring-2 ring-emerald-400/40"
                title="Tocar para ver la lista de todos los jugadores activos y cuántos minutos llevan desconectados"
              >
                <div className="w-6 h-6 rounded-xl bg-slate-950/90 flex items-center justify-center text-emerald-300 shadow shrink-0">
                  <Radio size={14} className="animate-pulse text-emerald-400" />
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-[9px] font-sans uppercase font-bold tracking-wider text-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Menú Estado
                  </span>
                  <span className="text-xs font-mono font-bold text-white">
                    Jugadores Activos
                  </span>
                </div>
              </button>

              {/* Menú de Administrador: Banear Usuarios (Anti-Trampas / Ver Cuentas Activas) */}
              <button
                type="button"
                onClick={() => setBanManagerModalOpen(true)}
                className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-fredoka font-black text-xs px-4 py-2 rounded-2xl border-2 border-red-300 flex items-center gap-2.5 transition cursor-pointer shadow-xl shadow-red-950/80 hover:scale-[1.04] active:scale-95 ring-4 ring-red-500/40"
                title="Menú de Administrador: Banear Usuarios. Ver todas las cuentas activas con su nombre y banear si aprovechan errores del juego"
              >
                <div className="w-7 h-7 rounded-xl bg-slate-950 flex items-center justify-center text-red-300 shadow shrink-0 border border-red-400">
                  <Ban size={16} className="text-red-400 animate-pulse" />
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-[9px] font-sans uppercase font-black tracking-wider text-red-100 flex items-center gap-1">
                    <ShieldAlert size={11} className="text-yellow-300" />
                    Menú Admin
                  </span>
                  <span className="text-xs sm:text-sm font-mono font-black text-white flex items-center gap-1.5">
                    🚫 Banear Usuarios
                    {bannedPlayersCount > 0 && (
                      <span className="bg-red-950 text-red-200 border border-red-400 text-[10px] px-1.5 py-0.2 rounded-full font-sans font-bold">
                        {bannedPlayersCount}
                      </span>
                    )}
                  </span>
                </div>
              </button>

              {/* Menú Tendencias Financieras (Gráfico de Barras Recharts) */}
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("admin-trends-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-900 hover:from-emerald-700 hover:to-teal-600 text-white font-fredoka font-bold text-xs px-3.5 py-1.5 rounded-2xl border-2 border-emerald-400 flex items-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-950/60 hover:scale-[1.03] active:scale-95 ring-2 ring-emerald-400/40"
                title="Ver Gráfico de Barras con Tendencias Financieras de Recargas y Retiros de la Última Semana"
              >
                <div className="w-6 h-6 rounded-xl bg-slate-950/90 flex items-center justify-center text-emerald-300 shadow shrink-0">
                  <BarChart3 size={14} />
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-[9px] font-sans uppercase font-bold tracking-wider text-emerald-200">
                    Métricas
                  </span>
                  <span className="text-xs font-mono font-bold text-white">
                    Tendencias
                  </span>
                </div>
              </button>

              {/* Menú Historial de Transacciones con Filtros */}
              <button
                type="button"
                onClick={() => setHistoryModalOpen(true)}
                className="bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-700 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-fredoka font-bold text-xs px-3.5 py-1.5 rounded-2xl border-2 border-yellow-300 flex items-center gap-2 transition cursor-pointer shadow-lg shadow-amber-950/60 hover:scale-[1.03] active:scale-95 ring-2 ring-yellow-400/40"
                title="Historial de transacciones financieras con filtros (Compra, Retiro, Bingo, Fecha, Usuario)"
              >
                <div className="w-6 h-6 rounded-xl bg-slate-950/90 flex items-center justify-center text-yellow-300 shadow shrink-0">
                  <History size={14} />
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-[9px] font-sans uppercase font-bold tracking-wider text-amber-950">
                    Auditoría
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-950">
                    Historial Filtros
                  </span>
                </div>
              </button>

              {/* Menú Chat de Jugadores en Vivo para el Administrador */}
              <button
                type="button"
                onClick={() => {
                  setAdminChatModalOpen(true);
                  setAdminUnreadChatCount(0);
                }}
                className="relative bg-gradient-to-r from-sky-700 via-indigo-600 to-purple-700 hover:from-sky-600 hover:to-indigo-500 text-white font-fredoka font-bold text-xs px-3.5 py-1.5 rounded-2xl border-2 border-sky-300 flex items-center gap-2 transition cursor-pointer shadow-lg shadow-sky-950/60 hover:scale-[1.03] active:scale-95 ring-2 ring-sky-400/40"
                title="Ver y participar en el Chat de los Jugadores en vivo (Supabase en tiempo real)"
              >
                <div className="w-6 h-6 rounded-xl bg-slate-950/90 flex items-center justify-center text-sky-300 shadow shrink-0">
                  <MessageSquare size={14} className="animate-pulse text-sky-300" />
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-sans uppercase font-bold tracking-wider text-sky-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                      Supabase
                    </span>
                    {adminUnreadChatCount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold animate-pulse shadow">
                        {adminUnreadChatCount}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono font-bold text-white">
                    Chat Jugadores
                  </span>
                </div>
              </button>

              {/* Botón MODO MANTENIMIENTO: Activar / Desactivar */}
              <button
                type="button"
                onClick={() => {
                  if (onToggleMaintenance) {
                    onToggleMaintenance(!isMaintenanceMode);
                  }
                }}
                className={`font-fredoka font-bold text-xs px-3.5 py-1.5 rounded-2xl border-2 flex items-center gap-2 transition cursor-pointer shadow-lg hover:scale-[1.03] active:scale-95 ${
                  isMaintenanceMode
                    ? "bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white border-red-300 ring-4 ring-red-500/60 shadow-red-950/70 animate-pulse"
                    : "bg-gradient-to-r from-amber-700/80 via-yellow-600/80 to-amber-800/80 hover:from-amber-600 hover:to-yellow-500 text-slate-950 border-amber-300 ring-2 ring-amber-400/30 shadow-amber-950/40"
                }`}
                title={
                  isMaintenanceMode
                    ? "El Mantenimiento está ACTIVO. Haga clic para DESACTIVAR y reabrir la app a los jugadores."
                    : "Haga clic para activar el Modo Mantenimiento en toda la app."
                }
              >
                <div
                  className={`w-6 h-6 rounded-xl flex items-center justify-center shadow shrink-0 ${
                    isMaintenanceMode ? "bg-red-950 text-red-200" : "bg-slate-950 text-yellow-300"
                  }`}
                >
                  <Wrench size={14} className={isMaintenanceMode ? "animate-spin" : ""} style={isMaintenanceMode ? { animationDuration: "6s" } : undefined} />
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span
                    className={`text-[9px] font-sans uppercase font-bold tracking-wider ${
                      isMaintenanceMode ? "text-red-200" : "text-amber-950"
                    }`}
                  >
                    Control Sala
                  </span>
                  <span
                    className={`text-xs font-mono font-black ${
                      isMaintenanceMode ? "text-white" : "text-slate-950"
                    }`}
                  >
                    {isMaintenanceMode ? "🛠️ Mantenimiento: ON" : "🛠️ Mantenimiento"}
                  </span>
                </div>
              </button>

              {/* Botón MENÚ ADMINISTRADOR: Torneo Billetal (Habilitar / Deshabilitar / Usuarios Cerrados) */}
              <button
                type="button"
                onClick={() => setTorneoModalOpen(true)}
                className={`font-fredoka font-bold text-xs px-3.5 py-1.5 rounded-2xl border-2 flex items-center gap-2.5 transition cursor-pointer shadow-lg hover:scale-[1.03] active:scale-95 ${
                  torneoConfig?.isEnabled
                    ? "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 border-yellow-200 ring-4 ring-yellow-400/50 shadow-yellow-950/70"
                    : "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-slate-300 border-slate-700 ring-1 ring-slate-600/30 shadow-black/60"
                }`}
                title="Menú Administrador: Habilitar o Deshabilitar Torneo Billetal para Bingo el Chamo"
              >
                <div
                  className={`w-6 h-6 rounded-xl flex items-center justify-center shadow shrink-0 ${
                    torneoConfig?.isEnabled
                      ? "bg-slate-950 text-yellow-400 border border-yellow-300"
                      : "bg-slate-950 text-slate-400 border border-slate-700"
                  }`}
                >
                  <Trophy size={14} className={torneoConfig?.isEnabled ? "animate-bounce text-yellow-400" : "text-slate-400"} />
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-sans uppercase font-black tracking-wider ${
                        torneoConfig?.isEnabled ? "text-amber-950" : "text-slate-400"
                      }`}
                    >
                      Menú Torneo
                    </span>
                    <span
                      className={`text-[8px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                        torneoConfig?.isEnabled
                          ? "bg-emerald-600 text-white"
                          : "bg-red-950 text-red-300 border border-red-500/50"
                      }`}
                    >
                      {torneoConfig?.isEnabled ? "🟢 ACTIVO" : "🔒 CERRADO A USUARIOS"}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-mono font-black ${
                      torneoConfig?.isEnabled ? "text-slate-950" : "text-white"
                    }`}
                  >
                    🏆 Torneo Billetal
                  </span>
                </div>
              </button>

              {/* ========================================================= */}
              {/* Menús Separados de Tops: Uno toca y los ve */}
              {/* ========================================================= */}

              {/* 1. Menú Top Globales (20+ ganadas) */}
              <button
                type="button"
                onClick={() => openTopCategory("GLOBAL")}
                className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-fredoka font-bold text-xs px-3.5 py-1.5 rounded-2xl border-2 border-yellow-200 flex items-center gap-2 transition cursor-pointer shadow-lg shadow-amber-950/60 hover:scale-[1.03] active:scale-95 ring-2 ring-yellow-400/30"
                title="Tocar para ver el listado de todos los jugadores en Top Globales (20+ ganadas)"
              >
                <div className="w-6 h-6 rounded-xl bg-slate-950/90 flex items-center justify-center text-yellow-300 shadow shrink-0">
                  <Crown size={14} className="animate-bounce" />
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-[9px] font-sans uppercase font-black tracking-wider text-amber-950">
                    Top Globales
                  </span>
                  <span className="text-xs font-mono font-black text-slate-950">
                    {globalPlayers.length} {globalPlayers.length === 1 ? "jugador" : "jugadores"} (20+)
                  </span>
                </div>
              </button>

              {/* 2. Menú Top Regionales (10 a 19 ganadas) */}
              <button
                type="button"
                onClick={() => openTopCategory("REGIONAL")}
                className="bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-800 hover:from-blue-600 hover:to-cyan-500 text-white font-fredoka font-bold text-xs px-3.5 py-1.5 rounded-2xl border-2 border-cyan-300 flex items-center gap-2 transition cursor-pointer shadow-lg shadow-blue-950/60 hover:scale-[1.03] active:scale-95 ring-2 ring-cyan-400/30"
                title="Tocar para ver el listado de todos los jugadores en Top Regionales (10 a 19 ganadas)"
              >
                <div className="w-6 h-6 rounded-xl bg-slate-950/90 flex items-center justify-center text-cyan-300 shadow shrink-0">
                  <MapPin size={14} />
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-[9px] font-sans uppercase font-bold tracking-wider text-cyan-200">
                    Top Regionales
                  </span>
                  <span className="text-xs font-mono font-bold text-white">
                    {regionalPlayers.length} {regionalPlayers.length === 1 ? "jugador" : "jugadores"} (10-19)
                  </span>
                </div>
              </button>

              {/* 3. Menú Chamos Competidores (SoloQ 1 a 9 ganadas) */}
              <button
                type="button"
                onClick={() => openTopCategory("COMPETIDOR")}
                className="bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-800 hover:from-emerald-600 hover:to-teal-500 text-white font-fredoka font-bold text-xs px-3.5 py-1.5 rounded-2xl border-2 border-emerald-300 flex items-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-950/60 hover:scale-[1.03] active:scale-95 ring-2 ring-emerald-400/30"
                title="Tocar para ver el listado de todos los jugadores que van en SoloQ (1 a 9 ganadas)"
              >
                <div className="w-6 h-6 rounded-xl bg-slate-950/90 flex items-center justify-center text-emerald-300 shadow shrink-0">
                  <Zap size={14} />
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-[9px] font-sans uppercase font-bold tracking-wider text-emerald-200">
                    Chamos Competidores
                  </span>
                  <span className="text-xs font-mono font-bold text-white">
                    {competidorPlayers.length} en SoloQ (1-9)
                  </span>
                </div>
              </button>

              {/* Pending Winner Approval Button if a game is waiting */}
              {currentWonGame && currentWonGame.status === "PENDING_AMOUNT" && (
                <button
                  type="button"
                  onClick={() => setWinApprovalModalOpen(true)}
                  className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-300 text-slate-950 font-fredoka font-black text-xs px-3.5 py-2 rounded-xl border border-yellow-200 shadow-xl shadow-yellow-500/30 flex items-center gap-1.5 animate-bounce cursor-pointer"
                  title="Aprobar el monto a acreditar al ganador"
                >
                  <Trophy size={15} className="text-slate-950" />
                  <span>¡Ganador en Espera: {currentWonGame.winnerName} — Aprobar Monto!</span>
                </button>
              )}

              {/* Explicit Ocultar / Minimizar Menú Button for Desktop */}
              <button
                type="button"
                onClick={toggleAdminMenu}
                className="hidden md:flex bg-slate-950 hover:bg-slate-800 active:scale-95 text-amber-300 font-fredoka font-bold text-xs px-3.5 py-2 rounded-2xl border-2 border-amber-500/50 items-center gap-1.5 transition cursor-pointer shadow-md hover:border-amber-400"
                title="Ocultar o minimizar el menú de administración"
              >
                <ChevronUp size={15} className="text-amber-400" />
                <span>Ocultar Menú</span>
              </button>

              {/* Botón Descargar Proyecto Completo en .ZIP (con nombres y carpetas reales) */}
              <button
                type="button"
                onClick={handleDownloadProjectZip}
                disabled={isDownloadingZip}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 text-white text-xs font-fredoka font-bold px-3.5 py-2 rounded-2xl border border-emerald-300/70 flex items-center gap-1.5 transition cursor-pointer shadow-md"
                title="Descargar todos los archivos actualizados en un .ZIP con sus nombres y carpetas reales"
              >
                <Download size={14} className={isDownloadingZip ? "animate-bounce" : ""} />
                <span>{isDownloadingZip ? "Generando ZIP..." : "Descargar ZIP"}</span>
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="bg-gradient-to-r from-red-800 to-rose-700 hover:from-red-700 hover:to-rose-600 text-white text-xs font-fredoka font-bold px-3.5 py-2 rounded-2xl border border-red-400/60 flex items-center gap-1.5 transition cursor-pointer shadow-md"
              >
                <LogOut size={14} /> Salir
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* Sub-Panel de Cuentas y Baneo en la Barra Superior del Administrador - Compacto con CSS */}
          {/* ========================================================================= */}
          <div className="max-w-7xl mx-auto mt-2.5 bg-slate-950/95 border border-red-500/70 rounded-2xl p-2.5 sm:p-3 shadow-2xl relative overflow-hidden ring-1 ring-red-500/30">
            {/* Ambient Red Glow */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top Bar of the Panel - Sleek with CSS */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 relative z-10 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-600 to-rose-600 border border-red-300 flex items-center justify-center text-white shadow-md shrink-0">
                  <ShieldAlert size={16} className="animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-fredoka text-xs sm:text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-red-300 via-rose-200 to-yellow-300">
                      Menú de Administrador: Visibilidad de Cuentas y Control de Baneo
                    </h3>
                    <span className="text-[9px] bg-red-600 text-white font-bold px-2 py-0.2 rounded-full uppercase tracking-wider font-mono shadow border border-red-400">
                      Anti-Trampas Activo
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-tight">
                    Cuentas de jugadores activas con saldo y Pago Móvil. Si alguien hace trampa, puedes banearlo de inmediato.
                  </p>
                </div>
              </div>

              {/* Actions & Filters */}
              <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-between md:justify-end">
                <div className="relative flex-1 md:w-60">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o correo..."
                    value={quickAccountsSearch}
                    onChange={(e) => setQuickAccountsSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-2.5 py-1 text-xs text-yellow-300 placeholder:text-slate-500 font-mono outline-none focus:border-red-400 transition"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setBanManagerModalOpen(true)}
                  className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-fredoka font-black text-xs px-3 py-1.5 rounded-lg border border-red-300 shadow flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
                  title="Abrir el panel completo de baneo en pantalla grande"
                >
                  <Ban size={13} />
                  <span>Ver Panel Completo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAccountsBarExpanded((prev) => !prev)}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-200 font-fredoka font-bold text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1 cursor-pointer transition"
                >
                  {isAccountsBarExpanded ? (
                    <>
                      <ChevronUp size={13} className="text-amber-400" />
                      <span>Minimizar</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown size={13} className="text-amber-400" />
                      <span>Ver Cuentas ({displayAccounts.length})</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Cards Grid when expanded - High space for accounts */}
            {isAccountsBarExpanded && (
              <div className="mt-2.5 relative z-10">
                {filteredDisplayAccounts.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 italic bg-slate-900/60 rounded-xl border border-slate-800">
                    No se encontraron cuentas activas que coincidan con la búsqueda.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 max-h-[520px] overflow-y-auto pr-1">
                    {filteredDisplayAccounts.map((account) => {
                      return (
                        <div
                          key={account.email}
                          className={`border rounded-xl p-1.5 sm:p-2 flex flex-col justify-between gap-1.5 transition shadow-sm ${
                            account.isBanned
                              ? "bg-red-950/60 border-red-500 ring-1 ring-red-500/50"
                              : account.isOnline
                              ? "bg-slate-900/95 border-emerald-500/70 hover:border-emerald-400"
                              : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          {/* Top: Avatar, Name & Status - Ultra-Compact with CSS */}
                          <div className="flex items-center gap-1.5">
                            <div className="relative shrink-0">
                              <div
                                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center overflow-hidden text-xs ${
                                  account.isBanned
                                    ? "bg-red-950 border-red-500"
                                    : account.isOnline
                                    ? "bg-emerald-950 border-emerald-400"
                                    : "bg-slate-800 border-slate-700"
                                }`}
                              >
                                {account.avatar ? (
                                  account.avatar.startsWith("data:") || account.avatar.startsWith("http") ? (
                                    <img src={account.avatar} alt={account.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <span>{account.avatar}</span>
                                  )
                                ) : (
                                  <span className="font-bold text-yellow-300">
                                    {account.name ? account.name[0]?.toUpperCase() : "U"}
                                  </span>
                                )}
                              </div>
                              {account.isOnline && !account.isBanned && (
                                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-950" />
                              )}
                            </div>

                            <div className="flex flex-col min-w-0 flex-1 leading-tight">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-fredoka text-[11px] sm:text-xs font-bold text-white truncate" title={account.name}>
                                  {account.name || account.email.split("@")[0]}
                                </span>
                                {account.isBanned ? (
                                  <span className="text-[7px] bg-red-600 text-white font-black px-1 py-0.2 rounded font-mono animate-pulse border border-red-300 shrink-0">
                                    BAN
                                  </span>
                                ) : account.isOnline ? (
                                  <span className="text-[7px] bg-emerald-950 text-emerald-300 border border-emerald-400/80 font-bold px-1 py-0.2 rounded font-mono shrink-0">
                                    ON
                                  </span>
                                ) : (
                                  <span className="text-[7px] bg-slate-950 text-slate-400 border border-slate-800 px-1 py-0.2 rounded font-mono shrink-0">
                                    OFF
                                  </span>
                                )}
                              </div>
                              <span className="text-[9px] sm:text-[10px] text-yellow-300/90 font-mono truncate" title={account.email}>
                                {account.email}
                              </span>
                            </div>
                          </div>

                          {/* Middle: Pago Movil & Balance */}
                          <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono bg-slate-950/90 border border-slate-800/80 px-1.5 py-0.5 rounded-lg">
                            <span className="text-slate-300 truncate max-w-[90px] sm:max-w-[110px]" title={account.pagoMovilPhone || "Sin PM"}>
                              📱 {account.pagoMovilPhone ? account.pagoMovilPhone.slice(-6) : "Sin PM"}
                            </span>
                            <span className="text-amber-300 font-bold font-fredoka">
                              {Number(account.balance || 0).toFixed(0)} VES
                            </span>
                          </div>

                          {/* Ban Action Button - Ultra-Compact with CSS */}
                          {onToggleBanUser && (
                            <div>
                              {account.isBanned ? (
                                <button
                                  type="button"
                                  onClick={() => onToggleBanUser(account.email, false)}
                                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-fredoka font-bold text-[10px] py-0.5 px-2 rounded-lg flex items-center justify-center gap-1 border border-emerald-300 transition cursor-pointer active:scale-95 shadow-sm"
                                  title={`Quitar sanción a ${account.name}`}
                                >
                                  <Check size={11} />
                                  <span>Desbanear</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const confirmBan = window.confirm(
                                      `¿Estás seguro de banear la cuenta de ${account.name} (${account.email})?\n\nAl banearlo, se le bloqueará la pantalla inmediatamente impidiéndole jugar.`
                                    );
                                    if (confirmBan) {
                                      onToggleBanUser(account.email, true, "Aprovechar errores del juego / Bug abuse");
                                    }
                                  }}
                                  className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-fredoka font-black text-[10px] py-0.5 px-2 rounded-lg flex items-center justify-center gap-1 border border-red-400 transition cursor-pointer active:scale-95 shadow-sm"
                                  title={`Banear cuenta de ${account.name} por hacer trampas o aprovechar errores`}
                                >
                                  <Ban size={11} className="text-white" />
                                  <span>Banear</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </header>
      )}

      {/* Attention Banner: Winner Pending Approval */}
      {currentWonGame && currentWonGame.status === "PENDING_AMOUNT" && (
        <div className="bg-gradient-to-r from-yellow-500 via-amber-500 to-red-600 border-b-2 border-yellow-300 px-4 py-2.5 shadow-xl flex items-center justify-between gap-3 text-slate-950 flex-wrap animate-pulse">
          <div className="flex items-center gap-2.5">
            <Trophy size={20} className="stroke-[2.5] shrink-0" />
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-fredoka font-black text-xs sm:text-sm uppercase tracking-wide">
                ¡NUEVO GANADOR EN ESPERA DE APROBACIÓN DE MONTO!
              </span>
              <span className="font-bold text-xs bg-slate-950 text-yellow-300 px-2 py-0.5 rounded-lg border border-yellow-400/50">
                {currentWonGame.winnerName} ({currentWonGame.winnerEmail}) • Cartón #{currentWonGame.cartonId}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setWinApprovalModalOpen(true)}
              className="bg-slate-950 hover:bg-slate-900 text-yellow-300 font-fredoka font-black text-xs px-3.5 py-1.5 rounded-xl border border-yellow-400 shadow flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Sparkles size={14} className="text-yellow-400" />
              Aprobar Monto a Acreditar
            </button>
          </div>
        </div>
      )}

      {/* Main Admin Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Festive Holiday Banner for Admin */}
        <div className="lg:col-span-12">
          <ChristmasFestiveBanner
            title="¡Panel de Control Navideño en Bingo el Chamo!"
            subtitle="Tómbola en vivo, control de cantado automático, distribución del 80% y auditoría de premios"
          />
        </div>
        {/* Plata en juego & 80% Distribution Master Control Card */}
        <div className="lg:col-span-12">
          <AdminPlataEnJuegoCard
            plataEnJuego={plataEnJuego}
            totalCartonesEnJuego={totalCartonesEnJuego}
            cartonPrice={cartonPrice}
            onUpdatePlataEnJuego={onUpdatePlataEnJuego}
            winnerName={currentWonGame?.winnerName}
            hasWinnerPending={currentWonGame?.status === "PENDING_AMOUNT"}
            onOpenDineroPorPartida={() => setDineroPorPartidaModalOpen(true)}
          />
        </div>

        {/* Admin Exclusive: Carton Price Adjustment Card */}
        <div className="lg:col-span-12">
          <AdminCartonPriceCard
            cartonPrice={cartonPrice}
            onUpdateCartonPrice={onUpdateCartonPrice}
            totalCartonesEnJuego={totalCartonesEnJuego}
          />
        </div>

        {/* Full-Width Admin Payment Bar & Game Winner Settlement */}
        <div className="lg:col-span-12">
          <AdminPaymentBar
            plataEnJuego={plataEnJuego}
            currentWonGame={currentWonGame}
            wonGamesHistory={wonGamesHistory}
            onSetPrizeAndPay={onSetPrizeAndPay || (() => {})}
            onResetTombola={onResetTombola}
            onOpenApprovalModal={() => setWinApprovalModalOpen(true)}
          />
        </div>

        {/* Supervisión de Clasificación de Tops (3 Menús Separados: Uno toca y los ve) */}
        <div className="lg:col-span-12 bg-slate-900/90 border border-amber-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-yellow-300">
                <Trophy size={18} />
              </div>
              <div>
                <h3 className="font-fredoka text-base sm:text-lg font-bold text-yellow-300 uppercase tracking-wide">
                  Supervisión de Clasificación y Tops (Cero Bots)
                </h3>
                <p className="text-xs text-slate-400">
                  Menús separados por categoría: Toca cualquiera para ver el listado completo de jugadores en vivo.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setActivePlayersModalOpen(true)}
                className="bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/50 px-3 py-1 rounded-xl text-xs font-fredoka font-bold flex items-center gap-1.5 transition cursor-pointer hover:scale-105 active:scale-95"
                title="Ver lista de jugadores activos y tiempo que llevan desconectados"
              >
                <Radio size={12} className="text-emerald-400 animate-pulse" />
                <span>Ver Jugadores Activos</span>
              </button>
              <span className="text-[11px] bg-slate-950 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-xl font-mono">
                Total Jugadores Reales: <strong className="text-yellow-300">{realPlayers.length}</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tarjeta 1: Top Globales (20+ ganadas) */}
            <div className="bg-gradient-to-b from-amber-950/40 via-slate-950 to-slate-950 border-2 border-amber-500/50 hover:border-amber-400 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-xl transition">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-yellow-300 flex items-center justify-center border border-amber-500/40">
                      <Crown size={15} />
                    </div>
                    <span className="font-fredoka font-bold text-sm text-yellow-300">
                      Top Globales
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-yellow-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                    20+ Ganadas
                  </span>
                </div>

                <p className="text-xs text-slate-400">
                  Jugadores consagrados que han ganado 20 o más partidas.
                </p>

                {/* Vista previa o estado */}
                {globalPlayers.length > 0 ? (
                  <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800 flex flex-col gap-1.5 mt-1">
                    {globalPlayers.slice(0, 3).map((p, idx) => (
                      <div key={p.email} className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 truncate max-w-[130px] font-medium flex items-center gap-1.5">
                          <span className="text-yellow-400 font-bold">#{idx + 1}</span> {p.name}
                        </span>
                        <span className="font-mono font-bold text-yellow-300">
                          {p.stats?.victorias ?? p.stats?.bingos ?? 0} victorias
                        </span>
                      </div>
                    ))}
                    {globalPlayers.length > 3 && (
                      <span className="text-[10px] text-slate-500 text-center">
                        +{globalPlayers.length - 3} jugadores más
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 text-center text-xs text-slate-400 mt-1">
                    <p className="font-semibold text-slate-300">Aún sin líderes en 20+</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Se requieren 20 victorias mínimas para ingresar.</p>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => openTopCategory("GLOBAL")}
                className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-fredoka font-bold text-xs py-2 rounded-xl border border-yellow-200 shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
              >
                <Crown size={13} />
                <span>Ver Top Globales ({globalPlayers.length})</span>
              </button>
            </div>

            {/* Tarjeta 2: Top Regionales (10 a 19 ganadas) */}
            <div className="bg-gradient-to-b from-blue-950/40 via-slate-950 to-slate-950 border-2 border-cyan-500/50 hover:border-cyan-400 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-xl transition">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-500/40">
                      <MapPin size={15} />
                    </div>
                    <span className="font-fredoka font-bold text-sm text-cyan-300">
                      Top Regionales
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full">
                    10 a 19 Ganadas
                  </span>
                </div>

                <p className="text-xs text-slate-400">
                  Jugadores experimentados con entre 10 y 19 victorias acumuladas.
                </p>

                {/* Vista previa o estado */}
                {regionalPlayers.length > 0 ? (
                  <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800 flex flex-col gap-1.5 mt-1">
                    {regionalPlayers.slice(0, 3).map((p, idx) => (
                      <div key={p.email} className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 truncate max-w-[130px] font-medium flex items-center gap-1.5">
                          <span className="text-cyan-400 font-bold">#{idx + 1}</span> {p.name}
                        </span>
                        <span className="font-mono font-bold text-cyan-300">
                          {p.stats?.victorias ?? p.stats?.bingos ?? 0} victorias
                        </span>
                      </div>
                    ))}
                    {regionalPlayers.length > 3 && (
                      <span className="text-[10px] text-slate-500 text-center">
                        +{regionalPlayers.length - 3} jugadores más
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 text-center text-xs text-slate-400 mt-1">
                    <p className="font-semibold text-slate-300">Aún sin líderes en 10-19</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Se requieren de 10 a 19 victorias para subir a este rango.</p>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => openTopCategory("REGIONAL")}
                className="w-full bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 hover:from-blue-500 hover:to-cyan-500 text-white font-fredoka font-bold text-xs py-2 rounded-xl border border-cyan-300 shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
              >
                <MapPin size={13} />
                <span>Ver Top Regionales ({regionalPlayers.length})</span>
              </button>
            </div>

            {/* Tarjeta 3: Chamos Competidores SoloQ (1 a 9 ganadas) */}
            <div className="bg-gradient-to-b from-emerald-950/40 via-slate-950 to-slate-950 border-2 border-emerald-500/50 hover:border-emerald-400 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-xl transition">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/40">
                      <Zap size={15} />
                    </div>
                    <span className="font-fredoka font-bold text-sm text-emerald-300">
                      Chamos Competidores
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                    SoloQ (1-9 Ganadas)
                  </span>
                </div>

                <p className="text-xs text-slate-400">
                  Jugadores en cola individual SoloQ que ya cuentan con entre 1 y 9 victorias.
                </p>

                {/* Vista previa o estado */}
                {competidorPlayers.length > 0 ? (
                  <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800 flex flex-col gap-1.5 mt-1">
                    {competidorPlayers.slice(0, 3).map((p, idx) => (
                      <div key={p.email} className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 truncate max-w-[130px] font-medium flex items-center gap-1.5">
                          <span className="text-emerald-400 font-bold">#{idx + 1}</span> {p.name}
                        </span>
                        <span className="font-mono font-bold text-emerald-300">
                          {p.stats?.victorias ?? p.stats?.bingos ?? 0} victorias
                        </span>
                      </div>
                    ))}
                    {competidorPlayers.length > 3 && (
                      <span className="text-[10px] text-slate-500 text-center">
                        +{competidorPlayers.length - 3} jugadores más
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 text-center text-xs text-slate-400 mt-1">
                    <p className="font-semibold text-slate-300">Aún sin victorias en SoloQ</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Jugadores que ganen su primera partida aparecerán aquí.</p>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => openTopCategory("COMPETIDOR")}
                className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-fredoka font-bold text-xs py-2 rounded-xl border border-emerald-300 shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
              >
                <Zap size={13} />
                <span>Ver Chamos SoloQ ({competidorPlayers.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Gráfico de Barras Recharts: Volumen de Recargas y Retiros en la Última Semana */}
        <div id="admin-trends-section" className="lg:col-span-12">
          <AdminFinancialTrendsChart
            rechargeRequests={rechargeRequests}
            withdrawRequests={withdrawRequests}
            history={history}
          />
        </div>

        {/* Left Column: Tombola Operation Console & Live Carton Monitor */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Tómbola Operación Maestro */}
          <div className="bg-slate-900/90 border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-5 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Dice5 size={18} className="text-yellow-400" />
                <h3 className="font-fredoka text-sm sm:text-base font-bold text-yellow-300 uppercase tracking-wider">
                  Consola de Tómbola en Vivo
                </h3>
              </div>
              <span className="text-xs font-mono bg-slate-950 text-slate-300 border border-slate-800 px-3 py-1 rounded-xl">
                {remaining} Bolas por Cantar
              </span>
            </div>

            {/* Decorative Holiday Lights on Console */}
            <ChristmasLights count={20} compact={true} className="-mt-3 mb-1" />

            {/* Central Rotating Mesh Tombola for Admin with Holiday Tree */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2 relative">
              <RotatingMeshTombola
                currentBall={currentBall}
                isSpinning={autoMode || currentBall !== null}
                size="md"
                showDrawnBall={true}
                isSpecialBall={isSpecialBall}
                isWinningBall={isWinningBall || (currentWonGame !== null)}
                specialBallLabel={specialBallLabel}
              />

              {/* Festive Decorated Christmas Tree beside Tombola */}
              <div className="hidden md:flex flex-col items-center shrink-0">
                <ChristmasTree size="sm" interactive={true} />
              </div>

              <div className="flex flex-col gap-2 text-center sm:text-left">
                <div className="text-xs font-bold text-slate-400 uppercase">
                  Estado Actual de la Partida:
                </div>
                <div className="font-fredoka text-xl font-bold text-yellow-300">
                  {currentBall
                    ? `¡Bola Cantada: ${currentLetter}-${currentBall}!`
                    : "Esperando primer número..."}
                </div>
                <p className="text-xs text-slate-400 max-w-xs">
                  Puedes cantar los números manualmente o configurar el tiempo de cantado automático con varias temporalidades (desde 2s hasta 30s).
                </p>
              </div>
            </div>

            {/* Configuración de Tiempo de Cantado (Temporalidades) */}
            <CantadoSpeedConfig
              currentIntervalSeconds={drawIntervalSeconds}
              onChangeInterval={onChangeDrawInterval}
              autoMode={autoMode}
              secondsRemaining={secondsUntilNextBall}
              onToggleAutoMode={onToggleAutoMode}
            />

            {/* Configuración de Tiempo Restante y Duración de Próximas Partidas */}
            <div className="bg-slate-950/90 border border-cyan-500/40 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                  isRoomTimerPaused
                    ? "bg-amber-500/20 text-amber-300 border-amber-400/50"
                    : "bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow"
                }`}>
                  <Clock size={20} className={isRoomTimerPaused ? "" : "animate-spin"} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300">
                      Tiempo de Próxima Partida:
                    </span>
                    <span className="font-mono font-black text-cyan-300 text-sm sm:text-base">
                      {isRoomTimerPaused ? `⏸️ ${roomCountdown}` : roomCountdown}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Duración oficial: <strong className="text-yellow-300">{Math.round((configuredRoomDuration || 1800) / 60)} min</strong> por partida • Estado: <strong className={isRoomTimerPaused ? "text-amber-400" : "text-emerald-400"}>{isRoomTimerPaused ? "Pausado" : "Activo"}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {onTogglePauseRoomTimer && (
                  <button
                    type="button"
                    onClick={onTogglePauseRoomTimer}
                    className={`px-3 py-1.5 rounded-xl text-xs font-fredoka font-bold flex items-center gap-1.5 border transition cursor-pointer shadow ${
                      isRoomTimerPaused
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400"
                        : "bg-slate-900 hover:bg-slate-800 text-amber-300 border-amber-500/50"
                    }`}
                    title={isRoomTimerPaused ? "Reanudar conteo regresivo" : "Pausar conteo regresivo"}
                  >
                    {isRoomTimerPaused ? <Play size={13} /> : <Pause size={13} />}
                    <span>{isRoomTimerPaused ? "Reanudar" : "Pausar"}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setTimerConfigModalOpen(true)}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-fredoka font-bold flex items-center gap-1.5 shadow transition cursor-pointer border border-cyan-400"
                  title="Abrir panel completo de configuración de tiempo de partidas"
                >
                  <Sliders size={14} />
                  <span>Configurar Tiempo</span>
                </button>
              </div>
            </div>

            {/* Tombola Controls */}
            <div className="flex flex-col gap-3 pt-2 border-t border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={onDrawNextBall}
                  disabled={remaining === 0}
                  className="sm:col-span-2 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 font-fredoka font-black py-3.5 px-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 text-sm transition active:scale-95 cursor-pointer"
                >
                  <Dice5 size={18} /> Cantar Siguiente Bola
                </button>

                <button
                  onClick={onResetTombola}
                  className="bg-red-950/80 hover:bg-red-900 text-red-200 font-fredoka font-bold py-3.5 px-3 rounded-2xl border border-red-800/80 flex items-center justify-center gap-1.5 text-xs transition cursor-pointer"
                  title="Desmarcar todos los cartones y reiniciar todas las partidas de la sala"
                >
                  <RotateCcw size={15} /> Reiniciar Partidas
                </button>
              </div>

              {/* Mode Toggle Button */}
              <button
                onClick={onToggleAutoMode}
                className={`w-full py-2.5 px-4 rounded-2xl font-fredoka font-bold text-xs flex items-center justify-center gap-2 border transition cursor-pointer ${
                  autoMode
                    ? "bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/20"
                    : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                }`}
              >
                <Bot size={16} />
                {autoMode
                  ? `Tómbola Automática Activa (Extrayendo cada ${drawIntervalSeconds}s) - Haz clic para Pausar`
                  : `Activar Modo Automático (Extracción Contínua cada ${drawIntervalSeconds}s)`}
              </button>
            </div>

            {/* Recent Balls Extracted */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
              <span className="text-[11px] font-bold text-slate-400">
                Últimas 8 Bolas Cantadas:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto py-1 min-h-[40px]">
                {drawnBalls.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">
                    Ninguna bola ha salido todavía en la tómbola.
                  </span>
                ) : (
                  drawnBalls
                    .slice(-8)
                    .reverse()
                    .map((num, i) => (
                      <div
                        key={num}
                        className={`w-9 h-9 rounded-full flex flex-col items-center justify-center font-fredoka font-black text-xs shadow border shrink-0 ${
                          i === 0
                            ? "bg-gradient-to-tr from-yellow-300 to-amber-500 text-slate-950 border-yellow-200 ring-2 ring-yellow-400 scale-105"
                            : "bg-gradient-to-tr from-white to-slate-200 text-slate-950 border-amber-400"
                        }`}
                      >
                        <span className="text-[7px] text-red-700 leading-none">
                          {getBallLetter(num)}
                        </span>
                        <span className="leading-none">{num}</span>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>

          {/* Real-Time Winning Cartons Radar */}
          <div className="bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Trophy size={18} className="text-emerald-400" />
                <h3 className="font-fredoka text-sm font-bold text-emerald-300 uppercase tracking-wider">
                  Radar en Vivo: Cartones con Mayor Acierto
                </h3>
              </div>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                Monitoreo Global (1 - 200)
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Lista en tiempo real de los cartones que van más cerca de ganar una de las 8 figuras oficiales:
            </p>

            <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
              {cartonLeaderboard.map((item, index) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition ${
                    item.isWinner
                      ? "bg-emerald-950/80 border-emerald-400 text-emerald-100 ring-2 ring-emerald-400 animate-pulse"
                      : "bg-slate-950 border-slate-800 text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-xl bg-slate-900 text-amber-300 font-fredoka font-bold text-xs flex items-center justify-center border border-slate-800">
                      #{index + 1}
                    </span>
                    <div>
                      <div className="font-fredoka font-bold text-xs sm:text-sm text-yellow-300">
                        Cartón #{item.id}
                      </div>
                      {item.isWinner && (
                        <span className="text-[10px] font-bold text-emerald-300">
                          ¡BINGO COMPLETO: {item.patternName}!
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl ${
                        item.isWinner
                          ? "bg-emerald-500 text-slate-950 font-black"
                          : "bg-slate-900 text-amber-300 border border-slate-800"
                      }`}
                    >
                      {item.hits} / 25 aciertos
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Master Board & Pago Móvil Verification Center */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Master Board for Admin */}
          <MasterBoard drawnBalls={drawnBalls} />

          {/* Solicitudes Management (Recargas Pago Móvil & Retiros de Fondos) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4">
            {/* Tab switch between Recargas and Retiros */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <button
                type="button"
                onClick={() => setAdminRequestsTab("recargas")}
                className={`flex-1 py-2.5 px-3 rounded-2xl font-fredoka font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                  adminRequestsTab === "recargas"
                    ? "bg-amber-500/20 text-yellow-300 border border-amber-500/50 shadow-lg"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <ShieldAlert size={15} className="text-amber-400" />
                <span>Recargas Pago Móvil</span>
                <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                  {pendingRequests.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAdminRequestsTab("retiros")}
                className={`flex-1 py-2.5 px-3 rounded-2xl font-fredoka font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                  adminRequestsTab === "retiros"
                    ? "bg-blue-600/30 text-blue-300 border border-blue-500/60 shadow-lg"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <ArrowDownRight size={15} className="text-blue-400" />
                <span>Retiros de Fondos</span>
                <span
                  className={`font-black text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    pendingWithdrawals.length > 0
                      ? "bg-blue-500 text-white animate-pulse"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {pendingWithdrawals.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("admin-trends-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="py-2.5 px-3 rounded-2xl font-fredoka font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer bg-slate-950 hover:bg-emerald-950/40 text-emerald-300 border border-slate-800 hover:border-emerald-500/50 shrink-0"
                title="Ir al Gráfico de Barras de Tendencias Financieras"
              >
                <BarChart3 size={14} className="text-emerald-400" />
                <span className="hidden sm:inline">Tendencias</span>
              </button>

              <button
                type="button"
                onClick={() => setHistoryModalOpen(true)}
                className="py-2.5 px-3 rounded-2xl font-fredoka font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer bg-slate-950 hover:bg-amber-950/40 text-yellow-300 border border-slate-800 hover:border-amber-500/50 shrink-0"
                title="Abrir Historial de Transacciones con Filtros (Compra, Retiro, Bingo, Fecha, Usuario)"
              >
                <History size={14} className="text-yellow-400" />
                <span className="hidden sm:inline">Historial Filtros</span>
                <span className="sm:hidden">Historial</span>
              </button>
            </div>

            {/* TAB 1: RECARGAS PAGO MOVIL */}
            {adminRequestsTab === "recargas" && (
              <>
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={18} className="text-amber-400" />
                    <h3 className="font-fredoka text-sm font-bold text-yellow-300 uppercase tracking-wider">
                      Verificación de Recargas Pago Móvil
                    </h3>
                  </div>
                  <span className="text-[11px] bg-amber-500/20 text-yellow-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-bold">
                    {pendingRequests.length} Solicitudes
                  </span>
                </div>

            {/* Pending List */}
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-bold text-slate-300">
                Solicitudes Pendientes por Aprobar:
              </span>

              {pendingRequests.length === 0 ? (
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center text-xs text-slate-500 italic">
                  No hay solicitudes de recarga pendientes por verificar.
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1">
                  {pendingRequests.map((req) => {
                    const currentApprovedStr = editApprovedAmounts[req.id] ?? req.monto.toString();
                    const parsedApproved = parseFloat(currentApprovedStr.replace(/,/g, "."));
                    const validApproved = !isNaN(parsedApproved) && parsedApproved > 0 ? Number(parsedApproved.toFixed(2)) : Number(req.monto.toFixed(2));

                    const handleDirectApprove = () => {
                      onApproveRecharge(req.id, validApproved);
                    };

                    const handleApproveRequested = () => {
                      onApproveRecharge(req.id, Number(req.monto.toFixed(2)));
                    };

                    return (
                      <div
                        key={req.id}
                        className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 hover:border-amber-500/40 flex flex-col gap-3 transition"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-900 pb-2">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-fredoka font-bold text-yellow-300 text-xs sm:text-sm">
                                {req.email}
                              </span>
                              {req.transactionId && (
                                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-bold">
                                  ID: {req.transactionId}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-300 font-mono">
                              Monto Solicitado: <strong className="text-yellow-400 font-bold">{req.monto.toFixed(2)} VES</strong>{" "}
                              | Ref: <strong className="text-amber-300">{req.ref}</strong>{" "}
                              | Banco: {req.bank || "Pago Móvil"}
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {req.fecha}
                            </span>
                          </div>

                          {req.voucherImage && (
                            <button
                              onClick={() => setSelectedVoucherModal(req.voucherImage!)}
                              className="bg-slate-900 hover:bg-slate-800 text-amber-300 px-2.5 py-1.5 rounded-xl text-xs font-fredoka flex items-center gap-1 border border-slate-800 transition cursor-pointer shrink-0"
                            >
                              <Eye size={12} /> Ver Captura
                            </button>
                          )}
                        </div>

                        {/* Administrator Explicit Amount Approval Control */}
                        <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                          <div className="flex flex-col gap-1 w-full sm:w-auto">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] uppercase font-bold text-slate-300">
                                Monto a Acreditar (VES):
                              </span>
                              <div className="flex items-center gap-1">
                                {[500, 300, 120, 60].map((quick) => (
                                  <button
                                    key={quick}
                                    type="button"
                                    onClick={() =>
                                      setEditApprovedAmounts((prev) => ({
                                        ...prev,
                                        [req.id]: quick.toString(),
                                      }))
                                    }
                                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-[10px] font-mono text-amber-300 transition"
                                    title={`Aprobar exactamente ${quick} VES`}
                                  >
                                    {quick} Bs
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditApprovedAmounts((prev) => ({
                                      ...prev,
                                      [req.id]: req.monto.toString(),
                                    }))
                                  }
                                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 transition"
                                  title="Restablecer al monto solicitado"
                                >
                                  Solicitado
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                step="0.01"
                                min="1"
                                value={currentApprovedStr}
                                onChange={(e) =>
                                  setEditApprovedAmounts((prev) => ({
                                    ...prev,
                                    [req.id]: e.target.value,
                                  }))
                                }
                                className="bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg px-2.5 py-1 text-xs text-emerald-400 font-mono font-bold w-28 outline-none"
                                placeholder="500.00"
                              />
                              <span className="text-xs font-mono text-slate-400 font-bold">VES</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                            <button
                              onClick={handleDirectApprove}
                              className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-fredoka font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-emerald-950/60 border border-emerald-400/30 transition cursor-pointer"
                              title={`Aprobar y acreditar inmediatamente ${validApproved.toFixed(2)} VES`}
                            >
                              <CheckCircle size={15} className="text-emerald-200 shrink-0" />
                              <span>Aprobar ({validApproved.toFixed(2)} VES)</span>
                            </button>

                            {validApproved !== req.monto && (
                              <button
                                onClick={handleApproveRequested}
                                className="bg-slate-800 hover:bg-emerald-700 text-emerald-300 hover:text-white font-fredoka font-bold px-2.5 py-2.5 rounded-xl text-xs flex items-center gap-1 border border-slate-700 transition cursor-pointer"
                                title={`Aprobar el monto solicitado original (${req.monto.toFixed(2)} VES)`}
                              >
                                <CheckCircle size={13} />
                                <span>Solicitado ({req.monto.toFixed(2)} VES)</span>
                              </button>
                            )}

                            <button
                              onClick={() => onRejectRecharge(req.id)}
                              className="bg-red-950/80 hover:bg-red-900 text-red-300 font-fredoka font-bold px-3 py-2.5 rounded-xl text-xs flex items-center gap-1 border border-red-800/80 transition cursor-pointer"
                              title="Rechazar solicitud de recarga"
                            >
                              <XCircle size={14} />
                              <span>Rechazar</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* History List */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <History size={13} /> Historial de Resoluciones:
              </span>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 max-h-[140px] overflow-y-auto flex flex-col gap-1.5">
                {historyRequests.length === 0 ? (
                  <span className="text-xs text-slate-500 italic text-center py-2">
                    Sin historial de recargas procesadas todavía.
                  </span>
                ) : (
                  historyRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300 font-bold">{req.email}</span>
                        <span className="text-amber-400 font-mono">{req.monto} VES</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          req.estado === "APROBADO"
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            : "bg-red-950 text-red-300 border border-red-800"
                        }`}
                      >
                        {req.estado}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
              </>
            )}

            {/* TAB 2: RETIROS DE FONDOS (ADMIN APPROVAL WITH NAME, EMAIL AND BALANCE DEDUCTION) */}
            {adminRequestsTab === "retiros" && (
              <>
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <ArrowDownRight size={16} className="text-blue-400" />
                    <h3 className="font-fredoka text-sm font-bold text-blue-300 uppercase tracking-wider">
                      Aprobación de Retiros de Fondos
                    </h3>
                  </div>
                  <span className="text-[11px] bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2.5 py-0.5 rounded-full font-bold">
                    {pendingWithdrawals.length} Pendientes
                  </span>
                </div>

                <div className="bg-blue-950/30 border border-blue-500/30 rounded-2xl p-3 text-[11px] text-blue-200/90 flex flex-col gap-1 leading-relaxed">
                  <p className="font-bold flex items-center gap-1.5 text-blue-300">
                    <span>ℹ️</span> Proceso de Aprobación de Retiro:
                  </p>
                  <p>
                    Cuando una persona solicita el retiro, le aparece al administrador aquí junto con su <strong>nombre</strong> y su <strong>correo</strong>. Al aprobarlo, se le restará de su cuenta la cantidad que retiró.
                  </p>
                </div>

                {/* Pending Withdrawals List */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-xs font-bold text-slate-300">
                    Solicitudes de Retiro Pendientes por Aprobar:
                  </span>

                  {pendingWithdrawals.length === 0 ? (
                    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center text-xs text-slate-500 italic">
                      No hay solicitudes de retiro pendientes por verificar.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
                      {pendingWithdrawals.map((req) => {
                        const targetUser = registeredUsers.find(
                          (u) => u.email.toLowerCase() === req.email.toLowerCase()
                        );
                        const applicantName = req.userName || targetUser?.name || req.email.split("@")[0];
                        const applicantBalance = targetUser?.balance ?? 0;

                        return (
                          <div
                            key={req.id}
                            className="bg-slate-950 p-4 rounded-2xl border-2 border-blue-500/40 hover:border-blue-400 flex flex-col gap-3 shadow-xl transition"
                          >
                            {/* Applicant Header: Name, Email and Transaction ID */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-900 pb-2.5">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="bg-blue-500/20 text-blue-300 text-[10px] font-black px-2 py-0.5 rounded-md border border-blue-400/30 uppercase tracking-wider">
                                    Solicitante
                                  </span>
                                  <span className="font-fredoka font-bold text-yellow-300 text-sm sm:text-base">
                                    {applicantName}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
                                  <span>✉️ Correo:</span>
                                  <strong className="text-amber-300 font-semibold">{req.email}</strong>
                                </div>
                              </div>

                              <div className="flex flex-col sm:items-end">
                                <span className="text-[10px] text-slate-400 font-mono">
                                  ID Transacción:
                                </span>
                                <span className="font-mono text-xs font-bold text-slate-200 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                  {req.transactionId}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                                  {req.fecha}
                                </span>
                              </div>
                            </div>

                            {/* Withdrawal Amount & User Balance Comparison */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
                              <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-slate-400">
                                  Monto a Retirar:
                                </span>
                                <span className="font-fredoka text-lg font-black text-yellow-300 font-mono">
                                  {req.monto.toFixed(2)} VES
                                </span>
                              </div>
                              <div className="flex flex-col sm:text-right">
                                <span className="text-[10px] uppercase font-bold text-slate-400">
                                  Saldo Disponible en Cuenta:
                                </span>
                                <span className="font-fredoka text-sm font-bold text-emerald-400 font-mono">
                                  {applicantBalance.toFixed(2)} VES
                                </span>
                                <span className="text-[10px] font-mono mt-0.5">
                                  {req.saldoRestado ? (
                                    <span className="text-emerald-400 font-semibold">
                                      ✅ Ya restado al solicitar (-{req.monto.toFixed(2)} VES)
                                    </span>
                                  ) : (
                                    <span className="text-amber-400">
                                      Saldo tras aprobar:{" "}
                                      <strong className="text-yellow-300">
                                        {Math.max(0, applicantBalance - req.monto).toFixed(2)} VES
                                      </strong>
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>

                            {/* Mobile Payment / Bank Details */}
                            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 text-xs">
                              <span className="text-[11px] font-bold text-slate-400 block mb-1">
                                📱 Datos de Pago Móvil para Transferir:
                              </span>
                              <div className="text-slate-100 font-mono bg-slate-950 p-2 rounded-lg border border-slate-800 select-all">
                                {req.datos || "No especificados"}
                              </div>
                            </div>

                            {/* Deduction Notice */}
                            {(() => {
                              const currentInputVal = editWithdrawAmounts[req.id] ?? String(req.monto);
                              const parsedVal = parseFloat(currentInputVal);
                              const approvedToDeduct = isNaN(parsedVal) || parsedVal <= 0 ? req.monto : parsedVal;

                              return (
                                <>
                                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                                    <label htmlFor={`edit-with-${req.id}`} className="text-[11px] font-bold text-slate-300">
                                      Monto a transferir vía Pago Móvil:
                                    </label>
                                    <div className="flex items-center gap-1.5 self-stretch sm:self-auto">
                                      <input
                                        id={`edit-with-${req.id}`}
                                        type="number"
                                        step="0.01"
                                        min="1"
                                        value={currentInputVal}
                                        onChange={(e) =>
                                          setEditWithdrawAmounts((prev) => ({
                                            ...prev,
                                            [req.id]: e.target.value,
                                          }))
                                        }
                                        className="bg-slate-950 border border-blue-400/60 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-yellow-300 w-28 text-right outline-none focus:border-yellow-400"
                                      />
                                      <span className="text-xs font-mono text-slate-400 font-bold">VES</span>
                                    </div>
                                  </div>

                                  <div className={`text-[11px] p-2 rounded-xl border flex items-center gap-1.5 ${
                                    req.saldoRestado
                                      ? "text-emerald-300 bg-emerald-950/40 border-emerald-800/40"
                                      : "text-amber-300 bg-amber-950/40 border-amber-800/40"
                                  }`}>
                                    <CheckCircle size={14} className="shrink-0 text-emerald-400" />
                                    <span>
                                      {req.saldoRestado ? (
                                        <>
                                          El monto de <strong>{req.monto.toFixed(2)} VES</strong> ya fue descontado automáticamente de la cuenta de {applicantName}. Al hacer clic en <strong>"Aprobar Retiro"</strong> confirmas la transferencia bancaria.
                                        </>
                                      ) : (
                                        <>
                                          Al presionar <strong>"Aprobar Retiro"</strong>, se restarán automáticamente{" "}
                                          <strong>{approvedToDeduct.toFixed(2)} VES</strong> de la cuenta de {applicantName}.
                                        </>
                                      )}
                                    </span>
                                  </div>

                                  {/* Approval and Rejection Buttons */}
                                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-900">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (onApproveWithdraw) {
                                          onApproveWithdraw(req.id, approvedToDeduct);
                                        }
                                      }}
                                      className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-fredoka font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-emerald-950/60 border border-emerald-400/50 transition cursor-pointer"
                                      title={`Aprobar retiro y restar automáticamente ${approvedToDeduct.toFixed(2)} VES de la cuenta de ${applicantName}`}
                                    >
                                      <CheckCircle size={16} className="text-emerald-200" />
                                      <span>
                                        {req.saldoRestado
                                          ? `Aprobar Retiro (Confirmar ${approvedToDeduct.toFixed(2)} VES)`
                                          : `Aprobar Retiro (Restar automáticamente ${approvedToDeduct.toFixed(2)} VES)`}
                                      </span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        const motivo = prompt("Motivo del rechazo (opcional):", "Datos de Pago Móvil incorrectos o incompletos");
                                        if (motivo !== null && onRejectWithdraw) {
                                          onRejectWithdraw(req.id, motivo.trim() || "Datos de Pago Móvil incorrectos");
                                        }
                                      }}
                                      className="bg-red-950/80 hover:bg-red-900 text-red-300 font-fredoka font-bold px-3 py-2.5 rounded-xl text-xs flex items-center gap-1 border border-red-800/80 transition cursor-pointer"
                                      title="Rechazar solicitud de retiro sin descontar saldo"
                                    >
                                      <XCircle size={14} />
                                      <span>Rechazar Retiro</span>
                                    </button>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* History of Withdrawals */}
                <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                    <History size={13} /> Historial de Resoluciones de Retiros:
                  </span>

                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 max-h-[150px] overflow-y-auto flex flex-col gap-1.5">
                    {historyWithdrawals.length === 0 ? (
                      <span className="text-xs text-slate-500 italic text-center py-2">
                        Sin historial de retiros procesados todavía.
                      </span>
                    ) : (
                      historyWithdrawals.map((req) => (
                        <div
                          key={req.id}
                          className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs"
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-yellow-300 font-bold">
                              {req.userName || req.email}
                            </span>
                            <span className="text-slate-400 font-mono text-[11px]">
                              ({req.email})
                            </span>
                            <span className="text-amber-400 font-mono font-bold">
                              {req.monto.toFixed(2)} VES
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500 font-mono">
                              {req.fecha}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                req.estado === "APROBADO"
                                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                  : "bg-red-950 text-red-300 border border-red-800"
                              }`}
                            >
                              {req.estado === "APROBADO" ? "APROBADO (DESCONTADO)" : "RECHAZADO"}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Profile Modal for Admin */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={user}
        onSaveProfile={onUpdateProfile || (() => {})}
      />

      {/* Top Rankings Modal for Admin */}
      <TopRankingsModal
        isOpen={topsModalOpen}
        onClose={() => setTopsModalOpen(false)}
        currentUserEmail={user.email}
        registeredUsers={registeredUsers}
        initialFilter={selectedTopCategory}
      />

      {/* Official Registered Users & Balances Modal for Admin */}
      <AdminUsersListModal
        isOpen={usersListModalOpen}
        onClose={() => setUsersListModalOpen(false)}
        registeredUsers={registeredUsers}
        onRefresh={onRefreshUsers}
        onAdjustBalance={onAdjustUserBalance}
        onToggleBanUser={onToggleBanUser}
      />

      {/* Admin Active Players & Disconnection Time Monitor Modal */}
      <AdminActivePlayersModal
        isOpen={activePlayersModalOpen}
        onClose={() => setActivePlayersModalOpen(false)}
        registeredUsers={registeredUsers}
        onRefresh={onRefreshUsers}
        onAdjustBalance={onAdjustUserBalance}
        onToggleBanUser={onToggleBanUser}
      />

      {/* Admin Ban Manager & Active Accounts Modal */}
      <AdminBanManagerModal
        isOpen={banManagerModalOpen}
        onClose={() => setBanManagerModalOpen(false)}
        registeredUsers={registeredUsers}
        onRefresh={onRefreshUsers}
        onToggleBanUser={onToggleBanUser}
      />

      {/* Admin Financial Transaction History with Advanced Filters Modal */}
      <AdminTransactionHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        history={history}
        rechargeRequests={rechargeRequests}
        withdrawRequests={withdrawRequests}
        registeredUsers={registeredUsers}
        wonGamesHistory={wonGamesHistory}
      />

      {/* Player-to-Player Live Chat (Admin view & participate) */}
      <PlayerChatModal
        isOpen={adminChatModalOpen}
        onClose={() => setAdminChatModalOpen(false)}
        currentUser={user}
      />

      {/* Admin Win Approval & Verification Modal */}
      <AdminWinApprovalModal
        isOpen={winApprovalModalOpen}
        onClose={() => setWinApprovalModalOpen(false)}
        currentWonGame={currentWonGame}
        registeredUsers={registeredUsers}
        plataEnJuego={plataEnJuego}
        onApproveAndPay={onSetPrizeAndPay || (() => {})}
        onRejectWin={onRejectWin}
      />

      {/* Admin Game Timer Configuration Modal */}
      <AdminGameTimerModal
        isOpen={timerConfigModalOpen}
        onClose={() => setTimerConfigModalOpen(false)}
        roomSeconds={roomSeconds}
        configuredRoomDuration={configuredRoomDuration}
        isPaused={isRoomTimerPaused}
        onSetRemainingSeconds={onUpdateRemainingSeconds || (() => {})}
        onSetConfiguredDuration={onUpdateConfiguredRoomDuration || (() => {})}
        onTogglePause={onTogglePauseRoomTimer || (() => {})}
        onResetTimer={onResetRoomTimer || (() => {})}
        onAdjustTime={onAdjustRemainingSeconds || (() => {})}
      />

      {/* Admin Torneo Billetal Configuration Modal */}
      {torneoConfig && (
        <AdminTorneoBilletalModal
          isOpen={torneoModalOpen}
          onClose={() => setTorneoModalOpen(false)}
          config={torneoConfig}
          onSaveConfig={(updated) => {
            if (onUpdateTorneoConfig) onUpdateTorneoConfig(updated);
          }}
        />
      )}

      {/* Admin Dinero por Partida (Ganancia 20% del Administrador) Modal */}
      <AdminDineroPorPartidaModal
        isOpen={dineroPorPartidaModalOpen}
        onClose={() => setDineroPorPartidaModalOpen(false)}
        earnings={adminEarnings}
        currentPlataEnJuego={plataEnJuego}
      />

      {/* Voucher Modal */}
      {selectedVoucherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-fredoka text-base font-bold text-white">
                Comprobante de Pago Móvil Adjunto
              </h3>
              <button
                onClick={() => setSelectedVoucherModal(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-800 max-h-[70vh]">
              <img
                src={selectedVoucherModal}
                alt="Comprobante de Pago"
                className="w-full h-full object-contain bg-black"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
