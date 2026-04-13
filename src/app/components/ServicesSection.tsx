// src/app/components/ServicesSection.tsx
"use client";

import type React from "react";
import { useLayoutEffect, useRef, useMemo, type ComponentType } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import {
  IconBrush,
  IconGlobe,
  IconAppWindow,
  IconSeo,
  IconBrandTiktok,
  IconCube,
} from "@tabler/icons-react";
import Container from "./Container";
import { useTranslations as _useTranslations } from "next-intl";

gsap.registerPlugin(ScrollTrigger);

/* ===== USTAWIENIA ===== */
const ANCHOR_EXTRA = -160; // ↑ dodatkowy zapas ponad wysokość nagłówka (podbij do 200/240, jeśli chcesz)

type TFunc = ((key: string, values?: Record<string, any>) => string) & {
  rich?: (key: string, chunks: any) => any;
};

function useSafeTranslations(ns?: string): TFunc {
  try {
    return _useTranslations(ns) as unknown as TFunc;
  } catch {
    const t: TFunc = ((key: string, values?: Record<string, any>) => {
      let out = key;
      if (values) {
        for (const [k, v] of Object.entries(values)) {
          out = out.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }
      return out;
    }) as TFunc;
    t.rich = (key: string, chunks: any) =>
      typeof chunks === "function" ? chunks({}) : chunks;
    return t;
  }
}

type SvcKey = "design" | "web" | "mobile" | "seo" | "threeD" | "social";
const SVC_ORDER: Array<{ key: SvcKey; icon: ComponentType<{ size?: number }> }> = [
  { key: "design", icon: IconBrush },
  { key: "web", icon: IconGlobe },
  { key: "mobile", icon: IconAppWindow },
  { key: "seo", icon: IconSeo },
  { key: "threeD", icon: IconCube },
  { key: "social", icon: IconBrandTiktok },
];

export default function ServicesSection() {
  const t = useSafeTranslations("services");

  const SERVICES = useMemo(
    () =>
      SVC_ORDER.map(({ key, icon }) => ({
        icon,
        title: t(`${key}.title`),
        lead: t(`${key}.lead`),
        desc: t(`${key}.desc`),
      })),
    [t]
  );

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  /* ——— Ustaw var(--header-h) jako fallback, gdy nie ma globalnie ——— */
  useLayoutEffect(() => {
    const header =
      document.querySelector<HTMLElement>("[data-sticky='header']") ||
      document.querySelector<HTMLElement>("[data-sticky-header]") ||
      document.querySelector<HTMLElement>("header[role='banner']");
    const h = header?.offsetHeight || 96;
    const root = document.documentElement;
    if (!getComputedStyle(root).getPropertyValue("--header-h").trim()) {
      root.style.setProperty("--header-h", `${h}px`);
    }
  }, []);

  /* ——— Logika poziomego tracka + pin ——— */
  useLayoutEffect(() => {
    const section = sectionRef.current!;
    const stage = stageRef.current!;
    const track = trackRef.current!;
    if (!section || !stage || !track) return;

    const mqlLg = window.matchMedia("(min-width: 1280px)");
    const mqlMd = window.matchMedia("(min-width: 768px)");

    const visibleCountForViewport = () => (mqlLg.matches ? 3 : mqlMd.matches ? 2 : 1);
    const isClamped = () => mqlMd.matches;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(
        track.querySelectorAll('[data-svc-card="1"]')
      );
      const N = cards.length;

      let centers: number[] = [];
      let stepX = 0;
      let firstCenter = 0;
      let firstLeft = 0;
      let firstWidth = 0;
      let lastCenter = 0;
      let lastWidth = 0;
      let padL = 0;
      let padR = 0;

      const measureCentersAndPaddings = () => {
        centers = cards.map((el) => el.offsetLeft + el.offsetWidth / 2);
        firstCenter = centers[0] ?? 0;
        stepX = centers[1] != null ? centers[1] - centers[0] : cards[0]?.offsetWidth ?? 0;
        firstWidth = cards[0]?.offsetWidth ?? 0;
        firstLeft = firstCenter - firstWidth / 2;

        const lastIdx = Math.max(0, centers.length - 1);
        lastCenter = centers[lastIdx] ?? 0;
        lastWidth = cards[lastIdx]?.offsetWidth ?? 0;

        const cs = getComputedStyle(track);
        padL = parseFloat(cs.paddingLeft || "0") || 0;
        padR = parseFloat(cs.paddingRight || "0") || 0;
      };

      const getUntransformedLeft = () => {
        const bcrLeft = track.getBoundingClientRect().left;
        const tx = (gsap.getProperty(track, "x") as number) || 0;
        return bcrLeft - tx;
      };

      gsap.set(track, { autoAlpha: 1, x: 0, y: 0, transform: "translate3d(0,0,0)" });
      gsap.set(cards, { opacity: 1, willChange: "transform" });

      const trackXTo = gsap.quickTo(track, "x", {
        duration: 0.45,
        ease: "power2.out",
        overwrite: true,
      });

      const state = { t: 0 };

      const render = (tval: number) => {
        const visible = visibleCountForViewport();
        const stageRect = stage.getBoundingClientRect();
        const stageCenterX = stageRect.left + stageRect.width / 2;

        const left0 = getUntransformedLeft();

        const startAlignX = 0 + padL - (left0 + firstLeft);
        const lastRight = lastCenter + lastWidth / 2;
        const endAlignX = stageRect.right - padR - (left0 + lastRight);

        const centerIndex = tval + (visible - 1) / 2;
        const virtualCenter = firstCenter + centerIndex * stepX;
        const centerAlignX = stageCenterX - (left0 + virtualCenter);

        const minX = Math.min(startAlignX, endAlignX);
        const maxX = Math.max(startAlignX, endAlignX);
        const desiredX = isClamped()
          ? gsap.utils.clamp(minX, maxX, centerAlignX)
          : centerAlignX;

        trackXTo(desiredX);
      };

      const applyInitial = () => {
        measureCentersAndPaddings();
        state.t = 0;
        render(state.t);
      };

      requestAnimationFrame(() => requestAnimationFrame(applyInitial));

      let st: ScrollTrigger | null = null;
      const buildST = () => {
        st?.kill();
        const visible = visibleCountForViewport();
        const STEPS = Math.max(0, N - visible);

        if (STEPS <= 0) {
          render(0);
          return;
        }

        // pin z kompensacją nagłówka
        const headerH = parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue("--header-h") || "0"
        );

        st = ScrollTrigger.create({
          trigger: section,
          start: () => `top top+=${headerH}`,
          end: () => `+=${STEPS * 110}%`,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: true,
          onUpdate: (self) => {
            const targetT = self.progress * STEPS;
            gsap.to(state, {
              t: targetT,
              duration: 0.25,
              ease: "power2.out",
              overwrite: "auto",
              onUpdate: () => render(state.t),
            });
          },
          onRefresh: () => {
            measureCentersAndPaddings();
            render(state.t);
          },
        });
      };

      buildST();

      const ro = new ResizeObserver(() => {
        requestAnimationFrame(() => {
          measureCentersAndPaddings();
          buildST();
          ScrollTrigger.refresh();
          render(state.t);
        });
      });
      ro.observe(section);
      ro.observe(stage);
      ro.observe(track);

      const handleMql = () => {
        requestAnimationFrame(() => {
          measureCentersAndPaddings();
          buildST();
          ScrollTrigger.refresh();
          render(state.t);
        });
      };
      mqlLg.addEventListener?.("change", handleMql);
      mqlMd.addEventListener?.("change", handleMql);

      return () => {
        ro.disconnect();
        mqlLg.removeEventListener?.("change", handleMql);
        mqlMd.removeEventListener?.("change", handleMql);
        st?.kill();
      };
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* ★ KOTWICA dla #services — stoi NAD sekcją. */}
      <div
        id="services"
        aria-hidden
        className="h-0"
        style={
          {
            scrollMarginTop: `calc(var(--header-h, 96px) + ${ANCHOR_EXTRA}px)`,
          } as React.CSSProperties
        }
      />

      {/* Właściwa sekcja BEZ id */}
      <section
        ref={sectionRef}
        className="relative w-full py-0"
      >
        {/* Pełny viewport minus nagłówek, żeby nic nie było przycięte */}
        <div
          className="relative"
          style={{ minHeight: "calc(100svh - var(--header-h, 96px))" }}
        >
          {/* STAGE */}
          <div
            ref={stageRef}
            className="
              relative z-10
              h-[calc(100svh-var(--header-h,96px))]
              flex flex-col items-center justify-center
              px-3 sm:px-5 md:px-0
              overflow-hidden
            "
          >
            <Container className="w-full h-full">
              {/* WRAPPER */}
              <div className="flex h-full w-full flex-col items-center justify-center gap-8">
                {/* Header */}
                <div className="mx-auto max-w-3xl text-center md:text-center md:px-8 mb-2 sm:mb-4 md:mb-6">
                  <h2 className="font-orlean text-white/95 text-[clamp(22px,3vw,38px)] md:text-[clamp(30px,4vw,44px)] leading-tight tracking-[0.01em] mb-3 sm:mb-4 md:mb-5">
                    {t("header.title")}
                  </h2>
                  <p className="font-orlean mt-0 text-white/80 text-[clamp(14px,1.6vw,18px)] md:text-[clamp(16px,2vw,20px)] leading-[1.95] md:leading-[1.9] tracking-[0.02em]">
                    {t("header.subtitle")}
                  </p>
                </div>

                {/* TRACK */}
                <div
                  ref={trackRef}
                  className="
                    relative
                    mx-auto
                    flex flex-nowrap items-stretch
                    gap-4 sm:gap-6 md:gap-8 xl:gap-6
                    pl-4 sm:pl-6 md:pl-8 xl:pl-6
                    pr-4 sm:pr-6 md:pr-8 xl:pr-6
                    md:w-[100vw]
                    xl:w-auto
                    will-change-transform
                    max-w-[92vw] md:max-w-none
                  "
                  style={{ willChange: 'transform', transform: 'translateZ(0)' }}
                >
                  {SERVICES.map((s) => (
                    <article
                      key={s.title}
                      data-svc-card="1"
                      className="
                        group relative p-[1px] rounded-2xl
                        bg-white/5
                        shadow-[0_16px_44px_rgba(0,0,0,0.35)]
                        transition-transform duration-300 ease-out
                        hover:-translate-y-[2px]
                        h-auto w-[82vw] shrink-0
                        min-h-[360px]
                        sm:min-h-[380px] sm:w-[70vw]
                        md:min-h-[420px] md:w-[calc((100vw-96px)/2)]
                        xl:min-h-[420px] xl:w-[360px]
                      "
                    >
                      <div
                        className="
                          relative h-full w-full rounded-2xl
                          bg-black/30 backdrop-blur-xl
                          border border-white/10
                          px-6 py-6 sm:px-7 sm:py-7 md:px-8 md:py-8
                          pb-8 sm:pb-9 md:pb-10
                          overflow-hidden flex flex-col
                        "
                      >
                        <div
                          aria-hidden
                          className="
                            pointer-events-none absolute left-1/2 -translate-x-1/2
                            -bottom-12 sm:-bottom-14 md:-bottom-16 xl:-bottom-20
                            w-[160%] sm:w-[175%] md:w-[185%] xl:w-[195%]
                            h-[160px] sm:h-[200px] md:h-[230px] xl:h-[260px]
                            rounded-full
                          "
                          style={{
                            background:
                              "radial-gradient(60% 45% at 50% 82%, rgba(133,253,188,0.32) 0%, rgba(133,253,188,0.12) 52%, rgba(133,253,188,0) 74%)",
                            filter: "blur(28px)",
                            mixBlendMode: "multiply",
                          }}
                        />
                        <CardContent {...s} />
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </Container>
          </div>
        </div>
      </section>
      {/* === SPACER POD SERVICES — większy na mobile === */}
<div
  aria-hidden
  className="
    pointer-events-none
    h-[clamp(112px,22vw,200px)]  /* mobile: duży oddech */
    sm:h-[clamp(64px,10vw,140px)] /* ≥640px: średni */
    lg:h-[clamp(56px,6vw,120px)]  /* ≥1024px: subtelny */
  "
/>
    </>
  );
}

/* ——— Card ——— */
function CardContent({
  icon: Icon,
  title,
  lead,
  desc,
}: {
  icon: ComponentType<{ size?: number }>;
  title: string;
  lead: string;
  desc: string;
}) {
  return (
    <>
      <header className="flex items-center gap-3 sm:gap-3.5">
        <div
          className="
            inline-flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center
            rounded-xl bg-white/5 border border-white/15
            transition-transform duration-300 ease-out
            group-hover:scale-[1.04]
            text-[#85FDBC]
          "
        >
          <Icon size={18} />
        </div>
        <h3 className="font-orlean text-[clamp(18px,2.2vw,28px)] leading-tight tracking-[0.01em] text-white/90 line-clamp-2">
          {title}
        </h3>
      </header>

      <p className="font-orlean mt-3 sm:mt-4 pb-[0.25em] text-white/85 text-[clamp(14px,1.6vw,18px)] leading-[1.75] tracking-[0.01em] line-clamp-3">
        {lead}
      </p>

      <div className="my-4 sm:my-5 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <p className="font-orlean mt-3 sm:mt-0 pb-[0.3em] text-white/80 text-[clamp(13px,1.4vw,16px)] leading-[1.75] tracking-[0.01em] line-clamp-4">
        {desc}
      </p>
    </>
  );
}
