"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations as _useTranslations } from "next-intl";

/* ——— Bezpieczne tłumaczenia ——— */
type TFunc = ((key: string, values?: Record<string, any>) => string) & { rich?: (key: string, chunks: any) => any };
function useSafeTranslations(ns?: string): TFunc {
  try {
    return _useTranslations(ns) as unknown as TFunc;
  } catch {
    const t: TFunc = ((key: string, values?: Record<string, any>) => {
      let out = key;
      if (values) for (const [k, v] of Object.entries(values)) out = out.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      return out;
    }) as TFunc;
    t.rich = (key: string, chunks: any) => (typeof chunks === "function" ? chunks({}) : chunks);
    return t;
  }
}

type Props = {
  offset?: number;
  headerSelector?: string;
  fadeInMs?: number;
  loadMs?: number;
  fadeOutMs?: number;
  /** Dodatkowe podciągnięcie do góry ponad header (px). */
  liftPx?: number;
};

export default function SmoothHash({
  offset = 96,
  headerSelector = "[data-sticky='header'], header[role='banner'], nav[aria-label='Main']",
  fadeInMs = 260,
  loadMs = 1200,
  fadeOutMs = 260,
  liftPx = 32,
}: Props) {
  const t = useSafeTranslations("smooth");

  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const isTransitioning = useRef(false);
  const rafId = useRef<number | null>(null);
  const timers = useRef<number[]>([]);

  /* ——— globalny scroll-padding-top (oparty o header) ——— */
  useEffect(() => {
    const setVar = () => {
      const h = document.querySelector<HTMLElement>(headerSelector)?.offsetHeight || offset;
      document.documentElement.style.setProperty("--header-h", `${h}px`);
    };
    try { if ("scrollRestoration" in history) (history as any).scrollRestoration = "manual"; } catch {}

    setVar();
    window.addEventListener("resize", setVar);
    (window as any)?.ScrollTrigger?.addEventListener?.("refresh", setVar);

    const htmlEl = document.documentElement;
    const prevInline = htmlEl.style.scrollPaddingTop;
    if (!prevInline) htmlEl.style.scrollPaddingTop = "var(--header-h)";
    return () => {
      window.removeEventListener("resize", setVar);
      (window as any)?.ScrollTrigger?.removeEventListener?.("refresh", setVar);
      if (!prevInline) htmlEl.style.removeProperty("scroll-padding-top");
    };
  }, [headerSelector, offset]);

  useEffect(() => {
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const w = window as any;

    const getHeaderHeight = () =>
      document.querySelector<HTMLElement>(headerSelector)?.offsetHeight || offset;

    const getST = (el: HTMLElement) => {
      if (!w?.ScrollTrigger?.getAll) return null;
      return w.ScrollTrigger.getAll().find((st: any) => st?.trigger === el) ?? null;
    };

    const waitStable = async () => {
      w?.ScrollTrigger?.refresh?.();
      await new Promise(r => requestAnimationFrame(r));
      await new Promise(r => requestAnimationFrame(r));
      await new Promise(r => requestAnimationFrame(r));
    };

    const waitStableST = async (st: any) => {
      let last = -1;
      for (let i = 0; i < 10; i++) {
        w?.ScrollTrigger?.refresh?.();
        await new Promise(r => requestAnimationFrame(r));
        const cur = st.start;
        if (Math.abs(cur - last) < 0.5 && cur > 0) break;
        last = cur;
      }
      return st;
    };

    const getElementLift = (el: HTMLElement) => {
      const attr = el.getAttribute("data-hash-lift");
      if (attr != null) return parseFloat(attr) || 0;
      const cssVar = getComputedStyle(el).getPropertyValue("--hash-lift").trim();
      if (cssVar) return parseFloat(cssVar) || 0;
      return liftPx;
    };

    const computeTargetY = async (el: HTMLElement) => {
      const perElLift = getElementLift(el);
      const st = getST(el);
      const pageY = window.scrollY || document.documentElement.scrollTop || 0;
      const headerH = getHeaderHeight() || 0;

      if (st) {
        const stable = await waitStableST(st);
        const pinSpacer: HTMLElement | null = (stable as any).pinSpacer ?? null;
        if (pinSpacer) {
          const spacerTop = pinSpacer.getBoundingClientRect().top + pageY;
          return Math.max(0, spacerTop - headerH - perElLift);
        }
        return Math.max(0, stable.start - headerH - perElLift);
      }

      const smt = parseFloat(getComputedStyle(el).scrollMarginTop || "0") || 0;
      const rect = el.getBoundingClientRect();
      const appliedOffset = Math.max(smt, headerH);
      return Math.max(0, pageY + rect.top - appliedOffset - perElLift);
    };

    const clearTimers = () => {
      timers.current.forEach(id => clearTimeout(id));
      timers.current = [];
    };
    const cancelRaf = () => {
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
      rafId.current = null;
    };

    const runProgress = (onDone: () => void) => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / loadMs);
        const eased = easeOutCubic(t);
        setProgress(Math.round(eased * 100));
        if (t < 1) rafId.current = requestAnimationFrame(tick);
        else onDone();
      };
      rafId.current = requestAnimationFrame(tick);
    };

    const snapThenSettleScroll = async (y: number) => {
      await waitStable();
      const pre = Math.max(0, y - 2);
      if (w?.lenis?.scrollTo) w.lenis.scrollTo(pre, { immediate: true });
      else window.scrollTo({ top: pre, behavior: "auto" });

      await new Promise(r => requestAnimationFrame(r));
      const post = y + 2;
      if (w?.lenis?.scrollTo) w.lenis.scrollTo(post, { immediate: true });
      else window.scrollTo({ top: post, behavior: "auto" });

      await new Promise(r => requestAnimationFrame(r));
      if (w?.lenis?.scrollTo) w.lenis.scrollTo(y, { immediate: true });
      else window.scrollTo({ top: y, behavior: "auto" });
    };

    const jumpToHash = async (hash: string) => {
      const id = hash.startsWith("#") ? hash.slice(1) : hash;
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;

      await waitStable();

      const y = await computeTargetY(el);
      await snapThenSettleScroll(y);

      try { await (document as any).fonts?.ready; } catch {}
      await waitStable();

      const y2 = await computeTargetY(el);
      const curY = window.scrollY || document.documentElement.scrollTop || 0;
      if (Math.abs(y2 - curY) > 1) {
        if (w?.lenis?.scrollTo) w.lenis.scrollTo(y2, { immediate: true });
        else window.scrollTo({ top: y2, behavior: "auto" });
      }
    };

    const showOverlayThen = (fn: () => Promise<void> | void) => {
      if (isTransitioning.current) return;
      isTransitioning.current = true;
      setProgress(0);
      setVisible(true);
      window.dispatchEvent(new CustomEvent("hash-scroll:start"));

      timers.current.push(
        window.setTimeout(() => {
          runProgress(async () => {
            await fn();
            timers.current.push(
              window.setTimeout(() => {
                setVisible(false);
                timers.current.push(
                  window.setTimeout(() => {
                    isTransitioning.current = false;
                    window.dispatchEvent(new CustomEvent("hash-scroll:end"));
                    setProgress(0);
                  }, fadeOutMs)
                );
              }, 80)
            );
          });
        }, fadeInMs)
      );
    };

    /** ✅ Kliki: hash (tej samej strony) ORAZ /privacy (dowolny język), ten sam origin */
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest("a") as HTMLAnchorElement | null;
      if (!a) return;

      const raw = a.getAttribute("href");
      if (!raw) return;

      let url: URL | null = null;
      try {
        url = raw.startsWith("#")
          ? new URL(location.pathname + location.search + raw, location.origin)
          : new URL(raw, location.origin);
      } catch {
        return;
      }

      // 1) Hash na tej samej stronie → przechwytujemy i scrollujemy
      const isSamePage = url.origin === location.origin && url.pathname === location.pathname;
      if (url.hash && isSamePage) {
        e.preventDefault();
        const hash = url.hash;
        showOverlayThen(async () => {
          try { history.pushState(null, "", hash); } catch {}
          await jumpToHash(hash);
        });
        return;
      }

      // 2) /privacy (np. /fr/privacy, /pl/privacy) → pokaż overlay, ale NIE blokuj nawigacji
      const isSameOrigin = url.origin === location.origin;
      const isPrivacy = /\/privacy\/?$/.test(url.pathname);
      if (isSameOrigin && isPrivacy) {
        // nie wywołujemy preventDefault — Next/Link zrobi swoje; my tylko pokażemy overlay
        showOverlayThen(() => {});
        return;
      }
    };

    /** ✅ Reaguj też na hashchange */
    const onHash = () => {
      if (!location.hash) return;
      showOverlayThen(async () => {
        await jumpToHash(location.hash);
      });
    };

    /** Init */
    document.addEventListener("click", onClick, { capture: true });
    window.addEventListener("hashchange", onHash, { capture: true });

    /** Jeśli weszliśmy z hashem — przewiń po „dogrzaniu” i pokaż overlay */
    (async () => {
      if (location.hash) {
        showOverlayThen(async () => {
          await jumpToHash(location.hash);
        });
      }
    })();

    return () => {
      document.removeEventListener("click", onClick, { capture: true } as any);
      window.removeEventListener("hashchange", onHash, { capture: true } as any);
      timers.current.forEach(clearTimeout);
      if (rafId.current) cancelAnimationFrame(rafId.current);
      timers.current = [];
      isTransitioning.current = false;
    };
  }, [offset, headerSelector, fadeInMs, loadMs, fadeOutMs, liftPx]);

  /* ——— Overlay ——— */
  return (
    <div
      aria-hidden
      className={[
        "fixed inset-0 z-[9999] transition-opacity will-change-opacity",
        visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      ].join(" ")}
      style={{
        background: "#000",
        transitionTimingFunction: "cubic-bezier(.22,1,.36,1)",
        transitionDuration: `${visible ? fadeInMs : fadeOutMs}ms`,
      }}
    >
      <div className="absolute inset-0 grid place-items-center">
        <div className="flex flex-col items-center" aria-live="polite" aria-atomic="true">
          <div
            className="font-orlean text-white tracking-wider"
            style={{ fontSize: "clamp(28px, 6vw, 80px)", lineHeight: 1 }}
            aria-label={t("progressAria", { percent: progress })}
          >
            {progress}%
          </div>
          <div className="mt-2 text-white/80 text-sm font-aventa tracking-wide">
            {t("navigating")}
          </div>
        </div>
      </div>

      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-12 w-[min(70vw,680px)] h-[4px] bg-white/10 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-label={t("progressbarLabel")}
      >
        <div
          className="h-full"
          style={{
            width: `${progress}%`,
            background: "#85FDBC",
            boxShadow: "0 0 24px rgba(133, 253, 188, 0.6), 0 0 6px rgba(133, 253, 188, 0.9) inset",
          }}
        />
      </div>
    </div>
  );
}
