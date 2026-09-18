import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/archivio", label: "Archivio" },
  { href: "/hall-of-fame", label: "Hall of Fame" },
];

export function Navbar() {
  return (
    <header className="border-b border-ink-950/10 bg-parchment-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-display text-lg font-semibold text-ink-900">
            Annuario
          </span>
          <span className="font-display text-lg italic text-brass-600">
            del PN
          </span>
        </Link>
        <nav className="flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-ink-800 decoration-brass-500 hover:text-ink-950 hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
