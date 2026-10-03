"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { del } from "@vercel/blob";
import { db, schema } from "@/lib/db";
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
