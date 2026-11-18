import React, { useState } from "react";
import confetti from "canvas-confetti";

interface HangingBaubleProps {
  color?: "red" | "gold" | "blue" | "emerald";
  size?: "sm" | "md" | "lg";
  stringLength?: number;
  className?: string;
}

export const HangingBauble: React.FC<HangingBaubleProps> = ({
  color = "red",
  size = "md",
  stringLength = 40,
  className = "",
}) => {
  const [sway, setSway] = useState(false);

  const colors = {
    red: { fill: "#ef4444", stroke: "#fee2e2", glow: "rgba(239, 68, 68, 0.6)" },
    gold: { fill: "#f59e0b", stroke: "#fef08a", glow: "rgba(245, 158, 11, 0.6)" },
    blue: { fill: "#3b82f6", stroke: "#dbeafe", glow: "rgba(59, 130, 246, 0.6)" },
    emerald: { fill: "#10b981", stroke: "#d1fae5", glow: "rgba(16, 185, 129, 0.6)" },
  }[color];

  const diameter = { sm: 26, md: 36, lg: 48 }[size];

  const handleClick = (e: React.MouseEvent) => {
    setSway(true);
    setTimeout(() => setSway(false), 2000);

    const rect = e.currentTarget.getBoundingClientRect();
    confetti({
      particleCount: 12,
      spread: 45,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      },
      colors: [colors.fill, "#ffffff", "#facc15"],
      shapes: ["circle"],
      scalar: 0.6,
      ticks: 80,
    });
  };

  return (
    <div
      onClick={handleClick}
      className={`inline-flex flex-col items-center select-none cursor-pointer group ${className} ${
        sway ? "anim-bauble-swing" : "hover:anim-bauble-swing"
      }`}
      title="🎄 Bambalina navideña - ¡Haz clic para balancearla!"
    >
      {/* Golden Thread String */}
      <div
        className="w-[1.5px] bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-600 shadow-xs"
        style={{ height: `${stringLength}px` }}
      />

      {/* Golden Hanging Crown / Cap */}
      <div className="w-3 h-2 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-600 rounded-t-sm border border-yellow-200/80 shadow-xs flex items-center justify-center">
        <div className="w-1.5 h-1 border border-yellow-500 rounded-full -mt-1.5" />
      </div>

      {/* Shiny Glass Bauble Sphere with Specular Highlights */}
      <div
        className="rounded-full shadow-lg relative flex items-center justify-center transition-transform group-hover:scale-105"
        style={{
          width: `${diameter}px`,
          height: `${diameter}px`,
          backgroundColor: colors.fill,
          boxShadow: `0 4px 15px ${colors.glow}, inset -4px -4px 10px rgba(0,0,0,0.4), inset 3px 3px 8px rgba(255,255,255,0.8)`,
        }}
      >
        {/* Curved Reflection */}
        <div className="absolute top-1.5 left-2 w-2.5 h-4 bg-white/70 rounded-full blur-[0.5px] transform -rotate-30" />
        {/* Soft Secondary Reflection */}
        <div className="absolute bottom-1.5 right-2 w-2 h-2 bg-white/30 rounded-full blur-[0.5px]" />
        {/* Festive Golden Snowflake / Pattern */}
        <span className="text-[10px] text-yellow-200/80 font-bold select-none opacity-80 pointer-events-none">
          ❄️
        </span>
      </div>
    </div>
  );
};

export const ChristmasCornerGarland: React.FC<{
  position?: "left" | "right";
  className?: string;
}> = ({ position = "left", className = "" }) => {
  const isRight = position === "right";

  return (
    <div
      className={`absolute top-0 ${
        isRight ? "right-0 -scale-x-100" : "left-0"
      } pointer-events-none select-none z-20 ${className}`}
      aria-hidden="true"
    >
      <svg width="140" height="110" viewBox="0 0 140 110" className="drop-shadow-lg overflow-visible">
        {/* Lush Pine Needle Sprigs */}
        <path
          d="M0,0 Q 40,20 70,10 Q 100,5 125,0 L 0,0 Z"
          fill="#14532d"
          stroke="#0f391b"
          strokeWidth="2"
        />
        <path
          d="M0,0 Q 30,35 60,30 Q 90,25 110,0 L 0,0 Z"
          fill="#166534"
        />
        <path
          d="M0,0 Q 20,45 45,40 Q 70,35 90,0 L 0,0 Z"
          fill="#22c55e"
          opacity="0.9"
        />
        {/* Snow Dusting */}
        <path
          d="M 10,25 Q 35,32 55,25 Q 75,20 95,0"
          fill="none"
          stroke="#f8fafc"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.8"
        />
        {/* Red Holly Berries with Leaf */}
        <circle cx="35" cy="28" r="4.5" fill="#ef4444" stroke="#7f1d1d" strokeWidth="0.8" />
        <circle cx="43" cy="30" r="4.5" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.8" />
        <circle cx="38" cy="36" r="4.5" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="0.8" />
        <circle cx="34" cy="27" r="1.2" fill="#ffffff" opacity="0.8" />

        {/* Tiny Golden Bells */}
        <g transform="translate(68, 18)">
          <path d="M 0,0 L 8,0 L 10,10 L -2,10 Z" fill="#facc15" stroke="#b45309" strokeWidth="0.8" />
          <circle cx="4" cy="11" r="2" fill="#ca8a04" />
        </g>
      </svg>
    </div>
  );
};

export const ChristmasFestiveBanner: React.FC<{
  title?: string;
  subtitle?: string;
  className?: string;
}> = ({
  title = "¡Feliz Navidad en Bingo el Chamo!",
  subtitle = "Gran Tómbola Festiva • 80% de Premio al Ganador",
  className = "",
}) => {
  return (
    <div
      className={`relative w-full rounded-2xl bg-gradient-to-r from-red-950 via-emerald-950 to-red-950 border-2 border-yellow-400/60 p-2.5 sm:p-3 shadow-xl overflow-hidden text-center flex flex-col sm:flex-row items-center justify-between gap-2.5 ${className}`}
    >
      {/* Background holiday sparkles */}
      <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-24 h-24 bg-red-600/20 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-24 h-24 bg-emerald-600/20 rounded-full blur-xl pointer-events-none" />

      {/* Left Festive Pine & Candy Cane */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-2xl sm:text-3xl animate-bounce">🎄</span>
        <div className="text-left">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] bg-red-600 text-white font-mono font-black px-2 py-0.2 rounded-full uppercase border border-red-300">
              Temporada Navideña
            </span>
            <span className="text-[10px] bg-emerald-700 text-emerald-100 font-mono font-bold px-2 py-0.2 rounded-full border border-emerald-500">
              Edición Especial
            </span>
          </div>
          <h2 className="font-fredoka text-sm sm:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400">
            {title}
          </h2>
        </div>
      </div>

      {/* Center Subtitle */}
      <p className="text-xs text-slate-200 font-medium hidden md:block">
        {subtitle}
      </p>

      {/* Right Hanging Baubles & Gift */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xl sm:text-2xl">🎁</span>
        <span className="text-xl sm:text-2xl anim-star-shine">⭐</span>
        <span className="text-xl sm:text-2xl">🎅</span>
      </div>
    </div>
  );
};
