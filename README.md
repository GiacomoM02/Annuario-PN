# Annuario del PN

Applicazione web per l'Annuario storico del PN — Università di Pisa.
Next.js 14 (App Router + Server Actions), Tailwind CSS, Vercel Postgres
(Drizzle ORM), Vercel Blob, Upstash Redis (OTP volatile), Resend (email).

## Struttura del progetto

```
annuario-del-pn/
├── drizzle/
│   └── schema.ts                # Schema DB: hall_of_fame_entries, archived_editions
├── drizzle.config.ts
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Layout root, font, Navbar/Footer
│   │   ├── globals.css
│   │   ├── page.tsx               # Home
│   │   ├── archivio/
│   │   │   └── page.tsx           # Archivio (griglia edizioni + download PDF)
│   │   └── hall-of-fame/
│   │       ├── page.tsx           # Hall of Fame (server component, fetch iniziale)
│   │       └── actions.ts         # Server Actions: OTP, verifica, upload, polling
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── HallOfFameBoard.tsx    # Client: griglia + polling + stato ottimistico
│   │   ├── PhotoCard.tsx
│   │   ├── UploadModal.tsx
│   │   └── UploadForm.tsx         # Client: step Email -> OTP -> Dettagli foto
│   └── lib/
│       ├── db.ts                  # Connessione Drizzle + Vercel Postgres
│       ├── blob-upload.ts         # Validazione e upload immagini su Vercel Blob
│       ├── otp.ts                 # Generazione/verifica OTP su Upstash Redis (TTL)
│       ├── token.ts               # Token firmato HMAC "email verificata" (no email dentro)
│       ├── email.ts               # Invio OTP via Resend
│       ├── validations.ts         # Schemi Zod
│       └── utils.ts
├── tailwind.config.ts
├── next.config.mjs
└── .env.local.example
```

## Perché questa architettura

- **Zero-retention delle email**: l'indirizzo istituzionale viene scritto
  *solo* su Upstash Redis con TTL di 5 minuti (`lib/otp.ts`), mai nel
  database Postgres. Dopo la verifica, il client riceve un token firmato
  (HMAC, `lib/token.ts`) che **non contiene l'email**, valido 15 minuti:
  è la prova che serve al form per sbloccare l'upload, senza lasciare
  traccia persistente dell'identità del mittente.
- **Aggiornamento "in tempo reale"**: ogni upload riuscito chiama
  `revalidatePath("/hall-of-fame")` (rigenera l'SSR per i nuovi visitatori)
  e aggiorna otticamente lo stato React lato client di chi ha appena
  caricato la foto. Un polling leggero ogni 15s (`getLatestEntriesAction`)
  aggiorna la griglia anche per chi ha già la pagina aperta, senza bisogno
  di WebSocket/infrastruttura aggiuntiva (compatibile col piano Vercel free).
- **Upload diretto su Vercel Blob**: le immagini non transitano mai dal
  database; viene salvato solo l'URL pubblico restituito da Blob.

## Setup locale

1. `npm install`
2. Copia `.env.local.example` in `.env.local` e compila le variabili:
   - Collega un DB **Vercel Postgres** (o Neon) al progetto per ottenere
     `POSTGRES_URL` e derivate.
   - Crea uno **Vercel Blob Store** per `BLOB_READ_WRITE_TOKEN`.
   - Crea un database **Upstash Redis** (gratuito, anche da Vercel
     Marketplace) per `UPSTASH_REDIS_REST_URL` / `..._TOKEN`.
   - Registra una chiave **Resend** per `RESEND_API_KEY`.
   - Genera `OTP_SIGNING_SECRET` con `openssl rand -base64 32`.
3. Applica lo schema al database: `npm run db:push`
4. `npm run dev`

## Popolare l'Archivio

Non è richiesta un'interfaccia di amministrazione nel primo step: le righe
di `archived_editions` (PDF + copertina, già caricati su Vercel Blob) si
possono inserire manualmente con `npm run db:studio` (Drizzle Studio) o via
uno script di seed, finché non verrà costruita una pagina `/admin` dedicata.

## Deploy su Vercel (piano free)

1. Importa il repo su Vercel.
2. Collega Postgres e Blob dal tab **Storage** del progetto (compila da
   soli le env var corrispondenti).
3. Aggiungi manualmente `UPSTASH_REDIS_REST_URL/TOKEN`, `RESEND_API_KEY`,
   `RESEND_FROM_EMAIL`, `OTP_SIGNING_SECRET`, `NEXT_PUBLIC_APP_URL`.
4. Deploy. Il piano free copre comodamente basso/medio traffico universitario.

## Prossimi step suggeriti

- Pagina `/admin` protetta per caricare nuove edizioni (PDF + copertina).
- Rate limiting per IP sull'invio OTP (oggi limitato solo a 5 tentativi di
  verifica per email tramite Redis).
- Moderazione leggera delle foto prima della pubblicazione, se richiesta
  dall'organizzazione dell'annuario.
