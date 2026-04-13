// src/app/components/NavBar.tsx
"use client";

import type React from "react";
import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import {
  IconWorld,
  IconChevronDown,
  IconArrowRight,
  IconBrandWhatsapp,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import Container from "./Container";
import { SocialBar } from "./socials";
import { useTranslations as _useTranslations, useLocale as _useLocale } from "next-intl";

/* =========================================================================
   SAFE HOOKS
   ========================================================================= */
type Locale = "en" | "fr" | "de" | "pl";
const LOCALES: Locale[] = ["en", "fr", "de", "pl"];

function getLocaleFromPath(path: string | null | undefined): Locale {
  if (!path) return "pl";
  const seg = path.split("/")[1];
  return LOCALES.includes(seg as Locale) ? (seg as Locale) : "pl";
}

function useSafeLocale(): Locale {
  try {
    return _useLocale() as Locale;
  } catch {
    const path = typeof window !== "undefined" ? window.location.pathname : "/";
    return getLocaleFromPath(path);
  }
}

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
/* ========================================================================= */

const LANGS: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
  { code: "de", label: "DE" },
  { code: "pl", label: "PL" },
];

const SECTIONS = ["home", "projects", "services", "contact"] as const;

// --- UI SETTINGS ---
const EAR_SIZE = 56;
const GAP_UNDER_NAV = 12;
const PANEL_R = 28;
const EASE = [0.22, 1, 0.36, 1] as const;

/** burger animation timing */
const SPEED = 1.3;
const HOVER_ALIGN_S = 0.8 * SPEED;
const HOVER_OUT_S = 0.6 * SPEED;
const CLICK_ALIGN_S = 0.28 * SPEED;
const COLLAPSE_S = 0.4 * SPEED;
const EXPAND_S = 0.56 * SPEED;

/** visual nudge for close button */
const CLOSE_Y_NUDGE = 0;

/* === Variants === */
const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.28, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 2.5, ease: EASE } },
} as const;

const panelVariants = {
  initial: { opacity: 0, y: 12, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 2.5, ease: EASE } },
  exit: { opacity: 0, y: 12, scale: 0.98, transition: { duration: 2.5, ease: EASE } },
} as const;

const contentStagger = {
  initial: { opacity: 1 },
  animate: { opacity: 1, transition: { delayChildren: 0.06, staggerChildren: 0.05 } },
  exit: { opacity: 1, transition: { staggerChildren: 0.04, staggerDirection: -1 } },
} as const;

const itemUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.32, ease: EASE } },
  exit: { opacity: 0, y: 8, transition: { duration: 0.2, ease: EASE } },
} as const;

const footerVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE, delay: 0.08 } },
  exit: { opacity: 0, y: 8, transition: { duration: 0.18, ease: EASE } },
} as const;

// Nav intro
const NAV_ENTER = {
  initial: { opacity: 0, y: -14, filter: "blur(2px)" as any },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)" as any,
    transition: {
      type: "spring",
      stiffness: 170,
      damping: 28,
      mass: 0.9,
      bounce: 0,
      restDelta: 0.6,
      when: "beforeChildren",
      delayChildren: 0.03,
      staggerChildren: 0.04,
    },
  },
} as const;

// Items in nav
const NAV_ITEM = {
  initial: { opacity: 0, y: -10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 130, damping: 26, mass: 1, bounce: 0 },
  },
} as const;

/* Drawn X icon – FIXED strokeLinecap */
function DrawnX({
  size = 36,
  stroke = "#ffffff",
  strokeWidth = 2.6,
}: {
  size?: number;
  stroke?: string;
  strokeWidth?: number;
}) {
  const padding = 8;
  const min = padding;
  const max = size - padding;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      className="drop-shadow-[0_4px_20px_rgba(0,0,0,0.35)]"
    >
      <motion.line
        x1={min}
        y1={min}
        x2={max}
        y2={max}
        stroke={stroke}
        strokeOpacity={0.18}
        strokeWidth={strokeWidth + 3}
        strokeLinecap="round"
        pathLength={1}
        initial={{ pathLength: 0 }}
        animate={{
          pathLength: 1,
          transition: { duration: 0.6 * SPEED, ease: "easeOut", delay: 0.08 },
        }}
      />
      <motion.line
        x1={max}
        y1={min}
        x2={min}
        y2={max}
        stroke={stroke}
        strokeOpacity={0.18}
        strokeWidth={strokeWidth + 3}
        strokeLinecap="round"
        pathLength={1}
        initial={{ pathLength: 0 }}
        animate={{
          pathLength: 1,
          transition: { duration: 0.6 * SPEED, ease: "easeOut", delay: 0.22 },
        }}
      />
      <motion.line
        x1={min}
        y1={min}
        x2={max}
        y2={max}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        pathLength={1}
        initial={{ pathLength: 0 }}
        animate={{
          pathLength: 1,
          transition: { duration: 0.6 * SPEED, ease: "easeOut", delay: 0.08 },
        }}
      />
      <motion.line
        x1={max}
        y1={min}
        x2={min}
        y2={max}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        pathLength={1}
        initial={{ pathLength: 0 }}
        animate={{
          pathLength: 1,
          transition: { duration: 0.6 * SPEED, ease: "easeOut", delay: 0.22 },
        }}
      />
    </svg>
  );
}

type BurgerPhase = "idle" | "aligning" | "collapsing" | "hidden" | "expanding";

/** Oblicz rootMargin dla IO z uwzględnieniem wysokości nagłówka */
const getRootMargin = (headerEl: HTMLElement | null) => {
  const headerH = headerEl?.offsetHeight ?? 96;
  const top = Math.round(headerH + 24);
  const bottom = Math.round(window.innerHeight * 0.45);
  return `-${top}px 0px -${bottom}px 0px`;
};

/** Link styles – mniejsze fonty jak wcześniej */
const linkBase = "transition-colors duration-300 no-underline";
const linkCls = (isActive: boolean) =>
  `${linkBase} ${isActive ? "text-white" : "text-white/80 hover:text-white"}`;

/** Usuń wiodący prefix locale ze ścieżki (np. /pl, /fr) i zostaw resztę */
function stripLeadingLocale(path: string): string {
  if (!path || path === "/") return "";
  const parts = path.split("/");
  if (LOCALES.includes(parts[1] as Locale)) {
    const rest = parts.slice(2).join("/");
    return rest ? `/${rest}` : "";
  }
  return path;
}

/** Czy aktualny path to strona główna locale (np. /fr) */
const isOnHome = (locale: Locale) => {
  if (typeof window === "undefined") return false;
  let p = window.location.pathname;
  if (p.endsWith("/")) p = p.slice(0, -1);
  return p === `/${locale}`;
};

export default function NavBar() {
  const t = useSafeTranslations("nav");
  const locale = useSafeLocale();

  const [menuOpen, setMenuOpen] = useState(false);
  const [exiting, setExiting] = useState(false);
  const exitTimer = useRef<number | null>(null);

  // Burger phases
  const [burgerPhase, setBurgerPhase] = useState<BurgerPhase>("idle");
  const alignTimer = useRef<number | null>(null);
  const collapseTimer = useRef<number | null>(null);
  const expandTimer = useRef<number | null>(null);

  // Hover
  const [burgerHover, setBurgerHover] = useState(false);
  const [hoverOut, setHoverOut] = useState(false);
  const hoverOutTimer = useRef<number | null>(null);

  // Lang / active
  const [langOpen, setLangOpen] = useState(false);
  const [active, setActive] = useState<(typeof SECTIONS)[number]>("home");

  // refs
  const navRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // panel + ear
  const [panelInset, setPanelInset] = useState({ left: 16, right: 16, top: 96 });
  const [panelSize, setPanelSize] = useState({ w: 0, h: 0 });
  const [earPos, setEarPos] = useState({ top: -24, right: -24 });

  // close button position = burger center
  const [closePos, setClosePos] = useState({ top: 0, left: 0 });

  // mount guard
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // rAF throttle
  const rafId = useRef<number | null>(null);
  const throttle = (fn: () => void) => {
    if (rafId.current) return;
    rafId.current = window.requestAnimationFrame(() => {
      rafId.current = null;
      fn();
    });
  };

  const recalcPanel = useCallback(() => {
    const navEl = navRef.current,
      logoEl = logoRef.current,
      burgerEl = burgerRef.current;
    if (!navEl || !logoEl || !burgerEl) return;

    const vw = window.innerWidth;
    const navRect = navEl.getBoundingClientRect();
    const logoRect = logoEl.getBoundingClientRect();
    const burgerRect = burgerEl.getBoundingClientRect();

    const left = Math.max(0, Math.round(logoRect.left));
    const right = Math.max(0, Math.round(vw - burgerRect.right));
    const top = Math.max(0, Math.round(navRect.bottom + GAP_UNDER_NAV));
    setPanelInset({ left, right, top });

    const burgerCenterY = burgerRect.top + burgerRect.height / 2;
    const earTop = Math.round(burgerCenterY - top - EAR_SIZE / 2);
    const earRight = Math.round(burgerRect.width / 2 - EAR_SIZE / 2);
    setEarPos({ top: earTop, right: earRight });

    const closeTop = Math.round(burgerRect.top + burgerRect.height / 2 - EAR_SIZE / 2);
    const closeLeft = Math.round(burgerRect.left + burgerRect.width / 2 - EAR_SIZE / 2);
    setClosePos({ top: closeTop, left: closeLeft });
  }, []);

  useEffect(() => {
    recalcPanel();
    const onResize = () => throttle(recalcPanel);
    const onScroll = () => throttle(recalcPanel);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [recalcPanel]);

  // after open, re-measure close button
  useEffect(() => {
    if (!menuOpen) return;
    recalcPanel();
    const id1 = requestAnimationFrame(() => recalcPanel());
    return () => cancelAnimationFrame(id1);
  }, [menuOpen, recalcPanel]);

  // measure panel size when open
  useEffect(() => {
    if (!menuOpen) return;
    const measure = () => {
      const el = panelRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setPanelSize({ w: Math.round(r.width), h: Math.round(r.height) });
    };
    const id = requestAnimationFrame(measure);
    const onResize = () => throttle(measure);
    const onScroll = () => throttle(measure);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
    };
  }, [menuOpen]);

  // click outside to close lang menu
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!langRef.current?.contains(e.target as Node)) setLangOpen(false);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  // ESC closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // block scroll when overlay
  useEffect(() => {
    if (typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    if (menuOpen || exiting) document.body.style.overflow = "hidden";
    else document.body.style.overflow = prev || "";
    return () => {
      if (typeof document !== "undefined") document.body.style.overflow = prev;
    };
  }, [menuOpen, exiting]);

  // cleanup exit timer
  useEffect(() => () => {
    if (exitTimer.current) window.clearTimeout(exitTimer.current);
  }, []);

  // close languages when overlay active
  useEffect(() => {
    if (menuOpen || exiting) setLangOpen(false);
  }, [menuOpen, exiting]);

  // ===== Active section marker (IO + hash + onClick) =====
  useEffect(() => {
    const els = SECTIONS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => !!el
    );
    if (!els.length) return;

    const margin = getRootMargin(navRef.current);
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const id = vis?.target.id as (typeof SECTIONS)[number] | undefined;
        if (id && SECTIONS.includes(id)) setActive(id);
      },
      { threshold: [0.15, 0.35, 0.55, 0.75], rootMargin: margin }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // ===================== SCROLL HELPERS =====================
  const getHeaderOffset = () => {
    const nav = navRef.current;
    if (!nav) return 96;
    const rect = nav.getBoundingClientRect();
    return Math.round(rect.bottom) + 12;
  };

  const scrollToSection = useCallback((id: string, behavior: ScrollBehavior = "smooth") => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - getHeaderOffset();
    window.history.replaceState(null, "", `#${id}`);
    window.scrollTo({ top: y, behavior });
  }, []);

  const goTo = (id: string) => {
    setActive(id as any);
    if (isOnHome(locale)) {
      scrollToSection(id, "smooth");
    } else {
      window.location.assign(`/${locale}#${id}`);
    }
  };

  const closeAndGo = (id: string) => {
    closeMenu();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => goTo(id));
    });
  };

  // przewiń po wejściu na stronę z hashem
  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.replace("#", "") : "";
    if (hash && SECTIONS.includes(hash as any) && isOnHome(locale)) {
      requestAnimationFrame(() => scrollToSection(hash, "auto"));
    }
  }, [scrollToSection, locale]);
  // ==========================================================

  // burger open sequence
  const openMenuSequence = () => {
    setBurgerPhase("aligning");
    if (alignTimer.current) window.clearTimeout(alignTimer.current);
    alignTimer.current = window.setTimeout(() => {
      setBurgerPhase("collapsing");
      if (collapseTimer.current) window.clearTimeout(collapseTimer.current);
      collapseTimer.current = window.setTimeout(() => {
        setBurgerPhase("hidden");
        setMenuOpen(true);
      }, COLLAPSE_S * 1000);
    }, CLICK_ALIGN_S * 1000);
  };

  const handleMenuClick = () => {
    if (exiting) {
      if (exitTimer.current) {
        window.clearTimeout(exitTimer.current);
        exitTimer.current = null;
      }
      setExiting(false);
    }
    if (!menuOpen) openMenuSequence();
    else closeMenu();
  };

  const closeMenu = () => {
    if (!menuOpen) return;
    setExiting(true);
    setMenuOpen(false);
    if (exitTimer.current) window.clearTimeout(exitTimer.current);
    exitTimer.current = window.setTimeout(() => {
      setExiting(false);
      exitTimer.current = null;
    }, 2600);
  };

  // burger line animations
  const IDLE_W = "72%";
  const ALIGNED_W = "100%";
  const topLineAnimate = () => {
    if (burgerPhase === "collapsing") {
      return {
        width: ALIGNED_W,
        scaleX: 0,
        transition: {
          width: { duration: CLICK_ALIGN_S, ease: EASE },
          scaleX: { duration: COLLAPSE_S, ease: EASE },
        },
      };
    }
    if (burgerPhase === "expanding")
      return { width: ALIGNED_W, scaleX: 1, transition: { duration: EXPAND_S, ease: EASE } };
    if (burgerPhase === "aligning")
      return { width: ALIGNED_W, scaleX: 1, transition: { duration: CLICK_ALIGN_S, ease: EASE } };
    if (burgerHover)
      return { width: ALIGNED_W, scaleX: 1, transition: { duration: HOVER_ALIGN_S, ease: EASE } };
    if (hoverOut)
      return { width: IDLE_W, scaleX: 1, transition: { duration: HOVER_OUT_S, ease: EASE } };
    return { width: IDLE_W, scaleX: 1, transition: { duration: 0.26 * SPEED, ease: EASE } };
  };
  const bottomLineAnimate = () => {
    if (burgerPhase === "collapsing") {
      return {
        width: ALIGNED_W,
        scaleX: 0,
        transition: {
          width: { duration: CLICK_ALIGN_S, ease: EASE },
          scaleX: { duration: COLLAPSE_S, ease: EASE },
        },
      };
    }
    if (burgerPhase === "expanding")
      return { width: ALIGNED_W, scaleX: 1, transition: { duration: EXPAND_S, ease: EASE } };
    if (burgerPhase === "aligning")
      return { width: ALIGNED_W, scaleX: 1, transition: { duration: CLICK_ALIGN_S, ease: EASE } };
    if (burgerHover)
      return { width: ALIGNED_W, scaleX: 1, transition: { duration: HOVER_ALIGN_S, ease: EASE } };
    if (hoverOut)
      return { width: IDLE_W, scaleX: 1, transition: { duration: HOVER_OUT_S, ease: EASE } };
    return { width: IDLE_W, scaleX: 1, transition: { duration: 0.26 * SPEED, ease: EASE } };
  };

  const visuallyHidden = burgerPhase === "hidden" || menuOpen;

  const waMsg = t("whatsappText");
  const waUrl = `https://wa.me/33781970203?text=${encodeURIComponent(waMsg)}`;

  return (
    <header className={`fixed top-6 inset-x-0 ${exiting ? "z-[90]" : "z-[80]"}`}>
      {/* NAV */}
      <nav ref={navRef} className="w-full py-5 h-auto font-aventa">
        <Container>
          <motion.div
            variants={NAV_ENTER}
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 items-center min-[1280px]:grid-cols-[1fr_auto_1fr] transform-gpu will-change-transform will-change-opacity"
          >
            {/* LOGO */}
            <motion.div variants={NAV_ITEM} className="justify-self-start">
              <a
                ref={logoRef}
                href={`/${locale}#home`}
                className="inline-flex items-center"
                onClick={(e) => {
                  e.preventDefault();
                  goTo("home");
                }}
              >
                <Image
                  src="/logo.svg"
                  alt="xatelier"
                  width={112}
                  height={28}
                  priority
                  className="h-6 w-auto sm:h-7 md:h-8 lg:h-9 xl:h-10"
                />
              </a>
            </motion.div>

            {/* Center links (desktop) – font 16px */}
            <motion.div variants={NAV_ITEM} className="hidden min-[1280px]:flex justify-self-center">
              <ul className="flex gap-10 text-[16px] tracking-wide pt-1">
                {[
                  { id: "home", label: t("home") },
                  { id: "services", label: t("services") },
                  { id: "projects", label: t("projects") },
                ].map((item) => {
                  const isActive = active === (item.id as any);
                  return (
                    <li key={item.id}>
                      <a
                        href={`/${locale}#${item.id}`}
                        aria-current={isActive ? "page" : undefined}
                        onClick={(e) => {
                          e.preventDefault();
                          goTo(item.id);
                        }}
                        className={linkCls(isActive)}
                      >
                        {item.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </motion.div>

            {/* Right side – font 16px */}
            <motion.div variants={NAV_ITEM} className="justify-self-end flex items-center">
              <div className="flex items-center gap-6 sm:gap-8 md:gap-10">
                {/* 1) Contact -> WhatsApp */}
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setActive("contact")}
                  aria-label={t("contactWhatsappAria")}
                  className={`hidden min-[777px]:inline-flex items-center gap-1 text-[16px] leading-none h-6 transition-colors group no-underline ${
                    active === "contact" ? "text-[#a4fac5]" : "text-white hover:text-[#a4fac5]"
                  }`}
                >
                  <span className="transition-colors duration-300">
                    {t("contact")}
                  </span>
                  <span className="inline-flex">
                    <IconArrowRight
                      className="w-[24px] h-[24px] transition-transform group-hover:translate-x-1"
                      stroke={2}
                    />
                  </span>
                </a>

                {/* 2) Languages */}
                <div className="relative inline-block" ref={langRef}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLangOpen((v) => !v);
                    }}
                    aria-haspopup="listbox"
                    aria-expanded={langOpen}
                    aria-label={t("openLangMenuAria")}
                    className="group inline-flex items-center gap-1 text-[12px] leading-none h-6 hover:opacity-100"
                  >
                    <IconWorld className="w-[16px] h-[16px] text-white" stroke={2} aria-hidden />
                    <span
                      suppressHydrationWarning
                      className="w-[2ch] text-center uppercase opacity-80 text-white/80 group-hover:text-white group-hover:opacity-100 transition-colors duration-200"
                    >
                      {LANGS.find((l) => l.code === locale)?.label ?? locale.toUpperCase()}
                    </span>
                    <IconChevronDown
                      className={`w-[16px] h-[16px] text-white transition ${langOpen ? "rotate-180" : ""}`}
                      stroke={2}
                      aria-hidden
                    />
                  </button>

                  <AnimatePresence mode="wait" initial={false}>
                    {langOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, y: -6 }}
                        animate={{ height: "auto", opacity: 1, y: 0 }}
                        exit={{ height: 0, opacity: 0, y: -6 }}
                        transition={{ duration: 0.28, ease: EASE }}
                        className="absolute left-0 right-0 mt-2 overflow-hidden z-[70]"
                        style={{ originX: 0, originY: 0 }}
                      >
                        <div className="w-full rounded-xl border border-white/10 bg-black/70 backdrop-blur-md p-1 text-xs shadow-lg text-center">
                          <ul role="listbox" className="w-full text-white">
                            {LANGS.filter((l) => l.code !== locale).map((lng) => (
                              <li key={lng.code} className="w-full">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const { pathname, search, hash } = window.location;
                                    const rest = stripLeadingLocale(pathname) || "";
                                    const dest = `/${lng.code}${rest}${search || ""}${hash || ""}`;
                                    window.location.assign(dest);
                                  }}
                                  className="w-full px-2 py-1.5 rounded-lg transition-colors hover:bg-[#85FDBC] hover:text-black"
                                  aria-label={t("switchTo", { lang: lng.label })}
                                >
                                  {lng.label}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 3) Burger */}
                <div className="relative w-12 sm:w-16 md:w-[72px] h-6 flex-shrink-0">
                  <motion.button
                    ref={burgerRef}
                    type="button"
                    onClick={handleMenuClick}
                    onHoverStart={() => {
                      if (hoverOutTimer.current) window.clearTimeout(hoverOutTimer.current);
                      setHoverOut(false);
                      setBurgerHover(true);
                    }}
                    onHoverEnd={() => {
                      setBurgerHover(false);
                      setHoverOut(true);
                      if (hoverOutTimer.current) window.clearTimeout(hoverOutTimer.current);
                      hoverOutTimer.current = window.setTimeout(
                        () => setHoverOut(false),
                        HOVER_OUT_S * 1000
                      );
                    }}
                    aria-label={t("openMenuAria")}
                    className="group absolute inset-0 inline-flex items-center justify-center"
                    style={{ visibility: visuallyHidden ? "hidden" : "visible" }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <motion.span
                      aria-hidden
                      className="absolute top-[4px] left-0 h-[3px] bg-white rounded-full"
                      style={{ height: 3, transformOrigin: "left center" }}
                      initial={false}
                      animate={topLineAnimate()}
                      transition={{ ease: EASE }}
                    />
                    <motion.span
                      aria-hidden
                      className="absolute bottom-[4px] right-0 h-[3px] bg-white rounded-full"
                      style={{ height: 3, transformOrigin: "right center" }}
                      initial={false}
                      animate={bottomLineAnimate()}
                      transition={{ ease: EASE }}
                    />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </nav>

      {/* FULLSCREEN MENU */}
      {mounted && typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence initial={false} mode="wait">
            {(menuOpen || exiting) && (
              <motion.div
                key="fs-menu"
                initial={backdropVariants.initial}
                animate={menuOpen ? backdropVariants.animate : backdropVariants.exit}
                className="fixed inset-0 z-[60] overflow-hidden"
                onClick={closeMenu}
                aria-modal={true}
                role="dialog"
                style={{ pointerEvents: exiting ? "none" : "auto" }}
              >
                {/* Background */}
                <div className="absolute inset-0 z-[50] pointer-events-none">
                  <div className="absolute inset-0 bg-full" />
                  <motion.div
                    className="absolute -right-[14%] -bottom-[10%] w-[60vw] h-[60vh] rounded-[50%] blur-3xl opacity-70"
                    style={{
                      background:
                        "radial-gradient(50% 50% at 50% 50%, #FDE585 0%, rgba(253,229,133,0.0) 70%)",
                    }}
                    aria-hidden
                    initial={{ y: 80, opacity: 0, scale: 0.9 }}
                    animate={{
                      y: 0,
                      opacity: 0.7,
                      scale: 1,
                      transition: { duration: 0.6, ease: EASE, delay: 0.06 },
                    }}
                    exit={{
                      y: 40,
                      opacity: 0,
                      scale: 0.95,
                      transition: { duration: 0.28, ease: EASE },
                    }}
                  />
                  <motion.div
                    className="absolute -left-[14%] bottom-1/4 w-[55vw] h-[55vh] rounded-[50%] blur-3xl opacity-70"
                    style={{
                      background:
                        "radial-gradient(50% 50% at 50% 50%, #85FDBC 0%, rgba(133,253,188,0.0) 70%)",
                    }}
                    aria-hidden
                    initial={{ y: 40, opacity: 0, scale: 0.92 }}
                    animate={{
                      y: 0,
                      opacity: 0.7,
                      scale: 1,
                      transition: { duration: 0.6, ease: EASE, delay: 0.12 },
                    }}
                    exit={{
                      y: 20,
                      opacity: 0,
                      scale: 0.96,
                      transition: { duration: 0.28, ease: EASE },
                    }}
                  />
                </div>

                {/* PANEL */}
                <motion.div
                  ref={panelRef}
                  initial={panelVariants.initial}
                  animate={menuOpen ? panelVariants.animate : panelVariants.exit}
                  className="
                    absolute bottom-8
                    rounded-[28px]
                    backdrop-blur-xl filter drop-shadow-[0_20px_60px_rgba(0,0,0,0.45)]
                    overflow-hidden
                    transform-gpu z-[62]
                    clip-panel
                  "
                  style={{
                    left: panelInset.left,
                    right: panelInset.right,
                    top: panelInset.top,
                    transformOrigin: "95% 0%",
                    ["--panel-clip" as any]: (function buildPanelClipPath(
                      w: number,
                      h: number,
                      r: number,
                      earTop: number,
                      earRight: number,
                      earSize: number
                    ) {
                      if (w <= 0 || h <= 0) return "none";
                      const cx = w - earRight - earSize / 2;
                      const cy = earTop + earSize / 2;
                      const cr = earSize / 2;
                      const rect = `
                        M ${r},0 H ${w - r}
                        A ${r},${r} 0 0 1 ${w},${r}
                        V ${h - r}
                        A ${r},${r} 0 0 1 ${w - r},${h}
                        H ${r}
                        A ${r},${r} 0 0 1 0,${h - r}
                        V ${r}
                        A ${r},${r} 0 0 1 ${r},0
                        Z
                      `;
                      const circle = `
                        M ${cx + cr},${cy}
                        A ${cr},${cr} 0 1 0 ${cx - cr},${cy}
                        A ${cr},${cr} 0 1 0 ${cx + cr},${cy}
                        Z
                      `;
                      return `path("evenodd", "${rect} ${circle}")`;
                    })(panelSize.w, panelSize.h, PANEL_R, earPos.top, earPos.right, EAR_SIZE),
                    borderRadius: PANEL_R,
                    clipPath: "var(--panel-clip)" as any,
                    WebkitClipPath: "var(--panel-clip)" as any,
                    willChange: "transform, opacity",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* CONTENT */}
                  <motion.div
                    className="relative p-6 sm:p-10 lg:p-12 xl:p-16 pb-28"
                    initial={contentStagger.initial}
                    animate={contentStagger.animate}
                    exit={contentStagger.exit}
                  >
                    {/* MOBILE/TABLET */}
                    <div className="lg:hidden relative flex flex-col w-full min-h-[72vh]">
                      <div className="flex-1 flex items-center justify-center text-center px-2">
                        <motion.ul
                          className="flex flex-col items-center justify-center gap-4 text-3xl tracking-tight"
                          variants={contentStagger}
                        >
                          {[
                            { id: "home", label: t("home") },
                            { id: "services", label: t("services") },
                            { id: "projects", label: t("projects") },
                            { id: "contact", label: t("contact") },
                          ].map((item) => {
                            const isActive = active === (item.id as any);
                            const isContact = item.id === "contact";
                            return (
                              <motion.li key={item.id} variants={itemUp} className="leading-none">
                                {isContact ? (
                                  <a
                                    href={waUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => {
                                      setActive("contact");
                                      closeMenu();
                                    }}
                                    aria-label={t("contactWhatsappAria")}
                                    className={`transition-colors no-underline ${
                                      isActive ? "text-white" : "text-white/70 hover:text-white"
                                    }`}
                                  >
                                    {item.label}
                                  </a>
                                ) : (
                                  <a
                                    href={`/${locale}#${item.id}`}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      closeAndGo(item.id);
                                    }}
                                    className={`transition-colors no-underline ${
                                      isActive ? "text-white" : "text-white/70 hover:text-white"
                                    }`}
                                  >
                                    {item.label}
                                  </a>
                                )}
                              </motion.li>
                            );
                          })}
                        </motion.ul>
                      </div>

                      <div className="mt-auto w-full flex flex-col items-center text-center">
                        <motion.div className="flex flex-col items-center px-2" variants={itemUp}>
                          <div className="mb-3 inline-flex items-center gap-2 text-sm text-emerald-300/90 font-aventa">
                            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.8)]" />
                            {t("connectWithUs")}
                          </div>
                          <h2 className="text-2xl text-white/95 font-orlean">
                            {t("workingTitle")}
                          </h2>
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={closeMenu}
                            aria-label={t("contactWhatsappAria")}
                            className="group inline-flex items-center gap-2 rounded-full bg-[#85FDBC] text-black font-medium transition-all duration-300 hover:scale-[0.97] active:scale-95 hover:shadow-[0_8px_24px_rgba(133,253,188,0.35)] mt-5 px-4 py-2 text-[13px]"
                          >
                            <span className="inline-block will-change-transform leading-none transition-transform duration-200 group-hover:animate-vibrate-x">
                              {t("letsTalk")}
                            </span>
                            <span
                              aria-hidden
                              className="inline-flex items-center will-change-transform leading-none transition-transform duration-200 group-hover:animate-vibrate-x [animation-delay:60ms]"
                            >
                              <IconBrandWhatsapp className="w-[18px] h-[18px] text-[#000]" stroke={2} />
                            </span>
                          </a>
                        </motion.div>

                        <motion.div className="mt-6 pb-2" variants={footerVariants}>
                          <SocialBar
                            className="flex items-center justify-center"
                            iconSize={20}
                            gap={12}
                            startDelay={0.08}
                            stagger={0.025}
                          />
                        </motion.div>
                      </div>
                    </div>

                    {/* DESKTOP */}
                    <div className="hidden lg:block">
                      <div className="min-h-[48vh] lg:minh-[56vh] grid grid-cols-1 lg:grid-cols-[1.2fr_.8fr] gap-6 md:gap-10 items-center">
                        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                          <motion.div
                            className="mb-5 inline-flex items-center gap-2 text-sm text-emerald-300/90 font-aventa"
                            variants={itemUp}
                          >
                            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.8)]" />
                            {t("connectWithUs")}
                          </motion.div>
                          <motion.h2
                            className="text-4xl sm:text-5xl md:text-6xl tracking-tight text-white/95"
                            variants={itemUp}
                          >
                            <span className="font-orlean font-medium block">
                              {t("workingTitle")}
                            </span>
                          </motion.h2>
                          <motion.div className="mt-8" variants={itemUp}>
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={closeMenu}
                              aria-label={t("contactWhatsappAria")}
                              className="group inline-flex items-center gap-2 md:gap-2.5 lg:gap-3 rounded-full bg-[#85FDBC] text-black font-medium transition-all duration-300 hover:scale-[0.97] active:scale-95 hover:shadow-[0_8px_24px_rgba(133,253,188,0.35)] mt-6 px-4 py-2 text-[13px] md:px-6 md:py-4 md:text-[16px] lg:px-7 lg:py-[18px] lg:text-[20px] min-[1380px]:!px-5 min-[1380px]:!py-3 min-[1380px]:!text-[16px]"
                            >
                              <span className="inline-block will-change-transform leading-none transition-transform duration-200 group-hover:animate-vibrate-x">
                                {t("letsTalk")}
                              </span>
                              <span
                                aria-hidden
                                className="inline-flex items-center will-change-transform leading-none transition-transform duration-200 group-hover:animate-vibrate-x [animation-delay:60ms]"
                              >
                                <IconBrandWhatsapp className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] lg:w-[22px] lg:h-[22px] min-[1380px]:w-[22px] min-[1380px]:h-[22px] text-[#000]" stroke={2} />
                              </span>
                            </a>
                          </motion.div>
                        </div>

                        <motion.div className="lg:pl-8 xl:pl-12" variants={itemUp}>
                          <ul className="space-y-4 sm:space-y-6">
                            {[
                              { id: "home", label: t("home") },
                              { id: "services", label: t("services") },
                              { id: "projects", label: t("projects") },
                            ].map((item, i) => {
                              const isActive = active === (item.id as any);
                              return (
                                <motion.li
                                  key={item.id}
                                  className="flex items-center gap-3"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{
                                    opacity: 1,
                                    y: 0,
                                    transition: { duration: 0.26, ease: EASE, delay: 0.015 * i },
                                  }}
                                  exit={{ opacity: 0, y: 8, transition: { duration: 0.18, ease: EASE } }}
                                >
                                  {isActive ? (
                                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.8)]" />
                                  ) : (
                                    <span className="h-2 w-2" />
                                  )}
                                  <a
                                    href={`/${locale}#${item.id}`}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      closeAndGo(item.id);
                                    }}
                                    className={`block text-3xl md:text-5xl transition-colors no-underline ${
                                      isActive ? "text-white" : "text-white/70 hover:text-white"
                                    }`}
                                  >
                                    {item.label}
                                  </a>
                                </motion.li>
                              );
                            })}
                          </ul>
                        </motion.div>
                      </div>
                    </div>

                    <motion.div className="hidden lg:block absolute inset-x-0 bottom-0" variants={footerVariants}>
                      <div className="px-6 sm:px-10 lg:px-12 xl:px-16 py-4">
                        <SocialBar className="mx-auto" iconSize={20} gap={12} startDelay={0.08} stagger={0.025} />
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Close button portal */}
      {mounted && typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence
            onExitComplete={() => {
              setBurgerPhase("expanding");
              if (expandTimer.current) window.clearTimeout(expandTimer.current);
              expandTimer.current = window.setTimeout(() => setBurgerPhase("idle"), EXPAND_S * 1000 + 140);
            }}
          >
            {menuOpen && (
              <motion.button
                onClick={closeMenu}
                aria-label={t("closeMenuAria")}
                className="group fixed rounded-[22px] focus:outline-none focus:ring-0"
                style={{
                  top: closePos.top + CLOSE_Y_NUDGE,
                  left: closePos.left,
                  width: EAR_SIZE,
                  height: EAR_SIZE,
                  zIndex: 120,
                  pointerEvents: "auto",
                }}
                initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotate: 0,
                  transition: { duration: 0.36 * SPEED, ease: "easeOut" },
                }}
                exit={{
                  rotate: 90,
                  opacity: 0,
                  scale: 0.92,
                  transition: { duration: 0.24 * SPEED, ease: EASE },
                }}
                whileHover={{ scale: 0.92 }}
                whileTap={{ scale: 0.88 }}
              >
                <motion.span
                  aria-hidden
                  className="absolute inset-0 rounded-full"
                  initial={{ scale: 0.7, opacity: 0.0 }}
                  animate={{ scale: [0.7, 1.25, 1.4], opacity: [0.0, 0.22, 0] }}
                  transition={{ duration: 0.6 * SPEED, times: [0, 0.6, 1] }}
                  style={{
                    boxShadow: "0 0 0 2px rgba(255,255,255,0.12), 0 0 40px rgba(255,255,255,0.18)",
                    pointerEvents: "none",
                  }}
                />
                <span className="relative flex h-full w-full items-center justify-center">
                  <DrawnX size={36} stroke="#ffffff" strokeWidth={2.6} />
                </span>
              </motion.button>
            )}
          </AnimatePresence>,
          document.body
        )}
    </header>
  );
}
