import React from "react";
import { Clock, Zap, FastForward, Play, Pause, Shield, Check, Sliders } from "lucide-react";

export interface CantadoTemporality {
  seconds: number;
  label: string;
  badge: string;
  icon: string;
  description: string;
}

export const CANTADO_TEMPORALITIES: CantadoTemporality[] = [
  { seconds: 2, label: "2s", badge: "⚡ Relámpago", icon: "⚡", description: "Ultra rápido, ritmo frenético" },
  { seconds: 3, label: "3s", badge: "🚀 Rápido", icon: "🚀", description: "Ágil y dinámico" },
  { seconds: 4, label: "4s", badge: "⭐ Estándar", icon: "⭐", description: "Ritmo oficial recomendado" },
  { seconds: 5, label: "5s", badge: "🎯 Clásico", icon: "🎯", description: "Ideal para 1 a 2 cartones" },
  { seconds: 6, label: "6s", badge: "⏱️ Moderado", icon: "⏱️", description: "Permite revisar con calma" },
  { seconds: 8, label: "8s", badge: "☕ Pausado", icon: "☕", description: "Ritmo relajado para grupos" },
  { seconds: 10, label: "10s", badge: "🐢 Lento", icon: "🐢", description: "Familiar y para principiantes" },
  { seconds: 15, label: "15s", badge: "🧘 Muy Lento", icon: "🧘", description: "Máxima holgura entre bolas" },
];

interface Props {
  currentIntervalSeconds: number;
  onChangeInterval: (seconds: number) => void;
  autoMode: boolean;
  secondsRemaining?: number;
  onToggleAutoMode?: () => void;
}

export const CantadoSpeedConfig: React.FC<Props> = ({
  currentIntervalSeconds,
  onChangeInterval,
  autoMode,
  secondsRemaining,
  onToggleAutoMode,
}) => {
  const currentTemporality = CANTADO_TEMPORALITIES.find(
    (t) => t.seconds === currentIntervalSeconds
  );

  return (
    <div className="bg-slate-950/90 border border-amber-500/40 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Clock size={16} />
          </div>
          <div>
            <h3 className="font-fredoka text-sm sm:text-base font-bold text-yellow-300">
              Tiempo de Cantado (Temporalidades)
            </h3>
            <p className="text-[11px] text-slate-400">
              Configura los segundos de intervalo entre cada bola extraída
            </p>
          </div>
        </div>

        {/* Current Speed Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold bg-amber-500/20 text-yellow-300 border border-amber-500/40 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow">
            <span>{currentTemporality?.icon || "⏱️"}</span>
            <span>Cada {currentIntervalSeconds} segundos</span>
            <span className="text-[10px] text-amber-400 font-sans font-normal opacity-90">
              ({currentTemporality?.badge || "Personalizado"})
            </span>
          </span>
        </div>
      </div>

      {/* Quick Selectable Temporalities Grid */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
          Selecciona una Temporalidad Prediseñada:
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CANTADO_TEMPORALITIES.map((item) => {
            const isSelected = currentIntervalSeconds === item.seconds;
            return (
              <button
                key={`temp-${item.seconds}`}
                type="button"
                onClick={() => onChangeInterval(item.seconds)}
                className={`py-2 px-2.5 rounded-2xl border flex flex-col items-center justify-center gap-0.5 transition cursor-pointer text-center relative overflow-hidden ${
                  isSelected
                    ? "bg-gradient-to-b from-amber-500/30 to-yellow-600/20 border-yellow-400 ring-2 ring-yellow-400/50 shadow-lg text-white"
                    : "bg-slate-900/80 border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-white"
                }`}
              >
                {isSelected && (
                  <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-yellow-400 shadow-sm" />
                )}
                <div className="flex items-center gap-1">
                  <span className="text-sm">{item.icon}</span>
                  <span className="font-fredoka text-xs sm:text-sm font-bold text-yellow-300">
                    {item.seconds}s
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-300 truncate w-full">
                  {item.badge.replace(/^[^a-zA-ZáéíóúÁÉÍÓÚñÑ]+/, "")}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fine-Tuning Slider and Stepper (2s to 30s) */}
      <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-fredoka font-bold text-slate-300 shrink-0">
          <Sliders size={14} className="text-amber-400" />
          <span>Ajuste Manual Libre (2s a 30s):</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 sm:max-w-xs">
          <span className="text-[11px] font-mono text-slate-500">2s</span>
          <input
            type="range"
            min={2}
            max={30}
            step={1}
            value={currentIntervalSeconds}
            onChange={(e) => onChangeInterval(parseInt(e.target.value, 10))}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <span className="text-[11px] font-mono text-slate-500">30s</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onChangeInterval(Math.max(2, currentIntervalSeconds - 1))}
            className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-yellow-300 rounded-lg flex items-center justify-center font-bold text-sm cursor-pointer"
            title="Reducir 1 segundo"
          >
            -
          </button>
          <span className="w-12 text-center font-mono font-bold text-xs text-yellow-400 bg-slate-950 py-1 px-1.5 rounded-lg border border-slate-800">
            {currentIntervalSeconds} seg
          </span>
          <button
            type="button"
            onClick={() => onChangeInterval(Math.min(30, currentIntervalSeconds + 1))}
            className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-yellow-300 rounded-lg flex items-center justify-center font-bold text-sm cursor-pointer"
            title="Aumentar 1 segundo"
          >
            +
          </button>
        </div>
      </div>

      {/* Live Active Cantado Progress Bar */}
      {autoMode && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-3 flex flex-col gap-1.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-xs">
            <span className="font-fredoka font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Tómbola Automática Activa
            </span>
            <span className="font-mono text-[11px] text-emerald-300 font-bold">
              {secondsRemaining !== undefined
                ? `Próxima bola en: ${secondsRemaining}s`
                : `Cadencia activa: cada ${currentIntervalSeconds}s`}
            </span>
          </div>

          {/* Animated progress track */}
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-emerald-900">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-yellow-400 transition-all duration-1000 ease-linear rounded-full"
              style={{
                width:
                  secondsRemaining !== undefined
                    ? `${Math.max(0, Math.min(100, ((currentIntervalSeconds - secondsRemaining) / currentIntervalSeconds) * 100))}%`
                    : "100%",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
