import sharp from "sharp";
import { findPhoto, readPhoto } from "@/lib/photos";
import { isPublicSection } from "@/lib/public-entries";

export const runtime = "nodejs";

// Lato lungo della versione mostrata nelle gallerie: basta per le schede
// (anche su schermi ad alta densità), ma non è l'originale.
const DISPLAY_SIDE = 800;

// Mai in cache: altrimenti un errore momentaneo resterebbe nel browser.
const notFound = () =>
  new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });

/**
 * Versione ridotta di una foto, solo se APPROVATA e di una galleria
 * pubblica (Hall of Fame o Annuario Storico). Le foto in attesa e quelle
 * dell'Archivio non sono mai servite qui.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const photo = await findPhoto(id);
  if (!photo || photo.status !== "APPROVED" || !isPublicSection(photo.section)) return notFound();

  const original = await readPhoto(photo.imageUrl);
  if (!original) return notFound();

  const display = await sharp(original)
    .rotate()
    .resize({ width: DISPLAY_SIDE, height: DISPLAY_SIDE, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer();

  return new Response(new Uint8Array(display), {
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Disposition": `inline; filename="annuario-pn-${id.slice(0, 8)}.jpg"`,
      // Cache breve: se l'admin elimina o rimette in attesa una foto, sparisce
      // anche da qui entro pochi minuti.
      "Cache-Control": "public, max-age=300, s-maxage=600",
    },
  });
}
