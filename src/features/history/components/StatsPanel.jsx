import { formatHandSummary } from "../../shared/gnau/handSummary";
import { formatHistoryTypeCountName, formatTime } from "../lib/formatters";
import HandCardsRow from "./HandCardsRow";

export default function StatsPanel({
  t,
  language,
  isLight,
  filteredRecords,
  typeCounts,
  selectedTypeCount,
  setSelectedTypeCount,
  selectedTypeHands
}) {
  return (
    <section className={isLight ? "space-y-3 rounded-3xl border border-slate-300 bg-white p-4 shadow-xl" : "space-y-3 rounded-3xl border border-white/20 bg-black/30 p-4 shadow-panel backdrop-blur-md"}>
      <h2 className={isLight ? "font-title text-xl text-slate-900" : "font-title text-xl text-emerald-50"}>{t.statsTitle}</h2>
      <p className={isLight ? "text-sm text-slate-700" : "text-sm text-emerald-100/85"}>{t.totalHands(filteredRecords.length)}</p>

      <div>
        <p className={isLight ? "mb-1 text-xs text-slate-600" : "mb-1 text-xs text-emerald-100/70"}>{t.typeCounts}</p>
        <div className="flex flex-wrap gap-1.5">
          {typeCounts.map((item) => (
            <button
              type="button"
              key={`type-count-${item.name}`}
              onClick={() => setSelectedTypeCount(item.name)}
              className={
                selectedTypeCount === item.name
                  ? "rounded-lg border border-emerald-400 bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-900"
                  : isLight
                    ? "rounded-lg border border-slate-300 bg-slate-50 px-2 py-0.5 text-xs text-slate-700"
                    : "rounded-lg border border-white/20 bg-black/20 px-2 py-0.5 text-xs text-emerald-100"
              }
            >
              {formatHistoryTypeCountName(item.name, t, language)} × {item.count}
            </button>
          ))}
        </div>
        <p className={isLight ? "mt-2 text-xs text-slate-500" : "mt-2 text-xs text-emerald-100/65"}>{t.typeClickHint}</p>
      </div>

      {selectedTypeCount ? (
        <div>
          <p className={isLight ? "mb-1 text-xs text-slate-600" : "mb-1 text-xs text-emerald-100/70"}>
            {t.recentTypeHands(formatHistoryTypeCountName(selectedTypeCount, t, language))}
          </p>
          {selectedTypeHands.length === 0 ? (
            <p className={isLight ? "text-xs text-slate-600" : "text-xs text-emerald-100/70"}>{t.noHistory}</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-3">
              {selectedTypeHands.map((record) => (
                <div key={`selected-type-${record.id}`} className={isLight ? "rounded-xl border border-slate-300 bg-slate-50 p-2" : "rounded-xl border border-white/20 bg-black/20 p-2"}>
                  <p className={isLight ? "text-xs text-slate-700" : "text-xs text-emerald-100/85"}>{record.best ? formatHandSummary(record.best, t, language) : t.noResult}</p>
                  <p className={isLight ? "mt-1 text-[11px] text-slate-500" : "mt-1 text-[11px] text-emerald-100/70"}>{t.at(formatTime(record.createdAt, language))}</p>
                  <HandCardsRow cards={record.cards} recordId={record.id} />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
