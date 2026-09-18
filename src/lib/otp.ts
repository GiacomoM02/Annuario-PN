import { Redis } from "@upstash/redis";

// Store volatile e con scadenza automatica (TTL): l'unico posto in cui
// l'indirizzo email transita durante la verifica. Non è mai scritto nel
// database Postgres dell'applicazione. Dopo OTP_TTL_SECONDS Redis elimina
// da solo la chiave, anche in caso di errore applicativo.
const redis = Redis.fromEnv();

const OTP_TTL_SECONDS = 5 * 60; // 5 minuti
const OTP_MAX_ATTEMPTS = 5;
const ALLOWED_DOMAINS = ["studenti.unipi.it", "unipi.it"];

export class OtpError extends Error {}

function keyFor(email: string) {
  return `otp:${email.toLowerCase().trim()}`;
}
function attemptsKeyFor(email: string) {
  return `otp:attempts:${email.toLowerCase().trim()}`;
}

export function isUnipiEmail(email: string): boolean {
  const normalized = email.toLowerCase().trim();
  return ALLOWED_DOMAINS.some((domain) => normalized.endsWith(`@${domain}`));
}

function generateSixDigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Genera e memorizza (con scadenza) un codice OTP a 6 cifre per l'email
 * indicata. Ritorna il codice, da passare a lib/email.ts per l'invio.
 * La chiave Redis scade da sola: nessuna persistenza permanente.
 */
export async function createOtp(email: string): Promise<string> {
  if (!isUnipiEmail(email)) {
    throw new OtpError(
      "L'upload è riservato a indirizzi email @unipi.it o @studenti.unipi.it."
    );
  }
  const code = generateSixDigitCode();
  await redis.set(keyFor(email), code, { ex: OTP_TTL_SECONDS });
  await redis.set(attemptsKeyFor(email), 0, { ex: OTP_TTL_SECONDS });
  return code;
}

/**
 * Verifica il codice inserito dall'utente. Se corretto, consuma
 * immediatamente la chiave (one-time use) e ritorna true.
 */
export async function verifyOtp(email: string, code: string): Promise<boolean> {
  const key = keyFor(email);
  const attemptsKey = attemptsKeyFor(email);

  const attempts = (await redis.get<number>(attemptsKey)) ?? 0;
  if (attempts >= OTP_MAX_ATTEMPTS) {
    await redis.del(key, attemptsKey);
    throw new OtpError("Troppi tentativi falliti. Richiedi un nuovo codice.");
  }

  const storedCode = await redis.get<string>(key);
  if (!storedCode) {
    throw new OtpError("Codice scaduto o mai richiesto. Richiedine uno nuovo.");
  }

  if (storedCode !== code.trim()) {
    await redis.incr(attemptsKey);
    return false;
  }

  // Codice corretto: consumo immediato, l'email esce definitivamente dallo
  // storage volatile e non lascia traccia.
  await redis.del(key, attemptsKey);
  return true;
}
