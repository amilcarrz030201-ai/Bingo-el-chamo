import React, { useState } from "react";
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Plus,
  Minus,
  CheckCircle2,
  X,
  Sliders,
  Sparkles,
  CalendarClock,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  roomSeconds: number;
  configuredRoomDuration: number;
  isPaused: boolean;
  onSetRemainingSeconds: (seconds: number) => void;
  onSetConfiguredDuration: (seconds: number) => void;
  onTogglePause: () => void;
  onResetTimer: () => void;
  onAdjustTime: (deltaSeconds: number) => void;
}

export const AdminGameTimerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  roomSeconds,
  configuredRoomDuration,
  isPaused,
  onSetRemainingSeconds,
  onSetConfiguredDuration,
  onTogglePause,
  onResetTimer,
  onAdjustTime,
}) => {
  if (!isOpen) return null;

  // Custom inputs state
  const [customMinutes, setCustomMinutes] = useState<string>(
    String(Math.floor(roomSeconds / 60))
  );
  const [customSeconds, setCustomSeconds] = useState<string>(
    String(roomSeconds % 60)
  );

  const [defaultDurationInput, setDefaultDurationInput] = useState<string>(
    String(Math.floor(configuredRoomDuration / 60))
  );

  const [activeTab, setActiveTab] = useState<"instant" | "default">("instant");
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 3500);
  };

  const formatTime = (secs: number) => {
    const safe = Math.max(0, secs);
    const m = Math.floor(safe / 60);
    const s = safe % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleApplyCustomRemaining = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const m = parseInt(customMinutes, 10) || 0;
    const s = parseInt(customSeconds, 10) || 0;
    const total = Math.max(0, m * 60 + s);

    onSetRemainingSeconds(total);
    showFeedback(`✅ Tiempo restante actualizado a ${formatTime(total)} para esta partida.`);
  };

  const handleApplyPresetRemaining = (secs: number, label: string) => {
    onSetRemainingSeconds(secs);
    setCustomMinutes(String(Math.floor(secs / 60)));
    setCustomSeconds(String(secs % 60));
    showFeedback(`✅ Tiempo restante fijado a ${label}.`);
  };

  const handleApplyConfiguredDuration = (minutes: number) => {
    const secs = Math.max(30, minutes * 60);
    onSetConfiguredDuration(secs);
    setDefaultDurationInput(String(minutes));
    showFeedback(`🌟 Duración de las próximas partidas fijada en ${minutes} minutos.`);
  };

  const progressPercent = Math.min(
    100,
    Math.max(0, (roomSeconds / (configuredRoomDuration || 1800)) * 100)
  );

  const PRESETS_REMAINING = [
    { label: "30 seg", secs: 30 },
    { label: "1 min", secs: 60 },
    { label: "2 min", secs: 120 },
    { label: "3 min", secs: 180 },
    { label: "5 min", secs: 300 },
    { label: "10 min", secs: 600 },
    { label: "15 min", secs: 900 },
    { label: "20 min", secs: 1200 },
    { label: "30 min", secs: 1800 },
    { label: "45 min", secs: 2700 },
    { label: "60 min", secs: 3600 },
  ];

  const PRESETS_DEFAULT = [
    { label: "2 min (Rápida)", minutes: 2 },
    { label: "5 min", minutes: 5 },
    { label: "10 min", minutes: 10 },
    { label: "15 min", minutes: 15 },
    { label: "20 min", minutes: 20 },
    { label: "30 min (Estándar)", minutes: 30 },
    { label: "45 min", minutes: 45 },
    { label: "60 min (1 Hora)", minutes: 60 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-cyan-500/50 rounded-3xl w-full max-w-xl shadow-2xl shadow-cyan-950/60 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-4 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow">
              <Clock size={22} className="animate-spin" />
            </div>
            <div>
              <h2 className="font-fredoka text-base sm:text-lg font-black text-cyan-200 flex items-center gap-2">
                <span>Tiempo de Próximas Partidas</span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-mono">
                  ADMIN
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Ajusta el tiempo restante en vivo y la duración estándar de futuras rondas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex flex-col gap-4 text-slate-200 text-sm">
          {/* Main LCD Clock Card */}
          <div className="bg-gradient-to-b from-slate-950 to-blue-950/60 border-2 border-cyan-500/40 rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
            {/* Background glowing aura */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between w-full mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                <CalendarClock size={14} className="text-cyan-400" />
                Tiempo Restante Próxima Partida:
              </span>
              <div
                className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1 border ${
                  isPaused
                    ? "bg-amber-950/80 text-amber-300 border-amber-500/50"
                    : "bg-emerald-950/80 text-emerald-300 border-emerald-500/50 animate-pulse"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isPaused ? "bg-amber-400" : "bg-emerald-400"
                  }`}
                />
                <span>{isPaused ? "⏸️ Conteo Pausado" : "🟢 Conteo Activo"}</span>
              </div>
            </div>

            {/* Giant LCD Countdown */}
            <div className="my-1 flex items-baseline justify-center gap-2">
              <span className="font-mono text-4xl sm:text-6xl font-black text-cyan-300 tracking-wider drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]">
                {formatTime(roomSeconds)}
              </span>
            </div>

            <div className="text-xs text-slate-400 font-mono flex items-center gap-3 mt-1 flex-wrap justify-center">
              <span>
                Equivale a:{" "}
                <strong className="text-cyan-200">
                  {Math.floor(roomSeconds / 60)} min {roomSeconds % 60} s
                </strong>
              </span>
              <span className="text-slate-600">•</span>
              <span>
                Duración oficial guardada:{" "}
                <strong className="text-yellow-300">
                  {Math.floor(configuredRoomDuration / 60)} min
                </strong>
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-900 rounded-full h-2 mt-3 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-cyan-500 via-blue-400 to-yellow-400 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Quick Actions Under Display */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full mt-4 pt-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={onTogglePause}
                className={`py-2 px-3 rounded-xl font-fredoka font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                  isPaused
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-md"
                    : "bg-amber-600 hover:bg-amber-500 text-slate-950 border-amber-300 shadow-md"
                }`}
                title={isPaused ? "Reanudar conteo regresivo" : "Pausar conteo regresivo"}
              >
                {isPaused ? <Play size={14} /> : <Pause size={14} />}
                <span>{isPaused ? "Reanudar Conteo" : "Pausar Conteo"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onResetTimer();
                  showFeedback("🔄 Conteo reiniciado a la duración oficial de la sala.");
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-2 px-3 rounded-xl font-fredoka font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                title="Reiniciar conteo a la duración oficial"
              >
                <RotateCcw size={14} className="text-cyan-400" />
                <span>Reiniciar Conteo</span>
              </button>

              <button
                type="button"
                onClick={() => onAdjustTime(60)}
                className="bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 py-2 px-2 rounded-xl font-fredoka font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                title="Añadir 1 minuto al tiempo restante"
              >
                <Plus size={14} />
                <span>+1 Minuto</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSetRemainingSeconds(0);
                  showFeedback("🚀 Conteo fijado en 00:00 (¡Inicio inmediato!)");
                }}
                className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white py-2 px-2 rounded-xl font-fredoka font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer shadow border border-red-400"
                title="Poner tiempo en 0 para iniciar de inmediato"
              >
                <Zap size={14} />
                <span>Iniciar Ya (0s)</span>
              </button>
            </div>
          </div>

          {/* Feedback banner */}
          {feedbackMsg && (
            <div className="bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-xs px-3 py-2 rounded-xl flex items-center gap-2 animate-in slide-in-from-top-1 font-mono">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {/* Tab Selector: Ajuste Inmediato vs Duración Oficial de Partidas */}
          <div className="flex rounded-2xl bg-slate-950 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab("instant")}
              className={`flex-1 py-2 px-3 rounded-xl font-fredoka font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === "instant"
                  ? "bg-cyan-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Clock size={14} />
              <span>Ajustar Tiempo Restante (Esta Partida)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("default")}
              className={`flex-1 py-2 px-3 rounded-xl font-fredoka font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === "default"
                  ? "bg-amber-500 text-slate-950 shadow-md font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Sliders size={14} />
              <span>Duración Oficial Próximas Partidas</span>
            </button>
          </div>

          {/* TAB 1: Instant Remaining Time Adjustment */}
          {activeTab === "instant" && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-150">
              {/* Preset buttons */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  Atajos Rápidos de Tiempo Restante (1 Clic):
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {PRESETS_REMAINING.map((p) => {
                    const isCurrent = Math.abs(roomSeconds - p.secs) < 2;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => handleApplyPresetRemaining(p.secs, p.label)}
                        className={`py-2 px-2 rounded-xl text-xs font-fredoka font-bold transition cursor-pointer border ${
                          isCurrent
                            ? "bg-cyan-500 text-slate-950 border-cyan-300 shadow-md ring-2 ring-cyan-400/50"
                            : "bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-cyan-500/40"
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Incremental Adjusters */}
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-mono text-slate-400 font-bold">
                  Sumar o restar minutos en caliente:
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onAdjustTime(-300)}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white font-mono font-bold flex items-center gap-1 cursor-pointer"
                    title="Restar 5 minutos"
                  >
                    <Minus size={12} /> 5m
                  </button>
                  <button
                    type="button"
                    onClick={() => onAdjustTime(-60)}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white font-mono font-bold flex items-center gap-1 cursor-pointer"
                    title="Restar 1 minuto"
                  >
                    <Minus size={12} /> 1m
                  </button>
                  <button
                    type="button"
                    onClick={() => onAdjustTime(60)}
                    className="bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-xs px-2.5 py-1.5 rounded-lg text-cyan-300 hover:text-cyan-200 font-mono font-bold flex items-center gap-1 cursor-pointer"
                    title="Añadir 1 minuto"
                  >
                    <Plus size={12} /> 1m
                  </button>
                  <button
                    type="button"
                    onClick={() => onAdjustTime(300)}
                    className="bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-xs px-2.5 py-1.5 rounded-lg text-cyan-300 hover:text-cyan-200 font-mono font-bold flex items-center gap-1 cursor-pointer"
                    title="Añadir 5 minutos"
                  >
                    <Plus size={12} /> 5m
                  </button>
                </div>
              </div>

              {/* Custom Input Form */}
              <form
                onSubmit={handleApplyCustomRemaining}
                className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex flex-col gap-2.5"
              >
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Sliders size={13} className="text-cyan-400" />
                  <span>Personalizar Minutos y Segundos Exactos:</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-2 rounded-xl border border-slate-700">
                    <span className="text-xs text-slate-400 font-mono">Min:</span>
                    <input
                      type="number"
                      min="0"
                      max="1440"
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(e.target.value)}
                      className="bg-transparent w-full text-sm font-mono font-bold text-cyan-300 focus:outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-2 rounded-xl border border-slate-700">
                    <span className="text-xs text-slate-400 font-mono">Seg:</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={customSeconds}
                      onChange={(e) => setCustomSeconds(e.target.value)}
                      className="bg-transparent w-full text-sm font-mono font-bold text-cyan-300 focus:outline-none"
                      placeholder="0"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-fredoka font-bold text-xs py-2 px-4 rounded-xl shadow transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 size={15} />
                    <span>Aplicar Ahora</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: Standard/Default Duration for Next Games */}
          {activeTab === "default" && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-150">
              <div className="bg-amber-950/40 border border-yellow-500/30 rounded-2xl p-3 text-xs text-amber-200/90 leading-relaxed">
                💡 <strong>¿Cómo funciona?</strong> Esta es la duración base de las partidas.
                Cuando se canta bingo o se reinicia la tómbola para una nueva ronda, el conteo
                de la <strong>próxima partida</strong> arrancará automáticamente con este tiempo.
              </div>

              <div>
                <label className="text-xs font-bold text-yellow-300 block mb-2">
                  Selecciona la Duración Predeterminada Oficial:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESETS_DEFAULT.map((item) => {
                    const isSelected =
                      Math.floor(configuredRoomDuration / 60) === item.minutes;
                    return (
                      <button
                        key={item.minutes}
                        type="button"
                        onClick={() => handleApplyConfiguredDuration(item.minutes)}
                        className={`p-3 rounded-2xl text-xs font-fredoka font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer border ${
                          isSelected
                            ? "bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 border-yellow-200 shadow-lg ring-2 ring-yellow-400/60"
                            : "bg-slate-950 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-amber-500/40"
                        }`}
                      >
                        <span className="text-sm font-black font-mono">
                          {item.minutes} min
                        </span>
                        <span className="text-[10px] opacity-80">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Default Duration Form */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex flex-col gap-2.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-400" />
                  <span>Duración Personalizada (en minutos):</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-1.5 bg-slate-900 px-3 py-2 rounded-xl border border-slate-700">
                    <input
                      type="number"
                      min="1"
                      max="720"
                      value={defaultDurationInput}
                      onChange={(e) => setDefaultDurationInput(e.target.value)}
                      className="bg-transparent w-full text-sm font-mono font-bold text-yellow-300 focus:outline-none"
                      placeholder="Minutos por partida (ej: 25)"
                    />
                    <span className="text-xs text-slate-400 font-mono">minutos</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const mins = parseInt(defaultDurationInput, 10);
                      if (mins > 0) {
                        handleApplyConfiguredDuration(mins);
                      }
                    }}
                    className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-fredoka font-black text-xs py-2 px-4 rounded-xl shadow transition cursor-pointer"
                  >
                    Guardar Duración
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Sincronización en tiempo real con todos los jugadores</span>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white font-fredoka px-4 py-1.5 rounded-xl cursor-pointer transition font-bold"
          >
            Listo / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
