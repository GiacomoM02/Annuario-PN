import { z } from "zod";

export const sendOtpSchema = z.object({
  email: z
    .string()
    .email("Inserisci un indirizzo email valido.")
    .refine(
      (v) => v.endsWith("@unipi.it") || v.endsWith("@studenti.unipi.it"),
      "Devi usare un'email @unipi.it o @studenti.unipi.it."
    ),
});

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, "Il codice deve avere 6 cifre."),
});

export const uploadEntrySchema = z.object({
  type: z.enum(["SINGLE", "GROUP"]),
  names: z
    .string()
    .min(3, "Inserisci almeno un nome e cognome.")
    .max(500, "Elenco nomi troppo lungo."),
  caption: z
    .string()
    .min(1, "Aggiungi una didascalia.")
    .max(280, "Didascalia troppo lunga (max 280 caratteri)."),
  verificationToken: z.string().min(1, "Verifica prima la tua email."),
});
