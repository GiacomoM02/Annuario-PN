import { cache } from "react";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { currentEditionConfig } from "@/config/current-edition";
import { editions, type YearbookEdition } from "@/config/editions";

/**
 * Stato del sito, deciso dall'admin dal pannello (/admin):
 * - mode "SUBMISSIONS": si raccolgono le foto per l'edizione submissionYear,
 *   ma solo tra opensAt e closesAt; prima e dopo il sito propone il
 *   download dell'edizione downloadYear;
 * - mode "DOWNLOAD": invii chiusi, il sito propone il download
 *   dell'edizione downloadYear.
 * È salvato in una sola riga della tabella site_settings (id = 1).
 */
export type SiteMode = "SUBMISSIONS" | "DOWNLOAD";

export type SiteSettings = {
  mode: SiteMode;
  submissionYear: number;
  opensAt: Date;
  closesAt: Date;
  downloadYear: number | null;
};

function defaults(): SiteSettings {
  const d = currentEditionConfig.defaults;
  return {
    mode: d.mode,
    submissionYear: d.submissionYear,
    opensAt: new Date(d.opensAt),
    closesAt: new Date(d.closesAt),
    downloadYear: d.downloadYear,
  };
}

// Letta una sola volta per richiesta (cache di React). Se il database non
// risponde si usano i valori di riserva, così il sito resta in piedi.
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const t = schema.siteSettings;
    const [row] = await db.select().from(t).where(eq(t.id, 1)).limit(1);
    if (!row) return defaults();
    return {
      mode: row.mode === "SUBMISSIONS" ? "SUBMISSIONS" : "DOWNLOAD",
      submissionYear: row.submissionYear,
      opensAt: row.opensAt,
      closesAt: row.closesAt,
      downloadYear: row.downloadYear,
    };
  } catch (err) {
    console.error("getSiteSettings: uso i valori di riserva", err);
    return defaults();
  }
});

/** true se in questo momento si possono mandare le foto per l'annuario. */
export function isSubmissionOpen(s: SiteSettings, now: Date = new Date()): boolean {
  return s.mode === "SUBMISSIONS" && now >= s.opensAt && now <= s.closesAt;
}

/** Edizione da far scaricare: quella scelta, altrimenti la più recente. */
export function getDownloadEdition(s: SiteSettings): YearbookEdition | undefined {
  return (
    editions.find((e) => e.year === s.downloadYear) ??
    editions.reduce<YearbookEdition | undefined>((acc, e) => (!acc || e.year > acc.year ? e : acc), undefined)
  );
}
