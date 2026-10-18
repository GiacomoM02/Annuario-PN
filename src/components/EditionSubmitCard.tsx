import { EditionSubmitButton } from "@/components/EditionSubmitButton";
import { editionLabel } from "@/lib/edition-label";

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
  return (
    <div className="rounded-lg border border-unipi-100 bg-unipi-50 p-6 sm:flex sm:items-center sm:justify-between sm:gap-8">
      <div>
        <p className="eyebrow">Invii aperti fino al {closesOn}</p>
        <h2 className="mt-1 font-display text-xl font-semibold text-unipi-700 lg:text-2xl">
          Manda la tua foto per l'Annuario {editionLabel(year)}
        </h2>
        <p className="mt-2 max-w-xl text-sm text-ink-700 lg:text-base">
          Ognuno può mandare {maxSingle === 1 ? "una foto singola" : `${maxSingle} foto singole`}{" "}
          (con la tua facoltà e una frase) e fino a {maxGroup} foto di gruppo.
          Dopo la verifica finiranno nel PDF dell'edizione.
        </p>
      </div>
      <EditionSubmitButton year={year} className="btn-primary mt-5 sm:mt-0" />
    </div>
  );
}
