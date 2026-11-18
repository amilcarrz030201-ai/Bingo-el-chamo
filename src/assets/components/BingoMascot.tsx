import React, { useState } from "react";
import { CharacterModel } from "../types";
import { AnimatedCharacter } from "./AnimatedCharacter";
import { ChristmasTree } from "./ChristmasTree";
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
  "Regla Oficial: Ganas completando Cuadrito 2x2, 4 Esquinas o cualquier Línea (B-I-N-G-O).",
  "¡Tengo la buena vibra activada! ¿Ya tienes tus cartones listos para la partida?",
  "Recuerda que la esfera de los números da vueltas en la esquinita para que no te fastidie.",
  "Todos comenzamos con saldo en 0.00 VES. ¡Recarga fácil por Pago Móvil con tu ID único!",
  "¡Visita el vestidor para cambiar entre muñeco Varón o Hembra, o desbloquearlos con tus victorias!",
  "¡Revisa la lista de Tops arriba para ver los líderes Globales, Regionales y Chamos Competidores!",
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
    <div className="relative bg-gradient-to-b from-slate-900/95 via-slate-900/80 to-slate-950/95 border border-amber-500/40 rounded-3xl p-4 sm:p-7 shadow-2xl flex flex-col md:flex-row items-center md:items-start gap-5 sm:gap-6 overflow-hidden w-full max-w-full">
      {/* Background ambient lighting */}
      <div className="absolute -top-10 -left-10 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* The Animated Character with Ferrari, Ambulance, Tank or Anise + Christmas Trees & Gift Boxes around */}
      <div className="relative flex flex-col items-center shrink-0 w-full md:w-auto">
        {/* Christmas Trees & Gifts flanking the character in the lobby */}
        <div className="relative flex items-center justify-center">
          {/* Left Christmas Tree & Gifts */}
          <div className="hidden sm:flex flex-col items-center absolute -left-20 bottom-1 z-10 select-none drop-shadow-xl">
            <ChristmasTree size="compact" interactive={true} />
          </div>

          {/* Central Animated Character with responsive scaling on mobile */}
          <div className="transform scale-90 sm:scale-100 transition-transform">
            <AnimatedCharacter
              character={character}
              holdingCard={true}
              cartonNumber={cartonesCount > 0 ? 77 : 1}
              size="md"
              onClick={nextMessage}
              showBadge={false}
            />
          </div>

          {/* Right Christmas Tree & Gifts */}
          <div className="hidden sm:flex flex-col items-center absolute -right-20 bottom-1 z-10 select-none drop-shadow-xl">
            <ChristmasTree size="compact" interactive={true} />
          </div>
        </div>

        {/* Change Character / Wardrobe button */}
        <button
          onClick={onOpenCharacterSelect}
          className="mt-1 sm:mt-2 bg-slate-950/90 hover:bg-slate-800 text-yellow-300 hover:text-white border border-amber-500/50 hover:border-amber-400 text-xs font-fredoka font-bold py-1.5 px-3.5 rounded-full shadow flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
        >
          <Shirt size={13} className="text-amber-400" />
          <span>Elegir Muñeco ({isMale ? "Varón 🧢" : "Hembra 👗"})</span>
        </button>
      </div>

      {/* Dynamic Vertical Flexbox Structure: Área de texto -> Barra de estado -> Botonera inferior */}
      <div className="flex-1 flex flex-col gap-3.5 sm:gap-4 text-center md:text-left w-full max-w-full min-w-0">
        {/* 1. Área de texto y reglas: sin absolute ni alturas fijas, con overflow-y auto, max-w 100% y word-break */}
        <div
          className="bg-slate-950/90 border border-amber-400/40 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xl text-slate-100 w-full max-w-full overflow-y-auto break-words"
          style={{
            overflowY: "auto",
            maxWidth: "100%",
            wordBreak: "break-word",
          }}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 w-full">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base shrink-0">{isMale ? "🧢" : "✨"}</span>
              <span className="font-fredoka text-sm font-bold text-yellow-300 truncate">
                {character.name}
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono border border-amber-500/30 shrink-0">
                {character.gender === "MALE" ? "Varón" : "Hembra"}
              </span>
            </div>

            <button
              onClick={nextMessage}
              className="text-slate-400 hover:text-yellow-300 p-1 rounded-lg transition flex items-center gap-1 text-[11px] font-fredoka cursor-pointer shrink-0 ml-2"
              title="Siguiente consejo o regla"
            >
              <RefreshCw size={12} />
              <span>Hablar / Reglas</span>
            </button>
          </div>

          <div
            className="w-full max-w-full overflow-y-auto font-fredoka text-sm sm:text-base text-slate-200 leading-relaxed max-h-32 sm:max-h-40 pr-1 text-left sm:text-center md:text-left"
            style={{
              overflowY: "auto",
              maxWidth: "100%",
              wordBreak: "break-word",
            }}
          >
            "{MASCOT_MESSAGES[messageIndex]}"
          </div>
        </div>

        {/* 2. Barra de estado con maquetado dinámico Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 w-full min-w-0">
          {/* Tu Saldo */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-2.5 flex flex-col min-w-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">Tu Saldo</span>
            <span className="font-fredoka text-sm sm:text-base md:text-lg font-black text-emerald-400 font-mono truncate">
              {userBalance.toFixed(2)} VES
            </span>
          </div>

          {/* Tus Cartones */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-2.5 flex flex-col min-w-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">Tus Cartones</span>
            <span className="font-fredoka text-sm sm:text-base md:text-lg font-black text-yellow-300 font-mono truncate">
              {cartonesCount} {cartonesCount === 1 ? "Cartón" : "Cartones"}
            </span>
          </div>

          {/* Inicio Partida */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-2.5 flex flex-col min-w-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">Inicio Partida</span>
            <span className="font-fredoka text-sm sm:text-base md:text-lg font-black text-amber-400 font-mono animate-pulse truncate">
              {roomCountdown}
            </span>
          </div>

          {/* Action: Recargar Saldo */}
          <button
            onClick={onOpenRecharge}
            className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-2xl p-2.5 flex flex-col items-center justify-center transition active:scale-95 shadow font-fredoka cursor-pointer group min-w-0"
          >
            <CreditCard size={16} className="text-white group-hover:scale-110 transition shrink-0" />
            <span className="text-xs font-bold mt-0.5 truncate w-full text-center">Recargar Saldo</span>
          </button>
        </div>

        {/* 3. Botonera inferior: Entrar a Mesa de Juego y Tienda de Cartones */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full min-w-0 pt-1 relative z-10">
          {onBuyCartonsClick && (
            <button
              onClick={onBuyCartonsClick}
              className="w-full sm:w-1/2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:from-amber-600 active:to-yellow-600 text-slate-950 font-fredoka font-black py-3 px-4 rounded-2xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
            >
              <ShoppingBag size={18} className="shrink-0" />
              <span>Tienda de Cartones (60 VES)</span>
            </button>
          )}

          {onEnterGame && (
            <button
              onClick={onEnterGame}
              className="w-full sm:w-1/2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 active:from-red-700 active:to-rose-800 text-white font-fredoka font-black py-3 px-4 rounded-2xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm hover:brightness-110 active:brightness-90"
            >
              <PlayCircle size={18} className="shrink-0" />
              <span>Entrar a Mesa de Juego</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
