import Link from "next/link";
import { Camera, Download } from "lucide-react";
import { currentEditionConfig, isSubmissionOpen } from "@/config/current-edition";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function CurrentEditionCard() {
  const { year, submissionsOpenAt, submissionsCloseAt, pdfUrl } =
    currentEditionConfig;

  if (isSubmissionOpen()) {
    return (
      <div className="rounded-lg border border-unipi-100 bg-unipi-50 p-6">
        <div className="flex items-center gap-2 text-xs font-medium text-unipi-600">
          <Camera size={14} />
          Invii aperti — edizione {year}
        </div>
        <p className="mt-2 text-sm text-ink-700">
          Le consegne sono aperte dal {formatDate(submissionsOpenAt)} fino al{" "}
          {formatDate(submissionsCloseAt)}.
        </p>
        <Link
          href="/hall-of-fame"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-unipi-500 px-6 py-3 text-sm font-medium text-paper-50 transition hover:bg-unipi-600"
        >
          <Camera size={16} />
          Invia la tua foto per l'edizione {year}
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-unipi-100 bg-unipi-50 p-6">
      <div className="flex items-center gap-2 text-xs font-medium text-unipi-600">
        <Download size={14} />
        Pubblicato
      </div>
      <p className="mt-2 text-sm text-ink-700">
        L'edizione {year} dell'Annuario del PN è pronta.
      </p>
      <a
        href={pdfUrl}
        target="_blank"
        rel="noopener noreferrer"
        download
        className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-unipi-500 px-4 py-2 text-xs font-medium text-paper-50 transition hover:bg-unipi-600"
      >
        <Download size={14} />
        Scarica l'annuario di quest'anno
      </a>
    </div>
  );
}
