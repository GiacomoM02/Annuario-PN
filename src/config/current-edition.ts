/**
 * Stato dell'edizione in corso: finché siamo nella finestra di invio, il
 * sito permette di mandare le foto per l'annuario dalla pagina Archivio;
 * una volta chiusa, rimanda all'Archivio per sfogliare le edizioni
 * pubblicate (i PDF si aggiungono in src/config/editions.ts).
 *
 * Per aggiornare le date ogni anno, basta modificare questo file.
 */
export const currentEditionConfig = {
  year: 2026,

  // Finestra di invio (formato ISO, con fuso orario esplicito).
  submissionsOpenAt: "2026-01-01T00:00:00+01:00",
  submissionsCloseAt: "2026-05-31T23:59:59+02:00",

  // Invii massimi per persona (per email istituzionale) in ogni edizione.
  maxSinglePerPerson: 1,
  maxGroupPerPerson: 3,

  // Interruttore manuale: se impostato esplicitamente (true/false),
  // sovrascrive il calcolo automatico in base alle date. Utile per
  // chiudere gli invii in anticipo, o riaprirli senza cambiare le date
  // sopra. Lascia "null" per usare le date.
  forceSubmissionOpen: null as boolean | null,
};

/**
 * true = invii aperti per l'edizione in corso, false = invii chiusi.
 */
export function isSubmissionOpen(now: Date = new Date()): boolean {
  const { forceSubmissionOpen, submissionsOpenAt, submissionsCloseAt } =
    currentEditionConfig;

  if (forceSubmissionOpen !== null) return forceSubmissionOpen;

  const opens = new Date(submissionsOpenAt);
  const closes = new Date(submissionsCloseAt);
  return now >= opens && now <= closes;
}
