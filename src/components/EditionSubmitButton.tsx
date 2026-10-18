"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import { UploadModal } from "@/components/UploadModal";
import { UploadForm } from "@/components/UploadForm";
import { editionLabel } from "@/lib/edition-label";

/**
 * Pulsante "Invia la tua foto" per l'edizione in corso: apre direttamente il
 * modulo di invio. Usato nell'Archivio e nella barra in fondo alla Home.
 */
export function EditionSubmitButton({ year, className }: { year: number; className: string }) {
  const [open, setOpen] = useState(false);
  const label = editionLabel(year);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        <Camera className="h-4 w-4" />
        Invia la tua foto
      </button>

      <UploadModal
        eyebrow={`Annuario ${label}`}
        title="Invia la tua foto"
        open={open}
        onClose={() => setOpen(false)}
      >
        <UploadForm
          mode="edition"
          year={year}
          submitLabel={`Invia per l'Annuario ${label}`}
          onUploaded={() => setOpen(false)}
        />
      </UploadModal>
    </>
  );
}
