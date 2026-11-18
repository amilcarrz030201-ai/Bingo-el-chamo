import React, { useState, useMemo, useEffect } from "react";
import { RegisteredUser } from "../types";
import {
  Ban,
  ShieldAlert,
  Search,
  CheckCircle2,
  Clock,
  Radio,
  X,
  RefreshCw,
  Wallet,
  Phone,
  AlertTriangle,
  Check,
  UserX,
  UserCheck,
  ShieldCheck,
  Zap,
  Crown,
  MapPin,
  Sparkles,
} from "lucide-react";
import { getMergedCommunityUsers, isBotAccount } from "../data/communityUsers";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  registeredUsers: RegisteredUser[];
  onRefresh?: () => void;
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
    return `Desconectado hace ${diffMinutes} min`;
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

const PRESET_BAN_REASONS = [
  "Aprovechar errores del juego / Bug abuse",
  "Uso de trampas, scripts o bots no autorizados",
  "Conducta antideportiva o alteración de partidas",
  "Falta de respeto reiterada en el chat de la sala",
  "Suspensión preventiva por seguridad de sala",
];

export const AdminBanManagerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  registeredUsers,
  onRefresh,
  onToggleBanUser,
}) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "ONLINE" | "REGISTERED" | "BANNED">("ALL");
  const [now, setNow] = useState<number>(Date.now());
  const [serverPresenceMap, setServerPresenceMap] = useState<
    Record<string, { lastActiveAt: number; isOnline: boolean }>
  >({});
  const [banningUser, setBanningUser] = useState<RegisteredUser | null>(null);
  const [selectedPresetReason, setSelectedPresetReason] = useState<string>(PRESET_BAN_REASONS[0]);
  const [customBanReason, setCustomBanReason] = useState<string>("");

  // Refresh clock every 8 seconds
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 8000);
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
      const interval = setInterval(fetchPresence, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  // Load all accounts from state and localStorage, combining them cleanly
  const allAccounts = useMemo(() => {
    const map = new Map<string, RegisteredUser>();

    // 1. Load community base users
    getMergedCommunityUsers().forEach((p) => {
      map.set(p.email.toLowerCase().trim(), p);
    });

    // 2. Read from localStorage chamo_registered_users_v2
    try {
      const saved = localStorage.getItem("chamo_registered_users_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach((u) => {
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
      }
    } catch {}

    // 3. Add users from prop registeredUsers
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

    // 4. Check specific ban storage keys to ensure 100% synchronized ban flags
    const result: RegisteredUser[] = [];
    map.forEach((player) => {
      const cleanEmail = player.email.toLowerCase().trim();

      // Skip ONLY the administrator and mock bots
      if (
        cleanEmail === "admin@bingoelchamo.com" ||
        (player as any).role === "ADMIN" ||
        isBotAccount(cleanEmail, player.id)
      ) {
        return;
      }

      // Check if ban is recorded in localStorage
      let isBanned = player.isBanned ?? false;
      let bannedReason = player.bannedReason;
      let bannedAt = player.bannedAt;

      try {
        const banData = localStorage.getItem(`chamo_banned_${cleanEmail}`);
        if (banData) {
          const parsed = JSON.parse(banData);
          isBanned = true;
          bannedReason = parsed.bannedReason || bannedReason;
          bannedAt = parsed.bannedAt || bannedAt;
        }
      } catch {}

      // Presence
      const presence = serverPresenceMap[cleanEmail];
      const lastActive =
        presence?.lastActiveAt ||
        (typeof player.lastActiveAt === "number" ? player.lastActiveAt : 0) ||
        (player.isOnline ? now - 40000 : now - 600000);

      const isOnline = presence ? presence.isOnline : lastActive > 0 && now - lastActive < 150000;

      result.push({
        ...player,
        isBanned,
        bannedReason,
        bannedAt,
        isOnline,
        lastActiveAt: lastActive,
      });
    });

    return result;
  }, [registeredUsers, serverPresenceMap, now, isOpen]);

  // Statistics
  const totalAccounts = allAccounts.length;
  const totalBanned = useMemo(() => allAccounts.filter((p) => p.isBanned).length, [allAccounts]);
  const totalOnline = useMemo(() => allAccounts.filter((p) => p.isOnline && !p.isBanned).length, [allAccounts]);
  const totalActive = useMemo(() => allAccounts.filter((p) => !p.isBanned).length, [allAccounts]);

  // Filter and search
  const filteredPlayers = useMemo(() => {
    const q = search.toLowerCase().trim();

    return allAccounts
      .filter((p) => {
        if (filter === "ONLINE" && (!p.isOnline || p.isBanned)) return false;
        if (filter === "BANNED" && !p.isBanned) return false;
        if (filter === "REGISTERED" && p.isBanned) return false;

        if (!q) return true;

        const matchName = p.name?.toLowerCase().includes(q);
        const matchEmail = p.email?.toLowerCase().includes(q);
        const matchPhone = p.pagoMovilPhone?.toLowerCase().includes(q);
        const matchBank = p.pagoMovilBank?.toLowerCase().includes(q);
        const matchId = p.pagoMovilId?.toLowerCase().includes(q);
        const matchStatus = p.isBanned ? "baneado" : p.isOnline ? "activo online en linea" : "desconectado";

        return matchName || matchEmail || matchPhone || matchBank || matchId || matchStatus.includes(q);
      })
      .sort((a, b) => {
        if (filter === "BANNED") {
          return (b.bannedAt ? 1 : 0) - (a.bannedAt ? 1 : 0);
        }
        // Online players first, then active, then banned
        if (a.isBanned !== b.isBanned) return a.isBanned ? 1 : -1;
        if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1;
        return (Number(b.lastActiveAt) || 0) - (Number(a.lastActiveAt) || 0);
      });
  }, [allAccounts, filter, search]);

  if (!isOpen) return null;

  const handleConfirmBan = () => {
    if (!banningUser || !onToggleBanUser) return;
    const finalReason = customBanReason.trim() || selectedPresetReason;
    onToggleBanUser(banningUser.email, true, finalReason);
    setBanningUser(null);
    setCustomBanReason("");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-1 sm:p-2 md:p-3 bg-black/95 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-7xl h-full sm:h-[98vh] max-h-screen sm:max-h-[98vh] bg-slate-950 border-2 border-red-500/90 rounded-none sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 ring-2 ring-red-500/30">
        {/* Glow ambient background lights */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header - Compact with CSS */}
        <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 border-b border-red-500/40 flex items-center justify-between gap-2.5 relative z-10 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 border border-red-300 flex items-center justify-center text-white shadow-md shadow-red-950/80 shrink-0">
              <Ban size={18} className="animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-fredoka text-sm sm:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-red-300 via-rose-200 to-yellow-300 truncate">
                  Panel de Baneo de Jugadores y Cuentas Activas
                </h3>
                <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold uppercase font-mono shadow border border-red-400">
                  🛡️ Anti-Trampas
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 font-medium truncate hidden sm:block">
                Visualiza jugadores activos, saldo y suspende cuentas al instante si aprovechan fallas o trampas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                title="Actualizar datos y presencia"
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-yellow-300 rounded-lg transition cursor-pointer border border-slate-700 active:scale-95"
              >
                <RefreshCw size={15} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              title="Cerrar ventana"
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition cursor-pointer border border-slate-700 active:scale-95"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Compact Account Filter Bar & Search Toolbar with CSS */}
        <div className="px-3 sm:px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 relative z-10 shrink-0">
          {/* Quick Filter Tabs with Live Counters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setFilter("ALL")}
              className={`px-2.5 py-1 rounded-xl text-xs font-fredoka font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                filter === "ALL"
                  ? "bg-amber-500/25 border-yellow-400 text-yellow-300 shadow ring-1 ring-yellow-400/40"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>Todas</span>
              <span className="font-mono text-yellow-300 font-black bg-slate-900/90 px-1.5 py-0.2 rounded-md text-[11px] border border-slate-700">
                {totalAccounts}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilter("ONLINE")}
              className={`px-2.5 py-1 rounded-xl text-xs font-fredoka font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                filter === "ONLINE"
                  ? "bg-emerald-600/25 border-emerald-400 text-emerald-300 shadow ring-1 ring-emerald-400/40"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-emerald-300"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>En Línea</span>
              <span className="font-mono text-emerald-400 font-black bg-slate-900/90 px-1.5 py-0.2 rounded-md text-[11px] border border-slate-700">
                {totalOnline}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilter("REGISTERED")}
              className={`px-2.5 py-1 rounded-xl text-xs font-fredoka font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                filter === "REGISTERED"
                  ? "bg-blue-600/25 border-cyan-400 text-cyan-300 shadow ring-1 ring-cyan-400/40"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-cyan-300"
              }`}
            >
              <span>Sin Sanción</span>
              <span className="font-mono text-cyan-300 font-black bg-slate-900/90 px-1.5 py-0.2 rounded-md text-[11px] border border-slate-700">
                {totalActive}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilter("BANNED")}
              className={`px-2.5 py-1 rounded-xl text-xs font-fredoka font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                filter === "BANNED"
                  ? "bg-red-600/30 border-red-500 text-red-300 shadow ring-1 ring-red-500/50"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-red-400"
              }`}
            >
              <Ban size={11} className="text-red-400" />
              <span>Baneadas</span>
              <span className="font-mono text-red-400 font-black bg-slate-900/90 px-1.5 py-0.2 rounded-md text-[11px] border border-slate-700">
                {totalBanned}
              </span>
            </button>
          </div>

          {/* Search Bar - Compact with CSS */}
          <div className="flex items-center gap-2 flex-1 md:max-w-md">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, correo, teléfono o cédula..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-8 py-1.5 text-xs text-yellow-300 placeholder:text-slate-500 font-mono outline-none focus:border-red-400 transition"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <span className="text-[11px] text-slate-400 hidden xl:inline font-mono shrink-0">
              {filteredPlayers.length} cuentas
            </span>
          </div>
        </div>

        {/* Players List - High Space & Visibility */}
        <div className="p-2 sm:p-3 overflow-y-auto flex-1 flex flex-col gap-2 relative z-10">
          {filteredPlayers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2.5">
              <ShieldCheck size={40} className="text-slate-600" />
              <p className="font-fredoka text-sm text-slate-300">
                No se encontraron cuentas con el filtro o búsqueda actual.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setFilter("ALL");
                }}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-yellow-400 px-3.5 py-1.5 rounded-xl transition cursor-pointer border border-slate-700"
              >
                Restablecer y Mostrar Todos
              </button>
            </div>
          ) : (
            filteredPlayers.map((player) => {
              const disconnectedText = getDisconnectedText(Number(player.lastActiveAt) || 0, now);

              return (
                <div
                  key={player.email}
                  className={`border rounded-xl p-2.5 sm:p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 transition shadow-sm ${
                    player.isBanned
                      ? "bg-red-950/40 border-red-500 ring-1 ring-red-500/40"
                      : player.isOnline
                      ? "bg-slate-950/90 border-emerald-500/60 hover:border-emerald-400"
                      : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {/* Left: User Identity Details - Ultra-Compact with CSS */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Compact Avatar */}
                    <div className="relative shrink-0">
                      <div
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg p-0.5 border flex items-center justify-center overflow-hidden shadow-sm ${
                          player.isBanned
                            ? "border-red-500 bg-red-950"
                            : player.isOnline
                            ? "border-emerald-400 bg-gradient-to-tr from-emerald-500 to-teal-400"
                            : "border-slate-700 bg-slate-900"
                        }`}
                      >
                        {player.avatar ? (
                          player.avatar.startsWith("data:") || player.avatar.startsWith("http") ? (
                            <img
                              src={player.avatar}
                              alt={player.name}
                              className="w-full h-full object-cover rounded-[6px]"
                            />
                          ) : (
                            <span className="text-base sm:text-lg">{player.avatar}</span>
                          )
                        ) : (
                          <span className="font-fredoka font-black text-xs sm:text-sm text-yellow-300">
                            {player.name ? player.name[0]?.toUpperCase() : "U"}
                          </span>
                        )}
                      </div>

                      {/* Online dot indicator */}
                      {!player.isBanned && player.isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-950 shadow" />
                      )}
                    </div>

                    {/* Name, Email, PM & Status in compact inline layout */}
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-fredoka text-xs sm:text-sm font-bold text-white truncate max-w-[150px] sm:max-w-[220px]" title={player.name}>
                          {player.name || player.email.split("@")[0]}
                        </span>

                        <span className="text-[10px] sm:text-[11px] text-yellow-300/90 font-mono truncate max-w-[160px] sm:max-w-[200px]" title={player.email}>
                          {player.email}
                        </span>

                        {/* Status Badges */}
                        {player.isBanned ? (
                          <span className="text-[8px] sm:text-[9px] bg-red-600 text-white font-black px-1.5 py-0.2 rounded-full flex items-center gap-0.5 font-mono animate-pulse shadow border border-red-300">
                            <Ban size={8} /> BANEADO
                          </span>
                        ) : player.isOnline ? (
                          <span className="text-[8px] sm:text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-400/80 font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5 font-mono">
                            <span className="w-1 h-1 rounded-full bg-emerald-400" />
                            En Línea
                          </span>
                        ) : (
                          <span className="text-[8px] sm:text-[9px] bg-slate-900 text-slate-400 border border-slate-800 px-1.5 py-0.2 rounded-full font-mono flex items-center gap-0.5">
                            <Clock size={8} className="text-amber-400" />
                            {disconnectedText}
                          </span>
                        )}
                      </div>

                      {/* Compact Meta Row: Pago Móvil & Ban Reason */}
                      <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono">
                        <span className="text-yellow-300 font-semibold bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.2 rounded">
                          📱 {player.pagoMovilPhone || "Sin PM"}
                        </span>
                        {player.pagoMovilBank && (
                          <span className="text-slate-300 bg-slate-900/90 border border-slate-800 px-1.5 py-0.2 rounded truncate max-w-[140px]">
                            🏦 {player.pagoMovilBank.split("(")[0].trim()}
                          </span>
                        )}
                        {player.pagoMovilId && (
                          <span className="text-slate-400 bg-slate-900/90 border border-slate-800 px-1.5 py-0.2 rounded">
                            🪪 {player.pagoMovilId}
                          </span>
                        )}
                        {player.isBanned && player.bannedReason && (
                          <span className="text-red-300 bg-red-950/70 border border-red-800/80 px-1.5 py-0.2 rounded truncate max-w-[200px]" title={player.bannedReason}>
                            ⚠️ {player.bannedReason}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Saldo & Ban Button - Ultra-Compact with CSS */}
                  <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 w-full sm:w-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                    <div className="flex sm:flex-col items-center sm:items-end gap-1 sm:gap-0">
                      <span className="text-[8px] uppercase font-bold text-slate-400 flex items-center gap-0.5">
                        <Wallet size={9} className="text-emerald-400" /> Saldo:
                      </span>
                      <span className="font-fredoka text-xs sm:text-sm font-black text-amber-300 font-mono">
                        {Number(player.balance || 0).toFixed(2)} VES
                      </span>
                    </div>

                    {/* Ban / Unban Button */}
                    {onToggleBanUser && (
                      <div className="shrink-0">
                        {player.isBanned ? (
                          <button
                            type="button"
                            onClick={() => onToggleBanUser(player.email, false)}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-fredoka font-bold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 shadow border border-emerald-300 transition cursor-pointer active:scale-95"
                            title={`Quitar el baneo a ${player.name}`}
                          >
                            <Check size={12} />
                            <span>Quitar Baneo</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setBanningUser(player);
                              setSelectedPresetReason(PRESET_BAN_REASONS[0]);
                              setCustomBanReason("");
                            }}
                            className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-fredoka font-black text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-red-400 transition cursor-pointer active:scale-95 group"
                            title={`Banear a ${player.name} si hace trampas o aprovecha errores`}
                          >
                            <Ban size={12} className="text-white group-hover:rotate-12 transition" />
                            <span>Banear</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300 relative z-10 flex-wrap gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>
              Mostrando <strong>{filteredPlayers.length}</strong> cuentas de jugadores
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white font-fredoka font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl border border-slate-700 transition cursor-pointer active:scale-95"
          >
            Cerrar Menú
          </button>
        </div>

        {/* Modal Confirmación de Baneo */}
        {banningUser && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-150">
            <div className="bg-gradient-to-b from-slate-900 to-red-950/95 border-2 border-red-500 rounded-3xl max-w-lg w-full p-5 sm:p-6 flex flex-col gap-4 shadow-2xl relative text-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-600/30 border-2 border-red-500 flex items-center justify-center text-red-300 shrink-0 shadow-lg shadow-red-950/80">
                  <ShieldAlert size={26} className="animate-pulse" />
                </div>
                <div>
                  <h4 className="font-fredoka text-lg font-bold text-red-400">
                    Confirmar Baneo de Cuenta
                  </h4>
                  <p className="text-xs text-slate-300 font-mono">
                    {banningUser.name} • {banningUser.email}
                  </p>
                </div>
              </div>

              <div className="bg-red-950/80 border border-red-700 rounded-2xl p-3.5 text-xs text-red-200 leading-relaxed flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 font-bold text-red-300">
                  <AlertTriangle size={15} />
                  <span>Sanción Inmediata:</span>
                </div>
                <p>
                  A este jugador <strong>se le bloqueará el acceso al instante</strong>. Su pantalla cambiará a <strong>"Tu Cuenta Ha Sido Baneada"</strong>, impidiéndole comprar cartones, marcar números o cobrar premios.
                </p>
              </div>

              {/* Preset Reasons */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Selecciona el Motivo de la Sanción:
                </label>
                <div className="flex flex-col gap-1">
                  {PRESET_BAN_REASONS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setSelectedPresetReason(preset)}
                      className={`text-left text-xs px-3 py-2 rounded-xl transition cursor-pointer border flex items-center justify-between ${
                        selectedPresetReason === preset
                          ? "bg-red-900/80 border-red-500 text-white font-bold"
                          : "bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <span>{preset}</span>
                      {selectedPresetReason === preset && <Check size={14} className="text-red-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Note */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 mb-1 block">
                  O escribe un motivo personalizado / notas internas:
                </label>
                <input
                  type="text"
                  value={customBanReason}
                  onChange={(e) => setCustomBanReason(e.target.value)}
                  placeholder="Ej: Se aprovechó de un error en los cartones..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-yellow-300 font-mono outline-none focus:border-red-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setBanningUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-fredoka font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBan}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-fredoka font-black bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg transition cursor-pointer flex items-center gap-2 active:scale-95 border border-red-400"
                >
                  <Ban size={16} />
                  <span>Confirmar Baneo Inmediato</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
