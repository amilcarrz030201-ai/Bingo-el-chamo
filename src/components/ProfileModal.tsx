import React, { useState, useRef, useEffect } from "react";
import { UserProfile } from "../types";
import { PRESET_AVATARS, compressImageFile } from "../utils/imageUtils";
import {
  X,
  Camera,
  Upload,
  User,
  Check,
  Sparkles,
  Trash2,
  Image as ImageIcon,
  AlertCircle,
  Smile,
  Phone,
  Building,
} from "lucide-react";

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

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSaveProfile: (updates: {
    name?: string;
    avatar?: string;
    pagoMovilPhone?: string;
    pagoMovilBank?: string;
    pagoMovilId?: string;
  }) => void;
}

export const ProfileModal: React.FC<Props> = ({
  isOpen,
  onClose,
  user,
  onSaveProfile,
}) => {
  const [activeTab, setActiveTab] = useState<"upload" | "presets">("upload");
  const [previewAvatar, setPreviewAvatar] = useState<string | undefined>(user.avatar);
  const [userName, setUserName] = useState<string>(user.name || user.email.split("@")[0]);
  const [pagoMovilPhone, setPagoMovilPhone] = useState<string>(user.pagoMovilPhone || "");
  const [pagoMovilBank, setPagoMovilBank] = useState<string>(
    user.pagoMovilBank || "Banco de Venezuela (0102)"
  );
  const [pagoMovilId, setPagoMovilId] = useState<string>(user.pagoMovilId || "");
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSavedRecently, setIsSavedRecently] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state if user changes
  useEffect(() => {
    if (isOpen) {
      setPreviewAvatar(user.avatar);
      setUserName(user.name || user.email.split("@")[0]);
      setPagoMovilPhone(user.pagoMovilPhone || "");
      setPagoMovilBank(user.pagoMovilBank || "Banco de Venezuela (0102)");
      setPagoMovilId(user.pagoMovilId || "");
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMessage(null);
    setIsCompressing(true);

    try {
      const compressedDataUrl = await compressImageFile(file, 280, 0.85);
      setPreviewAvatar(compressedDataUrl);
    } catch (err: any) {
      setErrorMessage(err?.message || "No se pudo cargar la imagen. Intenta con otra.");
    } finally {
      setIsCompressing(false);
      // Reset input value so same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setErrorMessage(null);
    setIsCompressing(true);

    try {
      const compressedDataUrl = await compressImageFile(file, 280, 0.85);
      setPreviewAvatar(compressedDataUrl);
    } catch (err: any) {
      setErrorMessage(err?.message || "Error al procesar la imagen arrastrada.");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSelectPreset = (preset: (typeof PRESET_AVATARS)[0]) => {
    setPreviewAvatar(preset.emoji);
    setErrorMessage(null);
  };

  const handleRemoveAvatar = () => {
    setPreviewAvatar("");
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = userName.trim();
    const cleanPhone = pagoMovilPhone.trim();
    const cleanId = pagoMovilId.trim();

    onSaveProfile({
      name: cleanName || user.email.split("@")[0],
      avatar: previewAvatar || undefined,
      pagoMovilPhone: cleanPhone || undefined,
      pagoMovilBank: pagoMovilBank || undefined,
      pagoMovilId: cleanId || undefined,
    });
    setIsSavedRecently(true);
    setTimeout(() => {
      setIsSavedRecently(false);
      onClose();
    }, 700);
  };

  const isCustomPhoto = previewAvatar && (previewAvatar.startsWith("data:") || previewAvatar.startsWith("http"));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 flex flex-col gap-4 overflow-hidden max-h-[90vh]">
        {/* Glow effect */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Camera size={18} />
            </div>
            <div>
              <h2 className="font-fredoka text-base sm:text-lg font-bold text-yellow-300">
                Foto de Perfil & Datos
              </h2>
              <p className="text-[11px] text-slate-400">
                Personaliza cómo te ven los demás jugadores en la sala
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition cursor-pointer"
            title="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current Avatar Preview & Quick Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 bg-slate-950/70 p-4 rounded-2xl border border-slate-800/90 relative z-10">
          <div className="relative group">
            {/* Circular frame with ring */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-1 shadow-xl flex items-center justify-center overflow-hidden">
              <div className="w-full h-full bg-slate-900 rounded-full overflow-hidden flex items-center justify-center text-3xl">
                {isCompressing ? (
                  <div className="flex flex-col items-center gap-1 text-[10px] text-amber-400 font-mono animate-pulse">
                    <Sparkles size={20} className="animate-spin" />
                    <span>Optimizando...</span>
                  </div>
                ) : isCustomPhoto ? (
                  <img
                    src={previewAvatar}
                    alt="Foto de perfil"
                    className="w-full h-full object-cover"
                  />
                ) : previewAvatar ? (
                  <span className="text-4xl">{previewAvatar}</span>
                ) : (
                  <User size={38} className="text-slate-500" />
                )}
              </div>
            </div>

            {/* Camera badge to trigger upload */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-yellow-400 hover:bg-yellow-300 text-slate-950 p-2 rounded-full shadow-lg border-2 border-slate-900 transition active:scale-95 cursor-pointer"
              title="Subir foto desde tu dispositivo o cámara"
            >
              <Camera size={14} />
            </button>
          </div>

          <div className="flex flex-col items-center sm:items-start gap-1 text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-fredoka">
              {user.role === "ADMIN" ? "👑 Perfil Administrador" : "👤 Perfil de Jugador"}
            </span>
            <span className="text-sm font-fredoka font-bold text-white max-w-[200px] truncate">
              {userName || user.email}
            </span>
            <span className="text-[11px] text-slate-400 font-mono truncate max-w-[200px]">
              {user.email}
            </span>

            {previewAvatar && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="mt-1 text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 font-fredoka transition cursor-pointer"
              >
                <Trash2 size={12} />
                <span>Quitar foto / Restablecer</span>
              </button>
            )}
          </div>
        </div>

        {/* Error message if any */}
        {errorMessage && (
          <div className="bg-red-950/80 border border-red-800 text-red-200 text-xs p-2.5 rounded-xl flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab Navigation: Subir Foto vs Avatares Temáticos */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 relative z-10">
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-fredoka font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === "upload"
                ? "bg-amber-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Upload size={13} />
            <span>Subir Mi Foto (Dispositivo / Cámara)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("presets")}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-fredoka font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === "presets"
                ? "bg-amber-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Smile size={13} />
            <span>Avatares Temáticos ({PRESET_AVATARS.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="relative z-10 overflow-y-auto max-h-[220px] pr-1">
          {activeTab === "upload" ? (
            <div className="flex flex-col gap-3">
              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-slate-950/50 hover:bg-slate-950/80 rounded-2xl p-5 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition"
              >
                <div className="w-12 h-12 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center">
                  <ImageIcon size={22} />
                </div>
                <div>
                  <p className="text-xs font-fredoka font-bold text-yellow-300">
                    Haz clic aquí o arrastra tu foto
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Soporta fotos desde tu galería, archivos o cámara (JPG, PNG, WEBP)
                  </p>
                </div>
                <span className="text-[10px] bg-slate-900 border border-slate-800 text-amber-400/90 font-mono px-2 py-0.5 rounded-full">
                  ✓ Optimización automática liviana
                </span>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            /* Presets Gallery */
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {PRESET_AVATARS.map((preset) => {
                const isSelected = previewAvatar === preset.emoji;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2 rounded-2xl border flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                      isSelected
                        ? "bg-amber-500/30 border-yellow-400 ring-2 ring-yellow-400/50 shadow"
                        : "bg-slate-950 border-slate-800 hover:border-amber-500/50"
                    }`}
                    title={preset.name}
                  >
                    <span className="text-2xl">{preset.emoji}</span>
                    <span className="text-[9px] font-fredoka text-slate-300 truncate w-full text-center">
                      {preset.name.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Display Name Input */}
        <div className="relative z-10 pt-2 border-t border-slate-800">
          <label className="text-[11px] font-bold text-slate-300 mb-1 block">
            Nombre Visible en la Sala:
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Ej: Chamo Ganador"
            maxLength={25}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-yellow-300 font-mono outline-none focus:border-amber-500 transition"
          />
        </div>

        {/* Pago Móvil Editable para Recargas y Premios */}
        <div className="relative z-10 pt-2 border-t border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
              <Phone size={13} className="text-yellow-400" />
              <span>Registrar / Modificar Pago Móvil:</span>
            </label>
            <span
              className={`text-[9px] px-2 py-0.5 rounded-full font-bold font-mono border ${
                pagoMovilPhone.trim()
                  ? "bg-emerald-950/80 text-emerald-300 border-emerald-800"
                  : "bg-amber-950/80 text-amber-300 border-amber-800"
              }`}
            >
              {pagoMovilPhone.trim() ? "📱 Registrado" : "⚠️ Sin Registrar"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-300 mb-1 block">
                Número de Celular *
              </label>
              <input
                type="tel"
                placeholder="Ej: 04121234567"
                value={pagoMovilPhone}
                onChange={(e) => setPagoMovilPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-yellow-300 font-mono outline-none focus:border-amber-400 transition"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-300 mb-1 block">
                Banco Emisor
              </label>
              <select
                value={pagoMovilBank}
                onChange={(e) => setPagoMovilBank(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-yellow-300 font-mono outline-none focus:border-amber-400 cursor-pointer"
              >
                {VENEZUELA_BANKS.map((b) => (
                  <option key={b} value={b} className="bg-slate-900 text-white">
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-300 mb-1 block">
              Cédula de Identidad (Para transferirte ganancias):
            </label>
            <input
              type="text"
              placeholder="Ej: V-12345678"
              value={pagoMovilId}
              onChange={(e) => setPagoMovilId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-yellow-300 font-mono outline-none focus:border-amber-400 transition"
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800 relative z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-fredoka font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isCompressing}
            className="px-5 py-2 rounded-xl text-xs font-fredoka font-black bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 shadow-lg transition active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            {isSavedRecently ? (
              <>
                <Check size={15} /> ¡Guardado!
              </>
            ) : (
              <>
                <Check size={15} /> Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
