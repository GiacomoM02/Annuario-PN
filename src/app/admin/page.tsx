import type { Metadata } from "next";
import Link from "next/link";
import { and, count, desc, eq } from "drizzle-orm";
import { Check, LogOut, RotateCcw, Users } from "lucide-react";
import { db, schema } from "@/lib/db";
import { facultyOptions } from "@/lib/faculties";
import {
  approveEntryAction,
  deleteEntryAction,
  logoutAction,
  setPendingEntryAction,
} from "@/lib/admin-actions";
import { DeleteButton } from "./DeleteButton";
import type { HallOfFameEntry } from "../../../drizzle/schema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Moderazione — Annuario del PN",
  robots: { index: false, follow: false },
};

type Section = HallOfFameEntry["section"];
type Status = HallOfFameEntry["status"];

const SECTIONS: { value: Section; label: string }[] = [
  { value: "HALL_OF_FAME", label: "Hall of Fame" },
  { value: "ANNUARIO_STORICO", label: "Annuario Storico" },
  { value: "ARCHIVIO", label: "Archivio (annuario)" },
];
const STATUSES: { value: Status; label: string }[] = [
  { value: "PENDING", label: "In attesa" },
  { value: "APPROVED", label: "Approvate" },
];

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export default async function AdminPage(props: {
  searchParams: Promise<{ section?: string; status?: string }>;
}) {
  const searchParams = await props.searchParams;
  const section =
    SECTIONS.find((s) => s.value === searchParams.section)?.value ?? "HALL_OF_FAME";
  const status =
    STATUSES.find((s) => s.value === searchParams.status)?.value ?? "PENDING";

  const [entries, counts] = await Promise.all([
    db
      .select()
      .from(schema.hallOfFameEntries)
      .where(
        and(
          eq(schema.hallOfFameEntries.section, section),
          eq(schema.hallOfFameEntries.status, status)
        )
      )
      .orderBy(desc(schema.hallOfFameEntries.createdAt))
      .limit(200),
    db
      .select({
        section: schema.hallOfFameEntries.section,
        status: schema.hallOfFameEntries.status,
        n: count(),
      })
      .from(schema.hallOfFameEntries)
      .groupBy(schema.hallOfFameEntries.section, schema.hallOfFameEntries.status),
  ]);

  const countOf = (sec: Section, st?: Status) =>
    counts
      .filter((c) => c.section === sec && (!st || c.status === st))
      .reduce((sum, c) => sum + c.n, 0);

  const href = (sec: Section, st: Status) => `/admin?section=${sec}&status=${st}`;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Pannello di moderazione</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-unipi-700">
            Foto inviate
          </h1>
        </div>
        <form action={logoutAction}>
          <button className="inline-flex items-center gap-1.5 text-sm text-ink-700 hover:text-ink-950">
            <LogOut size={14} />
            Esci
          </button>
        </form>
      </div>

      {/* Sezioni, con il numero di foto in attesa */}
      <div className="mt-8 flex flex-wrap gap-2">
        {SECTIONS.map((s) => {
          const pending = countOf(s.value, "PENDING");
          const active = s.value === section;
          return (
            <Link
              key={s.value}
              href={href(s.value, status)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                active
                  ? "border-unipi-700 bg-unipi-700 text-paper-50"
                  : "border-ink-950/15 text-ink-800 hover:bg-ink-950/5"
              }`}
            >
              {s.label}
              {pending > 0 && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    active ? "bg-paper-50 text-unipi-700" : "bg-unipi-500 text-paper-50"
                  }`}
                  title="In attesa"
                >
                  {pending}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Stato */}
      <div className="mt-4 flex gap-5 border-b border-ink-950/10 text-sm">
        {STATUSES.map((s) => (
          <Link
            key={s.value}
            href={href(section, s.value)}
            className={`-mb-px border-b-2 pb-2 ${
              s.value === status
                ? "border-unipi-500 font-semibold text-unipi-700"
                : "border-transparent text-ink-700 hover:text-ink-950"
            }`}
          >
            {s.label} ({countOf(section, s.value)})
          </Link>
        ))}
      </div>

      {section === "ARCHIVIO" && (
        <p className="mt-4 text-sm text-ink-700">
          Le foto dell&apos;Archivio non compaiono sul sito: quelle approvate
          finiscono nel PDF dell&apos;edizione (npm run generate:pdf).
        </p>
      )}

      {entries.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-unipi-200 py-16 text-center text-ink-600">
          Nessuna foto {status === "PENDING" ? "in attesa" : "approvata"} in questa sezione.
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <AdminEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}

function AdminEntryCard({ entry }: { entry: HallOfFameEntry }) {
  const faculty = facultyOptions.find((f) => f.value === entry.faculty);

  return (
    <article className="overflow-hidden rounded-lg border border-unipi-100 bg-paper-50 shadow-sm">
      <a href={`/admin/foto/${entry.id}`} target="_blank" rel="noopener noreferrer" title="Apri l'immagine originale">
        <div className="relative aspect-[4/5] bg-unipi-700">
          <img src={`/admin/foto/${entry.id}`} alt={entry.names} loading="lazy" className="h-full w-full object-cover" />
          {entry.type === "GROUP" ? (
            <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-unipi-700/90 px-2.5 py-1 text-[11px] font-medium text-paper-50">
              <Users size={12} />
              Gruppo
            </span>
          ) : (
            faculty && (
              <img
                src={faculty.icon}
                alt={faculty.label}
                title={faculty.label}
                className="absolute right-2 top-2 h-8 w-8 rounded-full ring-2 ring-paper-50/80"
              />
            )
          )}
        </div>
      </a>
      <div className="space-y-1 p-4">
        <h2 className="font-display text-base font-semibold leading-snug text-unipi-700">
          {entry.names}
        </h2>
        {entry.caption && <p className="text-sm italic text-ink-700">{entry.caption}</p>}
        <p className="text-xs text-ink-500">
          {faculty ? `${faculty.label} · ` : ""}
          {entry.editionYear ? `Edizione ${entry.editionYear} · ` : ""}
          {formatDate(entry.createdAt)}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-ink-950/10 px-4 py-3">
        {entry.status === "PENDING" ? (
          <form action={approveEntryAction.bind(null, entry.id)}>
            <button className="inline-flex items-center gap-1.5 rounded-full bg-unipi-500 px-3.5 py-1.5 text-xs font-medium text-paper-50 transition hover:bg-unipi-600">
              <Check size={13} />
              Approva
            </button>
          </form>
        ) : (
          <form action={setPendingEntryAction.bind(null, entry.id)}>
            <button className="inline-flex items-center gap-1.5 rounded-full border border-ink-950/15 px-3 py-1.5 text-xs font-medium text-ink-800 transition hover:bg-ink-950/5">
              <RotateCcw size={13} />
              Rimetti in attesa
            </button>
          </form>
        )}
        <form action={deleteEntryAction.bind(null, entry.id)} className="ml-auto">
          <DeleteButton />
        </form>
      </div>
    </article>
  );
}
