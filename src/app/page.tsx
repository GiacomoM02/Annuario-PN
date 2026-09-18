import Link from "next/link";
import { ArrowRight, BookOpen, Camera, Download } from "lucide-react";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 sm:pt-24">
        <p className="eyebrow font-medium">Edizione 2025 / 26 aperta</p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl font-semibold leading-[1.05] text-ink-950 sm:text-6xl">
          Volti, nomi e momenti che rendono unico{" "}
          <span className="italic text-brass-600">il nostro polo.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-ink-700">
          L'Annuario del PN raccoglie, edizione dopo edizione, chi ha
          abitato questi corridoi. Sfoglia le edizioni passate o aggiungi
          oggi stesso la tua foto alla Hall of Fame.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/hall-of-fame"
            className="inline-flex items-center gap-2 rounded-full bg-ink-950 px-6 py-3 text-sm font-medium text-parchment-50 transition hover:bg-ink-900"
          >
            <Camera size={16} />
            Vai alla Hall of Fame
          </Link>
          <Link
            href="/archivio"
            className="inline-flex items-center gap-2 rounded-full border border-ink-950/20 px-6 py-3 text-sm font-medium text-ink-900 transition hover:border-ink-950/40"
          >
            <BookOpen size={16} />
            Consulta l'archivio
          </Link>
          <Link
            href="/archivio#download"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-ink-700 underline decoration-brass-500 underline-offset-4 hover:text-ink-950"
          >
            <Download size={16} />
            Scarica il PDF
          </Link>
        </div>
      </section>

      <div className="rule" />

      {/* Come funziona */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="eyebrow">Come partecipare</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-ink-950">
          Tre passaggi, cinque minuti.
        </h2>
        <div className="mt-10 grid gap-10 sm:grid-cols-3">
          <Step
            n="1"
            title="Verifica la tua email"
            body="Inserisci il tuo indirizzo @unipi.it o @studenti.unipi.it e ricevi un codice a 6 cifre."
          />
          <Step
            n="2"
            title="Carica la tua foto"
            body="Singola o di gruppo, con nomi e una didascalia. Nessuna email viene mai salvata."
          />
          <Step
            n="3"
            title="Compare subito"
            body="La tua scheda entra nella Hall of Fame in tempo reale, senza bisogno di ricaricare la pagina."
          />
        </div>
        <Link
          href="/hall-of-fame"
          className="mt-10 inline-flex items-center gap-1.5 text-sm font-medium text-brass-600 hover:text-brass-500"
        >
          Aggiungi la tua foto ora <ArrowRight size={14} />
        </Link>
      </section>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="border-l-2 border-brass-500 pl-5">
      <span className="font-display text-2xl italic text-brass-600">{n}</span>
      <h3 className="mt-2 font-display text-lg font-semibold text-ink-950">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-700">{body}</p>
    </div>
  );
}
