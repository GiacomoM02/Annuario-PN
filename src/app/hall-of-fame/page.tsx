import { and, desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { GalleryBoard } from "@/components/GalleryBoard";
import { sortEntriesBySurname } from "@/lib/sort-entries";

export const dynamic = "force-dynamic"; // sempre dati freschi: pagina "viva"

async function getInitialEntries() {
  try {
    return await db
      .select()
      .from(schema.hallOfFameEntries)
      .where(
        and(
          eq(schema.hallOfFameEntries.section, "HALL_OF_FAME"),
          eq(schema.hallOfFameEntries.status, "APPROVED")
        )
      )
      .orderBy(desc(schema.hallOfFameEntries.createdAt))
      .limit(1000);
  } catch (err) {
    console.error("Impossibile leggere hall_of_fame_entries:", err);
    return [];
  }
}

export default async function HallOfFamePage() {
  // Tutte le schede approvate, mostrate in ordine alfabetico per cognome.
  const entries = sortEntriesBySurname(await getInitialEntries());

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <p className="eyebrow">La bacheca dei laureati</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-unipi-700">
        Hall of Fame
      </h1>
      <p className="mt-4 max-w-2xl text-ink-700">
        Ti sei laureato? Lascia il segno nel PN: la tua foto, la tua facoltà
        e il tuo nome. Bastano un'email istituzionale e una foto.
      </p>

      <GalleryBoard
        section="HALL_OF_FAME"
        initialEntries={entries}
        modalEyebrow="Hall of Fame"
        submitLabel="Pubblica nella Hall of Fame"
        variant="yearbook"
      />
    </div>
  );
}
