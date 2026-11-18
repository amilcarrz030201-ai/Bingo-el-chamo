import React from "react";

interface ChristmasLightsProps {
  className?: string;
  count?: number;
  compact?: boolean;
}

const BULB_COLORS = [
  { color: "#ef4444", glow: "rgba(239, 68, 68, 0.75)", text: "text-red-500", anim: "anim-twinkle-1" },
  { color: "#facc15", glow: "rgba(250, 204, 21, 0.8)", text: "text-yellow-400", anim: "anim-twinkle-2" },
  { color: "#10b981", glow: "rgba(16, 185, 129, 0.75)", text: "text-emerald-500", anim: "anim-twinkle-3" },
  { color: "#3b82f6", glow: "rgba(59, 130, 246, 0.75)", text: "text-blue-500", anim: "anim-twinkle-1" },
  { color: "#ec4899", glow: "rgba(236, 72, 153, 0.75)", text: "text-pink-500", anim: "anim-twinkle-2" },
  { color: "#06b6d4", glow: "rgba(6, 182, 212, 0.75)", text: "text-cyan-400", anim: "anim-twinkle-3" },
  { color: "#f97316", glow: "rgba(249, 115, 22, 0.75)", text: "text-orange-500", anim: "anim-twinkle-1" },
  { color: "#a855f7", glow: "rgba(168, 85, 247, 0.75)", text: "text-purple-500", anim: "anim-twinkle-2" },
];

export const ChristmasLights: React.FC<ChristmasLightsProps> = ({
  className = "",
  count = 32,
  compact = false,
}) => {
  const bulbs = Array.from({ length: count }, (_, i) => {
    const config = BULB_COLORS[i % BULB_COLORS.length];
    return {
      id: i,
      ...config,
      delay: `${(i % 5) * 0.35}s`,
    };
  });

  return (
    <div
      className={`w-full overflow-hidden pointer-events-none select-none relative z-25 ${className}`}
      aria-hidden="true"
    >
      {/* Decorative Dark Garland Wire */}
      <svg
        className="w-full h-4 sm:h-5 absolute top-0 left-0"
        preserveAspectRatio="none"
        viewBox="0 0 1000 20"
      >
        <path
          d="M0,4 Q 30,14 60,4 T 120,4 T 180,4 T 240,4 T 300,4 T 360,4 T 420,4 T 480,4 T 540,4 T 600,4 T 660,4 T 720,4 T 780,4 T 840,4 T 900,4 T 960,4 L 1000,4"
          fill="none"
          stroke="#1e3a1e"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M0,3 Q 30,13 60,3 T 120,3 T 180,3 T 240,3 T 300,3 T 360,3 T 420,3 T 480,3 T 540,3 T 600,3 T 660,3 T 720,3 T 780,3 T 840,3 T 900,3 T 960,3 L 1000,3"
          fill="none"
          stroke="#0f2410"
          strokeWidth="1.2"
        />
      </svg>

      {/* Array of glowing fairy light bulbs */}
      <div className="flex justify-between items-start px-2 relative pt-1">
        {bulbs.map((bulb, idx) => {
          // slight natural vertical offset like hanging on a curve
          const isEven = idx % 2 === 0;
          return (
            <div
              key={bulb.id}
              className="flex flex-col items-center shrink-0"
              style={{
                marginTop: isEven ? (compact ? "1px" : "3px") : (compact ? "4px" : "7px"),
              }}
            >
              {/* Green Socket Base */}
              <div
                className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-950 rounded-t-sm border border-emerald-800/80 shadow-xs"
                style={{ backgroundColor: "#06230f" }}
              />

              {/* Glowing Bulb Body */}
              <div
                className={`${compact ? "w-2.5 h-3.5 sm:w-3 sm:h-4" : "w-3 h-4 sm:w-3.5 sm:h-5"} rounded-full shadow-md ${bulb.anim} relative`}
                style={{
                  backgroundColor: bulb.color,
                  boxShadow: `0 0 10px ${bulb.glow}, 0 0 20px ${bulb.glow}, inset -1px -1px 3px rgba(0,0,0,0.35), inset 1px 1px 2px rgba(255,255,255,0.7)`,
                  animationDelay: bulb.delay,
                  color: bulb.color,
                }}
              >
                {/* Shiny Specular Highlight */}
                <div className="absolute top-0.5 left-0.5 w-1 h-1.5 bg-white/70 rounded-full blur-[0.4px] pointer-events-none" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
