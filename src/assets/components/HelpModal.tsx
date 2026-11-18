import React from "react";
import { X, HelpCircle, Star, Sparkles, MessageCircle, Phone } from "lucide-react";
import { OFFICIAL_PAGO_MOVIL, OFFICIAL_WHATSAPP } from "../constants/contact";

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
            className="text-slate-400 hover:text-white p-1 rounded-xl transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-3 text-xs text-slate-300">
          {/* Card de Atención Oficial y WhatsApp */}
          <div className="bg-gradient-to-br from-emerald-950/80 to-slate-950 p-3.5 rounded-2xl border border-emerald-500/40 flex flex-col gap-2">
            <strong className="text-emerald-300 font-fredoka flex items-center gap-1.5 text-xs">
              <Phone size={14} className="text-emerald-400" />
              Soporte y Pago Móvil Oficial:
            </strong>
            <div className="text-[11px] font-mono text-slate-200 space-y-0.5">
              <div>• <strong>Banco:</strong> {OFFICIAL_PAGO_MOVIL.bankName}</div>
              <div>• <strong>Teléfono:</strong> {OFFICIAL_PAGO_MOVIL.phone}</div>
              <div>• <strong>Cédula:</strong> {OFFICIAL_PAGO_MOVIL.idCard}</div>
            </div>
            <a
              href={OFFICIAL_WHATSAPP.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-fredoka font-black py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition text-xs shadow cursor-pointer"
            >
              <MessageCircle size={14} className="fill-slate-950" />
              <span>{OFFICIAL_WHATSAPP.displayText}</span>
            </a>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <strong className="text-amber-300 block mb-1 font-fredoka">
              1. Saldo Cero y Recargas:
            </strong>
            Todos los jugadores inician con saldo en 0.00 VES. Para adquirir cartones (60 VES c/u), debes realizar una recarga mediante Pago Móvil (0102 - 04245389992 - V30426712) con tu número de referencia bancaria o foto del comprobante.
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
              4. Formas Oficiales de Ganar:
            </strong>
            Ganas completando:
            <ul className="mt-1 space-y-1 text-slate-300 list-disc list-inside">
              <li><strong className="text-yellow-300">Cuadrito (En cualquier lugar):</strong> Bloque de 2x2 casillas en cualquier sector del cartón (16 posiciones válidas).</li>
              <li><strong className="text-yellow-300">4 Esquinas:</strong> Las cuatro puntas exteriores (B1, B5, O1, O5).</li>
              <li><strong className="text-yellow-300">Líneas:</strong> Cualquier fila horizontal completa o cualquier columna vertical completa (B, I, N, G u O).</li>
            </ul>
            ¡Al completar cualquiera de estas figuras, pulsa "¡Cantar Bingo!" para que el Administrador apruebe y acredite tu premio!
          </div>
        </div>
      </div>
    </div>
  );
};
