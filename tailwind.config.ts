/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        aventa: ["var(--font-aventa)", "system-ui", "sans-serif"],
        orlean: ["var(--font-orlean)", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Arial", "Noto Sans", "Helvetica Neue", "sans-serif"],
      },
      borderRadius: {
        panel: "28px",
      },
      keyframes: {
        "vibrate-x": {
          "0%,100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-2px)" },
          "40%": { transform: "translateX(2px)" },
          "60%": { transform: "translateX(-2px)" },
          "80%": { transform: "translateX(2px)" },
        },
      },
      animation: {
        "vibrate-x": "vibrate-x 0.45s ease-in-out both",
      },
    },
  },
  plugins: [],
};
