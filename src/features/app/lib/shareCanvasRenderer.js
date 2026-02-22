import { suitText } from "../../../lib/gnau";

const SHARE_PANEL_WIDTH = 500;
const SHARE_PANEL_HEIGHT = 625;
const SHARE_CAPTURE_MARGIN = 16;
const SHARE_EXPORT_SCALE = 1.4;

export const SHARE_CANVAS_WIDTH = Math.round((SHARE_PANEL_WIDTH + SHARE_CAPTURE_MARGIN * 2) * SHARE_EXPORT_SCALE);
export const SHARE_CANVAS_HEIGHT = Math.round((SHARE_PANEL_HEIGHT + SHARE_CAPTURE_MARGIN * 2) * SHARE_EXPORT_SCALE);

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
    ctx.font = "500 20px system-ui, -apple-system, sans-serif";
    ctx.fillText(suitSymbol, x + width / 2, y + height / 2 + 17);
  }
  ctx.restore();
}

export function drawShareCanvasPreview(canvas, meta, language, appTitle) {
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
    panelY + panelHeight * 1.04
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
    panelY + panelHeight * 0.08
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
    panelWidth * 0.92
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
    panelWidth * 0.52
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
    panelWidth * 0.45
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
    panelWidth * 0.26
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
    panelWidth * 0.92
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
