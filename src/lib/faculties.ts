export const facultyOptions = [
  { value: "MEDICINA", label: "Medicina, Farmacia, Infermieristica, Psicologia", icon: "/icons/facolta/MEDICINA.png" },
  { value: "INGEGNERIA", label: "Ingegneria", icon: "/icons/facolta/INGEGNERIA.png" },
  { value: "UMANISTICHE", label: "Discipline umanistiche", icon: "/icons/facolta/UMANISTICHE.png" },
  { value: "SCIENZE", label: "Scienze matematiche, informatiche, fisiche e della natura", icon: "/icons/facolta/SCIENZE.png" },
  { value: "PERSONALE", label: "Personale universitario", icon: "/icons/facolta/PERSONALE.png" },
] as const;

export type FacultyValue = (typeof facultyOptions)[number]["value"];

export function getFacultyIcon(value: string | null): string | null {
  return facultyOptions.find((f) => f.value === value)?.icon ?? null;
}
