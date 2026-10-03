"use server";

import { createHmac } from "crypto";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { del } from "@vercel/blob";
import { db, schema } from "@/lib/db";
import { uploadHallOfFameImage, BlobValidationError } from "@/lib/blob-upload";
import {
  editionEntrySchema,
  emailDomainSchema,
  gallerySingleSchema,
} from "@/lib/validations";
import { currentEditionConfig, isSubmissionOpen } from "@/config/current-edition";
import {
  getApprovedEntries,
  isPublicSection,
  type GallerySection,
  type PublicEntry,
} from "@/lib/public-entries";

// Le due gallerie pubbliche (Hall of Fame e Annuario Storico) condividono la
// stessa tabella e la stessa logica: cambia solo la "section" con cui si
// filtra e si scrive. Gli invii per l'edizione annuale (Archivio) hanno
// regole proprie: vedi createEditionEntryAction.
//
// ATTENZIONE: ogni funzione esportata da questo file è un endpoint pubblico,
// richiamabile da chiunque con argomenti arbitrari. I tipi TypeScript non
// valgono a runtime: ogni argomento va ricontrollato qui.
export type { GallerySection } from "@/lib/public-entries";

const SECTION_PATH: Record<GallerySection, string> = {
  HALL_OF_FAME: "/hall-of-fame",
  ANNUARIO_STORICO: "/annuario-storico",
};

type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// Se il salvataggio nel database fallisce dopo l'upload, l'immagine non
// deve restare su Blob senza una scheda collegata.
async function discardImage(imageUrl: string) {
  try {
    await del(imageUrl);
  } catch (err) {
    console.error("discardImage: immagine non cancellata dal Blob", err);
  }
}

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
//    una didascalia. Ogni scheda nasce SEMPRE con status "PENDING" e
//    diventa visibile solo dopo l'approvazione.
// ---------------------------------------------------------------------------
export async function createGalleryEntryAction(
  section: GallerySection,
  formData: FormData
): Promise<ActionResult> {
  if (!isPublicSection(section)) {
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

  let imageUrl: string | null = null;
  try {
    imageUrl = await uploadHallOfFameImage(file);

    await db.insert(schema.hallOfFameEntries).values({
      type: "SINGLE",
      section,
      status: "PENDING",
      faculty: parsed.data.faculty,
      names: parsed.data.names,
      caption: parsed.data.caption ?? null,
      imageUrl,
    });

    revalidatePath(SECTION_PATH[section]);
    return { ok: true, data: undefined };
  } catch (err) {
    if (err instanceof BlobValidationError) {
      return { ok: false, error: err.message };
    }
    console.error("createGalleryEntryAction error", err);
    if (imageUrl) await discardImage(imageUrl);
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
function hashEmail(email: string): string | null {
  // Nessun valore di riserva: senza il segreto le impronte sarebbero
  // calcolabili da chiunque (il codice è pubblico), quindi meglio fermarsi.
  const secret = process.env.EMAIL_HASH_SECRET;
  if (!secret || secret.length < 32) {
    console.error("EMAIL_HASH_SECRET mancante o troppo corto: invii Archivio sospesi.");
    return null;
  }
  return createHmac("sha256", secret).update(email).digest("hex");
}

// Errore Postgres "unique_violation": vedi l'indice sui posti di invio
// (submission_slot) in drizzle/schema.ts.
function isUniqueViolation(err: unknown): boolean {
  for (let e: unknown = err; e; e = (e as { cause?: unknown }).cause) {
    if ((e as { code?: unknown }).code === "23505") return true;
  }
  return false;
}

export async function createEditionEntryAction(formData: FormData): Promise<ActionResult> {
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
  if (!submitterHash) {
    return { ok: false, error: "Invii temporaneamente non disponibili. Riprova più tardi." };
  }
  const { type } = parsed.data;
  const max = type === "SINGLE" ? maxSinglePerPerson : maxGroupPerPerson;
  const limitError =
    type === "SINGLE"
      ? `Hai già inviato la tua foto singola per l'edizione ${year}.`
      : `Hai già inviato ${maxGroupPerPerson} foto di gruppo per l'edizione ${year}: è il massimo consentito.`;

  // Ogni invio occupa un "posto" numerato da 1 a max. L'indice unico sul
  // database impedisce che due invii prendano lo stesso posto, anche se
  // arrivano nello stesso istante: così il limite non si aggira con
  // richieste in parallelo. Se l'admin elimina una foto, il posto si libera.
  const t = schema.hallOfFameEntries;
  async function freeSlot(): Promise<number | undefined> {
    const used = await db
      .select({ slot: t.submissionSlot })
      .from(t)
      .where(
        and(
          eq(t.section, "ARCHIVIO"),
          eq(t.editionYear, year),
          eq(t.submitterHash, submitterHash!),
          eq(t.type, type)
        )
      );
    if (used.length >= max) return undefined;
    const taken = new Set(used.map((r) => r.slot));
    return Array.from({ length: max }, (_, i) => i + 1).find((n) => !taken.has(n));
  }

  let imageUrl: string | null = null;
  try {
    let slot = await freeSlot();
    if (slot === undefined) return { ok: false, error: limitError };

    imageUrl = await uploadHallOfFameImage(file);

    // Se un invio simultaneo ha appena preso lo stesso posto, si riprova con
    // il successivo libero (al massimo "max" volte).
    for (let attempt = 0; ; attempt++) {
      try {
        await db.insert(t).values({
          type,
          section: "ARCHIVIO",
          status: "PENDING",
          faculty: type === "SINGLE" ? parsed.data.faculty : null,
          names: parsed.data.names,
          caption: parsed.data.caption,
          imageUrl,
          editionYear: year,
          submitterHash,
          submissionSlot: slot,
        });
        return { ok: true, data: undefined };
      } catch (err) {
        if (!isUniqueViolation(err) || attempt >= max) throw err;
        slot = await freeSlot();
        if (slot === undefined) throw err;
      }
    }
  } catch (err) {
    if (err instanceof BlobValidationError) {
      return { ok: false, error: err.message };
    }
    if (imageUrl) await discardImage(imageUrl);
    if (isUniqueViolation(err)) {
      return { ok: false, error: limitError };
    }
    console.error("createEditionEntryAction error", err);
    return { ok: false, error: "Caricamento non riuscito. Riprova." };
  }
}

// ---------------------------------------------------------------------------
// 4. Lettura entries APPROVATE per una galleria pubblica (usata per il
//    polling lato client). Mai schede PENDING, mai l'Archivio, e solo i
//    campi pubblici: vedi src/lib/public-entries.ts.
// ---------------------------------------------------------------------------
export async function getLatestEntriesAction(section: GallerySection): Promise<PublicEntry[]> {
  if (!isPublicSection(section)) return [];
  return getApprovedEntries(section);
}
