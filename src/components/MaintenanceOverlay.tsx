import React from "react";
import { Wrench, ShieldCheck, AlertTriangle, LogOut, Lock, RefreshCw } from "lucide-react";
import { BINGO_LOGO_SRC } from "../constants/logo";

interface Props {
  onLogout?: () => void;
  onAdminLogin?: () => void;
}

export const MaintenanceOverlay: React.FC<Props> = ({ onLogout, onAdminLogin }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/60 border-2 border-amber-500/70 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 flex flex-col items-center text-center gap-5 overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-20 -left-20 w-52 h-52 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-52 h-52 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Logo and Icon Header */}
        <div className="relative flex flex-col items-center gap-3">
          <img
            src={BINGO_LOGO_SRC}
            alt="Bingo El Chamo"
            className="w-24 h-24 object-contain drop-shadow-xl animate-pulse"
          />
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 shadow-lg shadow-amber-950/60">
            <Wrench size={30} className="animate-spin" style={{ animationDuration: "8s" }} />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 self-center bg-amber-500/20 text-yellow-300 border border-amber-400/50 px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
            <AlertTriangle size={14} className="text-yellow-400" />
            <span>Mantenimiento del Sistema Activo</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-fredoka font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400">
            ¡Estamos en Mantenimiento!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            El administrador ha activado el mantenimiento programado de la plataforma para realizar mejoras, ajustes de seguridad y optimizaciones en los servidores.
          </p>
        </div>

        {/* Guarantee Info Card */}
        <div className="w-full bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 flex flex-col gap-2.5 text-left">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
            <ShieldCheck size={16} className="shrink-0" />
            <span>Tus datos y fondos están 100% seguros:</span>
          </div>
          <ul className="text-[11px] text-slate-300 space-y-1.5 list-disc list-inside">
            <li>Tu saldo acumulado y cartones quedan intactos y respaldados.</li>
            <li>La sala de juego se reanudará en cuanto el administrador finalice las labores.</li>
            <li>No es necesario volver a registrarte.</li>
          </ul>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span>Esperando que el administrador reabra la sala...</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 w-full flex-wrap pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-xs font-fredoka font-bold transition cursor-pointer border border-slate-700 active:scale-95"
          >
            <RefreshCw size={14} />
            <span>Verificar Estado</span>
          </button>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-2 bg-red-950/70 hover:bg-red-900 text-red-200 border border-red-800 px-4 py-2.5 rounded-xl text-xs font-fredoka font-bold transition cursor-pointer active:scale-95"
            >
              <LogOut size={14} />
              <span>Cerrar Sesión</span>
            </button>
          )}

          {onAdminLogin && (
            <button
              type="button"
              onClick={onAdminLogin}
              className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-yellow-400 transition cursor-pointer underline underline-offset-4"
            >
              <Lock size={12} />
              <span>Acceso Administrador</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
