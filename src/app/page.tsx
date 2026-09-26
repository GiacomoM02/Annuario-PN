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
    <div className="lg:grid lg:min-h-[calc(100vh-73px)] lg:grid-cols-2">
      {/* Colonna sinistra: Hero con sfondo configurabile (src/config/site.ts).
          L'immagine copre solo questa colonna, non il pannello bianco a destra. */}
      <section
        className="relative flex items-center overflow-hidden bg-unipi-700 bg-cover bg-center"
        style={{ backgroundImage: `url(${siteConfig.backgroundImageUrl})` }}
      >
        {/* Overlay in due livelli: una tinta uniforme leggera (config-
            controllata) così la foto resta nitida, più un gradiente più
            scuro verso il basso/sinistra, dove sta il testo, per garantirne
            la leggibilità senza "spegnere" l'immagine nel resto dell'area. */}
        <div
          className="absolute inset-0 bg-unipi-900"
          style={{ opacity: siteConfig.backgroundOverlayOpacity }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-unipi-900/85 via-unipi-900/35 to-transparent" />
        <div className="relative mx-auto w-full max-w-xl px-6 py-14 lg:px-10">
          {/* Logo Unipi: sostituisci /public/brand/unipi-logo.svg con il
              logo ufficiale (versione chiara, per contrasto sul blu). */}
          <img
            src="/brand/unipi-logo.svg"
            alt="Università di Pisa"
            className="h-8 w-auto opacity-95"
          />

          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-unipi-400/40 bg-paper-50/10 px-3 py-1 text-[11px] font-medium text-paper-50">
            <GraduationCap size={12} />
            Università di Pisa — Polo Porta Nuova
          </div>

          <h1 className="mt-4 font-display text-3xl font-semibold leading-[1.1] text-paper-50 sm:text-4xl">
            Volti, nomi e momenti che rendono unico{" "}
            <span className="italic text-unipi-400">il nostro polo.</span>
          </h1>
          <p className="mt-5 text-base text-paper-100/85 sm:text-lg">
            {siteConfig.name} raccoglie, edizione dopo edizione, chi ha
            abitato questi corridoi. Sfoglia le edizioni passate o aggiungi
            oggi stesso la tua foto alla Hall of Fame.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/archivio"
              className="inline-flex items-center gap-2 rounded-full border-2 border-paper-50/70 px-6 py-3 text-sm font-semibold text-paper-50 transition hover:border-paper-50 hover:bg-paper-50/10 sm:text-base"
            >
              <BookOpen size={16} />
              Archivio
            </Link>
            <Link
              href="/hall-of-fame"
              className="inline-flex items-center gap-2 rounded-full border-2 border-paper-50/70 px-6 py-3 text-sm font-semibold text-paper-50 transition hover:border-paper-50 hover:bg-paper-50/10 sm:text-base"
            >
              <GraduationCap size={16} />
              Hall of Fame
            </Link>
            <Link
              href="/annuario-storico"
              className="inline-flex items-center gap-2 rounded-full border-2 border-paper-50/70 px-6 py-3 text-sm font-semibold text-paper-50 transition hover:border-paper-50 hover:bg-paper-50/10 sm:text-base"
            >
              <ScrollText size={16} />
              Annuario Storico
            </Link>
          </div>
        </div>
      </section>

      {/* Colonna destra: box dell'edizione corrente + "Come partecipare",
          impilati verticalmente, su sfondo bianco semplice. */}
      <section className="flex items-center bg-paper-50">
        <div className="mx-auto w-full max-w-xl px-6 py-10 lg:px-10">
          <CurrentEditionCard />

          <Link
            href="/archivio"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-ink-700 underline decoration-unipi-400 underline-offset-4 hover:text-unipi-700"
          >
            <BookOpen size={14} />
            Consulta le edizioni passate
          </Link>

          <div className="mt-8 border-t border-ink-950/10 pt-8">
            <p className="eyebrow">Come partecipare</p>
            <h2 className="mt-1 font-display text-xl font-semibold text-unipi-700">
              Due passaggi, due minuti.
            </h2>
            <div className="mt-5 space-y-4">
              <MiniStep
                icon={<Mail size={16} />}
                title="Email istituzionale"
                body="Deve terminare con @unipi.it o @studenti.unipi.it."
              />
              <MiniStep
                icon={<Camera size={16} />}
                title="Carica la tua foto"
                body="Singola o di gruppo: compare subito nella Hall of Fame."
              />
            </div>
          </div>
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
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-unipi-50 text-unipi-600">
        {icon}
      </div>
      <div>
        <h3 className="font-display text-sm font-semibold text-ink-950">
          {title}
        </h3>
        <p className="mt-0.5 text-sm leading-snug text-ink-700">{body}</p>
      </div>
    </div>
  );
}
