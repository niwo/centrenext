import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: "rgb(var(--color-sand) / <alpha-value>)",
        clay: "rgb(var(--color-clay) / <alpha-value>)",
        forest: "rgb(var(--color-forest) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        mist: "rgb(var(--color-mist) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-manrope)"],
        display: ["var(--font-cormorant)"],
        script: ["var(--font-dancing-script)"],
      },
      boxShadow: {
        soft: "0 18px 40px rgba(20, 33, 30, 0.10)",
      },
      backgroundImage: {
        "hero-glow": "radial-gradient(circle at top left, rgba(198, 107, 78, 0.28), transparent 40%), radial-gradient(circle at bottom right, rgba(23, 53, 47, 0.12), transparent 35%)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;