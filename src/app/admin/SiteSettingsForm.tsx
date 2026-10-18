"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Camera, Download, Loader2 } from "lucide-react";
import { saveSiteSettingsAction } from "@/lib/admin-actions";

type Mode = "SUBMISSIONS" | "DOWNLOAD";

/**
 * Riquadro "Stato del sito" del pannello admin: si sceglie se il sito
 * raccoglie le foto per l'annuario (con anno e intervallo di apertura) o se
 * propone il download di un'edizione. Si salva nel database e vale subito.
 */
export function SiteSettingsForm(props: {
  mode: Mode;
  submissionYear: number;
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
    <section className="rounded-xl border border-unipi-100 bg-paper-50 p-6 shadow-sm">
      <h2 className="font-display text-xl font-semibold text-unipi-700">Stato del sito</h2>
      <p className={`mt-3 rounded-md border px-3 py-2 text-sm ${tone}`}>
        <span className="font-semibold">Adesso: </span>
        {props.status}
      </p>

      <form action={formAction} className="mt-5 space-y-5">
        <fieldset>
          <legend className="text-sm font-medium text-ink-800">Cosa deve fare il sito?</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <ModeOption
              value="SUBMISSIONS"
              checked={mode === "SUBMISSIONS"}
              onSelect={setMode}
              icon={<Camera size={18} />}
              title="Invio foto"
              body="Raccoglie le foto per l'annuario nell'intervallo che scegli qui sotto."
            />
            <ModeOption
              value="DOWNLOAD"
              checked={mode === "DOWNLOAD"}
              onSelect={setMode}
              icon={<Download size={18} />}
              title="Scarica edizione"
              body="Invii chiusi: la Home propone il download dell'edizione scelta."
            />
          </div>
        </fieldset>

        {mode === "SUBMISSIONS" && (
          <div className="grid gap-4 rounded-lg bg-unipi-50 p-4 sm:grid-cols-3">
            <Field label="Anno dell'edizione">
              <input type="number" name="submissionYear" min={2020} max={2100} required defaultValue={props.submissionYear} className={inputClass} />
            </Field>
            <Field label="Apertura invii">
              <input type="datetime-local" name="opensAt" required defaultValue={props.opensAt} className={inputClass} />
            </Field>
            <Field label="Chiusura invii">
              <input type="datetime-local" name="closesAt" required defaultValue={props.closesAt} className={inputClass} />
            </Field>
            <p className="text-xs text-ink-600 sm:col-span-3">
              Ora italiana. Prima dell'apertura e dopo la chiusura il sito propone da solo il download dell'edizione scelta qui sotto.
            </p>
          </div>
        )}

        <Field label="Edizione da scaricare">
          <select name="downloadYear" required defaultValue={props.downloadYear ?? props.editions[0]?.year} className={inputClass}>
            {props.editions.map((e) => (
              <option key={e.year} value={e.year}>
                {e.title} ({e.year})
              </option>
            ))}
          </select>
        </Field>

        <div className="flex flex-wrap items-center gap-4">
          <SaveButton />
          {state.message && (
            <p className={`text-sm ${state.ok ? "text-green-700" : "text-red-700"}`}>{state.message}</p>
          )}
        </div>
      </form>
    </section>
  );
}

const inputClass =
  "w-full rounded-md border border-ink-950/15 bg-paper-50 px-3 py-2 text-sm text-ink-950 outline-none focus:border-unipi-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-700">{label}</span>
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
  body: string;
}) {
  return (
    <label
      className={`flex cursor-pointer gap-3 rounded-lg border-2 p-4 transition ${
        props.checked ? "border-unipi-500 bg-unipi-50" : "border-ink-950/10 hover:border-unipi-400/50"
      }`}
    >
      <input
        type="radio"
        name="mode"
        value={props.value}
        checked={props.checked}
        onChange={() => props.onSelect(props.value)}
        className="mt-1 accent-unipi-500"
      />
      <span>
        <span className="flex items-center gap-2 font-semibold text-unipi-700">
          {props.icon}
          {props.title}
        </span>
        <span className="mt-1 block text-sm text-ink-700">{props.body}</span>
      </span>
    </label>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
      {pending && <Loader2 size={16} className="animate-spin" />}
      Salva
    </button>
  );
}
