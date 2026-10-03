import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";

// Le foto stanno su Vercel Blob con indirizzi casuali, impossibili da
// indovinare, che NON vengono mai mostrati ai visitatori: il sito le serve
// tramite /foto/<id> (versione ridotta, solo foto approvate delle gallerie)
// e /admin/foto/<id> (originale, solo con la sessione admin). Così nessuno,
// tranne l'admin, può scaricare i file originali.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function findPhoto(id: string) {
  if (!UUID.test(id)) return null;
  const t = schema.hallOfFameEntries;
  const [row] = await db
    .select({ imageUrl: t.imageUrl, section: t.section, status: t.status })
    .from(t)
    .where(eq(t.id, id))
    .limit(1);
  return row ?? null;
}

export async function readPhoto(imageUrl: string): Promise<Buffer | null> {
  const res = await fetch(imageUrl, { cache: "no-store" });
  if (!res.ok) return null;
  return Buffer.from(await res.arrayBuffer());
}
