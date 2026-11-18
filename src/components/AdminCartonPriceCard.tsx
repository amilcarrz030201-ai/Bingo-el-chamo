import React, { useState } from "react";
import { Ticket, DollarSign, Check, Sparkles, Shield, AlertCircle, TrendingUp } from "lucide-react";

interface Props {
  cartonPrice: number;
  onUpdateCartonPrice: (newPrice: number) => void;
  totalCartonesEnJuego?: number;
}

export const AdminCartonPriceCard: React.FC<Props> = ({
  cartonPrice,
  onUpdateCartonPrice,
  totalCartonesEnJuego = 0,
}) => {
  const [customPrice, setCustomPrice] = useState<string>(String(cartonPrice));
  const [isSavedRecently, setIsSavedRecently] = useState<boolean>(false);

  const presets = [
    { value: 20, bg: "from-sky-500 to-blue-600 text-white border-sky-300" },
    { value: 30, bg: "from-teal-500 to-emerald-600 text-white border-teal-300" },
    { value: 40, bg: "from-indigo-500 to-violet-600 text-white border-indigo-300" },
    { value: 50, bg: "from-orange-500 to-amber-600 text-white border-orange-300" },
    { value: 60, bg: "from-yellow-400 via-amber-400 to-yellow-500 text-slate-950 font-black border-yellow-200" },
    { value: 80, bg: "from-fuchsia-500 to-pink-600 text-white border-fuchsia-300" },
    { value: 100, bg: "from-rose-500 to-red-600 text-white border-rose-300" },
    { value: 150, bg: "from-cyan-400 to-teal-500 text-slate-950 font-black border-cyan-200" },
  ];

  const handleSave = (priceToSet: number) => {
    if (priceToSet <= 0 || isNaN(priceToSet)) {
      alert("Por favor ingresa un precio válido mayor a 0 VES.");
      return;
    }
    const clean = Number(priceToSet.toFixed(2));
    onUpdateCartonPrice(clean);
    setCustomPrice(String(clean));
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(customPrice);
    handleSave(parsed);
  };

  return (
    <div
      id="admin-carton-price-card"
      className="bg-gradient-to-br from-indigo-950 via-slate-900 to-amber-950/80 border-2 border-amber-400/80 rounded-3xl p-4 sm:p-6 shadow-2xl shadow-amber-500/15 flex flex-col gap-4 text-slate-100 relative overflow-hidden"
    >
      {/* Background ambient colorful glow accents */}
      <div className="absolute -top-10 -right-10 w-72 h-40 bg-gradient-to-br from-pink-500/20 via-amber-500/20 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-72 h-40 bg-gradient-to-tr from-cyan-500/20 via-emerald-500/20 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-400/40 pb-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-400 to-orange-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/40 border-2 border-yellow-200 shrink-0">
            <Ticket size={26} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-fredoka text-base sm:text-lg font-bold text-yellow-300 uppercase tracking-wide flex items-center gap-2">
                <span>🎨 Ajuste de Precio de los Cartones</span>
                <Sparkles size={16} className="text-yellow-400 animate-spin" />
              </h3>
              <span className="text-[10px] bg-gradient-to-r from-red-600 to-rose-600 text-white border border-red-400 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 font-mono uppercase shadow">
                <Shield size={10} />
                Solo Administrador
              </span>
            </div>
            <p className="text-xs text-amber-100/90 font-medium">
              Control oficial del valor por cartón. Solamente tú como administrador puedes ver y ajustar este precio.
            </p>
          </div>
        </div>

        {/* Current Active Price Pill */}
        <div className="flex items-center gap-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 px-4 py-2 rounded-2xl shadow-xl shadow-amber-500/30 border-2 border-yellow-200">
          <span className="text-xs font-bold font-fredoka uppercase tracking-wider">Precio Activo:</span>
          <span className="font-fredoka text-xl sm:text-2xl font-black font-mono">
            {cartonPrice.toFixed(2)} VES
          </span>
        </div>
      </div>

      {/* Price Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center relative z-10">
        {/* Quick Presets with Bright Colorful Chips */}
        <div className="lg:col-span-7 flex flex-col gap-2">
          <span className="text-xs font-bold text-yellow-300 flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-400" />
            <span>⚡ Valores Rápidos Predefinidos (Colores):</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => {
              const isSelected = cartonPrice === preset.value;
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handleSave(preset.value)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer border shadow-md flex items-center gap-1 bg-gradient-to-r ${preset.bg} ${
                    isSelected
                      ? "ring-4 ring-yellow-300 scale-110 shadow-lg shadow-yellow-400/40 z-10"
                      : "opacity-90 hover:opacity-100 hover:scale-105"
                  }`}
                >
                  {isSelected && <Check size={12} className="stroke-[3]" />}
                  <span>{preset.value} VES</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Price Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-5 flex flex-col gap-2">
          <label htmlFor="custom-carton-price-input" className="text-xs font-bold text-yellow-300 flex items-center gap-1">
            <DollarSign size={13} className="text-amber-400" />
            <span>Fijar Precio Personalizado (VES):</span>
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                id="custom-carton-price-input"
                type="number"
                step="1"
                min="1"
                max="5000"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                placeholder="Ej. 75"
                className="w-full bg-slate-950 border-2 border-yellow-400 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-400/40 rounded-xl px-3 py-2 text-sm text-yellow-300 font-mono font-black outline-none pr-14 transition shadow-inner"
              />
              <span className="absolute right-3 top-2.5 text-xs text-yellow-400 font-mono font-bold pointer-events-none">
                VES
              </span>
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-white font-fredoka font-black text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xl shadow-emerald-950/60 border-2 border-emerald-300 transition cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              {isSavedRecently ? (
                <>
                  <Check size={16} className="text-white animate-bounce stroke-[3]" />
                  <span>¡Aplicado!</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Aplicar Precio</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Dynamic Colorful Projection Table */}
      <div className="bg-slate-950/90 p-3.5 sm:p-4 rounded-2xl border border-amber-500/30 flex flex-col gap-2.5 text-xs relative z-10 shadow-inner">
        <div className="flex items-center justify-between text-slate-300 font-mono text-[11px] border-b border-slate-800 pb-1.5">
          <span className="flex items-center gap-1.5 font-bold text-yellow-300">
            <TrendingUp size={13} className="text-amber-400" />
            Tabla de costos al nuevo precio ({cartonPrice.toFixed(2)} VES):
          </span>
          <span className="text-amber-200/80 font-bold">Máximo 4 cartones por jugador</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 font-mono text-center">
          <div className="bg-gradient-to-b from-sky-950/90 to-blue-900/60 p-2.5 rounded-xl border-2 border-sky-400/60 shadow-md">
            <span className="text-[10px] text-sky-300 uppercase font-bold block">1 Cartón</span>
            <span className="font-fredoka text-sm sm:text-base font-black text-sky-200">{(cartonPrice * 1).toFixed(2)} VES</span>
          </div>
          <div className="bg-gradient-to-b from-purple-950/90 to-indigo-900/60 p-2.5 rounded-xl border-2 border-purple-400/60 shadow-md">
            <span className="text-[10px] text-purple-300 uppercase font-bold block">2 Cartones</span>
            <span className="font-fredoka text-sm sm:text-base font-black text-purple-200">{(cartonPrice * 2).toFixed(2)} VES</span>
          </div>
          <div className="bg-gradient-to-b from-amber-950/90 to-orange-900/60 p-2.5 rounded-xl border-2 border-amber-400/60 shadow-md">
            <span className="text-[10px] text-amber-300 uppercase font-bold block">3 Cartones</span>
            <span className="font-fredoka text-sm sm:text-base font-black text-amber-200">{(cartonPrice * 3).toFixed(2)} VES</span>
          </div>
          <div className="bg-gradient-to-b from-emerald-950/90 to-teal-900/60 p-2.5 rounded-xl border-2 border-emerald-400/80 shadow-md">
            <span className="text-[10px] text-emerald-300 uppercase font-bold block">4 Cartones (Máx)</span>
            <span className="font-fredoka text-sm sm:text-base font-black text-emerald-300">{(cartonPrice * 4).toFixed(2)} VES</span>
          </div>
        </div>

        <p className="text-[10px] text-slate-300 italic pt-1">
          Al actualizar el precio, los jugadores verán automáticamente el nuevo monto al comprar en la tienda de cartones y al debitarse de su saldo.
        </p>
      </div>
    </div>
  );
};
