import React, { useState } from "react";
import confetti from "canvas-confetti";

interface ChristmasTreeProps {
  size?: "sm" | "md" | "lg" | "compact";
  className?: string;
  showPresents?: boolean;
  interactive?: boolean;
}

export const ChristmasTree: React.FC<ChristmasTreeProps> = ({
  size = "md",
  className = "",
  showPresents = true,
  interactive = true,
}) => {
  const [isSparkling, setIsSparkling] = useState(false);

  const sizeClasses = {
    compact: "w-16 h-22 sm:w-20 sm:h-26",
    sm: "w-24 h-32 sm:w-28 sm:h-38",
    md: "w-32 h-44 sm:w-40 sm:h-52",
    lg: "w-44 h-60 sm:w-52 sm:h-72",
  }[size];

  const handleTreeClick = (e: React.MouseEvent) => {
    if (!interactive) return;
    setIsSparkling(true);
    setTimeout(() => setIsSparkling(false), 800);

    // Fire cute festive star sparkles from tree position
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 3) / window.innerHeight;

    confetti({
      particleCount: 22,
      spread: 60,
      origin: { x, y },
      colors: ["#facc15", "#ef4444", "#10b981", "#38bdf8", "#ffffff"],
      shapes: ["star", "circle"],
      scalar: 0.85,
      ticks: 120,
    });
  };

  return (
    <div
      onClick={handleTreeClick}
      title={interactive ? "🎄 ¡Toca el árbol para pedir un deseo de Navidad!" : "Árbol de Navidad"}
      className={`relative inline-flex flex-col items-center select-none transition-transform duration-300 ${
        interactive ? "cursor-pointer hover:scale-105 active:scale-95" : ""
      } ${isSparkling ? "scale-110" : ""} ${className}`}
    >
      {/* Radiant Glow Behind the Tree */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* The SVG Christmas Tree */}
      <svg
        viewBox="0 0 200 260"
        className={`${sizeClasses} drop-shadow-xl overflow-visible`}
        aria-hidden="true"
      >
        <defs>
          {/* Gradients for Pine Layers */}
          <linearGradient id="treeGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#15803d" />
            <stop offset="50%" stopColor="#166534" />
            <stop offset="100%" stopColor="#14532d" />
          </linearGradient>
          <linearGradient id="treeGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="70%" stopColor="#15803d" />
            <stop offset="100%" stopColor="#0f391b" />
          </linearGradient>

          {/* Star Gold Gradient */}
          <linearGradient id="starGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>

          {/* Bauble Gradients */}
          <radialGradient id="baubleRed" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="40%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </radialGradient>
          <radialGradient id="baubleGold" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="45%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#78350f" />
          </radialGradient>
          <radialGradient id="baubleBlue" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="45%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </radialGradient>
          <radialGradient id="baublePink" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fbcfe8" />
            <stop offset="45%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#831843" />
          </radialGradient>
        </defs>

        {/* Tree Trunk */}
        <rect x="86" y="215" width="28" height="32" rx="4" fill="#78350f" stroke="#451a03" strokeWidth="2" />
        <line x1="94" y1="218" x2="94" y2="242" stroke="#5c2605" strokeWidth="2" strokeLinecap="round" />
        <line x1="106" y1="220" x2="106" y2="242" stroke="#5c2605" strokeWidth="2" strokeLinecap="round" />

        {/* Tree Base Shadow */}
        <ellipse cx="100" cy="245" rx="55" ry="10" fill="rgba(0,0,0,0.3)" />

        {/* Layer 3 - Bottom Wide Pine Tier */}
        <path
          d="M 100 135 L 140 170 L 125 175 L 175 220 C 145 210, 55 210, 25 220 L 75 175 L 60 170 Z"
          fill="url(#treeGrad1)"
          stroke="#0f391b"
          strokeWidth="2.5"
        />
        {/* Snow on Bottom Tier */}
        <path
          d="M 28 219 C 55 212, 145 212, 172 219 C 158 222, 140 216, 126 219 C 110 216, 90 221, 75 218 C 60 220, 42 216, 28 219 Z"
          fill="#f1f5f9"
          opacity="0.9"
        />

        {/* Layer 2 - Middle Pine Tier */}
        <path
          d="M 100 85 L 135 125 L 120 130 L 160 170 C 135 160, 65 160, 40 170 L 80 130 L 65 125 Z"
          fill="url(#treeGrad2)"
          stroke="#0f391b"
          strokeWidth="2.5"
        />
        {/* Snow on Middle Tier */}
        <path
          d="M 43 169 C 65 162, 135 162, 157 169 C 144 172, 125 167, 110 170 C 95 167, 75 172, 60 169 C 52 171, 45 168, 43 169 Z"
          fill="#f1f5f9"
          opacity="0.9"
        />

        {/* Layer 1 - Top Pine Tier */}
        <path
          d="M 100 40 L 135 90 L 115 95 L 145 130 C 125 122, 75 122, 55 130 L 85 95 L 65 90 Z"
          fill="url(#treeGrad1)"
          stroke="#0f391b"
          strokeWidth="2.5"
        />
        {/* Snow on Top Tier */}
        <path
          d="M 58 129 C 75 123, 125 123, 142 129 C 130 132, 112 127, 100 130 C 88 127, 70 131, 58 129 Z"
          fill="#f1f5f9"
          opacity="0.9"
        />

        {/* Golden Spiraling Tinsel Garland */}
        <path
          d="M 85 70 Q 100 82 118 78"
          fill="none"
          stroke="#facc15"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="1,5"
        />
        <path
          d="M 70 110 Q 100 128 135 120"
          fill="none"
          stroke="#facc15"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="1,5"
        />
        <path
          d="M 50 155 Q 100 180 155 165"
          fill="none"
          stroke="#facc15"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="1,6"
        />

        {/* Hanging Colorful Shiny Baubles */}
        {/* Top Baubles */}
        <circle cx="90" cy="85" r="5.5" fill="url(#baubleRed)" stroke="#fee2e2" strokeWidth="0.8" />
        <circle cx="112" cy="92" r="5.5" fill="url(#baubleGold)" stroke="#fef08a" strokeWidth="0.8" />

        {/* Middle Baubles */}
        <circle cx="72" cy="125" r="6.5" fill="url(#baubleBlue)" stroke="#dbeafe" strokeWidth="0.8" />
        <circle cx="102" cy="132" r="6.5" fill="url(#baublePink)" stroke="#fce7f3" strokeWidth="0.8" />
        <circle cx="128" cy="128" r="6.5" fill="url(#baubleRed)" stroke="#fee2e2" strokeWidth="0.8" />

        {/* Bottom Baubles */}
        <circle cx="52" cy="172" r="7.5" fill="url(#baubleGold)" stroke="#fef08a" strokeWidth="0.8" />
        <circle cx="85" cy="180" r="7.5" fill="url(#baubleRed)" stroke="#fee2e2" strokeWidth="0.8" />
        <circle cx="118" cy="175" r="7.5" fill="url(#baubleBlue)" stroke="#dbeafe" strokeWidth="0.8" />
        <circle cx="148" cy="178" r="7.5" fill="url(#baublePink)" stroke="#fce7f3" strokeWidth="0.8" />

        {/* Mini Twinkling Fairy Lights on Tree */}
        <circle cx="100" cy="62" r="3" fill="#fef08a" className="anim-twinkle-1" style={{ color: "#fef08a" }} />
        <circle cx="82" cy="100" r="3" fill="#ef4444" className="anim-twinkle-2" style={{ color: "#ef4444" }} />
        <circle cx="120" cy="110" r="3" fill="#38bdf8" className="anim-twinkle-3" style={{ color: "#38bdf8" }} />
        <circle cx="65" cy="148" r="3.5" fill="#facc15" className="anim-twinkle-1" style={{ color: "#facc15" }} />
        <circle cx="100" cy="158" r="3.5" fill="#10b981" className="anim-twinkle-2" style={{ color: "#10b981" }} />
        <circle cx="138" cy="150" r="3.5" fill="#ec4899" className="anim-twinkle-3" style={{ color: "#ec4899" }} />
        <circle cx="70" cy="195" r="3.5" fill="#38bdf8" className="anim-twinkle-1" style={{ color: "#38bdf8" }} />
        <circle cx="105" cy="202" r="3.5" fill="#facc15" className="anim-twinkle-2" style={{ color: "#facc15" }} />
        <circle cx="135" cy="198" r="3.5" fill="#ef4444" className="anim-twinkle-3" style={{ color: "#ef4444" }} />

        {/* Tree Top Glowing Star */}
        <g className="anim-star-shine" style={{ transformOrigin: "100px 32px" }}>
          {/* Outer Star Glow Rays */}
          <circle cx="100" cy="32" r="16" fill="rgba(250, 204, 21, 0.4)" filter="blur(3px)" />
          {/* Golden 5-point Star */}
          <polygon
            points="100,14 105,26 118,27 108,36 111,49 100,42 89,49 92,36 82,27 95,26"
            fill="url(#starGold)"
            stroke="#fef08a"
            strokeWidth="1.5"
          />
          {/* Star Center Bright Diamond */}
          <polygon points="100,24 103,32 100,40 97,32" fill="#ffffff" opacity="0.9" />
        </g>
      </svg>

      {/* Wrapped Gift Presents Under the Tree */}
      {showPresents && (
        <div className="flex items-end justify-center -mt-4 gap-1 relative z-10">
          {/* Red Gift Box with Gold Ribbon */}
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-600 rounded-md border border-red-400 shadow-md relative flex items-center justify-center transform -rotate-6">
            <div className="absolute inset-x-0 h-1.5 bg-yellow-400" />
            <div className="absolute inset-y-0 w-1.5 bg-yellow-400" />
            <div className="absolute -top-1.5 text-[10px] text-yellow-300 font-bold">🎀</div>
          </div>

          {/* Gold / Blue Gift Box */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-md border border-blue-400 shadow-lg relative flex items-center justify-center">
            <div className="absolute inset-x-0 h-2 bg-yellow-300" />
            <div className="absolute inset-y-0 w-2 bg-yellow-300" />
            <div className="absolute -top-2 text-xs text-yellow-200 font-bold">🎀</div>
          </div>

          {/* Green Gift Box */}
          <div className="w-5 h-5 sm:w-7 sm:h-7 bg-emerald-600 rounded-md border border-emerald-400 shadow-md relative flex items-center justify-center transform rotate-6">
            <div className="absolute inset-x-0 h-1 bg-red-500" />
            <div className="absolute inset-y-0 w-1 bg-red-500" />
            <div className="absolute -top-1.5 text-[9px] text-red-200">🎀</div>
          </div>
        </div>
      )}
    </div>
  );
};
