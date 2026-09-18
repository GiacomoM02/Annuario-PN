import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
import * as schema from "../../drizzle/schema";

// Connessione singola riutilizzata tra le Server Actions (pattern consigliato
// da Vercel per Postgres serverless: @vercel/postgres gestisce già il pooling).
export const db = drizzle(sql, { schema });

export { schema };
