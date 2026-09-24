export function Footer() {
  return (
    <footer className="border-t border-ink-950/10 bg-ink-950 text-parchment-100">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-lg italic">Annuario del PN</p>
          <p className="max-w-md text-sm text-parchment-100/70">
            Attività non ufficiale realizzata dagli abitanti del PN. Per
            segnalazioni, scrivi a{" "}
            <a
              href="mailto:pn.leggenda@outlook.it"
              className="underline decoration-brass-400"
            >
              pn.leggenda@outlook.it
            </a>
            .
          </p>
        </div>
        <div className="mt-6 text-xs text-parchment-100/50">
          Le email istituzionali usate per la verifica non vengono mai
          salvate: servono solo a confermare che chi carica una foto fa
          parte dell'Università di Pisa.
        </div>
      </div>
    </footer>
  );
}
