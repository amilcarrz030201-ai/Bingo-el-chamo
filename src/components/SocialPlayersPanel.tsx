import React, { useState } from "react";
import { OnlinePlayer } from "../types";
import { Users, UserPlus, UserCheck, Search, Sparkles, Send, ShieldCheck, Share2, Copy, Check } from "lucide-react";

interface Props {
  currentUserEmail: string;
  onlinePlayers: OnlinePlayer[];
  friendEmails: string[];
  onAddFriend: (email: string) => void;
  onRemoveFriend: (email: string) => void;
}

export const SocialPlayersPanel: React.FC<Props> = ({
  currentUserEmail,
  onlinePlayers,
  friendEmails,
  onAddFriend,
  onRemoveFriend,
}) => {
  const [filter, setFilter] = useState<"all" | "friends">("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const [newFriendEmail, setNewFriendEmail] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newFriendEmail.trim().toLowerCase();
    if (!clean) return;
    if (clean === currentUserEmail.toLowerCase()) {
      alert("¡No puedes añadirte a ti mismo como amigo!");
      return;
    }
    if (friendEmails.includes(clean)) {
      alert("Este jugador ya está en tu lista de amigos.");
      return;
    }

    onAddFriend(clean);
    showToast(`¡Añadiste a ${clean} a tu lista de amigos!`);
    setNewFriendEmail("");
  };

  const handleSendGreeting = (playerName: string) => {
    showToast(`🎉 ¡Le enviaste un saludo y buena vibra de bingo a ${playerName}!`);
  };

  const handleCopyInviteLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    showToast("¡Enlace de invitación copiado! Compártelo por WhatsApp con tus amigos.");
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Filter list: only real friends or registered players
  const filteredPlayers = onlinePlayers.filter((p) => {
    if (p.email.toLowerCase() === currentUserEmail.toLowerCase()) return false;
    const isFriend = friendEmails.includes(p.email.toLowerCase());
    if (filter === "friends" && !isFriend) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-950 border border-emerald-500 text-emerald-200 text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Sparkles size={14} className="text-yellow-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with Anti-Bot Assurance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-300">
            <Users size={20} />
          </div>
          <div>
            <h3 className="font-fredoka text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
              Sala de Amigos & Jugadores Reales
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <ShieldCheck size={11} className="text-emerald-400" /> Cero Bots
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Juega de manera transparente con amigos y personas reales agregadas a tu lista.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleCopyInviteLink}
            className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-amber-300 px-3 py-1.5 rounded-xl text-xs font-fredoka font-bold flex items-center gap-1.5 transition cursor-pointer"
            title="Copiar link para invitar panas a jugar"
          >
            {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
            <span>Invitar Panas</span>
          </button>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilter("friends")}
              className={`px-3 py-1 rounded-lg text-xs font-fredoka font-bold transition cursor-pointer ${
                filter === "friends"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Mis Amigos ({friendEmails.length})
            </button>
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-lg text-xs font-fredoka font-bold transition cursor-pointer ${
                filter === "all"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Todos ({filteredPlayers.length})
            </button>
          </div>
        </div>
      </div>

      {/* Zero Bots Verification Banner */}
      <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
          <span className="text-slate-300">
            <strong className="text-emerald-400 font-bold">100% Sin Bots:</strong> Todos los jugadores en esta sala son personas reales que juegas agregando a amigos. No existen bots automáticos ni perfiles falsos.
          </span>
        </div>
      </div>

      {/* Add Friend Manual Form & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <form onSubmit={handleManualAdd} className="flex gap-1.5">
          <input
            type="email"
            placeholder="Añadir amigo por correo (ej: compadre@gmail.com)"
            value={newFriendEmail}
            onChange={(e) => setNewFriendEmail(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-300 outline-none focus:border-amber-500 flex-1 font-mono"
          />
          <button
            type="submit"
            className="bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-700/60 px-3 py-2 rounded-xl text-xs font-fredoka font-bold flex items-center gap-1 transition cursor-pointer shrink-0"
            title="Añadir a la lista de amigos"
          >
            <UserPlus size={13} /> Añadir
          </button>
        </form>

        <div className="relative">
          <Search size={13} className="absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar amigo por nombre o correo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
          />
        </div>
      </div>

      {/* Players / Friends List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
        {filteredPlayers.length === 0 ? (
          <div className="col-span-2 bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-500">
              <Users size={20} />
            </div>
            <p className="font-fredoka font-bold text-slate-300">
              {filter === "friends"
                ? "Aún no has agregado amigos a tu lista."
                : "No se encontraron amigos con ese criterio de búsqueda."}
            </p>
            <p className="text-[11px] text-slate-500 max-w-md">
              Como no usamos bots, agrega a tus conocidos ingresando su correo en el campo superior o compárteles el link de la partida para jugar juntos en la Sala de Amigos.
            </p>
          </div>
        ) : (
          filteredPlayers.map((player) => {
            const isFriend = friendEmails.includes(player.email.toLowerCase());

            return (
              <div
                key={player.id}
                className="bg-slate-950 p-3 rounded-2xl border border-slate-800 hover:border-amber-500/40 flex items-center justify-between gap-3 transition shadow"
              >
                {/* Avatar & Player Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-600 flex items-center justify-center text-lg font-black text-slate-950 border border-yellow-300 overflow-hidden shrink-0">
                      {player.avatar || "👤"}
                    </div>
                    {player.isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
                    )}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-fredoka font-bold text-xs sm:text-sm text-yellow-300 truncate">
                        {player.name}
                      </span>
                      {isFriend && (
                        <span className="text-[9px] bg-purple-950 text-purple-300 border border-purple-800 px-1.5 py-0.2 rounded-md font-bold shrink-0">
                          ★ Amigo
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono truncate">
                      {player.email}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-fredoka flex items-center gap-1">
                      🎟️ {player.cartonesCount || 1} {(player.cartonesCount || 1) === 1 ? "cartón" : "cartones"} • {player.status || "En Sala de Amigos"}
                    </span>
                  </div>
                </div>

                {/* Friend Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {isFriend ? (
                    <>
                      <button
                        onClick={() => handleSendGreeting(player.name)}
                        className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-yellow-400 border border-slate-800 transition cursor-pointer"
                        title="Enviar saludo y suerte"
                      >
                        <Send size={13} />
                      </button>
                      <button
                        onClick={() => {
                          onRemoveFriend(player.email.toLowerCase());
                          showToast(`Eliminaste a ${player.name} de tus amigos.`);
                        }}
                        className="bg-emerald-950 hover:bg-red-950 text-emerald-300 hover:text-red-300 border border-emerald-800 hover:border-red-800 text-[10px] font-fredoka font-bold px-2.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1"
                        title="Quitar amigo"
                      >
                        <UserCheck size={12} /> Amigo
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        onAddFriend(player.email.toLowerCase());
                        showToast(`¡Añadiste a ${player.name} a tu lista de amigos!`);
                      }}
                      className="bg-purple-900/80 hover:bg-purple-700 text-purple-100 border border-purple-700/60 text-[10px] font-fredoka font-bold px-2.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 shadow"
                    >
                      <UserPlus size={12} /> Añadir
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
