export default function Footer() {
  return (
    <footer className="bg-primary text-white mt-16">
      <div className="container mx-auto px-4 py-6 text-center text-sm">
        © {new Date().getFullYear()} Università di Pisa — Polo Porta Nuova
      </div>
    </footer>
  );
}
