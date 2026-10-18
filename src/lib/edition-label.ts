// Nome di un'edizione: l'anno accademico che raccoglie. L'edizione 2027
// (quella che si chiude e si pubblica nel 2027) è la "2026-2027".
export function editionLabel(year: number): string {
  return `${year - 1}-${year}`;
}
