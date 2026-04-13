import localFont from "next/font/local";

export const aventa = localFont({
  src: [{ path: "../../public/fonts/aventa/Aventa-Regular.woff2", weight: "400", style: "normal" }],
  variable: "--font-aventa",
  display: "swap",
  preload: true,
});

// Orlean – 2 wagi
export const orlean = localFont({
  src: [
    { path: "../../public/fonts/orlean/orlean-regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/orlean/orlean-medium.woff2",  weight: "500", style: "normal" }, 
    { path: "../../public/fonts/orlean/orlean-bold.woff2",    weight: "700", style: "normal" },
  ],
  variable: "--font-orlean",
  display: "swap",
  preload: true,
});