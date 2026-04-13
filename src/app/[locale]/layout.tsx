// src/app/[locale]/layout.tsx
export const metadata = { title: "xatelier" } as const;

const LOCALES = ["fr", "en", "de", "pl"] as const;

export const dynamicParams = false;
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default function LocaleRootLayout({ children }: { children: React.ReactNode }) {
  // Uwaga: ZERO importów z `next-intl/*` w tym pliku
  return <>{children}</>;
}
