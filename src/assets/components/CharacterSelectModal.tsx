import React from 'react';
import { CharacterId } from '../game/types';
import { CHARACTERS } from '../game/constants';
import { Shield, Zap, Heart, Swords, Check } from 'lucide-react';

interface CharacterSelectModalProps {
  isOpen: boolean;
  selectedId: CharacterId;
  onSelect: (id: CharacterId) => void;
  onConfirm: () => void;
  onClose?: () => void;
}

export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({
  isOpen,
  selectedId,
  onSelect,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  const currentDef = CHARACTERS[selectedId];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Decorative Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-amber-500 to-rose-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
              BATALLA CALLEJERA EN EL ESTADIO
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">
              ELIGE TU LUCHADOR
            </h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 text-sm font-semibold"
            >
              Cerrar
            </button>
          )}
        </div>

        {/* Character Card Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {Object.values(CHARACTERS).map((char) => {
            const isSelected = char.id === selectedId;
            return (
              <button
                key={char.id}
                onClick={() => onSelect(char.id)}
                className={`relative flex flex-col items-center p-3 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-500/20 scale-105'
                    : 'border-slate-800 bg-slate-800/60 hover:border-slate-600 hover:bg-slate-800'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
                <div className="text-4xl mb-2 filter drop-shadow-md">{char.iconEmoji}</div>
                <div className="text-sm font-bold text-white text-center leading-tight truncate w-full">
                  {char.name}
                </div>
                <div className="text-[11px] text-slate-400 truncate w-full text-center mt-0.5">
                  {char.subtitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Character Deep Profile */}
        {currentDef && (
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 mb-6 flex-1 flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 border-2 border-slate-600 flex items-center justify-center text-5xl shrink-0 shadow-inner">
                {currentDef.iconEmoji}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-white">{currentDef.name}</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {currentDef.subtitle}
                  </span>
                </div>
                <p className="text-xs italic text-slate-400 mt-1">"{currentDef.tagline}"</p>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  {currentDef.description}
                </p>
              </div>
            </div>

            {/* Stat Bars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-700/60">
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/50">
                <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold mb-1">
                  <Heart className="w-3.5 h-3.5" /> Vida Base
                </div>
                <div className="text-lg font-black text-white">{currentDef.baseHealth} HP</div>
              </div>

              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/50">
                <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-semibold mb-1">
                  <Shield className="w-3.5 h-3.5" /> Chaleco
                </div>
                <div className="text-lg font-black text-white">{currentDef.baseArmor} AP</div>
              </div>

              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/50">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mb-1">
                  <Zap className="w-3.5 h-3.5" /> Velocidad
                </div>
                <div className="text-lg font-black text-white">{Math.round(currentDef.baseSpeed * 100)}%</div>
              </div>

              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/50">
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold mb-1">
                  <Swords className="w-3.5 h-3.5" /> Fuerza
                </div>
                <div className="text-lg font-black text-white">{Math.round(currentDef.baseDamage * 100)}%</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-between gap-4">
          <div className="text-xs text-slate-400 hidden sm:block">
            🎮 Usa <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono text-slate-200">WASD</kbd> o joystick para moverte, <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono text-slate-200">F</kbd> para golpear, <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono text-slate-200">E</kbd> para agarrar armas.
          </div>
          <button
            onClick={onConfirm}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Swords className="w-5 h-5" />
            ¡ENTRAR AL ESTADIO A LUCHAR!
          </button>
        </div>
      </div>
    </div>
  );
};
