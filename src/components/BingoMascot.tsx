import React, { useState } from "react";
import { CharacterModel } from "../types";
import { AnimatedCharacter } from "./AnimatedCharacter";
import {
  Sparkles,
  MessageCircle,
  RefreshCw,
  ShoppingBag,
  CreditCard,
  Shirt,
  PlayCircle,
  HelpCircle,
} from "lucide-react";

interface Props {
  character: CharacterModel;
  userName?: string;
  cartonesCount: number;
  userBalance: number;
  roomCountdown: string;
  onOpenCharacterSelect: () => void;
  onOpenRecharge: () => void;
  onEnterGame?: () => void;
  onBuyCartonsClick?: () => void;
}

const MASCOT_MESSAGES = [
  "¡Epa mi pana! Aquí estoy listo con mi cartón en mano para cantar BINGO.",
  "¡Tengo la buena vibra activada! ¿Ya tienes tus cartones listos para la partida?",
  "Recuerda que la esfera de los números da vueltas en la esquinita para que no te fastidie.",
  "Todos comenzamos con saldo en 0.00 VES. ¡Recarga fácil por Pago Móvil con tu ID único!",
  "¡Visita el vestidor para cambiar entre muñeco Varón o Hembra, o comprar trajes VIP!",
  "¡Revisa la lista de Tops arriba para ver los líderes Globales, Regionales y Futuros!",
];

export const BingoMascot: React.FC<Props> = ({
  character,
  userName = "Chamo",
  cartonesCount,
  userBalance,
  roomCountdown,
  onOpenCharacterSelect,
  onOpenRecharge,
  onEnterGame,
  onBuyCartonsClick,
}) => {
  const [messageIndex, setMessageIndex] = useState(0);

  const nextMessage = () => {
    setMessageIndex((prev) => (prev + 1) % MASCOT_MESSAGES.length);
  };

  const isMale = character.gender === "MALE";

  return (
    <div className="relative bg-gradient-to-b from-slate-900/95 via-slate-900/80 to-slate-950/95 border border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col md:flex-row items-center gap-6 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-10 -left-10 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* The Animated Character (Male or Female, NO Christmas) holding the 5x5 Bingo Card */}
      <div className="relative flex flex-col items-center shrink-0">
        <div className="relative">
          <AnimatedCharacter
            character={character}
            holdingCard={true}
            cartonNumber={cartonesCount > 0 ? 77 : 1}
            size="md"
            onClick={nextMessage}
            showBadge={false}
          />
        </div>

        {/* Change Character / Wardrobe button */}
        <button
          onClick={onOpenCharacterSelect}
          className="mt-2 bg-slate-950/90 hover:bg-slate-800 text-yellow-300 hover:text-white border border-amber-500/50 hover:border-amber-400 text-xs font-fredoka font-bold py-1.5 px-3.5 rounded-full shadow flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
        >
          <Shirt size={13} className="text-amber-400" />
          <span>Elegir Muñeco ({isMale ? "Varón 🧢" : "Hembra 👗"})</span>
        </button>
      </div>

      {/* Speech Bubble & Interactive Lobby Status */}
      <div className="flex-1 flex flex-col gap-4 text-center md:text-left w-full">
        {/* Comic Speech Bubble */}
        <div className="relative bg-slate-950/90 border border-amber-400/40 rounded-3xl p-4 sm:p-5 shadow-xl text-slate-100">
          {/* Bubble tail pointing to character */}
          <div className="hidden md:block absolute -left-3 top-8 w-0 h-0 border-t-8 border-t-transparent border-r-[12px] border-r-amber-400/40 border-b-8 border-b-transparent" />
          <div className="hidden md:block absolute -left-2 top-8 w-0 h-0 border-t-7 border-t-transparent border-r-[11px] border-r-slate-950 border-b-7 border-b-transparent" />

          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-base">{isMale ? "🧢" : "✨"}</span>
              <span className="font-fredoka text-sm font-bold text-yellow-300">
                {character.name}
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono border border-amber-500/30">
                {character.gender === "MALE" ? "Varón" : "Hembra"}
              </span>
            </div>

            <button
              onClick={nextMessage}
              className="text-slate-400 hover:text-yellow-300 p-1 rounded-lg transition flex items-center gap-1 text-[11px] font-fredoka cursor-pointer"
              title="Otro consejo"
            >
              <RefreshCw size={12} />
              <span>Hablar</span>
            </button>
          </div>

          <p className="font-fredoka text-sm sm:text-base text-slate-200 leading-relaxed min-h-[48px] flex items-center justify-center md:justify-start">
            "{MASCOT_MESSAGES[messageIndex]}"
          </p>
        </div>

        {/* Player Status & Quick Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {/* Balance Widget */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-2.5 flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Tu Saldo</span>
            <span className="font-fredoka text-base sm:text-lg font-black text-emerald-400 font-mono">
              {userBalance.toFixed(2)} VES
            </span>
          </div>

          {/* Cartones Count */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-2.5 flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Tus Cartones</span>
            <span className="font-fredoka text-base sm:text-lg font-black text-yellow-300 font-mono">
              {cartonesCount} {cartonesCount === 1 ? "Cartón" : "Cartones"}
            </span>
          </div>

          {/* Countdown to Next Match */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-2.5 flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Inicio Partida</span>
            <span className="font-fredoka text-base sm:text-lg font-black text-amber-400 font-mono animate-pulse">
              {roomCountdown}
            </span>
          </div>

          {/* Action: Recharge */}
          <button
            onClick={onOpenRecharge}
            className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl p-2.5 flex flex-col items-center justify-center transition active:scale-95 shadow font-fredoka cursor-pointer group"
          >
            <CreditCard size={16} className="text-white group-hover:scale-110 transition" />
            <span className="text-xs font-bold mt-0.5">Recargar Saldo</span>
          </button>
        </div>

        {/* Big Action Buttons: Comprar Cartones & Entrar a Sala */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          {onBuyCartonsClick && (
            <button
              onClick={onBuyCartonsClick}
              className="w-full sm:w-1/2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-fredoka font-black py-3 px-4 rounded-2xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <ShoppingBag size={18} />
              <span>Tienda de Cartones (60 VES)</span>
            </button>
          )}

          {onEnterGame && (
            <button
              onClick={onEnterGame}
              className="w-full sm:w-1/2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-fredoka font-black py-3 px-4 rounded-2xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <PlayCircle size={18} />
              <span>Entrar a Mesa de Juego</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
