import { createHmac, timingSafeEqual } from "crypto";

/**
 * Token di verifica "zero-retention":
 * - Provato che l'email istituzionale è stata verificata via OTP.
 * - NON contiene l'indirizzo email (solo uno scope + una scadenza), quindi
 *   anche se il token venisse loggato non permetterebbe di risalire alla mail.
 * - Vive per pochi minuti, solo in memoria del browser (campo hidden del form),
 *   non viene mai scritto su disco/DB.
 */

const TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minuti per completare l'upload

type TokenPayload = {
  scope: "hall-of-fame-upload";
  exp: number; // epoch ms
};

function getSecret(): string {
  const secret = process.env.OTP_SIGNING_SECRET;
  if (!secret) {
    throw new Error("OTP_SIGNING_SECRET non configurato.");
  }
  return secret;
}

function base64url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function sign(data: string): string {
  return base64url(createHmac("sha256", getSecret()).update(data).digest());
}

export function issueVerificationToken(): string {
  const payload: TokenPayload = {
    scope: "hall-of-fame-upload",
    exp: Date.now() + TOKEN_TTL_MS,
  };
  const body = base64url(JSON.stringify(payload));
  const signature = sign(body);
  return `${body}.${signature}`;
}

export function verifyVerificationToken(token: string | null | undefined): boolean {
  if (!token || !token.includes(".")) return false;
  const [body, signature] = token.split(".");
  const expected = sign(body);

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return false;
  if (!timingSafeEqual(sigBuf, expBuf)) return false;

  try {
    const payload: TokenPayload = JSON.parse(
      Buffer.from(body, "base64").toString("utf8")
    );
    return payload.scope === "hall-of-fame-upload" && payload.exp > Date.now();
  } catch {
    return false;
  }
}
