/**
 * Edizioni passate dell'Annuario, mostrate nella pagina /archivio.
 *
 * Per aggiungere una nuova edizione: aggiungi un nuovo oggetto in cima
 * all'array. Non serve toccare nessun altro file.
 *
 * - pdfUrl: link diretto al PDF (caricalo su Vercel Blob, Google Drive
 *   con link pubblico, o mettilo in /public/pdf/ e usa "/pdf/nome.pdf").
 * - coverImageUrl: immagine di copertina mostrata nella griglia
 *   (stessa logica: /public/images/... oppure un URL assoluto).
 */
export type YearbookEdition = {
  year: number;
  title: string;
  pdfUrl: string;
  coverImageUrl: string;
};

export const editions: YearbookEdition[] = [
  {
    year: 2026,
    title: "Annuario del PN — Edizione storica",
    pdfUrl: "/pdf/annuario-del-pn-2026.pdf",
    coverImageUrl: "/images/copertine/2026.jpg",
  },
  // Esempio per l'anno prossimo, da scommentare e compilare quando pronto:
  // {
  //   year: 2027,
  //   title: "Annuario del PN — Seconda edizione",
  //   pdfUrl: "/pdf/annuario-del-pn-2027.pdf",
  //   coverImageUrl: "/images/copertine/2027.jpg",
  // },
];
