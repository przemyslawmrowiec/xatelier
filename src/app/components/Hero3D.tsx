// src/app/components/Hero3D.tsx
"use client";

import { useRef, useLayoutEffect, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import * as THREE from "three";
import { IconArrowRight } from "@tabler/icons-react";
import { motion } from "framer-motion";
import ParticleMorph from "./ParticleMorph";
import Container from "./Container";
import { useTranslations as useIntlT } from "next-intl";

gsap.registerPlugin(ScrollTrigger);

/* Animacje */
const SECTION_ENTER = {
  initial: { opacity: 0, y: -8, filter: "blur(2px)" as any },
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
      staggerChildren: 0.04
    }
  }
} as const;

const LEFT_SYNC = {
  initial: {},
  animate: { transition: { when: "beforeChildren", delayChildren: 0, staggerChildren: 0 } }
} as const;

const leftItem = {
  initial: (_n: boolean) => ({ opacity: 0, y: 18, filter: "blur(2px)" as any }),
  animate: {
    opacity: 1,
    x: 0,
    y: 0,
    filter: "blur(0px)" as any,
    transition: { type: "spring", stiffness: 170, damping: 28, mass: 0.9, bounce: 0 }
  }
} as const;

const rightItem = {
  initial: (_n: boolean) => ({ opacity: 0, y: 18, filter: "blur(2px)" as any }),
  animate: {
    opacity: 1,
    x: 0,
    y: 0,
    filter: "blur(0px)" as any,
    transition: { type: "spring", stiffness: 170, damping: 28, mass: 0.9, bounce: 0 }
  }
} as const;

const CENTER_ENTER = {
  initial: { opacity: 0, scale: 0.98, y: -6, filter: "blur(1px)" as any },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)" as any,
    transition: { type: "spring", stiffness: 170, damping: 28, mass: 0.9, bounce: 0 }
  }
} as const;

export default function Hero3D() {
  const t = useIntlT("hero");
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [isNarrow, setIsNarrow] = useState<boolean>(false);

  // NEW: wykrywanie „desktopu” wg Twojego progu 1380 px
  const isDesktop = !isNarrow; // desktop = min-width: 1380px

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1379px)");
    const update = () => setIsNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // NEW: ScrollTrigger tylko na desktopie
  useLayoutEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (!isDesktop) {
      // brak pinowania i brak aktualizacji postępu na mobile/tablet
      setProgress(0);
      // upewnij się, że ewentualne stare triggery są zabite po zmianie rozmiaru
      ScrollTrigger.getAll().forEach((t) => {
        if ((t as any).vars?.id === "hero-pin") t.kill();
      });
      return;
    }

    const st = ScrollTrigger.create({
      id: "hero-pin",            // NEW: id do czystego killowania
      trigger: el,
      start: "top top",
      end: "+=400%",
      scrub: 0.6,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      snap: { snapTo: [0, 1 / 3, 2 / 3, 1], duration: { min: 0.2, max: 0.6 }, ease: "power2.out" },
      onUpdate: (self) => setProgress(self.progress)
    });

    return () => st.kill();
  }, [isDesktop]); // NEW: reaguj na zmianę progu

  return (
    <>
      {/* === HERO (pinowany tylko na desktopie) === */}
      <section id="home" ref={sectionRef} className="relative w-full bg-transparent overflow-x-clip">
        <div className="relative min-h-[100svh]">
          {/* 3D */}
          <motion.div
            variants={CENTER_ENTER}
            className="
              absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
              max-[1379px]:top-[40%]
              z-10
              w-[min(92svw,560px)] aspect-square
            "
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 overflow-visible"
              style={{
                background: "linear-gradient(90deg, #FDE585 0%, #85FDBC 100%)",
                borderRadius: "9999px",
                filter: "blur(160px)",
                opacity: 0.6
              }}
            />
            <Canvas
              className="!bg-transparent relative z-10"
              style={{ background: "transparent", width: "100%", height: "100%" }}
              camera={{ position: [0, 0, 3.05], fov: 40 }}
              dpr={[1, 2]}
              gl={{
                antialias: true,
                alpha: true,
                premultipliedAlpha: true,
                powerPreference: "high-performance",
                toneMapping: THREE.ACESFilmicToneMapping,
                outputColorSpace: THREE.SRGBColorSpace
              }}
              onCreated={({ gl, scene }) => {
                gl.setClearColor(0x000000, 0);
                gl.toneMappingExposure = 0.95;
                scene.background = null;
              }}
            >
              {/* NEW: na mobile/tablet progress = 0, więc brak morphu przy scrollu */}
              <Environment preset="studio" background={false} />
              <ParticleMorph progress={isDesktop ? progress : 0} />
            </Canvas>
          </motion.div>

          {/* GRID kontentu */}
          <Container
            as={motion.div as any}
            variants={SECTION_ENTER}
            initial="initial"
            animate="animate"
            className="
              relative z-20 min-h-[100svh]
              grid gap-8
              max-[1379px]:grid-rows-[1fr_auto]
              min-[1380px]:grid-cols-[1fr_minmax(520px,auto)_1fr]
              min-[1380px]:items-stretch
            "
          >
            {/* LEWO */}
            <div
              className="
                max-[1379px]:order-2
                min-[1380px]:col-start-1
                flex flex-col justify-end
                pb-6 sm:pb-8
              "
            >
              <motion.div variants={LEFT_SYNC} className="w-full">
                <motion.h1
                  custom={isNarrow}
                  variants={leftItem}
                  className="font-orlean font-medium leading-tight m-0 tracking-[0.02em]
                  text-[clamp(16px,6vw,20px)]
                  max-[389px]:text-[clamp(14px,5.2vw,18px)]
                  md:text-[clamp(30px,6vw,40px)]
                  lg:text-[clamp(48px,6vw,55px)]
                  min-[1380px]:!text-[30px]
                  text-left"
                >
                  {t("title1")}
                </motion.h1>

                <motion.h2
                  custom={isNarrow}
                  variants={leftItem}
                  className="font-orlean font-normal leading-snug opacity-95 mt-1 tracking-[0.02em]
                  text-[clamp(16px,6vw,20px)]
                  max-[389px]:text-[clamp(13px,4.6vw,17px)]
                  md:text-[clamp(30px,6vw,40px)]
                  lg:text-[clamp(48px,6vw,55px)]
                  min-[1380px]:!text-[30px]
                  text-left"
                >
                  {t("title2")}
                </motion.h2>

                <motion.p
                  custom={isNarrow}
                  variants={leftItem}
                  className="font-orlean leading-relaxed text-[#ACACAC] tracking-[0.02em] mt-3
                  text-[clamp(13px,4vw,16px)]
                  md:text-[clamp(20px,3vw,24px)]
                  lg:text-[clamp(28px,4vw,32px)]
                  min-[1380px]:!text-[20px]
                  max-w-[84ch] min-[1380px]:max-w-[100ch]
                  text-balance break-words text-left"
                >
                  {t("lead1")}
                </motion.p>

                <motion.a
                  custom={isNarrow}
                  variants={leftItem}
                  href="#projects"
                  whileHover={{ scale: 0.97 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ willChange: "transform, opacity, filter" }}
                  className="group inline-flex items-center gap-1 rounded-full bg-[#85FDBC] text-black font-medium
                  mt-6 px-4 py-2 text-[13px]
                  md:px-6 md:py-4 md:text-[16px]
                  lg:px-7 lg:py-[18px] lg:text-[20px]
                  min-[1380px]:!px-5 min-[1380px]:!py-3 min-[1380px]:!text-[16px]
                  transition-colors hover:shadow-[0_8px_24px_rgba(133,253,188,0.35)]"
                >
                  <span className="inline-block will-change-transform leading-none transition-transform duration-200 group-hover:animate-vibrate-x">
                    {t("ctaCreate")}
                  </span>
                  <span aria-hidden className="inline-flex items-center -ml-0.5">
                    <IconArrowRight className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] lg:w-[22px] lg:h-[22px] text-[#000]" stroke={2} />
                  </span>
                </motion.a>
              </motion.div>
            </div>

            {/* ŚRODEK — pusty */}
            <div className="hidden min-[1380px]:block min-[1380px]:col-start-2" />

            {/* PRAWO */}
            <div
              className="hidden min-[1380px]:flex min-[1380px]:col-start-3
              flex-col justify-end items-end
              pb-6 sm:pb-8 text-right"
            >
              <motion.div variants={LEFT_SYNC} className="w-full max-w-[640px]">
                <motion.h2
                  custom={isNarrow}
                  variants={rightItem}
                  className="font-orlean font-normal leading-snug tracking-[0.02em] text-[clamp(20px,2.6vw,34px)]"
                >
                  {t("rightTitle")}
                </motion.h2>

                <motion.p
                  custom={isNarrow}
                  variants={rightItem}
                  className="font-orlean mt-4 text-[clamp(14px,1.8vw,18px)] leading-relaxed tracking-[0.02em] text-[#ACACAC] max-w-[100ch]"
                >
                  {t("rightLead")}
                </motion.p>

                <motion.a
                  custom={isNarrow}
                  variants={rightItem}
                  href="#services"
                  whileHover={{ scale: 0.98 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ willChange: "transform, opacity" }}
                  className="mt-8 inline-flex items-center gap-2 px-5 py-3 rounded-full
                  bg-white/10 text-white font-medium
                  transition-colors duration-1000 ease-[cubic-bezier(.22,1,.36,1)]
                  hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                >
                  {t("ctaExplore")}
                </motion.a>
              </motion.div>
            </div>
          </Container>
        </div>
      </section>

      {/* === SPACER POD HERO — minimalny na mobile/tablet, większy na desktop === */}
      <div
        aria-hidden
        className="
          pointer-events-none
          h-[clamp(4px,2vw,12px)]
          sm:h-[clamp(6px,1.8vw,14px)]
          lg:h-[clamp(64px,6vw,112px)]
        "
      />
    </>
  );
}
