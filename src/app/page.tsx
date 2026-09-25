import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap } from "lucide-react";
import { siteConfig } from "@/config/site";
import { CurrentEditionCard } from "@/components/CurrentEditionCard";

// Le date dell'edizione in corso cambiano nel tempo: rendiamo la home
// dinamica così il passaggio upload -> download avviene da solo, senza
// dover rifare un deploy quando scade la finestra di invio.
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div>
      {/* Hero con sfondo configurabile: cambia src/config/site.ts */}
      <section
        className="relative overflow-hidden bg-unipi-700 bg-cover bg-center"
        style={{ backgroundImage: `url(${siteConfig.backgroundImageUrl})` }}
      >
        <div
          className="absolute inset-0 bg-unipi-700"
          style={{ opacity: siteConfig.backgroundOverlayOpacity }}
        />
        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-16 sm:pt-24">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-unipi-400/40 bg-paper-50/10 px-3 py-1 text-[11px] font-medium text-paper-50">
            <GraduationCap size={12} />
            Università di Pisa — Polo Porta Nuova
          </div>

          <h1 className="mt-4 max-w-3xl font-display text-5xl font-semibold leading-[1.05] text-paper-50 sm:text-6xl">
            Volti, nomi e momenti che rendono unico{" "}
            <span className="italic text-unipi-400">il nostro polo.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-paper-100/85">
            {siteConfig.name} raccoglie, edizione dopo edizione, chi ha
            abitato questi corridoi. Sfoglia le edizioni passate o aggiungi
            oggi stesso la tua foto alla Hall of Fame.
          </p>

          <div className="mt-10 max-w-xl">
            <CurrentEditionCard />
          </div>

          <Link
            href="/archivio"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-paper-100/85 underline decoration-unipi-400 underline-offset-4 hover:text-paper-50"
          >
            <BookOpen size={14} />
            Consulta le edizioni passate
          </Link>
        </div>
      </section>

      {/* Come funziona */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="eyebrow">Come partecipare</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-unipi-700">
          Due passaggi, due minuti.
        </h2>
        <div className="mt-10 grid gap-10 sm:grid-cols-2">
          <Step
            n="1"
            title="Scrivi la tua email istituzionale"
            body="Deve terminare con @unipi.it o @studenti.unipi.it: è il modo con cui riconosciamo chi fa parte del PN."
          />
          <Step
            n="2"
            title="Carica la tua foto"
            body="Singola o di gruppo, con nomi e una didascalia. Compare subito nella Hall of Fame, senza bisogno di ricaricare la pagina."
          />
        </div>
        <Link
          href="/hall-of-fame"
          className="mt-10 inline-flex items-center gap-1.5 text-sm font-medium text-unipi-600 hover:text-unipi-500"
        >
          Aggiungi la tua foto ora <ArrowRight size={14} />
        </Link>
      </section>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="border-l-2 border-unipi-500 pl-5">
      <span className="font-display text-2xl italic text-unipi-600">{n}</span>
      <h3 className="mt-2 font-display text-lg font-semibold text-ink-950">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-700">{body}</p>
    </div>
  );
}
