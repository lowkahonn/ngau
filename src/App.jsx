import { useMemo } from "react";
import PokerCard from "./components/PokerCard";
import { formatCards } from "./lib/gnau";
import { useGnauStore } from "./store/useGnauStore";

const RANK_OPTIONS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const ACE_SUIT_OPTIONS = [
  { value: "S", label: "♠", tone: "text-slate-100" },
  { value: "H", label: "♥", tone: "text-red-300" },
  { value: "D", label: "♦", tone: "text-red-300" },
  { value: "C", label: "♣", tone: "text-slate-100" }
];

function CardRail({ title, cards }) {
  if (!cards || cards.length === 0) return null;
  return (
    <section className="space-y-2">
      <p className="text-xs tracking-[0.18em] text-emerald-100/80">{title}</p>
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {cards.map((card, index) => (
          <PokerCard key={`${card}-${index}`} value={card} size="compact" />
        ))}
      </div>
    </section>
  );
}

function ArrangementRows({ pointCards, baseCards, labelTone = "text-emerald-100/80" }) {
  return (
    <section className="rounded-2xl border border-white/15 bg-black/20 p-3">
      <p className={["mb-2 text-xs tracking-[0.16em]", labelTone].join(" ")}>上排：點牌 2 張</p>
      <div className="flex justify-center gap-2">
        {pointCards.map((card, index) => (
          <PokerCard key={`point-${card}-${index}`} value={card} size="compact" />
        ))}
      </div>
      <p className={["mb-2 mt-3 text-xs tracking-[0.16em]", labelTone].join(" ")}>下排：底牌 3 張</p>
      <div className="flex justify-center gap-2">
        {baseCards.map((card, index) => (
          <PokerCard key={`base-${card}-${index}`} value={card} size="compact" />
        ))}
      </div>
    </section>
  );
}

function ResultPanel({ result }) {
  if (!result?.best) {
    return (
      <article className="rounded-3xl border border-amber-200/30 bg-amber-50/10 p-4 text-amber-50 backdrop-blur-sm">
        <p className="font-medium">找不到合法排法</p>
        <p className="mt-1 text-sm text-amber-100/80">目前這 5 張牌無法排出底為 10 的倍數。</p>
      </article>
    );
  }

  const { best, assumed, hasAce } = result;
  const baseCards = formatCards(best.baseCards, { useFace: true });
  const pointCards = formatCards(best.pointCards, { useFace: true });

  const assumedBase = assumed ? formatCards(assumed.baseCards, { useFace: true, assumeSpadeAce: true }) : [];
  const assumedPoint = assumed ? formatCards(assumed.pointCards, { useFace: true, assumeSpadeAce: true }) : [];

  return (
    <section className="space-y-4">
      <article className="rounded-3xl border border-white/20 bg-white/10 p-4 shadow-panel backdrop-blur-md">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-title text-lg tracking-[0.06em] text-white">最佳結果</h2>
          <span className="rounded-full bg-emerald-300/20 px-3 py-1 text-xs font-semibold text-emerald-100">
            {best.multiplier}x
          </span>
        </div>

        {best.name === "五張公" ? (
          <p className="mt-3 text-sm text-emerald-50">牌型：五張公</p>
        ) : (
          <div className="mt-3 space-y-3">
            <ArrangementRows pointCards={pointCards} baseCards={baseCards} />
            <p className="text-sm text-emerald-50">
              牌型：{best.name} ｜ 點數：{best.points} ｜ 倍數：{best.multiplier}倍
            </p>
          </div>
        )}
      </article>

      {hasAce && (
        <article className="rounded-3xl border border-amber-200/25 bg-amber-100/10 p-4 shadow-panel backdrop-blur-sm">
          <h3 className="font-title text-base tracking-[0.05em] text-amber-100">A 假設排法（A 當黑桃 A）</h3>
          {!assumed ? (
            <p className="mt-2 text-sm text-amber-50/85">無法排出牛冬菇（需 A + J/Q/K 且底為 10 的倍數）。</p>
          ) : (
            <div className="mt-3 space-y-3">
              <ArrangementRows pointCards={assumedPoint} baseCards={assumedBase} labelTone="text-amber-100/80" />
              <p className="text-sm text-amber-50">牌型：牛冬菇 ｜ 點數：1 ｜ 倍數：7倍</p>
            </div>
          )}
        </article>
      )}
    </section>
  );
}

function PickerPanel({ pickedCards, aceSuit, setAceSuit, addPickedCard, removePickedCard, disabled }) {
  return (
    <section className="mt-3 space-y-3 rounded-2xl border border-white/15 bg-black/20 p-3">
      <div>
        <p className="text-xs tracking-[0.18em] text-emerald-100/80">點選選牌（最多 5 張）</p>
        <div className="mt-2 grid grid-cols-5 gap-2">
          {Array.from({ length: 5 }, (_, index) => {
            const value = pickedCards[index];
            if (!value) {
              return (
                <div
                  key={`empty-${index}`}
                  className="flex h-20 w-14 items-center justify-center rounded-lg border border-dashed border-emerald-100/25 bg-black/25 text-xs text-emerald-100/50"
                >
                  +
                </div>
              );
            }
            return (
              <button
                key={`${value}-${index}`}
                type="button"
                onClick={() => removePickedCard(index)}
                className="rounded-lg active:scale-[0.98]"
                aria-label={`remove-card-${index}`}
              >
                <PokerCard value={value} size="tiny" />
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-xs tracking-[0.16em] text-emerald-100/75">A 花色</p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {ACE_SUIT_OPTIONS.map((option) => {
            const active = aceSuit === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setAceSuit(option.value)}
                className={[
                  "h-9 rounded-xl border text-sm font-semibold active:scale-[0.98]",
                  active ? "border-emerald-200 bg-emerald-100/20" : "border-white/20 bg-black/30",
                  option.tone
                ].join(" ")}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-xs tracking-[0.16em] text-emerald-100/75">牌面</p>
        <div className="mt-2 grid grid-cols-7 gap-2">
          {RANK_OPTIONS.map((rank) => (
            <button
              key={rank}
              type="button"
              onClick={() => addPickedCard(rank)}
              disabled={disabled}
              className="h-9 rounded-xl border border-white/20 bg-black/35 text-xs font-semibold text-emerald-50 disabled:opacity-40"
            >
              {rank}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const {
    input,
    preview,
    presets,
    error,
    result,
    pickedCards,
    aceSuit,
    setInput,
    applyPreset,
    setAceSuit,
    addPickedCard,
    removePickedCard,
    syncPickedFromInput,
    analyze,
    clear
  } = useGnauStore();

  const previewCards = useMemo(() => preview.map((card) => formatCards([card])[0]), [preview]);

  return (
    <main className="min-h-screen bg-felt-pattern px-4 pb-28 pt-6 text-white">
      <section className="mx-auto w-full max-w-md space-y-4">
        <header className="rounded-3xl border border-white/20 bg-black/30 p-5 shadow-panel backdrop-blur-md">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-emerald-200/80">Mobile Gnau Calculator</p>
          <h1 className="mt-2 font-title text-3xl leading-tight">Gnau / NiuNiu</h1>
          <p className="mt-2 text-sm text-emerald-100/85">點選或輸入 5 張牌，計算最佳排法。支援 10、A 花色、3/6 互換。</p>
        </header>

        <section className="rounded-3xl border border-white/20 bg-black/30 p-4 shadow-panel backdrop-blur-md">
          <label className="mb-2 block text-xs tracking-[0.18em] text-emerald-100/80">輸入牌組</label>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onBlur={syncPickedFromInput}
            placeholder="例如：AS 3 6 8 K"
            className="w-full rounded-2xl border border-emerald-200/30 bg-emerald-950/40 px-4 py-3 text-base text-white placeholder:text-emerald-200/55 focus:border-emerald-300 focus:outline-none"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => applyPreset(preset)}
                className="rounded-full border border-chip-ivory/35 bg-chip-dark/65 px-3 py-1.5 text-xs text-chip-ivory active:scale-[0.98]"
              >
                {preset}
              </button>
            ))}
          </div>

          <PickerPanel
            pickedCards={pickedCards}
            aceSuit={aceSuit}
            setAceSuit={setAceSuit}
            addPickedCard={addPickedCard}
            removePickedCard={removePickedCard}
            disabled={pickedCards.length >= 5}
          />

          {previewCards.length > 0 && <CardRail title="預覽" cards={previewCards} />}

          {error && (
            <p className="mt-3 rounded-xl border border-red-300/40 bg-red-500/10 p-2 text-sm text-red-100">{error}</p>
          )}
        </section>

        {result && <ResultPanel result={result} />}
      </section>

      <div className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-md px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <div className="grid grid-cols-2 gap-3 rounded-3xl border border-white/20 bg-black/55 p-3 backdrop-blur-md">
          <button
            type="button"
            onClick={clear}
            className="h-12 rounded-2xl border border-emerald-100/25 bg-emerald-950/50 font-semibold text-emerald-100 active:scale-[0.98]"
          >
            清除
          </button>
          <button
            type="button"
            onClick={analyze}
            className="h-12 rounded-2xl bg-chip-red font-semibold text-white shadow-lg shadow-red-950/40 active:scale-[0.98]"
          >
            計算
          </button>
        </div>
      </div>
    </main>
  );
}
