"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Camera, Download, Loader2 } from "lucide-react";
import { saveSiteSettingsAction } from "@/lib/admin-actions";
import { editionLabel } from "@/lib/edition-label";

type Mode = "SUBMISSIONS" | "DOWNLOAD";

/**
 * Riquadro "Stato del sito" del pannello admin: si sceglie se il sito
 * raccoglie le foto per l'annuario (con edizione e intervallo di apertura) o
 * se propone il download di un'edizione. Si salva nel database e vale subito.
 * Compatto: sta nella colonna sinistra del pannello, accanto alla moderazione.
 */
export function SiteSettingsForm(props: {
  mode: Mode;
  submissionYear: number;
  yearOptions: number[];
  opensAt: string; // "YYYY-MM-DDTHH:mm", ora di Roma
  closesAt: string;
  downloadYear: number | null;
  editions: { year: number; title: string }[];
  status: string;
  statusTone: "open" | "waiting" | "closed";
}) {
  const [mode, setMode] = useState<Mode>(props.mode);
  const [state, formAction] = useActionState(saveSiteSettingsAction, { ok: false, message: null });

  const tone = {
    open: "border-green-300 bg-green-50 text-green-800",
    waiting: "border-amber-300 bg-amber-50 text-amber-800",
    closed: "border-unipi-100 bg-paper-100 text-ink-700",
  }[props.statusTone];

  return (
    <section className="rounded-xl border border-unipi-100 bg-paper-50 p-4 shadow-sm">
      <h2 className="font-display text-lg font-semibold text-unipi-700">Stato del sito</h2>
      <p className={`mt-2 rounded-md border px-3 py-1.5 text-xs leading-snug ${tone}`}>
        <span className="font-semibold">Adesso: </span>
        {props.status}
      </p>

      <form action={formAction} className="mt-3 space-y-3">
        <fieldset>
          <legend className="sr-only">Cosa deve fare il sito?</legend>
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-ink-950/5 p-1">
            <ModeOption value="SUBMISSIONS" checked={mode === "SUBMISSIONS"} onSelect={setMode} icon={<Camera size={15} />} title="Invio foto" />
            <ModeOption value="DOWNLOAD" checked={mode === "DOWNLOAD"} onSelect={setMode} icon={<Download size={15} />} title="Scarica edizione" />
          </div>
        </fieldset>

        {mode === "SUBMISSIONS" ? (
          <div className="space-y-2.5 rounded-lg bg-unipi-50 p-3">
            <Field label="Edizione da raccogliere">
              <select name="submissionYear" required defaultValue={props.submissionYear} className={inputClass}>
                {props.yearOptions.map((y) => (
                  <option key={y} value={y}>
                    Annuario {editionLabel(y)}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Apertura invii">
                <input type="datetime-local" name="opensAt" required defaultValue={props.opensAt} className={inputClass} />
              </Field>
              <Field label="Chiusura invii">
                <input type="datetime-local" name="closesAt" required defaultValue={props.closesAt} className={inputClass} />
              </Field>
            </div>
            <p className="text-[0.6875rem] leading-snug text-ink-600">
              Ora italiana. Fuori da questo intervallo il sito propone il download dell'edizione scelta qui sotto.
            </p>
          </div>
        ) : (
          <p className="rounded-lg bg-unipi-50 p-3 text-xs leading-snug text-ink-700">
            Invii chiusi: la Home propone il download dell'edizione scelta qui sotto.
          </p>
        )}

        <Field label="Edizione da scaricare">
          <select name="downloadYear" required defaultValue={props.downloadYear ?? props.editions[0]?.year} className={inputClass}>
            {props.editions.map((e) => (
              <option key={e.year} value={e.year}>
                {e.title} ({editionLabel(e.year)})
              </option>
            ))}
          </select>
        </Field>

        <div className="flex flex-wrap items-center gap-3">
          <SaveButton />
          {state.message && (
            <p className={`text-xs ${state.ok ? "text-green-700" : "text-red-700"}`}>{state.message}</p>
          )}
        </div>
      </form>
    </section>
  );
}

const inputClass =
  "w-full rounded-md border border-ink-950/15 bg-paper-50 px-2 py-1.5 text-xs text-ink-950 outline-none focus:border-unipi-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[0.6875rem] font-medium text-ink-700">{label}</span>
      {children}
    </label>
  );
}

function ModeOption(props: {
  value: Mode;
  checked: boolean;
  onSelect: (m: Mode) => void;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold transition ${
        props.checked ? "bg-paper-50 text-unipi-700 shadow-sm" : "text-ink-700 hover:text-ink-950"
      }`}
    >
      <input
        type="radio"
        name="mode"
        value={props.value}
        checked={props.checked}
        onChange={() => props.onSelect(props.value)}
        className="sr-only"
      />
      {props.icon}
      {props.title}
    </label>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-full bg-unipi-500 px-5 py-2 text-sm font-medium text-paper-50 transition hover:bg-unipi-600 disabled:opacity-60"
    >
      {pending && <Loader2 size={14} className="animate-spin" />}
      Salva
    </button>
  );
}
