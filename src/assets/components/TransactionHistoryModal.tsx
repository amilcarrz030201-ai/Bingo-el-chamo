import React, { useEffect } from "react";
import { HistoryRecord, RechargeRequest, WithdrawRequest } from "../types";
import { TransactionHistoryCard } from "./TransactionHistoryCard";
import { X, Receipt } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryRecord[];
  rechargeRequests?: RechargeRequest[];
  withdrawRequests?: WithdrawRequest[];
  userEmail: string;
}

export const TransactionHistoryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  history,
  rechargeRequests = [],
  withdrawRequests = [],
  userEmail,
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header Bar */}
        <div className="bg-slate-950/95 border-b border-amber-500/30 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-yellow-400 border border-amber-500/40 flex items-center justify-center shadow">
              <Receipt size={20} />
            </div>
            <div>
              <h3 className="font-fredoka text-base sm:text-lg font-bold text-yellow-300">
                Historial de Transacciones
              </h3>
              <p className="text-xs text-slate-400">
                Compras de cartones, recargas por Pago Móvil, retiros y premios
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer border border-slate-700"
            title="Cerrar historial"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body: TransactionHistoryCard */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <TransactionHistoryCard
            history={history}
            rechargeRequests={rechargeRequests}
            withdrawRequests={withdrawRequests}
            userEmail={userEmail}
          />
        </div>
      </div>
    </div>
  );
};
