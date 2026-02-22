import PokerCard from "../../../../components/PokerCard";
import { formatCards } from "../../../../lib/gnau";
import { formatHandSummary } from "../../../shared/gnau/handSummary";

function ArrangementRows({ pointCards, baseCards, pointLabel, baseLabel, isLight }) {
  return (
    <section className={isLight ? "rounded-2xl border border-slate-300 bg-slate-100 p-3" : "rounded-2xl border border-white/15 bg-black/20 p-3"}>
      <p className={isLight ? "mb-2 text-xs tracking-[0.16em] text-emerald-900/80" : "mb-2 text-xs tracking-[0.16em] text-emerald-100/80"}>{pointLabel}</p>
      <div className="flex justify-center gap-2">
        {pointCards.map((card, index) => (
          <PokerCard key={`point-${card}-${index}`} value={card} size="compact" />
        ))}
      </div>
      <p className={isLight ? "mb-2 mt-3 text-xs tracking-[0.16em] text-emerald-900/80" : "mb-2 mt-3 text-xs tracking-[0.16em] text-emerald-100/80"}>{baseLabel}</p>
      <div className="flex justify-center gap-2">
        {baseCards.map((card, index) => (
          <PokerCard key={`base-${card}-${index}`} value={card} size="compact" />
        ))}
      </div>
    </section>
  );
}

function AllCardsRow({ cards, label, isLight }) {
  return (
    <section className={isLight ? "rounded-2xl border border-slate-300 bg-slate-100 p-3" : "rounded-2xl border border-white/15 bg-black/20 p-3"}>
      <p className={isLight ? "mb-2 text-xs tracking-[0.16em] text-emerald-900/80" : "mb-2 text-xs tracking-[0.16em] text-emerald-100/80"}>{label}</p>
      <div className="flex justify-center gap-2">
        {cards.map((card, index) => (
          <PokerCard key={`all-${card}-${index}`} value={card} size="compact" />
        ))}
      </div>
    </section>
  );
}

export default function ResultPanel({ result, t, language, isLight }) {
  if (!result?.best) {
    return (
      <article className={isLight ? "rounded-3xl border border-amber-300 bg-amber-50 p-4 text-amber-900" : "rounded-3xl border border-amber-200/30 bg-amber-50/10 p-4 text-amber-50"}>
        <p className="font-medium">{t.noResultTitle}</p>
        <p className={isLight ? "mt-1 text-sm text-amber-800" : "mt-1 text-sm text-amber-100/80"}>{t.noResultBody}</p>
      </article>
    );
  }

  const { best } = result;
  const baseCards = formatCards(best.baseCards, { useFace: true });
  const pointCards = formatCards(best.pointCards, { useFace: true });
  const allCards = formatCards(result.cards ?? [], { useFace: true });

  return (
    <section className="space-y-4">
      <article className={isLight ? "rounded-3xl border border-slate-300 bg-white p-4 shadow-xl" : "rounded-3xl border border-white/20 bg-white/10 p-4 shadow-panel backdrop-blur-md"}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className={isLight ? "font-title text-lg tracking-[0.06em] text-slate-900" : "font-title text-lg tracking-[0.06em] text-white"}>{t.bestResult}</h2>
        </div>

        {best.name === "五張公" ? (
          <div className="mt-3 space-y-3">
            <AllCardsRow cards={allCards} label={t.allCardsRow} isLight={isLight} />
            <p className={isLight ? "text-sm text-slate-800" : "text-sm text-emerald-50"}>{formatHandSummary(best, t, language)}</p>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            <ArrangementRows pointCards={pointCards} baseCards={baseCards} pointLabel={t.pointRow} baseLabel={t.baseRow} isLight={isLight} />
            <p className={isLight ? "text-sm text-slate-800" : "text-sm text-emerald-50"}>{formatHandSummary(best, t, language)}</p>
          </div>
        )}
      </article>
    </section>
  );
}
