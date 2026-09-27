/**
 * Autenticazione del pannello /admin: una sola password condivisa
 * (variabile d'ambiente ADMIN_PASSWORD). Dopo il login si salva un cookie
 * firmato con HMAC (chiave = la password stessa): cambiando la password,
 * tutte le sessioni aperte decadono.
 *
 * Usa solo Web Crypto, così funziona sia nel middleware (edge) sia nelle
 * Server Actions (Node).
 */
export const ADMIN_COOKIE = "annuario_admin";
export const SESSION_DAYS = 7;

export function isAdminConfigured(): boolean {
  return !!process.env.ADMIN_PASSWORD;
}

async function hmac(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(process.env.ADMIN_PASSWORD ?? ""),
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
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  return `${expires}.${await hmac(`admin:${expires}`)}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token || !isAdminConfigured()) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  return safeEqual(signature, await hmac(`admin:${expires}`));
}
