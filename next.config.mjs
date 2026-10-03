const isDev = process.env.NODE_ENV !== "production";

// Content Security Policy: il sito carica solo risorse proprie (anche le
// foto, servite da /foto e /admin/foto: gli indirizzi su Vercel Blob non
// arrivano mai al browser); nessuno può incorporarlo in un iframe.
// Next usa script inline, da cui 'unsafe-inline'; in sviluppo servono anche
// 'unsafe-eval' e i WebSocket per il ricaricamento automatico.
const csp = [
  "default-src 'self'",
  "img-src 'self' data: blob:",
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
  // Nessuna immagine esterna passa dall'ottimizzatore di next/image.
  images: {
    remotePatterns: [],
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
