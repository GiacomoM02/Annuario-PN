import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// ENUM: tipologia di scheda nella Hall of Fame
// ---------------------------------------------------------------------------
export const entryTypeEnum = pgEnum("entry_type", ["SINGLE", "GROUP"]);

// ---------------------------------------------------------------------------
// TABELLA: hall_of_fame_entries
// IMPORTANTE: nessuna colonna email. L'indirizzo istituzionale usato per la
// verifica OTP non viene mai persistito qui (vedi lib/otp.ts + lib/token.ts).
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

// ---------------------------------------------------------------------------
// TABELLA: archived_editions
// Edizioni passate dell'annuario: PDF scaricabile + copertina per la
// consultazione "digitale" nella pagina Archivio.
// ---------------------------------------------------------------------------
export const archivedEditions = pgTable("archived_editions", {
  id: uuid("id").defaultRandom().primaryKey(),
  year: integer("year").notNull(),
  title: text("title").notNull(),
  pdfUrl: text("pdf_url").notNull(),
  coverImageUrl: text("cover_image_url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type ArchivedEdition = typeof archivedEditions.$inferSelect;
export type NewArchivedEdition = typeof archivedEditions.$inferInsert;
