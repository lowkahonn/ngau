import PokerCard from "../../../components/PokerCard";
import { ACE_SUIT_OPTIONS, RANK_OPTIONS } from "../constants/picker";

export default function PickerPanel({ pickedCards, addPickedCard, removePickedCard, clear, analyze, canAnalyze, t, isLight }) {
  const disabled = pickedCards.length >= 5;
  const hasCards = pickedCards.length > 0;

  return (
    <section className={isLight ? "mt-3 space-y-3 rounded-2xl border border-slate-300 bg-slate-100 p-3" : "mt-3 space-y-3 rounded-2xl border border-white/15 bg-black/20 p-3"}>
      <div>
        <div className="flex items-center justify-between">
          <p className={isLight ? "text-xs tracking-[0.18em] text-slate-700" : "text-xs tracking-[0.18em] text-emerald-100/80"}>{t.pickerTitle}</p>
          <p className={isLight ? "text-xs font-semibold text-emerald-700" : "text-xs font-semibold text-emerald-200"}>{t.pickerCount(pickedCards.length)}</p>
        </div>
        <p className={isLight ? "mt-1 text-xs text-slate-600" : "mt-1 text-xs text-emerald-100/65"}>{t.pickerHint}</p>
        <div className="mt-2 grid grid-cols-5 gap-1.5 sm:gap-2">
          {Array.from({ length: 5 }, (_, index) => {
            const value = pickedCards[index];
            if (!value) {
              return (
                <div
                  key={`empty-${index}`}
                  className={isLight ? "flex aspect-[3/4] w-full items-center justify-center rounded-lg border border-dashed border-slate-400 bg-white text-xs text-slate-500" : "flex aspect-[3/4] w-full items-center justify-center rounded-lg border border-dashed border-emerald-100/25 bg-black/25 text-xs text-emerald-100/50"}
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
                className="aspect-[3/4] w-full overflow-hidden rounded-lg active:scale-[0.98]"
                aria-label={`remove-card-${index}`}
              >
                <PokerCard value={value} size="picker" />
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className={isLight ? "text-xs tracking-[0.16em] text-slate-700" : "text-xs tracking-[0.16em] text-emerald-100/75"}>{t.pickerAces}</p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {ACE_SUIT_OPTIONS.map((option) => (
            <button
              key={option.token}
              type="button"
              onClick={() => addPickedCard(option.token)}
              disabled={disabled}
              aria-label={`add-${option.token}`}
              className={isLight ? "h-12 touch-manipulation rounded-2xl border border-slate-300 bg-white px-2 text-sm font-semibold text-slate-700 disabled:opacity-40" : "h-12 touch-manipulation rounded-2xl border border-white/20 bg-black/35 px-2 text-sm font-semibold text-emerald-50 disabled:opacity-40"}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className={isLight ? "text-xs tracking-[0.16em] text-slate-700" : "text-xs tracking-[0.16em] text-emerald-100/75"}>{t.pickerRanks}</p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {RANK_OPTIONS.map((rank) => (
            <button
              key={rank}
              type="button"
              onClick={() => addPickedCard(rank)}
              disabled={disabled}
              aria-label={`add-${rank}`}
              className={isLight ? "h-12 touch-manipulation rounded-2xl border border-slate-300 bg-white px-2 text-sm font-semibold text-slate-700 disabled:opacity-40" : "h-12 touch-manipulation rounded-2xl border border-white/20 bg-black/35 px-2 text-sm font-semibold text-emerald-50 disabled:opacity-40"}
            >
              {rank}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={clear}
          disabled={!hasCards}
          className={isLight ? "h-12 rounded-2xl border border-slate-300 bg-white text-sm font-semibold text-slate-700 active:scale-[0.98] disabled:opacity-40" : "h-12 rounded-2xl border border-white/20 bg-black/35 text-sm font-semibold text-emerald-100 active:scale-[0.98] disabled:opacity-40"}
        >
          {t.clear}
        </button>
        <button
          type="button"
          onClick={analyze}
          disabled={!canAnalyze}
          className="h-12 rounded-2xl bg-chip-red font-semibold text-white shadow-lg shadow-red-950/40 active:scale-[0.98] disabled:opacity-40"
        >
          {t.analyze}
        </button>
      </div>
    </section>
  );
}
