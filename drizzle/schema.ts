import { pgTable, uuid, text, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// ENUM: tipologia scheda, sezione, facoltà (solo foto singole) e stato
// di moderazione.
// ---------------------------------------------------------------------------
export const entryTypeEnum = pgEnum("entry_type", ["SINGLE", "GROUP"]);
export const entrySectionEnum = pgEnum("entry_section", [
  "HALL_OF_FAME", // bacheca dei laureati: solo foto singole
  "ANNUARIO_STORICO", // come la Hall of Fame, per chi non ha mai mandato la foto
  "ARCHIVIO", // invii per l'edizione annuale: finiscono nel PDF dell'anno
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
// Condivisa dalle tre sezioni (colonna "section"):
// - HALL_OF_FAME e ANNUARIO_STORICO: gallerie pubbliche di foto singole
//   (foto, facoltà, nome), senza didascalia.
// - ARCHIVIO: invii per l'edizione annuale (edition_year), singoli o di
//   gruppo con didascalia; non compaiono sul sito, finiscono nel PDF.
// Ogni scheda nasce con status "PENDING" e diventa utilizzabile solo dopo
// essere stata approvata (aggiornando la riga a "APPROVED").
// IMPORTANTE: nessuna colonna email. Per l'Archivio si salva solo
// un'impronta non reversibile dell'indirizzo (submitter_hash), che serve a
// far rispettare il limite di invii per persona.
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
  // Solo per l'Archivio: frase della foto singola o didascalia del gruppo.
  caption: text("caption"),
  imageUrl: text("image_url").notNull(),
  // Solo per l'Archivio: anno dell'edizione a cui è destinato l'invio.
  editionYear: integer("edition_year"),
  // Solo per l'Archivio: HMAC dell'email di chi ha inviato la foto.
  submitterHash: text("submitter_hash"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type HallOfFameEntry = typeof hallOfFameEntries.$inferSelect;
export type NewHallOfFameEntry = typeof hallOfFameEntries.$inferInsert;
