import Image from "next/image";
import { Users } from "lucide-react";
import type { HallOfFameEntry } from "../../drizzle/schema";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function PhotoCard({ entry }: { entry: HallOfFameEntry }) {
  return (
    <article className="group break-inside-avoid overflow-hidden rounded-sm border border-ink-950/10 bg-parchment-100 shadow-sm transition hover:shadow-md">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-ink-900">
        <Image
          src={entry.imageUrl}
          alt={entry.caption}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        {entry.type === "GROUP" && (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-ink-950/80 px-2.5 py-1 text-[11px] font-medium text-parchment-50">
            <Users size={12} />
            Gruppo
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display text-base font-semibold leading-snug text-ink-950">
          {entry.names}
        </h3>
        <p className="mt-1 text-sm leading-snug text-ink-700">
          {entry.caption}
        </p>
        <p className="mt-2 text-xs text-ink-700/60">
          {formatDate(entry.createdAt)}
        </p>
      </div>
    </article>
  );
}
