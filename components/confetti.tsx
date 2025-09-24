"use client";
import React from "react";

// Lightweight confetti: CSS-based bursts using inline elements to avoid heavy deps.
export const Confetti = ({ active = false }: { active?: boolean }) => {
  if (!active) return null;
  const pieces = Array.from({ length: 18 });
  return (
    <div
      aria-hidden
      className="confetti-root"
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      {pieces.map((_, i) => (
        <span key={i} className={`confetti-piece p-${i}`} />
      ))}
      <style jsx>{`
        .confetti-root {
          overflow: visible;
        }
        .confetti-piece {
          position: absolute;
          left: 50%;
          top: 20%;
          width: 8px;
          height: 16px;
          border-radius: 2px;
          transform-origin: center;
        }
        ${pieces
          .map((_, i) => {
            const angle = -90 + i * (180 / pieces.length);
            return `.p-${i} { background: linear-gradient(90deg, var(--brand-200), var(--brand-500)); transform: rotate(${angle}deg) translateY(${
              60 + i * 6
            }px); animation: confetti-fall 900ms ${
              i * 25
            }ms ease-out forwards; left: ${40 + i * 3}% }`;
          })
          .join("\n")}
        @keyframes confetti-fall {
          to {
            transform: translateY(300px) rotate(60deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Confetti;
