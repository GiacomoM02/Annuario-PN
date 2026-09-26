import type { HallOfFameEntry } from "../../drizzle/schema";

/**
 * Estrae il "cognome" da una scheda: per le foto singole "names" è
 * "Nome Cognome" (ultima parola = cognome); per le foto di gruppo si usa
 * la prima persona elencata, come criterio ragionevole di ordinamento.
 */
function extractSurname(names: string): string {
  const firstPerson = names.split(",")[0]?.trim() ?? "";
  const parts = firstPerson.split(/\s+/).filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : firstPerson;
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
