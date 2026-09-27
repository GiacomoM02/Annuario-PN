"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import { UploadModal } from "@/components/UploadModal";
import { UploadForm } from "@/components/UploadForm";

/**
 * Riquadro della pagina Archivio per mandare le foto dell'edizione in corso
 * (mostrato solo mentre gli invii sono aperti).
 */
export function EditionSubmitCard({
  year,
  closesOn,
  maxSingle,
  maxGroup,
}: {
  year: number;
  closesOn: string;
  maxSingle: number;
  maxGroup: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-unipi-100 bg-unipi-50 p-6 sm:flex sm:items-center sm:justify-between sm:gap-8">
      <div>
        <p className="eyebrow">Invii aperti fino al {closesOn}</p>
        <h2 className="mt-1 font-display text-xl font-semibold text-unipi-700">
          Manda la tua foto per l'Annuario {year}
        </h2>
        <p className="mt-2 max-w-xl text-sm text-ink-700">
          Ognuno può mandare {maxSingle === 1 ? "una foto singola" : `${maxSingle} foto singole`}{" "}
          (con la tua facoltà e una frase) e fino a {maxGroup} foto di gruppo.
          Dopo la verifica finiranno nel PDF dell'edizione.
        </p>
      </div>
      <button
        onClick={() => setOpen(true)}
        className="mt-5 inline-flex shrink-0 items-center gap-2 rounded-full bg-unipi-500 px-5 py-2.5 text-sm font-medium text-paper-50 transition hover:bg-unipi-600 sm:mt-0"
      >
        <Camera size={16} />
        Invia la tua foto
      </button>

      <UploadModal
        eyebrow={`Annuario ${year}`}
        title="Invia la tua foto"
        open={open}
        onClose={() => setOpen(false)}
      >
        <UploadForm
          mode="edition"
          year={year}
          submitLabel={`Invia per l'Annuario ${year}`}
          onUploaded={() => setOpen(false)}
        />
      </UploadModal>
    </div>
  );
}
