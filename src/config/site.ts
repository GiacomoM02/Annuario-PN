/**
 * Configurazione generale del sito.
 *
 * L'immagine di sfondo è pensata per essere cambiata SENZA toccare il
 * codice dell'interfaccia: basta aggiornare la variabile d'ambiente
 * NEXT_PUBLIC_BACKGROUND_IMAGE_URL (in .env.local o nelle Environment
 * Variables di Vercel) e ridistribuire, oppure sostituire il file in
 * /public/backgrounds/current.jpg se si preferisce non usare una env var.
 *
 * Se non viene fornita nessuna delle due, si ricade su un colore di
 * sfondo pieno (blu inchiostro), così il sito resta corretto anche senza foto.
 */
export const siteConfig = {
  name: "Annuario del PN",

  // Sorgente configurabile in un unico punto, come richiesto:
  // 1) NEXT_PUBLIC_BACKGROUND_IMAGE_URL se impostata (es. un URL Vercel Blob)
  // 2) altrimenti /backgrounds/current.jpg, se il file è stato caricato in public/
  // 3) altrimenti nessuno sfondo fotografico (solo il colore di base)
  //
  // Il "?v=..." finale è cache-busting automatico: Vercel imposta da solo
  // VERCEL_GIT_COMMIT_SHA ad ogni deploy, quindi ogni nuovo commit cambia
  // l'URL e forza browser/CDN a scaricare la foto aggiornata invece di
  // mostrare quella vecchia rimasta in cache con lo stesso nome file.
  backgroundImageUrl: `${
    process.env.NEXT_PUBLIC_BACKGROUND_IMAGE_URL || "/backgrounds/current.jpg"
  }?v=${process.env.VERCEL_GIT_COMMIT_SHA || Date.now()}`,
};
