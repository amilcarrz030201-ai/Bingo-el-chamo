import React, { useEffect } from "react";
import { UserProfile } from "../types";
import { LogOut, AlertTriangle, X, Wallet, Shield } from "lucide-react";

interface Props {
  isOpen: boolean;
  user: UserProfile | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const LogoutConfirmModal: React.FC<Props> = ({
  isOpen,
  user,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen || !user) return null;

  const isAdmin = user.role === "ADMIN";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-confirm-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onClick={onCancel}
    >
      <div
        className="bg-slate-900 border-2 border-red-500/50 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col gap-4 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow decoration */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-600/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition cursor-pointer"
          title="Cerrar ventana"
        >
          <X size={20} />
        </button>

        {/* Header Icon + Question */}
        <div className="flex items-center gap-3.5 border-b border-slate-800 pb-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500/20 to-rose-600/20 border border-red-500/40 flex items-center justify-center text-rose-400 shadow-inner shrink-0">
            <LogOut size={24} />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-bold flex items-center gap-1">
              <AlertTriangle size={13} /> Confirmar salida
            </span>
            <h3
              id="logout-confirm-title"
              className="text-lg sm:text-xl font-fredoka font-bold text-white tracking-wide leading-tight"
            >
              ¿Estás seguro de que deseas salir?
            </h3>
          </div>
        </div>

        {/* User Card info */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || "Usuario"}
                className="w-11 h-11 rounded-xl object-cover border border-amber-400/50 shadow shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-yellow-300 font-bold font-fredoka text-lg shadow shrink-0">
                {isAdmin ? "👑" : (user.name || user.email).charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-fredoka font-bold text-sm text-yellow-300 truncate">
                {user.name || (isAdmin ? "Administrador Oficial" : "Jugador")}
              </p>
              <p className="text-xs text-slate-400 font-mono truncate">{user.email}</p>
            </div>
          </div>

          {isAdmin ? (
            <span className="text-[10px] font-mono bg-red-950/80 text-rose-300 border border-rose-800/80 px-2 py-1 rounded-xl font-bold flex items-center gap-1 shrink-0">
              <Shield size={12} /> Admin
            </span>
          ) : (
            <div className="bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-xl text-right shrink-0">
              <span className="text-[10px] text-emerald-400 flex items-center justify-end gap-1 font-sans">
                <Wallet size={11} /> Saldo
              </span>
              <span className="text-xs font-mono font-black text-emerald-300">
                {(user.balance ?? 0).toLocaleString("es-VE", { minimumFractionDigits: 2 })} VES
              </span>
            </div>
          )}
        </div>

        {/* Informative message */}
        <p className="text-xs text-slate-300 leading-relaxed">
          {isAdmin ? (
            <>
              Se cerrará la sesión de la consola de control maestro de la tómbola. Para volver a acceder deberás introducir nuevamente tus credenciales de administrador.
            </>
          ) : (
            <>
              Tu saldo en bolívares, tus cartones y tus partidas ganadas quedarán completamente guardados para cuando decidas iniciar sesión otra vez.
            </>
          )}
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-fredoka font-bold py-2.5 px-4 rounded-2xl border border-slate-700 transition cursor-pointer text-sm text-center"
          >
            {isAdmin ? "Cancelar" : "Seguir Jugando"}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 active:scale-95 text-white font-fredoka font-bold py-2.5 px-4 rounded-2xl border border-red-400 shadow-lg shadow-red-950/60 transition cursor-pointer text-sm flex items-center justify-center gap-2"
          >
            <LogOut size={16} />
            <span>Sí, Salir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
