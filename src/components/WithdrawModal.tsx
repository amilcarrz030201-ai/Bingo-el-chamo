import React, { useState } from "react";
import { X, ArrowDownRight } from "lucide-react";

interface Props {
  isOpen: boolean;
  userBalance: number;
  onClose: () => void;
  onSubmit: (data: { transactionId: string; monto: number; datos: string }) => void;
}

export const WithdrawModal: React.FC<Props> = ({
  isOpen,
  userBalance,
  onClose,
  onSubmit,
}) => {
  const [transactionId] = useState<string>(() => `TRX-RET-${Math.floor(100000 + Math.random() * 900000)}`);
  const [monto, setMonto] = useState("");
  const [datos, setDatos] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(monto);
    if (isNaN(num) || num <= 0) {
      alert("Por favor ingresa un monto válido a retirar.");
      return;
    }
    if (num > userBalance) {
      alert("No puedes retirar más de tu saldo disponible actual.");
      return;
    }
    if (!datos.trim()) {
      alert("Por favor ingresa tus datos de Pago Móvil para transferirte.");
      return;
    }

    onSubmit({ transactionId, monto: num, datos: datos.trim() });
    setMonto("");
    setDatos("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-blue-500/40 rounded-3xl max-w-md w-full p-6 flex flex-col gap-4 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex flex-col">
            <h3 className="font-fredoka text-base sm:text-lg font-bold text-blue-300 flex items-center gap-2">
              <span className="p-1 rounded-lg bg-blue-950 text-blue-400">💸</span>
              Retirar Fondos
            </h3>
            <div className="text-[10px] text-blue-300 font-mono mt-0.5">
              ID de Retiro: <strong className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{transactionId}</strong>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-xl transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">Saldo Disponible:</span>
          <span className="font-fredoka text-lg font-black text-yellow-300">
            {userBalance.toFixed(2)} VES
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="text-[11px] font-bold text-slate-300 mb-1 block">
              Monto en VES a Retirar *
            </label>
            <input
              type="number"
              step="0.01"
              min="1"
              max={userBalance}
              required
              placeholder="Ej. 100.00"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 w-full outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-300 mb-1 block">
              Datos de tu Pago Móvil (Banco, Cédula, Teléfono) *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Ej: Banco Mercantil, V-18.765.432, 0414-9876543"
              value={datos}
              onChange={(e) => setDatos(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 w-full outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={userBalance <= 0}
            className="mt-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-fredoka font-bold py-3 rounded-2xl shadow-lg transition active:scale-95 cursor-pointer text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Solicitar Retiro
          </button>
        </form>
      </div>
    </div>
  );
};
