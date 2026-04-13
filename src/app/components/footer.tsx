"use client";

import Image from "next/image";
import Link from "next/link";
import Container from "./Container";
import { useTranslations, useLocale } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();

  return (
    <footer className="w-full bg-[#0a0a0a] text-white">
      <Container className="py-8 md:py-10">
        <div className="grid items-center gap-5 sm:gap-6 md:grid-cols-3">
          {/* LEWO — prawa autorskie */}
          <div className="order-2 md:order-1 flex justify-center md:justify-start">
            <p className="font-aventa text-[14px] md:text-[15px] leading-none text-white/70">
              {t("rights")}
            </p>
          </div>

          {/* ŚRODEK — logo */}
          <div className="order-1 md:order-2 flex justify-center">
            <Image
              src="/logo.svg"
              alt="xatelier"
              width={148}
              height={36}
              className="h-9 w-auto sm:h-10"
              priority
            />
          </div>

          {/* PRAWO — privacy (zależne od języka) */}
          <div className="order-3 md:order-3 flex justify-center md:justify-end">
            <Link
              href={`/${locale}/privacy`}
              className="font-aventa text-[14px] md:text-[15px] text-white/80 no-underline transition-colors duration-400 ease-[cubic-bezier(.22,1,.36,1)] hover:text-[#a4fac5] focus-visible:text-[#a4fac5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a4fac5]/40 rounded-md"
            >
              {t("privacy")}
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
