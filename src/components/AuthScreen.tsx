import React, { useState } from "react";
import { CORREO_ADMIN_OFICIAL, CLAVE_ADMIN_OFICIAL } from "../constants/patterns";
import { UserProfile } from "../types";
import { Sparkles, Camera, ShieldCheck, User } from "lucide-react";

interface Props {
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthScreen: React.FC<Props> = ({ onLoginSuccess }) => {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE");
  const [avatar, setAvatar] = useState<string | null>(null);

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatar(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      alert("Por favor ingresa tu correo y contraseña.");
      return;
    }

    const isAdmin =
      cleanEmail === CORREO_ADMIN_OFICIAL.toLowerCase() &&
      cleanPass === CLAVE_ADMIN_OFICIAL;

    // Load persisted balance if player had previous approved recharges
    let existingBalance = 0.0;
    try {
      const stored = localStorage.getItem(`chamo_balance_${cleanEmail}`);
      if (stored) existingBalance = parseFloat(stored);
    } catch (e) {}

    // Load persisted character preferences if any
    let storedCharId = gender === "FEMALE" ? "chama-glam" : "chamo-urbano";
    let storedUnlocked = ["chamo-urbano", "chama-glam"];
    try {
      const savedUser = localStorage.getItem(`chamo_profile_${cleanEmail}`);
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.selectedCharacterId) storedCharId = parsed.selectedCharacterId;
        if (parsed.unlockedCharacterIds) storedUnlocked = parsed.unlockedCharacterIds;
      }
    } catch (e) {}

    const user: UserProfile = {
      email: cleanEmail,
      role: isAdmin ? "ADMIN" : "PLAYER",
      // CRITICAL: "Los usuarios tienen que tener el balance del saldo en cero porque ellos no han recargado."
      // "Aparte de eso, el administrador no puede tener saldo tampoco."
      balance: isAdmin ? null : existingBalance || 0.0,
      avatar: avatar || undefined,
      gender: gender,
      selectedCharacterId: storedCharId,
      unlockedCharacterIds: storedUnlocked,
      stats: {
        cartones: 0,
        bingos: 0,
        victorias: 0,
      },
    };

    onLoginSuccess(user);
  };

  const handleQuickAdminLogin = () => {
    setEmail(CORREO_ADMIN_OFICIAL);
    setPassword(CLAVE_ADMIN_OFICIAL);
  };

  const handleQuickPlayerLogin = () => {
    setEmail("jugador.chamo@gmail.com");
    setPassword("Navidad2026");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-red-800/60 rounded-3xl max-w-md w-full p-6 sm:p-7 flex flex-col gap-5 shadow-2xl relative overflow-hidden">
        {/* Christmas festive background blur decoration */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand & Avatar */}
        <div className="text-center flex flex-col items-center gap-2 relative z-10">
          <div className="relative group cursor-pointer" title="Haz clic para subir tu foto de perfil">
            <label className="cursor-pointer">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg text-slate-950 font-black text-2xl overflow-hidden border-2 border-yellow-300 group-hover:scale-105 transition">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  "🎱"
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-[10px] text-white font-bold">
                <Camera size={16} />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarFile}
                className="hidden"
              />
            </label>
          </div>

          <h2 className="font-fredoka text-2xl font-black text-yellow-300 mt-1 tracking-wide">
            Bingo el Chamo
          </h2>
          <p className="text-xs text-amber-200/90 flex items-center gap-1 font-fredoka">
            🇻🇪 Sala Oficial de Juego • Tómbola en Vivo
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setTab("login")}
            className={`flex-1 py-2 text-xs font-fredoka font-bold rounded-xl transition cursor-pointer ${
              tab === "login"
                ? "bg-amber-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => setTab("register")}
            className={`flex-1 py-2 text-xs font-fredoka font-bold rounded-xl transition cursor-pointer ${
              tab === "register"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-3.5 relative z-10">
          <div>
            <label className="text-[11px] font-bold text-slate-300 mb-1 block">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              placeholder="usuario@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 w-full outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-300 mb-1 block">
              Contraseña
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 w-full outline-none focus:border-amber-500 font-mono"
            />
          </div>

          {/* Gender selection for the animated character */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 mb-1.5 block">
              Tipo de Muñeco para el Lobby:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGender("MALE")}
                className={`py-2 px-3 rounded-xl border text-xs font-fredoka font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  gender === "MALE"
                    ? "bg-blue-600/30 border-blue-500 text-blue-300 ring-2 ring-blue-500/40"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <span>🧢 Varón</span>
                <span className="text-[10px] opacity-75">(El Chamo)</span>
              </button>
              <button
                type="button"
                onClick={() => setGender("FEMALE")}
                className={`py-2 px-3 rounded-xl border text-xs font-fredoka font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  gender === "FEMALE"
                    ? "bg-pink-600/30 border-pink-500 text-pink-300 ring-2 ring-pink-500/40"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <span>👗 Hembra</span>
                <span className="text-[10px] opacity-75">(La Chama)</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-400">
            ℹ️ Todos los jugadores inician con <strong className="text-yellow-400">saldo 0.00 VES</strong> hasta que soliciten y se les apruebe una recarga vía Pago Móvil.
          </div>

          <button
            type="submit"
            className="mt-1 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-fredoka font-black py-3 rounded-2xl shadow-lg transition active:scale-95 cursor-pointer text-xs"
          >
            {tab === "login" ? "Entrar al Juego" : "Crear Cuenta de Jugador"}
          </button>
        </form>
      </div>
    </div>
  );
};
