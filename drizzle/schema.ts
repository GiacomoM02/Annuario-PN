import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// ENUM: tipologia scheda, sezione, facoltà (solo foto singole) e stato
// di moderazione.
// ---------------------------------------------------------------------------
export const entryTypeEnum = pgEnum("entry_type", ["SINGLE", "GROUP"]);
export const entrySectionEnum = pgEnum("entry_section", [
  "HALL_OF_FAME",
  "ANNUARIO_STORICO",
]);
export const facultyEnum = pgEnum("faculty", [
  "MEDICINA", // Medicina, Farmacia, Infermieristica, Psicologia
  "INGEGNERIA",
  "UMANISTICHE", // Discipline umanistiche
  "SCIENZE", // Scienze matematiche, informatiche, fisiche e della natura
  "PERSONALE", // Personale universitario
]);
export const entryStatusEnum = pgEnum("entry_status", [
  "PENDING",
  "APPROVED",
]);

// ---------------------------------------------------------------------------
// TABELLA: hall_of_fame_entries
// Condivisa tra Hall of Fame e Annuario Storico (colonna "section"): stessa
// struttura, stesse regole di privacy, gallerie filtrate separatamente.
// Ogni scheda nasce con status "PENDING": diventa pubblica sulle pagine solo
// dopo essere stata approvata (aggiornando la riga a "APPROVED").
// IMPORTANTE: nessuna colonna email. L'indirizzo istituzionale è usato solo
// per un controllo di formato lato server, mai persistito.
// ---------------------------------------------------------------------------
export const hallOfFameEntries = pgTable("hall_of_fame_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: entryTypeEnum("type").notNull(),
  section: entrySectionEnum("section").notNull().default("HALL_OF_FAME"),
  status: entryStatusEnum("status").notNull().default("PENDING"),
  // Solo per foto singole: null per le foto di gruppo.
  faculty: facultyEnum("faculty"),
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
