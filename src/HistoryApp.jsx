import { useEffect, useMemo, useState } from "react";
import PokerCard from "./components/PokerCard";
import {
  HAND_TYPE_FIVE_FACE,
  HAND_TYPE_NIU_DONG_GU,
  HAND_TYPE_PAIR,
  HAND_TYPE_POINTS_10,
  HAND_TYPE_POINTS_OTHER,
  NO_RESULT_NAME,
  clearHistoryRecords,
  listHistoryRecords,
  queryDaySessionGroups,
  queryHandTypeCounts,
  toHandTypeBucket
} from "./lib/historyDb";

const LANGUAGE_OPTIONS = [
  { value: "zh-Hant", label: "繁中" },
  { value: "zh-Hans", label: "简中" },
  { value: "en", label: "EN" }
];

const I18N = {
  "zh-Hant": {
    title: "歷史與統計",
    subtitle: "查看所有牌局紀錄，支援按日期與牌型篩選，並以停玩 1 小時自動分段。",
    back: "返回計算器",
    filtersTitle: "篩選",
    dayFilter: "日期",
    typeFilter: "牌型",
    allOption: "全部",
    clearAll: "清空歷史",
    clearConfirm: "確定要清空所有歷史紀錄嗎？",
    loading: "讀取中...",
    noHistory: "尚未有歷史紀錄。",
    statsTitle: "統計摘要",
    totalHands: (count) => `總手數：${count}`,
    filteredHands: (count) => `篩選後：${count}`,
    typeCounts: "牌型次數",
    typeClickHint: "點擊牌型次數按鈕可查看該牌型最近 3 手。",
    recentTypeHands: (name) => `${name} 最近 3 手`,
    dayHeading: (dayKey) => `日期：${dayKey}`,
    sessionHeading: (period) => `時間：${period}`,
    at: (time) => `時間：${time}`,
    noResult: "沒有點",
    points10: "10點",
    pointsOther: "其他點數",
    handLine: (name, points) => `牌型：${name} ｜ 點數：${points}`,
    handTypeOnly: (name) => `牌型：${name}`,
    errorPrefix: "讀取失敗："
  },
  "zh-Hans": {
    title: "历史与统计",
    subtitle: "查看所有牌局记录，支持按日期与牌型筛选，并按停玩 1 小时自动分段。",
    back: "返回计算器",
    filtersTitle: "筛选",
    dayFilter: "日期",
    typeFilter: "牌型",
    allOption: "全部",
    clearAll: "清空历史",
    clearConfirm: "确定要清空所有历史记录吗？",
    loading: "读取中...",
    noHistory: "尚未有历史记录。",
    statsTitle: "统计摘要",
    totalHands: (count) => `总手数：${count}`,
    filteredHands: (count) => `筛选后：${count}`,
    typeCounts: "牌型次数",
    typeClickHint: "点击牌型次数按钮可查看该牌型最近 3 手。",
    recentTypeHands: (name) => `${name} 最近 3 手`,
    dayHeading: (dayKey) => `日期：${dayKey}`,
    sessionHeading: (period) => `时间：${period}`,
    at: (time) => `时间：${time}`,
    noResult: "没有点",
    points10: "10点",
    pointsOther: "其他点数",
    handLine: (name, points) => `牌型：${name} ｜ 点数：${points}`,
    handTypeOnly: (name) => `牌型：${name}`,
    errorPrefix: "读取失败："
  },
  en: {
    title: "History and Stats",
    subtitle: "Browse all hands with filters by day and hand type, auto-grouped by 1 hour idle breaks.",
    back: "Back to Calculator",
    filtersTitle: "Filters",
    dayFilter: "Day",
    typeFilter: "Hand Type",
    allOption: "All",
    clearAll: "Clear History",
    clearConfirm: "Clear all persisted history?",
    loading: "Loading...",
    noHistory: "No persisted history yet.",
    statsTitle: "Stats Summary",
    totalHands: (count) => `Total hands: ${count}`,
    filteredHands: (count) => `Filtered: ${count}`,
    typeCounts: "Hand Type Counts",
    typeClickHint: "Click a hand type count to view the latest 3 hands of that type.",
    recentTypeHands: (name) => `Latest 3 ${name}`,
    dayHeading: (dayKey) => `Day: ${dayKey}`,
    sessionHeading: (sessionId) => `Session: ${sessionId}`,
    at: (time) => `Time: ${time}`,
    noResult: "No points",
    points10: "10 Points",
    pointsOther: "Other Points",
    handLine: (name, points) => `Type: ${name} | Points: ${points}`,
    handTypeOnly: (name) => `Type: ${name}`,
    errorPrefix: "Load failed: "
  }
};

function localizeHandName(name, language) {
  if (language === "en") {
    if (name === "五張公") return "Five Face";
    if (name === "牛冬菇") return "Niu Dong Gu";
    if (name === "孖寶") return "Pair";
    if (name === "10點") return "10 Points";
    const matched = name.match(/^(\d+)點$/);
    if (matched) return `${matched[1]} Points`;
  }
  return name;
}

function formatDisplayPoints(best) {
  if (best.name === "孖寶") {
    if (best.points === 11) return "J";
    if (best.points === 12) return "Q";
    if (best.points === 13) return "K";
  }
  return best.points;
}

function formatHandSummary(best, t, language) {
  const handName = localizeHandName(best.name, language);
  if (best.name === "牛冬菇" || best.name === "五張公" || /^\d+點$/.test(best.name)) {
    return t.handTypeOnly(handName);
  }
  return t.handLine(handName, formatDisplayPoints(best));
}

function formatHistoryTypeName(handName, t, language) {
  if (handName === NO_RESULT_NAME) return t.noResult;
  return localizeHandName(handName, language);
}

function formatHistoryTypeCountName(typeName, t, language) {
  if (typeName === HAND_TYPE_NIU_DONG_GU) return localizeHandName("牛冬菇", language);
  if (typeName === HAND_TYPE_FIVE_FACE) return localizeHandName("五張公", language);
  if (typeName === HAND_TYPE_PAIR) return localizeHandName("孖寶", language);
  if (typeName === HAND_TYPE_POINTS_10) return t.points10;
  if (typeName === HAND_TYPE_POINTS_OTHER) return t.pointsOther;
  if (typeName === NO_RESULT_NAME) return t.noResult;
  return localizeHandName(typeName, language);
}

function getLocale(language) {
  if (language === "zh-Hans") return "zh-CN";
  if (language === "zh-Hant") return "zh-HK";
  return "en-US";
}

function formatTime(timestamp, language) {
  return new Date(timestamp).toLocaleTimeString(getLocale(language), {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatSessionPeriod(session, language) {
  const start = formatTime(session.startAt, language);
  const end = formatTime(session.endAt, language);
  if (start === end) return start;
  return `${start} - ${end}`;
}

export default function HistoryApp() {
  const [language, setLanguage] = useState("zh-Hant");
  const [theme, setTheme] = useState("dark");
  const [allRecords, setAllRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [dayFilter, setDayFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedTypeCount, setSelectedTypeCount] = useState("");

  const t = I18N[language] ?? I18N["zh-Hant"];
  const isLight = theme === "light";

  useEffect(() => {
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  async function loadRecords() {
    setIsLoading(true);
    setError("");
    try {
      const records = await listHistoryRecords();
      setAllRecords(records);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : String(loadError));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadRecords();
  }, []);

  const dayOptions = useMemo(() => [...new Set(allRecords.map((record) => record.dayKey))].sort((a, b) => b.localeCompare(a)), [allRecords]);

  const typeOptions = useMemo(() => {
    let records = allRecords;
    if (dayFilter !== "all") records = records.filter((record) => record.dayKey === dayFilter);
    return [...new Set(records.map((record) => record.handName))];
  }, [allRecords, dayFilter]);

  useEffect(() => {
    if (typeFilter !== "all" && !typeOptions.includes(typeFilter)) {
      setTypeFilter("all");
    }
  }, [typeFilter, typeOptions]);

  const filteredRecords = useMemo(
    () =>
      allRecords.filter((record) => {
        if (dayFilter !== "all" && record.dayKey !== dayFilter) return false;
        if (typeFilter !== "all" && record.handName !== typeFilter) return false;
        return true;
      }),
    [allRecords, dayFilter, typeFilter]
  );

  const daySessionGroups = useMemo(() => queryDaySessionGroups(filteredRecords), [filteredRecords]);
  const typeCounts = useMemo(() => queryHandTypeCounts(filteredRecords), [filteredRecords]);
  const typeCountOptions = useMemo(() => typeCounts.map((item) => item.name), [typeCounts]);

  useEffect(() => {
    if (typeCountOptions.length === 0) {
      if (selectedTypeCount) setSelectedTypeCount("");
      return;
    }
    if (!selectedTypeCount || !typeCountOptions.includes(selectedTypeCount)) {
      setSelectedTypeCount(typeCountOptions[0]);
    }
  }, [selectedTypeCount, typeCountOptions]);

  const selectedTypeHands = useMemo(() => {
    if (!selectedTypeCount) return [];
    const matchedRecords = filteredRecords.filter((record) => toHandTypeBucket(record.handName) === selectedTypeCount);
    if (selectedTypeCount === HAND_TYPE_POINTS_OTHER) {
      return [...matchedRecords]
        .sort((a, b) => {
          const aPoints = Number(a.best?.points ?? 0);
          const bPoints = Number(b.best?.points ?? 0);
          if (aPoints !== bPoints) return bPoints - aPoints;
          return b.createdAt - a.createdAt;
        })
        .slice(0, 3);
    }
    return matchedRecords.slice(0, 3);
  }, [filteredRecords, selectedTypeCount]);

  async function handleClearAll() {
    if (!window.confirm(t.clearConfirm)) return;
    try {
      await clearHistoryRecords();
      setDayFilter("all");
      setTypeFilter("all");
      setSelectedTypeCount("");
      await loadRecords();
    } catch (clearError) {
      setError(clearError instanceof Error ? clearError.message : String(clearError));
    }
  }

  return (
    <main className={isLight ? "min-h-screen bg-felt-pattern-light px-4 pb-8 pt-6 text-slate-900" : "min-h-screen bg-felt-pattern px-4 pb-8 pt-6 text-white"}>
      <section className="mx-auto w-full max-w-4xl space-y-4">
        <header className={isLight ? "rounded-3xl border border-slate-300 bg-white p-5 shadow-xl" : "rounded-3xl border border-white/20 bg-black/30 p-5 shadow-panel backdrop-blur-md"}>
          <div className="mb-3 flex items-center justify-between gap-2">
            <a
              href="./"
              className={isLight ? "rounded-xl border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700" : "rounded-xl border border-white/20 bg-black/25 px-3 py-1 text-xs font-semibold text-emerald-100"}
            >
              {t.back}
            </a>
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className={isLight ? "h-8 rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-700" : "h-8 rounded-md border border-white/20 bg-black/30 px-2 text-xs text-emerald-100"}
                aria-label="language"
              >
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className={isLight ? "h-8 w-8 rounded-md border border-slate-300 bg-white text-sm text-slate-700" : "h-8 w-8 rounded-md border border-white/20 bg-black/30 text-sm text-emerald-100"}
                aria-label="toggle-theme"
              >
                {theme === "light" ? "☀" : "☾"}
              </button>
            </div>
          </div>
          <h1 className={isLight ? "font-title text-3xl leading-tight text-slate-900" : "font-title text-3xl leading-tight"}>{t.title}</h1>
          <p className={isLight ? "mt-2 text-sm text-slate-700" : "mt-2 text-sm text-emerald-100/85"}>{t.subtitle}</p>
        </header>

        <section className={isLight ? "space-y-3 rounded-3xl border border-slate-300 bg-white p-4 shadow-xl" : "space-y-3 rounded-3xl border border-white/20 bg-black/30 p-4 shadow-panel backdrop-blur-md"}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className={isLight ? "font-title text-xl text-slate-900" : "font-title text-xl text-emerald-50"}>{t.filtersTitle}</h2>
            <button
              type="button"
              onClick={handleClearAll}
              disabled={allRecords.length === 0}
              className={isLight ? "rounded-xl border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 disabled:opacity-40" : "rounded-xl border border-white/20 bg-black/25 px-3 py-1 text-xs font-semibold text-emerald-100 disabled:opacity-40"}
            >
              {t.clearAll}
            </button>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <label className={isLight ? "text-xs text-slate-700" : "text-xs text-emerald-100/80"}>
              {t.dayFilter}
              <select value={dayFilter} onChange={(event) => setDayFilter(event.target.value)} className={isLight ? "mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-2 text-sm text-slate-700" : "mt-1 h-10 w-full rounded-xl border border-white/20 bg-black/25 px-2 text-sm text-emerald-100"}>
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
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className={isLight ? "mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-2 text-sm text-slate-700" : "mt-1 h-10 w-full rounded-xl border border-white/20 bg-black/25 px-2 text-sm text-emerald-100"}>
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

        {error ? (
          <section className={isLight ? "rounded-3xl border border-red-300 bg-red-50 p-4 text-sm text-red-700" : "rounded-3xl border border-red-300/40 bg-red-500/10 p-4 text-sm text-red-100"}>{t.errorPrefix}{error}</section>
        ) : null}

        {isLoading ? (
          <section className={isLight ? "rounded-3xl border border-slate-300 bg-white p-4 text-sm text-slate-700 shadow-xl" : "rounded-3xl border border-white/20 bg-black/30 p-4 text-sm text-emerald-100/85 shadow-panel backdrop-blur-md"}>{t.loading}</section>
        ) : allRecords.length === 0 ? (
          <section className={isLight ? "rounded-3xl border border-slate-300 bg-white p-4 text-sm text-slate-700 shadow-xl" : "rounded-3xl border border-white/20 bg-black/30 p-4 text-sm text-emerald-100/85 shadow-panel backdrop-blur-md"}>{t.noHistory}</section>
        ) : (
          <>
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
                          <div className="mt-2 flex justify-center gap-1">
                            {record.cards.map((card, cardIndex) => (
                              <PokerCard key={`${record.id}-${card}-${cardIndex}`} value={card} size="tiny" />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </section>

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
                              <div className="mt-2 flex justify-center gap-1">
                                {record.cards.map((card, cardIndex) => (
                                  <PokerCard key={`${record.id}-${card}-${cardIndex}`} value={card} size="tiny" />
                                ))}
                              </div>
                            </article>
                          ))}
                        </div>
                      ))}
                    </section>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </section>
    </main>
  );
}
