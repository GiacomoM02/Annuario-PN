import Link from "next/link";
import { BookOpen, GraduationCap, Mail, Camera, ScrollText } from "lucide-react";
import { siteConfig } from "@/config/site";
import { CurrentEditionCard } from "@/components/CurrentEditionCard";

// Le date dell'edizione in corso cambiano nel tempo: rendiamo la home
// dinamica così il passaggio upload -> download avviene da solo, senza
// dover rifare un deploy quando scade la finestra di invio.
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className="lg:grid lg:min-h-screen lg:grid-cols-2">
      {/* Colonna sinistra: Hero blu Unipi con emblema, titolo e tasti. */}
      <section className="hero-panel relative flex items-center lg:items-start">
        <div className="relative mx-auto w-full max-w-xl px-6 pb-14 pt-24 lg:px-10 lg:pt-28">
          {/* Emblema "Annuario del PN" (Cherubino), sopra il logo testuale. */}
          <img
            src="/brand/cherubino-annuario.jpg"
            alt="Annuario del PN"
            className="h-16 w-16 rounded-full shadow-sm sm:h-20 sm:w-20 lg:h-28 lg:w-28"
          />

          {/* Logo Unipi: sostituisci /public/brand/unipi-logo.svg con il
              logo ufficiale (versione blu/scura, per contrasto sulla colonna
              color carta). */}
          <img
            src="/brand/unipi-logo.svg"
            alt="Università di Pisa"
            className="mt-3 h-8 w-auto opacity-95"
          />

          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-hero-accent/35 bg-hero-fg/5 px-3 py-1 text-[11px] font-medium text-hero-fg">
            <GraduationCap size={12} />
            Università di Pisa — Polo Porta Nuova
          </div>

          <h1 className="mt-4 font-display text-3xl font-semibold leading-[1.1] text-hero-fg sm:text-4xl">
            Volti, nomi e momenti che rendono unico{" "}
            <span className="italic text-hero-accent">il nostro polo.</span>
          </h1>
          <p className="mt-5 text-base text-hero-fg/80 sm:text-lg">
            {siteConfig.name} raccoglie, edizione dopo edizione, chi ha
            abitato questi corridoi. Sfoglia le edizioni passate o aggiungi
            oggi stesso la tua foto alla Hall of Fame.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/archivio"
              className="inline-flex items-center gap-2 rounded-full border-2 border-hero-fg/60 px-6 py-3 text-sm font-semibold text-hero-fg transition hover:border-hero-fg hover:bg-hero-fg/10 sm:text-base"
            >
              <BookOpen size={16} />
              Archivio
            </Link>
            <Link
              href="/hall-of-fame"
              className="inline-flex items-center gap-2 rounded-full border-2 border-hero-fg/60 px-6 py-3 text-sm font-semibold text-hero-fg transition hover:border-hero-fg hover:bg-hero-fg/10 sm:text-base"
            >
              <GraduationCap size={16} />
              Hall of Fame
            </Link>
            <Link
              href="/annuario-storico"
              className="inline-flex items-center gap-2 rounded-full border-2 border-hero-fg/60 px-6 py-3 text-sm font-semibold text-hero-fg transition hover:border-hero-fg hover:bg-hero-fg/10 sm:text-base"
            >
              <ScrollText size={16} />
              Annuario Storico
            </Link>
          </div>

          <div className="mt-10 border-t border-hero-fg/15 pt-6">
            <p className="text-xs font-medium uppercase tracking-wider text-hero-accent-deep">
              Come partecipare
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <MiniStep
                icon={<Mail size={14} />}
                title="Email istituzionale"
                body="@unipi.it o @studenti.unipi.it"
              />
              <MiniStep
                icon={<Camera size={14} />}
                title="Carica la tua foto"
                body="Singola o di gruppo, in due minuti."
              />
            </div>
          </div>
        </div>
      </section>
      {/* Colonna destra: la foto di sfondo (src/config/site.ts, di default
          /public/backgrounds/current.jpg) a piena vista. Solo un alone
          azzurro in basso rende leggibile la barra dell'edizione corrente. */}
      <section
        className="relative flex min-h-[420px] items-end overflow-hidden bg-hero-ink bg-cover bg-center lg:min-h-0"
        style={{ backgroundImage: `url(${siteConfig.backgroundImageUrl})` }}
      >
        <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-hero-band/95 via-hero-band/80 via-40% to-transparent lg:h-1/2 lg:via-25%" />
        <div className="relative w-full px-6 pb-8 lg:px-10 lg:pb-10">
          <CurrentEditionCard />
        </div>
      </section>

    </div>
  );
}

function MiniStep({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-hero-accent/15 text-hero-accent-deep">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-hero-fg">
          {title}
        </h3>
        <p className="mt-0.5 text-xs leading-snug text-hero-fg/65">{body}</p>
      </div>
    </div>
  );
}
