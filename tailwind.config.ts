import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      colors: {
        onyx: "hsl(var(--onyx))",
        "onyx-glow": "hsl(var(--onyx-glow))",
        ignis: "hsl(var(--ignis))",
        "ignis-glow": "hsl(var(--ignis-glow))",
        hydra: "hsl(var(--hydra))",
        "hydra-glow": "hsl(var(--hydra-glow))",
        amber: "hsl(var(--amber))",
      },
    },
  },
  plugins: [],
};

export default config;
