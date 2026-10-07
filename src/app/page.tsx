import Link from "next/link";
import { BookOpen, GraduationCap, Mail, Camera, ScrollText } from "lucide-react";
import { siteConfig } from "@/config/site";
import { CurrentEditionCard } from "@/components/CurrentEditionCard";

// Le date dell'edizione in corso cambiano nel tempo: rendiamo la home
// dinamica così il passaggio upload -> download avviene da solo, senza
// dover rifare un deploy quando scade la finestra di invio.
export const dynamic = "force-dynamic";

// Forma e dimensioni comuni ai pulsanti della home; i colori (pieno o solo
// contorno) si aggiungono pulsante per pulsante.
const heroButton =
  "inline-flex items-center gap-2 rounded-full border-2 px-6 py-3 text-sm font-semibold transition sm:text-base lg:px-6 lg:py-3 lg:text-base";

export default function HomePage() {
  return (
    // Da desktop la hero occupa uno schermo intero; se il contenuto non ci
    // sta (finestre molto basse) la hero si allunga invece di tagliarlo.
    <div className="lg:grid lg:min-h-[100svh] lg:grid-cols-2">
      {/* Colonna sinistra. L'emblema sta nella navbar, accanto al nome, così
          non è ripetuto qui. Da desktop il contenuto è diviso in due: titolo,
          testo e pulsanti centrati nello spazio libero (my-auto), e "Come
          partecipare" in fondo, allineato alla barra dell'edizione sulla foto
          (stesso margine inferiore: lg:pb-10 qui e nella colonna destra). */}
      <section className="hero-panel relative flex items-center lg:flex-col lg:items-stretch lg:pb-10 lg:pt-[8rem]">
        <div className="relative mx-auto w-full max-w-xl px-6 pb-14 pt-40 lg:flex lg:max-w-[45rem] lg:flex-1 lg:flex-col lg:px-10 lg:py-0">
          <div className="lg:my-auto">
            <h1 className="font-display text-3xl font-semibold leading-[1.1] text-hero-fg text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-[1.18] xl:text-[3.25rem]">
              Volti, nomi e momenti che rendono unico{" "}
              <span className="italic text-hero-accent">il nostro polo.</span>
            </h1>
            <p className="mt-5 text-base text-hero-fg/80 sm:text-lg lg:text-xl lg:leading-relaxed">
              {siteConfig.name} raccoglie, edizione dopo edizione, chi ha
              abitato questi corridoi. Sfoglia le edizioni passate, manda la
              tua foto per l'annuario o, se ti sei laureato, entra nella Hall
              of Fame.
            </p>

            {/* "Archivio" è l'azione principale (pulsante pieno), le altre
                due sono secondarie (solo contorno). */}
            <div className="mt-7 flex flex-wrap gap-3 lg:mt-8">
              <Link href="/archivio" className={`${heroButton} border-hero-fg bg-hero-fg text-hero-cream hover:bg-hero-fg/90`}>
                <BookOpen className="h-4 w-4 lg:h-5 lg:w-5" />
                Archivio
              </Link>
              <Link href="/hall-of-fame" className={`${heroButton} border-hero-fg/60 text-hero-fg hover:border-hero-fg hover:bg-hero-fg/10`}>
                <GraduationCap className="h-4 w-4 lg:h-5 lg:w-5" />
                Hall of Fame
              </Link>
              <Link href="/annuario-storico" className={`${heroButton} border-hero-fg/60 text-hero-fg hover:border-hero-fg hover:bg-hero-fg/10`}>
                <ScrollText className="h-4 w-4 lg:h-5 lg:w-5" />
                Annuario Storico
              </Link>
            </div>
          </div>

          {/* "Come partecipare" in una scheda azzurra chiara: richiama la
              barra azzurra sulla foto e ne è allineata in basso. */}
          <div className="mt-10 rounded-2xl bg-hero-accent/10 p-5 lg:mt-6 lg:px-6 lg:py-5">
            <p className="text-xs font-medium uppercase tracking-wider text-hero-accent-deep lg:text-sm">
              Come partecipare
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:mt-3 lg:gap-6">
              <MiniStep
                icon={<Mail className="h-3.5 w-3.5 lg:h-4 lg:w-4" />}
                title="Email istituzionale"
                body="@unipi.it o @studenti.unipi.it"
              />
              <MiniStep
                icon={<Camera className="h-3.5 w-3.5 lg:h-4 lg:w-4" />}
                title="Carica la tua foto"
                body="Per l'annuario: 1 singola e fino a 3 di gruppo."
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
      <div className="mt-0.5 flex h-7 w-7 shrink-0 lg:h-9 lg:w-9 items-center justify-center rounded-full bg-hero-accent/15 text-hero-accent-deep">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-hero-fg lg:text-base">
          {title}
        </h3>
        <p className="mt-0.5 text-xs leading-snug text-hero-fg/65 lg:text-sm">{body}</p>
      </div>
    </div>
  );
}
