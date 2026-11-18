import React, { useState } from "react";
import { TorneoBilletalConfig } from "../types";
import { Trophy, Lock, Unlock, Sparkles, Save, X, Megaphone, CheckCircle2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: TorneoBilletalConfig;
  onSaveConfig: (updated: TorneoBilletalConfig) => void;
}

export const AdminTorneoBilletalModal: React.FC<Props> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [isEnabled, setIsEnabled] = useState(config.isEnabled);
  const [title, setTitle] = useState(config.title || "Gran Torneo Billetal - Bingo el Chamo");
  const [prizeVES, setPrizeVES] = useState(config.prizeVES || 15000);
  const [entryFeeVES, setEntryFeeVES] = useState(config.entryFeeVES || 100);
  const [scheduledTime, setScheduledTime] = useState(config.scheduledTime || "Sábado Especial 8:00 PM");
  const [rulesDescription, setRulesDescription] = useState(
    config.rulesDescription ||
      "Modalidad Cartón Lleno de Alta Premiación. Pozo garantizado en Bolívares. El primer cartón en completar la figura se lleva la premiación oficial."
  );
  const [adminNote, setAdminNote] = useState(config.adminNote || "");
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: TorneoBilletalConfig = {
      ...config,
      isEnabled,
      title: title.trim(),
      prizeVES: Number(prizeVES) || 0,
      entryFeeVES: Number(entryFeeVES) || 0,
      scheduledTime: scheduledTime.trim(),
      rulesDescription: rulesDescription.trim(),
      adminNote: adminNote.trim(),
      lastUpdated: Date.now(),
    };
    onSaveConfig(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-yellow-500/60 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-yellow-950 p-4 sm:p-5 flex items-center justify-between border-b border-yellow-500/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-400 via-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 shadow-lg border border-yellow-200 shrink-0">
              <Trophy size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-fredoka text-lg font-bold text-yellow-300">
                  Panel de Control: Torneo Billetal
                </h3>
                <span className="bg-yellow-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Habilitar / Deshabilitar torneo para usuarios en Bingo el Chamo
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

        {/* Modal Form */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* MASTER TOGGLE SWITCH: HABILITADO / DESHABILITADO */}
          <div className={`p-4 rounded-2xl border-2 transition ${
            isEnabled
              ? "bg-emerald-950/40 border-emerald-500/70 shadow-lg shadow-emerald-950/40"
              : "bg-red-950/40 border-red-500/70 shadow-lg shadow-red-950/40"
          }`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                  isEnabled ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
                }`}>
                  {isEnabled ? <Unlock size={22} /> : <Lock size={22} />}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                    Interruptor Principal
                  </span>
                  <h4 className="font-fredoka text-base font-bold text-white">
                    {isEnabled ? "🟢 Torneo Billetal: HABILITADO (Activo)" : "🔒 Torneo Billetal: DESHABILITADO"}
                  </h4>
                  <p className="text-xs text-slate-300 leading-snug">
                    {isEnabled
                      ? "A todos los usuarios les aparece ACTIVA la opción 'Torneo Billetal' en su menú para inscribirse y entrar."
                      : "A todos los usuarios les aparece 'CERRADO (Usuarios Cerrados)' impidiendo nuevas inscripciones."}
                  </p>
                </div>
              </div>

              {/* Big Switch Button */}
              <button
                type="button"
                onClick={() => setIsEnabled(!isEnabled)}
                className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isEnabled ? "bg-emerald-500" : "bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isEnabled ? "translate-x-8" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Tournament Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 mb-1 block">
                Nombre del Torneo:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-yellow-300 font-fredoka focus:border-yellow-400 outline-none"
                placeholder="Gran Torneo Billetal"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 mb-1 block">
                Horario / Programación:
              </label>
              <input
                type="text"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-blue-300 font-mono focus:border-blue-400 outline-none"
                placeholder="Hoy 8:00 PM"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 mb-1 block">
                Premio Mayor en Bolívares (VES):
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={prizeVES}
                onChange={(e) => setPrizeVES(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-yellow-300 font-mono font-bold focus:border-yellow-400 outline-none"
                required
              />
              <div className="flex flex-col gap-0.5 text-[10px] font-mono mt-1 text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between">
                  <span>Solo visible a usuarios (80%):</span>
                  <strong className="text-yellow-400">{(prizeVES * 0.8).toFixed(2)} VES en Plata en Juego</strong>
                </div>
                <div className="flex items-center justify-between text-emerald-400">
                  <span>Tienes 20% de esta partida:</span>
                  <strong>+{(prizeVES * 0.2).toFixed(2)} VES (Dinero por Partida)</strong>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 mb-1 block">
                Costo de Entrada / Inscripción (VES):
              </label>
              <input
                type="number"
                min="0"
                step="10"
                value={entryFeeVES}
                onChange={(e) => setEntryFeeVES(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-300 font-mono font-bold focus:border-emerald-400 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 mb-1 block">
              Reglas y Modalidad:
            </label>
            <textarea
              rows={2}
              value={rulesDescription}
              onChange={(e) => setRulesDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-sans focus:border-yellow-400 outline-none resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 mb-1 block">
              Nota del Administrador para los Usuarios:
            </label>
            <input
              type="text"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono focus:border-amber-400 outline-none"
              placeholder="Ej: Acceso abierto por 30 minutos para recargar e inscribirse"
            />
          </div>

          {/* Feedback */}
          {savedSuccess && (
            <div className="bg-emerald-950/80 border border-emerald-500 rounded-xl p-3 flex items-center gap-2 text-emerald-300 text-xs font-fredoka font-bold animate-in fade-in">
              <CheckCircle2 size={18} className="text-emerald-400" />
              <span>Configuración guardada y transmitida exitosamente a la sala.</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-fredoka font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-fredoka font-black px-5 py-2.5 rounded-xl text-xs shadow-lg flex items-center gap-2 transition active:scale-95 cursor-pointer border border-yellow-200"
            >
              <Save size={15} />
              <span>Guardar Configuración</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
