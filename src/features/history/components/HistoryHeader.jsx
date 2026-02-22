import LanguageThemeSwitches from "../../shared/components/LanguageThemeSwitches";

export default function HistoryHeader({ t, language, setLanguage, theme, setTheme, isLight }) {
  return (
    <header className={isLight ? "rounded-3xl border border-slate-300 bg-white p-5 shadow-xl" : "rounded-3xl border border-white/20 bg-black/30 p-5 shadow-panel backdrop-blur-md"}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <a
          href="./"
          className={isLight ? "rounded-xl border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700" : "rounded-xl border border-white/20 bg-black/25 px-3 py-1 text-xs font-semibold text-emerald-100"}
        >
          {t.back}
        </a>
        <LanguageThemeSwitches language={language} setLanguage={setLanguage} theme={theme} setTheme={setTheme} isLight={isLight} />
      </div>
      <h1 className={isLight ? "font-title text-3xl leading-tight text-slate-900" : "font-title text-3xl leading-tight"}>{t.title}</h1>
      <p className={isLight ? "mt-2 text-sm text-slate-700" : "mt-2 text-sm text-emerald-100/85"}>{t.subtitle}</p>
    </header>
  );
}
