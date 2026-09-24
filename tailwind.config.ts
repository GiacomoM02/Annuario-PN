// tailwind.config.ts

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#003366", // blu istituzionale UniPi
          light: "#0055A4",
          dark: "#001F3F",
        },
        accent: "#4DA3FF", // azzurro più moderno
        background: "#FFFFFF",
        surface: "#F8FAFC",
      },
    },
  },
  plugins: [],
};

export default config;