"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { PhotoCard } from "@/components/PhotoCard";
import { UploadModal } from "@/components/UploadModal";
import {
  getLatestEntriesAction,
  type GallerySection,
} from "@/lib/gallery-actions";
import type { HallOfFameEntry } from "../../drizzle/schema";

const POLL_INTERVAL_MS = 15000;

/**
 * Griglia + pulsante "Aggiungi la tua foto", riusata sia dalla Hall of Fame
 * sia dall'Annuario Storico: cambia solo "section" (quale galleria mostrare
 * e su quale scrivere) e le etichette testuali.
 */
export function GalleryBoard({
  section,
  initialEntries,
  addButtonLabel = "Aggiungi la tua foto",
  modalEyebrow,
  submitLabel,
}: {
  section: GallerySection;
  initialEntries: HallOfFameEntry[];
  addButtonLabel?: string;
  modalEyebrow: string;
  submitLabel: string;
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const knownIds = useRef(new Set(initialEntries.map((e) => e.id)));

  // Polling leggero: rileva foto aggiunte da ALTRI utenti mentre la pagina
  // resta aperta, così la galleria si aggiorna senza bisogno di ricaricare.
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const latest = await getLatestEntriesAction(section);
        setEntries(latest);
        knownIds.current = new Set(latest.map((e) => e.id));
      } catch {
        // silenzioso: riproverà al prossimo tick
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [section]);

  // Le schede nascono in moderazione (status PENDING): NON le mostriamo
  // subito nella griglia pubblica, si chiude solo il modale. Compariranno
  // da sole (via polling) una volta approvate.
  const handleUploaded = useCallback(() => {
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
          className="inline-flex items-center gap-2 rounded-full bg-unipi-500 px-5 py-2.5 text-sm font-medium text-paper-50 transition hover:bg-unipi-600"
        >
          <Plus size={16} />
          {addButtonLabel}
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="mt-14 rounded-lg border border-dashed border-unipi-200 py-20 text-center text-ink-600">
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
        section={section}
        eyebrow={modalEyebrow}
        submitLabel={submitLabel}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUploaded={handleUploaded}
      />
    </div>
  );
}
