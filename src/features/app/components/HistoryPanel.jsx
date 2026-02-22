import PokerCard from "../../../components/PokerCard";
import { formatHandSummary } from "../../shared/gnau/handSummary";

export default function HistoryPanel({ history, t, language, isLight, loadHistoryHand }) {
  return (
    <section className={isLight ? "space-y-3 rounded-3xl border border-slate-300 bg-white p-4 shadow-xl" : "space-y-3 rounded-3xl border border-white/20 bg-black/30 p-4 shadow-panel backdrop-blur-md"}>
      <div className="flex items-center justify-between gap-2">
        <h2 className={isLight ? "font-title text-xl text-slate-900" : "font-title text-xl text-emerald-50"}>{t.historyTitle}</h2>
        <a
          href="./history.html"
          className={isLight ? "rounded-xl border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700" : "rounded-xl border border-white/20 bg-black/25 px-3 py-1 text-xs font-semibold text-emerald-100"}
        >
          {t.historyViewPage}
        </a>
      </div>

      {history.length === 0 ? (
        <p className={isLight ? "text-sm text-slate-600" : "text-sm text-emerald-100/75"}>{t.historyEmpty}</p>
      ) : (
        <div className="max-h-[22rem] space-y-2 overflow-y-auto pr-1">
          {history.map((entry, index) => {
            const summary = entry.best ? formatHandSummary(entry.best, t, language) : t.historyNoResult;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => loadHistoryHand(entry.cards)}
                className={isLight ? "w-full rounded-2xl border border-slate-300 bg-slate-50 p-2 text-left" : "w-full rounded-2xl border border-white/20 bg-black/25 p-2 text-left"}
              >
                <div className="flex items-center justify-between">
                  <span className={isLight ? "text-xs tracking-[0.14em] text-slate-500" : "text-xs tracking-[0.14em] text-emerald-100/70"}>#{index + 1}</span>
                  <span className={isLight ? "text-xs font-semibold text-emerald-700" : "text-xs font-semibold text-emerald-200"}>{t.historyLoad}</span>
                </div>
                <div className="mt-2 flex justify-center gap-1">
                  {entry.cards.map((card, cardIndex) => (
                    <PokerCard key={`${entry.id}-${card}-${cardIndex}`} value={card} size="tiny" />
                  ))}
                </div>
                <p className={isLight ? "mt-2 text-xs text-slate-700" : "mt-2 text-xs text-emerald-100/85"}>{summary}</p>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
