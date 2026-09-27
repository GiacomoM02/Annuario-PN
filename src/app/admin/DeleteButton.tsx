"use client";

import { Trash2 } from "lucide-react";

// Pulsante "Elimina" con conferma: l'eliminazione cancella anche la foto
// da Vercel Blob e non si può annullare.
export function DeleteButton() {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm("Eliminare definitivamente questa foto? L'operazione non si può annullare.")) {
          e.preventDefault();
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-full border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50"
    >
      <Trash2 size={13} />
      Elimina
    </button>
  );
}
