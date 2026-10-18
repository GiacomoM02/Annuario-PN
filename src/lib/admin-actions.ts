"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { del } from "@vercel/blob";
import { db, schema } from "@/lib/db";
import { editions } from "@/config/editions";
import { getSiteSettings } from "@/lib/site-settings";
import { romeLocalToDate } from "@/lib/rome-time";
import {
  ADMIN_COOKIE,
  SESSION_HOURS,
  adminCookieOptions,
  createSessionToken,
  isAdminConfigured,
  verifyPassword,
  verifySessionToken,
} from "@/lib/admin-auth";

// Ogni azione del pannello ricontrolla la sessione: il middleware protegge
// le pagine, ma le Server Actions sono endpoint richiamabili a parte.
async function requireAdmin() {
  if (!(await verifySessionToken((await cookies()).get(ADMIN_COOKIE)?.value))) {
    redirect("/admin/login");
  }
}

// Dopo ogni modifica le gallerie pubbliche si aggiornano subito.
function revalidateGalleries() {
  revalidatePath("/hall-of-fame");
  revalidatePath("/annuario-storico");
  revalidatePath("/admin");
}

// ---------------------------------------------------------------------------
// Login / logout
// ---------------------------------------------------------------------------
export async function loginAction(
  _prev: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  if (!isAdminConfigured()) {
    return { error: "Pannello non configurato: manca la variabile ADMIN_PASSWORD_HASH." };
  }
  const password = String(formData.get("password") ?? "");
  if (!(await verifyPassword(password))) {
    // Piccolo ritardo per rallentare i tentativi a raffica.
    await new Promise((r) => setTimeout(r, 800));
    return { error: "Password non corretta." };
  }
  (await cookies()).set(ADMIN_COOKIE, await createSessionToken(), {
    ...adminCookieOptions,
    maxAge: SESSION_HOURS * 60 * 60,
  });
  redirect("/admin");
}

export async function logoutAction() {
  // Stessi attributi del login: un cookie __Host- senza Secure e Path=/
  // verrebbe ignorato dal browser e la sessione resterebbe attiva.
  (await cookies()).set(ADMIN_COOKIE, "", { ...adminCookieOptions, maxAge: 0 });
  redirect("/admin/login");
}

// ---------------------------------------------------------------------------
// Moderazione
// ---------------------------------------------------------------------------
export async function approveEntryAction(id: string) {
  await requireAdmin();
  await db
    .update(schema.hallOfFameEntries)
    .set({ status: "APPROVED" })
    .where(eq(schema.hallOfFameEntries.id, id));
  revalidateGalleries();
}

export async function setPendingEntryAction(id: string) {
  await requireAdmin();
  await db
    .update(schema.hallOfFameEntries)
    .set({ status: "PENDING" })
    .where(eq(schema.hallOfFameEntries.id, id));
  revalidateGalleries();
}

// Elimina definitivamente la scheda e la sua immagine su Vercel Blob.
export async function deleteEntryAction(id: string) {
  await requireAdmin();
  const [entry] = await db
    .delete(schema.hallOfFameEntries)
    .where(eq(schema.hallOfFameEntries.id, id))
    .returning({ imageUrl: schema.hallOfFameEntries.imageUrl });
  if (entry?.imageUrl) {
    try {
      await del(entry.imageUrl);
    } catch (err) {
      console.error("deleteEntryAction: immagine non cancellata dal Blob", err);
    }
  }
  revalidateGalleries();
}

// ---------------------------------------------------------------------------
// Stato del sito (riquadro in cima al pannello): invio foto o download,
// anno dell'edizione, intervallo di apertura ed edizione da scaricare.
// ---------------------------------------------------------------------------
export type SiteSettingsFormState = { ok: boolean; message: string | null };

export async function saveSiteSettingsAction(
  _prev: SiteSettingsFormState,
  formData: FormData
): Promise<SiteSettingsFormState> {
  await requireAdmin();

  const mode = formData.get("mode");
  if (mode !== "SUBMISSIONS" && mode !== "DOWNLOAD") {
    return { ok: false, message: "Scegli se aprire gli invii o proporre il download." };
  }

  const downloadYear = Number(formData.get("downloadYear"));
  if (!editions.some((e) => e.year === downloadYear)) {
    return { ok: false, message: "Scegli un'edizione da scaricare tra quelle pubblicate." };
  }

  // Le date restano quelle salvate se si passa a "download" senza toccarle;
  // con gli invii aperti sono obbligatorie e devono essere coerenti.
  const current = await getSiteSettings();
  let submissionYear = current.submissionYear;
  let opensAt = current.opensAt;
  let closesAt = current.closesAt;

  if (mode === "SUBMISSIONS") {
    submissionYear = Number(formData.get("submissionYear"));
    if (!Number.isInteger(submissionYear) || submissionYear < 2020 || submissionYear > 2100) {
      return { ok: false, message: "Indica l'anno dell'edizione (per esempio 2027)." };
    }
    const o = romeLocalToDate(String(formData.get("opensAt") ?? ""));
    const c = romeLocalToDate(String(formData.get("closesAt") ?? ""));
    if (!o || !c) {
      return { ok: false, message: "Indica data e ora di apertura e di chiusura degli invii." };
    }
    if (c <= o) {
      return { ok: false, message: "La chiusura deve essere dopo l'apertura." };
    }
    opensAt = o;
    closesAt = c;
  }

  const values = { mode, submissionYear, opensAt, closesAt, downloadYear, updatedAt: new Date() };
  await db
    .insert(schema.siteSettings)
    .values({ id: 1, ...values })
    .onConflictDoUpdate({ target: schema.siteSettings.id, set: values });

  // Home, Archivio e pannello mostrano subito il nuovo stato.
  revalidatePath("/");
  revalidatePath("/archivio");
  revalidatePath("/admin");
  return { ok: true, message: "Impostazioni salvate: il sito è già aggiornato." };
}
