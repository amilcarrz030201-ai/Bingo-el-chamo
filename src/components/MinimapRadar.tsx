import React, { useEffect, useRef } from 'react';
import { FighterEntity, WeaponPickup } from '../game/types';
import { STADIUM_BOUNDARY_RADIUS } from '../game/constants';

interface MinimapRadarProps {
  player: FighterEntity | null;
  bots: FighterEntity[];
  pickups: WeaponPickup[];
}

export const MinimapRadar: React.FC<MinimapRadarProps> = ({ player, bots, pickups }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const scale = (size * 0.45) / STADIUM_BOUNDARY_RADIUS;

    ctx.clearRect(0, 0, size, size);

    // Radar background circle
    ctx.beginPath();
    ctx.arc(center, center, size * 0.47, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Concentric radar grid rings
    [0.2, 0.4, 0.6, 0.8].forEach((r) => {
      ctx.beginPath();
      ctx.arc(center, center, (size * 0.45) * r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Baseball Diamond outline on radar
    // Bases: Home (0, 0), 1st (19, 19), 2nd (0, 38), 3rd (-19, 19)
    const toMapX = (worldX: number) => center + worldX * scale;
    const toMapY = (worldZ: number) => center - worldZ * scale;

    ctx.beginPath();
    ctx.moveTo(toMapX(0), toMapY(0));
    ctx.lineTo(toMapX(19), toMapY(19));
    ctx.lineTo(toMapX(0), toMapY(38));
    ctx.lineTo(toMapX(-19), toMapY(19));
    ctx.closePath();
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Weapon pickups (small yellow dots)
    pickups.forEach((p) => {
      if (!p.active) return;
      const px = toMapX(p.position.x);
      const py = toMapY(p.position.z);
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#facc15';
      ctx.fill();
    });

    // Bots (red dots)
    bots.forEach((b) => {
      if (b.isDead) return;
      const bx = toMapX(b.position.x);
      const by = toMapY(b.position.z);
      ctx.beginPath();
      ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Player (bright cyan blip with heading cone)
    if (player && !player.isDead) {
      const px = toMapX(player.position.x);
      const py = toMapY(player.position.z);

      // Orientation triangle
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(-player.rotationY);

      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(4, 5);
      ctx.lineTo(-4, 5);
      ctx.closePath();
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    }
  }, [player, bots, pickups]);

  return (
    <div className="flex flex-col items-center bg-slate-900/90 border border-slate-700/80 rounded-2xl p-2 shadow-2xl">
      <div className="flex items-center justify-between w-full px-1 mb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        <span>RADAR ESTADIO</span>
        <span className="text-emerald-400">EN VIVO</span>
      </div>
      <canvas
        ref={canvasRef}
        width={130}
        height={130}
        className="rounded-xl border border-slate-800"
      />
      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" /> Tú</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Rival</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Arma</span>
      </div>
    </div>
  );
};
