import React, { useMemo } from 'react';

interface SnowEffectProps {
  active: boolean;
}

export const SnowEffect: React.FC<SnowEffectProps> = ({ active }) => {
  const snowflakes = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      left: `${(i * 4.2 + (i % 3) * 2) % 100}%`,
      animationDuration: `${6 + (i % 7) * 1.5}s`,
      animationDelay: `${(i % 5) * 1.2}s`,
      fontSize: `${10 + (i % 4) * 5}px`,
      opacity: 0.25 + (i % 5) * 0.12,
    }));
  }, []);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden" aria-hidden="true">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="snow-flake"
          style={{
            left: flake.left,
            animationDuration: flake.animationDuration,
            animationDelay: flake.animationDelay,
            fontSize: flake.fontSize,
            opacity: flake.opacity,
          }}
        >
          ❄
        </div>
      ))}
    </div>
  );
};
