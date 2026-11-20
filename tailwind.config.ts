import type { Config } from "tailwindcss";

// Colours point at the CSS tokens in src/app/globals.css (single source of truth).
const v = (name: string) => `var(--${name})`;

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        marble: { DEFAULT: v("marble"), 2: v("marble-2"), 3: v("marble-3") },
        ink: { DEFAULT: v("ink"), soft: v("ink-soft") },
        night: { DEFAULT: v("night"), 2: v("night-2") },
        mist: v("mist"),
        gold: { DEFAULT: v("gold"), bright: v("gold-bright"), pale: v("gold-pale") },
        forest: { DEFAULT: v("forest"), 2: v("forest-2"), ink: v("forest-ink"), soft: v("forest-soft") },
        peacock: v("peacock"),
        lotus: v("lotus"),
        line: v("line"),
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        sanskrit: ["var(--font-sanskrit)", "serif"],
      },
      borderRadius: { DEFAULT: "var(--radius)", sm: "var(--radius-sm)" },
      transitionTimingFunction: { out: "var(--ease-out)" },
    },
  },
  plugins: [],
} satisfies Config;
