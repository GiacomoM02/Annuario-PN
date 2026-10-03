import Image from "next/image";
import { facultyOptions } from "@/lib/faculties";
import type { PublicEntry } from "@/lib/public-entries";

// Scheda delle gallerie (Hall of Fame e Annuario Storico): foto, icona della
// facoltà e nome, come nelle pagine dell'annuario, più l'eventuale
// didascalia (solo Annuario Storico).
export function PhotoCard({ entry }: { entry: PublicEntry }) {
  const faculty = facultyOptions.find((f) => f.value === entry.faculty);

  return (
    <article className="group break-inside-avoid overflow-hidden rounded-lg border border-unipi-100 bg-paper-50 shadow-sm transition hover:-translate-y-0.5 hover:border-unipi-400/40 hover:shadow-md">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-unipi-700">
        <Image
          src={entry.imageUrl}
          alt={entry.names}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        {faculty && (
          <span
            className="absolute right-2 top-2 h-8 w-8 overflow-hidden rounded-full shadow-sm ring-2 ring-paper-50/80"
            title={faculty.label}
          >
            <img
              src={faculty.icon}
              alt={faculty.label}
              className="h-full w-full object-cover"
            />
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display text-base font-semibold leading-snug text-unipi-700">
          {entry.names}
        </h3>
        {entry.caption && (
          <p className="mt-1 text-sm italic leading-snug text-ink-700">
            {entry.caption}
          </p>
        )}
      </div>
    </article>
  );
}
