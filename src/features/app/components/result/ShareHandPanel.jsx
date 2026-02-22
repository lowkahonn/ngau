import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { formatCards } from "../../../../lib/gnau";
import { drawShareCanvasPreview, SHARE_CANVAS_HEIGHT, SHARE_CANVAS_WIDTH } from "../../lib/shareCanvasRenderer";
import { downloadBlob } from "../../lib/shareFile";
import { formatHandSummary } from "../../../shared/gnau/handSummary";
import { IconDownload, IconInstagram, IconShare, IconWhatsApp, IconX } from "./ShareIcons";

export default function ShareHandPanel({ result, t, language, isLight }) {
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

        {shareMeta && !isPreviewReady ? <p className={isLight ? "mt-2 text-xs text-slate-500" : "mt-2 text-xs text-emerald-100/65"}>{t.sharePreparing}</p> : null}

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
