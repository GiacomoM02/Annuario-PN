import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// ENUM: tipologia di scheda nella Hall of Fame
// ---------------------------------------------------------------------------
export const entryTypeEnum = pgEnum("entry_type", ["SINGLE", "GROUP"]);

// ---------------------------------------------------------------------------
// TABELLA: hall_of_fame_entries
// IMPORTANTE: nessuna colonna email. L'indirizzo istituzionale è usato solo
// per un controllo di formato lato server, mai persistito.
//
// Nota: le edizioni passate dell'Archivio NON sono più in questa tabella
// (vedi src/config/editions.ts): sono config statica, non dati dinamici,
// quindi non hanno bisogno del database.
// ---------------------------------------------------------------------------
export const hallOfFameEntries = pgTable("hall_of_fame_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: entryTypeEnum("type").notNull(),
  // Foto singola: "Mario Rossi"
  // Foto di gruppo: "Mario Rossi, Giulia Bianchi, Luca Verdi"
  names: text("names").notNull(),
  caption: text("caption").notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type HallOfFameEntry = typeof hallOfFameEntries.$inferSelect;
export type NewHallOfFameEntry = typeof hallOfFameEntries.$inferInsert;
