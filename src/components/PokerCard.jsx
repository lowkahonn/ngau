import { suitText } from "../lib/gnau";

function parseDisplay(value) {
  const upper = value.toUpperCase();
  if (upper.startsWith("10")) {
    const suit = upper.slice(2);
    return { rank: "10", suit };
  }
  return { rank: upper[0], suit: upper.slice(1) };
}

export default function PokerCard({ value, compact = false }) {
  const { rank, suit } = parseDisplay(value);
  const suitSymbol = suitText[suit] ?? "";
  const isRed = suit === "H" || suit === "D";

  return (
    <div
      className={[
        "relative rounded-xl border bg-white shadow-card",
        compact ? "h-24 w-16" : "h-28 w-20",
        isRed ? "border-red-400" : "border-slate-300"
      ].join(" ")}
    >
      <div className={["absolute left-2 top-2 text-sm font-semibold", isRed ? "text-red-600" : "text-slate-900"].join(" ")}>
        {rank}
      </div>
      <div className={["absolute bottom-2 right-2 text-sm font-semibold", isRed ? "text-red-600" : "text-slate-900"].join(" ")}>
        {rank}
      </div>
      <div className={["flex h-full items-center justify-center text-3xl", isRed ? "text-red-600" : "text-slate-900"].join(" ")}>
        {suitSymbol || rank}
      </div>
    </div>
  );
}
