import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AdSenseSlot from "./components/AdSenseSlot";
import PokerCard from "./components/PokerCard";
import ResultConfetti from "./components/ResultConfetti";
import { formatCards, suitText } from "./lib/gnau";
import { useGnauStore } from "./store/useGnauStore";

const RANK_OPTIONS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const ACE_SUIT_OPTIONS = [
  { token: "AS", label: "A♠" },
  { token: "AH", label: "A♥" },
  { token: "AC", label: "A♣" },
  { token: "AD", label: "A♦" }
];

const LANGUAGE_OPTIONS = [
  { value: "zh-Hant", label: "繁中" },
  { value: "zh-Hans", label: "简中" },
  { value: "en", label: "EN" }
];

const SHARE_PANEL_WIDTH = 500;
const SHARE_PANEL_HEIGHT = 625;
const SHARE_CAPTURE_MARGIN = 16;
const SHARE_EXPORT_SCALE = 1.4;
const SHARE_CANVAS_WIDTH = Math.round((SHARE_PANEL_WIDTH + SHARE_CAPTURE_MARGIN * 2) * SHARE_EXPORT_SCALE);
const SHARE_CANVAS_HEIGHT = Math.round((SHARE_PANEL_HEIGHT + SHARE_CAPTURE_MARGIN * 2) * SHARE_EXPORT_SCALE);

const I18N = {
  "zh-Hant": {
    title: "Ngau 計算器",
    subtitle: "點選 5 張牌即可計算，支援 10、AS、3/6 互換。",
    pickerTitle: "點選選牌（最多 5 張）",
    pickerHint: "點牌面加入，點已選卡可移除。上方可直接選 A 花色。",
    pickerCount: (count) => `已選 ${count}/5`,
    pickerRanks: "牌面快速鍵",
    pickerAces: "A 花色快速鍵",
    clear: "清除",
    analyze: "計算",
    close: "關閉",
    resetResult: "重新選牌",
    resultTitle: "計算結果",
    bestResult: "最佳結果",
    noResultTitle: "沒有點",
    noResultBody: "目前這 5 張牌沒有點。",
    sharePanelTitle: "分享這手牌",
    sharePanelBody: "產生高質感牌局圖，一鍵分享到社交平台。",
    shareSocialHint: "分享到社交平台",
    shareWhatsApp: "WhatsApp",
    shareX: "X",
    shareFacebook: "Facebook",
    shareTelegram: "Telegram",
    shareInstagram: "Instagram",
    shareAction: "系統分享",
    shareDownloadImage: "儲存相片",
    shareDone: "已開啟分享",
    shareDownloaded: "圖片已下載，可直接上傳到社交平台。",
    shareFailed: "分享失敗，請稍後再試。",
    sharePreparing: "準備分享預覽中...",
    shareRendering: "產生分享圖中...",
    shareCards: (cards) => `牌局：${cards}`,
    shareResult: (summary) => `結果：${summary}`,
    sharePreviewAlt: "牌局分享圖預覽",
    pointRow: "上排：點牌 2 張",
    baseRow: "下排：底牌 3 張",
    allCardsRow: "原始牌：5 張",
    handLine: (name, points) => `牌型：${name} ｜ 點數：${points}`,
    handTypeOnly: (name) => `牌型：${name}`,
    rulesTitle: "Ngau 規則重點",
    rulesBody1: "本工具會自動找出最佳排牌，涵蓋底牌 3 張、點牌 2 張、3/6 互換、孖寶按原始牌面、10 點、五張公、牛冬菇。",
    rulesBody2: "適合快速試算與排牌練習。",
    guideTitle: "玩法與規則文章",
    guideBody: "想提高勝率與理解判定邏輯？以下子頁整理了玩法流程、3/6 互換與實戰例子。",
    guideHowToPlay: "牛牛玩法",
    guideRules: "規則詳解",
    guideSwap: "3/6 互換說明",
    guideExamples: "實戰例子",
    guideFaq: "FAQ",
    historyTitle: "最近牌局",
    historyEmpty: "尚未有計算紀錄。",
    historyArchiveTitle: "全部歷史紀錄",
    historyArchiveEmpty: "尚未有歷史紀錄。",
    historyStatsTitle: "統計",
    historyTotalHands: (count) => `總手數：${count}`,
    historySessionHands: (count) => `本次 Session：${count}`,
    historyTypeCounts: "牌型次數",
    historyBiggestHands: "最大牌型",
    historyNoBiggest: "暫無紀錄",
    historyDay: (dayKey) => `日期：${dayKey}`,
    historySession: (sessionId) => `Session：${sessionId}`,
    historyAt: (time) => `時間：${time}`,
    historyClear: "清空歷史",
    historyLoad: "載入這手",
    historyNoResult: "沒有點",
    historyViewPage: "歷史統計"
  },
  "zh-Hans": {
    title: "Ngau 计算器",
    subtitle: "点选 5 张牌即可计算，支持 10、AS、3/6 互换。",
    pickerTitle: "点击选牌（最多 5 张）",
    pickerHint: "点牌面加入，点已选卡可移除。上方可直接选 A 花色。",
    pickerCount: (count) => `已选 ${count}/5`,
    pickerRanks: "牌面快捷键",
    pickerAces: "A 花色快捷键",
    clear: "清除",
    analyze: "计算",
    close: "关闭",
    resetResult: "重新选牌",
    resultTitle: "计算结果",
    bestResult: "最佳结果",
    noResultTitle: "没有点",
    noResultBody: "当前这 5 张牌没有点。",
    sharePanelTitle: "分享这手牌",
    sharePanelBody: "生成高质感牌局图，一键分享到社交平台。",
    shareSocialHint: "分享到社交平台",
    shareWhatsApp: "WhatsApp",
    shareX: "X",
    shareFacebook: "Facebook",
    shareTelegram: "Telegram",
    shareInstagram: "Instagram",
    shareAction: "系统分享",
    shareDownloadImage: "保存照片",
    shareDone: "已打开分享",
    shareDownloaded: "图片已下载，可直接上传到社交平台。",
    shareFailed: "分享失败，请稍后再试。",
    sharePreparing: "正在准备分享预览...",
    shareRendering: "正在生成分享图...",
    shareCards: (cards) => `牌局：${cards}`,
    shareResult: (summary) => `结果：${summary}`,
    sharePreviewAlt: "牌局分享图预览",
    pointRow: "上排：点牌 2 张",
    baseRow: "下排：底牌 3 张",
    allCardsRow: "原始牌：5 张",
    handLine: (name, points) => `牌型：${name} ｜ 点数：${points}`,
    handTypeOnly: (name) => `牌型：${name}`,
    rulesTitle: "Ngau 规则重点",
    rulesBody1: "本工具会自动找出最佳排牌，涵盖底牌 3 张、点牌 2 张、3/6 互换、孖宝按原始牌面、10 点、五张公、牛冬菇。",
    rulesBody2: "适合快速试算与排牌练习。",
    guideTitle: "玩法与规则文章",
    guideBody: "想提升理解和实战速度？以下子页整理了完整玩法、3/6 互换和示例对局。",
    guideHowToPlay: "牛牛玩法",
    guideRules: "规则详解",
    guideSwap: "3/6 互换说明",
    guideExamples: "实战例子",
    guideFaq: "FAQ",
    historyTitle: "最近牌局",
    historyEmpty: "尚未有计算记录。",
    historyArchiveTitle: "全部历史记录",
    historyArchiveEmpty: "尚未有历史记录。",
    historyStatsTitle: "统计",
    historyTotalHands: (count) => `总手数：${count}`,
    historySessionHands: (count) => `本次 Session：${count}`,
    historyTypeCounts: "牌型次数",
    historyBiggestHands: "最大牌型",
    historyNoBiggest: "暂无记录",
    historyDay: (dayKey) => `日期：${dayKey}`,
    historySession: (sessionId) => `Session：${sessionId}`,
    historyAt: (time) => `时间：${time}`,
    historyClear: "清空历史",
    historyLoad: "载入这手",
    historyNoResult: "没有点",
    historyViewPage: "历史统计"
  },
  en: {
    title: "Ngau Calculator",
    subtitle: "Pick 5 cards to analyze. Supports 10, AS, and 3/6 swap.",
    pickerTitle: "Tap to pick cards (max 5)",
    pickerHint: "Tap a rank to add, tap a picked card to remove. Use Ace suit shortcuts above.",
    pickerCount: (count) => `Picked ${count}/5`,
    pickerRanks: "Quick Rank Picks",
    pickerAces: "Ace Suit Shortcuts",
    clear: "Clear",
    analyze: "Analyze",
    close: "Close",
    resetResult: "New Hand",
    resultTitle: "Result",
    bestResult: "Best Result",
    noResultTitle: "No points",
    noResultBody: "These 5 cards have no points.",
    sharePanelTitle: "Share This Hand",
    sharePanelBody: "Generate a polished hand image and share it to social media.",
    shareSocialHint: "Share to social media",
    shareWhatsApp: "WhatsApp",
    shareX: "X",
    shareFacebook: "Facebook",
    shareTelegram: "Telegram",
    shareInstagram: "Instagram",
    shareAction: "System Share",
    shareDownloadImage: "Save Photo",
    shareDone: "Share opened",
    shareDownloaded: "Image downloaded. Upload it to your social app.",
    shareFailed: "Share failed. Please try again.",
    sharePreparing: "Preparing share preview...",
    shareRendering: "Rendering share image...",
    shareCards: (cards) => `Cards: ${cards}`,
    shareResult: (summary) => `Result: ${summary}`,
    sharePreviewAlt: "Share hand preview image",
    pointRow: "Top row: 2 point cards",
    baseRow: "Bottom row: 3 base cards",
    allCardsRow: "Input cards: 5",
    handLine: (name, points) => `Type: ${name} | Points: ${points}`,
    handTypeOnly: (name) => `Type: ${name}`,
    rulesTitle: "Ngau Rule Highlights",
    rulesBody1: "This calculator finds the best arrangement with 3 base cards + 2 point cards, including 3/6 swaps, pair by original face value, 10 points, Five Face, and Niu Dong Gu.",
    rulesBody2: "Built for quick checking and practice.",
    guideTitle: "Learn Ngau",
    guideBody: "Use these subpages for gameplay flow, detailed rules, 3/6 swap strategy, examples, and FAQ.",
    guideHowToPlay: "How to play Ngau (牛牛玩法)",
    guideRules: "Rules explanation",
    guideSwap: "3/6 explanation",
    guideExamples: "Example rounds",
    guideFaq: "FAQ",
    historyTitle: "Recent Hands",
    historyEmpty: "No history yet.",
    historyArchiveTitle: "All History",
    historyArchiveEmpty: "No persisted history yet.",
    historyStatsTitle: "Stats",
    historyTotalHands: (count) => `Total hands: ${count}`,
    historySessionHands: (count) => `This session: ${count}`,
    historyTypeCounts: "Hand Type Counts",
    historyBiggestHands: "Biggest Hands",
    historyNoBiggest: "No records",
    historyDay: (dayKey) => `Day: ${dayKey}`,
    historySession: (sessionId) => `Session: ${sessionId}`,
    historyAt: (time) => `Time: ${time}`,
    historyClear: "Clear all",
    historyLoad: "Load this hand",
    historyNoResult: "No points",
    historyViewPage: "History & Stats"
  }
};

const GUIDE_PAGE_PATHS = {
  en: {
    howToPlay: "how-to-play-ngau.html",
    rules: "ngau-rules-explained.html",
    swap: "ngau-3-6-explained.html",
    examples: "ngau-example-rounds.html",
    faq: "ngau-faq.html"
  },
  "zh-Hant": {
    howToPlay: "zh-hant/how-to-play-ngau.html",
    rules: "zh-hant/ngau-rules-explained.html",
    swap: "zh-hant/ngau-3-6-explained.html",
    examples: "zh-hant/ngau-example-rounds.html",
    faq: "zh-hant/ngau-faq.html"
  },
  "zh-Hans": {
    howToPlay: "zh-hans/how-to-play-ngau.html",
    rules: "zh-hans/ngau-rules-explained.html",
    swap: "zh-hans/ngau-3-6-explained.html",
    examples: "zh-hans/ngau-example-rounds.html",
    faq: "zh-hans/ngau-faq.html"
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

function downloadBlob(blob, fileName) {
  if (!blob || typeof document === "undefined") return;
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}

function parseCanvasCardToken(value) {
  const upper = String(value || "").toUpperCase();
  if (upper.startsWith("10")) {
    return { rank: "10", suit: upper.slice(2) };
  }
  return { rank: upper.slice(0, 1), suit: upper.slice(1) };
}

function canvasRoundedRectPath(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function fitCanvasText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let next = text;
  while (next.length > 1 && ctx.measureText(`${next}...`).width > maxWidth) {
    next = next.slice(0, -1);
  }
  return `${next}...`;
}

function drawCanvasTextPair(ctx, rank, suitSymbol, x, y, tone, { rotate = false } = {}) {
  ctx.save();
  ctx.fillStyle = tone;
  ctx.translate(x, y);
  if (rotate) {
    ctx.rotate(Math.PI);
  }
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = "700 11px system-ui, -apple-system, sans-serif";
  ctx.fillText(rank, 0, 0);
  if (suitSymbol) {
    ctx.font = "400 11px system-ui, -apple-system, sans-serif";
    ctx.fillText(suitSymbol, 0, 12);
  }
  ctx.restore();
}

function drawCanvasPokerCard(ctx, cardValue, x, y, width = 80, height = 112) {
  const { rank, suit } = parseCanvasCardToken(cardValue);
  const suitSymbol = suitText[suit] ?? "";
  const isRed = suit === "H" || suit === "D";
  const tone = isRed ? "#dc2626" : "#0f172a";
  const border = isRed ? "#fca5a5" : "#cbd5e1";

  ctx.save();
  ctx.shadowColor = "rgba(15, 23, 42, 0.25)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  canvasRoundedRectPath(ctx, x, y, width, height, 12);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();

  ctx.save();
  canvasRoundedRectPath(ctx, x, y, width, height, 12);
  ctx.clip();
  const bg = ctx.createRadialGradient(x + width * 0.82, y + height * 0.08, 1, x + width * 0.82, y + height * 0.08, height);
  bg.addColorStop(0, "rgba(255,255,255,0.95)");
  bg.addColorStop(0.45, "rgba(241,245,249,0.92)");
  bg.addColorStop(1, "rgba(226,232,240,0.72)");
  ctx.fillStyle = bg;
  ctx.fillRect(x, y, width, height);
  ctx.restore();

  ctx.lineWidth = 1.5;
  ctx.strokeStyle = border;
  canvasRoundedRectPath(ctx, x, y, width, height, 12);
  ctx.stroke();

  drawCanvasTextPair(ctx, rank, suitSymbol, x + 6, y + 4, tone);
  drawCanvasTextPair(ctx, rank, suitSymbol, x + width - 6, y + height - 4, tone, { rotate: true });

  ctx.save();
  ctx.fillStyle = tone;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (rank === "A" && suitSymbol) {
    ctx.font = "600 32px system-ui, -apple-system, sans-serif";
    ctx.fillText(suitSymbol, x + width / 2, y + height / 2 + 2);
  } else if (!suitSymbol) {
    ctx.font = "600 26px system-ui, -apple-system, sans-serif";
    ctx.fillText(rank, x + width / 2, y + height / 2 + 2);
  } else {
    ctx.font = "600 24px system-ui, -apple-system, sans-serif";
    ctx.fillText(rank, x + width / 2, y + height / 2 - 9);
    if (suitSymbol) {
      ctx.font = "500 20px system-ui, -apple-system, sans-serif";
      ctx.fillText(suitSymbol, x + width / 2, y + height / 2 + 17);
    }
  }
  ctx.restore();
}

function drawShareCanvasPreview(canvas, meta, language, appTitle) {
  const ctx = canvas.getContext("2d");
  if (!ctx || !meta) return false;

  canvas.width = SHARE_CANVAS_WIDTH;
  canvas.height = SHARE_CANVAS_HEIGHT;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const scale = SHARE_EXPORT_SCALE;
  const panelX = SHARE_CAPTURE_MARGIN;
  const panelY = SHARE_CAPTURE_MARGIN;
  const panelWidth = SHARE_PANEL_WIDTH;
  const panelHeight = SHARE_PANEL_HEIGHT;

  const shareTitle = language === "zh-Hant" ? "牛牛分享牌局" : language === "zh-Hans" ? "牛牛分享牌局" : "Shared Hand";
  const hostPath = typeof window !== "undefined" ? `${window.location.host}${window.location.pathname}` : "ngau";

  ctx.save();
  ctx.scale(scale, scale);

  canvasRoundedRectPath(ctx, panelX, panelY, panelWidth, panelHeight, 30);
  ctx.save();
  ctx.clip();

  const bg = ctx.createLinearGradient(
    panelX - panelWidth * 0.12,
    panelY - panelHeight * 0.06,
    panelX + panelWidth * 1.02,
    panelY + panelHeight * 1.04,
  );
  bg.addColorStop(0, "#1f644d");
  bg.addColorStop(0.2, "#155341");
  bg.addColorStop(0.54, "#093f32");
  bg.addColorStop(0.82, "#052f27");
  bg.addColorStop(1, "#03261f");
  ctx.fillStyle = bg;
  ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

  const depthWash = ctx.createLinearGradient(
    panelX + panelWidth * 0.42,
    panelY,
    panelX + panelWidth * 0.96,
    panelY + panelHeight * 0.08,
  );
  depthWash.addColorStop(0, "rgba(3, 28, 23, 0)");
  depthWash.addColorStop(0.22, "rgba(2, 20, 17, 0.16)");
  depthWash.addColorStop(0.62, "rgba(2, 17, 14, 0.42)");
  depthWash.addColorStop(1, "rgba(1, 13, 12, 0.28)");
  ctx.fillStyle = depthWash;
  ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

  const glowA = ctx.createRadialGradient(
    panelX + panelWidth * 0.12,
    panelY + panelHeight * 0.2,
    8,
    panelX + panelWidth * 0.12,
    panelY + panelHeight * 0.2,
    panelWidth * 0.92,
  );
  glowA.addColorStop(0, "rgba(110, 255, 204, 0.07)");
  glowA.addColorStop(0.55, "rgba(74, 222, 128, 0.025)");
  glowA.addColorStop(1, "rgba(74, 222, 128, 0)");
  ctx.fillStyle = glowA;
  ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

  const glowB = ctx.createRadialGradient(
    panelX + panelWidth * 0.72,
    panelY + panelHeight * 0.5,
    12,
    panelX + panelWidth * 0.72,
    panelY + panelHeight * 0.5,
    panelWidth * 0.52,
  );
  glowB.addColorStop(0, "rgba(0, 10, 10, 0.42)");
  glowB.addColorStop(0.65, "rgba(0, 8, 8, 0.24)");
  glowB.addColorStop(1, "rgba(0, 8, 8, 0)");
  ctx.fillStyle = glowB;
  ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

  const glowC = ctx.createRadialGradient(
    panelX + panelWidth * 0.08,
    panelY + panelHeight * 0.78,
    10,
    panelX + panelWidth * 0.08,
    panelY + panelHeight * 0.78,
    panelWidth * 0.45,
  );
  glowC.addColorStop(0, "rgba(52, 211, 153, 0.04)");
  glowC.addColorStop(1, "rgba(52, 211, 153, 0)");
  ctx.fillStyle = glowC;
  ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

  const glowD = ctx.createRadialGradient(
    panelX + panelWidth * 0.9,
    panelY + panelHeight * 0.1,
    6,
    panelX + panelWidth * 0.9,
    panelY + panelHeight * 0.1,
    panelWidth * 0.26,
  );
  glowD.addColorStop(0, "rgba(250, 204, 21, 0.045)");
  glowD.addColorStop(0.6, "rgba(250, 204, 21, 0.015)");
  glowD.addColorStop(1, "rgba(250, 204, 21, 0)");
  ctx.fillStyle = glowD;
  ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

  const vignette = ctx.createRadialGradient(
    panelX + panelWidth * 0.42,
    panelY + panelHeight * 0.42,
    panelWidth * 0.16,
    panelX + panelWidth * 0.42,
    panelY + panelHeight * 0.42,
    panelWidth * 0.92,
  );
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(0.7, "rgba(0, 0, 0, 0.06)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.18)");
  ctx.fillStyle = vignette;
  ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

  ctx.restore();

  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  canvasRoundedRectPath(ctx, panelX, panelY, panelWidth, panelHeight, 30);
  ctx.stroke();

  const innerX = panelX + 32;
  const innerY = panelY + 32;
  const innerW = panelWidth - 64;
  const innerH = panelHeight - 64;
  const headerHeight = 86;
  const summaryHeight = 58;
  const summaryY = innerY + innerH - summaryHeight;

  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  ctx.font = "700 30px system-ui, -apple-system, sans-serif";
  ctx.fillText(appTitle, innerX, innerY);

  const rowY = innerY + 40;
  ctx.font = "500 16px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "rgba(209, 250, 229, 0.92)";
  ctx.fillText(shareTitle, innerX, rowY);
  ctx.textAlign = "right";
  ctx.font = "500 14px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "rgba(226, 232, 240, 0.85)";
  ctx.fillText(meta.timestamp, innerX + innerW, rowY + 1);

  ctx.textAlign = "left";
  ctx.font = "500 14px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "rgba(167, 243, 208, 0.75)";
  ctx.fillText(hostPath, innerX, innerY + 60);

  const centerTop = innerY + headerHeight;
  const centerHeight = innerH - headerHeight - summaryHeight;
  const cardWidth = 80;
  const cardHeight = 112;
  const rowGap = 16;
  const colGap = 12;
  const cardBlockHeight = cardHeight * 2 + rowGap;
  const topRowY = centerTop + (centerHeight - cardBlockHeight) / 2;
  const baseRowY = topRowY + cardHeight + rowGap;
  const topRowWidth = cardWidth * 2 + colGap;
  const baseRowWidth = cardWidth * 3 + colGap * 2;
  const topRowX = panelX + (panelWidth - topRowWidth) / 2;
  const baseRowX = panelX + (panelWidth - baseRowWidth) / 2;

  meta.topCards.forEach((card, index) => {
    drawCanvasPokerCard(ctx, card, topRowX + index * (cardWidth + colGap), topRowY, cardWidth, cardHeight);
  });
  meta.baseCards.forEach((card, index) => {
    drawCanvasPokerCard(ctx, card, baseRowX + index * (cardWidth + colGap), baseRowY, cardWidth, cardHeight);
  });

  canvasRoundedRectPath(ctx, innerX, summaryY, innerW, summaryHeight, 16);
  ctx.fillStyle = "rgba(0,0,0,0.30)";
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(253, 224, 71, 0.35)";
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = "600 16px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#f8fafc";
  const summaryText = fitCanvasText(ctx, meta.summary, innerW - 24);
  ctx.fillText(summaryText, innerX + 12, summaryY + summaryHeight / 2);

  ctx.restore();
  return true;
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

function AllCardsRow({ cards, label, isLight }) {
  return (
    <section className={isLight ? "rounded-2xl border border-slate-300 bg-slate-100 p-3" : "rounded-2xl border border-white/15 bg-black/20 p-3"}>
      <p className={isLight ? "mb-2 text-xs tracking-[0.16em] text-emerald-900/80" : "mb-2 text-xs tracking-[0.16em] text-emerald-100/80"}>{label}</p>
      <div className="flex justify-center gap-2">
        {cards.map((card, index) => (
          <PokerCard key={`all-${card}-${index}`} value={card} size="compact" />
        ))}
      </div>
    </section>
  );
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

  const { best } = result;
  const baseCards = formatCards(best.baseCards, { useFace: true });
  const pointCards = formatCards(best.pointCards, { useFace: true });
  const allCards = formatCards(result.cards ?? [], { useFace: true });

  return (
    <section className="space-y-4">
      <article className={isLight ? "rounded-3xl border border-slate-300 bg-white p-4 shadow-xl" : "rounded-3xl border border-white/20 bg-white/10 p-4 shadow-panel backdrop-blur-md"}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className={isLight ? "font-title text-lg tracking-[0.06em] text-slate-900" : "font-title text-lg tracking-[0.06em] text-white"}>{t.bestResult}</h2>
        </div>

        {best.name === "五張公" ? (
          <div className="mt-3 space-y-3">
            <AllCardsRow cards={allCards} label={t.allCardsRow} isLight={isLight} />
            <p className={isLight ? "text-sm text-slate-800" : "text-sm text-emerald-50"}>{formatHandSummary(best, t, language)}</p>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            <ArrangementRows pointCards={pointCards} baseCards={baseCards} pointLabel={t.pointRow} baseLabel={t.baseRow} isLight={isLight} />
            <p className={isLight ? "text-sm text-slate-800" : "text-sm text-emerald-50"}>{formatHandSummary(best, t, language)}</p>
          </div>
        )}
      </article>
    </section>
  );
}

function ShareImageStage({ meta, language, appTitle }) {
  const host = typeof window !== "undefined" ? window.location.host : "ngau";
  const shareTitle = language === "zh-Hant" ? "牛牛分享牌局" : language === "zh-Hans" ? "牛牛分享牌局" : "Shared Hand";
  return (
    <article className="relative h-[625px] w-[500px] overflow-hidden rounded-[30px] border border-white/25 bg-felt-pattern p-8 text-white">
      <div className="relative z-10 flex h-full flex-col">
        <div>
          <h3 className="font-title text-3xl tracking-[0.05em]">{appTitle}</h3>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="text-base text-emerald-100/90">{shareTitle}</p>
            <p className="text-sm tracking-[0.08em] text-slate-200/85">{meta.timestamp}</p>
          </div>
          <p className="mt-1 text-sm tracking-[0.06em] text-emerald-100/75">{host}</p>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex justify-center gap-3">
            {meta.topCards.map((card, index) => (
              <PokerCard key={`share-top-${card}-${index}`} value={card} />
            ))}
          </div>
          <div className="mt-4 flex justify-center gap-3">
            {meta.baseCards.map((card, index) => (
              <PokerCard key={`share-base-${card}-${index}`} value={card} />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200/35 bg-black/30 px-4 py-3">
          <p className="text-base font-semibold text-slate-100">{meta.summary}</p>
        </div>
      </div>
    </article>
  );
}

function IconBase({ children }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-none stroke-current">
      {children}
    </svg>
  );
}

function IconInstagram() {
  return (
    <IconBase>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" strokeWidth="2" />
      <circle cx="17.3" cy="6.8" r="1.2" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

function IconWhatsApp() {
  return (
    <svg viewBox="0 0 512 512" aria-label="WhatsApp" role="img" className="h-7 w-7">
      <rect width="512" height="512" rx="15%" fill="#25d366" />
      <path fill="#25d366" stroke="#ffffff" strokeWidth="26" d="M123 393l14-65a138 138 0 1150 47z" />
      <path fill="#ffffff" d="M308 273c-3-2-6-3-9 1l-12 16c-3 2-5 3-9 1-15-8-36-17-54-47-1-4 1-6 3-8l9-14c2-2 1-4 0-6l-12-29c-3-8-6-7-9-7h-8c-2 0-6 1-10 5-22 22-13 53 3 73 3 4 23 40 66 59 32 14 39 12 48 10 11-1 22-10 27-19 1-3 6-16 2-18" />
    </svg>
  );
}

function IconX() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-current">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.847h-7.406l-5.8-7.584-6.64 7.584H.474l8.6-9.83L0 1.153h7.594l5.243 6.932 6.064-6.932Zm-1.297 19.28h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

function IconFacebook() {
  return (
    <IconBase>
      <path d="M13.8 8.5H16V5.2h-2.2c-2.6 0-3.9 1.6-3.9 4v2H7.6v3.1h2.3V20h3.3v-5.7h2.4l.4-3.1h-2.8v-1.6c0-.7.3-1.1 1-1.1z" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

function IconTelegram() {
  return (
    <IconBase>
      <path d="M20.7 4.1 3.4 10.6c-.9.3-.8 1.6.2 1.8l4.5 1.2 1.5 4.5c.3.9 1.5 1 1.9.2l2.2-4.3 4.8-8.7c.5-.9-.3-1.9-1.2-1.6z" strokeWidth="1.2" />
      <path d="m8.1 13.6 9.5-7.2-7.4 8.5" strokeWidth="1.2" />
    </IconBase>
  );
}

function IconShare() {
  return (
    <IconBase>
      <circle cx="18" cy="5.2" r="2.2" strokeWidth="1.8" />
      <circle cx="6" cy="12" r="2.2" strokeWidth="1.8" />
      <circle cx="18" cy="18.8" r="2.2" strokeWidth="1.8" />
      <path d="M8.1 11 15.9 6.2M8.1 13l7.8 4.8" strokeWidth="1.8" />
    </IconBase>
  );
}

function IconDownload() {
  return (
    <IconBase>
      <path d="M12 4v10" strokeWidth="2" />
      <path d="m7.8 10.8 4.2 4.2 4.2-4.2" strokeWidth="2" />
      <path d="M5 19h14" strokeWidth="2" />
    </IconBase>
  );
}

function ShareHandPanel({ result, t, language, isLight }) {
  const shareCanvasRef = useRef(null);
  const [feedback, setFeedback] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [isRenderingPreview, setIsRenderingPreview] = useState(false);
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  const [shareImageBlob, setShareImageBlob] = useState(null);

  const shareMeta = useMemo(() => {
    if (!result?.cards || result.cards.length !== 5) return null;
    const cards = formatCards(result.cards, { useFace: true });
    const topCards =
      result?.best?.pointCards?.length === 2 && result?.best?.baseCards?.length === 3 ? formatCards(result.best.pointCards, { useFace: true }) : cards.slice(0, 2);
    const baseCards =
      result?.best?.pointCards?.length === 2 && result?.best?.baseCards?.length === 3 ? formatCards(result.best.baseCards, { useFace: true }) : cards.slice(2, 5);
    const cardsText = cards.join(" ");
    const summary = result.best ? formatHandSummary(result.best, t, language) : t.noResultTitle;
    const text = `${t.shareCards(cardsText)}\n${t.shareResult(summary)}`;
    return {
      text,
      cards,
      topCards,
      baseCards,
      summary,
      timestamp: new Date().toLocaleString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      })
    };
  }, [result, t, language]);

  const renderShareImage = useCallback(async () => {
    const canvas = shareCanvasRef.current;
    if (!shareMeta || !canvas) return null;
    if (!isPreviewReady) {
      const drawn = drawShareCanvasPreview(canvas, shareMeta, language, t.title);
      setIsPreviewReady(drawn);
      if (!drawn) return null;
    }
    try {
      setIsRenderingPreview(true);
      const blob = await new Promise((resolve) => {
        canvas.toBlob((nextBlob) => resolve(nextBlob), "image/png");
      });
      if (!blob) {
        setFeedback(t.shareFailed);
        return null;
      }
      setShareImageBlob(blob);
      return blob;
    } catch {
      setFeedback(t.shareFailed);
      return null;
    } finally {
      setIsRenderingPreview(false);
    }
  }, [isPreviewReady, language, shareMeta, t.shareFailed, t.title]);

  useEffect(() => {
    setFeedback("");
    setIsSharing(false);
    setShareImageBlob(null);
    setIsPreviewReady(false);
  }, [shareMeta]);

  useEffect(() => {
    if (!shareMeta || !shareCanvasRef.current) return;
    const canvas = shareCanvasRef.current;
    const frameId = window.requestAnimationFrame(() => {
      const drawn = drawShareCanvasPreview(canvas, shareMeta, language, t.title);
      setIsPreviewReady(drawn);
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [shareMeta, language, t.title]);

  const socialButtons = useMemo(
    () => [
      { key: "instagram", label: t.shareInstagram, Icon: IconInstagram, tone: "bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white" },
      { key: "whatsapp", label: t.shareWhatsApp, Icon: IconWhatsApp, tone: "bg-[#25D366] text-white" },
      { key: "x", label: t.shareX, Icon: IconX, tone: "bg-black text-white" }
    ],
    [t]
  );

  async function ensureShareImage() {
    if (shareImageBlob) return shareImageBlob;
    return renderShareImage();
  }

  async function shareImage() {
    if (!shareMeta) return;
    if (typeof navigator === "undefined") {
      setFeedback(t.shareFailed);
      return;
    }
    const imageBlob = await ensureShareImage();
    if (!imageBlob) return;

    const fileName = `ngau-hand-${new Date().toISOString().replace(/[:.]/g, "-")}.png`;
    const imageFile = new File([imageBlob], fileName, { type: "image/png" });
    const canShareFile = typeof navigator.canShare !== "function" || navigator.canShare({ files: [imageFile] });

    try {
      setIsSharing(true);
      if (navigator.share && canShareFile) {
        await navigator.share({
          title: t.sharePanelTitle,
          text: shareMeta.text,
          files: [imageFile]
        });
        setFeedback(t.shareDone);
        return;
      }
      downloadBlob(imageBlob, fileName);
      setFeedback(t.shareDownloaded);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setFeedback(t.shareFailed);
    } finally {
      setIsSharing(false);
    }
  }

  async function savePhoto() {
    if (!shareMeta) return;
    const imageBlob = await ensureShareImage();
    if (!imageBlob) return;
    const fileName = `ngau-hand-${new Date().toISOString().replace(/[:.]/g, "-")}.png`;
    if (typeof navigator !== "undefined" && navigator.share) {
      const imageFile = new File([imageBlob], fileName, { type: "image/png" });
      const canShareFile = typeof navigator.canShare !== "function" || navigator.canShare({ files: [imageFile] });
      if (canShareFile) {
        try {
          setIsSharing(true);
          await navigator.share({ files: [imageFile] });
          setFeedback(t.shareDone);
          return;
        } catch (error) {
          if (!(error instanceof Error) || error.name !== "AbortError") {
            setFeedback(t.shareFailed);
          }
          return;
        } finally {
          setIsSharing(false);
        }
      }
    }

    downloadBlob(imageBlob, fileName);
    setFeedback(t.shareDownloaded);
  }

  async function downloadPhoto() {
    if (!shareMeta) return;
    const imageBlob = await ensureShareImage();
    if (!imageBlob) return;
    const fileName = `ngau-hand-${new Date().toISOString().replace(/[:.]/g, "-")}.png`;
    downloadBlob(imageBlob, fileName);
    setFeedback(t.shareDownloaded);
  }

  async function handlePhotoAction() {
    if (typeof navigator === "undefined") {
      await downloadPhoto();
      return;
    }
    const mobileFromUAData = typeof navigator.userAgentData?.mobile === "boolean" ? navigator.userAgentData.mobile : false;
    const mobileFromUA = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || "");
    const coarsePointer = typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia("(pointer: coarse)").matches : false;
    const hasTouch = typeof navigator.maxTouchPoints === "number" && navigator.maxTouchPoints > 0;
    const shouldSaveToPhoto = mobileFromUAData || mobileFromUA || (coarsePointer && hasTouch);

    if (shouldSaveToPhoto) {
      await savePhoto();
      return;
    }
    await downloadPhoto();
  }

  return (
    <section
      className={
        isLight
          ? "relative mt-4 overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-emerald-50 p-4 shadow-xl"
          : "relative mt-4 overflow-hidden rounded-3xl border border-emerald-300/30 bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 p-4 shadow-panel"
      }
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-amber-300/25 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-10 h-28 w-28 rounded-full bg-emerald-300/20 blur-2xl" />
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-2">
          <h3 className={isLight ? "font-title text-lg text-slate-900" : "font-title text-lg text-emerald-50"}>{t.sharePanelTitle}</h3>
          <span className={isLight ? "rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold text-slate-700" : "rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-emerald-100/90"}>
            PNG
          </span>
        </div>
        <p className={isLight ? "mt-1 text-sm text-slate-700" : "mt-1 text-sm text-emerald-100/85"}>{t.sharePanelBody}</p>

        {shareMeta ? (
          <div className={isLight ? "mt-3 overflow-hidden rounded-2xl border border-slate-300 bg-white p-1" : "mt-3 overflow-hidden rounded-2xl border border-white/20 bg-black/20 p-1"}>
            <div className="flex h-[18.5rem] items-center justify-center overflow-hidden rounded-xl">
              <canvas
                ref={shareCanvasRef}
                width={SHARE_CANVAS_WIDTH}
                height={SHARE_CANVAS_HEIGHT}
                aria-label={t.sharePreviewAlt}
                className="mx-auto h-full w-auto max-w-full object-contain"
              />
            </div>
          </div>
        ) : (
          <div className={isLight ? "mt-3 flex h-44 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70 text-xs text-slate-500" : "mt-3 flex h-44 items-center justify-center rounded-2xl border border-dashed border-white/20 bg-black/20 text-xs text-emerald-100/60"}>
            {isRenderingPreview ? t.shareRendering : t.sharePreparing}
          </div>
        )}
        {shareMeta && !isPreviewReady ? (
          <p className={isLight ? "mt-2 text-xs text-slate-500" : "mt-2 text-xs text-emerald-100/65"}>{t.sharePreparing}</p>
        ) : null}

        <p className={isLight ? "mt-3 text-xs tracking-[0.14em] text-slate-500" : "mt-3 text-xs tracking-[0.14em] text-emerald-100/65"}>{t.shareSocialHint}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {socialButtons.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={shareImage}
              disabled={isSharing || isRenderingPreview || !shareMeta || !isPreviewReady}
              aria-label={item.label}
              title={item.label}
              className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-md shadow-black/20 transition active:scale-[0.97] disabled:opacity-45 ${item.tone}`}
            >
              <item.Icon />
            </button>
          ))}
          <button
            type="button"
            onClick={shareImage}
            disabled={isSharing || isRenderingPreview || !shareMeta || !isPreviewReady}
            aria-label={t.shareAction}
            title={t.shareAction}
            className={isLight ? "flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-300 bg-white text-slate-700 shadow-md shadow-slate-400/25 active:scale-[0.97] disabled:opacity-45" : "flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-black/30 text-emerald-100 shadow-md shadow-black/30 active:scale-[0.97] disabled:opacity-45"}
          >
            <IconShare />
          </button>
          <button
            type="button"
            onClick={handlePhotoAction}
            disabled={isSharing || isRenderingPreview || !shareMeta || !isPreviewReady}
            aria-label={t.shareDownloadImage}
            title={t.shareDownloadImage}
            className={isLight ? "flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-300 bg-white text-slate-700 shadow-md shadow-slate-400/25 active:scale-[0.97] disabled:opacity-45" : "flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-black/30 text-emerald-100 shadow-md shadow-black/30 active:scale-[0.97] disabled:opacity-45"}
          >
            <IconDownload />
          </button>
        </div>

        {feedback ? <p className={isLight ? "mt-2 text-xs font-semibold text-emerald-700" : "mt-2 text-xs font-semibold text-emerald-200"}>{feedback}</p> : null}
      </div>
    </section>
  );
}

function ResultDialog({ open, onClose, onReset, result, t, language, isLight }) {
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

function PickerPanel({ pickedCards, addPickedCard, removePickedCard, clear, analyze, canAnalyze, t, isLight }) {
  const disabled = pickedCards.length >= 5;
  const hasCards = pickedCards.length > 0;

  return (
    <section className={isLight ? "mt-3 space-y-3 rounded-2xl border border-slate-300 bg-slate-100 p-3" : "mt-3 space-y-3 rounded-2xl border border-white/15 bg-black/20 p-3"}>
      <div>
        <div className="flex items-center justify-between">
          <p className={isLight ? "text-xs tracking-[0.18em] text-slate-700" : "text-xs tracking-[0.18em] text-emerald-100/80"}>{t.pickerTitle}</p>
          <p className={isLight ? "text-xs font-semibold text-emerald-700" : "text-xs font-semibold text-emerald-200"}>{t.pickerCount(pickedCards.length)}</p>
        </div>
        <p className={isLight ? "mt-1 text-xs text-slate-600" : "mt-1 text-xs text-emerald-100/65"}>{t.pickerHint}</p>
        <div className="mt-2 grid grid-cols-5 gap-1.5 sm:gap-2">
          {Array.from({ length: 5 }, (_, index) => {
            const value = pickedCards[index];
            if (!value) {
              return (
                <div
                  key={`empty-${index}`}
                  className={isLight ? "flex aspect-[3/4] w-full items-center justify-center rounded-lg border border-dashed border-slate-400 bg-white text-xs text-slate-500" : "flex aspect-[3/4] w-full items-center justify-center rounded-lg border border-dashed border-emerald-100/25 bg-black/25 text-xs text-emerald-100/50"}
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
                className="aspect-[3/4] w-full overflow-hidden rounded-lg active:scale-[0.98]"
                aria-label={`remove-card-${index}`}
              >
                <PokerCard value={value} size="picker" />
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className={isLight ? "text-xs tracking-[0.16em] text-slate-700" : "text-xs tracking-[0.16em] text-emerald-100/75"}>{t.pickerAces}</p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {ACE_SUIT_OPTIONS.map((option) => (
            <button
              key={option.token}
              type="button"
              onClick={() => addPickedCard(option.token)}
              disabled={disabled}
              aria-label={`add-${option.token}`}
              className={isLight ? "h-12 touch-manipulation rounded-2xl border border-slate-300 bg-white px-2 text-sm font-semibold text-slate-700 disabled:opacity-40" : "h-12 touch-manipulation rounded-2xl border border-white/20 bg-black/35 px-2 text-sm font-semibold text-emerald-50 disabled:opacity-40"}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className={isLight ? "text-xs tracking-[0.16em] text-slate-700" : "text-xs tracking-[0.16em] text-emerald-100/75"}>{t.pickerRanks}</p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {RANK_OPTIONS.map((rank) => (
            <button
              key={rank}
              type="button"
              onClick={() => addPickedCard(rank)}
              disabled={disabled}
              aria-label={`add-${rank}`}
              className={isLight ? "h-12 touch-manipulation rounded-2xl border border-slate-300 bg-white px-2 text-sm font-semibold text-slate-700 disabled:opacity-40" : "h-12 touch-manipulation rounded-2xl border border-white/20 bg-black/35 px-2 text-sm font-semibold text-emerald-50 disabled:opacity-40"}
            >
              {rank}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={clear}
          disabled={!hasCards}
          className={isLight ? "h-12 rounded-2xl border border-slate-300 bg-white text-sm font-semibold text-slate-700 active:scale-[0.98] disabled:opacity-40" : "h-12 rounded-2xl border border-white/20 bg-black/35 text-sm font-semibold text-emerald-100 active:scale-[0.98] disabled:opacity-40"}
        >
          {t.clear}
        </button>
        <button
          type="button"
          onClick={analyze}
          disabled={!canAnalyze}
          className="h-12 rounded-2xl bg-chip-red font-semibold text-white shadow-lg shadow-red-950/40 active:scale-[0.98] disabled:opacity-40"
        >
          {t.analyze}
        </button>
      </div>
    </section>
  );
}

function HistoryPanel({ history, t, language, isLight, loadHistoryHand }) {
  return (
    <section className={isLight ? "space-y-3 rounded-3xl border border-slate-300 bg-white p-4 shadow-xl" : "space-y-3 rounded-3xl border border-white/20 bg-black/30 p-4 shadow-panel backdrop-blur-md"}>
      <div className="flex items-center justify-between gap-2">
        <h2 className={isLight ? "font-title text-xl text-slate-900" : "font-title text-xl text-emerald-50"}>{t.historyTitle}</h2>
        <a
          href="./history.html"
          className={isLight ? "rounded-xl border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700" : "rounded-xl border border-white/20 bg-black/25 px-3 py-1 text-xs font-semibold text-emerald-100"}
        >
          {t.historyViewPage}
        </a>
      </div>

      {history.length === 0 ? (
        <p className={isLight ? "text-sm text-slate-600" : "text-sm text-emerald-100/75"}>{t.historyEmpty}</p>
      ) : (
        <div className="max-h-[22rem] space-y-2 overflow-y-auto pr-1">
          {history.map((entry, index) => {
            const summary = entry.best ? formatHandSummary(entry.best, t, language) : t.historyNoResult;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => loadHistoryHand(entry.cards)}
                className={isLight ? "w-full rounded-2xl border border-slate-300 bg-slate-50 p-2 text-left" : "w-full rounded-2xl border border-white/20 bg-black/25 p-2 text-left"}
              >
                <div className="flex items-center justify-between">
                  <span className={isLight ? "text-xs tracking-[0.14em] text-slate-500" : "text-xs tracking-[0.14em] text-emerald-100/70"}>#{index + 1}</span>
                  <span className={isLight ? "text-xs font-semibold text-emerald-700" : "text-xs font-semibold text-emerald-200"}>{t.historyLoad}</span>
                </div>
                <div className="mt-2 flex justify-center gap-1">
                  {entry.cards.map((card, cardIndex) => (
                    <PokerCard key={`${entry.id}-${card}-${cardIndex}`} value={card} size="tiny" />
                  ))}
                </div>
                <p className={isLight ? "mt-2 text-xs text-slate-700" : "mt-2 text-xs text-emerald-100/85"}>{summary}</p>
              </button>
            );
          })}
        </div>
      )}
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

function GuidePages({ t, language, isLight }) {
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

  useEffect(() => {
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  useEffect(() => {
    initializeHistory();
  }, [initializeHistory]);

  const canAnalyze = pickedCards.length === 5;

  return (
    <main className={isLight ? "min-h-screen bg-felt-pattern-light px-4 pb-8 pt-6 text-slate-900" : "min-h-screen bg-felt-pattern px-4 pb-8 pt-6 text-white"}>
      <section className="mx-auto w-full max-w-md space-y-4">
        <header className={isLight ? "rounded-3xl border border-slate-300 bg-white p-5 shadow-xl" : "rounded-3xl border border-white/20 bg-black/30 p-5 shadow-panel backdrop-blur-md"}>
          <div className="mb-3 flex justify-end">
            <MinimalSwitches language={language} setLanguage={setLanguage} theme={theme} setTheme={setTheme} isLight={isLight} />
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

          {error && <p className={isLight ? "mt-3 rounded-xl border border-red-300 bg-red-50 p-2 text-sm text-red-700" : "mt-3 rounded-xl border border-red-300/40 bg-red-500/10 p-2 text-sm text-red-100"}>{error}</p>}
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
