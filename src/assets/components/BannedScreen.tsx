import React from "react";
import { ShieldAlert, Ban, LogOut, RefreshCw, Mail, AlertOctagon } from "lucide-react";
import { BINGO_LOGO_SRC } from "../constants/logo";

interface Props {
  userEmail: string;
  userName?: string;
  bannedReason?: string;
  bannedAt?: string;
  onLogout: () => void;
}

export const BannedScreen: React.FC<Props> = ({
  userEmail,
  userName,
  bannedReason,
  bannedAt,
  onLogout,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-950 via-slate-900 to-red-950/80 border-2 border-red-500/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 flex flex-col items-center text-center gap-5 overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-rose-700/20 rounded-full blur-3xl pointer-events-none" />

        {/* Logo and Ban Icon Header */}
        <div className="relative flex flex-col items-center gap-2">
          <img
            src={BINGO_LOGO_SRC}
            alt="Bingo El Chamo"
            className="w-20 h-20 object-contain drop-shadow-xl opacity-80 grayscale-[30%]"
          />
          <div className="w-16 h-16 rounded-2xl bg-red-600/20 border-2 border-red-500 flex items-center justify-center text-red-400 shadow-xl shadow-red-950/80 ring-4 ring-red-500/30">
            <Ban size={36} className="text-red-400 animate-pulse" />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 self-center bg-red-950/80 text-red-300 border border-red-500/60 px-4 py-1 rounded-full text-xs font-mono font-black uppercase tracking-wider shadow">
            <AlertOctagon size={14} className="text-red-400" />
            <span>ESTADO: CUENTA BANEADA</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-fredoka font-black text-red-400">
            Tu Cuenta Ha Sido Baneada
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            La administración de <strong className="text-white">Bingo El Chamo</strong> ha suspendido el acceso de esta cuenta a la plataforma de juego.
          </p>
        </div>

        {/* Details Card */}
        <div className="w-full bg-slate-950/90 border border-red-900/80 rounded-2xl p-4 flex flex-col gap-2.5 text-left text-xs font-mono">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Usuario:</span>
            <span className="font-bold text-white truncate max-w-[220px]">
              {userName || userEmail.split("@")[0]}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Correo Electrónico:</span>
            <span className="font-bold text-yellow-300 truncate max-w-[220px]">
              {userEmail}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Motivo:</span>
            <span className="font-bold text-red-300 text-right">
              {bannedReason || "Suspensión administrativa por infracción de reglas"}
            </span>
          </div>
          {bannedAt && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Fecha de Sanción:</span>
              <span className="text-slate-300">{bannedAt}</span>
            </div>
          )}
        </div>

        {/* Explanatory Message */}
        <div className="bg-red-950/30 border border-red-800/40 rounded-xl p-3 text-left flex items-start gap-2.5 text-[11px] text-slate-300">
          <ShieldAlert size={18} className="text-red-400 shrink-0 mt-0.5" />
          <p>
            No puedes participar en partidas, marcar cartones ni realizar transacciones mientras la cuenta permanezca baneada. Si el administrador decide <strong>quitar el baneo</strong>, tu acceso se restaurará automáticamente.
          </p>
        </div>

        {/* Live sync indicator */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>Sincronizando estado con el servidor en tiempo real...</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 w-full flex-wrap pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-xs font-fredoka font-bold transition cursor-pointer border border-slate-700 active:scale-95"
          >
            <RefreshCw size={14} />
            <span>Comprobar Estado</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-fredoka font-black px-5 py-2.5 rounded-xl text-xs transition cursor-pointer shadow-lg shadow-red-950/70 border border-red-400 active:scale-95"
          >
            <LogOut size={14} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
};
