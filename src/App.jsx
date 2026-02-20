import { useEffect, useMemo } from "react";
import AdSenseSlot from "./components/AdSenseSlot";
import PokerCard from "./components/PokerCard";
import { formatCards } from "./lib/gnau";
import { useGnauStore } from "./store/useGnauStore";

const RANK_OPTIONS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

const LANGUAGE_OPTIONS = [
  { value: "zh-Hant", label: "繁中" },
  { value: "zh-Hans", label: "简中" },
  { value: "en", label: "EN" }
];

const I18N = {
  "zh-Hant": {
    title: "Ngau 計算器",
    subtitle: "點選或輸入 5 張牌，支援 10、AS、3/6 互換。",
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
    noResultBody: "目前這 5 張牌無法排出符合底牌條件（可整除 10）的組合。",
    pointRow: "上排：點牌 2 張",
    baseRow: "下排：底牌 3 張",
    assumedTitle: "A 假設排法（A 當黑桃 A）",
    assumedMissing: "無法排出牛冬菇（需 A + J/Q/K 且底牌可整除 10）。",
    handLine: (name, points) => `牌型：${name} ｜ 點數：${points}`,
    rulesTitle: "Ngau 規則重點",
    rulesBody1: "本工具會自動找出最佳排牌，涵蓋底牌 3 張、點牌 2 張、3/6 互換、孖寶按原始牌面、10 點、五張公、牛冬菇。",
    rulesBody2: "適合快速試算與排牌練習。",
    guideTitle: "玩法與規則文章",
    guideBody: "想提高勝率與理解判定邏輯？以下子頁整理了玩法流程、3/6 互換與實戰例子。",
    guideHowToPlay: "How to play Ngau (牛牛玩法)",
    guideRules: "Rules explanation",
    guideSwap: "3/6 explanation",
    guideExamples: "Example rounds",
    guideFaq: "FAQ"
  },
  "zh-Hans": {
    title: "Ngau 计算器",
    subtitle: "点选或输入 5 张牌，支持 10、AS、3/6 互换。",
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
    noResultBody: "当前这 5 张牌无法排出符合底牌条件（可整除 10）的组合。",
    pointRow: "上排：点牌 2 张",
    baseRow: "下排：底牌 3 张",
    assumedTitle: "A 假设排法（A 当黑桃 A）",
    assumedMissing: "无法排出牛冬菇（需 A + J/Q/K 且底牌可整除 10）。",
    handLine: (name, points) => `牌型：${name} ｜ 点数：${points}`,
    rulesTitle: "Ngau 规则重点",
    rulesBody1: "本工具会自动找出最佳排牌，涵盖底牌 3 张、点牌 2 张、3/6 互换、孖宝按原始牌面、10 点、五张公、牛冬菇。",
    rulesBody2: "适合快速试算与排牌练习。",
    guideTitle: "玩法与规则文章",
    guideBody: "想提升理解和实战速度？以下子页整理了完整玩法、3/6 互换和示例对局。",
    guideHowToPlay: "How to play Ngau (牛牛玩法)",
    guideRules: "Rules explanation",
    guideSwap: "3/6 explanation",
    guideExamples: "Example rounds",
    guideFaq: "FAQ"
  },
  en: {
    title: "Ngau Calculator",
    subtitle: "Pick or type 5 cards. Supports 10, AS, and 3/6 swap.",
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
    noResultBody: "These 5 cards cannot form a valid base that is divisible by 10.",
    pointRow: "Top row: 2 point cards",
    baseRow: "Bottom row: 3 base cards",
    assumedTitle: "Ace Assumed Combo (A as Spade Ace)",
    assumedMissing: "No Niu Dong Gu combo found (requires A + J/Q/K and base divisible by 10).",
    handLine: (name, points) => `Type: ${name} | Points: ${points}`,
    rulesTitle: "Ngau Rule Highlights",
    rulesBody1: "This calculator finds the best arrangement with 3 base cards + 2 point cards, including 3/6 swaps, pair by original face value, 10 points, Five Face, and Niu Dong Gu.",
    rulesBody2: "Built for quick checking and practice.",
    guideTitle: "Learn Ngau",
    guideBody: "Use these subpages for gameplay flow, detailed rules, 3/6 swap strategy, examples, and FAQ.",
    guideHowToPlay: "How to play Ngau (牛牛玩法)",
    guideRules: "Rules explanation",
    guideSwap: "3/6 explanation",
    guideExamples: "Example rounds",
    guideFaq: "FAQ"
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

  const showAssumed = hasAce && assumed && comboKey(best, true) !== comboKey(assumed, true);
  const showAssumedSection = (hasAce && !assumed) || showAssumed;

  return (
    <section className="space-y-4">
      <article className={isLight ? "rounded-3xl border border-slate-300 bg-white p-4 shadow-xl" : "rounded-3xl border border-white/20 bg-white/10 p-4 shadow-panel backdrop-blur-md"}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className={isLight ? "font-title text-lg tracking-[0.06em] text-slate-900" : "font-title text-lg tracking-[0.06em] text-white"}>{t.bestResult}</h2>
        </div>

        {best.name === "五張公" ? (
          <p className={isLight ? "mt-3 text-sm text-slate-800" : "mt-3 text-sm text-emerald-50"}>{t.handLine(localizeHandName("五張公", language), best.points)}</p>
        ) : (
          <div className="mt-3 space-y-3">
            <ArrangementRows pointCards={pointCards} baseCards={baseCards} pointLabel={t.pointRow} baseLabel={t.baseRow} isLight={isLight} />
            <p className={isLight ? "text-sm text-slate-800" : "text-sm text-emerald-50"}>{t.handLine(localizeHandName(best.name, language), best.points)}</p>
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
              <ArrangementRows pointCards={assumedPoint} baseCards={assumedBase} pointLabel={t.pointRow} baseLabel={t.baseRow} isLight={isLight} />
              <p className={isLight ? "text-sm text-amber-900" : "text-sm text-amber-50"}>{t.handLine(localizeHandName("牛冬菇", language), 1)}</p>
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

function RulesContent({ t, isLight }) {
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

function GuidePages({ t, isLight }) {
  const baseUrl = import.meta.env.BASE_URL ?? "/";
  const pages = [
    { href: "how-to-play-ngau.html", label: t.guideHowToPlay },
    { href: "ngau-rules-explained.html", label: t.guideRules },
    { href: "ngau-3-6-explained.html", label: t.guideSwap },
    { href: "ngau-example-rounds.html", label: t.guideExamples },
    { href: "ngau-faq.html", label: t.guideFaq }
  ];

  return (
    <section className={isLight ? "space-y-3 rounded-3xl border border-slate-300 bg-white p-4 shadow-xl" : "space-y-3 rounded-3xl border border-white/20 bg-black/30 p-4 shadow-panel backdrop-blur-md"}>
      <h2 className={isLight ? "font-title text-xl text-slate-900" : "font-title text-xl text-emerald-50"}>{t.guideTitle}</h2>
      <p className={isLight ? "text-sm leading-relaxed text-slate-700" : "text-sm leading-relaxed text-emerald-100/85"}>{t.guideBody}</p>
      <div className="grid gap-2">
        {pages.map((page) => (
          <a
            key={page.href}
            href={`${baseUrl}${page.href}`}
            className={isLight ? "rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700" : "rounded-xl border border-white/20 bg-black/25 px-3 py-2 text-sm font-medium text-emerald-100"}
          >
            {page.label}
          </a>
        ))}
      </div>
    </section>
  );
}

function MinimalSwitches({ language, setLanguage, theme, setTheme, isLight }) {
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
          <div className="mb-3 flex justify-end">
            <MinimalSwitches language={language} setLanguage={setLanguage} theme={theme} setTheme={setTheme} isLight={isLight} />
          </div>
          <h1 className={isLight ? "font-title text-3xl leading-tight text-slate-900" : "font-title text-3xl leading-tight"}>{t.title}</h1>
          <p className={isLight ? "mt-2 text-sm text-slate-700" : "mt-2 text-sm text-emerald-100/85"}>{t.subtitle}</p>
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

          <PickerPanel pickedCards={pickedCards} addPickedCard={addPickedCard} removePickedCard={removePickedCard} disabled={pickedCards.length >= 5} t={t} isLight={isLight} />

          {previewCards.length > 0 && <CardRail title={t.preview} cards={previewCards} isLight={isLight} />}

          {error && <p className={isLight ? "mt-3 rounded-xl border border-red-300 bg-red-50 p-2 text-sm text-red-700" : "mt-3 rounded-xl border border-red-300/40 bg-red-500/10 p-2 text-sm text-red-100"}>{error}</p>}
        </section>

        <RulesContent t={t} isLight={isLight} />
        <GuidePages t={t} isLight={isLight} />
        <AdSenseSlot isLight={isLight} />
      </section>

      <ResultDialog open={isResultDialogOpen} onClose={closeResultDialog} result={result} t={t} language={language} isLight={isLight} />

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
