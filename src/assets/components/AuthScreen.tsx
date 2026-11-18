import React, { useState, useRef } from "react";
import { CORREO_ADMIN_OFICIAL, CLAVE_ADMIN_OFICIAL } from "../constants/patterns";
import { UserProfile, RegisteredUser } from "../types";
import { Sparkles, Camera, ShieldCheck, User, Upload, Trash2, Database, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { BINGO_LOGO_SRC } from "../constants/logo";
import { PRESET_AVATARS, compressImageFile } from "../utils/imageUtils";
import { ChristmasLights } from "./ChristmasLights";
import { ChristmasTree } from "./ChristmasTree";
import { signInWithSupabase, signUpWithSupabase, upsertSupabaseProfile, supabase, saveUserToSupabase } from "../supabase";
import { isBotAccount } from "../data/communityUsers";

interface Props {
  onLoginSuccess: (user: UserProfile) => void;
}

const VENEZUELA_BANKS = [
  "Banco de Venezuela (0102)",
  "Banesco (0134)",
  "Mercantil (0105)",
  "BBVA Provincial (0108)",
  "Bancamiga (0172)",
  "Banco Nacional de Crédito BNC (0191)",
  "Bancaribe (0114)",
  "Banco Exterior (0115)",
  "Banco del Tesoro (0163)",
  "Bancrecer (0168)",
  "100% Banco (0156)",
  "BFC Banco Fondo Común (0151)",
  "Banplus (0174)",
  "DELSUR (0157)",
  "Otro Banco",
];

export const AuthScreen: React.FC<Props> = ({ onLoginSuccess }) => {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE");
  const [pagoMovilPhone, setPagoMovilPhone] = useState("");
  const [pagoMovilBank, setPagoMovilBank] = useState("Banco de Venezuela (0102)");
  const [pagoMovilId, setPagoMovilId] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressing(true);
    setFormError(null);
    try {
      const compressed = await compressImageFile(file, 280, 0.85);
      setAvatar(compressed);
    } catch {
      setFormError("Error al cargar la foto. Por favor intenta con otra imagen.");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setFormError(null);
    setFormSuccess(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      setFormError("Por favor ingresa tu correo y contraseña.");
      return;
    }

    if (tab === "register") {
      if (cleanPass.length < 6) {
        setFormError("La contraseña debe tener al menos 6 caracteres.");
        return;
      }
      const cleanPhone = pagoMovilPhone.trim();
      if (!cleanPhone) {
        setFormError("Por favor ingresa tu número de Pago Móvil para registrar tu cuenta de Bingo el Chamo.");
        return;
      }
      if (cleanPhone.replace(/\D/g, "").length < 10) {
        setFormError("Por favor ingresa un número de teléfono de Pago Móvil válido (ej: 04121234567).");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const isAdmin =
        cleanEmail === CORREO_ADMIN_OFICIAL.toLowerCase() &&
        cleanPass === CLAVE_ADMIN_OFICIAL;

    // Load persisted balance if player had previous approved recharges
    let existingBalance = 0.0;
    try {
      const stored = localStorage.getItem(`chamo_balance_${cleanEmail}`);
      if (stored) existingBalance = parseFloat(stored);
    } catch (e) {}

    // Derive or use provided player name
    let formattedName = name.trim();
    let userAvatar = avatar || undefined;
    let userGender = gender;
    let userPagoPhone = pagoMovilPhone.trim();
    let userPagoBank = pagoMovilBank;
    let userPagoId = pagoMovilId.trim();

    try {
      const savedUser = localStorage.getItem(`chamo_profile_${cleanEmail}`);
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (!formattedName && parsed.name) formattedName = parsed.name;
        if (!userAvatar && parsed.avatar) userAvatar = parsed.avatar;
        if (parsed.gender) userGender = parsed.gender;
        if (!userPagoPhone && parsed.pagoMovilPhone) userPagoPhone = parsed.pagoMovilPhone;
        if (!userPagoBank && parsed.pagoMovilBank) userPagoBank = parsed.pagoMovilBank;
        if (!userPagoId && parsed.pagoMovilId) userPagoId = parsed.pagoMovilId;
      } else {
        const storedRegistry = localStorage.getItem("chamo_registered_users_v2");
        if (storedRegistry) {
          const registry: any[] = JSON.parse(storedRegistry);
          const found = registry.find((u: any) => u.email?.toLowerCase() === cleanEmail);
          if (found) {
            if (!formattedName && found.name) formattedName = found.name;
            if (!userAvatar && found.avatar) userAvatar = found.avatar;
            if (found.gender) userGender = found.gender;
            if (!userPagoPhone && found.pagoMovilPhone) userPagoPhone = found.pagoMovilPhone;
            if (!userPagoBank && found.pagoMovilBank) userPagoBank = found.pagoMovilBank;
            if (!userPagoId && found.pagoMovilId) userPagoId = found.pagoMovilId;
          }
        }
      }
    } catch (e) {}

    if (!formattedName) {
      formattedName = isAdmin ? "Administrador Oficial" : cleanEmail.split("@")[0];
    }

    // Load persisted character preferences if any
    let storedCharId = userGender === "FEMALE" ? "chama-glam" : "chamo-urbano";
    let storedUnlocked = userGender === "FEMALE" ? ["chama-glam"] : ["chamo-urbano"];
    try {
      const savedUser = localStorage.getItem(`chamo_profile_${cleanEmail}`);
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.selectedCharacterId) storedCharId = parsed.selectedCharacterId;
        if (parsed.unlockedCharacterIds) storedUnlocked = parsed.unlockedCharacterIds;
      }
    } catch (e) {}

    // Persist to the global registered users directory & Supabase so all players see each other
    if (!isAdmin) {
      try {
        const storedRegistry = localStorage.getItem("chamo_registered_users_v2");
        const rawRegistry: any[] = storedRegistry ? JSON.parse(storedRegistry) : [];
        // Strictly purge legacy bots
        const registry = rawRegistry.filter((u: any) => u && u.email && !isBotAccount(u.email, u.id));
        const existingIdx = registry.findIndex((u: any) => u.email.toLowerCase() === cleanEmail);
        const userRegistryData: RegisteredUser = {
          id: `reg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: formattedName,
          email: cleanEmail,
          balance: existingBalance || 0.0,
          gender: userGender,
          pagoMovilPhone: userPagoPhone || undefined,
          pagoMovilBank: userPagoBank || undefined,
          pagoMovilId: userPagoId || undefined,
          registeredAt: new Date().toLocaleDateString("es-VE", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          avatar: userAvatar || "👤",
          lastActiveAt: Date.now(),
          isOnline: true,
          stats: {
            cartones: 0,
            bingos: 0,
            victorias: 0,
          },
        };

        let targetUserData = userRegistryData;
        if (existingIdx >= 0) {
          registry[existingIdx] = {
            ...registry[existingIdx],
            name: formattedName || registry[existingIdx].name,
            balance: existingBalance !== undefined ? existingBalance : registry[existingIdx].balance,
            gender: userGender,
            avatar: userAvatar || registry[existingIdx].avatar,
            pagoMovilPhone: userPagoPhone || registry[existingIdx].pagoMovilPhone,
            pagoMovilBank: userPagoBank || registry[existingIdx].pagoMovilBank,
            pagoMovilId: userPagoId || registry[existingIdx].pagoMovilId,
            lastActiveAt: Date.now(),
            isOnline: true,
          };
          targetUserData = registry[existingIdx];
        } else {
          registry.push(userRegistryData);
        }
        localStorage.setItem("chamo_registered_users_v2", JSON.stringify(registry));

        // Save immediately to Supabase so all players on all devices see this real user!
        saveUserToSupabase(targetUserData).catch((err) => {
          console.warn("Notice saving user to Supabase:", err);
        });
      } catch (err) {
        console.error("Error saving to registered users:", err);
      }
    }

    // =========================================================================
    // SUPABASE AUTHENTICATION & DATA SYNC
    // =========================================================================
    if (!isAdmin) {
      if (tab === "register") {
        try {
          const authRes = await signUpWithSupabase(cleanEmail, cleanPass, {
            name: formattedName,
            pagoMovilPhone: userPagoPhone,
            pagoMovilBank: userPagoBank,
            pagoMovilId: userPagoId,
            gender: userGender,
            avatar: userAvatar,
          });

          if (!authRes.success && authRes.error) {
            console.warn("Supabase register note:", authRes.error);
            if (authRes.error.toLowerCase().includes("already registered")) {
              const loginAttempt = await signInWithSupabase(cleanEmail, cleanPass);
              if (!loginAttempt.success) {
                setFormError("Este correo ya está registrado en Supabase. Si es tu cuenta, ingresa en la pestaña 'Iniciar Sesión'.");
                setIsSubmitting(false);
                return;
              }
            } else if (authRes.error.toLowerCase().includes("password")) {
              setFormError(`Contraseña no cumple requisitos: ${authRes.error}`);
              setIsSubmitting(false);
              return;
            }
          }

          // Persist user profile to Supabase database (background non-blocking)
          upsertSupabaseProfile({
            email: cleanEmail,
            name: formattedName,
            role: "PLAYER",
            balance: existingBalance || 0.0,
            avatar: userAvatar,
            gender: userGender,
            pagoMovilPhone: userPagoPhone,
            pagoMovilBank: userPagoBank,
            pagoMovilId: userPagoId,
          }).catch(() => {});
        } catch (supaErr) {
          console.warn("Error registering in Supabase:", supaErr);
        }
      } else {
        // Tab is "login": Authenticate with Supabase
        try {
          const authRes = await signInWithSupabase(cleanEmail, cleanPass);
          if (authRes.success) {
            // Read remote profile data from Supabase!
            try {
              const { data: supaProfile } = await supabase
                .from("profiles")
                .select("*")
                .eq("email", cleanEmail)
                .maybeSingle();

              if (supaProfile) {
                if (supaProfile.name) formattedName = supaProfile.name;
                if (typeof supaProfile.balance === "number") existingBalance = supaProfile.balance;
                if (supaProfile.avatar) userAvatar = supaProfile.avatar;
                if (supaProfile.pago_movil_phone) userPagoPhone = supaProfile.pago_movil_phone;
                if (supaProfile.pago_movil_bank) userPagoBank = supaProfile.pago_movil_bank;
                if (supaProfile.pago_movil_id) userPagoId = supaProfile.pago_movil_id;
                if (supaProfile.gender) userGender = supaProfile.gender;
              }
            } catch (readErr) {
              console.warn("Supabase profile read notice:", readErr);
            }
          } else {
            console.warn("Supabase login notice:", authRes.error);
            // Si el usuario existe localmente (jugador recurrente antes de Supabase), permitir acceso
            const localRegistry = localStorage.getItem("chamo_registered_users_v2");
            const isLocal = localRegistry && localRegistry.toLowerCase().includes(cleanEmail);
            if (!isLocal) {
              if (authRes.error && authRes.error.toLowerCase().includes("invalid login credentials")) {
                setFormError("Correo o contraseña incorrectos. Si aún no tienes cuenta en Supabase, pulsa 'Crear Cuenta' para registrarte.");
                setIsSubmitting(false);
                return;
              } else if (authRes.error) {
                setFormError(`Aviso de Supabase: ${authRes.error}`);
                setIsSubmitting(false);
                return;
              }
            }
          }
        } catch (supaLoginErr) {
          console.warn("Supabase login exception:", supaLoginErr);
        }
      }
    }

    const user: UserProfile = {
      email: cleanEmail,
      name: formattedName,
      role: isAdmin ? "ADMIN" : "PLAYER",
      balance: isAdmin ? null : existingBalance || 0.0,
      avatar: userAvatar,
      gender: userGender,
      pagoMovilPhone: userPagoPhone || undefined,
      pagoMovilBank: userPagoBank || undefined,
      pagoMovilId: userPagoId || undefined,
      selectedCharacterId: storedCharId,
      unlockedCharacterIds: storedUnlocked,
      stats: {
        cartones: 0,
        bingos: 0,
        victorias: 0,
      },
    };

    onLoginSuccess(user);
    setIsSubmitting(false);
  } catch (err) {
    console.error("Login process error:", err);
    setIsSubmitting(false);
  }
};

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-slate-950/95 backdrop-blur-md p-3 sm:p-6 flex items-start sm:items-center justify-center min-h-screen py-4 sm:py-8">
      <div className="bg-slate-900 border-2 border-red-700/70 rounded-3xl max-w-md w-full p-5 sm:p-7 flex flex-col gap-4 shadow-2xl relative my-auto max-h-[94vh] overflow-y-auto overscroll-contain">
        {/* Christmas fairy lights on the modal card */}
        <ChristmasLights count={16} compact={true} className="-mt-3 mb-1" />

        {/* Christmas festive background blur decoration */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-red-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-emerald-600/25 rounded-full blur-3xl pointer-events-none" />

        {/* Brand & Pure App Logo with Christmas Trees flanking */}
        <div className="text-center flex flex-col items-center gap-1.5 relative z-10">
          <div className="flex items-center justify-center gap-3 w-full">
            <ChristmasTree size="compact" interactive={true} className="hidden xs:inline-flex" />
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-yellow-400 to-amber-600 p-1 shadow-2xl border-2 border-yellow-300 overflow-hidden flex items-center justify-center shrink-0">
              <img
                src={BINGO_LOGO_SRC}
                alt="Logo Bingo el Chamo"
                className="w-full h-full object-cover rounded-[14px] sm:rounded-[20px]"
                referrerPolicy="no-referrer"
              />
            </div>
            <ChristmasTree size="compact" interactive={true} className="hidden xs:inline-flex" />
          </div>

          <h2 className="font-fredoka text-xl sm:text-2xl font-black text-yellow-300 tracking-wide">
            Bingo el Chamo Navideño
          </h2>
          <p className="text-[11px] sm:text-xs text-amber-200/90 flex items-center gap-1 font-fredoka">
            🎄 Sala Oficial • Temporada Navideña • Tómbola en Vivo 🎅
          </p>
        </div>

        {/* Supabase Cloud Status Pill */}
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-[11px] text-emerald-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono font-bold">Supabase Cloud</span>
          </div>
          <span className="text-[10px] text-emerald-400/80 font-sans">Auth & Lectura Activos</span>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => {
              setTab("login");
              setFormError(null);
            }}
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
            onClick={() => {
              setTab("register");
              setFormError(null);
            }}
            className={`flex-1 py-2 text-xs font-fredoka font-bold rounded-xl transition cursor-pointer ${
              tab === "register"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Error and Success Inline Notifications */}
        {formError && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-3 text-xs text-red-200 flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="flex-1 leading-snug">{formError}</span>
            <button
              type="button"
              onClick={() => setFormError(null)}
              className="text-red-400 hover:text-white cursor-pointer font-bold text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {formSuccess && (
          <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-2xl p-3 text-xs text-emerald-200 flex items-start gap-2.5 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="flex-1 leading-snug">{formSuccess}</span>
          </div>
        )}

        {/* Form with responsive layout */}
        <form onSubmit={handleLogin} className="flex flex-col gap-3 relative z-10 pb-2">
          {tab === "register" && (
            <>
              {/* Foto de Perfil / Avatar Uploader */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <Camera size={13} className="text-yellow-400" />
                    <span>Foto de Perfil (Opcional):</span>
                  </label>
                  {avatar && (
                    <button
                      type="button"
                      onClick={() => setAvatar(null)}
                      className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={11} /> Quitar
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Circular Avatar Preview */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-lg flex items-center justify-center overflow-hidden">
                      <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center overflow-hidden">
                        {avatar ? (
                          avatar.startsWith("data:") || avatar.startsWith("http") ? (
                            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl">{avatar}</span>
                          )
                        ) : (
                          <User size={22} className="text-slate-500" />
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 bg-yellow-400 hover:bg-yellow-300 text-slate-950 p-1.5 rounded-full shadow-md border border-slate-900 cursor-pointer"
                      title="Subir foto desde dispositivo o cámara"
                    >
                      <Camera size={11} />
                    </button>
                  </div>

                  {/* Upload buttons & Presets */}
                  <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isCompressing}
                      className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/60 text-slate-200 hover:text-white py-1.5 px-2 rounded-xl text-[11px] font-fredoka font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                    >
                      <Upload size={12} className="text-yellow-400 shrink-0" />
                      <span className="truncate">{isCompressing ? "Cargando..." : "Subir Foto"}</span>
                    </button>

                    {/* Quick preset emojis */}
                    <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none">
                      <span className="text-[10px] text-slate-400 shrink-0">Emojis:</span>
                      {PRESET_AVATARS.slice(0, 6).map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setAvatar(preset.emoji)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 transition cursor-pointer ${
                            avatar === preset.emoji
                              ? "bg-amber-500/40 border border-yellow-400"
                              : "bg-slate-900 hover:bg-slate-800 border border-slate-800"
                          }`}
                          title={preset.name}
                        >
                          {preset.emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFile}
                  className="hidden"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                  Nombre o Apodo del Jugador
                </label>
                <input
                  type="text"
                  placeholder="Ej: Carlos Gómez (o La Niñita)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-yellow-300 w-full outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-[11px] font-bold text-slate-300 mb-1 block">
              Correo Electrónico (Gmail)
            </label>
            <input
              type="email"
              required
              placeholder="usuario@gmail.com"
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

          {tab === "register" && (
            <>
              {/* Datos de Pago Móvil Obligatorios */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-amber-500/30 flex flex-col gap-2.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <label className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                    <span>📱 Pago Móvil para Recargas y Premios:</span>
                  </label>
                  <span className="text-[9px] bg-amber-500/20 text-yellow-300 px-2 py-0.5 rounded-full border border-amber-400/40 font-bold">
                    Requerido
                  </span>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-300 mb-1 block">
                    Número de Celular / Pago Móvil *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej: 04121234567 / 04149876543"
                    value={pagoMovilPhone}
                    onChange={(e) => setPagoMovilPhone(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-yellow-300 w-full outline-none focus:border-amber-400 font-mono"
                  />
                  <p className="text-[9px] text-slate-400 mt-0.5">
                    Se registrará para que el administrador verifique tus pagos y te transfiera los premios.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 mb-1 block">
                      Banco del Pago Móvil
                    </label>
                    <select
                      value={pagoMovilBank}
                      onChange={(e) => setPagoMovilBank(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-xs text-yellow-300 w-full outline-none focus:border-amber-400 font-mono cursor-pointer"
                    >
                      {VENEZUELA_BANKS.map((b) => (
                        <option key={b} value={b} className="bg-slate-900 text-white">
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-300 mb-1 block">
                      Cédula de Identidad (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: V-12345678"
                      value={pagoMovilId}
                      onChange={(e) => setPagoMovilId(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-yellow-300 w-full outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Gender selection for the animated character & store */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Elige tu Sexo (Masculino o Femenino):</span>
                  <span className="text-[10px] text-amber-400 font-normal">Muñecos en tienda según tu sexo</span>
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
                    <span>🧢 Varón (Masculino)</span>
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
                    <span>👗 Hembra (Femenino)</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-snug">
                ℹ️ Todos los jugadores inician con <strong className="text-yellow-400">saldo 0.00 VES</strong> hasta que soliciten y se les apruebe una recarga vía Pago Móvil.
              </div>
            </>
          )}

          {/* Botón Principal de Entrada */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-500 disabled:opacity-60 text-slate-950 font-fredoka font-black py-3.5 px-4 rounded-2xl shadow-xl transition active:scale-95 cursor-pointer text-sm tracking-wide border border-yellow-300/40 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin text-slate-950" />
                <span>Autenticando en Supabase...</span>
              </>
            ) : (
              <>
                <span>{tab === "login" ? "Entrar al Juego" : "Crear Cuenta de Jugador"}</span>
                <span className="text-base">→</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
