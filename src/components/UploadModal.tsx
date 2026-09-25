"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { UploadForm } from "@/components/UploadForm";
import type { HallOfFameEntry } from "../../drizzle/schema";

export function UploadModal({
  open,
  onClose,
  onUploaded,
}: {
  open: boolean;
  onClose: () => void;
  onUploaded: (entry: HallOfFameEntry) => void;
}) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/50 p-0 sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-paper-50 p-6 shadow-xl sm:rounded-sm sm:p-8"
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="eyebrow">Hall of Fame</p>
            <h2 className="mt-1 font-display text-xl font-semibold text-ink-950">
              Aggiungi la tua foto
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Chiudi"
            className="rounded-full p-1.5 text-ink-700 hover:bg-ink-950/5"
          >
            <X size={18} />
          </button>
        </div>
        <UploadForm onUploaded={onUploaded} />
      </div>
    </div>
  );
}
