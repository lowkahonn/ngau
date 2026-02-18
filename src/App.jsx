import { useEffect, useMemo } from "react";
import PokerCard from "./components/PokerCard";
import { formatCards } from "./lib/gnau";
import { useGnauStore } from "./store/useGnauStore";

const RANK_OPTIONS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

const LANGUAGE_OPTIONS = [
  { value: "zh-Hant", label: "繁中" },
  { value: "zh-Hans", label: "简中" },
  { value: "en", label: "EN" }
];

const THEME_OPTIONS = [
  { value: "dark", label: { "zh-Hant": "深色", "zh-Hans": "深色", en: "Dark" } },
  { value: "light", label: { "zh-Hant": "淺色", "zh-Hans": "浅色", en: "Light" } }
];

const I18N = {
  "zh-Hant": {
    appTag: "Mobile Gnau Calculator",
    title: "Gnau / NiuNiu",
    subtitle: "點選或輸入 5 張牌，計算最佳排法。支援 10、A 花色、3/6 互換。",
    language: "語言",
    theme: "主題",
    inputLabel: "輸入牌組",
    inputPlaceholder: "例如：AS 3 6 8 K",
    pickerTitle: "點選選牌（最多 5 張）",
    pickerHint: "點牌面加入，點已選卡可移除",
    preview: "預覽",
    clear: "清除",
    analyze: "計算",
    close: "關閉",
    resultTitle: "計算結果",
    bestResult: "最佳結果",
    noResultTitle: "找不到合法排法",
    noResultBody: "目前這 5 張牌無法排出底為 10 的倍數。",
    pointRow: "上排：點牌 2 張",
    baseRow: "下排：底牌 3 張",
    assumedTitle: "A 假設排法（A 當黑桃 A）",
    assumedMissing: "無法排出牛冬菇（需 A + J/Q/K 且底為 10 的倍數）。",
    handLine: (name, points, mult) => `牌型：${name} ｜ 點數：${points} ｜ 倍數：${mult}倍`,
    rulesTitle: "Gnau / 牛牛規則重點",
    rulesBody1: "本工具會自動找出最佳排牌，涵蓋底牌 3 張、點牌 2 張、3/6 互換、孖寶按原始牌面、10 點、五張公、牛冬菇。",
    rulesBody2: "適合快速試算與排牌練習，特別是馬來西亞常見牛牛玩法。",
    faqTitle: "常見問題",
    faq1q: "可以輸入 10 還是一定要 T？",
    faq1a: "兩者都可以，系統會統一以 10 顯示。",
    faq2q: "A 的花色會影響結果嗎？",
    faq2a: "會。只有黑桃 A（AS）搭配 J/Q/K 才會觸發牛冬菇。",
    faq3q: "3 與 6 互換會影響孖寶嗎？",
    faq3a: "孖寶判定看原始牌面，不會因 3/6 互換而改變。"
  },
  "zh-Hans": {
    appTag: "Mobile Gnau Calculator",
    title: "Gnau / NiuNiu",
    subtitle: "点选或输入 5 张牌，计算最佳排法。支持 10、A 花色、3/6 互换。",
    language: "语言",
    theme: "主题",
    inputLabel: "输入牌组",
    inputPlaceholder: "例如：AS 3 6 8 K",
    pickerTitle: "点击选牌（最多 5 张）",
    pickerHint: "点牌面加入，点已选卡可移除",
    preview: "预览",
    clear: "清除",
    analyze: "计算",
    close: "关闭",
    resultTitle: "计算结果",
    bestResult: "最佳结果",
    noResultTitle: "找不到合法排法",
    noResultBody: "当前这 5 张牌无法排出底为 10 的倍数。",
    pointRow: "上排：点牌 2 张",
    baseRow: "下排：底牌 3 张",
    assumedTitle: "A 假设排法（A 当黑桃 A）",
    assumedMissing: "无法排出牛冬菇（需 A + J/Q/K 且底为 10 的倍数）。",
    handLine: (name, points, mult) => `牌型：${name} ｜ 点数：${points} ｜ 倍数：${mult}倍`,
    rulesTitle: "Gnau / 牛牛规则重点",
    rulesBody1: "本工具会自动找出最佳排牌，涵盖底牌 3 张、点牌 2 张、3/6 互换、孖宝按原始牌面、10 点、五张公、牛冬菇。",
    rulesBody2: "适合快速试算与排牌练习，特别是马来西亚常见牛牛玩法。",
    faqTitle: "常见问题",
    faq1q: "可以输入 10 还是一定要 T？",
    faq1a: "两者都可以，系统会统一以 10 显示。",
    faq2q: "A 的花色会影响结果吗？",
    faq2a: "会。只有黑桃 A（AS）搭配 J/Q/K 才会触发牛冬菇。",
    faq3q: "3 与 6 互换会影响孖宝吗？",
    faq3a: "孖宝判定看原始牌面，不会因 3/6 互换而改变。"
  },
  en: {
    appTag: "Mobile Gnau Calculator",
    title: "Gnau / NiuNiu",
    subtitle: "Pick or type 5 cards to compute the best arrangement. Supports 10, Ace suit, and 3/6 swap.",
    language: "Language",
    theme: "Theme",
    inputLabel: "Card Input",
    inputPlaceholder: "Example: AS 3 6 8 K",
    pickerTitle: "Tap to pick cards (max 5)",
    pickerHint: "Tap a rank to add, tap a picked card to remove",
    preview: "Preview",
    clear: "Clear",
    analyze: "Analyze",
    close: "Close",
    resultTitle: "Result",
    bestResult: "Best Result",
    noResultTitle: "No valid arrangement",
    noResultBody: "These 5 cards cannot form a valid base that is a multiple of 10.",
    pointRow: "Top row: 2 point cards",
    baseRow: "Bottom row: 3 base cards",
    assumedTitle: "Ace Assumed Combo (A as Spade Ace)",
    assumedMissing: "No Niu Dong Gu combo found (requires A + J/Q/K and valid base).",
    handLine: (name, points, mult) => `Type: ${name} | Points: ${points} | Multiplier: ${mult}x`,
    rulesTitle: "Gnau / NiuNiu Rule Highlights",
    rulesBody1: "This calculator finds the best arrangement with 3 base cards + 2 point cards, including 3/6 swaps, pair by original face value, 10 points, Five Face, and Niu Dong Gu.",
    rulesBody2: "Built for quick checking and practice of common Malaysian Gnau / NiuNiu variants.",
    faqTitle: "FAQ",
    faq1q: "Can I type 10 instead of T?",
    faq1a: "Yes. Both 10 and T are accepted, and output is normalized to 10.",
    faq2q: "Does Ace suit affect result?",
    faq2a: "Yes. Only Spade Ace (AS) with J/Q/K triggers Niu Dong Gu.",
    faq3q: "Does 3/6 swap change pair detection?",
    faq3a: "No. Pair is judged by original face value, not swapped display value."
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

function CardRail({ title, cards, isLight }) {
  if (!cards || cards.length === 0) return null;
  return (
    <section className="space-y-2">
      <p className={isLight ? "text-xs tracking-[0.18em] text-emerald-900/75" : "text-xs tracking-[0.18em] text-emerald-100/80"}>{title}</p>
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {cards.map((card, index) => (
          <PokerCard key={`${card}-${index}`} value={card} size="compact" />
        ))}
      </div>
    </section>
  );
}

function ArrangementRows({ pointCards, baseCards, pointLabel, baseLabel, isLight }) {
  return (
    <section className={isLight ? "rounded-2xl border border-slate-300 bg-slate-100 p-3" : "rounded-2xl border border-white/15 bg-black/20 p-3"}>
      <p className={isLight ? "mb-2 text-xs tracking-[0.16em] text-emerald-900/80" : "mb-2 text-xs tracking-[0.16em] text-emerald-100/80"}>{pointLabel}</p>
      <div className="flex justify-center gap-2">
        {pointCards.map((card, index) => (
          <PokerCard key={`point-${card}-${index}`} value={card} size="compact" />
        ))}
      </div>
      <p className={isLight ? "mb-2 mt-3 text-xs tracking-[0.16em] text-emerald-900/80" : "mb-2 mt-3 text-xs tracking-[0.16em] text-emerald-100/80"}>{baseLabel}</p>
      <div className="flex justify-center gap-2">
        {baseCards.map((card, index) => (
          <PokerCard key={`base-${card}-${index}`} value={card} size="compact" />
        ))}
      </div>
    </section>
  );
}

function comboKey(result, assumeSpadeAce = false) {
  const base = formatCards(result.baseCards, { useFace: true, assumeSpadeAce }).join("|");
  const points = formatCards(result.pointCards, { useFace: true, assumeSpadeAce }).join("|");
  return `${result.name}::${result.multiplier}::${result.points}::${points}::${base}`;
}

function ResultPanel({ result, t, language, isLight }) {
  if (!result?.best) {
    return (
      <article className={isLight ? "rounded-3xl border border-amber-300 bg-amber-50 p-4 text-amber-900" : "rounded-3xl border border-amber-200/30 bg-amber-50/10 p-4 text-amber-50"}>
        <p className="font-medium">{t.noResultTitle}</p>
        <p className={isLight ? "mt-1 text-sm text-amber-800" : "mt-1 text-sm text-amber-100/80"}>{t.noResultBody}</p>
      </article>
    );
  }

  const { best, assumed, hasAce } = result;
  const baseCards = formatCards(best.baseCards, { useFace: true });
  const pointCards = formatCards(best.pointCards, { useFace: true });

  const assumedBase = assumed ? formatCards(assumed.baseCards, { useFace: true, assumeSpadeAce: true }) : [];
  const assumedPoint = assumed ? formatCards(assumed.pointCards, { useFace: true, assumeSpadeAce: true }) : [];

  const showAssumed =
    hasAce &&
    assumed &&
    comboKey(best, true) !== comboKey(assumed, true);
  const showAssumedSection = (hasAce && !assumed) || showAssumed;

  return (
    <section className="space-y-4">
      <article className={isLight ? "rounded-3xl border border-slate-300 bg-white p-4 shadow-xl" : "rounded-3xl border border-white/20 bg-white/10 p-4 shadow-panel backdrop-blur-md"}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className={isLight ? "font-title text-lg tracking-[0.06em] text-slate-900" : "font-title text-lg tracking-[0.06em] text-white"}>{t.bestResult}</h2>
          <span className={isLight ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800" : "rounded-full bg-emerald-300/20 px-3 py-1 text-xs font-semibold text-emerald-100"}>
            {language === "en" ? `${best.multiplier}x` : `${best.multiplier}倍`}
          </span>
        </div>

        {best.name === "五張公" ? (
          <p className={isLight ? "mt-3 text-sm text-slate-800" : "mt-3 text-sm text-emerald-50"}>{t.handLine(localizeHandName("五張公", language), best.points, best.multiplier)}</p>
        ) : (
          <div className="mt-3 space-y-3">
            <ArrangementRows
              pointCards={pointCards}
              baseCards={baseCards}
              pointLabel={t.pointRow}
              baseLabel={t.baseRow}
              isLight={isLight}
            />
            <p className={isLight ? "text-sm text-slate-800" : "text-sm text-emerald-50"}>
              {t.handLine(localizeHandName(best.name, language), best.points, best.multiplier)}
            </p>
          </div>
        )}
      </article>

      {showAssumedSection && (
        <article className={isLight ? "rounded-3xl border border-amber-300 bg-amber-50 p-4 shadow-xl" : "rounded-3xl border border-amber-200/25 bg-amber-100/10 p-4 shadow-panel backdrop-blur-sm"}>
          <h3 className={isLight ? "font-title text-base tracking-[0.05em] text-amber-900" : "font-title text-base tracking-[0.05em] text-amber-100"}>{t.assumedTitle}</h3>
          {!assumed ? (
            <p className={isLight ? "mt-2 text-sm text-amber-800" : "mt-2 text-sm text-amber-50/85"}>{t.assumedMissing}</p>
          ) : (
            <div className="mt-3 space-y-3">
              <ArrangementRows
                pointCards={assumedPoint}
                baseCards={assumedBase}
                pointLabel={t.pointRow}
                baseLabel={t.baseRow}
                isLight={isLight}
              />
              <p className={isLight ? "text-sm text-amber-900" : "text-sm text-amber-50"}>
                {t.handLine(localizeHandName("牛冬菇", language), 1, 7)}
              </p>
            </div>
          )}
        </article>
      )}
    </section>
  );
}

function ResultDialog({ open, onClose, result, t, language, isLight }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <button type="button" aria-label="close-overlay" onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
      <section
        role="dialog"
        aria-modal="true"
        className={isLight ? "relative z-10 w-full max-w-lg rounded-t-3xl border border-slate-300 bg-[#f8f6ef] p-4 shadow-2xl sm:rounded-3xl" : "relative z-10 w-full max-w-lg rounded-t-3xl border border-white/20 bg-[#0b2b22] p-4 shadow-2xl sm:rounded-3xl"}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className={isLight ? "font-title text-xl text-slate-900" : "font-title text-xl text-emerald-50"}>{t.resultTitle}</h2>
          <button
            type="button"
            onClick={onClose}
            className={isLight ? "rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700" : "rounded-xl border border-white/20 bg-black/20 px-3 py-1.5 text-sm text-emerald-100"}
          >
            {t.close}
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto pr-1">
          <ResultPanel result={result} t={t} language={language} isLight={isLight} />
        </div>
      </section>
    </div>
  );
}

function PickerPanel({ pickedCards, addPickedCard, removePickedCard, disabled, t, isLight }) {
  return (
    <section className={isLight ? "mt-3 space-y-3 rounded-2xl border border-slate-300 bg-slate-100 p-3" : "mt-3 space-y-3 rounded-2xl border border-white/15 bg-black/20 p-3"}>
      <div>
        <p className={isLight ? "text-xs tracking-[0.18em] text-slate-700" : "text-xs tracking-[0.18em] text-emerald-100/80"}>{t.pickerTitle}</p>
        <p className={isLight ? "mt-1 text-xs text-slate-600" : "mt-1 text-xs text-emerald-100/65"}>{t.pickerHint}</p>
        <div className="mt-2 grid grid-cols-5 gap-2">
          {Array.from({ length: 5 }, (_, index) => {
            const value = pickedCards[index];
            if (!value) {
              return (
                <div
                  key={`empty-${index}`}
                  className={isLight ? "flex h-20 w-14 items-center justify-center rounded-lg border border-dashed border-slate-400 bg-white text-xs text-slate-500" : "flex h-20 w-14 items-center justify-center rounded-lg border border-dashed border-emerald-100/25 bg-black/25 text-xs text-emerald-100/50"}
                >
                  +
                </div>
              );
            }
            return (
              <button
                key={`${value}-${index}`}
                type="button"
                onClick={() => removePickedCard(index)}
                className="rounded-lg active:scale-[0.98]"
                aria-label={`remove-card-${index}`}
              >
                <PokerCard value={value} size="tiny" />
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className={isLight ? "text-xs tracking-[0.16em] text-slate-700" : "text-xs tracking-[0.16em] text-emerald-100/75"}>{t.inputLabel}</p>
        <div className="mt-2 grid grid-cols-7 gap-2">
          {RANK_OPTIONS.map((rank) => (
            <button
              key={rank}
              type="button"
              onClick={() => addPickedCard(rank)}
              disabled={disabled}
              className={isLight ? "h-9 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 disabled:opacity-40" : "h-9 rounded-xl border border-white/20 bg-black/35 text-xs font-semibold text-emerald-50 disabled:opacity-40"}
            >
              {rank}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function SeoContent({ t, isLight }) {
  return (
    <section className={isLight ? "space-y-4 rounded-3xl border border-slate-300 bg-white p-4 shadow-xl" : "space-y-4 rounded-3xl border border-white/20 bg-black/30 p-4 shadow-panel backdrop-blur-md"}>
      <section id="rules" aria-labelledby="rules-title" className="space-y-2">
        <h2 id="rules-title" className={isLight ? "font-title text-xl text-slate-900" : "font-title text-xl text-emerald-50"}>
          {t.rulesTitle}
        </h2>
        <p className={isLight ? "text-sm leading-relaxed text-slate-700" : "text-sm leading-relaxed text-emerald-100/90"}>{t.rulesBody1}</p>
        <p className={isLight ? "text-sm leading-relaxed text-slate-700" : "text-sm leading-relaxed text-emerald-100/85"}>{t.rulesBody2}</p>
      </section>

      <section id="faq" aria-labelledby="faq-title" className="space-y-2">
        <h2 id="faq-title" className={isLight ? "font-title text-xl text-slate-900" : "font-title text-xl text-emerald-50"}>
          {t.faqTitle}
        </h2>
        <details className={isLight ? "rounded-xl border border-slate-300 bg-slate-50 p-3" : "rounded-xl border border-white/15 bg-black/20 p-3"}>
          <summary className={isLight ? "cursor-pointer text-sm font-semibold text-slate-900" : "cursor-pointer text-sm font-semibold text-emerald-50"}>{t.faq1q}</summary>
          <p className={isLight ? "mt-2 text-sm text-slate-700" : "mt-2 text-sm text-emerald-100/85"}>{t.faq1a}</p>
        </details>
        <details className={isLight ? "rounded-xl border border-slate-300 bg-slate-50 p-3" : "rounded-xl border border-white/15 bg-black/20 p-3"}>
          <summary className={isLight ? "cursor-pointer text-sm font-semibold text-slate-900" : "cursor-pointer text-sm font-semibold text-emerald-50"}>{t.faq2q}</summary>
          <p className={isLight ? "mt-2 text-sm text-slate-700" : "mt-2 text-sm text-emerald-100/85"}>{t.faq2a}</p>
        </details>
        <details className={isLight ? "rounded-xl border border-slate-300 bg-slate-50 p-3" : "rounded-xl border border-white/15 bg-black/20 p-3"}>
          <summary className={isLight ? "cursor-pointer text-sm font-semibold text-slate-900" : "cursor-pointer text-sm font-semibold text-emerald-50"}>{t.faq3q}</summary>
          <p className={isLight ? "mt-2 text-sm text-slate-700" : "mt-2 text-sm text-emerald-100/85"}>{t.faq3a}</p>
        </details>
      </section>
    </section>
  );
}

function ControlPill({ active, children, onClick, isLight }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-lg px-2.5 py-1.5 text-xs font-semibold",
        active
          ? isLight
            ? "bg-emerald-600 text-white"
            : "bg-emerald-300/25 text-emerald-50"
          : isLight
            ? "bg-slate-100 text-slate-700"
            : "bg-black/30 text-emerald-100/80"
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function App() {
  const {
    input,
    preview,
    error,
    result,
    pickedCards,
    language,
    theme,
    setLanguage,
    setTheme,
    setInput,
    addPickedCard,
    removePickedCard,
    syncPickedFromInput,
    analyze,
    clear,
    isResultDialogOpen,
    closeResultDialog
  } = useGnauStore();

  const t = I18N[language] ?? I18N["zh-Hant"];
  const isLight = theme === "light";

  useEffect(() => {
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  const previewCards = useMemo(() => preview.map((card) => formatCards([card])[0]), [preview]);

  return (
    <main className={isLight ? "min-h-screen bg-felt-pattern-light px-4 pb-28 pt-6 text-slate-900" : "min-h-screen bg-felt-pattern px-4 pb-28 pt-6 text-white"}>
      <section className="mx-auto w-full max-w-md space-y-4">
        <header className={isLight ? "rounded-3xl border border-slate-300 bg-white p-5 shadow-xl" : "rounded-3xl border border-white/20 bg-black/30 p-5 shadow-panel backdrop-blur-md"}>
          <p className={isLight ? "font-body text-xs uppercase tracking-[0.3em] text-slate-600" : "font-body text-xs uppercase tracking-[0.3em] text-emerald-200/80"}>{t.appTag}</p>
          <h1 className={isLight ? "mt-2 font-title text-3xl leading-tight text-slate-900" : "mt-2 font-title text-3xl leading-tight"}>{t.title}</h1>
          <p className={isLight ? "mt-2 text-sm text-slate-700" : "mt-2 text-sm text-emerald-100/85"}>{t.subtitle}</p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <p className={isLight ? "mb-1 text-xs text-slate-600" : "mb-1 text-xs text-emerald-100/70"}>{t.language}</p>
              <div className="grid grid-cols-3 gap-1">
                {LANGUAGE_OPTIONS.map((option) => (
                  <ControlPill
                    key={option.value}
                    active={language === option.value}
                    onClick={() => setLanguage(option.value)}
                    isLight={isLight}
                  >
                    {option.label}
                  </ControlPill>
                ))}
              </div>
            </div>
            <div>
              <p className={isLight ? "mb-1 text-xs text-slate-600" : "mb-1 text-xs text-emerald-100/70"}>{t.theme}</p>
              <div className="grid grid-cols-2 gap-1">
                {THEME_OPTIONS.map((option) => (
                  <ControlPill
                    key={option.value}
                    active={theme === option.value}
                    onClick={() => setTheme(option.value)}
                    isLight={isLight}
                  >
                    {option.label[language]}
                  </ControlPill>
                ))}
              </div>
            </div>
          </div>
        </header>

        <section className={isLight ? "rounded-3xl border border-slate-300 bg-white p-4 shadow-xl" : "rounded-3xl border border-white/20 bg-black/30 p-4 shadow-panel backdrop-blur-md"}>
          <label className={isLight ? "mb-2 block text-xs tracking-[0.18em] text-slate-600" : "mb-2 block text-xs tracking-[0.18em] text-emerald-100/80"}>{t.inputLabel}</label>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onBlur={syncPickedFromInput}
            placeholder={t.inputPlaceholder}
            className={isLight ? "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none" : "w-full rounded-2xl border border-emerald-200/30 bg-emerald-950/40 px-4 py-3 text-base text-white placeholder:text-emerald-200/55 focus:border-emerald-300 focus:outline-none"}
          />

          <PickerPanel
            pickedCards={pickedCards}
            addPickedCard={addPickedCard}
            removePickedCard={removePickedCard}
            disabled={pickedCards.length >= 5}
            t={t}
            isLight={isLight}
          />

          {previewCards.length > 0 && <CardRail title={t.preview} cards={previewCards} isLight={isLight} />}

          {error && (
            <p className={isLight ? "mt-3 rounded-xl border border-red-300 bg-red-50 p-2 text-sm text-red-700" : "mt-3 rounded-xl border border-red-300/40 bg-red-500/10 p-2 text-sm text-red-100"}>{error}</p>
          )}
        </section>

        <SeoContent t={t} isLight={isLight} />
      </section>

      <ResultDialog
        open={isResultDialogOpen}
        onClose={closeResultDialog}
        result={result}
        t={t}
        language={language}
        isLight={isLight}
      />

      <div className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-md px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <div className={isLight ? "grid grid-cols-2 gap-3 rounded-3xl border border-slate-300 bg-white p-3 shadow-2xl" : "grid grid-cols-2 gap-3 rounded-3xl border border-white/20 bg-black/55 p-3 backdrop-blur-md"}>
          <button
            type="button"
            onClick={clear}
            className={isLight ? "h-12 rounded-2xl border border-slate-300 bg-slate-100 font-semibold text-slate-700 active:scale-[0.98]" : "h-12 rounded-2xl border border-emerald-100/25 bg-emerald-950/50 font-semibold text-emerald-100 active:scale-[0.98]"}
          >
            {t.clear}
          </button>
          <button
            type="button"
            onClick={analyze}
            className="h-12 rounded-2xl bg-chip-red font-semibold text-white shadow-lg shadow-red-950/40 active:scale-[0.98]"
          >
            {t.analyze}
          </button>
        </div>
      </div>
    </main>
  );
}
