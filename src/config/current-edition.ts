/**
 * Impostazioni fisse dell'edizione annuale.
 *
 * Modalità del sito (invio foto o download), anno dell'edizione, date di
 * apertura/chiusura ed edizione da scaricare NON si cambiano più qui: si
 * decidono dal pannello admin (/admin, riquadro "Stato del sito") e sono
 * salvate nel database (vedi src/lib/site-settings.ts).
 *
 * I valori di "defaults" servono solo se nel database non c'è ancora
 * nessuna impostazione (per esempio su un database appena creato).
 */
export const currentEditionConfig = {
  // Invii massimi per persona (per email istituzionale) in ogni edizione.
  maxSinglePerPerson: 1,
  maxGroupPerPerson: 3,

  defaults: {
    mode: "DOWNLOAD" as const,
    submissionYear: 2027,
    opensAt: "2026-10-14T00:00:00+02:00",
    closesAt: "2026-12-12T23:59:00+01:00",
    downloadYear: 2026,
  },
};
