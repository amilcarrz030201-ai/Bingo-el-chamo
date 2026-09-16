import React, { useState } from "react";
import { CharacterModel } from "../types";
import { ALL_CHARACTERS } from "../data/characters";
import { AnimatedCharacter } from "./AnimatedCharacter";
import {
  Users,
  CheckCircle2,
  Lock,
  Sparkles,
  ShoppingBag,
  Award,
  Crown,
  X,
  Zap,
  ArrowLeft,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedCharacterId: string;
  unlockedCharacterIds: string[];
  userBalance: number;
  userWins: number;
  onSelectCharacter: (id: string) => void;
  onBuyCharacter: (char: CharacterModel) => void;
  onUnlockByWins: (char: CharacterModel) => void;
}

export const CharacterSelectModal: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedCharacterId,
  unlockedCharacterIds,
  userBalance,
  userWins,
  onSelectCharacter,
  onBuyCharacter,
  onUnlockByWins,
}) => {
  const [genderFilter, setGenderFilter] = useState<"ALL" | "MALE" | "FEMALE">("ALL");
  const [previewId, setPreviewId] = useState<string>(selectedCharacterId);

  if (!isOpen) return null;

  const filtered = ALL_CHARACTERS.filter((c) => {
    if (genderFilter === "ALL") return true;
    return c.gender === genderFilter;
  });

  const previewCharacter = ALL_CHARACTERS.find((c) => c.id === previewId) || ALL_CHARACTERS[0];
  const isPreviewUnlocked = unlockedCharacterIds.includes(previewCharacter.id);
  const isPreviewEquipped = selectedCharacterId === previewCharacter.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/50 rounded-3xl max-w-4xl w-full p-5 sm:p-7 flex flex-col gap-4 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-yellow-400 hover:text-yellow-300 border border-slate-700 transition cursor-pointer font-fredoka font-bold text-xs shrink-0 shadow-sm"
              title="Volver atrás"
            >
              <ArrowLeft size={15} />
              <span>Atrás</span>
            </button>
            <div className="p-2 rounded-2xl bg-amber-500/20 text-yellow-300 border border-amber-500/40 shrink-0">
              <Users size={22} />
            </div>
            <div className="min-w-0">
              <h3 className="font-fredoka text-lg sm:text-xl font-bold text-yellow-300 flex items-center gap-2 truncate">
                Vestidor & Tienda de Muñecos
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-bold shrink-0">
                  Animados
                </span>
              </h3>
              <p className="text-xs text-slate-300 truncate">
                Elige tu muñeco (Varón o Hembra). Cómpralos con tu saldo o gánatelos acumulando bingos.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/80 transition cursor-pointer text-xs shrink-0"
            title="Cerrar y volver atrás"
          >
            <span className="hidden sm:inline font-fredoka">Cerrar</span>
            <X size={16} />
          </button>
        </div>

        {/* Gender Filters */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 gap-1">
            <button
              onClick={() => setGenderFilter("ALL")}
              className={`px-3 py-1 rounded-xl text-xs font-fredoka font-bold transition cursor-pointer ${
                genderFilter === "ALL"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Todos ({ALL_CHARACTERS.length})
            </button>
            <button
              onClick={() => setGenderFilter("MALE")}
              className={`px-3 py-1 rounded-xl text-xs font-fredoka font-bold transition cursor-pointer flex items-center gap-1 ${
                genderFilter === "MALE"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-blue-300"
              }`}
            >
              👨 Varón ({ALL_CHARACTERS.filter((c) => c.gender === "MALE").length})
            </button>
            <button
              onClick={() => setGenderFilter("FEMALE")}
              className={`px-3 py-1 rounded-xl text-xs font-fredoka font-bold transition cursor-pointer flex items-center gap-1 ${
                genderFilter === "FEMALE"
                  ? "bg-pink-600 text-white shadow"
                  : "text-slate-400 hover:text-pink-300"
              }`}
            >
              👩 Hembra ({ALL_CHARACTERS.filter((c) => c.gender === "FEMALE").length})
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300 font-mono">
              Saldo: <strong className="text-emerald-400">{userBalance.toFixed(2)} VES</strong>
            </div>
            <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300 font-mono">
              Victorias: <strong className="text-yellow-400">{userWins} 🏆</strong>
            </div>
          </div>
        </div>

        {/* Content layout: Left Catalog Grid, Right Live Character Stage */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          {/* Catalog Grid */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
            {filtered.map((char) => {
              const isUnlocked = unlockedCharacterIds.includes(char.id);
              const isEquipped = selectedCharacterId === char.id;
              const isSelectedPreview = previewId === char.id;

              return (
                <div
                  key={char.id}
                  onClick={() => setPreviewId(char.id)}
                  className={`p-3.5 rounded-2xl border transition flex flex-col justify-between gap-2.5 cursor-pointer shadow ${
                    isSelectedPreview
                      ? "bg-slate-800/90 border-amber-400 ring-2 ring-amber-400/40"
                      : "bg-slate-950/80 border-slate-800 hover:border-amber-500/40"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {char.gender === "MALE" ? "🧢" : "✨"}
                      </span>
                      <div>
                        <h4 className="font-fredoka font-bold text-xs sm:text-sm text-yellow-300">
                          {char.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {char.gender === "MALE" ? "Varón" : "Hembra"} • {char.specialBadge || char.tier}
                        </span>
                      </div>
                    </div>

                    {isEquipped ? (
                      <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        En Uso
                      </span>
                    ) : isUnlocked ? (
                      <span className="text-[9px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full font-bold">
                        Adquirido
                      </span>
                    ) : (
                      <span className="text-[9px] bg-slate-900 text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded-full font-mono flex items-center gap-1">
                        <Lock size={10} /> Bloqueado
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-300 line-clamp-2">
                    {char.description}
                  </p>

                  {/* Price or Achievement */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                    {isUnlocked ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 size={12} /> Listo para equipar
                      </span>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-amber-300 font-bold font-mono">
                          {char.price} VES
                        </span>
                        {char.requiredWins && (
                          <span className="text-[10px] text-yellow-400 font-mono">
                            o {char.requiredWins} Victorias 🏆
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Live Character Showcase Stage */}
          <div className="md:col-span-5 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-5 shadow-2xl flex flex-col items-center gap-4 relative overflow-hidden">
            <div className="w-full flex items-center justify-between text-xs border-b border-slate-800 pb-2">
              <span className="font-fredoka font-bold text-yellow-300">
                Vista Previa del Muñeco
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {previewCharacter.gender === "MALE" ? "Varón" : "Hembra"}
              </span>
            </div>

            {/* The Animated Character with their Bingo Card */}
            <div className="py-2">
              <AnimatedCharacter
                character={previewCharacter}
                holdingCard={true}
                cartonNumber={77}
                size="md"
                showBadge={false}
              />
            </div>

            <div className="text-center flex flex-col gap-1 w-full">
              <h4 className="font-fredoka text-base font-bold text-yellow-300">
                {previewCharacter.name}
              </h4>
              <p className="text-xs text-slate-300">
                {previewCharacter.description}
              </p>
            </div>

            {/* Action Buttons for Preview Character */}
            <div className="w-full flex flex-col gap-2 pt-2 border-t border-slate-800">
              {isPreviewEquipped ? (
                <div className="w-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs font-fredoka font-bold py-2.5 rounded-xl text-center flex items-center justify-center gap-1.5 shadow">
                  <CheckCircle2 size={14} /> ¡Este es tu muñeco activo actual!
                </div>
              ) : isPreviewUnlocked ? (
                <button
                  onClick={() => {
                    onSelectCharacter(previewCharacter.id);
                    onClose();
                  }}
                  className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-fredoka font-black py-2.5 rounded-xl shadow-lg transition active:scale-95 cursor-pointer text-xs"
                >
                  Equipar Este Muñeco
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  {/* Buy with Balance */}
                  <button
                    onClick={() => onBuyCharacter(previewCharacter)}
                    disabled={userBalance < previewCharacter.price}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-fredoka font-black py-2.5 rounded-xl shadow transition active:scale-95 cursor-pointer text-xs flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag size={14} /> Comprar por {previewCharacter.price.toFixed(2)} VES
                  </button>

                  {/* Unlock by Wins if eligible */}
                  {previewCharacter.requiredWins && (
                    <button
                      onClick={() => onUnlockByWins(previewCharacter)}
                      disabled={userWins < previewCharacter.requiredWins}
                      className="w-full bg-purple-900/80 hover:bg-purple-800 disabled:opacity-40 disabled:cursor-not-allowed text-purple-200 font-fredoka font-bold py-2 rounded-xl border border-purple-700/60 shadow transition text-xs flex items-center justify-center gap-1.5"
                    >
                      <Award size={14} /> Desbloquear Gratis ({userWins}/{previewCharacter.requiredWins} Victorias)
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
