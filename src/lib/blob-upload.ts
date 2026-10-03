import { put } from "@vercel/blob";
import sharp from "sharp";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
// Oltre ~50 megapixel l'immagine viene rifiutata: protegge da file piccoli
// ma enormi una volta decompressi ("decompression bomb").
const MAX_INPUT_PIXELS = 50_000_000;
// Lato lungo massimo dell'immagine salvata: basta per il sito e per il PDF.
const MAX_SIDE = 2400;
// Formati accettati, riconosciuti dal contenuto del file (non dal nome o dal
// tipo dichiarato dal browser, che chiunque può falsificare).
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp"]);

export class BlobValidationError extends Error {}

/**
 * Valida, ripulisce e carica un'immagine su Vercel Blob.
 *
 * L'immagine non viene mai salvata così com'è: viene decodificata e
 * ricodificata in JPEG lato server. In questo modo:
 * - si accettano solo vere immagini JPG, PNG o WebP (niente SVG con script,
 *   HTML travestiti da immagine, AVIF/HEIC o altri formati);
 * - si eliminano TUTTI i metadati EXIF, compresa la posizione GPS in cui è
 *   stata scattata la foto, il modello del telefono, data e ora;
 * - la foto viene raddrizzata secondo l'orientamento indicato dal telefono
 *   e ridimensionata a un lato massimo di MAX_SIDE pixel.
 *
 * Ritorna l'URL pubblico da salvare nel DB (mai il file stesso).
 */
export async function uploadHallOfFameImage(file: File): Promise<string> {
  if (!file || file.size === 0) {
    throw new BlobValidationError("Nessun file ricevuto.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new BlobValidationError("L'immagine supera il limite di 5MB.");
  }

  const input = Buffer.from(await file.arrayBuffer());
  const options = { limitInputPixels: MAX_INPUT_PIXELS };

  let format: string | undefined;
  try {
    format = (await sharp(input, options).metadata()).format;
  } catch {
    throw new BlobValidationError("Il file non è un'immagine valida.");
  }
  if (!format || !ALLOWED_FORMATS.has(format)) {
    throw new BlobValidationError("Formato non supportato: usa una foto JPG, PNG o WebP.");
  }

  let output: Buffer;
  try {
    output = await sharp(input, options)
      .rotate() // applica l'orientamento EXIF prima di eliminarlo
      .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true })
      .flatten({ background: "#ffffff" }) // PNG/WebP trasparenti: sfondo bianco
      .jpeg({ quality: 85, mozjpeg: true }) // senza withMetadata: nessun metadato
      .toBuffer();
  } catch {
    throw new BlobValidationError("Il file non è un'immagine valida.");
  }

  // Nome, estensione e tipo decisi dal server, non dal client.
  const blob = await put(`hall-of-fame/${crypto.randomUUID()}.jpg`, output, {
    access: "public",
    addRandomSuffix: false,
    contentType: "image/jpeg",
  });

  return blob.url;
}
