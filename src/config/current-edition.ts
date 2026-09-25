/**
 * Stato dell'edizione in corso: finché siamo nella finestra di invio,
 * il sito mostra il pulsante per caricare le foto; una volta chiusa,
 * mostra il pulsante per scaricare l'annuario pubblicato.
 *
 * Per aggiornare le date ogni anno, basta modificare questo file.
 */
export const currentEditionConfig = {
  year: 2026,

  // Finestra di invio (formato ISO, con fuso orario esplicito).
  submissionsOpenAt: "2026-01-01T00:00:00+01:00",
  submissionsCloseAt: "2026-05-31T23:59:59+02:00",

  // PDF pubblicato al termine della raccolta (percorso in /public o URL
  // esterno, es. Vercel Blob). Usato solo quando le consegne sono chiuse.
  pdfUrl: "/pdf/annuario-del-pn-2026.pdf",

  // Interruttore manuale: se impostato esplicitamente (true/false),
  // sovrascrive il calcolo automatico in base alle date. Utile per
  // forzare la modalità download in anticipo, o riaprire gli invii
  // senza cambiare le date sopra. Lascia "null" per usare le date.
  forceSubmissionOpen: null as boolean | null,
};

/**
 * true = mostra il form/CTA di upload, false = mostra il download del PDF.
 */
export function isSubmissionOpen(now: Date = new Date()): boolean {
  const { forceSubmissionOpen, submissionsOpenAt, submissionsCloseAt } =
    currentEditionConfig;

  if (forceSubmissionOpen !== null) return forceSubmissionOpen;

  const opens = new Date(submissionsOpenAt);
  const closes = new Date(submissionsCloseAt);
  return now >= opens && now <= closes;
}
