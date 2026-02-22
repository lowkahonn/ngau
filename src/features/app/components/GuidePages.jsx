import { GUIDE_PAGE_PATHS } from "../content/i18n";

export default function GuidePages({ t, language, isLight }) {
  const pagePaths = GUIDE_PAGE_PATHS[language] ?? GUIDE_PAGE_PATHS.en;
  const pages = [
    { href: pagePaths.howToPlay, label: t.guideHowToPlay },
    { href: pagePaths.rules, label: t.guideRules },
    { href: pagePaths.swap, label: t.guideSwap },
    { href: pagePaths.examples, label: t.guideExamples },
    { href: pagePaths.faq, label: t.guideFaq }
  ];

  return (
    <section className={isLight ? "space-y-3 rounded-3xl border border-slate-300 bg-white p-4 shadow-xl" : "space-y-3 rounded-3xl border border-white/20 bg-black/30 p-4 shadow-panel backdrop-blur-md"}>
      <h2 className={isLight ? "font-title text-xl text-slate-900" : "font-title text-xl text-emerald-50"}>{t.guideTitle}</h2>
      <p className={isLight ? "text-sm leading-relaxed text-slate-700" : "text-sm leading-relaxed text-emerald-100/85"}>{t.guideBody}</p>
      <div className="grid gap-2">
        {pages.map((page) => (
          <a
            key={page.href}
            href={page.href}
            className={isLight ? "rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700" : "rounded-xl border border-white/20 bg-black/25 px-3 py-2 text-sm font-medium text-emerald-100"}
          >
            {page.label}
          </a>
        ))}
      </div>
    </section>
  );
}
