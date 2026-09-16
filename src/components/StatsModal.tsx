import React from "react";
import { X, BarChart3, Trophy, Ticket, Dice5 } from "lucide-react";
import { UserProfile } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  drawnBallsCount: number;
}

export const StatsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  user,
  drawnBallsCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-md w-full p-6 flex flex-col gap-4 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-fredoka text-base sm:text-lg font-bold text-yellow-300 flex items-center gap-2">
            <BarChart3 size={20} className="text-amber-400" />
            Tus Estadísticas Navideñas
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-xl transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col items-center text-center">
            <Ticket size={24} className="text-purple-400 mb-1" />
            <span className="text-xs text-slate-400">Cartones Comprados</span>
            <span className="font-fredoka text-2xl font-black text-amber-400 mt-0.5">
              {user.stats.cartones}
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col items-center text-center">
            <Trophy size={24} className="text-emerald-400 mb-1" />
            <span className="text-xs text-slate-400">Bingos Ganados</span>
            <span className="font-fredoka text-2xl font-black text-emerald-400 mt-0.5">
              {user.stats.bingos}
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col items-center text-center col-span-2">
            <Dice5 size={24} className="text-yellow-400 mb-1" />
            <span className="text-xs text-slate-400">Bolas Cantadas en la Sala</span>
            <span className="font-fredoka text-2xl font-black text-yellow-300 mt-0.5 font-mono">
              {drawnBallsCount} / 75
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
