import React, { useState } from "react";
import { X, ArrowDownRight, MessageCircle, AlertCircle, CheckCircle, Sliders } from "lucide-react";
import { OFFICIAL_WHATSAPP } from "../constants/contact";

interface Props {
  isOpen: boolean;
  userBalance: number;
  userName?: string;
  userEmail?: string;
  onClose: () => void;
  onSubmit: (data: { transactionId: string; monto: number; datos: string; userName?: string }) => void;
}

export const WithdrawModal: React.FC<Props> = ({
  isOpen,
  userBalance,
  userName = "Jugador",
  userEmail = "",
  onClose,
  onSubmit,
}) => {
  const [transactionId] = useState<string>(() => `TRX-RET-${Math.floor(100000 + Math.random() * 900000)}`);
  const [monto, setMonto] = useState("");
  const [datos, setDatos] = useState("");

  if (!isOpen) return null;

  const parsedMonto = parseFloat(monto);
  const isOverBalance = !isNaN(parsedMonto) && parsedMonto > userBalance;
  const isInvalidAmount = isNaN(parsedMonto) || parsedMonto <= 0;
  const hasNoBalance = userBalance <= 0;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setMonto(val > 0 ? val.toFixed(2) : "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(monto);
    if (isNaN(num) || num <= 0) {
      alert("Por favor ingresa un monto válido a retirar en VES.");
      return;
    }
    if (num > userBalance) {
      alert(
        `❌ No puedes solicitar este retiro: No llegas al monto solicitado.\n\n` +
        `• Tu Saldo Disponible: ${userBalance.toFixed(2)} VES\n` +
        `• Monto que intentas retirar: ${num.toFixed(2)} VES\n` +
        `• Te faltan: ${(num - userBalance).toFixed(2)} VES\n\n` +
        `Ingresa un monto igual o menor a tu saldo disponible.`
      );
      return;
    }
    if (!datos.trim()) {
      alert("Por favor ingresa tus datos de Pago Móvil (Banco, Cédula y Teléfono) para transferirte.");
      return;
    }

    onSubmit({ transactionId, monto: num, datos: datos.trim(), userName });
    setMonto("");
    setDatos("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-2 sm:p-4 flex items-center justify-center animate-in fade-in duration-200">
      {/* Modal Card with max-height and internal scroll architecture */}
      <div className="bg-slate-900 border border-blue-500/40 rounded-3xl max-w-md w-full max-h-[92dvh] flex flex-col shadow-2xl relative my-auto overflow-hidden">
        
        {/* Fixed Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-4 sm:p-5 shrink-0 bg-slate-900/95">
          <div className="flex flex-col">
            <h3 className="font-fredoka text-base sm:text-lg font-bold text-blue-300 flex items-center gap-2">
              <span className="p-1 rounded-lg bg-blue-950 text-blue-400">💸</span>
              Retirar Fondos de tu Cuenta
            </h3>
            <div className="text-[10px] text-blue-300 font-mono mt-0.5">
              ID de Retiro: <strong className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{transactionId}</strong>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition cursor-pointer"
            title="Cerrar ventana de retiro"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Scrollable Body */}
          <div className="overflow-y-auto overscroll-contain p-4 sm:p-5 flex-1 flex flex-col gap-3.5 custom-scrollbar">
            
            {/* User Balance Card */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex flex-col gap-2 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Saldo Disponible en tu Cuenta:</span>
                <span className="font-fredoka text-xl font-black text-yellow-300 font-mono">
                  {userBalance.toFixed(2)} VES
                </span>
              </div>
              {(userName || userEmail) && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
                  <span className="text-slate-400">Titular:</span>
                  <span className="font-medium text-slate-200 truncate max-w-[240px]">
                    {userName} <span className="text-amber-400 font-mono text-[11px]">({userEmail})</span>
                  </span>
                </div>
              )}
            </div>

            {/* Notice of deduction upon admin approval */}
            <div className="bg-blue-950/40 border border-blue-500/30 rounded-2xl p-3 text-[11px] text-blue-200/90 leading-relaxed shrink-0">
              ℹ️ <strong>Importante:</strong> Tu solicitud de retiro se enviará al Administrador. <strong>Al aprobar el retiro, el Administrador le restará automáticamente a tu cuenta el monto solicitado ({!isInvalidAmount ? `${parsedMonto.toFixed(2)} VES` : "el monto indicado"})</strong> y realizará la transferencia por Pago Móvil. Si la rechaza, no se descontará saldo.
            </div>

            {/* Amount Selection Section */}
            <div className="flex flex-col gap-2 shrink-0">
              <div className="flex items-center justify-between">
                <label htmlFor="withdraw-amount-input" className="text-[11px] font-bold text-slate-300">
                  Monto en VES a Retirar *
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  Máximo: {userBalance.toFixed(2)} VES
                </span>
              </div>

              {/* Quick Percentage Presets */}
              {userBalance > 0 && (
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: "25%", val: (userBalance * 0.25).toFixed(2) },
                    { label: "50%", val: (userBalance * 0.50).toFixed(2) },
                    { label: "75%", val: (userBalance * 0.75).toFixed(2) },
                    { label: "Todo", val: userBalance.toFixed(2) },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setMonto(item.val)}
                      className="py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-400 hover:bg-slate-800 text-blue-300 text-[11px] font-mono font-bold transition cursor-pointer"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Interactive Range Slider Bar (Barra de retiro) */}
              {userBalance > 0 && (
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 flex flex-col gap-1.5 mt-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1 text-slate-300 font-bold">
                      <Sliders size={12} className="text-blue-400" /> Barra deslizadora de retiro:
                    </span>
                    <span className="text-yellow-300 font-bold">
                      {!isInvalidAmount ? `${parsedMonto.toFixed(2)} VES` : "0.00 VES"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max={userBalance}
                    step={userBalance > 100 ? "5" : "1"}
                    value={isInvalidAmount ? 0 : Math.min(parsedMonto, userBalance)}
                    onChange={handleSliderChange}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>1.00 VES</span>
                    <span>50%</span>
                    <span>{userBalance.toFixed(0)} VES</span>
                  </div>
                </div>
              )}

              {/* Numeric input */}
              <div className="relative mt-1">
                <input
                  id="withdraw-amount-input"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder={`Ej: ${userBalance > 0 ? (userBalance >= 20 ? "20.00" : userBalance.toFixed(2)) : "0.00"}`}
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  className={`bg-slate-950 border-2 rounded-xl px-3.5 py-2.5 text-sm font-mono font-black w-full outline-none transition pr-14 ${
                    isOverBalance
                      ? "border-rose-500 text-rose-400 focus:border-rose-400"
                      : "border-slate-800 focus:border-blue-500 text-amber-300"
                  }`}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                  VES
                </span>
              </div>

              {/* Real-time validation if the user doesn't reach the requested amount */}
              {isOverBalance && (
                <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/60 text-[11px] text-rose-200 leading-snug flex flex-col gap-1">
                  <span className="font-bold text-rose-300 flex items-center gap-1">
                    <AlertCircle size={14} /> Saldo Insuficiente
                  </span>
                  <span>
                    Tu saldo disponible actual es de <strong>{userBalance.toFixed(2)} VES</strong> y estás solicitando retirar <strong>{parsedMonto.toFixed(2)} VES</strong>.
                  </span>
                  <span className="text-yellow-300 font-mono font-bold">
                    Te faltan: {(parsedMonto - userBalance).toFixed(2)} VES
                  </span>
                </div>
              )}

              {/* If amount is valid, preview the resulting balance */}
              {!isInvalidAmount && !isOverBalance && userBalance > 0 && (
                <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center justify-between">
                  <span>Saldo restante tras el retiro:</span>
                  <strong className="font-mono font-black text-xs text-yellow-300">
                    {(userBalance - parsedMonto).toFixed(2)} VES
                  </strong>
                </div>
              )}
            </div>

            {/* Mobile Payment / Bank details input */}
            <div className="shrink-0">
              <label htmlFor="withdraw-payment-details" className="text-[11px] font-bold text-slate-300 mb-1 block">
                Datos de tu Pago Móvil (Banco, Cédula, Teléfono) *
              </label>
              <textarea
                id="withdraw-payment-details"
                required
                rows={2}
                placeholder="Ej: Banco de Venezuela (0102), V-18.765.432, 0424-5389992"
                value={datos}
                onChange={(e) => setDatos(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 w-full outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* WhatsApp Support Link */}
            <a
              href={OFFICIAL_WHATSAPP.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-950 hover:bg-slate-800/80 p-2.5 rounded-xl border border-emerald-500/40 flex items-center justify-between text-xs text-emerald-300 transition shrink-0"
            >
              <div className="flex items-center gap-2">
                <MessageCircle size={15} className="text-emerald-400" />
                <span className="text-[11px] font-fredoka font-bold">
                  {OFFICIAL_WHATSAPP.displayText}
                </span>
              </div>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 font-bold">
                Soporte WhatsApp →
              </span>
            </a>
          </div>

          {/* Fixed / Always Visible Footer with Submit Button */}
          <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/95 shrink-0 flex flex-col gap-1.5">
            <button
              type="submit"
              disabled={hasNoBalance || isOverBalance || isInvalidAmount}
              className={`w-full font-fredoka font-bold py-3 rounded-2xl shadow-lg transition active:scale-95 cursor-pointer text-xs sm:text-sm flex items-center justify-center gap-2 ${
                hasNoBalance || isOverBalance || isInvalidAmount
                  ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white border border-blue-400/40"
              }`}
            >
              <ArrowDownRight size={16} />
              {hasNoBalance ? (
                "Sin Saldo Disponible para Retirar"
              ) : isOverBalance ? (
                `❌ Saldo Insuficiente (Te faltan ${(parsedMonto - userBalance).toFixed(2)} VES)`
              ) : (
                `Solicitar Retiro de ${!isInvalidAmount ? `${parsedMonto.toFixed(2)} VES` : ""}`
              )}
            </button>
            <div className="text-[10px] text-center text-slate-400 font-mono">
              El saldo se restará automáticamente de tu cuenta cuando el Administrador apruebe el retiro.
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
