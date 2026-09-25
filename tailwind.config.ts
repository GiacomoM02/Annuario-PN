import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Identità Unipi: sfondo prevalentemente bianco, accenti e dettagli
        // in blu/azzurro istituzionale (Cherubino). Nessun rosso: era un
        // errore della versione precedente, corretto qui.
        unipi: {
          50: "#EAF3FA",  // tinta quasi bianca, per sfondi di card/badge
          100: "#D2E7F5",
          400: "#4A9FD8", // azzurro chiaro, accenti secondari/hover
          500: "#0066B2", // azzurro Unipi primario (bottoni, link, badge)
          600: "#00548F",
          700: "#002B49", // blu istituzionale scuro (header, footer, testo enfatizzato)
          900: "#001B30",
        },
        // Neutro quasi-nero per il testo, separato dal blu del brand.
        ink: {
          950: "#0A0E14",
          900: "#12161F",
          800: "#1C222E",
          700: "#333B4A",
          600: "#4B5566",
          500: "#66707F",
        },
        // Sfondo bianco-dominante con leggerissima tinta fredda per le card.
        paper: {
          50: "#FFFFFF",
          100: "#F5F8FA",
          200: "#E3EAEF",
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
