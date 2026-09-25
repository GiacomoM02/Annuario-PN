"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import {
  checkEmailDomainAction,
  createEntryAction,
} from "@/app/hall-of-fame/actions";
import { cn } from "@/lib/utils";
import type { HallOfFameEntry } from "../../drizzle/schema";

type Step = "email" | "details";

export function UploadForm({
  onUploaded,
}: {
  onUploaded: (entry: HallOfFameEntry) => void;
}) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // --- Step 1: controlla che l'email sia @unipi.it / @studenti.unipi.it ---
  // Nessun codice inviato: solo un controllo di formato, non una vera prova
  // di proprietà dell'indirizzo. Scelta accettata per un sito ad uso interno.
  function handleCheckEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await checkEmailDomainAction(email);
      if (!result.ok) return setError(result.error);
      setStep("details");
    });
  }

  // --- Step 2: dettagli foto + upload -------------------------------------
  function handleSubmitEntry(formData: FormData) {
    setError(null);
    formData.set("email", email);
    startTransition(async () => {
      const result = await createEntryAction(formData);
      if (!result.ok) return setError(result.error);
      onUploaded(result.data);
    });
  }

  return (
    <div>
      <Stepper step={step} />

      {error && (
        <p className="mb-4 rounded-sm border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {step === "email" && (
        <form onSubmit={handleCheckEmail} className="space-y-4">
          <Field label="Email istituzionale">
            <input
              type="email"
              required
              placeholder="mario.rossi@studenti.unipi.it"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </Field>
          <p className="text-xs text-ink-700/70">
            Deve terminare con @unipi.it o @studenti.unipi.it.
          </p>
          <SubmitButton pending={isPending}>Continua</SubmitButton>
        </form>
      )}

      {step === "details" && (
        <form action={handleSubmitEntry} className="space-y-4">
          <Field label="Tipo di foto">
            <div className="flex gap-3">
              <RadioPill name="type" value="SINGLE" label="Singola" defaultChecked />
              <RadioPill name="type" value="GROUP" label="Gruppo" />
            </div>
          </Field>

          <Field label="Nome e cognome (per la foto di gruppo, elenca tutti)">
            <textarea
              name="names"
              required
              rows={2}
              placeholder="Mario Rossi, Giulia Bianchi, Luca Verdi"
              className={inputClass}
            />
          </Field>

          <Field label="Didascalia">
            <input
              type="text"
              name="caption"
              required
              maxLength={280}
              placeholder="Ultimo giorno di tesi, giugno 2026"
              className={inputClass}
            />
          </Field>

          <Field label="Immagine (max 5MB)">
            <input
              type="file"
              name="image"
              accept="image/*"
              required
              className="block w-full text-sm text-ink-700 file:mr-3 file:rounded-full file:border-0 file:bg-ink-950 file:px-4 file:py-2 file:text-xs file:font-medium file:text-paper-50"
            />
          </Field>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep("email")}
              className="text-xs text-ink-700 underline"
            >
              Cambia email
            </button>
          </div>

          <SubmitButton pending={isPending}>Pubblica nella Hall of Fame</SubmitButton>
        </form>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-sm border border-ink-950/15 bg-paper-100 px-3 py-2.5 text-sm text-ink-950 outline-none focus:border-unipi-500";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-700">
        {label}
      </span>
      {children}
    </label>
  );
}

function RadioPill({
  name,
  value,
  label,
  defaultChecked,
}: {
  name: string;
  value: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-full border border-ink-950/15 px-4 py-2 text-sm has-[:checked]:border-unipi-500 has-[:checked]:bg-unipi-100">
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="accent-unipi-500"
      />
      {label}
    </label>
  );
}

function SubmitButton({
  pending,
  children,
}: {
  pending: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-unipi-500 px-6 py-3 text-sm font-medium text-paper-50 transition hover:bg-unipi-600 disabled:opacity-60"
    >
      {pending && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}

function Stepper({ step }: { step: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: "email", label: "Email" },
    { key: "details", label: "Foto" },
  ];
  const activeIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="mb-6 flex items-center gap-2">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-medium",
              i <= activeIndex
                ? "bg-unipi-500 text-paper-50"
                : "bg-ink-950/10 text-ink-700"
            )}
          >
            {i + 1}
          </div>
          <span
            className={cn(
              "text-xs",
              i <= activeIndex ? "text-ink-950" : "text-ink-700/50"
            )}
          >
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <div className="mx-1 h-px w-6 bg-ink-950/10" />
          )}
        </div>
      ))}
    </div>
  );
}
