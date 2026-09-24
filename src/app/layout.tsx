// app/layout.tsx

import "./globals.css";

export const metadata = {
  title: "Annuario PN",
  description: "Annuario Università di Pisa - Polo Porta Nuova",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>
        <div className="min-h-screen bg-overlay flex flex-col">

          {/* HEADER INLINE */}
          <header className="bg-primary text-white shadow-md">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <h1 className="text-xl font-bold tracking-wide">
                Annuario PN
              </h1>

              <nav className="space-x-6 text-sm">
                <a href="#" className="hover:text-accent transition">
                  Home
                </a>
                <a href="#" className="hover:text-accent transition">
                  Hall of Fame
                </a>
                <a href="#" className="hover:text-accent transition">
                  Archivio
                </a>
              </nav>
            </div>
          </header>

          {/* CONTENUTO */}
          <main className="flex-1">
            {children}
          </main>

          {/* FOOTER INLINE */}
          <footer className="bg-primary text-white mt-16">
            <div className="container mx-auto px-4 py-6 text-center text-sm">
              © {new Date().getFullYear()} Università di Pisa — Polo Porta Nuova
            </div>
          </footer>

        </div>
      </body>
    </html>
  );
}