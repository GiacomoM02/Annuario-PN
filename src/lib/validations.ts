import { z } from "zod";

// Solo controllo del formato/dominio: nessuna prova che l'utente possieda
// davvero quell'indirizzo (nessun OTP inviato).
export const emailDomainSchema = z.object({
  email: z
    .string()
    .email("Inserisci un indirizzo email valido.")
    .refine(
      (v) => v.endsWith("@unipi.it") || v.endsWith("@studenti.unipi.it"),
      "Devi usare un'email @unipi.it o @studenti.unipi.it."
    ),
});

// Tupla letterale esplicita (non derivata con .map) così z.enum mantiene i
// tipi letterali invece di allargarli a "string" — deve restare allineata
// ai value di src/lib/faculties.ts e all'enum in drizzle/schema.ts.
const facultyValues = [
  "MEDICINA",
  "INGEGNERIA",
  "UMANISTICHE",
  "SCIENZE",
  "PERSONALE",
] as const;

export const uploadEntrySchema = z
  .object({
    type: z.enum(["SINGLE", "GROUP"]),
    // Obbligatoria solo per le foto singole (vedi .refine sotto);
    // per le foto di gruppo resta vuota/assente.
    faculty: z.enum(facultyValues).optional(),
    names: z
      .string()
      .min(3, "Inserisci almeno un nome e cognome.")
      .max(500, "Elenco nomi troppo lungo."),
    caption: z
      .string()
      .min(1, "Aggiungi una didascalia.")
      .max(280, "Didascalia troppo lunga (max 280 caratteri)."),
  })
  .refine((data) => data.type !== "SINGLE" || !!data.faculty, {
    message: "Seleziona la tua facoltà.",
    path: ["faculty"],
  });
