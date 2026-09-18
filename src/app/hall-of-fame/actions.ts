"use server";

import { revalidatePath } from "next/cache";
import { desc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { createOtp, verifyOtp, OtpError } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";
import { issueVerificationToken, verifyVerificationToken } from "@/lib/token";
import { uploadHallOfFameImage, BlobValidationError } from "@/lib/blob-upload";
import {
  sendOtpSchema,
  verifyOtpSchema,
  uploadEntrySchema,
} from "@/lib/validations";
import type { HallOfFameEntry } from "../../../drizzle/schema";

type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// ---------------------------------------------------------------------------
// 1. Invio OTP alla mail istituzionale (mai salvata: solo Redis con TTL).
// ---------------------------------------------------------------------------
export async function sendOtpAction(email: string): Promise<ActionResult> {
  const parsed = sendOtpSchema.safeParse({ email });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  try {
    const code = await createOtp(parsed.data.email);
    await sendOtpEmail(parsed.data.email, code);
    return { ok: true, data: undefined };
  } catch (err) {
    if (err instanceof OtpError) return { ok: false, error: err.message };
    console.error("sendOtpAction error", err);
    return { ok: false, error: "Impossibile inviare il codice. Riprova." };
  }
}

// ---------------------------------------------------------------------------
// 2. Verifica OTP -> emette un token firmato temporaneo (senza email dentro)
//    che sblocca il form di upload per i prossimi 15 minuti.
// ---------------------------------------------------------------------------
export async function verifyOtpAction(
  email: string,
  code: string
): Promise<ActionResult<{ token: string }>> {
  const parsed = verifyOtpSchema.safeParse({ email, code });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  try {
    const isValid = await verifyOtp(parsed.data.email, parsed.data.code);
    if (!isValid) {
      return { ok: false, error: "Codice non corretto. Riprova." };
    }
    const token = issueVerificationToken();
    return { ok: true, data: { token } };
  } catch (err) {
    if (err instanceof OtpError) return { ok: false, error: err.message };
    console.error("verifyOtpAction error", err);
    return { ok: false, error: "Verifica non riuscita. Riprova." };
  }
}

// ---------------------------------------------------------------------------
// 3. Creazione della scheda Hall of Fame: richiede un token di verifica
//    valido, carica l'immagine su Blob, scrive SOLO nomi/didascalia/url/data.
// ---------------------------------------------------------------------------
export async function createEntryAction(
  formData: FormData
): Promise<ActionResult<HallOfFameEntry>> {
  const verificationToken = formData.get("verificationToken");
  if (!verifyVerificationToken(String(verificationToken ?? ""))) {
    return {
      ok: false,
      error: "Verifica dell'email scaduta. Richiedi un nuovo codice.",
    };
  }

  const parsed = uploadEntrySchema.safeParse({
    type: formData.get("type"),
    names: formData.get("names"),
    caption: formData.get("caption"),
    verificationToken: String(verificationToken),
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
// 4. Lettura entries per il polling lato client (rileva foto aggiunte da
//    altri utenti mentre la pagina è aperta).
// ---------------------------------------------------------------------------
export async function getLatestEntriesAction(): Promise<HallOfFameEntry[]> {
  return db
    .select()
    .from(schema.hallOfFameEntries)
    .orderBy(desc(schema.hallOfFameEntries.createdAt))
    .limit(60);
}
