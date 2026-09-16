import React from "react";
import { X, HelpCircle, Star, Sparkles } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-md w-full p-6 flex flex-col gap-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-fredoka text-base sm:text-lg font-bold text-yellow-300 flex items-center gap-2">
            <HelpCircle size={20} className="text-amber-400" />
            Reglas del Bingo Navideño
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-xl transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-3 text-xs text-slate-300">
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <strong className="text-amber-300 block mb-1 font-fredoka">
              1. Saldo Cero y Recargas:
            </strong>
            Todos los jugadores inician con saldo en 0.00 VES. Para adquirir cartones (60 VES c/u), debes realizar una recarga mediante Pago Móvil con tu número de referencia bancaria o foto del comprobante.
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <strong className="text-amber-300 block mb-1 font-fredoka">
              2. Esfera en la Esquinita:
            </strong>
            La tómbola esférica de números se ubica en la esquina inferior para que no estorbe tu visión del cartón. Desde allí puedes ver en vivo cada número cantado.
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <strong className="text-amber-300 block mb-1 font-fredoka">
              3. Marcado Estricto de Números:
            </strong>
            Solo puedes marcar en tu cartón aquellos números que ya hayan sido extraídos por la tómbola de la sala. También cuentas con el botón "Auto-Marcar".
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <strong className="text-amber-300 block mb-1 font-fredoka">
              4. 8 Formas Oficiales de Ganar:
            </strong>
            Ganas completando Cruz/X, Línea Superior, Columna Central, Línea Inferior, Esquinas + L, Cruz Central, Cuadrado Central, o Marco Exterior. ¡Al completar una figura, pulsa "¡Cantar Bingo!" para recibir tu premio de 500 VES!
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <strong className="text-amber-300 block mb-1 font-fredoka">
              5. Asistente Culinario Smart Fridge:
            </strong>
            En cualquier momento puedes cambiar a la pestaña de Smart Fridge para fotografiar tu nevera y recibir recetas personalizadas con voz paso a paso.
          </div>
        </div>
      </div>
    </div>
  );
};
