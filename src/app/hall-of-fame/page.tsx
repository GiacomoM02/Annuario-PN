import { getApprovedEntries } from "@/lib/public-entries";
import { GalleryBoard } from "@/components/GalleryBoard";
import { sortEntriesBySurname } from "@/lib/sort-entries";

export const dynamic = "force-dynamic"; // sempre dati freschi: pagina "viva"

async function getInitialEntries() {
  try {
    return await getApprovedEntries("HALL_OF_FAME");
  } catch (err) {
    console.error("Impossibile leggere hall_of_fame_entries:", err);
    return [];
  }
}

export default async function HallOfFamePage() {
  // Tutte le schede approvate, mostrate in ordine alfabetico per cognome.
  const entries = sortEntriesBySurname(await getInitialEntries());

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <p className="eyebrow">La bacheca dei laureati</p>

      <GalleryBoard
        title={
          <h1 className="font-display text-4xl font-semibold text-unipi-700">Hall of Fame</h1>
        }
        intro={
          <p className="mt-4 max-w-2xl text-ink-700">
            Ti sei laureato? Lascia il segno nel PN: la tua foto, la tua facoltà
            e il tuo nome. Bastano un'email istituzionale e una foto.
          </p>
        }
        section="HALL_OF_FAME"
        initialEntries={entries}
        modalEyebrow="Hall of Fame"
        submitLabel="Pubblica nella Hall of Fame"
        variant="yearbook"
      />
    </div>
  );
}
