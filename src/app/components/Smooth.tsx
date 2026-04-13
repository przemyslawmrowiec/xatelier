// src/app/components/Smooth.tsx
"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Smooth() {
  useEffect(() => {
    // Jeśli Twoje typy Lenis nie znają smoothWheel, rzutujemy options na any — bezpiecznie.
    const options: any = {
      duration: 1.0,
      // odkomentuj jeśli chcesz (i jeśli Twoja wersja lenis to wspiera):
      // smoothWheel: true,
      // smoothTouch: true,
    };

    const lenis = new Lenis(options);
    (window as any).lenis = lenis;

    const onLenisScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onLenisScroll);

    const ticker = (t: number) => {
      // gsap.ticker podaje sekundy; Lenis oczekuje ms
      lenis.raf(t * 1000);
    };
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(ticker);
      lenis.off("scroll", onLenisScroll);
      lenis.destroy();
      (window as any).lenis = null;
    };
  }, []);

  return null;
}
