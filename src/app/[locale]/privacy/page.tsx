// src/app/[locale]/privacy/page.tsx
type Locale = 'fr' | 'en' | 'de' | 'pl';

type PrivacyMessages = {
  title: string;
  intro: string;
  controller: { h: string; p1: string; p2: string };
  scope: { h: string; p1: string };
  data: { h: string; l1: string; l2: string; l3: string; l4: string; l5: string };
  sources: { h: string; p1: string };
  purposes: { h: string; l1: string; l2: string; l3: string; l4: string; l5: string };
  legal: { h: string; l1: string; l2: string; l3: string; l4: string };
  cookies: { h: string; p1: string };
  processors: { h: string; p1: string; l1: string; l2: string; l3: string; l4: string; p2: string };
  transfers: { h: string; p1: string };
  retention: { h: string; l1: string; l2: string; l3: string; l4: string };
  security: { h: string; p1: string };
  minors: { h: string; p1: string };
  rights: { h: string; l1: string; l2: string; l3: string; l4: string; l5: string; l6: string };
  exercise: { h: string; p1: string };
  changes: { h: string; p1: string };
  updated: string;
};

type Props = { params: { locale: Locale } };

async function loadPrivacy(locale: Locale) {
  // Uwaga: ścieżka RELATYWNA względem tego pliku
  const mod = await import(`../../../messages/${locale}/privacy.json`);
  return (mod as { default: PrivacyMessages }).default;
}

export default async function PrivacyPage({ params }: Props) {
  const t = await loadPrivacy(params.locale);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <section
        className="pb-20 sm:pb-24"
        style={{ paddingTop: "calc(var(--header-h, 96px) + clamp(96px, 14vw, 200px))" }}
      >
        <div className="mx-auto px-4 sm:px-6 max-w-4xl">
          <header className="mb-10 sm:mb-12">
            <h1 className="font-orlean text-[clamp(32px,6.5vw,48px)] leading-tight tracking-[0.01em]">
              {t.title}
            </h1>
            <p className="font-aventa text-white/75 mt-4 text-[clamp(15px,2.4vw,17px)] leading-relaxed">
              {t.intro}
            </p>
          </header>

          <div className="space-y-10 sm:space-y-12">
            <section>
              <h2 className="font-orlean text-[clamp(20px,3.4vw,24px)] mb-3 tracking-[0.01em]">
                {t.controller.h}
              </h2>
              <p className="font-aventa text-[15px] sm:text-[16px] text-white/85 leading-relaxed">{t.controller.p1}</p>
              <p className="font-aventa text-[15px] sm:text-[16px] text-white/85 leading-relaxed mt-3">{t.controller.p2}</p>
            </section>

            <section>
              <h2 className="font-orlean text-[clamp(20px,3.4vw,24px)] mb-3">{t.scope.h}</h2>
              <p className="font-aventa text-[15px] sm:text-[16px] text-white/85 leading-relaxed">{t.scope.p1}</p>
            </section>

            <section>
              <h2 className="font-orlean text-[clamp(20px,3.4vw,24px)] mb-3">{t.data.h}</h2>
              <ul className="font-aventa text-[15px] sm:text-[16px] text-white/85 leading-relaxed list-disc pl-5 space-y-2 marker:text-white/40">
                <li>{t.data.l1}</li><li>{t.data.l2}</li><li>{t.data.l3}</li><li>{t.data.l4}</li><li>{t.data.l5}</li>
              </ul>
            </section>

            <section>
              <h2 className="font-orlean text-[clamp(20px,3.4vw,24px)] mb-3">{t.sources.h}</h2>
              <p className="font-aventa text-[15px] sm:text-[16px] text-white/85 leading-relaxed">{t.sources.p1}</p>
            </section>

            <section>
              <h2 className="font-orlean text-[clamp(20px,3.4vw,24px)] mb-3">{t.purposes.h}</h2>
              <ul className="font-aventa text-[15px] sm:text-[16px] text-white/85 leading-relaxed list-disc pl-5 space-y-2 marker:text-white/40">
                <li>{t.purposes.l1}</li><li>{t.purposes.l2}</li><li>{t.purposes.l3}</li><li>{t.purposes.l4}</li><li>{t.purposes.l5}</li>
              </ul>
            </section>

            <section>
              <h2 className="font-orlean text-[clamp(20px,3.4vw,24px)] mb-3">{t.legal.h}</h2>
              <ul className="font-aventa text-[15px] sm:text-[16px] text-white/85 leading-relaxed list-disc pl-5 space-y-2 marker:text-white/40">
                <li>{t.legal.l1}</li><li>{t.legal.l2}</li><li>{t.legal.l3}</li><li>{t.legal.l4}</li>
              </ul>
            </section>

            <section>
              <h2 className="font-orlean text-[clamp(20px,3.4vw,24px)] mb-3">{t.cookies.h}</h2>
              <p className="font-aventa text-[15px] sm:text-[16px] text-white/85 leading-relaxed">{t.cookies.p1}</p>
            </section>

            <section>
              <h2 className="font-orlean text-[clamp(20px,3.4vw,24px)] mb-3">{t.processors.h}</h2>
              <p className="font-aventa text-[15px] sm:text-[16px] text-white/85 leading-relaxed">{t.processors.p1}</p>
              <ul className="font-aventa text-[15px] sm:text-[16px] text-white/85 leading-relaxed list-disc pl-5 space-y-2 mt-3 marker:text-white/40">
                <li>{t.processors.l1}</li><li>{t.processors.l2}</li><li>{t.processors.l3}</li><li>{t.processors.l4}</li>
              </ul>
              <p className="font-aventa text-[15px] sm:text-[16px] text-white/85 leading-relaxed mt-3">{t.processors.p2}</p>
            </section>

            <section>
              <h2 className="font-orlean text-[clamp(20px,3.4vw,24px)] mb-3">{t.transfers.h}</h2>
              <p className="font-aventa text-[15px] sm:text-[16px] text-white/85 leading-relaxed">{t.transfers.p1}</p>
            </section>

            <section>
              <h2 className="font-orlean text-[clamp(20px,3.4vw,24px)] mb-3">{t.retention.h}</h2>
              <ul className="font-aventa text-[15px] sm:text-[16px] text-white/85 leading-relaxed list-disc pl-5 space-y-2 marker:text-white/40">
                <li>{t.retention.l1}</li><li>{t.retention.l2}</li><li>{t.retention.l3}</li><li>{t.retention.l4}</li>
              </ul>
            </section>

            <section>
              <h2 className="font-orlean text-[clamp(20px,3.4vw,24px)] mb-3">{t.security.h}</h2>
              <p className="font-aventa text-[15px] sm:text-[16px] text-white/85 leading-relaxed">{t.security.p1}</p>
            </section>

            <section>
              <h2 className="font-orlean text-[clamp(20px,3.4vw,24px)] mb-3">{t.minors.h}</h2>
              <p className="font-aventa text-[15px] sm:text-[16px] text-white/85 leading-relaxed">{t.minors.p1}</p>
            </section>

            <section>
              <h2 className="font-orlean text-[clamp(20px,3.4vw,24px)] mb-3">{t.rights.h}</h2>
              <ul className="font-aventa text-[15px] sm:text-[16px] text-white/85 leading-relaxed list-disc pl-5 space-y-2 marker:text-white/40">
                <li>{t.rights.l1}</li><li>{t.rights.l2}</li><li>{t.rights.l3}</li><li>{t.rights.l4}</li><li>{t.rights.l5}</li><li>{t.rights.l6}</li>
              </ul>
            </section>

            <section>
              <h2 className="font-orlean text-[clamp(20px,3.4vw,24px)] mb-3">{t.exercise.h}</h2>
              <p className="font-aventa text-[15px] sm:text-[16px] text-white/85 leading-relaxed">{t.exercise.p1}</p>
            </section>

            <section>
              <h2 className="font-orlean text-[clamp(20px,3.4vw,24px)] mb-3">{t.changes.h}</h2>
              <p className="font-aventa text-[15px] sm:text-[16px] text-white/85 leading-relaxed">{t.changes.p1}</p>
              <p className="font-aventa text-[13px] text-white/55 mt-4">{t.updated}</p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
