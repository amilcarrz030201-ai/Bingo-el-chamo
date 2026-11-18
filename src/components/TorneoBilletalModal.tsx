import React, { useState } from "react";
import { TorneoBilletalConfig, UserProfile } from "../types";
import {
  Trophy,
  Lock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Coins,
  Calendar,
  ShieldCheck,
  X,
  CreditCard,
  Ticket,
  PlusCircle,
  AlertTriangle,
  Wallet,
} from "lucide-react";
import confetti from "canvas-confetti";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: TorneoBilletalConfig;
  user: UserProfile | null;
  onEnroll?: (cartonCount: number, totalAmount: number) => void;
  onEnterBattleArena?: () => void;
  onOpenRecharge?: () => void;
}

export const TorneoBilletalModal: React.FC<Props> = ({
  isOpen,
  onClose,
  config,
  user,
  onEnroll,
  onOpenRecharge,
}) => {
  const [cartonCount, setCartonCount] = useState<number>(1);
  const [enrollSuccess, setEnrollSuccess] = useState(false);

  if (!isOpen) return null;

  const userBalance = user?.balance ?? 0;
  const isEnrolled = !!(user && config.registeredUsers?.includes(user.email.toLowerCase().trim()));
  const pricePerCarton = config.entryFeeVES || 100;
  const totalRequiredVES = cartonCount * pricePerCarton;
  const canAfford = userBalance >= totalRequiredVES;
  const missingAmount = Math.max(0, totalRequiredVES - userBalance);

  const handleEnrollClick = () => {
    if (!user || user.role !== "PLAYER") return;
    if (!canAfford) {
      if (onOpenRecharge) onOpenRecharge();
      return;
    }
    if (onEnroll) {
      onEnroll(cartonCount, totalRequiredVES);
      setEnrollSuccess(true);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] border-amber-500/60">
        {/* Glow ambient background decoration */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-yellow-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div
          className={`p-4 sm:p-5 flex items-center justify-between border-b ${
            config.isEnabled
              ? "bg-gradient-to-r from-amber-950/80 via-slate-900 to-emerald-950/80 border-amber-500/40"
              : "bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-950 border-red-500/40"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border shrink-0 ${
                config.isEnabled
                  ? "bg-gradient-to-tr from-yellow-400 via-amber-500 to-yellow-600 text-slate-950 border-yellow-200"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
            >
              {config.isEnabled ? (
                <Trophy size={26} className="animate-bounce" />
              ) : (
                <Lock size={24} className="text-red-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-fredoka text-base sm:text-lg font-bold text-yellow-300">
                  {config.title || "Torneo Billetal"}
                </h3>
                {config.isEnabled ? (
                  <span className="bg-emerald-600/30 text-emerald-300 border border-emerald-400/50 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shadow">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ACTIVO
                  </span>
                ) : (
                  <span className="bg-red-600/30 text-red-300 border border-red-400/50 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shadow">
                    <Lock size={10} />
                    USUARIOS CERRADOS
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Bingo el Chamo Oficial • Edición Torneo Billetal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* ========================================================================= */}
          {/* CASO A: TORNEO DESHABILITADO POR EL ADMIN (USUARIOS CERRADOS) */}
          {/* ========================================================================= */}
          {!config.isEnabled && (
            <div className="space-y-4">
              <div className="bg-red-950/40 border border-red-500/50 rounded-2xl p-4 sm:p-5 text-center flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-red-900/50 border border-red-500/60 flex items-center justify-center text-red-400">
                  <Lock size={28} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-fredoka font-black text-lg text-red-300">
                    Torneo Billetal Cerrado para Usuarios
                  </h4>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                    El administrador ha deshabilitado el acceso a este torneo. Las inscripciones y la compra de cartones permanecen <strong className="text-red-400">cerradas</strong> en este momento.
                  </p>
                </div>
                <div className="bg-slate-900/80 border border-red-500/30 rounded-xl px-3 py-2 text-[11px] text-amber-200/90 font-mono">
                  📢 Aviso del Administrador: {config.adminNote || "Atento a la próxima apertura del Torneo Billetal."}
                </div>
              </div>

              {/* Locked Preview Card */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2 opacity-75">
                <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                  Previsualización de la Próxima Edición
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Plata en Juego</span>
                    <span className="font-fredoka font-bold text-yellow-400 text-sm">
                      {(config.prizeVES * 0.8).toLocaleString("es-VE", { minimumFractionDigits: 2 })} VES
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Precio por Cartón</span>
                    <span className="font-fredoka font-bold text-emerald-400 text-sm">
                      {config.entryFeeVES.toFixed(2)} VES
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CASO B: TORNEO HABILITADO POR EL ADMIN (ACTIVO Y EN JUEGO) */}
          {/* ========================================================================= */}
          {config.isEnabled && (
            <div className="space-y-4">
              {/* Grand Prize Banner: Solo 80% Plata en Juego Mostrada */}
              <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 p-0.5 rounded-2xl shadow-xl shadow-amber-500/10">
                <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950/70 p-4 rounded-[15px] flex flex-col items-center text-center gap-1.5">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-yellow-400 animate-spin" style={{ animationDuration: "8s" }} />
                    <span className="text-[11px] font-fredoka uppercase tracking-wider text-yellow-300 font-bold">
                      Plata en Juego
                    </span>
                    <Sparkles size={16} className="text-yellow-400 animate-spin" style={{ animationDuration: "8s" }} />
                  </div>
                  <div className="font-fredoka text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 drop-shadow">
                    {(config.prizeVES * 0.8).toLocaleString("es-VE", { minimumFractionDigits: 2 })} VES
                  </div>
                  <p className="text-[11px] text-emerald-300 font-mono bg-slate-950/80 px-3 py-1 rounded-full border border-emerald-500/30">
                    Acreditación automática a tu cuenta al cantar Bingo
                  </p>
                </div>
              </div>

              {/* Tournament Details Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-yellow-400 shrink-0">
                    <Coins size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Precio Cartón Fijado</span>
                    <span className="font-fredoka font-bold text-sm text-yellow-300">
                      {pricePerCarton.toFixed(2)} VES
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Programación</span>
                    <span className="font-fredoka font-bold text-xs text-blue-200 truncate block max-w-[120px]">
                      {config.scheduledTime || "Hoy en Vivo"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Selector de Cartones a Comprar para el Torneo */}
              {user && user.role === "PLAYER" && (
                <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-fredoka font-bold text-yellow-300 flex items-center gap-1.5">
                      <Ticket size={14} className="text-amber-400" />
                      Cartones del Torneo a Comprar:
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {pricePerCarton.toFixed(2)} VES c/u
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((count) => {
                      const cost = count * pricePerCarton;
                      const selected = cartonCount === count;
                      return (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setCartonCount(count)}
                          className={`p-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                            selected
                              ? "bg-amber-500 text-slate-950 border-yellow-300 shadow-md font-black ring-2 ring-yellow-400/50"
                              : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 font-bold"
                          }`}
                        >
                          <span className="text-xs font-fredoka">{count} {count === 1 ? "Cartón" : "Cartones"}</span>
                          <span className="text-[10px] font-mono leading-none">
                            {cost.toFixed(0)} VES
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* VALIDACIÓN DE SALDO ESTRICTA PARA JUGADORES */}
              {/* ========================================================================= */}
              {user && user.role === "PLAYER" && (
                <div className="space-y-3">
                  {/* Balance Status Card */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800/80">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Wallet size={14} className="text-amber-400" />
                        Tu Saldo Actual Disponible:
                      </span>
                      <span className="font-fredoka font-black text-sm text-yellow-300 font-mono">
                        {userBalance.toFixed(2)} VES
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Total a pagar ({cartonCount} {cartonCount === 1 ? "cartón" : "cartones"}):</span>
                      <span className="font-fredoka font-black text-sm text-white font-mono">
                        {totalRequiredVES.toFixed(2)} VES
                      </span>
                    </div>

                    {/* Validation Message: Insufficient vs Sufficient */}
                    {!canAfford ? (
                      <div className="bg-gradient-to-r from-red-950/80 via-red-900/60 to-red-950/80 border-2 border-red-500/80 rounded-xl p-3 flex flex-col gap-2 text-xs animate-in fade-in duration-200">
                        <div className="flex items-start gap-2 text-red-200">
                          <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-red-200 font-fredoka block text-xs">
                              ⚠️ Saldo Insuficiente para comprar cartones del Torneo
                            </strong>
                            <p className="text-[11px] text-red-200/90 leading-tight mt-0.5">
                              El administrador fijó el costo en <span className="font-bold text-white">{pricePerCarton.toFixed(2)} VES</span> por cartón. Te faltan <span className="font-bold text-yellow-300 font-mono">{missingAmount.toFixed(2)} VES</span> para poder completar esta compra.
                            </p>
                          </div>
                        </div>

                        {/* Direct Recharge Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenRecharge) onOpenRecharge();
                          }}
                          className="w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-fredoka font-black text-xs py-2 px-3 rounded-lg shadow-lg flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer border border-yellow-200"
                        >
                          <PlusCircle size={14} className="text-slate-950" />
                          <span>Recargar {missingAmount.toFixed(2)} VES vía Pago Móvil</span>
                        </button>
                      </div>
                    ) : (
                      <div className="bg-emerald-950/60 border border-emerald-500/60 rounded-xl p-2.5 flex items-center justify-between text-xs text-emerald-200">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                          <span className="text-[11px]">
                            Saldo suficiente verificado. Te quedarán <strong className="text-emerald-300 font-mono">{(userBalance - totalRequiredVES).toFixed(2)} VES</strong>.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Enrollment Action Buttons */}
                  {isEnrolled || enrollSuccess ? (
                    <div className="bg-emerald-950/60 border-2 border-emerald-500/60 rounded-2xl p-4 flex items-center gap-3 text-emerald-300 text-xs">
                      <CheckCircle2 size={22} className="text-emerald-400 shrink-0" />
                      <div>
                        <strong className="font-fredoka block text-sm text-emerald-200">
                          ¡Ya estás participando en el Torneo Billetal!
                        </strong>
                        <span className="text-[11px] text-emerald-300/80">
                          Tus cartones están asegurados en la partida oficial. ¡Mucha suerte!
                        </span>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={handleEnrollClick}
                      className={`w-full py-3.5 px-4 rounded-2xl font-fredoka font-black text-sm flex items-center justify-center gap-2 shadow-xl transition active:scale-95 ${
                        canAfford
                          ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/70 border-2 border-emerald-400/60 cursor-pointer hover:scale-[1.01]"
                          : "bg-slate-900/80 text-slate-500 border border-slate-800 cursor-not-allowed opacity-60"
                      }`}
                    >
                      {canAfford ? (
                        <>
                          <Trophy size={18} className="text-yellow-300" />
                          <span>Comprar {cartonCount} {cartonCount === 1 ? "Cartón" : "Cartones"} del Torneo ({totalRequiredVES.toFixed(2)} VES)</span>
                        </>
                      ) : (
                        <>
                          <Lock size={16} className="text-slate-500" />
                          <span>Bloqueado por Saldo Insuficiente ({userBalance.toFixed(2)} / {totalRequiredVES.toFixed(2)} VES)</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Description & Rules */}
              <div className="bg-slate-950/90 border border-amber-500/30 rounded-2xl p-3.5 space-y-2">
                <span className="text-[11px] font-fredoka font-bold text-yellow-300 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  Reglas Oficiales del Torneo Billetal:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {config.rulesDescription || "Modalidad Cartón Lleno de alta premiación. El primer cartón en completar la figura oficial se lleva el pozo de Bolívares acreditado de inmediato."}
                </p>
                {config.adminNote && (
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-amber-200 font-mono">
                    📌 Nota del Administrador: {config.adminNote}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-mono">
            Bingo el Chamo • Control de Saldo Oficial
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-fredoka font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
