// Indirizzo della versione ridotta di una foto delle gallerie, servita da
// src/app/foto/[id]/route.ts. Modulo separato (senza accesso al database)
// perché lo usano anche i componenti client.
export function publicPhotoSrc(id: string): string {
  return `/foto/${id}`;
}
