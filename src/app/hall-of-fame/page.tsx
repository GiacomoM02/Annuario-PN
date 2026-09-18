import { desc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { HallOfFameBoard } from "@/components/HallOfFameBoard";

export const dynamic = "force-dynamic"; // sempre dati freschi: pagina "viva"

async function getInitialEntries() {
  return db
    .select()
    .from(schema.hallOfFameEntries)
    .orderBy(desc(schema.hallOfFameEntries.createdAt))
    .limit(60);
}

export default async function HallOfFamePage() {
  const entries = await getInitialEntries();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <p className="eyebrow">Galleria dei laureandi</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-ink-950">
        Hall of Fame
      </h1>
      <p className="mt-4 max-w-2xl text-ink-700">
        Ogni scheda porta il nome di chi l'ha abitato, il PN. Aggiungi la
        tua: bastano un'email istituzionale verificata, una foto e una
        didascalia.
      </p>

      <HallOfFameBoard initialEntries={entries} />
    </div>
  );
}
