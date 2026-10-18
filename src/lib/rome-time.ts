// Date e ore del pannello admin sono sempre nell'ora italiana (Europe/Rome,
// con il cambio ora legale/solare), anche se il server gira in UTC.

const TZ = "Europe/Rome";

// Scarto in minuti tra l'ora di Roma e UTC in un dato istante.
function romeOffsetMinutes(date: Date): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value])
  );
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return Math.round((asUtc - date.getTime()) / 60000);
}

/** "2026-10-14T09:30" (ora di Roma, come da <input type="datetime-local">) → Date. */
export function romeLocalToDate(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!m) return null;
  const guess = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  // Due passaggi: lo scarto dipende dall'istante (ora legale o solare).
  let t = guess - romeOffsetMinutes(new Date(guess)) * 60000;
  t = guess - romeOffsetMinutes(new Date(t)) * 60000;
  return new Date(t);
}

/** Date → "2026-10-14T09:30" nell'ora di Roma, per riempire il campo del form. */
export function dateToRomeLocal(date: Date): string {
  const local = new Date(date.getTime() + romeOffsetMinutes(date) * 60000);
  return local.toISOString().slice(0, 16);
}

/** Data leggibile in italiano, ora di Roma: "12 dicembre 2026". */
export function formatRomeDate(date: Date, withTime = false): string {
  return new Intl.DateTimeFormat("it-IT", {
    timeZone: TZ,
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}
