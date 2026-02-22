import { LANGUAGE_OPTIONS } from "../ui/languageOptions";

export default function LanguageThemeSwitches({ language, setLanguage, theme, setTheme, isLight }) {
  return (
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
  );
}
