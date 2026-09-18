import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Carica esplicitamente .env.local (drizzle-kit non lo fa da solo),
// così che POSTGRES_URL sia disponibile quando lanci "npm run db:push".
config({ path: ".env.local" });

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
});
