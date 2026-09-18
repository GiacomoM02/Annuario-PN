"use client";

import { useState, useTransition } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import {
  sendOtpAction,
  verifyOtpAction,
  createEntryAction,
} from "@/app/hall-of-fame/actions";
import { cn } from "@/lib/utils";
import type { HallOfFameEntry } from "../../drizzle/schema";

type Step = "email" | "otp" | "details";

export function UploadForm({
  onUploaded,
}: {
  onUploaded: (entry: HallOfFameEntry) => void;
}) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [verificationToken, setVerificationToken] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // --- Step 1: invia OTP -----------------------------------------------
  function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await sendOtpAction(email);
      if (!result.ok) return setError(result.error);
      setStep("otp");
    });
  }

  // --- Step 2: verifica OTP ----------------------------------------------
  function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await verifyOtpAction(email, code);
      if (!result.ok) return setError(result.error);
      setVerificationToken(result.data.token);
      setStep("details");
    });
  }

  // --- Step 3: dettagli foto + upload -------------------------------------
  function handleSubmitEntry(formData: FormData) {
    setError(null);
    if (verificationToken) {
      formData.set("verificationToken", verificationToken);
    }
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
        <p className="mb-4 rounded-sm border border-garnet-500/30 bg-garnet-500/5 px-3 py-2 text-sm text-garnet-600">
          {error}
        </p>
      )}

      {step === "email" && (
        <form onSubmit={handleSendOtp} className="space-y-4">
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
            Serve solo per verificare che sei dell'Università di Pisa: non
            viene mai salvata.
          </p>
          <SubmitButton pending={isPending}>Invia codice</SubmitButton>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <p className="text-sm text-ink-700">
            Abbiamo inviato un codice a <strong>{email}</strong>.
          </p>
          <Field label="Codice a 6 cifre">
            <input
              type="text"
              required
              inputMode="numeric"
              maxLength={6}
              pattern="[0-9]{6}"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className={cn(inputClass, "tracking-[0.4em]")}
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
            <button
              type="button"
              onClick={() => handleSendOtp(new Event("submit") as any)}
              className="text-xs text-brass-600 underline"
            >
              Rinvia codice
            </button>
          </div>
          <SubmitButton pending={isPending}>Verifica</SubmitButton>
        </form>
      )}

      {step === "details" && (
        <form action={handleSubmitEntry} className="space-y-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-brass-600">
            <ShieldCheck size={14} />
            Email verificata
          </div>

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
              className="block w-full text-sm text-ink-700 file:mr-3 file:rounded-full file:border-0 file:bg-ink-950 file:px-4 file:py-2 file:text-xs file:font-medium file:text-parchment-50"
            />
          </Field>

          <SubmitButton pending={isPending}>Pubblica nella Hall of Fame</SubmitButton>
        </form>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-sm border border-ink-950/15 bg-parchment-100 px-3 py-2.5 text-sm text-ink-950 outline-none focus:border-brass-500";

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
    <label className="flex cursor-pointer items-center gap-2 rounded-full border border-ink-950/15 px-4 py-2 text-sm has-[:checked]:border-brass-500 has-[:checked]:bg-brass-400/10">
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="accent-brass-500"
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
      className="flex w-full items-center justify-center gap-2 rounded-full bg-ink-950 px-6 py-3 text-sm font-medium text-parchment-50 transition hover:bg-ink-900 disabled:opacity-60"
    >
      {pending && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}

function Stepper({ step }: { step: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: "email", label: "Email" },
    { key: "otp", label: "Codice" },
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
                ? "bg-ink-950 text-parchment-50"
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
