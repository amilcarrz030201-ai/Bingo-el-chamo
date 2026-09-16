import React, { useState } from "react";
import { UserProfile, BingoCard, RechargeRequest, WithdrawRequest } from "../types";
import { MasterBoard } from "./MasterBoard";
import { getBallLetter, evaluateCardFigure } from "../utils/bingo";
import { RotatingMeshTombola } from "./RotatingMeshTombola";
import { TopRankingsModal } from "./TopRankingsModal";
import {
  ShieldAlert,
  Dice5,
  RotateCcw,
  Bot,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Trophy,
  History,
  Eye,
  LogOut,
  Users,
  Sparkles,
  Radio,
  Clock,
  ArrowDownRight,
  PlusCircle,
} from "lucide-react";

interface Props {
  user: UserProfile;
  drawnBalls: number[];
  currentBall: number | null;
  totalBalls: number;
  allCards: BingoCard[];
  rechargeRequests: RechargeRequest[];
  withdrawRequests?: WithdrawRequest[];
  roomCountdown: string;
  autoMode: boolean;
  onDrawNextBall: () => void;
  onResetTombola: () => void;
  onToggleAutoMode: () => void;
  onApproveRecharge: (id: string) => void;
  onRejectRecharge: (id: string, reason?: string) => void;
  onApproveWithdraw?: (id: string) => void;
  onRejectWithdraw?: (id: string, reason?: string) => void;
  onLogout: () => void;
}

export const AdminLobby: React.FC<Props> = ({
  user,
  drawnBalls,
  currentBall,
  totalBalls,
  allCards,
  rechargeRequests,
  withdrawRequests = [],
  roomCountdown,
  autoMode,
  onDrawNextBall,
  onResetTombola,
  onToggleAutoMode,
  onApproveRecharge,
  onRejectRecharge,
  onApproveWithdraw,
  onRejectWithdraw,
  onLogout,
}) => {
  const [selectedVoucherModal, setSelectedVoucherModal] = useState<string | null>(null);
  const [topsModalOpen, setTopsModalOpen] = useState(false);
  const [adminRequestsTab, setAdminRequestsTab] = useState<"recargas" | "retiros">("recargas");

  const remaining = totalBalls - drawnBalls.length;
  const currentLetter = currentBall ? getBallLetter(currentBall) : "BINGO";

  // Calculate top cartons progress in real time
  const cartonLeaderboard = allCards
    .map((card) => {
      const evalResult = evaluateCardFigure(card, drawnBalls);
      return {
        id: card.id,
        hits: evalResult.matchedCells,
        isWinner: evalResult.isWinner,
        patternName: evalResult.patternName,
      };
    })
    .sort((a, b) => b.hits - a.hits)
    .slice(0, 10);

  const pendingRequests = rechargeRequests.filter((r) => r.estado === "PENDIENTE");
  const historyRequests = rechargeRequests.filter((r) => r.estado !== "PENDIENTE");

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-red-950/50 text-slate-100">
      {/* Admin Header - Note: NO balance, NO recharge, NO withdraw as strictly requested */}
      <header className="bg-slate-900/95 border-b border-amber-500/40 sticky top-0 z-30 backdrop-blur-md px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg border-2 border-yellow-300">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-fredoka text-base sm:text-lg font-bold text-yellow-300">
                  Panel de Control Maestro
                </h1>
                <span className="text-[10px] bg-yellow-500 text-slate-950 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider font-sans">
                  ADMINISTRADOR
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                {user.email} (Acceso Total a la Sala)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Countdown Badge */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl px-3 py-1.5 flex items-center gap-2">
              <Clock size={15} className="text-amber-400" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] uppercase font-bold text-slate-400">Próxima Partida</span>
                <span className="font-fredoka text-xs font-bold text-yellow-300 font-mono">
                  {roomCountdown}
                </span>
              </div>
            </div>

            {/* Pending Requests Badge */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl px-3 py-1.5 flex items-center gap-2">
              <Users size={15} className="text-emerald-400" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] uppercase font-bold text-slate-400">Solicitudes Pago</span>
                <span className="font-fredoka text-xs font-bold text-emerald-400 font-mono">
                  {pendingRequests.length} pendientes
                </span>
              </div>
            </div>

            {/* Tops de la Semana Button */}
            <button
              onClick={() => setTopsModalOpen(true)}
              className="bg-amber-500/20 hover:bg-amber-500/30 text-yellow-300 font-fredoka font-bold text-xs px-3 py-2 rounded-xl border border-amber-500/40 flex items-center gap-1.5 transition cursor-pointer shadow"
              title="Ver Tops Globales, Regionales y Futuros"
            >
              <Trophy size={14} className="text-yellow-400 animate-bounce" />
              <span>Tops de la Semana</span>
            </button>

            <button
              onClick={onLogout}
              className="bg-red-950 hover:bg-red-900 text-red-200 text-xs font-fredoka font-bold px-3 py-2 rounded-xl border border-red-800 flex items-center gap-1.5 transition cursor-pointer"
            >
              <LogOut size={14} /> Salir
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tombola Operation Console & Live Carton Monitor */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Tómbola Operación Maestro */}
          <div className="bg-slate-900/90 border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-5 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Dice5 size={18} className="text-yellow-400" />
                <h3 className="font-fredoka text-sm sm:text-base font-bold text-yellow-300 uppercase tracking-wider">
                  Consola de Tómbola en Vivo
                </h3>
              </div>
              <span className="text-xs font-mono bg-slate-950 text-slate-300 border border-slate-800 px-3 py-1 rounded-xl">
                {remaining} Bolas por Cantar
              </span>
            </div>

            {/* Central Rotating Mesh Tombola for Admin */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
              <RotatingMeshTombola
                currentBall={currentBall}
                isSpinning={autoMode || currentBall !== null}
                size="md"
                showDrawnBall={true}
              />

              <div className="flex flex-col gap-2 text-center sm:text-left">
                <div className="text-xs font-bold text-slate-400 uppercase">
                  Estado Actual de la Partida:
                </div>
                <div className="font-fredoka text-xl font-bold text-yellow-300">
                  {currentBall
                    ? `¡Bola Cantada: ${currentLetter}-${currentBall}!`
                    : "Esperando primer número..."}
                </div>
                <p className="text-xs text-slate-400 max-w-xs">
                  Puedes cantar los números manualmente o activar el extractor automático cada 4 segundos.
                </p>
              </div>
            </div>

            {/* Tombola Controls */}
            <div className="flex flex-col gap-3 pt-2 border-t border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={onDrawNextBall}
                  disabled={remaining === 0}
                  className="sm:col-span-2 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 font-fredoka font-black py-3.5 px-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 text-sm transition active:scale-95 cursor-pointer"
                >
                  <Dice5 size={18} /> Cantar Siguiente Bola
                </button>

                <button
                  onClick={onResetTombola}
                  className="bg-red-950/80 hover:bg-red-900 text-red-200 font-fredoka font-bold py-3.5 px-3 rounded-2xl border border-red-800/80 flex items-center justify-center gap-1.5 text-xs transition cursor-pointer"
                >
                  <RotateCcw size={15} /> Reiniciar
                </button>
              </div>

              {/* Mode Toggle Button */}
              <button
                onClick={onToggleAutoMode}
                className={`w-full py-2.5 px-4 rounded-2xl font-fredoka font-bold text-xs flex items-center justify-center gap-2 border transition cursor-pointer ${
                  autoMode
                    ? "bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/20"
                    : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                }`}
              >
                <Bot size={16} />
                {autoMode
                  ? "Tómbola Automática Activa (Extrayendo cada 4s) - Haz clic para Pausar"
                  : "Activar Modo Automático (Extracción Contínua)"}
              </button>
            </div>

            {/* Recent Balls Extracted */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
              <span className="text-[11px] font-bold text-slate-400">
                Últimas 8 Bolas Cantadas:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto py-1 min-h-[40px]">
                {drawnBalls.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">
                    Ninguna bola ha salido todavía en la tómbola.
                  </span>
                ) : (
                  drawnBalls
                    .slice(-8)
                    .reverse()
                    .map((num, i) => (
                      <div
                        key={num}
                        className={`w-9 h-9 rounded-full flex flex-col items-center justify-center font-fredoka font-black text-xs shadow border shrink-0 ${
                          i === 0
                            ? "bg-gradient-to-tr from-yellow-300 to-amber-500 text-slate-950 border-yellow-200 ring-2 ring-yellow-400 scale-105"
                            : "bg-gradient-to-tr from-white to-slate-200 text-slate-950 border-amber-400"
                        }`}
                      >
                        <span className="text-[7px] text-red-700 leading-none">
                          {getBallLetter(num)}
                        </span>
                        <span className="leading-none">{num}</span>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>

          {/* Real-Time Winning Cartons Radar */}
          <div className="bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Trophy size={18} className="text-emerald-400" />
                <h3 className="font-fredoka text-sm font-bold text-emerald-300 uppercase tracking-wider">
                  Radar en Vivo: Cartones con Mayor Acierto
                </h3>
              </div>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                Monitoreo Global (1 - 200)
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Lista en tiempo real de los cartones que van más cerca de ganar una de las 8 figuras oficiales:
            </p>

            <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
              {cartonLeaderboard.map((item, index) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition ${
                    item.isWinner
                      ? "bg-emerald-950/80 border-emerald-400 text-emerald-100 ring-2 ring-emerald-400 animate-pulse"
                      : "bg-slate-950 border-slate-800 text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-xl bg-slate-900 text-amber-300 font-fredoka font-bold text-xs flex items-center justify-center border border-slate-800">
                      #{index + 1}
                    </span>
                    <div>
                      <div className="font-fredoka font-bold text-xs sm:text-sm text-yellow-300">
                        Cartón #{item.id}
                      </div>
                      {item.isWinner && (
                        <span className="text-[10px] font-bold text-emerald-300">
                          ¡BINGO COMPLETO: {item.patternName}!
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl ${
                        item.isWinner
                          ? "bg-emerald-500 text-slate-950 font-black"
                          : "bg-slate-900 text-amber-300 border border-slate-800"
                      }`}
                    >
                      {item.hits} / 25 aciertos
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Master Board & Pago Móvil Verification Center */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Master Board for Admin */}
          <MasterBoard drawnBalls={drawnBalls} />

          {/* Solicitudes de Pago Móvil Management */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <ShieldAlert size={18} className="text-amber-400" />
                <h3 className="font-fredoka text-sm font-bold text-yellow-300 uppercase tracking-wider">
                  Verificación de Recargas Pago Móvil
                </h3>
              </div>
              <span className="text-[11px] bg-amber-500/20 text-yellow-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-bold">
                {pendingRequests.length} Solicitudes
              </span>
            </div>

            {/* Pending List */}
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-bold text-slate-300">
                Solicitudes Pendientes por Aprobar:
              </span>

              {pendingRequests.length === 0 ? (
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center text-xs text-slate-500 italic">
                  No hay solicitudes de recarga pendientes por verificar.
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 max-h-[260px] overflow-y-auto pr-1">
                  {pendingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 hover:border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-fredoka font-bold text-yellow-300 text-xs sm:text-sm">
                            {req.email}
                          </span>
                          {req.transactionId && (
                            <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-bold">
                              ID: {req.transactionId}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-300 font-mono">
                          Monto: <strong className="text-emerald-400">{req.monto.toFixed(2)} VES</strong>{" "}
                          | Ref: <strong className="text-amber-300">{req.ref}</strong>{" "}
                          | Banco: {req.bank || "Pago Móvil"}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {req.fecha}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {req.voucherImage && (
                          <button
                            onClick={() => setSelectedVoucherModal(req.voucherImage!)}
                            className="bg-slate-900 hover:bg-slate-800 text-amber-300 px-2.5 py-1.5 rounded-xl text-xs font-fredoka flex items-center gap-1 border border-slate-800 transition cursor-pointer"
                          >
                            <Eye size={12} /> Ver Captura
                          </button>
                        )}
                        <button
                          onClick={() => onApproveRecharge(req.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-fredoka font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow transition cursor-pointer"
                        >
                          <CheckCircle size={13} /> Aprobar
                        </button>
                        <button
                          onClick={() => onRejectRecharge(req.id)}
                          className="bg-red-950 hover:bg-red-900 text-red-200 font-fredoka font-bold px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1 border border-red-800 transition cursor-pointer"
                        >
                          <XCircle size={13} /> Rechazar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* History List */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <History size={13} /> Historial de Resoluciones:
              </span>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 max-h-[140px] overflow-y-auto flex flex-col gap-1.5">
                {historyRequests.length === 0 ? (
                  <span className="text-xs text-slate-500 italic text-center py-2">
                    Sin historial de recargas procesadas todavía.
                  </span>
                ) : (
                  historyRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300 font-bold">{req.email}</span>
                        <span className="text-amber-400 font-mono">{req.monto} VES</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          req.estado === "APROBADO"
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            : "bg-red-950 text-red-300 border border-red-800"
                        }`}
                      >
                        {req.estado}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Top Rankings Modal for Admin */}
      <TopRankingsModal
        isOpen={topsModalOpen}
        onClose={() => setTopsModalOpen(false)}
        currentUserEmail={user.email}
      />

      {/* Voucher Modal */}
      {selectedVoucherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-fredoka text-base font-bold text-white">
                Comprobante de Pago Móvil Adjunto
              </h3>
              <button
                onClick={() => setSelectedVoucherModal(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-800 max-h-[70vh]">
              <img
                src={selectedVoucherModal}
                alt="Comprobante de Pago"
                className="w-full h-full object-contain bg-black"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
