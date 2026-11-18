import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ToastMessage } from "../types";
import {
  Trophy,
  X,
  AlertTriangle,
  BellRing,
  Sparkles,
  Info,
  CheckCircle2,
} from "lucide-react";

interface Props {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<Props> = ({ toasts, onDismiss }) => {
  const getBallColor = (letter?: string) => {
    switch (letter) {
      case "B":
        return "from-red-500 to-red-700 text-white border-red-400";
      case "I":
        return "from-amber-400 to-amber-600 text-slate-950 border-amber-300";
      case "N":
        return "from-emerald-500 to-emerald-700 text-white border-emerald-400";
      case "G":
        return "from-blue-500 to-blue-700 text-white border-blue-400";
      case "O":
        return "from-purple-500 to-purple-700 text-white border-purple-400";
      default:
        return "from-yellow-400 to-amber-500 text-slate-950 border-yellow-300";
    }
  };

  return (
    <aside
      id="toast-notification-region"
      aria-label="Notificaciones del juego"
      className="fixed top-16 sm:top-20 right-3 sm:right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const isBall = toast.type === "ball";
          const isBingoClaim = toast.type === "bingo_claim";
          const isGameWon = toast.type === "game_won";
          const isMissedWin = toast.type === "missed_win";
          const isWarning = toast.type === "warning";

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.92, x: 20 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 30, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 450, damping: 30 }}
              className={`pointer-events-auto shadow-2xl rounded-2xl border backdrop-blur-md p-3.5 flex items-start gap-3 transition-all duration-200 overflow-hidden relative ${
                isGameWon
                  ? "bg-gradient-to-r from-yellow-950/95 via-amber-900/90 to-slate-900/95 border-yellow-400/80 shadow-yellow-500/20 text-yellow-100 ring-2 ring-yellow-400/50"
                  : isBingoClaim
                  ? "bg-gradient-to-r from-purple-950/95 to-slate-900/95 border-purple-500/80 shadow-purple-500/20 text-purple-100"
                  : isMissedWin
                  ? "bg-gradient-to-r from-red-950/95 to-slate-900/95 border-red-500/80 shadow-red-500/20 text-red-100 ring-1 ring-red-400/40"
                  : isWarning
                  ? "bg-gradient-to-r from-orange-950/95 to-slate-900/95 border-orange-500/80 text-orange-100"
                  : isBall
                  ? "bg-slate-900/95 border-slate-700/80 text-slate-100 shadow-slate-950/40"
                  : "bg-slate-900/95 border-emerald-500/60 text-emerald-100"
              }`}
            >
              {/* Left visual icon or Ball badge */}
              {isBall && toast.ballNumber ? (
                <div
                  className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${getBallColor(
                    toast.ballLetter
                  )} border-2 shadow-lg flex flex-col items-center justify-center shrink-0 font-fredoka font-black leading-none animate-bounce`}
                >
                  <span className="text-[10px] uppercase opacity-90">
                    {toast.ballLetter}
                  </span>
                  <span className="text-base tracking-tighter">
                    {toast.ballNumber}
                  </span>
                </div>
              ) : isGameWon ? (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-yellow-400 to-amber-500 text-slate-950 border border-yellow-200 flex items-center justify-center shrink-0 shadow-lg animate-pulse">
                  <Trophy size={20} className="stroke-[2.5]" />
                </div>
              ) : isBingoClaim ? (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white border border-purple-300 flex items-center justify-center shrink-0 shadow-lg">
                  <Sparkles size={20} />
                </div>
              ) : isMissedWin ? (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-500 to-rose-600 text-white border border-red-300 flex items-center justify-center shrink-0 shadow-lg">
                  <AlertTriangle size={20} />
                </div>
              ) : isWarning ? (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-lg">
                  <BellRing size={20} />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-lg">
                  <CheckCircle2 size={20} />
                </div>
              )}

              {/* Text content */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="font-fredoka font-bold text-xs sm:text-sm tracking-tight leading-tight">
                    {toast.title}
                  </h4>
                  {isGameWon && (
                    <span className="bg-yellow-400 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded-md uppercase tracking-wider">
                      ¡Victoria!
                    </span>
                  )}
                  {isMissedWin && (
                    <span className="bg-red-500 text-white font-black text-[9px] px-1.5 py-0.2 rounded-md uppercase tracking-wider">
                      Bola Pasada
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300/90 mt-0.5 leading-snug">
                  {toast.message}
                </p>
              </div>

              {/* Dismiss Button */}
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition shrink-0 cursor-pointer"
                title="Cerrar notificación"
              >
                <X size={15} />
              </button>

              {/* Subtle top indicator bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${
                  isGameWon
                    ? "bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500"
                    : isBingoClaim
                    ? "bg-gradient-to-r from-purple-400 to-pink-500"
                    : isMissedWin
                    ? "bg-gradient-to-r from-red-500 to-rose-600"
                    : isBall
                    ? "bg-gradient-to-r from-amber-400 to-yellow-500"
                    : "bg-emerald-400"
                }`}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </aside>
  );
};
