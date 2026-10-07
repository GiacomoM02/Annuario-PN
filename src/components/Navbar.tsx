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
        <div className="pt-4">
          {/* Stessa colonna del contenuto della home (max-w-xl centrata),
              così logo e testo restano allineati a ogni larghezza. */}
          <div className="mx-auto max-w-xl px-6 lg:px-10">
            <Affiliation light />
            <div className="mt-3 lg:mt-5">
              <Brand light />
            </div>
            <NavLinks tone="panel" pathname={pathname} className="mt-3 lg:hidden" />
          </div>
        </div>
        <div className="hidden justify-end px-10 pt-8 lg:flex">
          <NavLinks tone="photo" pathname={pathname} />
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-ink-950/10 bg-paper-50/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6 pb-4 pt-3">
        <Affiliation />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <Brand />
          <nav className="flex items-center gap-6 sm:gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm decoration-unipi-500 underline-offset-4 hover:text-ink-950 hover:underline ${
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
      className={`text-[0.625rem] font-medium uppercase tracking-[0.18em] ${
        light ? "text-hero-fg/55" : "text-ink-700/60"
      }`}
    >
      Università di Pisa — Polo Porta Nuova
    </p>
  );
}

function Brand({ light = false }: { light?: boolean }) {
  const size = light ? "text-2xl lg:text-[2rem]" : "text-lg";
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
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
            isActive(pathname, link.href) ? t.active : t.link
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
