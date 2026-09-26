export const facultyOptions = [
  { value: "MEDICINA", label: "Medicina, Farmacia, Infermieristica, Psicologia" },
  { value: "INGEGNERIA", label: "Ingegneria" },
  { value: "UMANISTICHE", label: "Discipline umanistiche" },
  { value: "SCIENZE", label: "Scienze matematiche, informatiche, fisiche e della natura" },
  { value: "PERSONALE", label: "Personale universitario" },
] as const;

export type FacultyValue = (typeof facultyOptions)[number]["value"];
