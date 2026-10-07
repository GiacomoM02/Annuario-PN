import Image from "next/image";
import { facultyOptions } from "@/lib/faculties";
import { splitName } from "@/lib/sort-entries";
import { publicPhotoSrc } from "@/lib/photo-src";
import type { PublicEntry } from "@/lib/public-entries";

/**
 * Scheda nello stesso formato delle pagine dell'annuario (vedi la prima
 * edizione in Archivio e scripts/generate-pdf.js): foto quadrata con
 * l'icona della facoltà in alto a destra, nome e cognome su due righe in un
 * riquadro bordato, didascalia in un'etichetta blu (solo se presente: la
 * Hall of Fame non la usa).
 */
export function YearbookCard({ entry }: { entry: PublicEntry }) {
  const faculty = facultyOptions.find((f) => f.value === entry.faculty);
  const { given, surname } = splitName(entry.names);

  return (
    <article className="mx-auto flex w-full max-w-[15rem] flex-col items-center text-yearbook">
      <div className="relative z-10 aspect-square w-[88%]">
        <Image
          src={publicPhotoSrc(entry.id)}
          alt={entry.names}
          fill
          // La versione ridotta arriva già pronta da /foto/<id>.
          unoptimized
          draggable={false}
          className="rounded-xl object-cover"
        />
        {faculty && (
          <img
            src={faculty.icon}
            alt={faculty.label}
            title={faculty.label}
            className="absolute -right-3 -top-3 h-10 w-10 rounded-full"
          />
        )}
      </div>

      {/* Senza didascalia (Hall of Fame) il riquadro del nome chiude la scheda:
          meno spazio sotto, visto che non c'è l'etichetta blu sovrapposta. */}
      <div
        className={`-mt-3 flex w-full flex-col rounded-xl border-2 border-yearbook bg-paper-50 px-2 pt-5 text-center text-[0.9375rem] leading-tight ${
          entry.caption ? "pb-6" : "pb-3"
        }`}
      >
        <span>{given}</span>
        <span>{surname}</span>
      </div>

      {entry.caption && (
        <p className="relative z-10 -mt-4 flex min-h-[4.5rem] w-[88%] items-center justify-center rounded-xl bg-yearbook px-3 py-2 text-center text-[0.8125rem] italic leading-snug text-paper-50">
          {entry.caption}
        </p>
      )}
    </article>
  );
}
