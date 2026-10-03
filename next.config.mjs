// Dominio pubblico dello store Vercel Blob del progetto, ricavato dal token
// (formato vercel_blob_rw_<idStore>_<segreto>): solo le immagini di QUESTO
// store passano dall'ottimizzatore di next/image, non quelle di qualsiasi
// altro cliente Vercel. L'id dello store non è segreto: compare già in
// ogni URL pubblico delle foto.
const blobStoreId = process.env.BLOB_READ_WRITE_TOKEN?.split("_")[3];
const BLOB_HOST = blobStoreId
  ? `${blobStoreId.toLowerCase()}.public.blob.vercel-storage.com`
  : null;
if (!BLOB_HOST) {
  console.warn("BLOB_READ_WRITE_TOKEN mancante: le foto da Vercel Blob non verranno mostrate.");
}

const isDev = process.env.NODE_ENV !== "production";

// Content Security Policy: il sito carica solo risorse proprie e le foto
// dello store Blob; nessuno può incorporarlo in un iframe (clickjacking).
// Next usa script inline, da cui 'unsafe-inline'; in sviluppo servono anche
// 'unsafe-eval' e i WebSocket per il ricaricamento automatico.
const csp = [
  "default-src 'self'",
  `img-src 'self' data: blob:${BLOB_HOST ? ` https://${BLOB_HOST}` : ""}`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Non dichiarare la tecnologia usata (header X-Powered-By).
  poweredByHeader: false,
  images: {
    remotePatterns: BLOB_HOST ? [{ protocol: "https", hostname: BLOB_HOST }] : [],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
