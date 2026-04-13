// src/i18n/request.ts
import { getRequestConfig } from "next-intl/server";

const ALL = ["fr", "en", "de", "pl"] as const;
type SupportedLocale = typeof ALL[number];

export default getRequestConfig(async ({ locale }) => {
  const raw = (locale ?? "fr") as string;
  const safe: SupportedLocale = (ALL as readonly string[]).includes(raw) ? (raw as SupportedLocale) : "fr";

  const nav = (await import(`../messages/${safe}/nav.json`)).default;

  return {
    locale: safe,
    messages: { nav }
  };
});
