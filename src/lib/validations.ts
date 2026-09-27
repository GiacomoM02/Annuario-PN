import { z } from "zod";

// Solo controllo del formato/dominio: nessuna prova che l'utente possieda
// davvero quell'indirizzo (nessun OTP inviato).
export const emailDomainSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
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

const facultySchema = z.enum(facultyValues, {
  errorMap: () => ({ message: "Seleziona la tua facoltà." }),
});

// Lunghezza massima della frase di una foto singola: nel PDF sta in una
// piccola etichetta sotto il nome, quindi deve restare breve.
export const SINGLE_CAPTION_MAX = 90;

// Hall of Fame e Annuario Storico: solo foto singole, con facoltà e nome.
export const gallerySingleSchema = z.object({
  faculty: facultySchema,
  names: z
    .string()
    .trim()
    .min(3, "Inserisci nome e cognome.")
    .max(80, "Nome troppo lungo."),
});

// Archivio (edizione annuale): foto singola (facoltà + frase breve) oppure
// di gruppo (elenco nomi + didascalia).
export const editionEntrySchema = z
  .object({
    type: z.enum(["SINGLE", "GROUP"]),
    faculty: facultySchema.optional(),
    names: z
      .string()
      .trim()
      .min(3, "Inserisci almeno un nome e cognome.")
      .max(500, "Elenco nomi troppo lungo."),
    caption: z
      .string()
      .trim()
      .min(1, "Aggiungi una frase o una didascalia.")
      .max(280, "Didascalia troppo lunga (max 280 caratteri)."),
  })
  .refine((data) => data.type !== "SINGLE" || !!data.faculty, {
    message: "Seleziona la tua facoltà.",
    path: ["faculty"],
  })
  .refine(
    (data) => data.type !== "SINGLE" || data.caption.length <= SINGLE_CAPTION_MAX,
    {
      message: `La frase della foto singola può avere al massimo ${SINGLE_CAPTION_MAX} caratteri.`,
      path: ["caption"],
    }
  );
