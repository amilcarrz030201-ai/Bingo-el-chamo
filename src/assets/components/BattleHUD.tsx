import React, { useState } from 'react';
import { WeaponType, WeaponPickup, KillfeedEntry, CharacterId } from '../game/types';
import { WEAPONS, CHARACTERS } from '../game/constants';
import { MinimapRadar } from './MinimapRadar';
import { VirtualJoystick } from './VirtualJoystick';
import { FighterEntity } from '../game/types';
import {
  Heart,
  Shield,
  Volume2,
  VolumeX,
  RotateCcw,
  Users,
  Trophy,
  Swords,
  Sparkles,
  HelpCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

interface BattleHUDProps {
  player: FighterEntity | null;
  bots: FighterEntity[];
  pickups: WeaponPickup[];
  health: number;
  maxHealth: number;
  armor: number;
  maxArmor: number;
  weapon: WeaponType;
  kills: number;
  isRegenerating: boolean;
  nearPickup: WeaponPickup | null;
  killfeed: KillfeedEntry[];
  soundEnabled: boolean;
  selectedCharId: CharacterId;
  onToggleSound: () => void;
  onAttack: () => void;
  onJump: () => void;
  onPickup: () => void;
  onMoveInput: (forward: number, right: number) => void;
  onChangeCharacter: () => void;
  onRestart: () => void;
}

export const BattleHUD: React.FC<BattleHUDProps> = ({
  player,
  bots,
  pickups,
  health,
  maxHealth,
  armor,
  maxArmor,
  weapon,
  kills,
  isRegenerating,
  nearPickup,
  killfeed,
  soundEnabled,
  selectedCharId,
  onToggleSound,
  onAttack,
  onJump,
  onPickup,
  onMoveInput,
  onChangeCharacter,
  onRestart,
}) => {
  const [hudCollapsed, setHudCollapsed] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const weaponDef = WEAPONS[weapon] || WEAPONS.fists;
  const charDef = CHARACTERS[selectedCharId] || CHARACTERS.cj;

  const healthPercent = Math.max(0, Math.min(100, (health / maxHealth) * 100));
  const armorPercent = Math.max(0, Math.min(100, (armor / maxArmor) * 100));

  const aliveBots = bots.filter((b) => !b.isDead).length;

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden font-sans">
      {/* 1. TOP HEADER BAR */}
      <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-3 pointer-events-auto">
        {/* Top Left: Arena Title & Minimap */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-2xl shadow-lg">
            <span className="text-xl">{charDef.iconEmoji}</span>
            <div>
              <div className="text-xs font-black text-white leading-none flex items-center gap-1.5">
                <span>ESTADIO ROYALE</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  3D BATTLE
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
                Jugando como: <span className="text-cyan-400 font-bold">{charDef.name}</span>
              </div>
            </div>
          </div>

          {/* Minimap Radar */}
          <MinimapRadar player={player} bots={bots} pickups={pickups} />
        </div>

        {/* Top Center: Match Stats */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-4 py-2 rounded-2xl shadow-lg">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold border-r border-slate-700 pr-3">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>KILLS: <strong className="text-white text-sm font-black">{kills}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
            <Users className="w-4 h-4 text-rose-400" />
            <span>RIVALES: <strong className="text-white text-sm font-black">{aliveBots}</strong></span>
          </div>
        </div>

        {/* Top Right: Buttons & Killfeed */}
        <div className="flex flex-col items-end gap-2">
          {/* Action buttons */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 p-1 rounded-2xl shadow-lg">
            <button
              onClick={onToggleSound}
              title={soundEnabled ? 'Silenciar Sonido' : 'Activar Sonido'}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
            </button>

            <button
              onClick={onChangeCharacter}
              title="Cambiar Personaje"
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-800/80 cursor-pointer transition-colors flex items-center gap-1"
            >
              <span>{charDef.iconEmoji}</span>
              <span className="hidden sm:inline">Personajes</span>
            </button>

            <button
              onClick={() => setShowHelp(!showHelp)}
              title="Guía de Controles"
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              onClick={onRestart}
              title="Reiniciar Batalla"
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Killfeed Notifications */}
          <div className="flex flex-col gap-1 w-56">
            {killfeed.slice(-4).map((kf) => (
              <div
                key={kf.id}
                className="bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-xl text-[11px] shadow-md flex items-center justify-between text-slate-200"
              >
                <span className="font-bold text-cyan-400 truncate max-w-[75px]">{kf.killer}</span>
                <span className="text-[10px] text-amber-400 px-1 font-semibold flex items-center gap-0.5">
                  <Swords className="w-3 h-3 inline" /> {kf.weapon}
                </span>
                <span className="font-bold text-rose-400 truncate max-w-[75px]">{kf.victim}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. PICKUP NOTIFICATION BANNER (When player is near a weapon) */}
      {nearPickup && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 pointer-events-auto">
          <button
            onClick={onPickup}
            className="flex items-center gap-3 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 px-5 py-2.5 rounded-2xl shadow-2xl shadow-amber-500/30 border-2 border-amber-300 font-black cursor-pointer active:scale-95 transition-all animate-bounce"
          >
            <span className="text-2xl">{WEAPONS[nearPickup.type]?.icon || '📦'}</span>
            <div className="text-left">
              <div className="text-[10px] uppercase tracking-wider text-amber-950 font-extrabold">
                ARMA ENCONTRADA EN EL CAMPO
              </div>
              <div className="text-sm font-black text-slate-950">
                [E] Agarrar {WEAPONS[nearPickup.type]?.name}
              </div>
            </div>
          </button>
        </div>
      )}

      {/* 3. REGENERATION STATUS FLOATING BADGE */}
      {isRegenerating && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-emerald-950/90 border border-emerald-500/80 px-3.5 py-1 rounded-full shadow-lg text-emerald-300 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Regenerando Salud (+18 HP/s)</span>
        </div>
      )}

      {/* 4. CONTROLS GUIDE OVERLAY MODAL */}
      {showHelp && (
        <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center p-4 pointer-events-auto z-40">
          <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-black text-white mb-3 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-cyan-400" /> CONTROLES DE LA BATALLA
            </h3>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between p-2 rounded-xl bg-slate-800/80">
                <span>Moverse:</span>
                <span className="font-mono text-cyan-300 font-bold">WASD / Flechas o Joystick</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-slate-800/80">
                <span>Rotar Cámara 3ra Persona:</span>
                <span className="font-mono text-cyan-300 font-bold">Arrastrar Ratón / Táctil</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-slate-800/80">
                <span>Golpear / Atacar con Arma:</span>
                <span className="font-mono text-cyan-300 font-bold">Tecla F / Clic / Botón Golpe</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-slate-800/80">
                <span>Agarrar Armas del Estadio:</span>
                <span className="font-mono text-cyan-300 font-bold">Tecla E / Botón Agarrar</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-slate-800/80">
                <span>Saltar:</span>
                <span className="font-mono text-cyan-300 font-bold">Barra Espaciadora / Botón Salto</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-slate-800/80">
                <span>Regeneración de Vida:</span>
                <span className="text-emerald-400 font-semibold">Se regenera tras 4s sin recibir daño</span>
              </div>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="w-full mt-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* 5. ON-SCREEN TOUCH CONTROLS (Mobile / Tablet) */}
      <div className="absolute bottom-5 left-5 pointer-events-auto sm:hidden">
        <VirtualJoystick onMove={onMoveInput} />
      </div>

      <div className="absolute bottom-5 right-5 flex flex-col items-end gap-3 pointer-events-auto sm:hidden">
        {/* Pickup Button */}
        {nearPickup && (
          <button
            onClick={onPickup}
            className="w-14 h-14 rounded-full bg-amber-500 border-2 border-amber-300 text-slate-950 font-black text-lg flex items-center justify-center shadow-lg active:scale-90"
          >
            ✋
          </button>
        )}

        <div className="flex items-center gap-3">
          {/* Jump Button */}
          <button
            onClick={onJump}
            className="w-13 h-13 rounded-full bg-slate-800 border-2 border-slate-600 text-white font-black text-sm flex items-center justify-center shadow-lg active:scale-90"
          >
            ⬆️
          </button>

          {/* Attack Button */}
          <button
            onClick={onAttack}
            className="w-18 h-18 rounded-full bg-gradient-to-br from-rose-500 to-red-600 border-3 border-rose-300 text-white font-black text-2xl flex items-center justify-center shadow-xl shadow-rose-600/40 active:scale-90"
          >
            {weaponDef.icon}
          </button>
        </div>
      </div>

      {/* 6. COLLAPSIBLE BOTTOM HUD DOCK (Pinned to bottom center, zero-pill discipline) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 pointer-events-auto flex flex-col items-center">
        {/* Collapse toggle button */}
        <button
          onClick={() => setHudCollapsed(!hudCollapsed)}
          className="mb-1 text-[11px] font-bold text-slate-400 hover:text-slate-200 bg-slate-900/80 px-2.5 py-0.5 rounded-t-lg border-t border-x border-slate-700/80 flex items-center gap-1 cursor-pointer transition-colors"
        >
          {hudCollapsed ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          {hudCollapsed ? 'Mostrar Barras de Combate' : 'Ocultar'}
        </button>

        {!hudCollapsed && (
          <div className="w-full bg-slate-900/95 border-2 border-slate-700/90 rounded-2xl p-3 shadow-2xl flex flex-col sm:flex-row items-center gap-3">
            {/* Health & Armor Bars */}
            <div className="flex-1 w-full space-y-2">
              {/* Health (Vida) */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-0.5">
                  <span className="flex items-center gap-1.5 text-rose-400">
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                    VIDA
                  </span>
                  <span className="text-white font-mono">
                    {Math.round(health)} / {maxHealth} HP
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700/80">
                  <div
                    style={{ width: `${healthPercent}%` }}
                    className={`h-full transition-all duration-200 ${
                      healthPercent > 50
                        ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                        : healthPercent > 25
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                        : 'bg-gradient-to-r from-rose-600 to-red-500 animate-pulse'
                    }`}
                  />
                </div>
              </div>

              {/* Armor (Chaleco blindado) */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-0.5">
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <Shield className="w-3.5 h-3.5 fill-cyan-500 text-cyan-500" />
                    CHALECO BLINDADO
                  </span>
                  <span className="text-white font-mono">
                    {Math.round(armor)} / {maxArmor} AP
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/80">
                  <div
                    style={{ width: `${armorPercent}%` }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Equipped Weapon Badge */}
            <div className="flex items-center gap-3 bg-slate-800/90 border border-slate-700 px-3 py-2 rounded-xl shrink-0 w-full sm:w-auto justify-between sm:justify-start">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shadow-inner">
                {weaponDef.icon}
              </div>
              <div className="text-left">
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  ARMA EQUIPADA
                </div>
                <div className="text-sm font-black text-white leading-tight">
                  {weaponDef.name}
                </div>
                <div className="text-[11px] text-slate-400">
                  Daño: <strong className="text-amber-300">{weaponDef.damage}</strong> | Alcance: {weaponDef.range}m
                </div>
              </div>

              {/* Quick Attack Button for PC/touch in dock */}
              <button
                onClick={onAttack}
                className="hidden sm:flex px-4 py-2 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-500/20 active:scale-95 transition-all items-center gap-1 cursor-pointer"
              >
                <Swords className="w-3.5 h-3.5" /> [F] GOLPEAR
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
