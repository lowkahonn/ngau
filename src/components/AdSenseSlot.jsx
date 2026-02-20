import { useEffect, useRef, useState } from "react";

const ADSENSE_CLIENT = "ca-pub-7820179081725825";
const ADSENSE_SLOT = (import.meta.env.VITE_ADSENSE_SLOT_PHASE1 || "").trim();
const OBSERVER_ROOT_MARGIN = "300px";

function hasValidSlot(slotId) {
  return /^\d{10,}$/.test(slotId) && !/^0+$/.test(slotId);
}

function canUseAdSense() {
  return import.meta.env.PROD && hasValidSlot(ADSENSE_SLOT);
}

export default function AdSenseSlot({ isLight }) {
  const wrapperRef = useRef(null);
  const adRef = useRef(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    if (!canUseAdSense()) return undefined;
    const wrapper = wrapperRef.current;
    if (!wrapper) return undefined;
    if (!("IntersectionObserver" in window)) {
      setIsNearViewport(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: OBSERVER_ROOT_MARGIN }
    );

    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!canUseAdSense() || !isNearViewport || requested) return;
    const adNode = adRef.current;
    if (!adNode || adNode.dataset.adsbygoogleStatus) {
      setRequested(true);
      return;
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      setRequested(true);
    } catch (error) {
      if (!import.meta.env.PROD) {
        console.warn("AdSense request failed:", error);
      }
    }
  }, [isNearViewport, requested]);

  if (!canUseAdSense()) return null;

  return (
    <section
      ref={wrapperRef}
      aria-label="sponsored"
      className={isLight ? "rounded-3xl border border-slate-300 bg-white p-3 shadow-xl" : "rounded-3xl border border-white/20 bg-black/30 p-3 shadow-panel backdrop-blur-md"}
    >
      <p className={isLight ? "mb-2 text-[10px] tracking-[0.16em] text-slate-500" : "mb-2 text-[10px] tracking-[0.16em] text-emerald-100/55"}>SPONSORED</p>
      <div className={isLight ? "rounded-2xl bg-slate-100 p-2" : "rounded-2xl bg-black/25 p-2"}>
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: "block", minHeight: "120px" }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={ADSENSE_SLOT}
          data-ad-format="horizontal"
          data-full-width-responsive="true"
        />
      </div>
    </section>
  );
}
