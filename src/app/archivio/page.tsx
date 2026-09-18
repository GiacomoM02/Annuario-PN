import Image from "next/image";
import { Download, FileText } from "lucide-react";
import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";

export const revalidate = 3600; // le edizioni passate cambiano raramente

async function getEditions() {
  return db
    .select()
    .from(schema.archivedEditions)
    .orderBy(desc(schema.archivedEditions.year));
}

export default async function ArchivioPage() {
  const editions = await getEditions();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <p className="eyebrow">Edizioni passate</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-ink-950">
        Archivio
      </h1>
      <p className="mt-4 max-w-2xl text-ink-700">
        Sfoglia la versione digitale di ogni edizione dell'Annuario del PN,
        oppure scarica il PDF originale per consultarlo offline o stamparlo.
      </p>

      <div id="download" className="rule my-12" />

      {editions.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {editions.map((edition) => (
            <article key={edition.id} className="group">
              <a
                href={edition.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative block aspect-[3/4] overflow-hidden rounded-sm border border-ink-950/10 bg-ink-900 shadow-sm transition group-hover:shadow-md"
              >
                <Image
                  src={edition.coverImageUrl}
                  alt={`Copertina ${edition.title}`}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/80 to-transparent p-4">
                  <span className="text-xs font-medium text-parchment-50/90">
                    Apri la versione digitale
                  </span>
                </div>
              </a>
              <div className="mt-3 flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg font-semibold text-ink-950">
                    {edition.title}
                  </h2>
                  <p className="text-sm text-ink-700">{edition.year}</p>
                </div>
                <a
                  href={edition.pdfUrl}
                  download
                  className="mt-1 flex shrink-0 items-center gap-1.5 text-xs font-medium text-brass-600 hover:text-brass-500"
                >
                  <Download size={14} />
                  PDF
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-sm border border-dashed border-ink-950/20 py-20 text-center">
      <FileText className="text-ink-700/40" size={32} />
      <p className="text-ink-700">
        Le edizioni passate compariranno qui non appena verranno caricate.
      </p>
    </div>
  );
}
