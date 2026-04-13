// src/app/components/ProjectsSection.tsx
"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, MotionConfig, cubicBezier } from "framer-motion";
import {
  IconWorld,
  IconArrowRight,
  IconPalette,
  IconX,
} from "@tabler/icons-react";
import type { Icon as TablerIcon } from "@tabler/icons-react";
import Image from "next/image";
import Container from "./Container";
import { useTranslations as _useTranslations } from "next-intl";

/* ——— Safe translations (bez NextIntlClientProvider nie wywala renderu) ——— */
type TFunc = ((key: string, values?: Record<string, any>) => string) & {
  rich?: (key: string, chunks: any) => any;
};
function useSafeTranslations(ns?: string): TFunc {
  try {
    return _useTranslations(ns) as unknown as TFunc;
  } catch {
    const t: TFunc = ((key: string, values?: Record<string, any>) => {
      let out = key;
      if (values) for (const [k, v] of Object.entries(values)) {
        out = out.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      }
      return out;
    }) as TFunc;
    t.rich = (key: string, chunks: any) =>
      typeof chunks === "function" ? chunks({}) : chunks;
    return t;
  }
}

/* ——— Kategorie ———
   WYRZUCONE: "Mobile Apps"
*/
const CAT_KEYS = ["all", "websites", "branding"] as const;
type CatKey = typeof CAT_KEYS[number];

type CategoryDef = {
  key: CatKey;
  icon?: TablerIcon; // tylko dla kart (podpis kategorii)
};

const CATEGORY_META: Record<Exclude<CatKey, "all">, CategoryDef> = {
  websites: { key: "websites", icon: IconWorld },
  branding: { key: "branding", icon: IconPalette },
};

type Project = {
  id: string;
  title: string;
  category: Exclude<CatKey, "all">;
  slug: string;
  cover?: string;   // miniatura
  preview?: string; // duży podgląd
};

/* ——— Dane projektów (tylko Websites / Branding) ——— */
const PROJECTS: Project[] = [
  { id: "1", title: "CARGETS", category: "websites", slug: "/projects/cargets", cover: "/covers/cargets_website.webp", preview: "/previews/cargets_full.webp" },
  { id: "2", title: "ECOLUX", category: "websites", slug: "/projects/ecolux", cover: "/covers/ecolux_website.webp", preview: "/previews/ecolux_full.webp" },
  { id: "3", title: "SPACEPROMO", category: "websites", slug: "/projects/spacepromo", cover: "/covers/spacepromo_website.webp", preview: "/previews/spacepromo_full.webp" },
  { id: "4", title: "STRADALECLUB", category: "websites", slug: "/projects/stradaleclub", cover: "/covers/stradale_website.webp", preview: "/previews/stradale_full.webp" },
  { id: "5", title: "OFFZONE", category: "websites", slug: "/projects/offzone", cover: "/covers/offzone_website.webp", preview: "/previews/offzone_full.webp" },
  { id: "6", title: "CARGETS", category: "branding", slug: "/projects/cargets", cover: "/covers/cargets_logo_branding.webp", preview: "/covers/cargets_logo_branding.webp" },
  { id: "7", title: "MACHINEGETS", category: "branding", slug: "/projects/machinegets", cover: "/covers/machinegets_logo_branding.webp", preview: "/covers/machinegets_logo_branding.webp" },
  { id: "8", title: "ECOLUX", category: "branding", slug: "/projects/ecolux", cover: "/covers/ecolux_logo_branding.webp", preview: "/covers/ecolux_logo_branding.webp" },
  { id: "9", title: "OFFZONE", category: "branding", slug: "/projects/offzone", cover: "/covers/offzone_logo_branding.webp", preview: "/covers/offzone_logo_branding.webp" },
  { id: "10", title: "DROPUZA", category: "branding", slug: "/projects/dropuza", cover: "/covers/dropuza_logo_branding.webp", preview: "/covers/dropuza_logo_branding.webp" },
  { id: "11", title: "ROZIA", category: "branding", slug: "/projects/rozia", cover: "/covers/rozia_logo_branding.webp", preview: "/covers/rozia_logo_branding.webp" },
];

const EASE = cubicBezier(0.22, 1, 0.36, 1);

const revealVariant = {
  hidden: { opacity: 0, y: 60, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "tween", duration: 1.2, ease: EASE },
  },
} as const;

export default function ProjectsSection() {
  const t = useSafeTranslations("projects");

  // etykiety filtrów z tłumaczeń
  const CATEGORY_LABELS = useMemo(
    () => ({
      all: t("categories.all"),
      websites: t("categories.websites"),
      branding: t("categories.branding"),
    }),
    [t]
  );

  const [active, setActive] = useState<CatKey>("all");
  const [hovered, setHovered] = useState<CatKey | null>(null);
  const [selected, setSelected] = useState<Project | null>(null);

  const highlight = hovered ?? active;

  const filtered = useMemo(() => {
    if (active === "all") return PROJECTS;
    return PROJECTS.filter((p) => p.category === active);
  }, [active]);

  const visible = filtered.slice(0, 3);
  const hidden = filtered.slice(3);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setSelected(null);
    if (selected) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [selected]);

  return (
    <section id="projects" className="relative w-full py-16 md:py-24 bg-transparent overflow-hidden">
      {/* Tło — elipsy */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[-12vw] top-1/2 -translate-y-1/2 -z-10"
        style={{
          width: "46vw",
          height: "46vw",
          borderRadius: "9999px",
          background:
            "radial-gradient(closest-side, rgba(253,229,133,0.85) 0%, rgba(253,229,133,0.55) 35%, rgba(253,229,133,0) 70%)",
          filter: "blur(90px)",
          opacity: 0.9,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-12vw] top-1/2 -translate-y-1/2 -z-10"
        style={{
          width: "48vw",
          height: "48vw",
          borderRadius: "9999px",
          background:
            "radial-gradient(closest-side, rgba(133,253,188,0.85) 0%, rgba(133,253,188,0.55) 35%, rgba(133,253,188,0) 70%)",
          filter: "blur(95px)",
          opacity: 0.85,
        }}
      />

      <Container className="relative">
        {/* Nagłówek + filtry */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 className="font-orlean font-medium text-white tracking-[0.02em] text-[clamp(26px,4vw,42px)]">
            {t("header.title")}
          </h2>

          <MotionConfig transition={{ type: "spring", stiffness: 520, damping: 36, mass: 0.6 }}>
            <div className="relative flex flex-wrap items-center gap-3">
              {CAT_KEYS.map((key) => {
                const isHighlighted = highlight === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActive(key)}
                    onMouseEnter={() => setHovered(key)}
                    onMouseLeave={() => setHovered(null)}
                    className={`relative isolate rounded-full px-4 py-2 text-[14px] md:text-[15px] font-aventa backdrop-blur-md transition-colors duration-[700ms] ease-[cubic-bezier(.22,1,.36,1)] ${
                      isHighlighted ? "text-black" : "text-white bg-[#232323]/70 hover:text-black"
                    }`}
                  >
                    {isHighlighted && (
                      <motion.span
                        layoutId="filter-pill"
                        className="absolute inset-0 -z-10 rounded-full"
                        style={{ background: "#5ee9b5", boxShadow: "0 8px 30px rgba(94, 233, 181, 0.35)" }}
                      />
                    )}
                    {CATEGORY_LABELS[key]}
                  </button>
                );
              })}
            </div>
          </MotionConfig>
        </div>

        {/* GRID */}
        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((p, i) => (
            <motion.article
              key={p.id}
              initial="hidden"
              animate="visible"
              variants={revealVariant}
              transition={{ type: "tween", delay: i * 0.1, duration: 1.1, ease: EASE }}
              className="group relative overflow-hidden rounded-[28px] bg-transparent cursor-pointer"
              onClick={() => setSelected(p)}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[28px] border border-white/10 transition-colors duration-[700ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:border-white/25 z-20"
              />
              <ProjectCard p={p} t={t} />
            </motion.article>
          ))}

          {hidden.map((p, i) => (
            <motion.article
              key={p.id}
              variants={revealVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              transition={{ type: "tween", delay: i * 0.1, duration: 1.2, ease: EASE }}
              className="group relative overflow-hidden rounded-[28px] bg-transparent cursor-pointer"
              onClick={() => setSelected(p)}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[28px] border border-white/10 transition-colors duration-[700ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:border-white/25 z-20"
              />
              <ProjectCard p={p} t={t} />
            </motion.article>
          ))}
        </div>
      </Container>

      {/* FULLSCREEN IMAGE VIEWER */}
      <AnimatePresence>
        {selected && (
          <FullscreenImageViewer
            key={selected.id}
            src={selected.preview || selected.cover || ""}
            alt={selected.title}
            onClose={() => setSelected(null)}
            t={t}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function ProjectCard({ p, t }: { p: Project; t: TFunc }) {
  const meta = CATEGORY_META[p.category];
  const Icon = meta.icon!;
  // etykieta kategorii po tłumaczeniu
  const label =
    p.category === "websites" ? t("categories.websites") : t("categories.branding");

  return (
    <>
      <div className="relative aspect-[16/10] w-full z-0 overflow-hidden rounded-t-[28px]">
        {p.cover ? (
          <Image
            src={p.cover}
            alt=""
            fill
            className="z-0 object-cover opacity-[0.98] transition-transform duration-700 group-hover:scale-[1.03]"
            sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-[#222]" />
        )}
      </div>

      <div
        className="
          relative z-10 -mt-px flex items-center justify-between
          px-3 md:px-4 lg:px-5 py-3
          rounded-b-[20px]
          bg-white/10 backdrop-blur-[12px]
          border border-white/10
          [transition-property:border-color] duration-[700ms] ease-[cubic-bezier(.22,1,.36,1)]
          group-hover:border-white/25
        "
      >
        <div className="flex items-center gap-2 text-white/80 font-aventa text-[13px] md:text-[14px]">
          <Icon size={16} stroke={2} aria-hidden />
          <span>{label}</span>
        </div>

        <div
          className="
            group/title flex items-center gap-1.5 font-orlean
            text-white text-[18px] md:text-[20px] lg:text-[22px]
            [transition-property:color] duration-[700ms] ease-[cubic-bezier(.22,1,.36,1)]
            group-hover/title:text-[#5ee9b5]
          "
        >
          <span className="tracking-[0.06em]">{p.title}</span>
          <IconArrowRight className="text-[#5ee9b5] transition-all duration-[700ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover/title:translate-x-[3px]" />
        </div>
      </div>
    </>
  );
}

/* =========================
   Fullscreen Image Viewer
   ========================= */
function FullscreenImageViewer({
  src,
  alt,
  onClose,
  t,
}: {
  src: string;
  alt: string;
  onClose: () => void;
  t: TFunc;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [fitWidth, setFitWidth] = useState<number>(1);
  const clamp = (v: number, min = 0.2, max = 6) => Math.min(max, Math.max(min, v));

  const dragging = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  if (!src) return null;

  const onBackdropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const onImgLoad = useCallback(() => {
    const img = imgRef.current;
    const scrollBox = scrollerRef.current;
    if (!img || !scrollBox) return;

    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    if (!nw || !nh) return;

    setNatural({ w: nw, h: nh });

    const cw = scrollBox.clientWidth;
    const s = cw / nw; // fit width
    setFitWidth(s);
    setScale(s);

    scrollBox.scrollTop = 0;
    scrollBox.scrollLeft = 0;
  }, []);

  useEffect(() => {
    const onResize = () => {
      const scrollBox = scrollerRef.current;
      if (!scrollBox || !natural) return;
      const cw = scrollBox.clientWidth;
      const newFit = cw / natural.w;
      setScale((prev) => (prev / fitWidth) * newFit);
      setFitWidth(newFit);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [natural, fitWidth]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        setScale((s) => clamp(s * 1.1));
      } else if (e.key === "-") {
        e.preventDefault();
        setScale((s) => clamp(s / 1.1));
      } else if (e.key === "0") {
        e.preventDefault();
        setScale(fitWidth);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fitWidth]);

  const onDoubleClick = () => {
    setScale((s) => (Math.abs(s - fitWidth) < 0.001 ? clamp(fitWidth * 2) : fitWidth));
  };

  const onWheelCapture = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el) return;
    if (e.ctrlKey) return;
    el.scrollTop += e.deltaY;
    el.scrollLeft += e.deltaX;
    e.stopPropagation();
    e.preventDefault();
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el) return;
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    (e.currentTarget as HTMLElement).style.cursor = "grabbing";
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el || !dragging.current || !lastPos.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    el.scrollLeft -= dx;
    el.scrollTop -= dy;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = false;
    lastPos.current = null;
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    (e.currentTarget as HTMLElement).style.cursor = "grab";
  };

  const EASE = cubicBezier(0.22, 1, 0.36, 1);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      aria-label={t("viewer.ariaPreview", { title: alt })}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={onBackdropMouseDown}
      style={{ overscrollBehavior: "contain" }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Toolbar */}
      <div className="absolute left-1/2 top-4 z-[110] -translate-x-1/2">
        <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-2 py-1 text-white">
          <button onClick={() => setScale((s) => clamp(s / 1.1))} className="rounded-full px-3 py-1 text-sm hover:bg-white/10" aria-label={t("viewer.zoomOut")}>−</button>
          <span className="px-2 text-sm tabular-nums">{natural ? Math.round((scale / fitWidth) * 100) : 100}%</span>
          <button onClick={() => setScale((s) => clamp(s * 1.1))} className="rounded-full px-3 py-1 text-sm hover:bg-white/10" aria-label={t("viewer.zoomIn")}>+</button>
          <button onClick={() => setScale(fitWidth)} className="rounded-full px-3 py-1 text-sm hover:bg-white/10" title={t("viewer.fitWidth")}>100%</button>
          <button onClick={() => setScale(clamp(fitWidth * 2))} className="rounded-full px-3 py-1 text-sm hover:bg-white/10" title="200%">200%</button>
        </div>
      </div>

      {/* Zamknij */}
      <button
        onClick={onClose}
        aria-label={t("viewer.close")}
        className="absolute right-4 top-4 z-[110] inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white hover:bg-black/80 transition"
      >
        <IconX size={18} stroke={2} />
      </button>

      {/* SCROLLER */}
      <motion.div
        ref={scrollerRef}
        className="relative z-[105] w-[96vw] max-w-[1800px] overflow-auto rounded-[12px] bg-black/20"
        initial={{ y: 20, scale: 0.98, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1, transition: { duration: 0.3, ease: EASE } }}
        exit={{ y: 10, scale: 0.985, opacity: 0, transition: { duration: 0.2, ease: EASE } }}
        onDoubleClick={onDoubleClick}
        onWheelCapture={onWheelCapture}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          height: "calc(100dvh - 96px)",
          maxHeight: "calc(100vh - 96px)",
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
          touchAction: "pan-y pinch-zoom",
          cursor: "grab",
          contain: "layout",
        }}
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className="block h-auto select-none mx-auto"
          draggable={false}
          style={{
            width: natural ? `${natural.w * scale}px` : "auto",
            maxWidth: "none",
          }}
          onLoad={onImgLoad}
        />
      </motion.div>
    </motion.div>
  );
}
