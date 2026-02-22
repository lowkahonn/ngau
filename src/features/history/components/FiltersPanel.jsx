import { formatHistoryTypeName } from "../lib/formatters";

export default function FiltersPanel({
  t,
  isLight,
  allRecordsCount,
  dayFilter,
  setDayFilter,
  dayOptions,
  typeFilter,
  setTypeFilter,
  typeOptions,
  language,
  onClearAll
}) {
  return (
    <section className={isLight ? "space-y-3 rounded-3xl border border-slate-300 bg-white p-4 shadow-xl" : "space-y-3 rounded-3xl border border-white/20 bg-black/30 p-4 shadow-panel backdrop-blur-md"}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className={isLight ? "font-title text-xl text-slate-900" : "font-title text-xl text-emerald-50"}>{t.filtersTitle}</h2>
        <button
          type="button"
          onClick={onClearAll}
          disabled={allRecordsCount === 0}
          className={isLight ? "rounded-xl border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 disabled:opacity-40" : "rounded-xl border border-white/20 bg-black/25 px-3 py-1 text-xs font-semibold text-emerald-100 disabled:opacity-40"}
        >
          {t.clearAll}
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <label className={isLight ? "text-xs text-slate-700" : "text-xs text-emerald-100/80"}>
          {t.dayFilter}
          <select
            value={dayFilter}
            onChange={(event) => setDayFilter(event.target.value)}
            className={isLight ? "mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-2 text-sm text-slate-700" : "mt-1 h-10 w-full rounded-xl border border-white/20 bg-black/25 px-2 text-sm text-emerald-100"}
          >
            <option value="all">{t.allOption}</option>
            {dayOptions.map((dayKey) => (
              <option key={`day-${dayKey}`} value={dayKey}>
                {dayKey}
              </option>
            ))}
          </select>
        </label>

        <label className={isLight ? "text-xs text-slate-700" : "text-xs text-emerald-100/80"}>
          {t.typeFilter}
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className={isLight ? "mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-2 text-sm text-slate-700" : "mt-1 h-10 w-full rounded-xl border border-white/20 bg-black/25 px-2 text-sm text-emerald-100"}
          >
            <option value="all">{t.allOption}</option>
            {typeOptions.map((handName) => (
              <option key={`type-${handName}`} value={handName}>
                {formatHistoryTypeName(handName, t, language)}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
