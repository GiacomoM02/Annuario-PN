#!/usr/bin/env node
/**
 * Crea l'impronta (hash) della password del pannello /admin, da incollare
 * su Vercel nella variabile d'ambiente ADMIN_PASSWORD_HASH.
 *
 * Uso:  npm run admin:hash
 *
 * La password si digita due volte senza che compaia a schermo e non viene
 * salvata da nessuna parte: lo script stampa solo l'impronta.
 * Stessa logica di verifica di src/lib/admin-auth.ts.
 */
const { webcrypto: crypto } = require("node:crypto");

const ITERATIONS = 600_000;
const MIN_LENGTH = 12;

// Legge una riga da tastiera senza mostrare i caratteri digitati.
function askHidden(question) {
  return new Promise((resolve, reject) => {
    const { stdin, stdout } = process;
    if (!stdin.isTTY) {
      reject(new Error("Esegui lo script da un terminale interattivo."));
      return;
    }
    stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    let value = "";
    const onData = (chunk) => {
      for (const ch of chunk) {
        if (ch === "\r" || ch === "\n") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener("data", onData);
          stdout.write("\n");
          resolve(value);
          return;
        }
        if (ch === "\u0003") {
          stdout.write("\n");
          process.exit(130);
        }
        if (ch === "\u007f" || ch === "\b") value = value.slice(0, -1);
        else value += ch;
      }
    };
    stdin.on("data", onData);
  });
}

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: ITERATIONS },
    key,
    256
  );
  const b64 = (bytes) => Buffer.from(bytes).toString("base64");
  return `pbkdf2-sha256:${ITERATIONS}:${b64(salt)}:${b64(new Uint8Array(bits))}`;
}

(async () => {
  const password = await askHidden("Nuova password del pannello: ");
  if (password.length < MIN_LENGTH) {
    console.error(`Troppo corta: usa almeno ${MIN_LENGTH} caratteri.`);
    process.exit(1);
  }
  const again = await askHidden("Ripeti la password: ");
  if (again !== password) {
    console.error("Le due password non coincidono. Riprova.");
    process.exit(1);
  }
  const hash = await hashPassword(password);
  console.log("\nCopia questa riga e incollala su Vercel come valore di ADMIN_PASSWORD_HASH:\n");
  console.log(hash);
  console.log("");
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
