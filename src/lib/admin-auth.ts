/**
 * Autenticazione del pannello /admin: una sola password condivisa, di cui
 * il server conosce solo l'impronta (variabile d'ambiente
 * ADMIN_PASSWORD_HASH, creata con `npm run admin:hash`). La password in
 * chiaro non è salvata da nessuna parte: al login si ricalcola l'impronta
 * (PBKDF2-SHA256 con sale casuale e molte iterazioni, lenta di proposito
 * per scoraggiare i tentativi a forza bruta) e la si confronta.
 *
 * Dopo il login si salva un cookie firmato con HMAC (chiave = l'impronta),
 * valido SESSION_HOURS ore. Tutte le sessioni aperte decadono cambiando la
 * password, oppure cambiando ADMIN_SESSION_VERSION (facoltativa: serve a
 * disconnettere tutti senza cambiare password, per esempio dopo aver usato
 * il pannello su un computer non proprio).
 *
 * Usa solo Web Crypto, così funziona sia nel middleware (edge) sia nelle
 * Server Actions (Node).
 */
// In produzione il prefisso __Host- obbliga il browser ad accettare il
// cookie solo se Secure, con Path=/ e senza Domain (niente sottodomini).
export const ADMIN_COOKIE =
  process.env.NODE_ENV === "production" ? "__Host-annuario_admin" : "annuario_admin";
export const SESSION_HOURS = 12;

export const adminCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

function sessionVersion(): string {
  return (process.env.ADMIN_SESSION_VERSION ?? "").trim();
}

// Formato (vedi scripts/hash-admin-password.js):
// pbkdf2-sha256:<iterazioni>:<sale base64>:<impronta base64>
const HASH_PREFIX = "pbkdf2-sha256";

function storedHash(): string {
  return (process.env.ADMIN_PASSWORD_HASH ?? "").trim();
}

export function isAdminConfigured(): boolean {
  return storedHash().startsWith(`${HASH_PREFIX}:`);
}

const toBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const fromBase64 = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

async function pbkdf2(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    256
  );
  return new Uint8Array(bits);
}

export async function verifyPassword(password: string): Promise<boolean> {
  const [prefix, iter, salt, hash] = storedHash().split(":");
  const iterations = Number(iter);
  if (prefix !== HASH_PREFIX || !Number.isInteger(iterations) || iterations < 1 || !salt || !hash) {
    return false;
  }
  const computed = await pbkdf2(password, fromBase64(salt), iterations);
  return safeEqual(toBase64(computed), hash);
}

async function hmac(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(storedHash()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

// Confronto a tempo costante, per non rivelare quanti caratteri coincidono.
export function safeEqual(a: string, b: string): boolean {
  const ea = new TextEncoder().encode(a);
  const eb = new TextEncoder().encode(b);
  let diff = ea.length ^ eb.length;
  for (let i = 0; i < Math.max(ea.length, eb.length); i++) {
    diff |= (ea[i] ?? 0) ^ (eb[i] ?? 0);
  }
  return diff === 0;
}

export async function createSessionToken(): Promise<string> {
  const expires = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  return `${expires}.${await hmac(`admin:${sessionVersion()}:${expires}`)}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token || !isAdminConfigured()) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  return safeEqual(signature, await hmac(`admin:${sessionVersion()}:${expires}`));
}
