"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/archivio", label: "Archivio" },
  { href: "/hall-of-fame", label: "Hall of Fame" },
];

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  // In home niente barra bianca: la navbar è trasparente e appoggiata
  // sopra le due colonne (logo sul bianco a sinistra, link sulla foto a
  // destra), allineata al contenuto di ciascuna colonna. Da telefono i link
  // vanno su una riga sotto il logo.
  if (isHome) {
    return (
      <header className="absolute inset-x-0 top-0 z-20 lg:grid lg:grid-cols-2">
        <div className="pt-4 lg:pt-8">
          {/* Stessa colonna del contenuto della home (max-w centrata), così
              logo e testo restano allineati a ogni larghezza. */}
          <div className="mx-auto max-w-xl px-6 lg:max-w-[45rem] lg:px-10">
            {/* Marchio: emblema accanto al nome (l'emblema non si ripete
                più nella colonna sotto). */}
            <div className="flex items-center gap-3 lg:gap-4">
              <img src="/brand/cherubino-annuario.jpg" alt="" className="h-12 w-12 rounded-full shadow-sm lg:h-16 lg:w-16" />
              <div>
                <Affiliation light />
                <div className="mt-1">
                  <Brand light />
                </div>
              </div>
            </div>
            <NavLinks tone="panel" pathname={pathname} className="mt-3 lg:hidden" />
          </div>
        </div>
        <div className="hidden justify-end px-10 pt-8 lg:flex">
          {/* Alta quanto l'emblema (h-16): la pillola resta centrata sul logo. */}
          <div className="flex h-16 items-center">
            <NavLinks tone="photo" pathname={pathname} />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-ink-950/10 bg-paper-50/90 backdrop-blur">
      <div className="page-container pb-4 pt-3">
        <Affiliation />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <Brand />
          <nav className="flex items-center gap-6 sm:gap-8 lg:gap-10">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm decoration-unipi-500 lg:text-lg underline-offset-4 hover:text-ink-950 hover:underline ${
                  isActive(pathname, link.href)
                    ? "font-semibold text-unipi-700 underline"
                    : "text-ink-800"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

// Micro-testo in cima alla pagina, subito sotto la linea blu Unipi del
// layout: dice a colpo d'occhio dove siamo e bilancia lo spazio sopra il
// titolo "Annuario del PN".
function Affiliation({ light = false }: { light?: boolean }) {
  return (
    <p
      className={`text-[0.625rem] font-medium uppercase lg:text-xs tracking-[0.18em] ${
        light ? "text-hero-fg/55" : "text-ink-700/60"
      }`}
    >
      Università di Pisa — Polo Porta Nuova
    </p>
  );
}

function Brand({ light = false }: { light?: boolean }) {
  const size = light ? "text-2xl lg:text-[2.25rem]" : "text-lg lg:text-2xl";
  return (
    <Link href="/" className="group flex items-baseline gap-2">
      <span
        className={`font-display font-semibold ${size} ${
          light ? "text-hero-fg" : "text-ink-900"
        }`}
      >
        Annuario
      </span>
      <span
        className={`font-display italic ${size} ${
          light ? "text-hero-accent-deep" : "text-unipi-600"
        }`}
      >
        del PN
      </span>
    </Link>
  );
}

// Link della home raccolti in una "pillola": scura e semitrasparente sopra
// la foto (desktop), chiara sopra la colonna bianca (telefono). La pagina
// corrente è evidenziata.
const pillTone = {
  photo: {
    group: "bg-hero-ink/55 backdrop-blur",
    link: "text-hero-cream hover:bg-hero-cream/15",
    active: "bg-hero-cream text-hero-ink",
  },
  panel: {
    group: "border border-hero-fg/20 bg-hero-fg/5",
    link: "text-hero-fg hover:bg-hero-fg/10",
    active: "bg-hero-fg text-hero-cream",
  },
};

function NavLinks({
  tone,
  pathname,
  className = "",
}: {
  tone: keyof typeof pillTone;
  pathname: string;
  className?: string;
}) {
  const t = pillTone[tone];
  return (
    <nav className={`inline-flex items-center gap-1 rounded-full p-1 ${t.group} ${className}`}>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition lg:px-5 lg:py-2.5 lg:text-base ${
            isActive(pathname, link.href) ? t.active : t.link
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
