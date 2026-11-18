import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  UserProfile,
  BingoCard,
  HistoryRecord,
  OnlinePlayer,
  RechargeRequest,
  WithdrawRequest,
  RegisteredUser,
  WonGameRecord,
  WinnerAnnouncement,
  ToastMessage,
  TorneoBilletalConfig,
  AdminGameEarning,
} from "./types";
import { generateAllCartons, evaluateCardFigure, getBallLetter } from "./utils/bingo";
import { audioEngine } from "./utils/audio";
import { DEFAULT_COMMUNITY_USERS, isBotAccount } from "./data/communityUsers";
import { subscribeToUsers, saveUserToSupabase, subscribeToAdminEarnings, saveAdminEarningToSupabase } from "./supabase";
import { AuthScreen } from "./components/AuthScreen";
import { AdminLobby } from "./components/AdminLobby";
import { PlayerLobby } from "./components/PlayerLobby";
import { BannedScreen } from "./components/BannedScreen";
import { MaintenanceOverlay } from "./components/MaintenanceOverlay";
import { ToastContainer } from "./components/ToastContainer";
import { LogoutConfirmModal } from "./components/LogoutConfirmModal";
import { RechargeModal } from "./components/RechargeModal";
import { WithdrawModal } from "./components/WithdrawModal";
import { MyCartonsModal } from "./components/MyCartonsModal";
import { MusicPlayerModal } from "./components/MusicPlayerModal";
import { StatsModal } from "./components/StatsModal";
import { HelpModal } from "./components/HelpModal";
import { WinnerAnnouncementModal } from "./components/WinnerAnnouncementModal";
import { isSpecialLuckyBall, getSpecialBallTitle } from "./components/RotatingMeshTombola";
import confetti from "canvas-confetti";

const DEFAULT_TORNEO_CONFIG: TorneoBilletalConfig = {
  isEnabled: false, // Por defecto cerrado ("acostada usuarios cerrados") hasta que el administrador lo habilite
  title: "Gran Torneo Billetal - Bingo el Chamo",
  prizeVES: 15000,
  entryFeeVES: 100,
  scheduledTime: "Sábado Especial 8:00 PM (Hora de Venezuela)",
  rulesDescription:
    "Modalidad Cartón Lleno de Alta Premiación. Pozo garantizado en Bolívares. El primer participante en cantar Bingo se lleva la premiación oficial.",
  minPlayers: 5,
  maxPlayers: 100,
  registeredCount: 0,
  registeredUsers: [],
  lastUpdated: Date.now(),
  adminNote: "El acceso a usuarios está cerrado temporalmente por la Administración.",
};

const DEFAULT_USER: UserProfile = {
  email: "amilcarrz030201@gmail.com",
  name: "Amilcar (El Chamo)",
  role: "PLAYER",
  balance: 350.0,
  avatar: "🤠",
  gender: "MALE",
  stats: {
    cartones: 12,
    bingos: 3,
    victorias: 3,
  },
};

export default function App() {
  // 1. Current Authenticated User (Initializes with Amilcar by default so Bingo el Chamo opens immediately)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem("chamo_current_user_v1");
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_USER;
  });

  // 2. All 200 Bingo Cartons (deterministic generation)
  const allCards = useMemo<BingoCard[]>(() => generateAllCartons(200), []);
  const [activeCartonId, setActiveCartonId] = useState<number>(1);
  const [purchasedCardIds, setPurchasedCardIds] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem("chamo_purchased_cartons_v1");
      if (stored) return JSON.parse(stored);
    } catch {}
    return [1];
  });
  const [favoriteCardIds, setFavoriteCardIds] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem("chamo_fav_cartons_v1");
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  // 3. Tombola State
  const [drawnBalls, setDrawnBalls] = useState<number[]>([]);
  const [currentBall, setCurrentBall] = useState<number | null>(null);
  const [autoMode, setAutoMode] = useState<boolean>(false);
  const [drawIntervalSeconds, setDrawIntervalSeconds] = useState<number>(4);
  const [cartonPrice, setCartonPrice] = useState<number>(60);
  // Pozo total bruto (ej: 1000 VES). Plata en juego muestra 800 VES (80%), Admin gana 20% (200 VES)
  const [grossPot, setGrossPot] = useState<number>(() => {
    try {
      const stored = localStorage.getItem("chamo_gross_pot_v1");
      if (stored) {
        const val = Number(stored);
        if (!isNaN(val) && val > 0) return val;
      }
    } catch {}
    return 1000;
  });
  const plataEnJuego = useMemo(() => Number((grossPot * 0.8).toFixed(2)), [grossPot]);
  const handleUpdatePlataEnJuego = useCallback((newPlata: number) => {
    const newGross = Number((newPlata / 0.8).toFixed(2));
    setGrossPot(newGross);
    try {
      localStorage.setItem("chamo_gross_pot_v1", String(newGross));
    } catch {}
  }, []);

  // 4. Room Countdown Timer State
  const [roomSeconds, setRoomSeconds] = useState<number>(1800);
  const [configuredRoomDuration, setConfiguredRoomDuration] = useState<number>(1800);
  const [isRoomTimerPaused, setIsRoomTimerPaused] = useState<boolean>(false);

  // 5. Game Records & Financial Requests
  const [rechargeRequests, setRechargeRequests] = useState<RechargeRequest[]>(() => {
    try {
      const stored = localStorage.getItem("chamo_recharges_v1");
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const [withdrawRequests, setWithdrawRequests] = useState<WithdrawRequest[]>(() => {
    try {
      const stored = localStorage.getItem("chamo_withdraws_v1");
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const [history, setHistory] = useState<HistoryRecord[]>(() => {
    try {
      const stored = localStorage.getItem("chamo_history_v1");
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(() => {
    try {
      const stored = localStorage.getItem("chamo_registered_users_v1");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const clean = parsed.filter((u) => u && u.email && !isBotAccount(u.email, u.id));
          if (clean.length > 0) return clean;
        }
      }
    } catch {}
    return DEFAULT_COMMUNITY_USERS;
  });

  const [wonGamesHistory, setWonGamesHistory] = useState<WonGameRecord[]>(() => {
    try {
      const stored = localStorage.getItem("chamo_won_games_v1");
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });
  const [currentWonGame, setCurrentWonGame] = useState<WonGameRecord | null>(null);
  const [winnerAnnouncement, setWinnerAnnouncement] = useState<WinnerAnnouncement | null>(null);

  // Menú del Administrador: Dinero por Partida (Comisión 20% de cada partida)
  const [adminEarnings, setAdminEarnings] = useState<AdminGameEarning[]>(() => {
    try {
      const stored = localStorage.getItem("chamo_admin_dinero_por_partida_v1");
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  useEffect(() => {
    const unsubscribe = subscribeToAdminEarnings((earnings) => {
      if (earnings && earnings.length > 0) {
        setAdminEarnings(earnings);
        try {
          localStorage.setItem("chamo_admin_dinero_por_partida_v1", JSON.stringify(earnings));
        } catch {}
      }
    });
    return () => unsubscribe();
  }, []);

  // 6. Maintenance Mode
  const [isMaintenanceMode, setIsMaintenanceMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem("chamo_maintenance_v1") === "true";
    } catch {
      return false;
    }
  });

  // 7. Torneo Billetal State (Synchronized with Backend /api/torneo)
  const [torneoConfig, setTorneoConfig] = useState<TorneoBilletalConfig>(() => {
    try {
      const stored = localStorage.getItem("chamo_torneo_config_v1");
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_TORNEO_CONFIG;
  });

  // 8. Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = useCallback((toast: Omit<ToastMessage, "id" | "timestamp">) => {
    const newToast: ToastMessage = {
      ...toast,
      id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
    };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // 9. Modals State
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [myCartonsModalOpen, setMyCartonsModalOpen] = useState(false);
  const [musicModalOpen, setMusicModalOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  // 10. Sync Current User in localStorage
  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem("chamo_current_user_v1", JSON.stringify(currentUser));
      } catch {}
    } else {
      try {
        localStorage.removeItem("chamo_current_user_v1");
      } catch {}
    }
  }, [currentUser]);

  // 11. Purge legacy mock bots on boot and sync Registered Users in localStorage
  useEffect(() => {
    try {
      const purgeBotsFromStorageKey = (key: string) => {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter((item) => {
              if (typeof item === "string") return !isBotAccount(item);
              if (item && item.email) return !isBotAccount(item.email, item.id);
              return true;
            });
            localStorage.setItem(key, JSON.stringify(cleaned));
          }
        }
      };
      purgeBotsFromStorageKey("chamo_registered_users_v1");
      purgeBotsFromStorageKey("chamo_registered_users_v2");
      purgeBotsFromStorageKey("chamo_received_friend_reqs_v1");
      purgeBotsFromStorageKey("chamo_sent_friend_reqs_v1");
    } catch {}
  }, []);

  // 11b. Real-time Supabase Users Listener: Syncs all genuinely registered users across devices
  useEffect(() => {
    const unsubscribe = subscribeToUsers((firestoreUsers) => {
      if (firestoreUsers && Array.isArray(firestoreUsers)) {
        setRegisteredUsers((prev) => {
          const map = new Map<string, RegisteredUser>();
          // Add default base real account
          DEFAULT_COMMUNITY_USERS.forEach((u) => {
            map.set(u.email.toLowerCase().trim(), { ...u });
          });
          // Merge current local registered non-bot users
          prev.forEach((u) => {
            if (u && u.email && !isBotAccount(u.email, u.id)) {
              const key = u.email.toLowerCase().trim();
              const existing = map.get(key);
              map.set(key, { ...existing, ...u });
            }
          });
          // Merge Firestore users
          firestoreUsers.forEach((u) => {
            if (u && u.email && !isBotAccount(u.email, u.id)) {
              const key = u.email.toLowerCase().trim();
              const existing = map.get(key);
              map.set(key, {
                ...existing,
                ...u,
                id: u.id || existing?.id || `user-${key}`,
              });
            }
          });
          return Array.from(map.values());
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // 11c. Persist Current User profile into Supabase so other players immediately see them
  useEffect(() => {
    if (currentUser && currentUser.role === "PLAYER" && !isBotAccount(currentUser.email)) {
      saveUserToSupabase({
        id: currentUser.id || `reg-${currentUser.email.replace(/[^a-zA-Z0-9]/g, "_")}`,
        name: currentUser.name,
        email: currentUser.email,
        balance: currentUser.balance || 0,
        gender: currentUser.gender || "MALE",
        pagoMovilPhone: currentUser.pagoMovilPhone,
        pagoMovilBank: currentUser.pagoMovilBank,
        pagoMovilId: currentUser.pagoMovilId,
        avatar: currentUser.avatar || "🤠",
        registeredAt: new Date().toISOString(),
        lastActiveAt: Date.now(),
        isOnline: true,
        stats: currentUser.stats || { cartones: 12, bingos: 3, victorias: 3 },
      }).catch(() => {});
    }
  }, [currentUser?.email, currentUser?.balance, currentUser?.name, currentUser?.avatar]);

  // 11d. Sync Registered Users in localStorage
  useEffect(() => {
    try {
      const cleanUsers = registeredUsers.filter((u) => u && u.email && !isBotAccount(u.email, u.id));
      localStorage.setItem("chamo_registered_users_v1", JSON.stringify(cleanUsers));
    } catch {}
  }, [registeredUsers]);

  // 12. Sync Recharges & Withdrawals
  useEffect(() => {
    try {
      localStorage.setItem("chamo_recharges_v1", JSON.stringify(rechargeRequests));
    } catch {}
  }, [rechargeRequests]);

  useEffect(() => {
    try {
      localStorage.setItem("chamo_withdraws_v1", JSON.stringify(withdrawRequests));
    } catch {}
  }, [withdrawRequests]);

  useEffect(() => {
    try {
      localStorage.setItem("chamo_history_v1", JSON.stringify(history));
    } catch {}
  }, [history]);

  // 13. Real-time Torneo Billetal Sync with Backend (/api/torneo)
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.protocol === "file:") {
      return;
    }
    let isMounted = true;

    const fetchTorneoStatus = async () => {
      try {
        const res = await fetch("/api/torneo");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data && typeof data.isEnabled === "boolean") {
            setTorneoConfig((prev) => {
              if (
                prev.isEnabled !== data.isEnabled ||
                prev.prizeVES !== data.prizeVES ||
                prev.registeredCount !== data.registeredCount ||
                prev.lastUpdated !== data.lastUpdated
              ) {
                // If changed by admin, show subtle notification for players
                if (currentUser && currentUser.role === "PLAYER" && prev.isEnabled !== data.isEnabled) {
                  if (data.isEnabled) {
                    addToast({
                      title: "🏆 ¡Torneo Billetal Habilitado!",
                      message: `El Administrador ha abierto el Torneo Billetal. Pozo: ${(data.prizeVES || 15000).toLocaleString()} VES.`,
                      type: "ball",
                      ballLetter: "B",
                      ballNumber: 7,
                    });
                  } else {
                    addToast({
                      title: "🔒 Torneo Billetal Cerrado",
                      message: "El Administrador ha cerrado el Torneo Billetal para los usuarios.",
                      type: "warning",
                    });
                  }
                }
                try {
                  localStorage.setItem("chamo_torneo_config_v1", JSON.stringify(data));
                } catch {}
                return data;
              }
              return prev;
            });
          }
        }
      } catch {}
    };

    fetchTorneoStatus();
    const interval = setInterval(fetchTorneoStatus, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentUser, addToast]);

  // 14. Presence Heartbeat with Backend
  useEffect(() => {
    if (!currentUser) return;
    if (typeof window !== "undefined" && window.location.protocol === "file:") {
      return;
    }
    const sendHeartbeat = async () => {
      try {
        await fetch("/api/presence/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: currentUser.email,
            name: currentUser.name || currentUser.email.split("@")[0],
            avatar: currentUser.avatar || "👤",
            isOnline: true,
            role: currentUser.role,
          }),
        });
      } catch {}
    };
    sendHeartbeat();
    const timer = setInterval(sendHeartbeat, 15000);
    return () => clearInterval(timer);
  }, [currentUser]);

  // 15. Countdown Timer Logic
  useEffect(() => {
    if (isRoomTimerPaused) return;
    const interval = setInterval(() => {
      setRoomSeconds((prev) => {
        if (prev <= 1) return configuredRoomDuration;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRoomTimerPaused, configuredRoomDuration]);

  const formattedCountdown = useMemo(() => {
    const m = Math.floor(roomSeconds / 60);
    const s = roomSeconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }, [roomSeconds]);

  // 16. Tombola Ball Drawer
  const handleDrawNextBall = useCallback(() => {
    setDrawnBalls((prev) => {
      const remainingBalls = Array.from({ length: 75 }, (_, i) => i + 1).filter(
        (b) => !prev.includes(b)
      );
      if (remainingBalls.length === 0) {
        addToast({
          title: "Fin del Juego",
          message: "Se han extraído las 75 bolas de la tómbola.",
          type: "info",
        });
        return prev;
      }
      const randomIdx = Math.floor(Math.random() * remainingBalls.length);
      const nextBall = remainingBalls[randomIdx];
      const updatedDrawn = [...prev, nextBall];
      setCurrentBall(nextBall);

      // Check if this new ball triggers a win or is a Venezuelan lucky ball
      const isLucky = isSpecialLuckyBall(nextBall);
      let isWin = false;
      for (const cardId of purchasedCardIds) {
        const card = allCards.find((c) => c.id === cardId);
        if (card && evaluateCardFigure(card, updatedDrawn).isWinner) {
          isWin = true;
          break;
        }
      }

      if (isWin || isLucky) {
        audioEngine.playSpecialBallFanfare();
        const letter = getBallLetter(nextBall);
        addToast({
          title: isWin ? "🏆 ¡BOLA GANADORA EXTRAÍDA!" : "✨ ¡BOLA DE LA SUERTE EXTRAÍDA!",
          message: isWin
            ? `¡La bola ${letter}-${nextBall} completa una figura ganadora! Lluvia de confeti 3D en la tómbola.`
            : `${getSpecialBallTitle(nextBall)} • ¡Partículas de confeti 3D activadas!`,
          type: "ball",
          ballLetter: letter,
          ballNumber: nextBall,
        });
      } else {
        audioEngine.playBallDrawn(nextBall);
      }

      return updatedDrawn;
    });
  }, [addToast, purchasedCardIds, allCards]);

  // Check if currentBall is a Winning Ball or Special Lucky Ball
  const { isWinningBall, isSpecialBall, specialBallLabel } = useMemo(() => {
    if (!currentBall || drawnBalls.length === 0) {
      return { isWinningBall: false, isSpecialBall: false, specialBallLabel: "" };
    }

    let winningCardId: number | null = null;
    let winningPattern = "";

    for (const cardId of purchasedCardIds) {
      const card = allCards.find((c) => c.id === cardId);
      if (card) {
        const evalRes = evaluateCardFigure(card, drawnBalls);
        if (evalRes.isWinner) {
          winningCardId = cardId;
          winningPattern = evalRes.patternName;
          break;
        }
      }
    }

    const hasWonGame = Boolean(currentWonGame || winningCardId !== null);
    const isLucky = isSpecialLuckyBall(currentBall);

    let label = "";
    if (hasWonGame) {
      label = `🏆 ¡BOLA GANADORA! (Cartón #${winningCardId ?? currentWonGame?.cartonId ?? "Ganador"} - ${winningPattern || "¡BINGO!"})`;
    } else if (isLucky) {
      label = getSpecialBallTitle(currentBall);
    }

    return {
      isWinningBall: hasWonGame,
      isSpecialBall: Boolean(isLucky || hasWonGame),
      specialBallLabel: label,
    };
  }, [currentBall, drawnBalls, purchasedCardIds, allCards, currentWonGame]);

  const handleResetTombola = useCallback(() => {
    setDrawnBalls([]);
    setCurrentBall(null);
    setAutoMode(false);
    addToast({
      title: "Tómbola Reiniciada",
      message: "Se han regresado las 75 bolas a la tómbola.",
      type: "info",
    });
  }, [addToast]);

  // Auto Tombola interval
  useEffect(() => {
    if (!autoMode) return;
    const interval = setInterval(() => {
      handleDrawNextBall();
    }, drawIntervalSeconds * 1000);
    return () => clearInterval(interval);
  }, [autoMode, drawIntervalSeconds, handleDrawNextBall]);

  // 17. Admin Updates Torneo Billetal Handler
  const handleUpdateTorneoConfig = async (newConfig: TorneoBilletalConfig) => {
    setTorneoConfig(newConfig);
    try {
      localStorage.setItem("chamo_torneo_config_v1", JSON.stringify(newConfig));
    } catch {}

    try {
      await fetch("/api/torneo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      });
    } catch {}

    if (newConfig.isEnabled) {
      addToast({
        title: "🏆 Torneo Billetal Habilitado",
        message: "El Torneo Billetal ahora está ACTIVO para todos los usuarios en Bingo el Chamo.",
        type: "game_won",
      });
    } else {
      addToast({
        title: "🔒 Torneo Billetal Deshabilitado",
        message: "El Torneo Billetal ahora aparece como 'Usuarios Cerrados' para todos los jugadores.",
        type: "warning",
      });
    }
  };

  // 18. Player Enrolls / Buys Cartons in Torneo Billetal Handler (Validación de saldo fijado por el Administrador)
  const handleEnrollTorneo = async (cartonCount: number = 1, totalAmount?: number) => {
    if (!currentUser || currentUser.role !== "PLAYER") return;
    const unitPrice = torneoConfig.entryFeeVES || 100;
    const totalRequired = totalAmount ?? (unitPrice * cartonCount);
    const userBal = currentUser.balance || 0;

    // Validación estricta: El usuario debe tener disponible el dinero fijado por el administrador
    if (userBal < totalRequired) {
      const missing = Number((totalRequired - userBal).toFixed(2));
      addToast({
        title: "Saldo Insuficiente para Torneo Billetal",
        message: `El precio fijado por el Administrador es de ${unitPrice.toFixed(2)} VES por cartón. Total requerido: ${totalRequired.toFixed(2)} VES. Te faltan ${missing.toFixed(2)} VES.`,
        type: "warning",
      });
      setRechargeModalOpen(true);
      return;
    }

    // Deduct exact total and update player
    const updatedUser: UserProfile = {
      ...currentUser,
      balance: Number((userBal - totalRequired).toFixed(2)),
    };
    setCurrentUser(updatedUser);

    const cleanEmail = currentUser.email.toLowerCase().trim();
    const currentReg = torneoConfig.registeredUsers || [];
    const isAlreadyReg = currentReg.includes(cleanEmail);
    const updatedConfig: TorneoBilletalConfig = {
      ...torneoConfig,
      registeredCount: (torneoConfig.registeredCount || 0) + cartonCount,
      registeredUsers: isAlreadyReg ? currentReg : [...currentReg, cleanEmail],
      lastUpdated: Date.now(),
    };
    setTorneoConfig(updatedConfig);
    try {
      await fetch("/api/torneo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedConfig),
      });
    } catch {}

    // Record transaction
    const newTx: HistoryRecord = {
      id: `trx-${Date.now()}`,
      tipo: "COMPRA",
      monto: totalRequired,
      detalles: `Compra de ${cartonCount} ${cartonCount === 1 ? 'cartón' : 'cartones'} para el ${torneoConfig.title} (${unitPrice.toFixed(2)} VES c/u)`,
      fecha: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setHistory((prev) => [newTx, ...prev]);

    addToast({
      title: "🎉 ¡Compra de Cartones Exitosa!",
      message: `Has adquirido ${cartonCount} ${cartonCount === 1 ? 'cartón' : 'cartones'} por ${totalRequired.toFixed(2)} VES para el Torneo Billetal. ¡Mucha suerte!`,
      type: "bingo_claim",
    });
  };

  // 19. Login / Logout Handlers
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    addToast({
      title: "Bienvenido",
      message: `Hola ${user.name || user.email}, acceso concedido a Bingo el Chamo.`,
      type: "info",
    });
  };

  const handleLogout = () => {
    setLogoutConfirmOpen(true);
  };

  const confirmLogout = () => {
    setCurrentUser(null);
    setLogoutConfirmOpen(false);
    addToast({
      title: "Sesión Finalizada",
      message: "Has cerrado sesión correctamente.",
      type: "info",
    });
  };

  // Switch to Player mode helper (used by Admin)
  const handleSwitchToPlayer = () => {
    setCurrentUser(DEFAULT_USER);
    addToast({
      title: "Modo Jugador",
      message: "Has cambiado a la vista de Jugador.",
      type: "info",
    });
  };

  // 20. Carton Buying and Interaction
  const handleBuyCarton = (id: number) => {
    if (!currentUser || currentUser.role !== "PLAYER") return;
    const userBal = currentUser.balance || 0;
    if (userBal < cartonPrice) {
      addToast({
        title: "Saldo Insuficiente",
        message: `El cartón cuesta ${cartonPrice.toFixed(2)} VES. Por favor realiza una recarga.`,
        type: "warning",
      });
      setRechargeModalOpen(true);
      return;
    }

    if (purchasedCardIds.includes(id)) {
      addToast({
        title: "Cartón ya adquirido",
        message: `Ya tienes en tu poder el cartón #${id}.`,
        type: "info",
      });
      return;
    }

    const newBalance = Number((userBal - cartonPrice).toFixed(2));
    const updatedUser = { ...currentUser, balance: newBalance };
    setCurrentUser(updatedUser);

    setPurchasedCardIds((prev) => {
      const next = [...prev, id];
      try {
        localStorage.setItem("chamo_purchased_cartons_v1", JSON.stringify(next));
      } catch {}
      return next;
    });

    setGrossPot((prev) => prev + cartonPrice);

    const newTx: HistoryRecord = {
      id: `trx-${Date.now()}`,
      tipo: "COMPRA",
      monto: cartonPrice,
      detalles: `Compra del Cartón #${id}`,
      fecha: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setHistory((prev) => [newTx, ...prev]);

    addToast({
      title: "¡Cartón Adquirido!",
      message: `Has comprado el Cartón #${id} por ${cartonPrice.toFixed(2)} VES.`,
      type: "info",
    });
  };

  const handleToggleFavorite = (cartonId: number) => {
    setFavoriteCardIds((prev) => {
      const next = prev.includes(cartonId)
        ? prev.filter((id) => id !== cartonId)
        : [...prev, cartonId];
      try {
        localStorage.setItem("chamo_fav_cartons_v1", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleToggleCell = (_row: number, _col: number, cartonId?: number) => {
    if (cartonId) {
      setActiveCartonId(cartonId);
    }
  };

  const handleAutoDaub = (cartonId?: number) => {
    addToast({
      title: "Marcado Automático",
      message: `Cartón #${cartonId || activeCartonId} actualizado con las bolas cantadas.`,
      type: "info",
    });
  };

  const handleCheckBingo = (cartonId?: number) => {
    const targetId = cartonId || activeCartonId;
    const card = allCards.find((c) => c.id === targetId) || allCards[0];
    const evalResult = evaluateCardFigure(card, drawnBalls);

    if (evalResult.isWinner) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });

      // Breakdown 80% / 20%:
      // Gross Pot (ej: 1000 VES)
      // Plata en Juego (80% = 800 VES)
      // Admin gana 20% (200 VES) y se suma en "Dinero por Partida"
      // El jugador ganador gana el 80% y se acredita automáticamente a su cuenta
      // Todos los cartones vuelven a la tienda
      const currentGross = grossPot;
      const prize80 = Number((currentGross * 0.8).toFixed(2));
      const adminCommission20 = Number((currentGross * 0.2).toFixed(2));
      const lastBall = drawnBalls[drawnBalls.length - 1] || 1;
      const winnerEmail = currentUser?.email || "";
      const winnerName = currentUser?.name || currentUser?.email.split("@")[0] || "Ganador";
      const winnerAvatar = currentUser?.avatar || "🤠";

      // Verificar si está jugando en Dúo
      const duoPartnerEmail = currentUser?.duoPartnerEmail;
      const isDuoWin = !!(duoPartnerEmail && duoPartnerEmail.trim().length > 0);
      const duoPartner = isDuoWin
        ? registeredUsers.find((u) => u.email.toLowerCase() === duoPartnerEmail!.toLowerCase())
        : null;
      const duoPartnerName = duoPartner?.name || duoPartnerEmail?.split("@")[0] || "Compañero Dúo";

      const soloPrize = prize80;
      const duoEachPrize = Number((prize80 * 0.5).toFixed(2)); // 40% cada uno
      const winnerPrizeToCredit = isDuoWin ? duoEachPrize : soloPrize;

      // 1. ACREDITACIÓN AUTOMÁTICA AL SALDO DEL JUGADOR GANADOR EN BINGO EL CHAMO:
      const updatedBalance = Number(((currentUser?.balance || 0) + winnerPrizeToCredit).toFixed(2));
      const updatedWins = ((currentUser?.stats?.victorias ?? currentUser?.stats?.bingos ?? 0) + 1);

      const updatedUser: UserProfile = {
        ...currentUser!,
        balance: updatedBalance,
        stats: {
          ...currentUser?.stats,
          cartones: 0,
          bingos: updatedWins,
          victorias: updatedWins,
        },
      };
      setCurrentUser(updatedUser);
      try {
        localStorage.setItem("chamo_current_user_v1", JSON.stringify(updatedUser));
      } catch {}

      // Actualizar en la lista de usuarios registrados
      setRegisteredUsers((prevUsers) => {
        const nextUsers = prevUsers.map((u) => {
          if (u.email.toLowerCase() === winnerEmail.toLowerCase()) {
            return {
              ...u,
              balance: updatedBalance,
              stats: {
                ...u.stats,
                bingos: updatedWins,
                victorias: updatedWins,
                cartones: 0,
              },
            };
          }
          if (isDuoWin && duoPartnerEmail && u.email.toLowerCase() === duoPartnerEmail.toLowerCase()) {
            const partnerNewBal = Number(((u.balance || 0) + duoEachPrize).toFixed(2));
            const partnerNewWins = ((u.stats?.victorias ?? u.stats?.bingos ?? 0) + 1);
            return {
              ...u,
              balance: partnerNewBal,
              stats: {
                ...u.stats,
                bingos: partnerNewWins,
                victorias: partnerNewWins,
                cartones: 0,
              },
            };
          }
          return u;
        });
        try {
          localStorage.setItem("chamo_registered_users_v1", JSON.stringify(nextUsers));
        } catch {}
        return nextUsers;
      });

      // Guardar en Supabase
      saveUserToSupabase({
        ...updatedUser,
        id: updatedUser.email,
        name: updatedUser.name || updatedUser.email.split("@")[0] || "Jugador",
        gender: updatedUser.gender || "MALE",
        registeredAt: new Date().toISOString(),
        stats: {
          cartones: 0,
          bingos: updatedWins,
          victorias: updatedWins,
        },
      }).catch(() => {});
      if (isDuoWin && duoPartner) {
        saveUserToSupabase({
          ...duoPartner,
          balance: Number(((duoPartner.balance || 0) + duoEachPrize).toFixed(2)),
          stats: {
            ...duoPartner.stats,
            bingos: ((duoPartner.stats?.victorias ?? duoPartner.stats?.bingos ?? 0) + 1),
            victorias: ((duoPartner.stats?.victorias ?? duoPartner.stats?.bingos ?? 0) + 1),
            cartones: 0,
          },
        }).catch(() => {});
      }

      // Registro en historial de transacciones
      const newTx: HistoryRecord = {
        id: `trx-${Date.now()}`,
        tipo: "BINGO",
        monto: winnerPrizeToCredit,
        detalles: isDuoWin
          ? `¡Victoria en Dúo con Cartón #${targetId}! Acreditación automática del 40% (+${winnerPrizeToCredit.toFixed(2)} VES).`
          : `¡Bingo Ganado con Cartón #${targetId}! Acreditación automática del 80% (+${winnerPrizeToCredit.toFixed(2)} VES).`,
        fecha: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setHistory((prev) => {
        const nextHist = [newTx, ...prev];
        try {
          localStorage.setItem("chamo_history_v1", JSON.stringify(nextHist));
        } catch {}
        return nextHist;
      });

      // 2. EL ADMIN GANA EL 20% Y SE SUMA EN EL MENÚ "DINERO POR PARTIDA":
      const newEarning: AdminGameEarning = {
        id: `earning-${Date.now()}`,
        gameId: `game-${Date.now()}`,
        gameType: "JUEGO_NORMAL",
        date: new Date().toLocaleDateString("es-VE"),
        timestamp: Date.now(),
        grossPot: currentGross,
        netPlataEnJuego: prize80,
        winnerPrize: prize80,
        winnerEmail,
        winnerName,
        winnerAvatar,
        adminEarnings20: adminCommission20,
        cartonId: targetId,
        patternName: evalResult.patternName,
        isDuoWin,
        duoPartnerEmail: isDuoWin ? duoPartnerEmail : undefined,
        duoPartnerName: isDuoWin ? duoPartnerName : undefined,
      };

      setAdminEarnings((prev) => {
        const next = [newEarning, ...prev];
        try {
          localStorage.setItem("chamo_admin_dinero_por_partida_v1", JSON.stringify(next));
        } catch {}
        return next;
      });
      saveAdminEarningToSupabase(newEarning).catch(() => {});

      // 3. TODOS LOS CARTONES VUELVEN A LA TIENDA:
      setPurchasedCardIds([]);
      try {
        localStorage.setItem("chamo_purchased_cartons_v1", "[]");
      } catch {}

      // Reiniciar tómbola para la próxima partida
      setDrawnBalls([]);
      setCurrentBall(null);
      setAutoMode(false);

      // Desplegar anuncio del ganador
      const announcement: WinnerAnnouncement = {
        id: `win-${Date.now()}`,
        winnerName,
        winnerEmail,
        winnerAvatar,
        cartonId: targetId,
        patternName: evalResult.patternName,
        winningBall: lastBall,
        winningBallLetter: getBallLetter(lastBall),
        prizeAmount: winnerPrizeToCredit,
        plataEnJuego: prize80,
        missedBalls: 0,
        claimedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isSelf: true,
        prizeStatus: "PAID",
        isDuoWin,
        duoPartnerName: isDuoWin ? duoPartnerName : undefined,
        duoPartnerPrizeVES: isDuoWin ? duoEachPrize : undefined,
        winnerPrizeVES: winnerPrizeToCredit,
      };
      setWinnerAnnouncement(announcement);
      audioEngine.playBingoWin();

      addToast({
        title: "🎉 ¡BINGO GANADO! Saldo Acreditado",
        message: `¡Felicidades! Se han acreditado +${winnerPrizeToCredit.toFixed(2)} VES (80%) automáticamente a tu cuenta. Ganancia Admin: 20% registrada. Todos los cartones han vuelto a la tienda.`,
        type: "game_won",
      });
    } else {
      addToast({
        title: "Aún no hay Bingo",
        message: `Cartón #${targetId}: Tiene ${evalResult.matchedCells} aciertos en la figura requerida.`,
        type: "warning",
      });
    }
  };

  // Friend Management Handlers
  const handleAddFriend = useCallback((email: string) => {
    if (!currentUser) return;
    const cleanEmail = email.toLowerCase().trim();
    const currentFriends = currentUser.friends || [];
    if (!currentFriends.includes(cleanEmail)) {
      const updatedFriends = [...currentFriends, cleanEmail];
      const updatedUser = { ...currentUser, friends: updatedFriends };
      setCurrentUser(updatedUser);
      try {
        localStorage.setItem("chamo_current_user_v1", JSON.stringify(updatedUser));
      } catch {}
      addToast({
        title: "¡Amigo Agregado! 👥",
        message: `Ahora eres amigo de ${cleanEmail}. ¡Pueden jugar juntos en Dúo!`,
        type: "info",
      });
    }
  }, [currentUser, addToast]);

  const handleRemoveFriend = useCallback((email: string) => {
    if (!currentUser) return;
    const cleanEmail = email.toLowerCase().trim();
    const currentFriends = currentUser.friends || [];
    const updatedFriends = currentFriends.filter((f) => f.toLowerCase() !== cleanEmail);
    const updatedUser = { ...currentUser, friends: updatedFriends };
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem("chamo_current_user_v1", JSON.stringify(updatedUser));
    } catch {}
    addToast({
      title: "Amigo Eliminado",
      message: `Has eliminado a ${cleanEmail} de tus amigos.`,
      type: "info",
    });
  }, [currentUser, addToast]);

  // 21. Recharges Submission
  const handleRechargeSubmit = (data: {
    transactionId: string;
    monto: number;
    ref: string;
    bank: string;
    voucherImage?: string;
  }) => {
    if (!currentUser) return;
    const newReq: RechargeRequest = {
      id: data.transactionId,
      transactionId: data.transactionId,
      email: currentUser.email,
      monto: data.monto,
      ref: data.ref,
      bank: data.bank,
      fecha: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      estado: "PENDIENTE",
      voucherImage: data.voucherImage,
    };
    setRechargeRequests((prev) => [newReq, ...prev]);
    setRechargeModalOpen(false);
    addToast({
      title: "Solicitud de Recarga Enviada",
      message: `Tu pago de ${data.monto.toFixed(2)} VES fue recibido y está en verificación.`,
      type: "info",
    });
  };

  // 22. Withdrawal Submission
  const handleWithdrawSubmit = (data: {
    transactionId: string;
    monto: number;
    datos: string;
    userName?: string;
  }) => {
    if (!currentUser) return;
    const userBal = currentUser.balance || 0;
    if (userBal < data.monto) {
      addToast({
        title: "Saldo Insuficiente",
        message: `No posees saldo suficiente para retirar ${data.monto.toFixed(2)} VES.`,
        type: "warning",
      });
      return;
    }

    const updatedUser = { ...currentUser, balance: Number((userBal - data.monto).toFixed(2)) };
    setCurrentUser(updatedUser);

    const newReq: WithdrawRequest = {
      id: data.transactionId,
      transactionId: data.transactionId,
      email: currentUser.email,
      userName: data.userName || currentUser.name || currentUser.email.split("@")[0],
      monto: data.monto,
      datos: data.datos,
      fecha: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      estado: "PENDIENTE",
    };
    setWithdrawRequests((prev) => [newReq, ...prev]);
    setWithdrawModalOpen(false);

    const newTx: HistoryRecord = {
      id: `trx-${Date.now()}`,
      tipo: "RETIRO",
      monto: data.monto,
      detalles: `Solicitud de retiro a ${data.datos}`,
      fecha: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setHistory((prev) => [newTx, ...prev]);

    addToast({
      title: "Solicitud de Retiro Enviada",
      message: `Tu solicitud de ${data.monto.toFixed(2)} VES ha sido enviada al administrador.`,
      type: "info",
    });
  };

  // 23. Admin Approvals
  const handleApproveRecharge = (id: string, approvedAmount?: number) => {
    setRechargeRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const finalMonto = approvedAmount !== undefined ? approvedAmount : r.monto;
          // Credit user if in local registered list
          setRegisteredUsers((users) =>
            users.map((u) => {
              if (u.email.toLowerCase() === r.email.toLowerCase()) {
                return { ...u, balance: (u.balance || 0) + finalMonto };
              }
              return u;
            })
          );
          if (currentUser && currentUser.email.toLowerCase() === r.email.toLowerCase()) {
            setCurrentUser((u) => (u ? { ...u, balance: (u.balance || 0) + finalMonto } : null));
          }
          return { ...r, estado: "APROBADO", monto: finalMonto };
        }
        return r;
      })
    );
    addToast({
      title: "Recarga Aprobada",
      message: `Se ha acreditado el saldo al jugador con éxito.`,
      type: "game_won",
    });
  };

  const handleRejectRecharge = (id: string, reason?: string) => {
    setRechargeRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, estado: "RECHAZADO", notes: reason } : r))
    );
    addToast({
      title: "Recarga Rechazada",
      message: `La solicitud fue declinada.`,
      type: "info",
    });
  };

  const handleApproveWithdraw = (id: string, approvedAmount?: number) => {
    setWithdrawRequests((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          const finalMonto = approvedAmount !== undefined ? approvedAmount : w.monto;
          return { ...w, estado: "APROBADO", monto: finalMonto };
        }
        return w;
      })
    );
    addToast({
      title: "Retiro Aprobado",
      message: `Se ha procesado la transferencia del retiro.`,
      type: "game_won",
    });
  };

  const handleRejectWithdraw = (id: string, reason?: string) => {
    setWithdrawRequests((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          // Refund user balance
          if (currentUser && currentUser.email.toLowerCase() === w.email.toLowerCase()) {
            setCurrentUser((u) => (u ? { ...u, balance: (u.balance || 0) + w.monto } : null));
          }
          return { ...w, estado: "RECHAZADO", notes: reason };
        }
        return w;
      })
    );
    addToast({
      title: "Retiro Rechazado",
      message: `El retiro fue rechazado y el saldo se reintegró al jugador.`,
      type: "warning",
    });
  };

  // 24. Maintenance Mode Toggle
  const handleToggleMaintenance = (enabled: boolean) => {
    setIsMaintenanceMode(enabled);
    try {
      localStorage.setItem("chamo_maintenance_v1", enabled ? "true" : "false");
    } catch {}
    addToast({
      title: enabled ? "Modo Mantenimiento Activado" : "Mantenimiento Desactivado",
      message: enabled
        ? "La aplicación ahora está bloqueada para los jugadores regulares."
        : "La aplicación ha sido reabierta a todos los jugadores.",
      type: enabled ? "warning" : "info",
    });
  };

  // 25. Active Carton selection
  const activeCarton = useMemo(() => {
    return allCards.find((c) => c.id === activeCartonId) || allCards[0];
  }, [allCards, activeCartonId]);

  // Online players list (Zero bots: only genuine registered players)
  const onlinePlayers: OnlinePlayer[] = useMemo(() => {
    return registeredUsers
      .filter((u) => u && u.email && !isBotAccount(u.email, u.id) && (u as any).role !== "ADMIN")
      .slice(0, 12)
      .map((u, i) => ({
        id: u.id || `p-${i}`,
        name: u.name || u.email.split("@")[0],
        email: u.email,
        avatar: u.avatar || "👤",
        isOnline: u.isOnline !== false,
        status: u.isOnline !== false ? "En Sala" : "Desconectado",
        cartonesCount: u.stats?.cartones || 1,
      }));
  }, [registeredUsers]);

  // Not authenticated
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center">
        <AuthScreen onLoginSuccess={handleLoginSuccess} />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  // Banned user screen
  if (currentUser.isBanned) {
    return (
      <BannedScreen
        user={currentUser}
        onLogout={confirmLogout}
      />
    );
  }

  // Maintenance screen (Blocks regular players, admin has full bypass)
  if (isMaintenanceMode && currentUser.role !== "ADMIN") {
    return (
      <MaintenanceOverlay
        onLogout={confirmLogout}
        onAdminLogin={() => {
          setCurrentUser(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-yellow-400 selection:text-slate-950 relative">
      {/* Botón de cambio de vista (Solo visible si es ADMIN, estrictamente oculto para jugadores regulares) */}
      {currentUser.role === "ADMIN" && (
        <div className="fixed bottom-3 right-3 z-50 flex items-center gap-2 bg-slate-900/90 border border-amber-500/50 backdrop-blur-md rounded-2xl p-1.5 shadow-2xl">
          <span className="text-[10px] font-fredoka text-yellow-300 px-2 font-bold hidden sm:inline">
            Modo Admin Activo
          </span>
          <button
            type="button"
            onClick={handleSwitchToPlayer}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-fredoka font-black text-xs px-3 py-1.5 rounded-xl shadow transition cursor-pointer active:scale-95"
            title="Cambiar a la vista de Jugador"
          >
            👤 Ver como Jugador
          </button>
        </div>
      )}

      {/* 1. Admin Lobby Interface */}
      {currentUser.role === "ADMIN" ? (
        <AdminLobby
          user={currentUser}
          drawnBalls={drawnBalls}
          currentBall={currentBall}
          totalBalls={75}
          allCards={allCards}
          plataEnJuego={plataEnJuego}
          totalCartonesEnJuego={purchasedCardIds.length}
          cartonPrice={cartonPrice}
          onUpdateCartonPrice={setCartonPrice}
          onUpdatePlataEnJuego={handleUpdatePlataEnJuego}
          adminEarnings={adminEarnings}
          rechargeRequests={rechargeRequests}
          withdrawRequests={withdrawRequests}
          history={history}
          registeredUsers={registeredUsers}
          onRefreshUsers={() => {}}
          currentWonGame={currentWonGame}
          wonGamesHistory={wonGamesHistory}
          onSetPrizeAndPay={(gameId, amountVES) => {
            const winnerAmount = amountVES !== undefined ? amountVES : plataEnJuego;
            const gross = Number((winnerAmount / 0.8).toFixed(2));
            const adminFee = Number((gross * 0.2).toFixed(2));
            const targetWinnerEmail = currentWonGame?.winnerEmail || "";
            const targetWinnerName = currentWonGame?.winnerName || "Ganador";

            // Acreditación automática al saldo del jugador ganador
            if (targetWinnerEmail) {
              setRegisteredUsers((users) => {
                const next = users.map((u) => {
                  if (u.email.toLowerCase() === targetWinnerEmail.toLowerCase()) {
                    const newBal = Number(((u.balance || 0) + winnerAmount).toFixed(2));
                    const newWins = (u.stats?.victorias ?? u.stats?.bingos ?? 0) + 1;
                    const updated = {
                      ...u,
                      balance: newBal,
                      stats: { ...u.stats, victorias: newWins, bingos: newWins, cartones: 0 },
                    };
                    saveUserToSupabase(updated).catch(() => {});
                    return updated;
                  }
                  return u;
                });
                try {
                  localStorage.setItem("chamo_registered_users_v1", JSON.stringify(next));
                } catch {}
                return next;
              });

              if (currentUser && currentUser.email.toLowerCase() === targetWinnerEmail.toLowerCase()) {
                const newBal = Number(((currentUser.balance || 0) + winnerAmount).toFixed(2));
                const newWins = (currentUser.stats?.victorias ?? currentUser.stats?.bingos ?? 0) + 1;
                const updated = {
                  ...currentUser,
                  balance: newBal,
                  stats: { ...currentUser.stats, victorias: newWins, bingos: newWins, cartones: 0 },
                };
                setCurrentUser(updated);
                try {
                  localStorage.setItem("chamo_current_user_v1", JSON.stringify(updated));
                } catch {}
              }
            }

            // Registrar 20% en Dinero por Partida
            const earning: AdminGameEarning = {
              id: `earning-${Date.now()}`,
              gameId: gameId || `game-${Date.now()}`,
              gameType: "JUEGO_NORMAL",
              date: new Date().toLocaleDateString("es-VE"),
              timestamp: Date.now(),
              grossPot: gross,
              netPlataEnJuego: winnerAmount,
              winnerPrize: winnerAmount,
              winnerEmail: targetWinnerEmail,
              winnerName: targetWinnerName,
              winnerAvatar: currentWonGame?.winnerAvatar || "👤",
              adminEarnings20: adminFee,
              cartonId: currentWonGame?.cartonId || 1,
              patternName: currentWonGame?.patternName || "Línea Horizontal",
            };

            setAdminEarnings((prev) => {
              const next = [earning, ...prev];
              try {
                localStorage.setItem("chamo_admin_dinero_por_partida_v1", JSON.stringify(next));
              } catch {}
              return next;
            });
            saveAdminEarningToSupabase(earning).catch(() => {});

            // Todos los cartones vuelven a la tienda
            setPurchasedCardIds([]);
            try {
              localStorage.setItem("chamo_purchased_cartons_v1", "[]");
            } catch {}
            setDrawnBalls([]);
            setCurrentBall(null);
            setAutoMode(false);
            setCurrentWonGame(null);

            addToast({
              title: "🎉 Premio Liquidado y Acreditado (80%)",
              message: `Se han acreditado +${winnerAmount.toFixed(2)} VES automáticamente al ganador. Ganancia Admin: +${adminFee.toFixed(2)} VES (20%) registrada en Dinero por Partida. Todos los cartones han vuelto a la tienda.`,
              type: "game_won",
            });
          }}
          onRejectWin={(_gameId) => {
            addToast({
              title: "Victoria Declinada",
              message: `Se ha declinado la ganancia del juego.`,
              type: "info",
            });
          }}
          roomCountdown={formattedCountdown}
          roomSeconds={roomSeconds}
          configuredRoomDuration={configuredRoomDuration}
          isRoomTimerPaused={isRoomTimerPaused}
          onUpdateRemainingSeconds={setRoomSeconds}
          onUpdateConfiguredRoomDuration={setConfiguredRoomDuration}
          onTogglePauseRoomTimer={() => setIsRoomTimerPaused((p) => !p)}
          onResetRoomTimer={() => setRoomSeconds(configuredRoomDuration)}
          onAdjustRemainingSeconds={(delta) =>
            setRoomSeconds((prev) => Math.max(10, prev + delta))
          }
          autoMode={autoMode}
          drawIntervalSeconds={drawIntervalSeconds}
          onChangeDrawInterval={setDrawIntervalSeconds}
          onDrawNextBall={handleDrawNextBall}
          onResetTombola={handleResetTombola}
          onToggleAutoMode={() => setAutoMode((a) => !a)}
          onApproveRecharge={handleApproveRecharge}
          onRejectRecharge={handleRejectRecharge}
          onApproveWithdraw={handleApproveWithdraw}
          onRejectWithdraw={handleRejectWithdraw}
          isMaintenanceMode={isMaintenanceMode}
          onToggleMaintenance={handleToggleMaintenance}
          torneoConfig={torneoConfig}
          onUpdateTorneoConfig={handleUpdateTorneoConfig}
          isSpecialBall={isSpecialBall}
          isWinningBall={isWinningBall}
          specialBallLabel={specialBallLabel}
          onLogout={handleLogout}
        />
      ) : (
        /* 2. Regular Player Lobby Interface */
        <PlayerLobby
          user={currentUser}
          activeCarton={activeCarton}
          purchasedCardIds={purchasedCardIds}
          drawnBalls={drawnBalls}
          currentBall={currentBall}
          history={history}
          allCards={allCards}
          roomCountdown={formattedCountdown}
          roomSeconds={roomSeconds}
          isRoomTimerPaused={isRoomTimerPaused}
          onlinePlayers={onlinePlayers}
          friendEmails={currentUser.friends || []}
          registeredUsers={registeredUsers}
          rechargeRequests={rechargeRequests}
          withdrawRequests={withdrawRequests}
          currentWonGame={currentWonGame}
          wonGamesHistory={wonGamesHistory}
          cartonPrice={cartonPrice}
          winnerAnnouncement={winnerAnnouncement}
          plataEnJuego={plataEnJuego}
          favoriteCardIds={favoriteCardIds}
          isSpecialBall={isSpecialBall}
          isWinningBall={isWinningBall}
          specialBallLabel={specialBallLabel}
          onToggleFavorite={handleToggleFavorite}
          onToggleCell={handleToggleCell}
          onAutoDaub={handleAutoDaub}
          onCheckBingo={handleCheckBingo}
          onBuyCarton={handleBuyCarton}
          onSelectCartonId={setActiveCartonId}
          onOpenRecharge={() => setRechargeModalOpen(true)}
          onOpenWithdraw={() => setWithdrawModalOpen(true)}
          onOpenMyCartons={() => setMyCartonsModalOpen(true)}
          onOpenMusic={() => setMusicModalOpen(true)}
          onOpenStats={() => setStatsModalOpen(true)}
          onOpenHelp={() => setHelpModalOpen(true)}
          onLogout={handleLogout}
          onAddFriend={handleAddFriend}
          onRemoveFriend={handleRemoveFriend}
          torneoConfig={torneoConfig}
          onEnrollTorneo={handleEnrollTorneo}
        />
      )}

      {/* Global Modals */}
      <RechargeModal
        isOpen={rechargeModalOpen}
        onClose={() => setRechargeModalOpen(false)}
        onSubmit={handleRechargeSubmit}
      />

      <WithdrawModal
        isOpen={withdrawModalOpen}
        userBalance={currentUser.balance || 0}
        userName={currentUser.name}
        userEmail={currentUser.email}
        onClose={() => setWithdrawModalOpen(false)}
        onSubmit={handleWithdrawSubmit}
      />

      <MyCartonsModal
        isOpen={myCartonsModalOpen}
        onClose={() => setMyCartonsModalOpen(false)}
        purchasedCardIds={purchasedCardIds}
        allCards={allCards}
        drawnBalls={drawnBalls}
        history={history}
        cartonPrice={cartonPrice}
        onSelectCarton={(id) => {
          setActiveCartonId(id);
          setMyCartonsModalOpen(false);
        }}
      />

      <MusicPlayerModal
        isOpen={musicModalOpen}
        onClose={() => setMusicModalOpen(false)}
      />

      <StatsModal
        isOpen={statsModalOpen}
        onClose={() => setStatsModalOpen(false)}
        user={currentUser}
        drawnBallsCount={drawnBalls.length}
      />

      <HelpModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
      />

      <WinnerAnnouncementModal
        announcement={winnerAnnouncement}
        onClose={() => setWinnerAnnouncement(null)}
      />

      <LogoutConfirmModal
        isOpen={logoutConfirmOpen}
        user={currentUser}
        onConfirm={confirmLogout}
        onCancel={() => setLogoutConfirmOpen(false)}
      />

      {/* Non-intrusive Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
