import Link from "next/link";
import { ArrowRight, Camera, Download } from "lucide-react";
import { currentEditionConfig, isSubmissionOpen } from "@/config/current-edition";
import { editions } from "@/config/editions";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

const buttonClass =
  "inline-flex items-center gap-2 rounded-full bg-hero-band-fg px-5 py-2.5 text-sm font-semibold text-hero-cream shadow-sm transition hover:bg-hero-band-fg/90";

// Barra compatta dell'edizione corrente, pensata per stare sopra la foto
// di sfondo della home (testo blu Unipi sull'alone azzurro). Con gli invii
// aperti porta al modulo nell'Archivio; altrimenti scarica direttamente il
// PDF dell'ultima edizione pubblicata (la più recente in editions.ts).
export function CurrentEditionCard() {
  const { year, submissionsCloseAt } = currentEditionConfig;
  const open = isSubmissionOpen();
  const latest = editions.reduce<(typeof editions)[number] | undefined>(
    (acc, e) => (!acc || e.year > acc.year ? e : acc),
    undefined
  );

  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-hero-band-fg/80">
          {open
            ? `Invii aperti — edizione ${year}`
            : `Edizione ${latest?.year ?? year} · Pubblicata`}
        </p>
        <p className="mt-1 font-display text-xl font-semibold text-hero-band-fg sm:text-2xl">
          {open
            ? `Consegne fino al ${formatDate(submissionsCloseAt)}`
            : `L'Annuario ${latest?.year ?? year} è pronto.`}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        {open ? (
          <Link href="/archivio#invia" className={buttonClass}>
            <Camera className="h-4 w-4" />
            Invia la tua foto
          </Link>
        ) : latest ? (
          <a href={latest.pdfUrl} download className={buttonClass}>
            <Download className="h-4 w-4" />
            Scarica l'ultima edizione
          </a>
        ) : null}
        <Link
          href="/archivio"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-hero-band-fg/90 underline-offset-4 transition hover:text-hero-band-fg hover:underline"
        >
          Edizioni passate
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
