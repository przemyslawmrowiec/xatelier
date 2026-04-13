import type { ReactNode, CSSProperties } from "react";

/** Render rich-translate chunków (bez parametrów) */
export type RichRender = (chunks: Record<string, never>) => ReactNode;

/** Bezpieczny typ funkcji tłumaczeń (koniec z any) */
export type TFunc = ((
  key: string,
  values?: Record<string, string | number>
) => string) & {
  rich?: (key: string, chunks: RichRender | ReactNode) => ReactNode;
};

/** Pomoc do castów: CSS filter, clipPath i style z CSS-var */
export type FilterCSS = CSSProperties["filter"];
export type ClipPathCSS = CSSProperties["clipPath"];

/** Style z własną zmienną --panel-clip */
export type StyleWithPanelClip = CSSProperties & { ["--panel-clip"]?: string };
