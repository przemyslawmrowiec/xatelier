// src/app/[locale]/(intl)/layout.tsx
import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";

const LOCALES = ["fr", "en", "de", "pl"] as const;
type Locale = (typeof LOCALES)[number];

type Namespace =
  | "nav"
  | "hero"
  | "services"
  | "projects"
  | "smooth"
  | "footer"
  | "privacy";
type Messages = Record<Namespace, Record<string, unknown>>;

async function loadNs(locale: Locale, ns: Namespace) {
  // Jesteśmy 1 poziom głębiej niż wcześniej
  const mod = await import(`../../../messages/${locale}/${ns}.json`);
  return (mod as { default?: Record<string, unknown> }).default ?? {};
}

export default async function IntlLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  if (!LOCALES.includes(locale)) notFound();

  const namespaces: Namespace[] = [
    "nav",
    "hero",
    "services",
    "projects",
    "smooth",
    "footer",
    "privacy",
  ];
  const loaded = await Promise.all(namespaces.map((ns) => loadNs(locale, ns)));
  const messages = namespaces.reduce((acc, ns, i) => {
    acc[ns] = loaded[i] ?? {};
    return acc;
  }, {} as Partial<Messages>) as Messages;

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages as unknown as Record<string, unknown>}
      timeZone="Europe/Paris"
    >
      {children}
    </NextIntlClientProvider>
  );
}
