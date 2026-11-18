import React from 'react';
import { CharacterId } from '../game/types';
import { CHARACTERS } from '../game/constants';
import { Skull, RotateCcw, Users, Trophy } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  kills: number;
  timeAlive: number;
  selectedCharId: CharacterId;
  onRestart: () => void;
  onChangeCharacter: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  kills,
  timeAlive,
  selectedCharId,
  onRestart,
  onChangeCharacter,
}) => {
  if (!isOpen) return null;

  const charDef = CHARACTERS[selectedCharId] || CHARACTERS.cj;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md select-none">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-rose-500/60 rounded-3xl p-6 shadow-2xl text-center overflow-hidden">
        {/* Top Danger Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />

        <div className="w-18 h-18 mx-auto mb-4 rounded-2xl bg-rose-950/80 border-2 border-rose-500/50 flex items-center justify-center text-4xl shadow-inner">
          <Skull className="w-10 h-10 text-rose-500" />
        </div>

        <span className="text-xs font-black uppercase tracking-widest text-rose-400">
          FUISTE NOQUEADO EN EL ESTADIO
        </span>
        <h2 className="text-3xl font-black text-white mt-0.5 tracking-tight">
          ¡HAS CAÍDO EN COMBATE!
        </h2>

        <p className="text-xs text-slate-400 mt-2">
          {charDef.name} luchó con valentía pero los rivales te conectaron un golpe letal.
        </p>

        {/* Match Statistics */}
        <div className="grid grid-cols-2 gap-3 my-5">
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
            <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400 font-bold mb-0.5">
              <Trophy className="w-3.5 h-3.5" /> Bajas (Kills)
            </div>
            <div className="text-2xl font-black text-white">{kills}</div>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
            <div className="flex items-center justify-center gap-1.5 text-xs text-cyan-400 font-bold mb-0.5">
              <Users className="w-3.5 h-3.5" /> Sobrevivido
            </div>
            <div className="text-2xl font-black text-white">{timeAlive}s</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={onRestart}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            ¡REVIVIR Y VOLVER A PELEAR!
          </button>

          <button
            onClick={onChangeCharacter}
            className="w-full py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-colors cursor-pointer"
          >
            Elegir Otro Personaje (Pou, CJ, Perro...)
          </button>
        </div>
      </div>
    </div>
  );
};
