import { useEffect, useMemo, useState } from "react";

const COLORS = ["#ef4444", "#f59e0b", "#eab308", "#22c55e", "#14b8a6", "#3b82f6", "#ec4899", "#f97316"];
const CONFETTI_CONFIG = {
  pieces: 58,
  bursts: 3,
  burstGapMs: 180,
  lifetimeMs: 5600,
  durationMinMs: 3800,
  durationMaxMs: 4700,
  sizeMin: 5,
  sizeMax: 10
};

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function shouldCelebrate(best) {
  if (!best) return null;
  return best.name === "牛冬菇" || best.multiplier >= 7 || best.name === "五張公" || best.name === "孖寶" || best.name === "10點";
}

function createPieces(burstIndex) {
  const config = CONFETTI_CONFIG;
  return Array.from({ length: config.pieces }, (_, index) => {
    const size = randomBetween(config.sizeMin, config.sizeMax);
    return {
      id: `confetti-${burstIndex}-${index}-${Math.random().toString(36).slice(2, 9)}`,
      left: `${randomBetween(2, 98)}%`,
      delay: `${randomBetween(0, 140)}ms`,
      duration: `${randomBetween(config.durationMinMs, config.durationMaxMs)}ms`,
      width: `${size}px`,
      height: `${Math.max(4, size * 0.55)}px`,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      drift: `${randomBetween(-110, 110)}px`,
      rotate: `${randomBetween(420, 1080)}deg`,
      radius: `${Math.round(randomBetween(1, 3))}px`
    };
  });
}

export default function ResultConfetti({ open, best }) {
  const shouldShow = useMemo(() => shouldCelebrate(best), [best]);
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (!open || !shouldShow) {
      setPieces([]);
      return undefined;
    }

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const config = CONFETTI_CONFIG;
    const timers = [];

    const spawn = (burstIndex) => {
      setPieces((current) => [...current, ...createPieces(burstIndex)]);
    };

    spawn(0);
    for (let burstIndex = 1; burstIndex < config.bursts; burstIndex += 1) {
      timers.push(
        window.setTimeout(() => {
          spawn(burstIndex);
        }, burstIndex * config.burstGapMs)
      );
    }

    const clearDelay = config.lifetimeMs + (config.bursts - 1) * config.burstGapMs + 250;
    timers.push(
      window.setTimeout(() => {
        setPieces([]);
      }, clearDelay)
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      setPieces([]);
    };
  }, [open, shouldShow, best?.name, best?.points, best?.multiplier]);

  if (!open || !shouldShow || pieces.length === 0) return null;

  return (
    <div className="confetti-layer" aria-hidden="true">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="confetti-piece"
          style={{
            left: piece.left,
            width: piece.width,
            height: piece.height,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
            backgroundColor: piece.color,
            borderRadius: piece.radius,
            "--confetti-drift": piece.drift,
            "--confetti-rotate": piece.rotate
          }}
        />
      ))}
    </div>
  );
}
