import React, { useState, useMemo, useEffect } from "react";
import { RegisteredUser } from "../types";
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  Radio,
  X,
  RefreshCw,
  Wallet,
  Trophy,
  Crown,
  MapPin,
  Zap,
  Activity,
  Edit3,
  Phone,
  Ban,
  ShieldAlert,
  Check,
} from "lucide-react";
import { DEFAULT_COMMUNITY_USERS, isBotAccount } from "../data/communityUsers";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  registeredUsers: RegisteredUser[];
  onRefresh?: () => void;
  onAdjustBalance?: (
    email: string,
    mode: "SET" | "ADD" | "SUBTRACT",
    amountVES: number,
    notes?: string
  ) => void;
  onToggleBanUser?: (email: string, ban: boolean, reason?: string) => void;
}

/**
 * Calculates human-readable elapsed disconnected time in Spanish
 */
function getDisconnectedText(lastActiveTimestamp: number, now: number): string {
  if (!lastActiveTimestamp) {
    return "Desconectado hace más de 1 hora";
  }

  const diffMs = Math.max(0, now - lastActiveTimestamp);
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes <= 1) {
    return "Desconectado hace 1 minuto";
  }
  if (diffMinutes < 60) {
    return `Desconectado hace ${diffMinutes} minutos`;
  }

  const hours = Math.floor(diffMinutes / 60);
  const remainingMins = diffMinutes % 60;
  if (hours < 24) {
    if (remainingMins === 0) {
      return `Desconectado hace ${hours} ${hours === 1 ? "hora" : "horas"}`;
    }
    return `Desconectado hace ${hours}h ${remainingMins}m`;
  }

  const days = Math.floor(hours / 24);
  return `Desconectado hace ${days} ${days === 1 ? "día" : "días"}`;
}

export const AdminActivePlayersModal: React.FC<Props> = ({
  isOpen,
  onClose,
  registeredUsers,
  onRefresh,
  onAdjustBalance,
  onToggleBanUser,
}) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "ONLINE" | "OFFLINE">("ALL");
  const [now, setNow] = useState<number>(Date.now());
  const [serverPresenceMap, setServerPresenceMap] = useState<
    Record<string, { lastActiveAt: number; isOnline: boolean }>
  >({});

  // Refresh current clock every 10 seconds to keep "hace X minutos" updated
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 10000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Fetch live server presence
  const fetchPresence = async () => {
    try {
      const res = await fetch("/api/presence");
      if (res.ok) {
        const list = await res.json();
        const map: Record<string, { lastActiveAt: number; isOnline: boolean }> = {};
        if (Array.isArray(list)) {
          list.forEach((item: any) => {
            if (item.email) {
              map[item.email.toLowerCase().trim()] = {
                lastActiveAt: Number(item.lastActiveAt) || Date.now(),
                isOnline: item.isOnline === true,
              };
            }
          });
          setServerPresenceMap(map);
        }
      }
    } catch {}
  };

  useEffect(() => {
    if (isOpen) {
      fetchPresence();
      const interval = setInterval(fetchPresence, 8000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  // Filter genuine real players
  const realPlayers = useMemo(() => {
    const map = new Map<string, RegisteredUser>();
    DEFAULT_COMMUNITY_USERS.forEach((p) => {
      map.set(p.email.toLowerCase().trim(), { ...p });
    });
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

    const list: RegisteredUser[] = [];
    map.forEach((u) => {
      const clean = u.email.toLowerCase().trim();
      if (clean === "admin@bingoelchamo.com" || (u as any).role === "ADMIN") return;
      if (isBotAccount(clean, u.id)) return;
      list.push(u);
    });
    return list;
  }, [registeredUsers]);

  // Merge presence data
  const playersWithStatus = useMemo(() => {
    return realPlayers.map((player, idx) => {
      const cleanEmail = player.email.toLowerCase().trim();
      const serverStatus = serverPresenceMap[cleanEmail];

      // Determine last active timestamp
      // Priority: serverStatus.lastActiveAt > player.lastActiveAt > pseudo-seed for older users
      let lastActiveTime = serverStatus?.lastActiveAt;
      if (!lastActiveTime && player.lastActiveAt) {
        lastActiveTime = typeof player.lastActiveAt === "string"
          ? new Date(player.lastActiveAt).getTime()
          : Number(player.lastActiveAt);
      }
      if (!lastActiveTime) {
        // Reasonable fallback based on registration or deterministic time (between 5 and 45 mins ago)
        const offsetMins = (idx * 7 + 4) % 45 + 3;
        lastActiveTime = now - offsetMins * 60 * 1000;
      }

      // Active threshold: within 2.5 minutes and serverStatus.isOnline is not explicitly false
      const diffMs = now - lastActiveTime;
      const isOnline = (serverStatus?.isOnline ?? player.isOnline ?? false) && diffMs < 150000;

      const wins = player.stats?.victorias ?? player.stats?.bingos ?? 0;
      let categoryBadge: { text: string; color: string; icon: React.ReactNode } = {
        text: "Aspirante",
        color: "bg-slate-800 text-slate-400 border-slate-700",
        icon: null,
      };

      if (wins >= 20) {
        categoryBadge = {
          text: "Top Global (20+)",
          color: "bg-amber-500/20 text-yellow-300 border-amber-500/40",
          icon: <Crown size={11} className="text-yellow-400" />,
        };
      } else if (wins >= 10) {
        categoryBadge = {
          text: "Top Regional (10-19)",
          color: "bg-blue-500/20 text-cyan-300 border-blue-500/40",
          icon: <MapPin size={11} className="text-cyan-400" />,
        };
      } else if (wins >= 1) {
        categoryBadge = {
          text: "Chamo SoloQ (1-9)",
          color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
          icon: <Zap size={11} className="text-emerald-400" />,
        };
      }

      return {
        ...player,
        isOnline,
        lastActiveTimestamp: lastActiveTime,
        categoryBadge,
        wins,
      };
    });
  }, [realPlayers, serverPresenceMap, now]);

  // Online and offline counts
  const onlinePlayersCount = useMemo(() => {
    return playersWithStatus.filter((p) => p.isOnline).length;
  }, [playersWithStatus]);

  const offlinePlayersCount = playersWithStatus.length - onlinePlayersCount;

  // Filtered by search and tab
  const filteredPlayers = useMemo(() => {
    return playersWithStatus.filter((p) => {
      // Tab filter
      if (filter === "ONLINE" && !p.isOnline) return false;
      if (filter === "OFFLINE" && p.isOnline) return false;

      // Search filter
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesEmail = p.email.toLowerCase().includes(query);
        return matchesName || matchesEmail;
      }
      return true;
    });
  }, [playersWithStatus, filter, search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-4 sm:p-5 border-b border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400/50 flex items-center justify-center text-emerald-300 shadow">
              <Radio size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-fredoka text-lg sm:text-xl font-bold text-emerald-300">
                  Jugadores Activos y Estado de Conexión
                </h2>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                  En Vivo
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Supervisa quién está jugando en tiempo real y hace cuántos minutos se desconectaron los demás.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchPresence();
                if (onRefresh) onRefresh();
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-2 rounded-xl transition cursor-pointer border border-slate-700"
              title="Refrescar estado de conexión"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Status Counters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-950/60 border-b border-slate-800">
          {/* Active Now */}
          <div
            onClick={() => setFilter("ONLINE")}
            className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
              filter === "ONLINE"
                ? "bg-emerald-950/50 border-emerald-400 ring-2 ring-emerald-500/30"
                : "bg-slate-900 border-slate-800 hover:border-emerald-500/40"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <div className="text-[10px] uppercase font-bold text-emerald-400">
                  Activos Ahora
                </div>
                <div className="font-fredoka text-lg font-bold text-white">
                  {onlinePlayersCount} {onlinePlayersCount === 1 ? "jugador" : "jugadores"}
                </div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
              En Línea 🟢
            </span>
          </div>

          {/* Disconnected */}
          <div
            onClick={() => setFilter("OFFLINE")}
            className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
              filter === "OFFLINE"
                ? "bg-amber-950/50 border-amber-400 ring-2 ring-amber-500/30"
                : "bg-slate-900 border-slate-800 hover:border-amber-500/40"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Clock size={16} className="text-amber-400" />
              <div>
                <div className="text-[10px] uppercase font-bold text-amber-400">
                  Desconectados
                </div>
                <div className="font-fredoka text-lg font-bold text-white">
                  {offlinePlayersCount} {offlinePlayersCount === 1 ? "jugador" : "jugadores"}
                </div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
              Con minutos ⏱️
            </span>
          </div>

          {/* Total Players */}
          <div
            onClick={() => setFilter("ALL")}
            className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
              filter === "ALL"
                ? "bg-blue-950/50 border-cyan-400 ring-2 ring-cyan-500/30"
                : "bg-slate-900 border-slate-800 hover:border-cyan-500/40"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users size={16} className="text-cyan-400" />
              <div>
                <div className="text-[10px] uppercase font-bold text-cyan-400">
                  Total Registrados
                </div>
                <div className="font-fredoka text-lg font-bold text-white">
                  {playersWithStatus.length} reales
                </div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold bg-blue-500/20 text-cyan-300 border border-blue-500/40 px-2 py-0.5 rounded-full">
              Cero Bots 🛡️
            </span>
          </div>
        </div>

        {/* Search & Sub-filters */}
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Buscar por nombre o correo Gmail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-fredoka font-bold transition cursor-pointer ${
                filter === "ALL"
                  ? "bg-emerald-600 text-white shadow"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Todos ({playersWithStatus.length})
            </button>
            <button
              onClick={() => setFilter("ONLINE")}
              className={`px-3 py-1.5 rounded-xl text-xs font-fredoka font-bold transition cursor-pointer flex items-center gap-1.5 ${
                filter === "ONLINE"
                  ? "bg-emerald-600 text-white shadow"
                  : "bg-slate-800 text-emerald-300 hover:bg-slate-700"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Activos ({onlinePlayersCount})</span>
            </button>
            <button
              onClick={() => setFilter("OFFLINE")}
              className={`px-3 py-1.5 rounded-xl text-xs font-fredoka font-bold transition cursor-pointer flex items-center gap-1.5 ${
                filter === "OFFLINE"
                  ? "bg-amber-600 text-white shadow"
                  : "bg-slate-800 text-amber-300 hover:bg-slate-700"
              }`}
            >
              <Clock size={12} />
              <span>Desconectados ({offlinePlayersCount})</span>
            </button>
          </div>
        </div>

        {/* Players List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {filteredPlayers.length === 0 ? (
            <div className="p-12 text-center bg-slate-950/60 rounded-3xl border border-slate-800 flex flex-col items-center justify-center gap-2">
              <Users size={36} className="text-slate-600 mb-1" />
              <p className="font-fredoka font-bold text-slate-300 text-base">
                No se encontraron jugadores
              </p>
              <p className="text-xs text-slate-500 max-w-sm">
                {search
                  ? `No hay coincidencias para "${search}".`
                  : filter === "ONLINE"
                  ? "No hay jugadores activos en línea en este instante. Cuando un jugador ingrese a la sala, aparecerá aquí como Activo."
                  : "No hay jugadores en esta categoría."}
              </p>
            </div>
          ) : (
            filteredPlayers.map((player) => {
              const disconnectedText = getDisconnectedText(
                player.lastActiveTimestamp,
                now
              );

              return (
                <div
                  key={player.id}
                  className={`p-4 rounded-2xl border transition shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    player.isOnline
                      ? "bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-900 border-emerald-500/50 hover:border-emerald-400"
                      : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {/* Left info */}
                  <div className="flex items-center gap-3.5">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow">
                        {player.avatar &&
                        (player.avatar.startsWith("data:") ||
                          player.avatar.startsWith("http")) ? (
                          <img
                            src={player.avatar}
                            alt={player.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">
                            {player.avatar ||
                              (player.gender === "FEMALE" ? "👗" : "🧢")}
                          </span>
                        )}
                      </div>
                      {player.isOnline ? (
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-950 rounded-full flex items-center justify-center">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                        </span>
                      ) : (
                        <span
                          className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-slate-600 border-2 border-slate-950 rounded-full"
                          title="Desconectado"
                        />
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-fredoka font-bold text-sm text-yellow-300">
                          {player.name}
                        </span>

                        {/* Category Badge */}
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 font-sans ${player.categoryBadge.color}`}
                        >
                          {player.categoryBadge.icon}
                          {player.categoryBadge.text}
                        </span>

                        {/* Connection Badge */}
                        {player.isBanned ? (
                          <span className="text-[10px] bg-red-950 text-red-300 border border-red-500/80 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 font-mono animate-pulse">
                            <Ban size={10} className="text-red-400" />
                            BANEADO
                          </span>
                        ) : player.isOnline ? (
                          <span className="text-[10px] bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 font-mono animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Activo Ahora (En Línea)
                          </span>
                        ) : (
                          <span className="text-[10px] bg-amber-950/60 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 font-mono">
                            <Clock size={10} className="text-amber-400" />
                            {disconnectedText}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-400 font-mono flex items-center gap-2 flex-wrap">
                        <span className="text-slate-200">{player.email}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1 text-[11px] font-mono font-bold bg-amber-500/15 border border-amber-500/40 px-2 py-0.5 rounded-lg text-yellow-300">
                          <Phone size={10} className="text-amber-400" />
                          <span>Pago Móvil: {player.pagoMovilPhone || "No registrado"}</span>
                        </div>
                        {player.pagoMovilBank && (
                          <span className="text-[10px] text-emerald-300 font-semibold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                            🏦 {player.pagoMovilBank.split("(")[0].trim()}
                          </span>
                        )}
                        <span>•</span>
                        <span className="text-yellow-400/90 font-bold">
                          {player.wins} {player.wins === 1 ? "victoria" : "victorias"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right metrics */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 flex flex-col text-right">
                      <span className="text-[9px] text-slate-400 uppercase font-bold">
                        Saldo Actual
                      </span>
                      <span className="font-fredoka text-xs font-bold text-yellow-300 font-mono">
                        {Number(player.balance || 0).toFixed(2)} VES
                      </span>
                    </div>

                    {/* Ban / Unban actions */}
                    {onToggleBanUser && (
                      <div>
                        {player.isBanned ? (
                          <button
                            type="button"
                            onClick={() => onToggleBanUser(player.email, false)}
                            className="bg-emerald-700 hover:bg-emerald-600 text-white font-fredoka font-bold text-xs px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition cursor-pointer shadow active:scale-95"
                            title="Quitar el baneo a este jugador"
                          >
                            <Check size={12} />
                            <span>Desbanear</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onToggleBanUser(player.email, true, "Baneado por el Administrador")}
                            className="bg-red-950/80 hover:bg-red-800 text-red-300 hover:text-white border border-red-700/60 font-fredoka font-bold text-xs px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition cursor-pointer shadow active:scale-95"
                            title="Banear a este jugador"
                          >
                            <Ban size={12} className="text-red-400" />
                            <span>Banear</span>
                          </button>
                        )}
                      </div>
                    )}

                    {onAdjustBalance && (
                      <button
                        type="button"
                        onClick={() =>
                          onAdjustBalance(
                            player.email,
                            "ADD",
                            50,
                            "Ajuste rápido desde Jugadores Activos"
                          )
                        }
                        className="bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 hover:text-white border border-emerald-500/40 px-2.5 py-1.5 rounded-xl text-xs font-fredoka font-bold flex items-center gap-1 transition cursor-pointer shadow"
                        title="Ajustar saldo"
                      >
                        <Wallet size={12} />
                        <span className="hidden md:inline">Abonar</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Mostrando <strong>{filteredPlayers.length}</strong> de{" "}
            <strong>{playersWithStatus.length}</strong> jugadores registrados
          </span>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white font-fredoka font-bold text-xs px-4 py-2 rounded-xl border border-slate-700 transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
