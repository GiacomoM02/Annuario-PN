export function Footer() {
  return (
    <footer className="border-t border-ink-950/10 bg-ink-950 text-paper-100">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-lg italic">Annuario del PN</p>
            <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-unipi-400/50 bg-unipi-500/20 px-2.5 py-0.5 text-[10px] font-medium text-paper-50">
              Università di Pisa — Polo Porta Nuova
            </span>
          </div>
          <p className="max-w-md text-sm text-paper-100/70">
            Attività non ufficiale realizzata dagli abitanti del PN. Per
            segnalazioni, scrivi a{" "}
            <a
              href="mailto:pn.leggenda@outlook.it"
              className="underline decoration-unipi-400"
            >
              pn.leggenda@outlook.it
            </a>
            .
          </p>
        </div>
        <div className="mt-6 text-xs text-paper-100/50">
          Le email istituzionali usate per la verifica non vengono mai
          salvate: servono solo a confermare che chi carica una foto fa
          parte dell'Università di Pisa.
        </div>
      </div>
    </footer>
  );
}
