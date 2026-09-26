import { and, desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { GalleryBoard } from "@/components/GalleryBoard";

export const dynamic = "force-dynamic"; // sempre dati freschi: pagina "viva"

async function getInitialEntries() {
  try {
    return await db
      .select()
      .from(schema.hallOfFameEntries)
      .where(
        and(
          eq(schema.hallOfFameEntries.section, "ANNUARIO_STORICO"),
          eq(schema.hallOfFameEntries.status, "APPROVED")
        )
      )
      .orderBy(desc(schema.hallOfFameEntries.createdAt))
      .limit(60);
  } catch (err) {
    console.error("Impossibile leggere hall_of_fame_entries (storico):", err);
    return [];
  }
}

export default async function AnnuarioStoricoPage() {
  const entries = await getInitialEntries();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <p className="eyebrow">Ricordi da tutte le edizioni</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-unipi-700">
        Annuario Storico
      </h1>
      <p className="mt-4 max-w-2xl text-ink-700">
        Una galleria a parte, senza vincoli di edizione: foto, gruppi e
        momenti del PN nel tempo. Aggiungi la tua: bastano un'email
        istituzionale, una foto e una didascalia.
      </p>

      <GalleryBoard
        section="ANNUARIO_STORICO"
        initialEntries={entries}
        modalEyebrow="Annuario Storico"
        submitLabel="Pubblica nell'Annuario Storico"
      />
    </div>
  );
}
