"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import {
  checkEmailDomainAction,
  createEditionEntryAction,
  createGalleryEntryAction,
  type GallerySection,
} from "@/lib/gallery-actions";
import { facultyOptions } from "@/lib/faculties";
import { SINGLE_CAPTION_MAX } from "@/lib/validations";
import { cn } from "@/lib/utils";

type Step = "email" | "details" | "success";
type PhotoType = "SINGLE" | "GROUP";

/**
 * Modulo di invio in due passi (email istituzionale, poi foto), in due
 * varianti:
 * - "gallery": Hall of Fame e Annuario Storico, solo foto singole con
 *   facoltà e nome;
 * - "edition": invii per l'annuario dell'anno (pagina Archivio), foto
 *   singola con frase breve oppure di gruppo con didascalia.
 */
export function UploadForm(
  props: {
    submitLabel?: string;
    onUploaded: () => void;
  } & (
    | { mode: "gallery"; section: GallerySection }
    | { mode: "edition"; year: number }
  )
) {
  const { submitLabel = "Invia", onUploaded } = props;
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [photoType, setPhotoType] = useState<PhotoType>("SINGLE");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  // Nome inviato, per il messaggio di conferma (le azioni non restituiscono
  // la scheda salvata).
  const [submittedName, setSubmittedName] = useState("");

  const isEdition = props.mode === "edition";
  const isSingle = !isEdition || photoType === "SINGLE";

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

  // --- Step 2: dettagli foto + upload. La scheda nasce sempre in
  // moderazione (status PENDING), quindi qui mostriamo solo un messaggio
  // di conferma. ---------------------------------------------------------
  function handleSubmitEntry(formData: FormData) {
    setError(null);
    formData.set("email", email);
    startTransition(async () => {
      const result =
        props.mode === "edition"
          ? await createEditionEntryAction(formData)
          : await createGalleryEntryAction(props.section, formData);
      if (!result.ok) return setError(result.error);
      setSubmittedName(String(formData.get("names") ?? ""));
      setStep("success");
    });
  }

  return (
    <div>
      {step !== "success" && <Stepper step={step} />}

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
          {isEdition && (
            <Field label="Tipo di foto">
              <div className="flex gap-3">
                <RadioPill
                  name="type"
                  value="SINGLE"
                  label="Singola"
                  checked={photoType === "SINGLE"}
                  onChange={() => setPhotoType("SINGLE")}
                />
                <RadioPill
                  name="type"
                  value="GROUP"
                  label="Gruppo"
                  checked={photoType === "GROUP"}
                  onChange={() => setPhotoType("GROUP")}
                />
              </div>
            </Field>
          )}

          {isSingle && (
            <Field label="Facoltà">
              <select name="faculty" required defaultValue="" className={inputClass}>
                <option value="" disabled>
                  Seleziona la tua facoltà
                </option>
                {facultyOptions.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {isSingle ? (
            <Field label="Nome e cognome">
              <input
                type="text"
                name="names"
                required
                maxLength={80}
                placeholder="Mario Rossi"
                className={inputClass}
              />
            </Field>
          ) : (
            <Field label="Chi c'è nella foto">
              <textarea
                name="names"
                required
                rows={2}
                placeholder="Mario Rossi, Giulia Bianchi, Luca Verdi"
                className={inputClass}
              />
            </Field>
          )}

          {props.mode === "gallery" && props.section === "ANNUARIO_STORICO" && (
            <Field label={`Didascalia (max ${SINGLE_CAPTION_MAX} caratteri)`}>
              <input
                type="text"
                name="caption"
                required
                maxLength={SINGLE_CAPTION_MAX}
                placeholder="Al PN dal 2019, tra un caffè e un esame"
                className={inputClass}
              />
            </Field>
          )}

          {isEdition &&
            (isSingle ? (
              <Field label={`La tua frase (max ${SINGLE_CAPTION_MAX} caratteri)`}>
                <input
                  type="text"
                  name="caption"
                  required
                  maxLength={SINGLE_CAPTION_MAX}
                  placeholder="L'acciaio è duttile, l'ingegnere no."
                  className={inputClass}
                />
              </Field>
            ) : (
              <Field label="Didascalia (cosa succede, quando)">
                <input
                  type="text"
                  name="caption"
                  required
                  maxLength={280}
                  placeholder="Comitato colazioni, dicembre 2025"
                  className={inputClass}
                />
              </Field>
            ))}

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

          <SubmitButton pending={isPending}>{submitLabel}</SubmitButton>
        </form>
      )}

      {step === "success" && (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <CheckCircle2 className="text-unipi-500" size={36} />
          <h3 className="font-display text-lg font-semibold text-ink-950">
            Foto inviata!
          </h3>
          <p className="max-w-sm text-sm text-ink-700">
            {props.mode === "edition"
              ? `Grazie! La tua foto è in attesa di verifica: una volta approvata, finirà nell'Annuario ${props.year}.`
              : `Grazie ${submittedName.split(",")[0].trim()}. La tua foto è in attesa di approvazione: comparirà nella galleria non appena il team l'avrà verificata.`}
          </p>
          <button
            type="button"
            onClick={() => onUploaded()}
            className="mt-2 rounded-full bg-unipi-500 px-6 py-2.5 text-sm font-medium text-paper-50 transition hover:bg-unipi-600"
          >
            Fatto
          </button>
        </div>
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
  checked,
  onChange,
}: {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-full border border-ink-950/15 px-4 py-2 text-sm has-[:checked]:border-unipi-500 has-[:checked]:bg-unipi-100">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
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
