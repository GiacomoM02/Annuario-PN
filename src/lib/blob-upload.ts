import { put } from "@vercel/blob";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_MIME_PREFIX = "image/";

export class BlobValidationError extends Error {}

/**
 * Valida e carica un'immagine su Vercel Blob.
 * Ritorna l'URL pubblico da salvare nel DB (mai il file stesso).
 */
export async function uploadHallOfFameImage(file: File): Promise<string> {
  if (!file || file.size === 0) {
    throw new BlobValidationError("Nessun file ricevuto.");
  }
  if (!file.type.startsWith(ALLOWED_MIME_PREFIX)) {
    throw new BlobValidationError(
      "Il file deve essere un'immagine (jpg, png, webp, ...)."
    );
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new BlobValidationError("L'immagine supera il limite di 5MB.");
  }

  const extension = file.name.split(".").pop() || "jpg";
  const safeName = `hall-of-fame/${crypto.randomUUID()}.${extension}`;

  const blob = await put(safeName, file, {
    access: "public",
    addRandomSuffix: false,
    contentType: file.type,
  });

  return blob.url;
}

/**
 * Upload generico per i PDF/copertine delle edizioni archiviate
 * (usato da uno script/route di amministrazione, non dal form pubblico).
 */
export async function uploadArchiveAsset(
  file: File,
  folder: "archivio/pdf" | "archivio/copertine"
): Promise<string> {
  const extension = file.name.split(".").pop() || "pdf";
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
  const blob = await put(path, file, {
    access: "public",
    addRandomSuffix: false,
    contentType: file.type,
  });
  return blob.url;
}
