import { getApprovedEntries } from "@/lib/public-entries";
import { GalleryBoard } from "@/components/GalleryBoard";
import { sortEntriesBySurname } from "@/lib/sort-entries";

export const dynamic = "force-dynamic"; // sempre dati freschi: pagina "viva"

async function getInitialEntries() {
  try {
    return await getApprovedEntries("ANNUARIO_STORICO");
  } catch (err) {
    console.error("Impossibile leggere hall_of_fame_entries (storico):", err);
    return [];
  }
}

export default async function AnnuarioStoricoPage() {
  // Tutte le schede approvate, mostrate in ordine alfabetico per cognome.
  const entries = sortEntriesBySurname(await getInitialEntries());

  return (
    <div className="page-container py-16">
      <p className="eyebrow">Sempre aperto</p>
      <h1 className="mt-2 page-title">
        Annuario Storico
      </h1>
      <p className="page-intro">
        Frequenti il PN da tempo ma non hai mai mandato la tua foto per
        l'annuario? Qui puoi farlo in qualsiasi momento: la tua foto, la tua
        facoltà, il tuo nome e una didascalia. Bastano un'email
        istituzionale e una foto.
      </p>

      <GalleryBoard
        section="ANNUARIO_STORICO"
        initialEntries={entries}
        modalEyebrow="Annuario Storico"
        submitLabel="Pubblica nell'Annuario Storico"
        variant="yearbook"
      />
    </div>
  );
}
