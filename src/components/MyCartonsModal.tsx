import React from "react";
import { X, Ticket, CheckCircle2, History, ArrowRight } from "lucide-react";
import { BingoCard, HistoryRecord } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  purchasedCardIds: number[];
  allCards: BingoCard[];
  drawnBalls: number[];
  history: HistoryRecord[];
  cartonPrice?: number;
  onSelectCarton: (id: number) => void;
}

export const MyCartonsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  purchasedCardIds,
  allCards,
  drawnBalls,
  history,
  cartonPrice = 60,
  onSelectCarton,
}) => {
  if (!isOpen) return null;

  const purchasedCards = allCards.filter((c) => purchasedCardIds.includes(c.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-2xl w-full p-6 flex flex-col gap-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-fredoka text-base sm:text-lg font-bold text-purple-300 flex items-center gap-2">
            <Ticket size={20} className="text-purple-400" />
            Tus Cartones Comprados ({purchasedCardIds.length})
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-xl transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* List of purchased cartons */}
        <div className="flex flex-col gap-3">
          <div className="text-xs font-bold text-slate-300">
            Cartones Adquiridos para esta Partida:
          </div>

          {purchasedCards.length === 0 ? (
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
              <span className="text-2xl">🎟️</span>
              Aún no has comprado ningún cartón para esta partida.
              <span className="text-[11px] text-amber-300">
                Selecciona un cartón ({cartonPrice.toFixed(2)} VES) en el lobby y haz clic en Comprar.
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[260px] overflow-y-auto pr-1">
              {purchasedCards.map((card) => {
                let hits = 0;
                card.numeros.forEach((row) => {
                  row.forEach((cell) => {
                    if (cell.num === "FREE" || cell.marcado || drawnBalls.includes(cell.num as number)) {
                      hits++;
                    }
                  });
                });

                return (
                  <div
                    key={card.id}
                    className="bg-slate-950 p-3.5 rounded-2xl border border-purple-500/30 hover:border-purple-400 flex flex-col gap-2.5 shadow transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-fredoka font-bold text-yellow-300 text-sm">
                        Cartón #{card.id}
                      </span>
                      <span className="text-[10px] font-mono bg-purple-950 text-purple-300 px-2 py-0.5 rounded-full font-bold border border-purple-800">
                        {hits} / 25 aciertos
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-amber-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${(hits / 25) * 100}%` }}
                      />
                    </div>

                    <button
                      onClick={() => {
                        onSelectCarton(card.id);
                        onClose();
                      }}
                      className="w-full bg-purple-900/60 hover:bg-purple-800 text-purple-200 text-xs font-fredoka font-bold py-1.5 rounded-xl border border-purple-700/50 flex items-center justify-center gap-1.5 transition"
                    >
                      Jugar con este Cartón <ArrowRight size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Permanent History */}
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
          <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <History size={14} className="text-amber-400" /> Registro Permanente de Movimientos:
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 max-h-[160px] overflow-y-auto flex flex-col gap-2">
            {history.length === 0 ? (
              <div className="text-xs text-slate-500 italic text-center py-2">
                No hay transacciones registradas aún.
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-200">{item.detalles}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.fecha}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      item.tipo === "BINGO"
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        : item.tipo === "COMPRA"
                        ? "bg-purple-950 text-purple-300 border border-purple-800"
                        : "bg-blue-950 text-blue-300 border border-blue-800"
                    }`}
                  >
                    {item.tipo}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
