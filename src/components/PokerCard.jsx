import { suitText } from "../lib/gnau";

function parseDisplay(value) {
  const upper = value.toUpperCase();
  if (upper.startsWith("10")) {
    const suit = upper.slice(2);
    return { rank: "10", suit };
  }
  return { rank: upper[0], suit: upper.slice(1) };
}

export default function PokerCard({ value, compact = false, size = null }) {
  let sizeClass = "h-28 w-20";
  if (compact || size === "compact") sizeClass = "h-24 w-16";
  if (size === "tiny") sizeClass = "h-20 w-14";

  const { rank, suit } = parseDisplay(value);
  const suitSymbol = suitText[suit] ?? "";
  const isRed = suit === "H" || suit === "D";
  const tone = isRed ? "text-red-600" : "text-slate-900";
  const centerText = suitSymbol || rank;

  return (
    <div
      className={[
        "relative overflow-hidden rounded-xl border bg-white shadow-card",
        sizeClass,
        isRed ? "border-red-300" : "border-slate-300"
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.95),_rgba(241,245,249,0.92)_45%,_rgba(226,232,240,0.72)_100%)]" />

      <div className={["absolute left-1.5 top-1 z-10 flex flex-col items-center leading-none", tone].join(" ")}>
        <span className="text-[11px] font-bold">{rank}</span>
        {suitSymbol ? <span className="text-[11px]">{suitSymbol}</span> : null}
      </div>

      <div className={["absolute bottom-1 right-1.5 z-10 flex rotate-180 flex-col items-center leading-none", tone].join(" ")}>
        <span className="text-[11px] font-bold">{rank}</span>
        {suitSymbol ? <span className="text-[11px]">{suitSymbol}</span> : null}
      </div>

      <div className={["relative z-10 flex h-full flex-col items-center justify-center gap-1", tone].join(" ")}>
        <span className="text-2xl font-semibold tracking-wide">{centerText}</span>
        {suitSymbol ? <span className="text-xl">{suitSymbol}</span> : null}
      </div>
    </div>
  );
}
