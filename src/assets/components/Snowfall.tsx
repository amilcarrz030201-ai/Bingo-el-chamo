import React, { useEffect, useState } from "react";

export const Snowfall: React.FC = () => {
  const [flakes, setFlakes] = useState<Array<{ id: number; left: string; size: string; duration: string; delay: string; opacity: number }>>([]);

  useEffect(() => {
    const flakeList = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}vw`,
      size: `${Math.random() * 5 + 3}px`,
      duration: `${Math.random() * 7 + 5}s`,
      delay: `${Math.random() * 5}s`,
      opacity: Math.random() * 0.7 + 0.3,
    }));
    setFlakes(flakeList);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden" aria-hidden="true">
      {flakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake"
          style={{
            left: flake.left,
            width: flake.size,
            height: flake.size,
            animationDuration: flake.duration,
            animationDelay: flake.delay,
            opacity: flake.opacity,
          }}
        />
      ))}
    </div>
  );
};
