"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [{ href: "/", label: "Home" }];

export function Navbar() {
  const isHome = usePathname() === "/";

  // In home niente barra bianca: la navbar è trasparente e appoggiata
  // sopra le due colonne (logo sul blu a sinistra, link sulla foto a destra),
  // allineata al contenuto di ciascuna colonna.
  if (isHome) {
    return (
      <header className="absolute inset-x-0 top-0 z-20 lg:grid lg:grid-cols-2">
        <div className="flex items-center justify-between px-6 pt-8 lg:block lg:pt-10">
          <div className="lg:mx-auto lg:max-w-xl lg:px-10">
            <Brand light />
          </div>
          <NavLinks tone="panel" className="lg:hidden" />
        </div>
        <div className="hidden justify-end px-10 pt-10 lg:flex">
          <NavLinks tone="photo" />
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-ink-950/10 bg-paper-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Brand />
        <nav className="flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-ink-800 decoration-unipi-500 hover:text-ink-950 hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="group flex items-baseline gap-2">
      <span
        className={`font-display text-lg font-semibold ${
          light ? "text-hero-fg lg:text-3xl" : "text-ink-900"
        }`}
      >
        Annuario
      </span>
      <span
        className={`font-display text-lg italic ${
          light ? "text-hero-accent-deep lg:text-3xl" : "text-unipi-600"
        }`}
      >
        del PN
      </span>
    </Link>
  );
}

// Link in versione "pillola": scura e semitrasparente sopra la foto
// (desktop), chiara come il chip "Università di Pisa" sopra la colonna
// color carta (telefono, dove la foto sta più in basso).
const pillTone = {
  photo:
    "bg-hero-ink/55 text-hero-cream backdrop-blur hover:bg-hero-ink/75",
  panel:
    "border border-hero-fg/20 bg-hero-fg/5 text-hero-fg hover:bg-hero-fg/10",
};

function NavLinks({
  tone,
  className = "",
}: {
  tone: keyof typeof pillTone;
  className?: string;
}) {
  return (
    <nav className={`flex items-center gap-3 ${className}`}>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${pillTone[tone]}`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
