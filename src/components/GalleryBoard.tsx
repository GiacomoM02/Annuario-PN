"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { PhotoCard } from "@/components/PhotoCard";
import { YearbookCard } from "@/components/YearbookCard";
import { UploadModal } from "@/components/UploadModal";
import { UploadForm } from "@/components/UploadForm";
import {
  getLatestEntriesAction,
  type GallerySection,
} from "@/lib/gallery-actions";
import { sortEntriesBySurname } from "@/lib/sort-entries";
import type { PublicEntry } from "@/lib/public-entries";

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
  variant = "default",
  title,
  intro,
}: {
  section: GallerySection;
  initialEntries: PublicEntry[];
  addButtonLabel?: string;
  modalEyebrow: string;
  submitLabel: string;
  // "yearbook": schede come nelle pagine dell'annuario, in griglia per righe
  // (l'ordine alfabetico si legge da sinistra a destra).
  variant?: "default" | "yearbook";
  // Se presente, il titolo della pagina viene mostrato qui, con il pulsante
  // "Aggiungi la tua foto" allineato alla sua destra (e "intro" sotto).
  title?: ReactNode;
  intro?: ReactNode;
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const knownIds = useRef(new Set(initialEntries.map((e) => e.id)));

  // Polling leggero: rileva foto aggiunte da ALTRI utenti mentre la pagina
  // resta aperta, così la galleria si aggiorna senza bisogno di ricaricare.
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const latest = sortEntriesBySurname(await getLatestEntriesAction(section));
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

  // Scoraggia il salvataggio delle foto (tasto destro, pressione lunga su
  // telefono). Non impedisce uno screenshot: è solo un deterrente, mentre gli
  // originali restano comunque accessibili solo all'admin.
  const blockImageMenu = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === "IMG") e.preventDefault();
  }, []);

  const addButton = (
    <button
      onClick={() => setIsModalOpen(true)}
      className="inline-flex shrink-0 items-center gap-2 rounded-full bg-unipi-500 px-5 py-2.5 text-sm font-medium text-paper-50 transition hover:bg-unipi-600"
    >
      <Plus className="h-4 w-4" />
      {addButtonLabel}
    </button>
  );

  return (
    <div onContextMenu={blockImageMenu} className="[&_img]:select-none [&_img]:[-webkit-touch-callout:none]">
      {title && (
        <>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
            {title}
            {addButton}
          </div>
          {intro}
        </>
      )}

      <div className="mt-10 flex items-center justify-between">
        <p className="text-sm text-ink-700">
          {entries.length} {entries.length === 1 ? "scheda" : "schede"} finora
        </p>
        {!title && addButton}
      </div>

      {entries.length === 0 ? (
        <div className="mt-14 rounded-lg border border-dashed border-unipi-200 py-20 text-center text-ink-600">
          Nessuna foto ancora. Sii il primo ad aggiungere la tua.
        </div>
      ) : (
        variant === "yearbook" ? (
          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
            {entries.map((entry) => (
              <YearbookCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="mt-8 columns-2 gap-5 sm:columns-3 lg:columns-4 [&>*]:mb-5">
            {entries.map((entry) => (
              <PhotoCard key={entry.id} entry={entry} />
            ))}
          </div>
        )
      )}

      <UploadModal
        eyebrow={modalEyebrow}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <UploadForm
          mode="gallery"
          section={section}
          submitLabel={submitLabel}
          onUploaded={handleUploaded}
        />
      </UploadModal>
    </div>
  );
}
