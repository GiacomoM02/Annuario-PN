import Link from "next/link";
import { ArrowRight, Camera, Download } from "lucide-react";
import { currentEditionConfig, isSubmissionOpen } from "@/config/current-edition";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

// Barra compatta dell'edizione corrente, pensata per stare sopra la foto
// di sfondo della home (testo blu Unipi sull'alone azzurro).
export function CurrentEditionCard() {
  const { year, submissionsCloseAt, pdfUrl } = currentEditionConfig;
  const open = isSubmissionOpen();

  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-hero-band-fg/80">
          {open ? `Invii aperti — edizione ${year}` : `Edizione ${year} · Pubblicata`}
        </p>
        <p className="mt-1 font-display text-xl font-semibold text-hero-band-fg sm:text-2xl">
          {open
            ? `Consegne fino al ${formatDate(submissionsCloseAt)}`
            : `L'Annuario ${year} è pronto.`}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        {open ? (
          <Link
            href="/hall-of-fame"
            className="inline-flex items-center gap-2 rounded-full bg-hero-band-fg px-5 py-2.5 text-sm font-semibold text-hero-cream shadow-sm transition hover:bg-hero-band-fg/90"
          >
            <Camera size={16} />
            Invia la tua foto
          </Link>
        ) : (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="inline-flex items-center gap-2 rounded-full bg-hero-band-fg px-5 py-2.5 text-sm font-semibold text-hero-cream shadow-sm transition hover:bg-hero-band-fg/90"
          >
            <Download size={16} />
            Scarica l'annuario {year}
          </a>
        )}
        <Link
          href="/archivio"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-hero-band-fg/90 underline-offset-4 transition hover:text-hero-band-fg hover:underline"
        >
          Edizioni passate
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
