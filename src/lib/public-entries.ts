import { and, desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";

// Sezioni visibili sul sito. L'Archivio NON è tra queste: le sue foto
// finiscono solo nel PDF dell'edizione.
export const PUBLIC_SECTIONS = ["HALL_OF_FAME", "ANNUARIO_STORICO"] as const;
export type GallerySection = (typeof PUBLIC_SECTIONS)[number];

export function isPublicSection(value: unknown): value is GallerySection {
  return (PUBLIC_SECTIONS as readonly unknown[]).includes(value);
}

// Solo i campi che servono alle gallerie: niente stato di moderazione,
// anno dell'edizione o impronta dell'email.
const t = schema.hallOfFameEntries;
const publicColumns = {
  id: t.id,
  faculty: t.faculty,
  names: t.names,
  caption: t.caption,
  imageUrl: t.imageUrl,
  createdAt: t.createdAt,
};

export type PublicEntry = {
  id: string;
  faculty: (typeof t.$inferSelect)["faculty"];
  names: string;
  caption: string | null;
  imageUrl: string;
  createdAt: Date;
};

/** Schede APPROVATE di una galleria pubblica (mai PENDING, mai Archivio). */
export async function getApprovedEntries(section: GallerySection): Promise<PublicEntry[]> {
  if (!isPublicSection(section)) return [];
  return db
    .select(publicColumns)
    .from(t)
    .where(and(eq(t.section, section), eq(t.status, "APPROVED")))
    .orderBy(desc(t.createdAt))
    .limit(1000);
}
