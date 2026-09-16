import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { UserProfile, BingoCard, RechargeRequest, WithdrawRequest, HistoryRecord, OnlinePlayer, CharacterModel } from "./types";
import { generateAllCartons, evaluateCardFigure } from "./utils/bingo";
import { AuthScreen } from "./components/AuthScreen";
import { PlayerLobby } from "./components/PlayerLobby";
import { AdminLobby } from "./components/AdminLobby";
import { FloatingSphereWidget } from "./components/FloatingSphereWidget";
import { RechargeModal } from "./components/RechargeModal";
import { WithdrawModal } from "./components/WithdrawModal";
import { MyCartonsModal } from "./components/MyCartonsModal";
import { MusicPlayerModal } from "./components/MusicPlayerModal";
import { StatsModal } from "./components/StatsModal";
import { HelpModal } from "./components/HelpModal";
import { Snowfall } from "./components/Snowfall";
import { audioEngine } from "./utils/audio";

export default function App() {
  // Generate 200 consistent official bingo cards
  const [allCards, setAllCards] = useState<BingoCard[]>(() => generateAllCartons(200));
  const [activeCartonId, setActiveCartonId] = useState<number>(1);

  // User state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem("chamo_current_user_v5");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Game Room & Tombola State
  const [drawnBalls, setDrawnBalls] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("chamo_drawn_balls_v5");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentBall, setCurrentBall] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem("chamo_drawn_balls_v5");
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.length > 0 ? parsed[parsed.length - 1] : null;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [autoMode, setAutoMode] = useState<boolean>(false);
  const [roomSeconds, setRoomSeconds] = useState<number>(1800); // 30 mins

  // Persistent purchased cartons and requests
  const [purchasedCardIds, setPurchasedCardIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("chamo_purchased_cartons_v5");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [rechargeRequests, setRechargeRequests] = useState<RechargeRequest[]>(() => {
    try {
      const saved = localStorage.getItem("chamo_recharge_requests_v5");
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: "req-1",
              transactionId: "TRX-REC-749102",
              email: "pedro.gonzalez@gmail.com",
              monto: 120.0,
              ref: "76543210",
              bank: "Banesco",
              estado: "PENDIENTE",
              fecha: "2026-12-24 10:15",
            },
            {
              id: "req-2",
              transactionId: "TRX-REC-892415",
              email: "maria.solorzano@gmail.com",
              monto: 60.0,
              ref: "11223344",
              bank: "Banco de Venezuela",
              estado: "APROBADO",
              fecha: "2026-12-24 09:30",
            },
          ];
    } catch {
      return [];
    }
  });

  const [withdrawRequests, setWithdrawRequests] = useState<WithdrawRequest[]>(() => {
    try {
      const saved = localStorage.getItem("chamo_withdraw_requests_v5");
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: "with-init-1",
              transactionId: "TRX-RET-30918",
              email: "pedro.gonzalez@gmail.com",
              monto: 50.0,
              datos: "0414-1234567 / CI 18.234.567 / Banesco",
              bank: "Banesco",
              phone: "0414-1234567",
              cedula: "18.234.567",
              estado: "APROBADO",
              fecha: "2026-12-24 11:20",
            },
          ];
    } catch {
      return [];
    }
  });

  const [history, setHistory] = useState<HistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem("chamo_history_v5");
      if (saved) return JSON.parse(saved);
      return [
        {
          id: "rec-init-1",
          transactionId: "TRX-REC-749102",
          tipo: "RECARGA",
          monto: 120.0,
          estado: "PENDIENTE",
          requestId: "req-1",
          detalles: "Recarga solicitada por 120.00 VES (Ref: 76543210, Banesco)",
          fecha: "2026-12-24 10:15",
        },
        {
          id: "rec-init-2",
          transactionId: "TRX-REC-892415",
          tipo: "RECARGA",
          monto: 60.0,
          estado: "APROBADO",
          requestId: "req-2",
          detalles: "Recarga solicitada por 60.00 VES (Ref: 11223344, Banco de Venezuela)",
          fecha: "2026-12-24 09:30",
        },
        {
          id: "with-init-1",
          transactionId: "TRX-RET-30918",
          tipo: "RETIRO",
          monto: 50.0,
          estado: "APROBADO",
          requestId: "with-init-1",
          detalles: "Solicitud de Retiro por 50.00 VES hacia Pago Móvil (0414-1234567 / Banesco)",
          fecha: "2026-12-24 11:20",
        },
      ];
    } catch {
      return [];
    }
  });

  // Friends & Real Players in Lobby (100% Real - CERO BOTS)
  const [friendEmails, setFriendEmails] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("chamo_real_friends_v6");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [realPlayers, setRealPlayers] = useState<OnlinePlayer[]>(() => {
    try {
      const saved = localStorage.getItem("chamo_real_friends_list_v6");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals state
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isMyCartonsOpen, setIsMyCartonsOpen] = useState(false);
  const [isMusicOpen, setIsMusicOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Persistence effects
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("chamo_current_user_v5", JSON.stringify(currentUser));
      if (currentUser.role === "PLAYER" && currentUser.balance !== null) {
        localStorage.setItem(`chamo_balance_${currentUser.email}`, String(currentUser.balance));
      }
    } else {
      localStorage.removeItem("chamo_current_user_v5");
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("chamo_drawn_balls_v5", JSON.stringify(drawnBalls));
  }, [drawnBalls]);

  useEffect(() => {
    localStorage.setItem("chamo_purchased_cartons_v5", JSON.stringify(purchasedCardIds));
  }, [purchasedCardIds]);

  useEffect(() => {
    localStorage.setItem("chamo_recharge_requests_v5", JSON.stringify(rechargeRequests));
  }, [rechargeRequests]);

  useEffect(() => {
    localStorage.setItem("chamo_withdraw_requests_v5", JSON.stringify(withdrawRequests));
  }, [withdrawRequests]);

  useEffect(() => {
    localStorage.setItem("chamo_history_v5", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem("chamo_friends_v6", JSON.stringify(friendEmails));
  }, [friendEmails]);

  useEffect(() => {
    localStorage.setItem("chamo_real_friends_list_v6", JSON.stringify(realPlayers));
  }, [realPlayers]);

  // Global sound effect for touching/tapping buttons and interactive UI elements
  useEffect(() => {
    const handleGlobalTap = (e: MouseEvent | TouchEvent) => {
      const el = e.target as HTMLElement | null;
      if (!el) return;
      if (
        el.closest("button") ||
        el.closest("a") ||
        el.closest("input[type='range']") ||
        el.closest("input[type='checkbox']") ||
        el.closest("[role='button']") ||
        el.classList.contains("clickable") ||
        el.tagName === "BUTTON"
      ) {
        audioEngine.playTap();
      }
    };
    window.addEventListener("pointerdown", handleGlobalTap, { passive: true });
    return () => window.removeEventListener("pointerdown", handleGlobalTap);
  }, []);

  // Partida 30-minute room countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setRoomSeconds((prev) => {
        if (prev <= 1) {
          return 1800;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Automated Tombola Interval (every 4 seconds if enabled by Admin)
  const autoModeRef = useRef(autoMode);
  autoModeRef.current = autoMode;

  useEffect(() => {
    if (!autoMode) return;
    const interval = setInterval(() => {
      if (autoModeRef.current) {
        handleDrawNextBall();
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [autoMode, drawnBalls]);

  // Draw Next Ball (1 to 75)
  const handleDrawNextBall = () => {
    if (drawnBalls.length >= 75) {
      setAutoMode(false);
      alert("¡Se han cantado todas las 75 bolas de la partida!");
      return;
    }

    const unextracted: number[] = [];
    for (let i = 1; i <= 75; i++) {
      if (!drawnBalls.includes(i)) unextracted.push(i);
    }

    const randomBall = unextracted[Math.floor(Math.random() * unextracted.length)];
    const updated = [...drawnBalls, randomBall];
    setDrawnBalls(updated);
    setCurrentBall(randomBall);
    audioEngine.playBallDrawn(randomBall);
  };

  // Reset Tombola
  const handleResetTombola = () => {
    setDrawnBalls([]);
    setCurrentBall(null);
    setAutoMode(false);
    // Unmark cards
    setAllCards((prev) =>
      prev.map((c) => ({
        ...c,
        numeros: c.numeros.map((row) =>
          row.map((cell) => ({
            ...cell,
            marcado: cell.num === "FREE",
          }))
        ),
      }))
    );
  };

  // Toggle cell marking on active carton
  const handleToggleCell = (row: number, col: number) => {
    setAllCards((prevCards) =>
      prevCards.map((card) => {
        if (card.id !== activeCartonId) return card;
        const cell = card.numeros[row][col];
        if (cell.num === "FREE") return card;

        // Verify if cell number has been drawn
        if (!drawnBalls.includes(cell.num as number)) {
          alert(`El número ${cell.num} aún no ha salido en la tómbola.`);
          return card;
        }

        const newNumeros = card.numeros.map((r, rIdx) =>
          r.map((c, cIdx) => {
            if (rIdx === row && cIdx === col) {
              return { ...c, marcado: !c.marcado };
            }
            return c;
          })
        );

        return { ...card, numeros: newNumeros };
      })
    );
  };

  // Auto-daub active carton
  const handleAutoDaub = () => {
    setAllCards((prevCards) =>
      prevCards.map((card) => {
        if (card.id !== activeCartonId) return card;
        const newNumeros = card.numeros.map((row) =>
          row.map((cell) => {
            if (cell.num === "FREE") return cell;
            if (drawnBalls.includes(cell.num as number)) {
              return { ...cell, marcado: true };
            }
            return cell;
          })
        );
        return { ...card, numeros: newNumeros };
      })
    );
  };

  // Check Bingo validation
  const handleCheckBingo = () => {
    const currentCard = allCards.find((c) => c.id === activeCartonId);
    if (!currentCard) return;

    const result = evaluateCardFigure(currentCard, drawnBalls);
    if (result.isWinner) {
      // Fire celebration confetti and play victory fanfare
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
      audioEngine.playBingoWin();

      // Award prize to player
      if (currentUser && currentUser.role === "PLAYER") {
        const prize = 500.0;
        setCurrentUser((prev) =>
          prev
            ? {
                ...prev,
                balance: (prev.balance ?? 0) + prize,
                stats: { ...prev.stats, victorias: prev.stats.victorias + 1 },
              }
            : null
        );

        const txId = `TRX-WIN-${Math.floor(100000 + Math.random() * 900000)}`;
        setHistory((prev) => [
          {
            id: `win-${Date.now()}`,
            transactionId: txId,
            tipo: "BINGO",
            detalles: `¡BINGO GANADOR! con figura "${result.patternName}" en Cartón #${activeCartonId} (+500 VES)`,
            fecha: new Date().toLocaleString(),
          },
          ...prev,
        ]);
      }

      alert(
        `🎉 ¡¡¡BINGO GANADOR!!! 🎄🏆\n\n¡Felicitaciones! Has completado la figura oficial "${result.patternName}" con el Cartón #${activeCartonId}.\n¡Se te han acreditado 500.00 VES a tu saldo!`
      );
    } else {
      alert(
        `Aún no completas una figura ganadora con el Cartón #${activeCartonId}.\nTienes ${result.matchedCells} aciertos. Revisa las 8 figuras oficiales en la tabla.`
      );
    }
  };

  // Buy Carton (60 VES)
  const handleBuyCarton = (cartonId: number) => {
    if (!currentUser || currentUser.role !== "PLAYER") return;
    const currentBalance = currentUser.balance ?? 0;

    if (currentBalance < 60) {
      alert(
        "Saldo insuficiente (60.00 VES). Tu saldo actual es de 0.00 VES. Haz clic en 'Recargar Pago Móvil' para recargar fondos con tu comprobante y referencia."
      );
      setIsRechargeOpen(true);
      return;
    }

    // Deduct 60 VES
    audioEngine.playCoin();
    setCurrentUser((prev) =>
      prev
        ? {
            ...prev,
            balance: (prev.balance ?? 0) - 60.0,
            stats: { ...prev.stats, cartones: prev.stats.cartones + 1 },
          }
        : null
    );

    if (!purchasedCardIds.includes(cartonId)) {
      setPurchasedCardIds((prev) => [...prev, cartonId]);
    }

    const txId = `TRX-COM-${Math.floor(100000 + Math.random() * 900000)}`;
    setHistory((prev) => [
      {
        id: `buy-${Date.now()}`,
        transactionId: txId,
        tipo: "COMPRA",
        detalles: `Compra de Cartón #${cartonId} (-60.00 VES)`,
        fecha: new Date().toLocaleString(),
      },
      ...prev,
    ]);

    alert(`¡Cartón #${cartonId} adquirido con éxito por 60.00 VES! (Transacción: ${txId})`);
  };

  // Handle Recharge Submit by Player
  const handleRechargeSubmit = (data: {
    transactionId: string;
    monto: number;
    ref: string;
    bank: string;
    voucherImage?: string;
  }) => {
    if (!currentUser) return;
    const newReq: RechargeRequest = {
      id: `req-${Date.now()}`,
      transactionId: data.transactionId,
      email: currentUser.email,
      monto: data.monto,
      ref: data.ref,
      bank: data.bank,
      voucherImage: data.voucherImage,
      estado: "PENDIENTE",
      fecha: new Date().toLocaleString(),
    };

    setRechargeRequests((prev) => [newReq, ...prev]);

    setHistory((prev) => [
      {
        id: `rec-${Date.now()}`,
        transactionId: data.transactionId,
        tipo: "RECARGA",
        monto: data.monto,
        estado: "PENDIENTE",
        requestId: newReq.id,
        detalles: `Recarga solicitada por ${data.monto.toFixed(2)} VES (Ref: ${data.ref}, ${data.bank})`,
        fecha: new Date().toLocaleString(),
      },
      ...prev,
    ]);

    alert(
      `Tu solicitud de recarga por Pago Móvil con ID ${data.transactionId} ha sido enviada al administrador.\nUna vez aprobada se acreditará tu saldo.`
    );
  };

  // Handle Withdrawal Submit by Player
  const handleWithdrawSubmit = (data: {
    transactionId: string;
    monto: number;
    datos: string;
  }) => {
    if (!currentUser || currentUser.role !== "PLAYER") return;
    
    // Create withdrawal request in withdrawRequests state
    const newWithReq: WithdrawRequest = {
      id: `with-${Date.now()}`,
      transactionId: data.transactionId,
      email: currentUser.email,
      monto: data.monto,
      datos: data.datos,
      bank: "Pago Móvil",
      estado: "PENDIENTE",
      fecha: new Date().toLocaleString(),
    };
    setWithdrawRequests((prev) => [newWithReq, ...prev]);

    setCurrentUser((prev) =>
      prev
        ? {
            ...prev,
            balance: (prev.balance ?? 0) - data.monto,
          }
        : null
    );

    setHistory((prev) => [
      {
        id: `with-hist-${Date.now()}`,
        transactionId: data.transactionId,
        tipo: "RETIRO",
        monto: data.monto,
        estado: "PENDIENTE",
        requestId: newWithReq.id,
        detalles: `Solicitud de Retiro por ${data.monto.toFixed(2)} VES hacia Pago Móvil (${data.datos})`,
        fecha: new Date().toLocaleString(),
      },
      ...prev,
    ]);

    alert(`Se ha registrado tu solicitud de retiro con ID ${data.transactionId} por ${data.monto.toFixed(2)} VES exitosamente. Está en espera de aprobación por el Administrador.`);
  };

  // Admin approves recharge
  const handleApproveRecharge = (reqId: string) => {
    const req = rechargeRequests.find((r) => r.id === reqId);
    if (!req) return;

    setRechargeRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, estado: "APROBADO" } : r))
    );

    // Update history record as well
    setHistory((prev) =>
      prev.map((h) =>
        (h.requestId === reqId || (req.transactionId && h.transactionId === req.transactionId))
          ? { ...h, estado: "APROBADO" }
          : h
      )
    );

    // If the approved request belongs to the currently logged in user, credit it immediately
    if (currentUser && currentUser.email.toLowerCase() === req.email.toLowerCase()) {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              balance: (prev.balance ?? 0) + req.monto,
            }
          : null
      );
    } else {
      // Store in balance cache for that user
      try {
        const prevBal = parseFloat(localStorage.getItem(`chamo_balance_${req.email}`) || "0");
        localStorage.setItem(`chamo_balance_${req.email}`, String(prevBal + req.monto));
      } catch {}
    }

    alert(`Solicitud ${req.transactionId ? `[${req.transactionId}] ` : ""}de ${req.monto} VES aprobada exitosamente. Se ha actualizado a PAGADO/APROBADO en el historial.`);
  };

  // Admin rejects recharge
  const handleRejectRecharge = (reqId: string, reason?: string) => {
    const req = rechargeRequests.find((r) => r.id === reqId);
    const rejectionNote = reason || "Datos de transferencia o referencia inválidos";

    setRechargeRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, estado: "RECHAZADO", notes: rejectionNote } : r))
    );

    // Update history record as well
    setHistory((prev) =>
      prev.map((h) =>
        (h.requestId === reqId || (req?.transactionId && h.transactionId === req.transactionId))
          ? { ...h, estado: "RECHAZADO" }
          : h
      )
    );

    alert("Solicitud rechazada. Se reflejará como RECHAZADO en el historial del usuario.");
  };

  // Admin approves withdrawal
  const handleApproveWithdraw = (withReqId: string) => {
    const req = withdrawRequests.find((r) => r.id === withReqId);
    if (!req) return;

    setWithdrawRequests((prev) =>
      prev.map((r) => (r.id === withReqId ? { ...r, estado: "APROBADO" } : r))
    );

    // Update history record as well
    setHistory((prev) =>
      prev.map((h) =>
        (h.requestId === withReqId || (req.transactionId && h.transactionId === req.transactionId))
          ? { ...h, estado: "APROBADO" }
          : h
      )
    );

    alert(`Retiro [${req.transactionId}] de ${req.monto} VES marcado como PAGADO/APROBADO.`);
  };

  // Admin rejects withdrawal
  const handleRejectWithdraw = (withReqId: string, reason?: string) => {
    const req = withdrawRequests.find((r) => r.id === withReqId);
    if (!req) return;

    const rejectionNote = reason || "Datos de Pago Móvil o cuenta incorrectos";

    setWithdrawRequests((prev) =>
      prev.map((r) => (r.id === withReqId ? { ...r, estado: "RECHAZADO", notes: rejectionNote } : r))
    );

    // Refund player balance if rejected
    if (currentUser && currentUser.email.toLowerCase() === req.email.toLowerCase()) {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              balance: (prev.balance ?? 0) + req.monto,
            }
          : null
      );
    } else {
      try {
        const prevBal = parseFloat(localStorage.getItem(`chamo_balance_${req.email}`) || "0");
        localStorage.setItem(`chamo_balance_${req.email}`, String(prevBal + req.monto));
      } catch {}
    }

    // Update history record
    setHistory((prev) =>
      prev.map((h) =>
        (h.requestId === withReqId || (req.transactionId && h.transactionId === req.transactionId))
          ? { ...h, estado: "RECHAZADO" }
          : h
      )
    );

    alert(`Retiro de ${req.monto} VES rechazado. El saldo ha sido reintegrado al usuario y marcado como RECHAZADO en su historial.`);
  };

  // Real Friends Management (CERO BOTS)
  const handleAddFriend = (email: string) => {
    const clean = email.toLowerCase().trim();
    if (!clean) return;
    if (!friendEmails.includes(clean)) {
      setFriendEmails((prev) => [...prev, clean]);
    }
    if (!realPlayers.some((p) => p.email.toLowerCase() === clean)) {
      const baseName = clean.split("@")[0].replace(/[._]/g, " ");
      const formattedName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
      const newPlayer: OnlinePlayer = {
        id: `friend-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: formattedName,
        email: clean,
        avatar: "👤",
        isOnline: true,
        cartonesCount: 1,
        status: "En Sala de Amigos",
        isFriend: true,
      };
      setRealPlayers((prev) => [...prev, newPlayer]);
    }
  };

  const handleRemoveFriend = (email: string) => {
    const clean = email.toLowerCase().trim();
    setFriendEmails((prev) => prev.filter((e) => e !== clean));
    setRealPlayers((prev) => prev.filter((p) => p.email.toLowerCase() !== clean));
  };

  // Character (Muñeco) Selection and Wardrobe Handlers
  const handleSelectCharacter = (charId: string) => {
    setCurrentUser((prev) => {
      if (!prev) return null;
      const updated: UserProfile = {
        ...prev,
        selectedCharacterId: charId,
      };
      try {
        localStorage.setItem(`chamo_profile_${prev.email}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleBuyCharacter = (char: CharacterModel) => {
    if (!currentUser) return;
    const balance = currentUser.balance ?? 0;
    if (balance < char.price) {
      alert(
        `Saldo insuficiente (${char.price.toFixed(
          2
        )} VES requeridos). Tu saldo actual es de ${balance.toFixed(
          2
        )} VES. Por favor realiza una recarga vía Pago Móvil.`
      );
      setIsRechargeOpen(true);
      return;
    }

    const txId = `TRX-MUÑ-${Math.floor(100000 + Math.random() * 900000)}`;
    const currentUnlocked = currentUser.unlockedCharacterIds || ["chamo-urbano", "chama-glam"];
    const newUnlocked = Array.from(new Set([...currentUnlocked, char.id]));

    setCurrentUser((prev) => {
      if (!prev) return null;
      const updated: UserProfile = {
        ...prev,
        balance: (prev.balance ?? 0) - char.price,
        selectedCharacterId: char.id,
        unlockedCharacterIds: newUnlocked,
      };
      try {
        localStorage.setItem(`chamo_profile_${prev.email}`, JSON.stringify(updated));
        localStorage.setItem(`chamo_balance_${prev.email}`, String(updated.balance ?? 0));
      } catch {}
      return updated;
    });

    setHistory((prev) => [
      {
        id: `char-${Date.now()}`,
        transactionId: txId,
        tipo: "COMPRA",
        detalles: `Compra de Muñeco "${char.name}" (-${char.price.toFixed(2)} VES)`,
        fecha: new Date().toLocaleString(),
      },
      ...prev,
    ]);

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    audioEngine.playCoin();
    alert(`¡Has adquirido el muñeco "${char.name}" con éxito por ${char.price.toFixed(2)} VES! (Transacción: ${txId})`);
  };

  const handleUnlockByWins = (char: CharacterModel) => {
    if (!currentUser) return;
    const wins = currentUser.stats?.victorias ?? currentUser.stats?.bingos ?? 0;
    if (char.requiredWins && wins >= char.requiredWins) {
      const currentUnlocked = currentUser.unlockedCharacterIds || ["chamo-urbano", "chama-glam"];
      const newUnlocked = Array.from(new Set([...currentUnlocked, char.id]));
      setCurrentUser((prev) => {
        if (!prev) return null;
        const updated: UserProfile = {
          ...prev,
          selectedCharacterId: char.id,
          unlockedCharacterIds: newUnlocked,
        };
        try {
          localStorage.setItem(`chamo_profile_${prev.email}`, JSON.stringify(updated));
        } catch {}
        return updated;
      });
      confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
      alert(`¡Recompensa desbloqueada! Ahora puedes vestir a "${char.name}" en tu lobby.`);
    }
  };

  // Active carton lookup
  const activeCarton = allCards.find((c) => c.id === activeCartonId) || allCards[0];

  return (
    <div className="relative min-h-screen bg-slate-950">
      {/* Festive Falling Snow */}
      <Snowfall />

      {/* Main Views */}
      {!currentUser ? (
        <AuthScreen onLoginSuccess={(user) => setCurrentUser(user)} />
      ) : currentUser.role === "ADMIN" ? (
        /* Administrator Lobby - very different from player, no balance, no reload/withdraw */
        <AdminLobby
          user={currentUser}
          drawnBalls={drawnBalls}
          currentBall={currentBall}
          totalBalls={75}
          allCards={allCards}
          rechargeRequests={rechargeRequests}
          roomCountdown={formatCountdown(roomSeconds)}
          autoMode={autoMode}
          onDrawNextBall={handleDrawNextBall}
          onResetTombola={handleResetTombola}
          onToggleAutoMode={() => setAutoMode(!autoMode)}
          onApproveRecharge={handleApproveRecharge}
          onRejectRecharge={handleRejectRecharge}
          onLogout={() => setCurrentUser(null)}
        />
      ) : (
        /* Player Lobby */
        <>
          <PlayerLobby
            user={currentUser}
            activeCarton={activeCarton}
            purchasedCardIds={purchasedCardIds}
            drawnBalls={drawnBalls}
            history={history}
            allCards={allCards}
            roomCountdown={formatCountdown(roomSeconds)}
            onlinePlayers={realPlayers}
            friendEmails={friendEmails}
            rechargeRequests={rechargeRequests}
            withdrawRequests={withdrawRequests}
            onToggleCell={handleToggleCell}
            onAutoDaub={handleAutoDaub}
            onCheckBingo={handleCheckBingo}
            onBuyCarton={handleBuyCarton}
            onSelectCartonId={(id) => setActiveCartonId(id)}
            onOpenRecharge={() => setIsRechargeOpen(true)}
            onOpenWithdraw={() => setIsWithdrawOpen(true)}
            onOpenMyCartons={() => setIsMyCartonsOpen(true)}
            onOpenMusic={() => setIsMusicOpen(true)}
            onOpenStats={() => setIsStatsOpen(true)}
            onOpenHelp={() => setIsHelpOpen(true)}
            onLogout={() => setCurrentUser(null)}
            onAddFriend={handleAddFriend}
            onRemoveFriend={handleRemoveFriend}
            onSelectCharacter={handleSelectCharacter}
            onBuyCharacter={handleBuyCharacter}
            onUnlockByWins={handleUnlockByWins}
          />

          {/* Unobtrusive Floating Sphere Widget in the corner for the player */}
          <FloatingSphereWidget
            currentBall={currentBall}
            drawnBalls={drawnBalls}
            totalBalls={75}
            isAdmin={false}
          />
        </>
      )}

      {/* Floating sphere widget also available for Admin in the corner */}
      {currentUser && currentUser.role === "ADMIN" && (
        <FloatingSphereWidget
          currentBall={currentBall}
          drawnBalls={drawnBalls}
          totalBalls={75}
          isAdmin={true}
          onDrawNext={handleDrawNextBall}
        />
      )}

      {/* Global Modals for Players */}
      {currentUser && (
        <>
          <RechargeModal
            isOpen={isRechargeOpen}
            onClose={() => setIsRechargeOpen(false)}
            onSubmit={handleRechargeSubmit}
          />

          <WithdrawModal
            isOpen={isWithdrawOpen}
            userBalance={currentUser.balance ?? 0}
            onClose={() => setIsWithdrawOpen(false)}
            onSubmit={handleWithdrawSubmit}
          />

          <MyCartonsModal
            isOpen={isMyCartonsOpen}
            onClose={() => setIsMyCartonsOpen(false)}
            purchasedCardIds={purchasedCardIds}
            allCards={allCards}
            drawnBalls={drawnBalls}
            history={history}
            onSelectCarton={(id) => setActiveCartonId(id)}
          />

          <MusicPlayerModal isOpen={isMusicOpen} onClose={() => setIsMusicOpen(false)} />

          <StatsModal
            isOpen={isStatsOpen}
            onClose={() => setIsStatsOpen(false)}
            user={currentUser}
            drawnBallsCount={drawnBalls.length}
          />

          <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
        </>
      )}
    </div>
  );
}
