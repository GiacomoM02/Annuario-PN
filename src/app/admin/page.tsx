import type { Metadata } from "next";
import Link from "next/link";
import { and, count, desc, eq } from "drizzle-orm";
import { Check, ChevronLeft, ChevronRight, LogOut, RotateCcw, Users } from "lucide-react";
import { db, schema } from "@/lib/db";
import { facultyOptions } from "@/lib/faculties";
import {
  approveEntryAction,
  deleteEntryAction,
  logoutAction,
  setPendingEntryAction,
} from "@/lib/admin-actions";
import { DeleteButton } from "./DeleteButton";
import { SiteSettingsForm } from "./SiteSettingsForm";
import { editions } from "@/config/editions";
import { getDownloadEdition, getSiteSettings, isSubmissionOpen } from "@/lib/site-settings";
import { dateToRomeLocal, formatRomeDate } from "@/lib/rome-time";
import { editionLabel } from "@/lib/edition-label";
import type { HallOfFameEntry } from "../../../drizzle/schema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pannello admin — Annuario del PN",
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

// Foto per pagina: 4 colonne x 2 righe, così da computer il pannello sta
// tutto in una schermata (le schede si allungano o si accorciano con lo
// schermo). Le altre foto si sfogliano con le frecce.
const PAGE_SIZE = 8;

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
  searchParams: Promise<{ section?: string; status?: string; p?: string }>;
}) {
  const searchParams = await props.searchParams;
  const section =
    SECTIONS.find((s) => s.value === searchParams.section)?.value ?? "HALL_OF_FAME";
  const status =
    STATUSES.find((s) => s.value === searchParams.status)?.value ?? "PENDING";

  const counts = await db
    .select({
      section: schema.hallOfFameEntries.section,
      status: schema.hallOfFameEntries.status,
      n: count(),
    })
    .from(schema.hallOfFameEntries)
    .groupBy(schema.hallOfFameEntries.section, schema.hallOfFameEntries.status);

  const countOf = (sec: Section, st?: Status) =>
    counts
      .filter((c) => c.section === sec && (!st || c.status === st))
      .reduce((sum, c) => sum + c.n, 0);

  const total = countOf(section, status);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const requested = Number.parseInt(searchParams.p ?? "1", 10);
  const page = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), pages) : 1;

  const entries = await db
    .select()
    .from(schema.hallOfFameEntries)
    .where(
      and(
        eq(schema.hallOfFameEntries.section, section),
        eq(schema.hallOfFameEntries.status, status)
      )
    )
    .orderBy(desc(schema.hallOfFameEntries.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  const href = (sec: Section, st: Status, p = 1) =>
    `/admin?section=${sec}&status=${st}${p > 1 ? `&p=${p}` : ""}`;

  // Da computer (lg) il pannello occupa esattamente lo spazio sotto la barra
  // del sito, senza scorrere: vedi .admin-screen in globals.css.
  return (
    <div className="admin-screen page-container flex flex-col gap-6 py-6 lg:min-h-0 lg:flex-1 lg:flex-row lg:gap-8 lg:py-5">
      {/* Colonna sinistra: titolo e stato del sito */}
      <aside className="flex shrink-0 flex-col gap-4 lg:w-[23rem]">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Pannello admin</p>
            <h1 className="font-display text-2xl font-semibold text-unipi-700">Gestione del sito</h1>
          </div>
          <form action={logoutAction}>
            <button className="inline-flex items-center gap-1.5 text-sm text-ink-700 hover:text-ink-950">
              <LogOut size={14} />
              Esci
            </button>
          </form>
        </div>
        <SiteSettingsPanel />
      </aside>

      {/* Colonna destra: moderazione delle foto */}
      <section className="flex min-w-0 flex-1 flex-col lg:min-h-0">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="mr-2 font-display text-lg font-semibold text-unipi-700">Moderazione delle foto</h2>
            {SECTIONS.map((s) => {
              const pending = countOf(s.value, "PENDING");
              const active = s.value === section;
              return (
                <Link
                  key={s.value}
                  href={href(s.value, status)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
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
          <div className="flex gap-5 text-sm">
            {STATUSES.map((s) => (
              <Link
                key={s.value}
                href={href(section, s.value)}
                className={`border-b-2 pb-1 ${
                  s.value === status
                    ? "border-unipi-500 font-semibold text-unipi-700"
                    : "border-transparent text-ink-700 hover:text-ink-950"
                }`}
              >
                {s.label} ({countOf(section, s.value)})
              </Link>
            ))}
          </div>
        </div>

        {section === "ARCHIVIO" && (
          <p className="mt-2 text-xs text-ink-600">
            Le foto dell&apos;Archivio non compaiono sul sito: quelle approvate
            finiscono nel PDF dell&apos;edizione (npm run generate:pdf).
          </p>
        )}

        {entries.length === 0 ? (
          <div className="mt-4 flex flex-1 items-center justify-center rounded-lg border border-dashed border-unipi-200 py-16 text-center text-ink-600">
            Nessuna foto {status === "PENDING" ? "in attesa" : "approvata"} in questa sezione.
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:min-h-0 lg:flex-1 lg:grid-cols-4 lg:grid-rows-2">
            {entries.map((entry) => (
              <AdminEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}

        {pages > 1 && (
          <nav className="mt-3 flex items-center justify-center gap-4 text-sm text-ink-700" aria-label="Pagine">
            <PageLink href={page > 1 ? href(section, status, page - 1) : null} label="Pagina precedente">
              <ChevronLeft size={16} />
            </PageLink>
            <span>
              Pagina {page} di {pages} · {total} foto
            </span>
            <PageLink href={page < pages ? href(section, status, page + 1) : null} label="Pagina successiva">
              <ChevronRight size={16} />
            </PageLink>
          </nav>
        )}
      </section>
    </div>
  );
}

function PageLink({ href, label, children }: { href: string | null; label: string; children: React.ReactNode }) {
  const cls = "inline-flex h-8 w-8 items-center justify-center rounded-full border border-ink-950/15";
  return href ? (
    <Link href={href} aria-label={label} className={`${cls} hover:bg-ink-950/5`}>
      {children}
    </Link>
  ) : (
    <span aria-hidden="true" className={`${cls} opacity-30`}>
      {children}
    </span>
  );
}

function AdminEntryCard({ entry }: { entry: HallOfFameEntry }) {
  const faculty = facultyOptions.find((f) => f.value === entry.faculty);

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-unipi-100 bg-paper-50 shadow-sm lg:min-h-0">
      <a
        href={`/admin/foto/${entry.id}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Apri l'immagine originale"
        className="relative block aspect-[4/5] bg-unipi-700 lg:aspect-auto lg:min-h-0 lg:flex-1"
      >
        <img
          src={`/admin/foto/${entry.id}`}
          alt={entry.names}
          loading="lazy"
          className="h-full w-full object-cover lg:absolute lg:inset-0 lg:object-contain"
        />
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
              className="absolute right-2 top-2 h-7 w-7 rounded-full ring-2 ring-paper-50/80"
            />
          )
        )}
      </a>
      <div className="shrink-0 px-3 pt-2">
        <h3 className="truncate font-display text-sm font-semibold text-unipi-700" title={entry.names}>
          {entry.names}
        </h3>
        {entry.caption && (
          <p className="truncate text-xs italic text-ink-700" title={entry.caption}>
            {entry.caption}
          </p>
        )}
        <p className="truncate text-[11px] text-ink-500">
          {faculty ? `${faculty.label} · ` : ""}
          {entry.editionYear ? `Edizione ${editionLabel(entry.editionYear)} · ` : ""}
          {formatDate(entry.createdAt)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2 px-3 pb-2.5 pt-2">
        {entry.status === "PENDING" ? (
          <form action={approveEntryAction.bind(null, entry.id)}>
            <button className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-unipi-500 px-3 py-1 text-xs font-medium text-paper-50 transition hover:bg-unipi-600">
              <Check size={13} />
              Approva
            </button>
          </form>
        ) : (
          <form action={setPendingEntryAction.bind(null, entry.id)}>
            <button className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-ink-950/15 px-3 py-1 text-xs font-medium text-ink-800 transition hover:bg-ink-950/5">
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

// Riquadro "Stato del sito": legge le impostazioni attuali e descrive in
// chiaro cosa vede adesso un visitatore.
async function SiteSettingsPanel() {
  const s = await getSiteSettings();
  const now = new Date();
  const edition = getDownloadEdition(s);
  const download = edition
    ? `la Home propone il download di «${edition.title}» (${editionLabel(edition.year)}).`
    : "nessuna edizione da scaricare.";
  const closes = formatRomeDate(s.closesAt, true);
  const label = editionLabel(s.submissionYear);

  // Edizioni proponibili: dall'anno in corso (o da quella già scelta) alle
  // tre successive.
  const thisYear = Number(new Intl.DateTimeFormat("en", { timeZone: "Europe/Rome", year: "numeric" }).format(now));
  const first = Math.min(thisYear, s.submissionYear);
  const last = Math.max(thisYear + 3, s.submissionYear);
  const yearOptions = Array.from({ length: last - first + 1 }, (_, i) => first + i);

  let status: string;
  let tone: "open" | "waiting" | "closed";
  if (isSubmissionOpen(s, now)) {
    status = `invii APERTI per l'Annuario ${label}, fino al ${closes}.`;
    tone = "open";
  } else if (s.mode === "SUBMISSIONS" && now < s.opensAt) {
    status = `invii per l'Annuario ${label} programmati dal ${formatRomeDate(s.opensAt, true)} al ${closes}. Fino ad allora ${download}`;
    tone = "waiting";
  } else if (s.mode === "SUBMISSIONS") {
    status = `invii per l'Annuario ${label} chiusi il ${closes}: ${download}`;
    tone = "closed";
  } else {
    status = `invii chiusi: ${download}`;
    tone = "closed";
  }

  return (
    <SiteSettingsForm
      mode={s.mode}
      submissionYear={s.submissionYear}
      yearOptions={yearOptions}
      opensAt={dateToRomeLocal(s.opensAt)}
      closesAt={dateToRomeLocal(s.closesAt)}
      downloadYear={s.downloadYear}
      editions={editions.map((e) => ({ year: e.year, title: e.title }))}
      status={status}
      statusTone={tone}
    />
  );
}
