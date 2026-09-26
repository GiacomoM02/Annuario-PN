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
        // Palette della home (colonna sinistra, navbar e barra sulla foto).
        // I valori veri stanno in src/app/globals.css (:root, --hero-*):
        // cambiarli lì aggiorna tutta la home in un colpo solo.
        hero: {
          fg: "rgb(var(--hero-fg) / <alpha-value>)",
          accent: {
            DEFAULT: "rgb(var(--hero-accent) / <alpha-value>)",
            deep: "rgb(var(--hero-accent-deep) / <alpha-value>)",
          },
          ink: "rgb(var(--hero-ink) / <alpha-value>)",
          cream: "rgb(var(--hero-cream) / <alpha-value>)",
          band: {
            DEFAULT: "rgb(var(--hero-band) / <alpha-value>)",
            fg: "rgb(var(--hero-band-fg) / <alpha-value>)",
          },
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
