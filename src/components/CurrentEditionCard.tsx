import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { EditionSubmitButton } from "@/components/EditionSubmitButton";
import { editionLabel } from "@/lib/edition-label";
import { getDownloadEdition, getSiteSettings, isSubmissionOpen } from "@/lib/site-settings";
import { formatRomeDate } from "@/lib/rome-time";

const buttonClass =
  "inline-flex items-center gap-2 rounded-full bg-hero-band-fg px-5 py-2.5 text-sm font-semibold text-hero-cream lg:px-6 lg:py-3 lg:text-base shadow-sm transition hover:bg-hero-band-fg/90";

// Barra compatta dell'edizione corrente, pensata per stare sopra la foto
// di sfondo della home (testo blu Unipi sull'alone azzurro). Con gli invii
// aperti apre direttamente il modulo di invio; altrimenti scarica direttamente il
// PDF dell'edizione scelta dall'admin nel pannello (Stato del sito).
export async function CurrentEditionCard() {
  const settings = await getSiteSettings();
  const year = settings.submissionYear;
  const open = isSubmissionOpen(settings);
  const latest = getDownloadEdition(settings);

  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-hero-band-fg/80 lg:text-sm">
          {open
            ? `Invii aperti — edizione ${editionLabel(year)}`
            : `Edizione ${editionLabel(latest?.year ?? year)} · Pubblicata`}
        </p>
        <p className="mt-1 font-display text-xl font-semibold text-hero-band-fg sm:text-2xl lg:text-3xl">
          {open
            ? `Consegne fino al ${formatRomeDate(settings.closesAt)}`
            : `L'Annuario ${editionLabel(latest?.year ?? year)} è pronto.`}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        {open ? (
          <EditionSubmitButton year={year} className={buttonClass} />
        ) : latest ? (
          <a href={latest.pdfUrl} download className={buttonClass}>
            <Download className="h-4 w-4" />
            Scarica l'ultima edizione
          </a>
        ) : null}
        <Link
          href="/archivio"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-hero-band-fg/90 lg:text-base underline-offset-4 transition hover:text-hero-band-fg hover:underline"
        >
          Edizioni passate
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
