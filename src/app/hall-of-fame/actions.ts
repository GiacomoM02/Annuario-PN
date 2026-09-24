"use server";

import { revalidatePath } from "next/cache";
import { desc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { uploadHallOfFameImage, BlobValidationError } from "@/lib/blob-upload";
import { emailDomainSchema, uploadEntrySchema } from "@/lib/validations";
import type { HallOfFameEntry } from "../../../drizzle/schema";

type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// ---------------------------------------------------------------------------
// 1. Controllo del formato email (SOLO dominio, nessun invio, nessuna verifica
//    reale della proprietà dell'indirizzo). Scelta consapevole: il sito è
//    pensato per un pubblico ristretto e fidato (community universitaria),
//    quindi si rinuncia alla prova via codice a favore della semplicità.
// ---------------------------------------------------------------------------
export async function checkEmailDomainAction(email: string): Promise<ActionResult> {
  const parsed = emailDomainSchema.safeParse({ email });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  return { ok: true, data: undefined };
}

// ---------------------------------------------------------------------------
// 2. Creazione della scheda Hall of Fame: ri-controlla il dominio email lato
//    server (difesa in profondità, non fidarsi solo del client), carica
//    l'immagine su Blob, scrive SOLO nomi/didascalia/url/data — l'email non
//    viene mai salvata nel database, nemmeno qui: è usata solo per il
//    controllo del formato e poi scartata.
// ---------------------------------------------------------------------------
export async function createEntryAction(
  formData: FormData
): Promise<ActionResult<HallOfFameEntry>> {
  const emailCheck = emailDomainSchema.safeParse({
    email: formData.get("email"),
  });
  if (!emailCheck.success) {
    return { ok: false, error: emailCheck.error.issues[0].message };
  }

  const parsed = uploadEntrySchema.safeParse({
    type: formData.get("type"),
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

  try {
    const imageUrl = await uploadHallOfFameImage(file);

    const [entry] = await db
      .insert(schema.hallOfFameEntries)
      .values({
        type: parsed.data.type,
        names: parsed.data.names.trim(),
        caption: parsed.data.caption.trim(),
        imageUrl,
      })
      .returning();

    // Rigenera la pagina per tutti i visitatori (SSR) e il client aggiorna
    // la propria griglia in modo ottimistico senza attendere il reload.
    revalidatePath("/hall-of-fame");

    return { ok: true, data: entry };
  } catch (err) {
    if (err instanceof BlobValidationError) {
      return { ok: false, error: err.message };
    }
    console.error("createEntryAction error", err);
    return { ok: false, error: "Caricamento non riuscito. Riprova." };
  }
}

// ---------------------------------------------------------------------------
// 3. Lettura entries per il polling lato client (rileva foto aggiunte da
//    altri utenti mentre la pagina è aperta).
// ---------------------------------------------------------------------------
export async function getLatestEntriesAction(): Promise<HallOfFameEntry[]> {
  return db
    .select()
    .from(schema.hallOfFameEntries)
    .orderBy(desc(schema.hallOfFameEntries.createdAt))
    .limit(60);
}
