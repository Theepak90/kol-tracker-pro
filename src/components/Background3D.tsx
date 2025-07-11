import React from 'react';

interface Background3DProps {
  /** Optional start colour for radial gradient overlay */
  fromColor?: string;
  /** Optional end colour for radial gradient overlay */
  toColor?: string;
}

/**
 * Full-screen 3-D looking animated background.
 *
 * Renders multiple subtle radial-gradient layers plus animated "orbs"
 * that slowly drift using the existing `.floating-orb` keyframes declared in
 * `index.css`.  Because it sits on `-z-10` and `pointer-events-none`, page
 * content and interactions remain fully accessible.
 */
const Background3D: React.FC<Background3DProps> = ({
  fromColor = 'rgba(37, 99, 235, 0.08)', // primary / 8%
  toColor = 'rgba(124, 58, 237, 0.06)',  // accent   / 6%
}) => {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Multi-layer radial gradients for depth */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, ${fromColor} 0%, transparent 70%), 
            radial-gradient(circle at 80% 70%, ${toColor} 0%, transparent 70%),
            radial-gradient(circle at 40% 80%, rgba(34, 197, 94, 0.04) 0%, transparent 60%),
            radial-gradient(circle at 70% 20%, rgba(168, 85, 247, 0.05) 0%, transparent 60%)
          `,
        }}
      />

      {/* Large floating orbs - background layer */}
      {Array.from({ length: 12 }).map((_, i) => {
        const size = 280 + Math.random() * 220; // 280-500px
        const left = Math.random() * 120 - 10; // -10% to 110%
        const top = Math.random() * 120 - 10; // -10% to 110%
        const opacity = (0.02 + Math.random() * 0.03).toFixed(3); // 0.02-0.05
        const colors = [
          'rgba(37, 99, 235', // blue
          'rgba(124, 58, 237', // purple
          'rgba(34, 197, 94', // green
          'rgba(239, 68, 68', // red
          'rgba(245, 158, 11', // amber
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];
        return (
          <span
            key={`large-${i}`}
            className="absolute rounded-full blur-3xl floating-orb"
            style={{
              width: size,
              height: size,
              left: `${left}%`,
              top: `${top}%`,
              backgroundColor: `${color}, ${opacity})`,
              transform: `rotate(${Math.random() * 360}deg)`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${8 + Math.random() * 4}s`, // 8-12s
            }}
          />
        );
      })}

      {/* Medium floating orbs - mid layer */}
      {Array.from({ length: 8 }).map((_, i) => {
        const size = 150 + Math.random() * 100; // 150-250px
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const opacity = (0.04 + Math.random() * 0.04).toFixed(3); // 0.04-0.08
        return (
          <span
            key={`medium-${i}`}
            className="absolute rounded-full blur-2xl floating-orb"
            style={{
              width: size,
              height: size,
              left: `${left}%`,
              top: `${top}%`,
              backgroundColor: `rgba(255, 255, 255, ${opacity})`,
              transform: `rotate(${Math.random() * 360}deg)`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${6 + Math.random() * 3}s`, // 6-9s
            }}
          />
        );
      })}

      {/* Small floating orbs - foreground layer */}
      {Array.from({ length: 15 }).map((_, i) => {
        const size = 80 + Math.random() * 60; // 80-140px
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const opacity = (0.06 + Math.random() * 0.06).toFixed(3); // 0.06-0.12
        return (
          <span
            key={`small-${i}`}
            className="absolute rounded-full blur-xl floating-orb"
            style={{
              width: size,
              height: size,
              left: `${left}%`,
              top: `${top}%`,
              backgroundColor: `rgba(255, 255, 255, ${opacity})`,
              transform: `rotate(${Math.random() * 360}deg)`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${4 + Math.random() * 2}s`, // 4-6s
            }}
          />
        );
      })}

      {/* Subtle concentric rings for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_0%,transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.03)_0%,transparent_60%)]" />

      {/* Moving spotlight effects */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            conic-gradient(from 0deg at 30% 30%, rgba(37, 99, 235, 0.03) 0deg, transparent 60deg),
            conic-gradient(from 180deg at 70% 70%, rgba(124, 58, 237, 0.02) 0deg, transparent 90deg)
          `
        }}
      />
    </div>
  );
};

export default Background3D; 