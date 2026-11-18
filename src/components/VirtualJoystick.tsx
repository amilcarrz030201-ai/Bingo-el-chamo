import React, { useRef, useState, useCallback, useEffect } from 'react';

interface VirtualJoystickProps {
  onMove: (forward: number, right: number) => void;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onMove }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);

  const maxRadius = 45;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setActive(true);
    touchIdRef.current = e.pointerId;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateKnob(e.clientX, e.clientY);
  };

  const updateKnob = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);

    let finalX = dx;
    let finalY = dy;

    if (dist > maxRadius) {
      finalX = (dx / dist) * maxRadius;
      finalY = (dy / dist) * maxRadius;
    }

    setKnobPos({ x: finalX, y: finalY });

    // Normalize forward (-Y) and right (+X)
    const normRight = finalX / maxRadius;
    const normForward = -finalY / maxRadius;
    onMove(normForward, normRight);
  }, [onMove]);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!active || e.pointerId !== touchIdRef.current) return;
    updateKnob(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.pointerId !== touchIdRef.current) return;
    setActive(false);
    touchIdRef.current = null;
    setKnobPos({ x: 0, y: 0 });
    onMove(0, 0);
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="relative w-28 h-28 rounded-full bg-slate-900/80 border-2 border-slate-600/80 flex items-center justify-center touch-none select-none shadow-xl active:border-cyan-500"
    >
      {/* Direction Crosslines */}
      <div className="absolute w-full h-[1px] bg-slate-700/50" />
      <div className="absolute h-full w-[1px] bg-slate-700/50" />

      {/* Joystick Knob */}
      <div
        style={{
          transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
        }}
        className={`w-12 h-12 rounded-full shadow-lg border-2 flex items-center justify-center transition-colors pointer-events-none ${
          active
            ? 'bg-cyan-500 border-cyan-200 text-white shadow-cyan-500/50'
            : 'bg-slate-700 border-slate-500 text-slate-300'
        }`}
      >
        <span className="text-xs font-bold">🕹️</span>
      </div>
    </div>
  );
};
