"use client";

import { useLocale } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import intlConfig from "next-intl.config.js";

function stripLeadingLocale(pathname: string, locales: string[]) {
  // np. /pl/services -> /services
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length > 0 && locales.includes(parts[0])) {
    parts.shift();
  }
  return "/" + parts.join("/");
}

export default function LanguageSwitch() {
  const locale = useLocale();
  const pathname = usePathname();
  const search = useSearchParams();
  const locales = (intlConfig.locales as readonly string[]).map(String);

  const rest = stripLeadingLocale(pathname || "/", locales);
  const qs = search?.toString();
  const suffix = qs ? `?${qs}` : "";

  return (
    <div className="inline-flex items-center gap-2">
      {locales.map((l) => (
        <Link
          key={l}
          href={`/${l}${rest}${suffix}`}
          prefetch={false}
          className={`px-2 py-1 rounded text-sm ${
            l === locale ? "bg-white/15 font-semibold" : "bg-white/5 hover:bg-white/10"
          }`}
          aria-current={l === locale ? "true" : undefined}
        >
          {l.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
