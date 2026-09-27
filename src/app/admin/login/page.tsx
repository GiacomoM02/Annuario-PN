import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Accesso admin — Annuario del PN",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="mx-auto max-w-sm px-6 py-20">
      <p className="eyebrow">Pannello di moderazione</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-unipi-700">
        Accesso admin
      </h1>
      <p className="mt-3 text-sm text-ink-700">
        Inserisci la password del pannello per approvare o eliminare le foto
        inviate.
      </p>
      <LoginForm />
    </div>
  );
}
