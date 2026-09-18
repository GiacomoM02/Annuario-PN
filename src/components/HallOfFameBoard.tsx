"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { PhotoCard } from "@/components/PhotoCard";
import { UploadModal } from "@/components/UploadModal";
import { getLatestEntriesAction } from "@/app/hall-of-fame/actions";
import type { HallOfFameEntry } from "../../drizzle/schema";

const POLL_INTERVAL_MS = 15000;

export function HallOfFameBoard({
  initialEntries,
}: {
  initialEntries: HallOfFameEntry[];
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const knownIds = useRef(new Set(initialEntries.map((e) => e.id)));

  // Polling leggero: rileva foto aggiunte da ALTRI utenti mentre la pagina
  // resta aperta, così la galleria si aggiorna senza bisogno di ricaricare.
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const latest = await getLatestEntriesAction();
        setEntries(latest);
        knownIds.current = new Set(latest.map((e) => e.id));
      } catch {
        // silenzioso: riproverà al prossimo tick
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  // Aggiornamento ottimistico immediato per chi ha appena caricato una foto.
  const handleUploaded = useCallback((entry: HallOfFameEntry) => {
    setEntries((prev) => {
      if (knownIds.current.has(entry.id)) return prev;
      knownIds.current.add(entry.id);
      return [entry, ...prev];
    });
    setIsModalOpen(false);
  }, []);

  return (
    <div>
      <div className="mt-10 flex items-center justify-between">
        <p className="text-sm text-ink-700">
          {entries.length} {entries.length === 1 ? "scheda" : "schede"} finora
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-garnet-500 px-5 py-2.5 text-sm font-medium text-parchment-50 transition hover:bg-garnet-600"
        >
          <Plus size={16} />
          Aggiungi la tua foto
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="mt-14 rounded-sm border border-dashed border-ink-950/20 py-20 text-center text-ink-700">
          Nessuna foto ancora. Sii il primo ad aggiungere la tua.
        </div>
      ) : (
        <div className="mt-8 columns-2 gap-5 sm:columns-3 lg:columns-4 [&>*]:mb-5">
          {entries.map((entry) => (
            <PhotoCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      <UploadModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUploaded={handleUploaded}
      />
    </div>
  );
}
