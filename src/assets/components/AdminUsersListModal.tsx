import React, { useState, useMemo } from "react";
import { RegisteredUser } from "../types";
import { DEFAULT_COMMUNITY_USERS, isBotAccount } from "../data/communityUsers";
import {
  Users,
  Search,
  ShieldCheck,
  Mail,
  Wallet,
  User,
  Calendar,
  RefreshCw,
  Edit3,
  Check,
  X,
  PlusCircle,
  MinusCircle,
  TrendingDown,
  TrendingUp,
  Phone,
  Ban,
  ShieldAlert,
  CheckCircle2,
  AlertOctagon,
} from "lucide-react";

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

export const AdminUsersListModal: React.FC<Props> = ({
  isOpen,
  onClose,
  registeredUsers,
  onRefresh,
  onAdjustBalance,
  onToggleBanUser,
}) => {
  const [search, setSearch] = useState("");
  const [banFilter, setBanFilter] = useState<"ALL" | "ACTIVE" | "BANNED">("ALL");
  const [banningUser, setBanningUser] = useState<RegisteredUser | null>(null);
  const [banReason, setBanReason] = useState<string>("Infracción de normas o trampas");
  const [adjustingUser, setAdjustingUser] = useState<RegisteredUser | null>(null);
  const [adjustMode, setAdjustMode] = useState<"SET" | "ADD" | "SUBTRACT">("ADD");
  const [adjustAmount, setAdjustAmount] = useState<string>("50.00");
  const [adjustNotes, setAdjustNotes] = useState<string>("");

  if (!isOpen) return null;

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingUser || !onAdjustBalance) return;
    const num = parseFloat(adjustAmount.replace(/,/g, "."));
    if (isNaN(num) || num < 0) {
      alert("Por favor ingresa un monto numérico válido.");
      return;
    }

    const current = Number(adjustingUser.balance || 0);
    if (adjustMode === "SUBTRACT" && num > current) {
      alert(`⚠️ No puedes quitar ${num.toFixed(2)} VES porque el usuario solo tiene ${current.toFixed(2)} VES disponible en su cuenta.`);
      return;
    }

    onAdjustBalance(
      adjustingUser.email,
      adjustMode,
      num,
      adjustNotes ||
        (adjustMode === "SUBTRACT"
          ? `Deducción exacta de -${num.toFixed(2)} VES`
          : adjustMode === "ADD"
          ? `Abono exacto de +${num.toFixed(2)} VES`
          : `Ajuste administrativo fijado en ${num.toFixed(2)} VES`)
    );

    setAdjustingUser(null);
    setAdjustNotes("");
  };

  // Merge community players with registeredUsers to ensure total visibility
  const allCommunityUsers = useMemo(() => {
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
    map.forEach((player) => {
      const cleanEmail = player.email.toLowerCase().trim();
      if (
        cleanEmail === "admin@bingoelchamo.com" ||
        (player as any).role === "ADMIN" ||
        isBotAccount(cleanEmail, player.id)
      ) {
        return;
      }
      list.push(player);
    });
    return list;
  }, [registeredUsers]);

  const totalBanned = allCommunityUsers.filter((u) => u.isBanned).length;
  const totalActive = allCommunityUsers.filter((u) => !u.isBanned).length;

  const filteredUsers = allCommunityUsers.filter((u) => {
    if (banFilter === "ACTIVE" && u.isBanned) return false;
    if (banFilter === "BANNED" && !u.isBanned) return false;

    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.pagoMovilPhone && u.pagoMovilPhone.includes(q)) ||
      (u.pagoMovilBank && u.pagoMovilBank.toLowerCase().includes(q)) ||
      (u.pagoMovilId && u.pagoMovilId.toLowerCase().includes(q)) ||
      (u.isBanned ? "baneado" : "activo").includes(q) ||
      u.balance.toFixed(2).includes(q)
    );
  });

  const totalVaultBalance = allCommunityUsers.reduce((sum, u) => sum + (u.balance || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-4xl w-full p-4 sm:p-6 flex flex-col gap-4 shadow-2xl relative max-h-[92vh] overflow-hidden">
        {/* Festive Accent Glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg border-2 border-yellow-300">
              <Users size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-fredoka text-base sm:text-lg font-bold text-yellow-300">
                  Lista Oficial de Usuarios Registrados
                </h3>
                <span className="text-[10px] bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-2 py-0.5 rounded-full font-bold">
                  Panel Administrador
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Visualiza jugadores, su Pago Móvil, modifica saldos y gestiona baneos de cuenta.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-sm transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 relative z-10">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Usuarios</span>
            <span className="font-fredoka text-lg font-black text-white font-mono">
              {allCommunityUsers.length} jugadores
            </span>
          </div>
          <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-3 flex flex-col">
            <span className="text-[10px] uppercase font-bold text-emerald-400">Monto Global en Saldo</span>
            <span className="font-fredoka text-lg font-black text-emerald-400 font-mono">
              {totalVaultBalance.toFixed(2)} VES
            </span>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400">Filtro Rápido</span>
              <span className="text-[11px] text-yellow-300 font-mono">
                {filteredUsers.length} coincidencias
              </span>
            </div>
            {onRefresh && (
              <button
                onClick={onRefresh}
                title="Actualizar listado"
                className="p-2 bg-slate-800 hover:bg-slate-700 text-yellow-400 rounded-xl transition cursor-pointer"
              >
                <RefreshCw size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col gap-2 relative z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setBanFilter("ALL")}
              className={`px-3 py-1 rounded-xl text-xs font-fredoka font-bold transition cursor-pointer ${
                banFilter === "ALL"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              Todos ({allCommunityUsers.length})
            </button>
            <button
              type="button"
              onClick={() => setBanFilter("ACTIVE")}
              className={`px-3 py-1 rounded-xl text-xs font-fredoka font-bold transition cursor-pointer flex items-center gap-1 ${
                banFilter === "ACTIVE"
                  ? "bg-emerald-600 text-white shadow"
                  : "bg-slate-950 text-emerald-400/80 hover:text-emerald-300 border border-slate-800"
              }`}
            >
              <CheckCircle2 size={12} />
              <span>Activos ({totalActive})</span>
            </button>
            <button
              type="button"
              onClick={() => setBanFilter("BANNED")}
              className={`px-3 py-1 rounded-xl text-xs font-fredoka font-bold transition cursor-pointer flex items-center gap-1 ${
                banFilter === "BANNED"
                  ? "bg-red-600 text-white shadow"
                  : "bg-slate-950 text-red-400 hover:text-red-300 border border-slate-800"
              }`}
            >
              <Ban size={12} />
              <span>Baneados ({totalBanned})</span>
            </button>
          </div>

          <div className="relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Buscar por nombre, correo, Pago Móvil o 'baneado'..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2 text-xs text-yellow-300 placeholder:text-slate-500 outline-none focus:border-amber-500 transition font-mono"
            />
          </div>
        </div>

        {/* Users Table / List */}
        <div className="flex-1 overflow-y-auto max-h-[460px] pr-1 flex flex-col gap-2 relative z-10">
          {filteredUsers.length === 0 ? (
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400 italic">
              No se encontraron usuarios registrados que coincidan con la búsqueda.
            </div>
          ) : (
            filteredUsers.map((u, index) => {
              const isMale = u.gender === "MALE";
              return (
                <div
                  key={u.id || u.email}
                  className="bg-slate-950/90 border border-slate-800/90 hover:border-amber-500/40 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition shadow"
                >
                  {/* Left: Avatar, Name & Gmail */}
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-600 flex items-center justify-center text-lg overflow-hidden">
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                        ) : isMale ? (
                          "🧢"
                        ) : (
                          "👗"
                        )}
                      </div>
                      <span className="absolute -bottom-1 -right-1 text-[10px]">
                        {isMale ? "👦" : "👧"}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-fredoka text-sm font-bold text-white">
                          {u.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          #{index + 1}
                        </span>
                        {u.isBanned ? (
                          <span className="text-[9px] bg-red-950 text-red-300 border border-red-500/80 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 font-mono animate-pulse">
                            <Ban size={10} className="text-red-400" /> BANEADO
                          </span>
                        ) : (
                          <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 font-mono">
                            <CheckCircle2 size={10} className="text-emerald-400" /> ACTIVO
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                        <Mail size={12} className="text-yellow-400/80 shrink-0" />
                        <span className="truncate max-w-[200px] sm:max-w-none text-slate-300">
                          {u.email}
                        </span>
                      </div>

                      {u.isBanned && u.bannedReason && (
                        <div className="text-[10px] text-red-300 bg-red-950/60 border border-red-900/60 px-2 py-0.5 rounded-lg font-mono">
                          ⚠️ Motivo: {u.bannedReason} {u.bannedAt ? `(${u.bannedAt})` : ""}
                        </div>
                      )}

                      {/* Pago Móvil Oficial */}
                      <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        <div className="flex items-center gap-1 text-[11px] font-mono font-bold bg-amber-500/15 border border-amber-500/40 px-2 py-0.5 rounded-lg text-yellow-300 shadow-sm">
                          <Phone size={11} className="text-amber-400 shrink-0" />
                          <span>Pago Móvil: {u.pagoMovilPhone || "No registrado"}</span>
                        </div>

                        {u.pagoMovilBank && (
                          <span className="text-[10px] font-mono bg-slate-900 border border-slate-700/80 px-1.5 py-0.5 rounded text-emerald-300 font-semibold" title={u.pagoMovilBank}>
                            🏦 {u.pagoMovilBank.split("(")[0].trim()}
                          </span>
                        )}

                        {u.pagoMovilId && (
                          <span className="text-[10px] font-mono bg-slate-900 border border-slate-700/80 px-1.5 py-0.5 rounded text-slate-300">
                            C.I: {u.pagoMovilId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Balance / Monto, Ban Actions & Badges */}
                  <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 flex-wrap">
                    <div className="flex flex-col items-start sm:items-end">
                      <span className="text-[9px] uppercase font-bold text-slate-400 flex items-center gap-1">
                        <Wallet size={10} className="text-emerald-400" /> Monto
                      </span>
                      <span className="font-fredoka text-sm sm:text-base font-black text-amber-300 font-mono">
                        {u.balance.toFixed(2)} VES
                      </span>
                    </div>

                    {/* Botón de Banear o Quitar Baneo */}
                    {onToggleBanUser && (
                      <div className="flex items-center">
                        {u.isBanned ? (
                          <button
                            type="button"
                            onClick={() => onToggleBanUser(u.email, false)}
                            className="bg-emerald-700 hover:bg-emerald-600 text-white font-fredoka font-bold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 shadow transition cursor-pointer border border-emerald-400/50 active:scale-95"
                            title={`Quitar el baneo a ${u.name} para que pueda volver a jugar`}
                          >
                            <Check size={12} className="text-emerald-200" />
                            <span>Quitar Baneo</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setBanningUser(u);
                              setBanReason("Infracción de normas o trampas");
                            }}
                            className="bg-red-950/90 hover:bg-red-800 text-red-200 hover:text-white font-fredoka font-bold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer border border-red-700/60 active:scale-95 shadow"
                            title={`Banear cuenta de ${u.name}`}
                          >
                            <Ban size={12} className="text-red-400" />
                            <span>Banear</span>
                          </button>
                        )}
                      </div>
                    )}

                    {onAdjustBalance && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Abonar Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setAdjustingUser(u);
                            setAdjustAmount("50.00");
                            setAdjustMode("ADD");
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-fredoka font-bold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 shadow transition cursor-pointer border border-emerald-400/40"
                          title={`Abonar / sumar saldo a ${u.name}`}
                        >
                          <PlusCircle size={12} className="text-emerald-200" />
                          <span>+ Abonar</span>
                        </button>

                        {/* Quitar Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setAdjustingUser(u);
                            setAdjustAmount("20.00");
                            setAdjustMode("SUBTRACT");
                          }}
                          className="bg-rose-700 hover:bg-rose-600 text-white font-fredoka font-bold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 shadow transition cursor-pointer border border-rose-400/40"
                          title={`Quitar / restar una cantidad exacta a la cuenta de ${u.name}`}
                        >
                          <MinusCircle size={12} className="text-rose-200" />
                          <span>- Quitar</span>
                        </button>

                        {/* Fijar Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setAdjustingUser(u);
                            setAdjustAmount(u.balance.toFixed(2));
                            setAdjustMode("SET");
                          }}
                          className="bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-slate-700 px-2 py-1 rounded-lg text-[11px] font-fredoka flex items-center gap-1 transition cursor-pointer"
                          title="Fijar saldo total del usuario"
                        >
                          <Edit3 size={11} /> Fijar
                        </button>
                      </div>
                    )}

                    <div className="text-right flex flex-col items-end">
                      <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                        {u.stats?.victorias ? `${u.stats.victorias} Wins 🏆` : "0 Wins"}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono mt-0.5">
                        {u.registeredAt || "Registrado"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Note */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
          <span className="flex items-center gap-1">
            <ShieldCheck size={13} className="text-emerald-400" /> Todos los usuarios registrados con su cuenta Gmail
          </span>
          <button
            onClick={onClose}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-fredoka font-bold px-4 py-1.5 rounded-xl transition text-xs cursor-pointer shadow"
          >
            Entendido
          </button>
        </div>

        {/* Adjust Balance Modal Dialog */}
        {adjustingUser && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-slate-900 border border-amber-500 rounded-3xl max-w-md w-full p-5 flex flex-col gap-4 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                    <Wallet size={16} />
                  </div>
                  <div>
                    <h4 className="font-fredoka font-bold text-white text-sm">
                      Ajustar Saldo de Usuario
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {adjustingUser.email}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAdjustingUser(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Current & Resulting Balance Simulation Card */}
              {(() => {
                const current = Number(adjustingUser.balance || 0);
                const num = parseFloat(adjustAmount.replace(/,/g, ".")) || 0;
                let resulting = current;
                if (adjustMode === "SET") resulting = Math.max(0, num);
                if (adjustMode === "ADD") resulting = Number((current + num).toFixed(2));
                if (adjustMode === "SUBTRACT") resulting = Number(Math.max(0, current - num).toFixed(2));

                return (
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-col gap-2 shadow-inner">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Saldo actual en cuenta:</span>
                      <span className="font-fredoka font-black text-amber-300 font-mono text-sm">
                        {current.toFixed(2)} VES
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-900">
                      <span className="text-slate-300 font-bold flex items-center gap-1">
                        {adjustMode === "ADD" && <TrendingUp size={13} className="text-emerald-400" />}
                        {adjustMode === "SUBTRACT" && <TrendingDown size={13} className="text-rose-400" />}
                        {adjustMode === "SET" && <Edit3 size={13} className="text-amber-400" />}
                        <span>
                          {adjustMode === "ADD" && "Nuevo saldo tras abono (+):"}
                          {adjustMode === "SUBTRACT" && "Nuevo saldo tras deducción (-):"}
                          {adjustMode === "SET" && "Nuevo saldo fijado (=):"}
                        </span>
                      </span>
                      <span
                        className={`font-fredoka font-black font-mono text-base ${
                          adjustMode === "ADD"
                            ? "text-emerald-400"
                            : adjustMode === "SUBTRACT"
                            ? "text-rose-400"
                            : "text-amber-300"
                        }`}
                      >
                        {resulting.toFixed(2)} VES
                      </span>
                    </div>
                  </div>
                );
              })()}

              <form onSubmit={handleSaveAdjustment} className="flex flex-col gap-3">
                {/* Mode Selector Tabs: Abonar (+), Quitar (-), Fijar (=) */}
                <div className="flex rounded-2xl bg-slate-950 p-1 border border-slate-800 text-xs font-fredoka gap-1">
                  <button
                    type="button"
                    onClick={() => setAdjustMode("ADD")}
                    className={`flex-1 py-2 rounded-xl text-center font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                      adjustMode === "ADD"
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/60"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <PlusCircle size={13} />
                    <span>+ Abonar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustMode("SUBTRACT")}
                    className={`flex-1 py-2 rounded-xl text-center font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                      adjustMode === "SUBTRACT"
                        ? "bg-rose-700 text-white shadow-lg shadow-rose-950/60"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <MinusCircle size={13} />
                    <span>- Quitar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustMode("SET")}
                    className={`flex-1 py-2 rounded-xl text-center font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                      adjustMode === "SET"
                        ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-950/60"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Edit3 size={13} />
                    <span>= Fijar</span>
                  </button>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1 text-[11px]">
                    <span className="text-slate-300 font-bold">
                      {adjustMode === "ADD" && "Monto a abonar/sumar (VES):"}
                      {adjustMode === "SUBTRACT" && "Monto a quitar/restar (VES):"}
                      {adjustMode === "SET" && "Nuevo saldo exacto (VES):"}
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        adjustMode === "ADD"
                          ? "text-emerald-400"
                          : adjustMode === "SUBTRACT"
                          ? "text-rose-400"
                          : "text-amber-400"
                      }`}
                    >
                      {adjustAmount} VES
                    </span>
                  </div>

                  {/* Preset Buttons tailored to mode */}
                  <div className="grid grid-cols-4 gap-1.5 mb-2">
                    {adjustMode === "ADD" &&
                      [20, 50, 100, 500].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setAdjustAmount(preset.toFixed(2))}
                          className="py-1 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 text-emerald-300 hover:bg-emerald-950/30 text-[11px] font-mono font-bold transition cursor-pointer"
                        >
                          +{preset} Bs
                        </button>
                      ))}

                    {adjustMode === "SUBTRACT" &&
                      [
                        { label: "-5 Bs", val: "5.00" },
                        { label: "-10 Bs", val: "10.00" },
                        { label: "-20 Bs", val: "20.00" },
                        { label: "-50 Bs", val: "50.00" },
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => setAdjustAmount(item.val)}
                          className="py-1 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500 text-rose-300 hover:bg-rose-950/30 text-[11px] font-mono font-bold transition cursor-pointer"
                        >
                          {item.label}
                        </button>
                      ))}

                    {adjustMode === "SET" &&
                      [
                        { label: "0.00 (Reset)", val: "0.00" },
                        { label: "60 Bs", val: "60.00" },
                        { label: "500 Bs", val: "500.00" },
                        { label: "1000 Bs", val: "1000.00" },
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => setAdjustAmount(item.val)}
                          className="py-1 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-amber-300 hover:bg-amber-950/30 text-[11px] font-mono font-bold transition cursor-pointer"
                        >
                          {item.label}
                        </button>
                      ))}
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(e.target.value)}
                      className={`w-full bg-slate-950 border-2 rounded-xl px-3 py-2 text-sm font-mono font-black outline-none transition pr-14 ${
                        adjustMode === "ADD"
                          ? "border-emerald-500/60 focus:border-emerald-400 text-emerald-400"
                          : adjustMode === "SUBTRACT"
                          ? "border-rose-500/60 focus:border-rose-400 text-rose-400"
                          : "border-amber-500/60 focus:border-amber-400 text-amber-300"
                      }`}
                      placeholder="100.00"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono font-bold pointer-events-none">
                      VES
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 mb-1 block">
                    Motivo / Nota administrativa (Opcional):
                  </label>
                  <input
                    type="text"
                    value={adjustNotes}
                    onChange={(e) => setAdjustNotes(e.target.value)}
                    placeholder={
                      adjustMode === "ADD"
                        ? "Ej. Bono de bienvenida o corrección de abono"
                        : adjustMode === "SUBTRACT"
                        ? "Ej. Retiro manual o corrección por débito"
                        : "Ej. Ajuste de balance administrativo"
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setAdjustingUser(null)}
                    className="px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className={`font-fredoka font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg transition cursor-pointer ${
                      adjustMode === "ADD"
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/60"
                        : adjustMode === "SUBTRACT"
                        ? "bg-rose-700 hover:bg-rose-600 text-white shadow-rose-950/60"
                        : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-950/60"
                    }`}
                  >
                    <Check size={14} />
                    <span>
                      {adjustMode === "ADD" && `Abonar +${parseFloat(adjustAmount) || 0} VES`}
                      {adjustMode === "SUBTRACT" && `Quitar -${parseFloat(adjustAmount) || 0} VES`}
                      {adjustMode === "SET" && `Fijar en ${parseFloat(adjustAmount) || 0} VES`}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Modal Confirmación de Baneo */}
        {banningUser && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-slate-900 border-2 border-red-500 rounded-3xl max-w-md w-full p-5 sm:p-6 flex flex-col gap-4 shadow-2xl relative">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-red-600/20 border border-red-500 flex items-center justify-center text-red-400 shrink-0">
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <h4 className="font-fredoka text-base sm:text-lg font-bold text-red-400">
                    Banear Cuenta de Jugador
                  </h4>
                  <p className="text-xs text-slate-300 font-mono">
                    {banningUser.name} • {banningUser.email}
                  </p>
                </div>
              </div>

              <div className="bg-red-950/40 border border-red-900/70 rounded-xl p-3 text-xs text-red-200 leading-relaxed">
                ⚠️ Al banear a este jugador, <strong>se le bloqueará el acceso inmediatamente</strong>. Le aparecerá en pantalla <strong>"Tu Cuenta Ha Sido Baneada"</strong> y no podrá jugar en las salas de bingo. Podrás quitarle el baneo cuando desees.
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">
                  Motivo de la Suspensión (visible para el jugador):
                </label>
                <input
                  type="text"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Ej: Infracción de reglas / Comportamiento antideportivo"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-yellow-300 font-mono outline-none focus:border-red-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setBanningUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-fredoka font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onToggleBanUser && banningUser) {
                      onToggleBanUser(banningUser.email, true, banReason);
                    }
                    setBanningUser(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-fredoka font-black bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <Ban size={14} />
                  <span>Confirmar Baneo</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
