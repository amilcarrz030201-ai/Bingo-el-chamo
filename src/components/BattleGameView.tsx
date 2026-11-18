import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BattleEngine } from '../game/battleEngine';
import { CharacterId, WeaponType, WeaponPickup, KillfeedEntry, FloatingDamage } from '../game/types';
import { BattleHUD } from './BattleHUD';
import { CharacterSelectModal } from './CharacterSelectModal';
import { GameOverModal } from './GameOverModal';
import { sounds } from '../game/soundEffects';

interface Props {
  onBackToBingo?: () => void;
}

export const BattleGameView: React.FC<Props> = ({ onBackToBingo }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<BattleEngine | null>(null);

  // Character selection
  const [selectedCharId, setSelectedCharId] = useState<CharacterId>('cj');
  const [showCharModal, setShowCharModal] = useState<boolean>(false);

  // Player combat stats
  const [health, setHealth] = useState<number>(100);
  const [maxHealth] = useState<number>(100);
  const [armor, setArmor] = useState<number>(100);
  const [maxArmor] = useState<number>(100);
  const [weapon, setWeapon] = useState<WeaponType>('fists');
  const [kills, setKills] = useState<number>(0);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);

  // UI state
  const [nearPickup, setNearPickup] = useState<WeaponPickup | null>(null);
  const [killfeed, setKillfeed] = useState<KillfeedEntry[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [gameOverStats, setGameOverStats] = useState<{ kills: number; timeAlive: number }>({
    kills: 0,
    timeAlive: 0,
  });

  // Floating damage indicators
  const [damageFloats, setDamageFloats] = useState<FloatingDamage[]>([]);

  // Sync callbacks via ref to avoid engine teardown on state update
  const callbacksRef = useRef({
    onPlayerStatsChange: (h: number, a: number, w: WeaponType, k: number, regen: boolean) => {
      setHealth(h);
      setArmor(a);
      setWeapon(w);
      setKills(k);
      setIsRegenerating(regen);
    },
    onKillfeed: (entry: KillfeedEntry) => {
      setKillfeed((prev) => [...prev.slice(-6), entry]);
    },
    onDamageFloat: (dmg: FloatingDamage) => {
      setDamageFloats((prev) => [...prev.slice(-8), dmg]);
      setTimeout(() => {
        setDamageFloats((prev) => prev.filter((d) => d.id !== dmg.id));
      }, 1000);
    },
    onNearPickupChange: (pickup: WeaponPickup | null) => {
      setNearPickup(pickup);
    },
    onGameOver: (_isVictory: boolean, stats: { kills: number; timeAlive: number }) => {
      setGameOverStats(stats);
      setIsGameOver(true);
    },
  });

  // Initialize 3D Battle Engine once
  useEffect(() => {
    if (!mountRef.current) return;

    const engine = new BattleEngine(
      mountRef.current,
      selectedCharId,
      callbacksRef.current
    );
    engineRef.current = engine;

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []); // Run once on mount

  // Sound toggle
  const handleToggleSound = useCallback(() => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.enabled = next;
    if (engineRef.current) {
      engineRef.current.settings.soundEnabled = next;
    }
  }, [soundEnabled]);

  // Player action handlers
  const handleAttack = useCallback(() => {
    engineRef.current?.triggerPlayerAttack();
  }, []);

  const handleJump = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.input.jump = true;
      setTimeout(() => {
        if (engineRef.current) engineRef.current.input.jump = false;
      }, 100);
    }
  }, []);

  const handlePickup = useCallback(() => {
    engineRef.current?.triggerPlayerPickup();
  }, []);

  const handleMoveInput = useCallback((forward: number, right: number) => {
    if (engineRef.current) {
      engineRef.current.input.forward = forward;
      engineRef.current.input.right = right;
    }
  }, []);

  const handleRestart = useCallback(() => {
    setIsGameOver(false);
    engineRef.current?.restartMatch(selectedCharId);
  }, [selectedCharId]);

  const handleConfirmCharacterSelect = useCallback(() => {
    setShowCharModal(false);
    setIsGameOver(false);
    engineRef.current?.restartMatch(selectedCharId);
  }, [selectedCharId]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950">
      {/* 1. Dedicated WebGL Mount Container (Isolated from HUD) */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* 2. Floating Damage Numbers (Screen Center FX) */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
        {damageFloats.map((dmg) => (
          <div
            key={dmg.id}
            style={{
              color: dmg.color,
              transform: `scale(${dmg.scale}) translateY(-20px)`,
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-black text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] animate-out fade-out slide-out-to-top duration-1000"
          >
            {dmg.text}
          </div>
        ))}
      </div>

      {/* Floating Back to Bingo Button */}
      {onBackToBingo && (
        <button
          type="button"
          onClick={onBackToBingo}
          className="fixed top-4 left-4 z-50 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow-2xl flex items-center gap-2 border-2 border-yellow-200 cursor-pointer active:scale-95 transition"
          title="Regresar a la Sala de Bingo el Chamo"
        >
          <span>⬅️</span>
          <span>Volver a Bingo el Chamo</span>
        </button>
      )}

      {/* 3. Interactive HUD Overlay */}
      <BattleHUD
        player={engineRef.current?.player || null}
        bots={engineRef.current?.bots || []}
        pickups={engineRef.current?.pickups || []}
        health={health}
        maxHealth={maxHealth}
        armor={armor}
        maxArmor={maxArmor}
        weapon={weapon}
        kills={kills}
        isRegenerating={isRegenerating}
        nearPickup={nearPickup}
        killfeed={killfeed}
        soundEnabled={soundEnabled}
        selectedCharId={selectedCharId}
        onToggleSound={handleToggleSound}
        onAttack={handleAttack}
        onJump={handleJump}
        onPickup={handlePickup}
        onMoveInput={handleMoveInput}
        onChangeCharacter={() => setShowCharModal(true)}
        onRestart={handleRestart}
      />

      {/* 4. Character Selection Modal */}
      <CharacterSelectModal
        isOpen={showCharModal}
        selectedId={selectedCharId}
        onSelect={(id) => setSelectedCharId(id)}
        onConfirm={handleConfirmCharacterSelect}
        onClose={() => setShowCharModal(false)}
      />

      {/* 5. Game Over Modal */}
      <GameOverModal
        isOpen={isGameOver}
        kills={gameOverStats.kills}
        timeAlive={gameOverStats.timeAlive}
        selectedCharId={selectedCharId}
        onRestart={handleRestart}
        onChangeCharacter={() => {
          setIsGameOver(false);
          setShowCharModal(true);
        }}
      />
    </div>
  );
};
