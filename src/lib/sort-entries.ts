import type { HallOfFameEntry } from "../../drizzle/schema";

// Particelle che fanno parte del cognome ("Del Valle", "Di Giovannantonio").
// Stessa lista in scripts/generate-pdf.js: tenerle allineate.
const SURNAME_PARTICLES = new Set([
  "da", "dal", "dalla", "dalle", "de", "dei", "degli", "del", "della",
  "delle", "dello", "di", "la", "lo", "le", "li", "van", "von", "der",
]);

// Divide "Anna Chiara Del Valle" in nome ("Anna Chiara") e cognome
// ("Del Valle"): il cognome è l'ultima parola più le eventuali particelle.
export function splitName(fullName: string): { given: string; surname: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return { given: fullName.trim(), surname: "" };
  let start = parts.length - 1;
  while (start > 1 && SURNAME_PARTICLES.has(parts[start - 1].toLowerCase())) {
    start--;
  }
  return { given: parts.slice(0, start).join(" "), surname: parts.slice(start).join(" ") };
}

/**
 * Estrae il "cognome" da una scheda: per le foto singole "names" è
 * "Nome Cognome"; per le foto di gruppo si usa la prima persona elencata,
 * come criterio ragionevole di ordinamento.
 */
export function extractSurname(names: string): string {
  const firstPerson = names.split(",")[0]?.trim() ?? "";
  return splitName(firstPerson).surname || firstPerson;
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
