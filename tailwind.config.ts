import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Ink-and-parchment palette: a university-press yearbook, not a SaaS dashboard.
        ink: {
          950: "#101820", // near-black navy ink
          900: "#16212E",
          800: "#203041",
          700: "#2C455C",
          600: "#3C5A73",
          500: "#557089",
        },
        parchment: {
          50: "#FBF8F1",
          100: "#F4EEDF",
          200: "#EADFC7",
        },
        brass: {
          400: "#C9A15A",
          500: "#B08838",
          600: "#8F6C28",
        },
        garnet: {
          500: "#7C2C3B",
          600: "#671F2C",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-source-sans)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "grain": "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
      },
      maxWidth: {
        prose: "68ch",
      },
    },
  },
  plugins: [],
};

export default config;
