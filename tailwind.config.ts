import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F5EF",
        ink: "#23262B",
        muted: "#716B5E",
        line: "#E1DCCE",
        brand: {
          DEFAULT: "#2F4D74",
          dark: "#1F3552",
          light: "#E8EDF3",
        },
        status: {
          bekliyor: "#C4453A",
          bekliyorBg: "#FBEAE8",
          derste: "#D98A3D",
          derteBg: "#FBF0E2",
          tekrar: "#7A5FB0",
          tekrarBg: "#F0ECF9",
          cozdu: "#3C6E9E",
          cozduBg: "#E7EFF6",
          tamam: "#4E9668",
          tamamBg: "#E9F4EC",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};
export default config;
