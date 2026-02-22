import ResultConfetti from "../../../../components/ResultConfetti";
import ResultPanel from "./ResultPanel";
import ShareHandPanel from "./ShareHandPanel";

export default function ResultDialog({ open, onClose, onReset, result, t, language, isLight }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <button type="button" aria-label="close-overlay" onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
      <section
        role="dialog"
        aria-modal="true"
        className={isLight ? "relative z-10 w-full max-w-lg rounded-t-3xl border border-slate-300 bg-[#f8f6ef] p-4 shadow-2xl sm:rounded-3xl" : "relative z-10 w-full max-w-lg rounded-t-3xl border border-white/20 bg-[#0b2b22] p-4 shadow-2xl sm:rounded-3xl"}
      >
        <div className="relative z-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className={isLight ? "font-title text-xl text-slate-900" : "font-title text-xl text-emerald-50"}>{t.resultTitle}</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onReset}
                className={isLight ? "rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-900" : "rounded-xl border border-amber-200/30 bg-amber-100/10 px-3 py-1.5 text-sm font-medium text-amber-50"}
              >
                {t.resetResult}
              </button>
              <button
                type="button"
                onClick={onClose}
                className={isLight ? "rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700" : "rounded-xl border border-white/20 bg-black/20 px-3 py-1.5 text-sm text-emerald-100"}
              >
                {t.close}
              </button>
            </div>
          </div>

          <div className="max-h-[75vh] overflow-y-auto pr-1">
            <ResultPanel result={result} t={t} language={language} isLight={isLight} />
            <ShareHandPanel result={result} t={t} language={language} isLight={isLight} />
          </div>
        </div>
      </section>
      <ResultConfetti open={open} best={result?.best} />
    </div>
  );
}
