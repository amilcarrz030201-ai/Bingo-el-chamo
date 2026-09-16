import React from "react";
import { getBallLetter } from "../utils/bingo";

interface Props {
  currentBall: number | null;
  isSpinning?: boolean;
  size?: "sm" | "md" | "lg";
  showDrawnBall?: boolean;
}

// 12 mini colorful bingo balls tumbling inside the mesh sphere
const INTERNAL_BALLS = [
  { num: 7, letter: "B", color: "from-red-500 to-red-700", textColor: "text-white", x: 28, y: 35, delay: "0s" },
  { num: 19, letter: "I", color: "from-amber-400 to-amber-600", textColor: "text-slate-950", x: 62, y: 40, delay: "-0.4s" },
  { num: 33, letter: "N", color: "from-blue-500 to-blue-700", textColor: "text-white", x: 45, y: 65, delay: "-0.8s" },
  { num: 51, letter: "G", color: "from-emerald-500 to-emerald-700", textColor: "text-white", x: 70, y: 55, delay: "-1.2s" },
  { num: 68, letter: "O", color: "from-purple-500 to-purple-700", textColor: "text-white", x: 32, y: 60, delay: "-1.6s" },
  { num: 12, letter: "B", color: "from-pink-500 to-pink-700", textColor: "text-white", x: 50, y: 25, delay: "-2.0s" },
  { num: 28, letter: "I", color: "from-yellow-400 to-yellow-600", textColor: "text-slate-950", x: 22, y: 48, delay: "-2.4s" },
  { num: 42, letter: "N", color: "from-cyan-500 to-cyan-700", textColor: "text-slate-950", x: 74, y: 35, delay: "-2.8s" },
  { num: 58, letter: "G", color: "from-orange-500 to-orange-700", textColor: "text-white", x: 38, y: 42, delay: "-3.2s" },
  { num: 74, letter: "O", color: "from-violet-500 to-violet-700", textColor: "text-white", x: 58, y: 72, delay: "-3.6s" },
];

export const RotatingMeshTombola: React.FC<Props> = ({
  currentBall,
  isSpinning = true,
  size = "md",
  showDrawnBall = true,
}) => {
  const letter = currentBall ? getBallLetter(currentBall) : "";

  // Dimensions
  const dimensionClasses = {
    sm: "w-24 h-24",
    md: "w-36 h-36",
    lg: "w-52 h-52",
  }[size];

  const ballSizeClasses = {
    sm: "w-10 h-10 text-xs",
    md: "w-14 h-14 text-base",
    lg: "w-20 h-20 text-xl",
  }[size];

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* Outer Cage & Stand */}
      <div className="relative flex items-center justify-center">
        {/* Left Stand Arm */}
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-2 h-16 bg-gradient-to-b from-amber-600 via-yellow-500 to-amber-700 rounded-l-md border border-amber-400 shadow z-0" />
        {/* Right Stand Arm & Crank */}
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-2 h-16 bg-gradient-to-b from-amber-600 via-yellow-500 to-amber-700 rounded-r-md border border-amber-400 shadow z-0" />
        {/* Crank Handle */}
        <div
          className={`absolute -right-5 top-1/2 -translate-y-1/2 w-3 h-8 bg-amber-500 rounded-sm border border-amber-300 shadow origin-left ${
            isSpinning ? "animate-spin" : ""
          }`}
          style={{ animationDuration: isSpinning ? "3s" : "0s" }}
        />

        {/* Central Rotating Sphere Mesh Container */}
        <div
          className={`relative ${dimensionClasses} rounded-full overflow-hidden shadow-[inset_0_0_20px_rgba(245,158,11,0.5),0_10px_25px_rgba(0,0,0,0.8)] border-2 border-amber-400/90 bg-slate-950/90 z-10 flex items-center justify-center`}
        >
          {/* Internal ambient illumination */}
          <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-black/60 pointer-events-none" />

          {/* Tumbling Mini Balls inside the mesh cage */}
          <div className="absolute inset-2 overflow-hidden rounded-full pointer-events-none">
            {INTERNAL_BALLS.map((b, idx) => (
              <div
                key={idx}
                className={`absolute w-4 h-4 rounded-full bg-gradient-to-tr ${b.color} shadow-sm border border-white/40 flex items-center justify-center font-mono font-black text-[7px] ${b.textColor}`}
                style={{
                  left: `${b.x}%`,
                  top: `${b.y}%`,
                  animation: `tumbleBall 2.5s infinite ease-in-out`,
                  animationDelay: b.delay,
                  transform: `translate(-50%, -50%)`,
                }}
              >
                {b.num}
              </div>
            ))}
          </div>

          {/* Wire Mesh Spherical Grid Overlay (Rotating Continuously) */}
          <div
            className={`absolute inset-0 rounded-full pointer-events-none flex items-center justify-center ${
              isSpinning ? "animate-spin" : ""
            }`}
            style={{ animationDuration: "5s" }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full opacity-75">
              {/* Outer rim */}
              <circle cx="50" cy="50" r="48" fill="none" stroke="#f59e0b" strokeWidth="1.5" />

              {/* Longitudinal Wire Hoops (Mesh Curves) */}
              <ellipse cx="50" cy="50" rx="16" ry="48" fill="none" stroke="#fbbf24" strokeWidth="1" strokeDasharray="2 2" />
              <ellipse cx="50" cy="50" rx="32" ry="48" fill="none" stroke="#fbbf24" strokeWidth="1" strokeDasharray="2 2" />
              <ellipse cx="50" cy="50" rx="44" ry="48" fill="none" stroke="#fbbf24" strokeWidth="0.8" />

              {/* Latitudinal Wire Hoops */}
              <ellipse cx="50" cy="25" rx="42" ry="12" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 2" />
              <ellipse cx="50" cy="50" rx="48" ry="14" fill="none" stroke="#f59e0b" strokeWidth="1.2" />
              <ellipse cx="50" cy="75" rx="42" ry="12" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 2" />

              {/* Diagonal Diamond Wire Cross-Hatches */}
              <path d="M15 25 L85 75 M15 75 L85 25" stroke="#fef08a" strokeWidth="0.6" strokeOpacity="0.6" />
              <path d="M30 10 L70 90 M70 10 L30 90" stroke="#fef08a" strokeWidth="0.6" strokeOpacity="0.6" />

              {/* Center Axle Pin */}
              <circle cx="50" cy="50" r="4" fill="#d97706" stroke="#fbbf24" strokeWidth="1" />
            </svg>
          </div>

          {/* Front Ball Ejection / Chute Showcase (Shows current drawn ball) */}
          {showDrawnBall && currentBall && (
            <div
              key={currentBall}
              className={`relative z-20 ${ballSizeClasses} rounded-full bg-gradient-to-tr from-yellow-300 via-amber-400 to-amber-600 border-2 border-white shadow-[0_0_20px_rgba(245,158,11,0.8)] flex flex-col items-center justify-center text-slate-950 font-black select-none transform transition-all duration-300 scale-100 animate-in zoom-in-75`}
            >
              <span className="text-[9px] font-fredoka font-black leading-none text-red-700 tracking-wider">
                {letter}
              </span>
              <span className="font-fredoka font-black text-slate-950 leading-tight">
                {currentBall}
              </span>
              {/* Ball shine reflection */}
              <div className="absolute top-1 left-1.5 w-2.5 h-1.5 bg-white/70 rounded-full -rotate-45" />
            </div>
          )}

          {!currentBall && showDrawnBall && (
            <div className="relative z-20 bg-slate-900/80 border border-amber-400/50 rounded-full px-2.5 py-1 text-[10px] font-fredoka text-amber-300 shadow">
              En Giro...
            </div>
          )}
        </div>
      </div>

      {/* Stand Base */}
      <div className="w-20 sm:w-28 h-2.5 bg-gradient-to-r from-amber-700 via-yellow-500 to-amber-800 rounded-b-lg border-t border-amber-400 shadow-md -mt-1 z-0" />

      {/* CSS Keyframes for ball tumbling simulation */}
      <style>{`
        @keyframes tumbleBall {
          0% {
            transform: translate(-50%, -50%) scale(0.9) rotate(0deg);
          }
          25% {
            transform: translate(calc(-50% + 14px), calc(-50% - 10px)) scale(1.1) rotate(90deg);
          }
          50% {
            transform: translate(calc(-50% - 12px), calc(-50% + 12px)) scale(0.85) rotate(180deg);
          }
          75% {
            transform: translate(calc(-50% + 8px), calc(-50% + 14px)) scale(1.05) rotate(270deg);
          }
          100% {
            transform: translate(-50%, -50%) scale(0.9) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};
