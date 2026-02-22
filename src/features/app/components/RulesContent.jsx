export default function RulesContent({ t, isLight }) {
  return (
    <section className={isLight ? "space-y-4 rounded-3xl border border-slate-300 bg-white p-4 shadow-xl" : "space-y-4 rounded-3xl border border-white/20 bg-black/30 p-4 shadow-panel backdrop-blur-md"}>
      <section id="rules" aria-labelledby="rules-title" className="space-y-2">
        <h2 id="rules-title" className={isLight ? "font-title text-xl text-slate-900" : "font-title text-xl text-emerald-50"}>
          {t.rulesTitle}
        </h2>
        <p className={isLight ? "text-sm leading-relaxed text-slate-700" : "text-sm leading-relaxed text-emerald-100/90"}>{t.rulesBody1}</p>
        <p className={isLight ? "text-sm leading-relaxed text-slate-700" : "text-sm leading-relaxed text-emerald-100/85"}>{t.rulesBody2}</p>
      </section>
    </section>
  );
}
