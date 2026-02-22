import { useEffect, useMemo, useState } from "react";

import FiltersPanel from "./features/history/components/FiltersPanel";
import HistoryHeader from "./features/history/components/HistoryHeader";
import HistoryListPanel from "./features/history/components/HistoryListPanel";
import StatsPanel from "./features/history/components/StatsPanel";
import { HISTORY_I18N } from "./features/history/content/i18n";
import {
  HAND_TYPE_POINTS_OTHER,
  clearHistoryRecords,
  listHistoryRecords,
  queryDaySessionGroups,
  queryHandTypeCounts,
  toHandTypeBucket
} from "./lib/historyDb";

export default function HistoryApp() {
  const [language, setLanguage] = useState("zh-Hant");
  const [theme, setTheme] = useState("dark");
  const [allRecords, setAllRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [dayFilter, setDayFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedTypeCount, setSelectedTypeCount] = useState("");

  const t = HISTORY_I18N[language] ?? HISTORY_I18N["zh-Hant"];
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

  const dayOptions = useMemo(
    () => [...new Set(allRecords.map((record) => record.dayKey))].sort((a, b) => b.localeCompare(a)),
    [allRecords]
  );

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

  const statusCardClass = isLight
    ? "rounded-3xl border border-slate-300 bg-white p-4 text-sm text-slate-700 shadow-xl"
    : "rounded-3xl border border-white/20 bg-black/30 p-4 text-sm text-emerald-100/85 shadow-panel backdrop-blur-md";

  return (
    <main className={isLight ? "min-h-screen bg-felt-pattern-light px-4 pb-8 pt-6 text-slate-900" : "min-h-screen bg-felt-pattern px-4 pb-8 pt-6 text-white"}>
      <section className="mx-auto w-full max-w-4xl space-y-4">
        <HistoryHeader t={t} language={language} setLanguage={setLanguage} theme={theme} setTheme={setTheme} isLight={isLight} />

        <FiltersPanel
          t={t}
          isLight={isLight}
          allRecordsCount={allRecords.length}
          dayFilter={dayFilter}
          setDayFilter={setDayFilter}
          dayOptions={dayOptions}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          typeOptions={typeOptions}
          language={language}
          onClearAll={handleClearAll}
        />

        {error ? (
          <section className={isLight ? "rounded-3xl border border-red-300 bg-red-50 p-4 text-sm text-red-700" : "rounded-3xl border border-red-300/40 bg-red-500/10 p-4 text-sm text-red-100"}>
            {t.errorPrefix}
            {error}
          </section>
        ) : null}

        {isLoading ? <section className={statusCardClass}>{t.loading}</section> : null}

        {!isLoading && allRecords.length === 0 ? <section className={statusCardClass}>{t.noHistory}</section> : null}

        {!isLoading && allRecords.length > 0 ? (
          <>
            <StatsPanel
              t={t}
              language={language}
              isLight={isLight}
              filteredRecords={filteredRecords}
              typeCounts={typeCounts}
              selectedTypeCount={selectedTypeCount}
              setSelectedTypeCount={setSelectedTypeCount}
              selectedTypeHands={selectedTypeHands}
            />
            <HistoryListPanel t={t} language={language} isLight={isLight} filteredRecords={filteredRecords} daySessionGroups={daySessionGroups} />
          </>
        ) : null}
      </section>
    </main>
  );
}
