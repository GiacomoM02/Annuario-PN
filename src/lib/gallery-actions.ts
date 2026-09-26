"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { uploadHallOfFameImage, BlobValidationError } from "@/lib/blob-upload";
import { emailDomainSchema, uploadEntrySchema } from "@/lib/validations";
import type { HallOfFameEntry } from "../../drizzle/schema";

// Le due gallerie (Hall of Fame e Annuario Storico) condividono la stessa
// tabella e la stessa logica: cambia solo la "section" con cui si filtra e
// si scrive. Nessuna duplicazione di codice tra le due pagine.
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
// 2. Creazione di una scheda in una delle due gallerie. "section" viene
//    passata dal componente (via .bind), non dall'utente. Ogni scheda nasce
//    SEMPRE con status "PENDING": diventa visibile pubblicamente solo dopo
//    essere stata approvata (per ora via Drizzle Studio, in attesa di un
//    pannello di moderazione dedicato).
// ---------------------------------------------------------------------------
export async function createGalleryEntryAction(
  section: GallerySection,
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

  try {
    const imageUrl = await uploadHallOfFameImage(file);

    const [entry] = await db
      .insert(schema.hallOfFameEntries)
      .values({
        type: parsed.data.type,
        section,
        status: "PENDING",
        faculty: parsed.data.type === "SINGLE" ? parsed.data.faculty : null,
        names: parsed.data.names.trim(),
        caption: parsed.data.caption.trim(),
        imageUrl,
      })
      .returning();

    // Non serve revalidare la pagina pubblica: finché la scheda è PENDING
    // non compare comunque nella query filtrata su status = APPROVED.
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
// 3. Lettura entries APPROVATE per una sezione (usata sia per il render
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
    .limit(60);
}
