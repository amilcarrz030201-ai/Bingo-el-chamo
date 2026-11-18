import React, { useState } from "react";
import { TopPlayer, RegisteredUser } from "../types";
import { isBotAccount } from "../data/communityUsers";
import {
  Trophy,
  Crown,
  Medal,
  Sparkles,
  MapPin,
  Zap,
  X,
  Flame,
  Calendar,
  DollarSign,
  Award,
  Users,
  ShieldCheck,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail?: string;
  registeredUsers?: RegisteredUser[];
  initialFilter?: "ALL" | "GLOBAL" | "REGIONAL" | "COMPETIDOR";
}

export const TopRankingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUserEmail,
  registeredUsers = [],
  initialFilter = "ALL",
}) => {
  const [filter, setFilter] = useState<"ALL" | "GLOBAL" | "REGIONAL" | "COMPETIDOR">(initialFilter);

  // Sync filter when modal opens or initialFilter changes
  React.useEffect(() => {
    if (isOpen && initialFilter) {
      setFilter(initialFilter);
    }
  }, [isOpen, initialFilter]);

  if (!isOpen) return null;

  // Real players rankings: strictly filter out bots and admin (Cero Bots)
  const realRegisteredUsers = registeredUsers.filter((u) => {
    if (!u || !u.email) return false;
    const cleanEmail = u.email.toLowerCase().trim();
    if (cleanEmail === "admin@bingoelchamo.com" || (u as any).role === "ADMIN") return false;
    if (isBotAccount(cleanEmail, u.id)) return false;
    return true;
  });

  // Ranked primarily by victorias (wins), then by balance
  const sortedUsers = [...realRegisteredUsers].sort((a, b) => {
    const winsA = a.stats?.victorias ?? a.stats?.bingos ?? 0;
    const winsB = b.stats?.victorias ?? b.stats?.bingos ?? 0;
    if (winsB !== winsA) return winsB - winsA;
    return (b.balance || 0) - (a.balance || 0);
  });

  const realTops: TopPlayer[] = sortedUsers.map((user, index) => {
    const rank = index + 1;
    const wins = user.stats?.victorias ?? user.stats?.bingos ?? 0;

    // Reglas solicitadas:
    // - Top Globales: con 20 ganadas o más (wins >= 20)
    // - Top Regionales: de 10 a 19 ganadas (wins >= 10 && wins <= 19)
    // - Chamos Competidores: de 1 a 9 ganadas (wins >= 1 && wins <= 9)
    // - Aspirantes: 0 ganadas (sin victorias aún)
    let category: "GLOBAL" | "REGIONAL" | "COMPETIDOR" | "ASPIRANTE" = "ASPIRANTE";
    if (wins >= 20) {
      category = "GLOBAL";
    } else if (wins >= 10) {
      category = "REGIONAL";
    } else if (wins >= 1) {
      category = "COMPETIDOR";
    } else {
      category = "ASPIRANTE";
    }

    const defaultAvatar = user.gender === "FEMALE" ? "👗" : "🧢";
    const userAvatar = user.avatar || defaultAvatar;

    return {
      rank,
      category,
      name: user.name || user.email.split("@")[0],
      email: user.email,
      weeklyEarnings: user.balance || 0,
      weeklyWins: wins,
      region: "Venezuela",
      avatar: userAvatar,
      characterId: user.gender === "FEMALE" ? "chama-glam" : "chamo-urbano",
    };
  });

  const globalCount = realTops.filter((p) => p.category === "GLOBAL").length;
  const regionalCount = realTops.filter((p) => p.category === "REGIONAL").length;
  const competidorCount = realTops.filter((p) => p.category === "COMPETIDOR").length;

  const filteredTops = realTops.filter((player) => {
    if (filter === "ALL") return true;
    return player.category === filter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/50 rounded-3xl max-w-2xl w-full p-5 sm:p-7 flex flex-col gap-4 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-yellow-300 border border-amber-500/40 shadow">
              <Trophy size={22} className="animate-bounce" />
            </div>
            <div>
              <h3 className="font-fredoka text-lg sm:text-xl font-bold text-yellow-300 flex items-center gap-2">
                Tabla de Tops y Clasificación
                <span className="text-[10px] font-mono bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full font-black flex items-center gap-1">
                  <ShieldCheck size={11} /> CERO BOTS
                </span>
              </h3>
              <p className="text-xs text-slate-300 flex items-center gap-1.5">
                <Calendar size={12} className="text-amber-400" /> Clasificación exclusiva de personas reales según sus partidas ganadas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Category Tiers Explanation Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-gradient-to-r from-amber-500/15 to-yellow-500/25 border border-amber-500/50 rounded-2xl p-2.5 flex flex-col items-center">
            <span className="font-fredoka font-bold text-yellow-300 flex items-center gap-1">
              <Crown size={14} className="text-amber-400" /> Tops Globales
            </span>
            <span className="text-[11px] font-mono font-bold text-amber-300 mt-0.5">20+ Ganadas</span>
            <span className="text-[10px] text-slate-300">Líderes consagrados del bingo</span>
          </div>

          <div className="bg-gradient-to-r from-blue-500/15 to-cyan-500/25 border border-blue-500/50 rounded-2xl p-2.5 flex flex-col items-center">
            <span className="font-fredoka font-bold text-blue-300 flex items-center gap-1">
              <MapPin size={14} className="text-cyan-400" /> Tops Regionales
            </span>
            <span className="text-[11px] font-mono font-bold text-cyan-300 mt-0.5">10 a 19 Ganadas</span>
            <span className="text-[10px] text-slate-300">Jugadores expertos en ascenso</span>
          </div>

          <div className="bg-gradient-to-r from-emerald-500/15 to-teal-500/25 border border-emerald-500/50 rounded-2xl p-2.5 flex flex-col items-center">
            <span className="font-fredoka font-bold text-emerald-300 flex items-center gap-1">
              <Zap size={14} className="text-emerald-400" /> Chamos Competidores (SoloQ)
            </span>
            <span className="text-[11px] font-mono font-bold text-emerald-300 mt-0.5">1 a 9 Ganadas</span>
            <span className="text-[10px] text-slate-300">Competidores individuales en SoloQ</span>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 gap-1 overflow-x-auto">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-fredoka font-bold transition cursor-pointer whitespace-nowrap ${
              filter === "ALL"
                ? "bg-amber-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Todos ({realTops.length})
          </button>
          <button
            onClick={() => setFilter("GLOBAL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-fredoka font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filter === "GLOBAL"
                ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-yellow-300"
            }`}
          >
            <Crown size={13} className="text-yellow-400" />
            <span>Tops Globales (20+)</span>
            {globalCount > 0 && (
              <span className="bg-amber-950/80 text-yellow-300 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
                {globalCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter("REGIONAL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-fredoka font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filter === "REGIONAL"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-400 hover:text-blue-300"
            }`}
          >
            <MapPin size={13} className="text-cyan-400" />
            <span>Tops Regionales (10-19)</span>
            {regionalCount > 0 && (
              <span className="bg-blue-950/80 text-cyan-200 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
                {regionalCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter("COMPETIDOR")}
            className={`px-3 py-1.5 rounded-xl text-xs font-fredoka font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filter === "COMPETIDOR"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-400 hover:text-emerald-300"
            }`}
          >
            <Zap size={13} className="text-emerald-400" />
            <span>Chamos Competidores SoloQ (1-9)</span>
            {competidorCount > 0 && (
              <span className="bg-emerald-950/80 text-emerald-200 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
                {competidorCount}
              </span>
            )}
          </button>
        </div>

        {/* Rankings List */}
        <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
          {filteredTops.length === 0 ? (
            <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-400 text-xs flex flex-col items-center justify-center gap-2.5">
              <Users size={32} className="text-slate-600 mb-0.5" />
              <p className="font-fredoka font-bold text-slate-200 text-sm">
                {filter === "GLOBAL"
                  ? "Aún no hay Tops Globales (20+ ganadas)"
                  : filter === "REGIONAL"
                  ? "Aún no hay Tops Regionales (10 a 19 ganadas)"
                  : filter === "COMPETIDOR"
                  ? "Aún no hay Chamos Competidores en SoloQ (1 a 9 ganadas)"
                  : "Cero Bots: Solo Jugadores Reales"}
              </p>
              <p className="text-slate-400 text-[11px] max-w-sm leading-relaxed">
                {filter === "GLOBAL"
                  ? "Gana 20 partidas o más en el Bingo el Chamo para ingresar a la clasificación de Tops Globales."
                  : filter === "REGIONAL"
                  ? "Acumula entre 10 y 19 partidas ganadas para subir a la clasificación de Tops Regionales."
                  : filter === "COMPETIDOR"
                  ? "Consigue entre 1 y 9 victorias individuales en SoloQ para ingresar al listado de Chamos Competidores."
                  : "Se han eliminado todos los bots y cuentas simuladas. Conforme personas reales jueguen y canten BINGO, irán escalando automáticamente entre los rangos según sus victorias."}
              </p>
            </div>
          ) : (
            filteredTops.map((player) => {
              const isGlobal = player.category === "GLOBAL";
              const isRegional = player.category === "REGIONAL";
              const isCompetidor = player.category === "COMPETIDOR";
              const isMe = currentUserEmail && player.email.toLowerCase() === currentUserEmail.toLowerCase();

              return (
                <div
                  key={player.rank}
                  className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition shadow ${
                    isGlobal
                      ? "bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-950 border-amber-500/50 hover:border-amber-400"
                      : isRegional
                      ? "bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-950 border-blue-500/40 hover:border-blue-400"
                      : isCompetidor
                      ? "bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-950 border-emerald-500/40 hover:border-emerald-400"
                      : "bg-slate-950 border-slate-800 hover:border-slate-700"
                  } ${isMe ? "ring-2 ring-yellow-400" : ""}`}
                >
                  {/* Left: Position Rank Badge & Avatar */}
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-fredoka font-black text-sm shrink-0 shadow border ${
                        player.rank === 1
                          ? "bg-gradient-to-tr from-yellow-400 to-amber-500 text-slate-950 border-yellow-300 scale-105"
                          : player.rank === 2
                          ? "bg-gradient-to-tr from-slate-200 to-slate-400 text-slate-950 border-slate-200"
                          : player.rank === 3
                          ? "bg-gradient-to-tr from-amber-700 to-yellow-800 text-white border-amber-600"
                          : isGlobal
                          ? "bg-amber-950 text-amber-300 border-amber-700"
                          : isRegional
                          ? "bg-blue-950 text-blue-300 border-blue-700"
                          : isCompetidor
                          ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                          : "bg-slate-900 text-slate-400 border-slate-800"
                      }`}
                    >
                      {player.rank === 1 ? (
                        "🥇 1"
                      ) : player.rank === 2 ? (
                        "🥈 2"
                      ) : player.rank === 3 ? (
                        "🥉 3"
                      ) : (
                        `#${player.rank}`
                      )}
                    </div>

                    <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                      {player.avatar && (player.avatar.startsWith("data:") || player.avatar.startsWith("http")) ? (
                        <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{player.avatar || "👤"}</span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-fredoka font-bold text-sm text-yellow-300">
                          {player.name}
                        </span>
                        {isGlobal && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <Crown size={10} /> Top Global (20+ Ganadas)
                          </span>
                        )}
                        {isRegional && (
                          <span className="text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <MapPin size={10} /> Top Regional (10-19 Ganadas)
                          </span>
                        )}
                        {isCompetidor && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <Zap size={10} /> Chamo Competidor SoloQ (1-9 Ganadas)
                          </span>
                        )}
                        {player.category === "ASPIRANTE" && (
                          <span className="text-[9px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            🎮 Aspirante (0 Ganadas)
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                        {player.email}
                      </span>
                    </div>
                  </div>

                  {/* Right: Capital Balance & Victories */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-800/80 pt-2 sm:pt-0">
                    <div className="flex flex-col text-left sm:text-right">
                      <span className="text-[9px] uppercase font-bold text-slate-400">Capital Real</span>
                      <span className="font-fredoka text-sm sm:text-base font-black text-emerald-400 font-mono flex items-center sm:justify-end gap-1">
                        <DollarSign size={14} className="text-emerald-500" />
                        {player.weeklyEarnings.toLocaleString("es-VE", { minimumFractionDigits: 2 })} VES
                      </span>
                    </div>

                    <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 flex flex-col items-center shrink-0">
                      <span className="text-[8px] uppercase font-bold text-slate-400">Victorias</span>
                      <span className="font-fredoka text-xs font-bold text-yellow-300 flex items-center gap-1">
                        <Trophy size={11} className="text-yellow-400" />
                        {player.weeklyWins} {player.weeklyWins === 1 ? "Ganada" : "Ganadas"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info note */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Escala de Rangos: Globales (20+ ganadas) • Regionales (10-19 ganadas) • Competidores (1-9 ganadas)</span>
          </div>
          <span className="font-mono text-emerald-400 font-bold shrink-0">
            Cero Bots
          </span>
        </div>
      </div>
    </div>
  );
};
