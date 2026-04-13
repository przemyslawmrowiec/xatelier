// src/app/components/socials.tsx
"use client";

import { motion } from "framer-motion";
import type React from "react";
import {
  IconBrandTiktok,
  IconBrandInstagram,
  IconBrandX,
  IconBrandFacebook,
  IconBrandLinkedin,
} from "@tabler/icons-react";

// Typ pojedynczej pozycji
export type Social = {
  href: string;
  label: string;
  Icon: typeof IconBrandX; // typ z Tabler
  newTab?: boolean;
};

// Centralne źródło prawdy — możesz to łatwo edytować w jednym miejscu
export const SOCIALS: Social[] = [
  { href: "https://tiktok.com", label: "TikTok", Icon: IconBrandTiktok, newTab: true },
  { href: "https://instagram.com", label: "Instagram", Icon: IconBrandInstagram, newTab: true },
  { href: "https://x.com", label: "X", Icon: IconBrandX, newTab: true },
  { href: "https://facebook.com", label: "Facebook", Icon: IconBrandFacebook, newTab: true },
  { href: "https://linkedin.com", label: "LinkedIn", Icon: IconBrandLinkedin, newTab: true },
];

// Pojedyncza ikonka (z animacją wejścia, jeśli podasz delay)
export function SocialLink({
  item,
  size = 20,
  delay = 0,
  className = "",
}: {
  item: Social;
  size?: number;
  delay?: number; // 0 => bez opóźnienia
  className?: string;
}) {
  const { href, label, Icon, newTab } = item;
  const target = newTab ? "_blank" : undefined;
  const rel = newTab ? "noopener noreferrer" : undefined;

  return (
    <motion.a
      href={href}
      aria-label={label}
      target={target}
      rel={rel}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-white/90 hover:text-white focus:outline-none transition ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1], delay } }}
      exit={{ opacity: 0, y: 8, transition: { duration: 0.16, ease: [0.22, 1, 0.36, 1] } }}
    >
      <Icon className="h-5 w-5" style={{ width: size, height: size }} />
    </motion.a>
  );
}

// Pasek ikon społecznościowych
export function SocialBar({
  items = SOCIALS,
  iconSize = 20,
  gap = 12,
  stagger = 0.025,
  startDelay = 0.08,
  className = "",
}: {
  items?: Social[];
  iconSize?: number;
  gap?: number;       // px
  stagger?: number;   // s
  startDelay?: number;// s
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap,
      }}
    >
      {items.map((item, i) => (
        <SocialLink key={item.label} item={item} size={iconSize} delay={startDelay + i * stagger} />
      ))}
    </div>
  );
}
