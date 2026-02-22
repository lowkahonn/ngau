import { useEffect } from "react";

import AdSenseSlot from "./components/AdSenseSlot";
import GuidePages from "./features/app/components/GuidePages";
import HistoryPanel from "./features/app/components/HistoryPanel";
import PickerPanel from "./features/app/components/PickerPanel";
import RulesContent from "./features/app/components/RulesContent";
import ResultDialog from "./features/app/components/result/ResultDialog";
import { I18N } from "./features/app/content/i18n";
import LanguageThemeSwitches from "./features/shared/components/LanguageThemeSwitches";
import { useGnauStore } from "./store/useGnauStore";

export default function App() {
  const {
    error,
    result,
    pickedCards,
    history,
    language,
    theme,
    setLanguage,
    setTheme,
    addPickedCard,
    removePickedCard,
    analyze,
    clear,
    initializeHistory,
    loadHistoryHand,
    isResultDialogOpen,
    closeResultDialog
  } = useGnauStore();

  const t = I18N[language] ?? I18N["zh-Hant"];
  const isLight = theme === "light";
  const canAnalyze = pickedCards.length === 5;

  useEffect(() => {
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  useEffect(() => {
    initializeHistory();
  }, [initializeHistory]);

  return (
    <main className={isLight ? "min-h-screen bg-felt-pattern-light px-4 pb-8 pt-6 text-slate-900" : "min-h-screen bg-felt-pattern px-4 pb-8 pt-6 text-white"}>
      <section className="mx-auto w-full max-w-md space-y-4">
        <header className={isLight ? "rounded-3xl border border-slate-300 bg-white p-5 shadow-xl" : "rounded-3xl border border-white/20 bg-black/30 p-5 shadow-panel backdrop-blur-md"}>
          <div className="mb-3 flex justify-end">
            <LanguageThemeSwitches language={language} setLanguage={setLanguage} theme={theme} setTheme={setTheme} isLight={isLight} />
          </div>
          <h1 className={isLight ? "font-title text-3xl leading-tight text-slate-900" : "font-title text-3xl leading-tight"}>{t.title}</h1>
          <p className={isLight ? "mt-2 text-sm text-slate-700" : "mt-2 text-sm text-emerald-100/85"}>{t.subtitle}</p>
        </header>

        <section className={isLight ? "rounded-3xl border border-slate-300 bg-white p-4 shadow-xl" : "rounded-3xl border border-white/20 bg-black/30 p-4 shadow-panel backdrop-blur-md"}>
          <PickerPanel
            pickedCards={pickedCards}
            addPickedCard={addPickedCard}
            removePickedCard={removePickedCard}
            clear={clear}
            analyze={analyze}
            canAnalyze={canAnalyze}
            t={t}
            isLight={isLight}
          />

          {error ? <p className={isLight ? "mt-3 rounded-xl border border-red-300 bg-red-50 p-2 text-sm text-red-700" : "mt-3 rounded-xl border border-red-300/40 bg-red-500/10 p-2 text-sm text-red-100"}>{error}</p> : null}
        </section>

        <HistoryPanel history={history} t={t} language={language} isLight={isLight} loadHistoryHand={loadHistoryHand} />
        <RulesContent t={t} isLight={isLight} />
        <GuidePages t={t} language={language} isLight={isLight} />
        <AdSenseSlot isLight={isLight} />
      </section>

      <ResultDialog open={isResultDialogOpen} onClose={closeResultDialog} onReset={clear} result={result} t={t} language={language} isLight={isLight} />
    </main>
  );
}
