"use server";

import { createHmac } from "crypto";
import { revalidatePath } from "next/cache";
import { and, count, desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { uploadHallOfFameImage, BlobValidationError } from "@/lib/blob-upload";
import {
  editionEntrySchema,
  emailDomainSchema,
  gallerySingleSchema,
} from "@/lib/validations";
import { currentEditionConfig, isSubmissionOpen } from "@/config/current-edition";
import type { HallOfFameEntry } from "../../drizzle/schema";

// Le due gallerie pubbliche (Hall of Fame e Annuario Storico) condividono la
// stessa tabella e la stessa logica: cambia solo la "section" con cui si
// filtra e si scrive. Gli invii per l'edizione annuale (Archivio) hanno
// regole proprie: vedi createEditionEntryAction.
export type GallerySection = "HALL_OF_FAME" | "ANNUARIO_STORICO";

const SECTION_PATH: Record<GallerySection, string> = {
  HALL_OF_FAME: "/hall-of-fame",
  ANNUARIO_STORICO: "/annuario-storico",
};

type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// ---------------------------------------------------------------------------
// 1. Controllo del formato email (solo dominio, nessuna verifica reale).
// ---------------------------------------------------------------------------
export async function checkEmailDomainAction(email: string): Promise<ActionResult> {
  const parsed = emailDomainSchema.safeParse({ email });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  return { ok: true, data: undefined };
}

// ---------------------------------------------------------------------------
// 2. Nuova scheda in una galleria (Hall of Fame o Annuario Storico): solo
//    foto singole, con facoltà e nome; l'Annuario Storico richiede anche
//    una didascalia. "section" viene
//    passata dal componente (via prop), non dall'utente. Ogni scheda nasce
//    SEMPRE con status "PENDING" e diventa visibile solo dopo l'approvazione.
// ---------------------------------------------------------------------------
export async function createGalleryEntryAction(
  section: GallerySection,
  formData: FormData
): Promise<ActionResult<HallOfFameEntry>> {
  if (!(section in SECTION_PATH)) {
    return { ok: false, error: "Sezione non valida." };
  }

  const emailCheck = emailDomainSchema.safeParse({
    email: formData.get("email"),
  });
  if (!emailCheck.success) {
    return { ok: false, error: emailCheck.error.issues[0].message };
  }

  const parsed = gallerySingleSchema.safeParse({
    faculty: formData.get("faculty") || undefined,
    names: formData.get("names"),
    // Obbligatoria solo nell'Annuario Storico: una stringa vuota non passa
    // la validazione (min 1), mentre per la Hall of Fame il campo è ignorato.
    caption: section === "ANNUARIO_STORICO" ? String(formData.get("caption") ?? "") : undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const file = formData.get("image");
  if (!(file instanceof File)) {
    return { ok: false, error: "Carica un'immagine." };
  }

  try {
    const imageUrl = await uploadHallOfFameImage(file);

    const [entry] = await db
      .insert(schema.hallOfFameEntries)
      .values({
        type: "SINGLE",
        section,
        status: "PENDING",
        faculty: parsed.data.faculty,
        names: parsed.data.names,
        caption: parsed.data.caption ?? null,
        imageUrl,
      })
      .returning();

    revalidatePath(SECTION_PATH[section]);

    return { ok: true, data: entry };
  } catch (err) {
    if (err instanceof BlobValidationError) {
      return { ok: false, error: err.message };
    }
    console.error("createGalleryEntryAction error", err);
    return { ok: false, error: "Caricamento non riuscito. Riprova." };
  }
}

// ---------------------------------------------------------------------------
// 3. Invio per l'edizione annuale (Archivio). Aperto solo durante la
//    finestra di invio; ogni persona può mandare al massimo 1 foto singola
//    e 3 foto di gruppo per edizione (vedi current-edition.ts). Per contare
//    gli invii senza salvare l'email se ne conserva solo un'impronta HMAC,
//    non reversibile. Le schede non compaiono sul sito: dopo l'approvazione
//    finiscono nel PDF dell'edizione (scripts/generate-pdf.js).
// ---------------------------------------------------------------------------
function hashEmail(email: string): string {
  // Consigliato impostare EMAIL_HASH_SECRET (variabile d'ambiente su
  // Vercel): senza, si usa un valore di riserva fisso, meno robusto.
  const secret = process.env.EMAIL_HASH_SECRET || "annuario-del-pn";
  return createHmac("sha256", secret).update(email).digest("hex");
}

export async function createEditionEntryAction(
  formData: FormData
): Promise<ActionResult<HallOfFameEntry>> {
  const { year, maxSinglePerPerson, maxGroupPerPerson } = currentEditionConfig;

  if (!isSubmissionOpen()) {
    return { ok: false, error: `Gli invii per l'edizione ${year} sono chiusi.` };
  }

  const emailCheck = emailDomainSchema.safeParse({
    email: formData.get("email"),
  });
  if (!emailCheck.success) {
    return { ok: false, error: emailCheck.error.issues[0].message };
  }

  const parsed = editionEntrySchema.safeParse({
    type: formData.get("type"),
    faculty: formData.get("faculty") || undefined,
    names: formData.get("names"),
    caption: formData.get("caption"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const file = formData.get("image");
  if (!(file instanceof File)) {
    return { ok: false, error: "Carica un'immagine." };
  }

  const submitterHash = hashEmail(emailCheck.data.email);
  const { type } = parsed.data;

  try {
    const [{ value: alreadySent }] = await db
      .select({ value: count() })
      .from(schema.hallOfFameEntries)
      .where(
        and(
          eq(schema.hallOfFameEntries.section, "ARCHIVIO"),
          eq(schema.hallOfFameEntries.editionYear, year),
          eq(schema.hallOfFameEntries.submitterHash, submitterHash),
          eq(schema.hallOfFameEntries.type, type)
        )
      );

    if (type === "SINGLE" && alreadySent >= maxSinglePerPerson) {
      return {
        ok: false,
        error: `Hai già inviato la tua foto singola per l'edizione ${year}.`,
      };
    }
    if (type === "GROUP" && alreadySent >= maxGroupPerPerson) {
      return {
        ok: false,
        error: `Hai già inviato ${maxGroupPerPerson} foto di gruppo per l'edizione ${year}: è il massimo consentito.`,
      };
    }

    const imageUrl = await uploadHallOfFameImage(file);

    const [entry] = await db
      .insert(schema.hallOfFameEntries)
      .values({
        type,
        section: "ARCHIVIO",
        status: "PENDING",
        faculty: type === "SINGLE" ? parsed.data.faculty : null,
        names: parsed.data.names,
        caption: parsed.data.caption,
        imageUrl,
        editionYear: year,
        submitterHash,
      })
      .returning();

    return { ok: true, data: entry };
  } catch (err) {
    if (err instanceof BlobValidationError) {
      return { ok: false, error: err.message };
    }
    console.error("createEditionEntryAction error", err);
    return { ok: false, error: "Caricamento non riuscito. Riprova." };
  }
}

// ---------------------------------------------------------------------------
// 4. Lettura entries APPROVATE per una galleria (usata sia per il render
//    iniziale sia per il polling lato client). Le schede PENDING non sono
//    mai incluse qui: restano invisibili finché non vengono moderate.
// ---------------------------------------------------------------------------
export async function getLatestEntriesAction(
  section: GallerySection
): Promise<HallOfFameEntry[]> {
  return db
    .select()
    .from(schema.hallOfFameEntries)
    .where(
      and(
        eq(schema.hallOfFameEntries.section, section),
        eq(schema.hallOfFameEntries.status, "APPROVED")
      )
    )
    .orderBy(desc(schema.hallOfFameEntries.createdAt))
    .limit(1000);
}
