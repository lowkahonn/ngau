import { formatHandSummary } from "../../shared/gnau/handSummary";
import { formatSessionPeriod, formatTime } from "../lib/formatters";
import HandCardsRow from "./HandCardsRow";

export default function HistoryListPanel({ t, language, isLight, filteredRecords, daySessionGroups }) {
  return (
    <section className={isLight ? "space-y-3 rounded-3xl border border-slate-300 bg-white p-4 shadow-xl" : "space-y-3 rounded-3xl border border-white/20 bg-black/30 p-4 shadow-panel backdrop-blur-md"}>
      {filteredRecords.length === 0 ? (
        <p className={isLight ? "text-sm text-slate-600" : "text-sm text-emerald-100/75"}>{t.noHistory}</p>
      ) : (
        <div className="max-h-[34rem] space-y-2 overflow-y-auto pr-1">
          {daySessionGroups.map((dayGroup) => (
            <section key={`day-${dayGroup.dayKey}`} className={isLight ? "space-y-2 rounded-2xl border border-slate-300 bg-slate-50 p-3" : "space-y-2 rounded-2xl border border-white/20 bg-black/25 p-3"}>
              <h3 className={isLight ? "text-sm font-semibold text-slate-800" : "text-sm font-semibold text-emerald-50"}>{t.dayHeading(dayGroup.dayKey)}</h3>
              {dayGroup.sessions.map((session) => (
                <div key={`session-${dayGroup.dayKey}-${session.sessionId}`} className="space-y-1.5">
                  <p className={isLight ? "text-xs text-slate-600" : "text-xs text-emerald-100/70"}>{t.sessionHeading(formatSessionPeriod(session, language))}</p>
                  {session.hands.map((record) => (
                    <article key={record.id} className={isLight ? "rounded-xl border border-slate-300 bg-white p-2" : "rounded-xl border border-white/20 bg-black/20 p-2"}>
                      <div className="flex items-center justify-between">
                        <p className={isLight ? "text-xs text-slate-700" : "text-xs text-emerald-100/85"}>{record.best ? formatHandSummary(record.best, t, language) : t.noResult}</p>
                        <p className={isLight ? "text-[11px] text-slate-500" : "text-[11px] text-emerald-100/70"}>{t.at(formatTime(record.createdAt, language))}</p>
                      </div>
                      <HandCardsRow cards={record.cards} recordId={record.id} />
                    </article>
                  ))}
                </div>
              ))}
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
