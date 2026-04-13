// src/app/components/SectionGradients.tsx
"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Globalne, fixed overlaye sterowane ScrollTriggerami:
 * - Dół: przy końcu sekcji (w tym HERO3D – pełnoekranowa „kurtyna”).
 * - Góra: przy cofaniu się do poprzedniej sekcji.
 */
export default function SectionGradients() {
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const fadeBottom = document.getElementById("fade-bottom");
      const fadeTop = document.getElementById("fade-top");
      if (!fadeBottom || !fadeTop) return;

      // Reset
      gsap.set([fadeBottom, fadeTop], { opacity: 0 });
      gsap.set(fadeBottom, { height: "45svh" });

      const sections = Array.from(document.querySelectorAll("section[id]")) as HTMLElement[];
      if (!sections.length) return;

      /** ======================
       *  SPECJALNY CASE: HERO3D
       * ====================== */
      const hero = document.getElementById("hero3d") as HTMLElement | null;
      if (hero) {
        const heroIndex = sections.findIndex((s) => s === hero);
        const heroNext = sections[heroIndex + 1];

        // Kurtyna z dołu: od końcówki HERO do jego wyjazdu
        gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: hero,
            // zaczynamy „zaciągać” kurtynę, gdy jesteśmy daleko w sekcji
            start: "center 40%",
            // do samego końca pina HERO (bottom top)
            end: "bottom top",
            scrub: true,
            // markers: true,
            onEnter: () => {
              // upewnij się, że warstwa jest nad wszystkim i ma jednolite tło
              fadeBottom.classList.add("is-covering");
            },
            onLeave: () => {
              // po wyjściu z HERO kurtyna nadal zasłania (aż do wygaszenia na next)
              gsap.set(fadeBottom, { opacity: 1, height: "100svh" });
            },
            onEnterBack: () => {
              // wracając w górę do HERO — startujemy z pełną kurtyną
              fadeBottom.classList.add("is-covering");
              gsap.set(fadeBottom, { opacity: 1, height: "100svh" });
            },
            onLeaveBack: () => {
              // całkowity powrót ponad HERO — schowaj kurtynę
              fadeBottom.classList.remove("is-covering");
              gsap.set(fadeBottom, { opacity: 0, height: "45svh" });
            },
          },
        })
          // rośnij do pełnego ekranu i pokaż (solid)
          .to(
            fadeBottom,
            {
              opacity: 1,
              height: "100svh",
            },
            0
          );

        // Wygaszanie kurtyny przy wejściu następnej sekcji
        if (heroNext) {
          gsap.to(fadeBottom, {
            opacity: 0,
            height: "45svh",
            ease: "none",
            scrollTrigger: {
              trigger: heroNext,
              start: "top 95%",
              end: "top 70%",
              scrub: true,
              // markers: true,
              onLeaveBack: () => {
                // gdy wracamy do HERO — przygotuj solid cover ponownie
                fadeBottom.classList.add("is-covering");
                gsap.set(fadeBottom, { opacity: 1, height: "100svh" });
              },
              onEnter: () => {
                // po wejściu w kolejną sekcję — przestajemy „solidować”
                fadeBottom.classList.remove("is-covering");
              },
            },
          });
        }
      }

      /** =========================
       *  OGÓLNE FADY dla sekcji
       * ========================= */
      sections.forEach((sec, idx) => {
        if (sec.id === "hero3d") return; // HERO ma własny case

        // 1) Dół — miękki wjazd (gradient) pod koniec sekcji
        gsap.fromTo(
          fadeBottom,
          { opacity: 0 },
          {
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: sec,
              start: "bottom 90%",
              end: "bottom 50%",
              scrub: true,
              // markers: true,
              onEnter: () => fadeBottom.classList.remove("is-covering"),
              onEnterBack: () => fadeBottom.classList.remove("is-covering"),
            },
          }
        );

        // 1b) Wygaszanie przy starcie następnej
        const nextSec = sections[idx + 1];
        if (nextSec) {
          gsap.fromTo(
            fadeBottom,
            { opacity: 1 },
            {
              opacity: 0,
              ease: "none",
              scrollTrigger: {
                trigger: nextSec,
                start: "top 80%",
                end: "top 60%",
                scrub: true,
              },
            }
          );
        }

        // 2) Góra — przy cofaniu
        gsap.fromTo(
          fadeTop,
          { opacity: 0 },
          {
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: sec,
              start: "top 10%",
              end: "top 50%",
              scrub: true,
              // markers: true,
            },
          }
        );

        // 2b) Zjazd „góry”, gdy wjeżdżamy głębiej w sekcję
        gsap.fromTo(
          fadeTop,
          { opacity: 1 },
          {
            opacity: 0,
            ease: "none",
            scrollTrigger: {
              trigger: sec,
              start: "top 50%",
              end: "top 20%",
              scrub: true,
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* Dolna „kurtyna”: w trybie .is-covering jest solidowa (bg-black), by NIC nie prześwitywało */}
      <div
        id="fade-bottom"
        aria-hidden
        className="
          pointer-events-none fixed inset-x-0 bottom-0 z-[99]
          h-[45svh] opacity-0
          bg-gradient-to-t from-black via-black/70 to-transparent
          will-change-[opacity,height]
        "
      />
      {/* Górny fade */}
      <div
        id="fade-top"
        aria-hidden
        className="
          pointer-events-none fixed inset-x-0 top-0 z-[98]
          h-[45svh] opacity-0
          bg-gradient-to-b from-black to-transparent
          will-change-opacity
        "
      />
      <style jsx global>{`
        /* Gdy kurtyna ma całkowicie zasłaniać HERO3D, używamy solidowego tła */
        #fade-bottom.is-covering {
          background: #000 !important;
        }
      `}</style>
    </>
  );
}
