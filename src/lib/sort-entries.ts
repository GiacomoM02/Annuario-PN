import type { HallOfFameEntry } from "../../drizzle/schema";

// Particelle che fanno parte del cognome ("Del Valle", "Di Giovannantonio").
// Stessa lista in scripts/generate-pdf.js: tenerle allineate.
const SURNAME_PARTICLES = new Set([
  "da", "dal", "dalla", "dalle", "de", "dei", "degli", "del", "della",
  "delle", "dello", "di", "la", "lo", "le", "li", "van", "von", "der",
]);

/**
 * Estrae il "cognome" da una scheda: per le foto singole "names" è
 * "Nome Cognome" (ultima parola = cognome, più eventuali particelle come
 * "De", "Della"); per le foto di gruppo si usa la prima persona elencata,
 * come criterio ragionevole di ordinamento.
 */
export function extractSurname(names: string): string {
  const firstPerson = names.split(",")[0]?.trim() ?? "";
  const parts = firstPerson.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return firstPerson;
  let start = parts.length - 1;
  while (start > 1 && SURNAME_PARTICLES.has(parts[start - 1].toLowerCase())) {
    start--;
  }
  return parts.slice(start).join(" ");
}

export function sortEntriesBySurname<T extends Pick<HallOfFameEntry, "names">>(
  entries: T[]
): T[] {
  return [...entries].sort((a, b) =>
    extractSurname(a.names).localeCompare(extractSurname(b.names), "it", {
      sensitivity: "base",
    })
  );
}
