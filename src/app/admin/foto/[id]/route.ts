import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-auth";
import { findPhoto, readPhoto } from "@/lib/photos";

export const runtime = "nodejs";

/**
 * Foto originale (qualsiasi sezione e stato), solo per l'admin. Il
 * middleware protegge già /admin, ma la sessione si ricontrolla anche qui.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifySessionToken((await cookies()).get(ADMIN_COOKIE)?.value))) {
    return new Response("Unauthorized", { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  const { id } = await params;
  const photo = await findPhoto(id);
  const original = photo && (await readPhoto(photo.imageUrl));
  if (!original) {
    return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  return new Response(new Uint8Array(original), {
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Disposition": `inline; filename="originale-${id.slice(0, 8)}.jpg"`,
      "Cache-Control": "private, no-store",
    },
  });
}
