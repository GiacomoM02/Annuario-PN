/**
 * scripts/generate-pdf.js
 *
 * Genera il PDF dell'Annuario raccogliendo le foto APPROVATE dal database,
 * con lo stesso stile a griglia dell'edizione storica: foto, icona della
 * facoltà in alto a destra (o badge "Gruppo"), nome e didascalia sotto.
 * Le persone sono ordinate alfabeticamente per cognome.
 *
 * Uso:
 *   node scripts/generate-pdf.js
 *   node scripts/generate-pdf.js --section=ANNUARIO_STORICO
 *   node scripts/generate-pdf.js --section=HALL_OF_FAME --out=output/mio-file.pdf
 *
 * Richiede POSTGRES_URL in .env.local (lo stesso usato dal sito) e la
 * dipendenza "puppeteer" (vedi package.json / istruzioni finali).
 */

require("dotenv").config({ path: ".env.local" });
const fs = require("fs");
const path = require("path");
const { sql } = require("@vercel/postgres");

// -----------------------------------------------------------------------
// Config facoltà: deve restare allineata a src/lib/faculties.ts (qui
// duplicata perché questo script gira in plain Node, senza compilare TS).
// -----------------------------------------------------------------------
const FACULTIES = {
  MEDICINA: { label: "Medicina, Farmacia, Infermieristica, Psicologia", icon: "MEDICINA.png" },
  INGEGNERIA: { label: "Ingegneria", icon: "INGEGNERIA.png" },
  UMANISTICHE: { label: "Discipline umanistiche", icon: "UMANISTICHE.png" },
  SCIENZE: { label: "Scienze matematiche, informatiche, fisiche e della natura", icon: "SCIENZE.png" },
  PERSONALE: { label: "Personale universitario", icon: "PERSONALE.png" },
};

const PROJECT_ROOT = path.resolve(__dirname, "..");

// -----------------------------------------------------------------------
// Argomenti da riga di comando
// -----------------------------------------------------------------------
function parseArgs() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((a) => {
      const [k, v] = a.replace(/^--/, "").split("=");
      return [k, v ?? true];
    })
  );
  return {
    section: args.section || "HALL_OF_FAME", // o ANNUARIO_STORICO
    year: args.year || null,
    out: args.out || null,
  };
}

// -----------------------------------------------------------------------
// Estrae il cognome (ultima parola del primo nome elencato) per ordinare.
// Stessa logica di src/lib/sort-entries.ts, duplicata per lo stesso motivo.
// -----------------------------------------------------------------------
function extractSurname(names) {
  const firstPerson = (names.split(",")[0] || "").trim();
  const parts = firstPerson.split(/\s+/).filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : firstPerson;
}

function fileToDataUri(absPath) {
  const ext = path.extname(absPath).slice(1);
  const mime = ext === "svg" ? "image/svg+xml" : `image/${ext === "jpg" ? "jpeg" : ext}`;
  const data = fs.readFileSync(absPath).toString("base64");
  return `data:${mime};base64,${data}`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(date) {
  return new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(date)
  );
}

// -----------------------------------------------------------------------
// HTML: pagina di copertina + griglia 3x3 delle schede, stesso linguaggio
// visivo del sito (palette Unipi, card bianche, emblema Cherubino).
// -----------------------------------------------------------------------
function buildHtml({ entries, year, sectionLabel, cherubinoDataUri, facultyIcons }) {
  const PER_PAGE = 9; // 3 colonne x 3 righe, come le pagine dell'edizione storica
  const pages = [];
  for (let i = 0; i < entries.length; i += PER_PAGE) {
    pages.push(entries.slice(i, i + PER_PAGE));
  }

  const cardHtml = (entry) => {
    const badge =
      entry.type === "GROUP"
        ? `<span class="badge badge-group">Gruppo</span>`
        : entry.faculty && facultyIcons[entry.faculty]
        ? `<span class="badge badge-faculty"><img src="${facultyIcons[entry.faculty]}" alt="${escapeHtml(
            (FACULTIES[entry.faculty] || {}).label || ""
          )}" /></span>`
        : "";

    return `
      <article class="card">
        <div class="card-photo">
          <img src="${entry.imageUrl}" alt="${escapeHtml(entry.caption)}" />
          ${badge}
        </div>
        <div class="card-body">
          <h3>${escapeHtml(entry.names)}</h3>
          <p>${escapeHtml(entry.caption)}</p>
        </div>
      </article>`;
  };

  const pageHeader = `
    <div class="page-header">
      <img class="emblem-small" src="${cherubinoDataUri}" alt="" />
      <span>Annuario del PN — Edizione ${year}${sectionLabel ? " — " + sectionLabel : ""}</span>
    </div>`;

  const gridPages = pages
    .map(
      (pageEntries, i) => `
      <section class="page">
        ${pageHeader}
        <div class="grid">
          ${pageEntries.map(cardHtml).join("\n")}
        </div>
        <div class="page-number">${i + 1}</div>
      </section>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8" />
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: Georgia, "Times New Roman", serif;
    color: #12161F;
  }

  /* --- Copertina --------------------------------------------------- */
  .cover {
    width: 210mm;
    height: 297mm;
    background: #002B49;
    color: #FFFFFF;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    page-break-after: always;
  }
  .cover img.emblem { width: 46mm; height: 46mm; border-radius: 50%; margin-bottom: 10mm; }
  .cover h1 { font-size: 36pt; margin: 0; letter-spacing: 1px; }
  .cover h2 { font-size: 20pt; font-weight: normal; font-style: italic; color: #4A9FD8; margin: 4mm 0 0; }
  .cover .meta { margin-top: 14mm; font-size: 11pt; color: #D2E7F5; }

  /* --- Pagine griglia ------------------------------------------------ */
  .page {
    width: 210mm;
    height: 297mm;
    padding: 14mm 12mm 10mm;
    page-break-after: always;
    position: relative;
  }
  .page-header {
    display: flex;
    align-items: center;
    gap: 3mm;
    border-bottom: 0.5pt solid #E3EAEF;
    padding-bottom: 3mm;
    margin-bottom: 6mm;
    font-size: 9pt;
    color: #4B5566;
  }
  .emblem-small { width: 7mm; height: 7mm; border-radius: 50%; }
  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6mm;
  }
  .card {
    border: 0.5pt solid #E3EAEF;
    border-radius: 2mm;
    overflow: hidden;
    break-inside: avoid;
  }
  .card-photo {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 5;
    background: #002B49;
  }
  .card-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .badge {
    position: absolute;
    top: 2mm;
    right: 2mm;
  }
  .badge-group {
    background: rgba(0, 43, 73, 0.9);
    color: #FFFFFF;
    font-size: 6.5pt;
    font-family: Arial, sans-serif;
    padding: 1mm 2mm;
    border-radius: 3mm;
  }
  .badge-faculty img {
    width: 6mm;
    height: 6mm;
    border-radius: 50%;
    box-shadow: 0 0 0 1pt rgba(255,255,255,0.85);
  }
  .card-body { padding: 2.5mm 3mm 3mm; }
  .card-body h3 { font-size: 8.5pt; font-weight: bold; color: #002B49; margin: 0 0 1mm; line-height: 1.2; }
  .card-body p { font-size: 7.5pt; font-style: italic; color: #4B5566; margin: 0; line-height: 1.25; }
  .page-number {
    position: absolute;
    bottom: 8mm;
    right: 12mm;
    font-size: 8pt;
    color: #4B5566;
  }
</style>
</head>
<body>
  <div class="cover">
    <img class="emblem" src="${cherubinoDataUri}" alt="Annuario del PN" />
    <h1>ANNUARIO DEL PN</h1>
    <h2>${sectionLabel || "Edizione"}</h2>
    <div class="meta">Edizione ${year} — generato il ${formatDate(new Date())}</div>
  </div>
  ${gridPages}
</body>
</html>`;
}

async function main() {
  const { section, year: yearArg, out } = parseArgs();
  if (!["HALL_OF_FAME", "ANNUARIO_STORICO"].includes(section)) {
    console.error(`Sezione non valida: ${section} (usa HALL_OF_FAME o ANNUARIO_STORICO)`);
    process.exit(1);
  }

  console.log(`Recupero le schede approvate per la sezione ${section}...`);
  const { rows } = await sql.query(
    `SELECT * FROM hall_of_fame_entries WHERE status = 'APPROVED' AND section = $1`,
    [section]
  );

  if (rows.length === 0) {
    console.error("Nessuna scheda approvata trovata: niente da generare.");
    process.exit(1);
  }

  const entries = rows.sort((a, b) =>
    extractSurname(a.names).localeCompare(extractSurname(b.names), "it", { sensitivity: "base" })
  );

  console.log(`${entries.length} schede trovate, ordinate per cognome.`);

  const cherubinoPath = path.join(PROJECT_ROOT, "public/brand/cherubino-annuario.jpg");
  const cherubinoDataUri = fs.existsSync(cherubinoPath) ? fileToDataUri(cherubinoPath) : "";

  const facultyIcons = {};
  for (const [key, info] of Object.entries(FACULTIES)) {
    const iconPath = path.join(PROJECT_ROOT, "public/icons/facolta", info.icon);
    if (fs.existsSync(iconPath)) facultyIcons[key] = fileToDataUri(iconPath);
  }

  const html = buildHtml({
    entries,
    year: yearArg || getConfiguredYear(),
    sectionLabel: section === "HALL_OF_FAME" ? "Hall of Fame" : "Annuario Storico",
    cherubinoDataUri,
    facultyIcons,
  });

  const outputPath = out || path.join(PROJECT_ROOT, `output/annuario-${section.toLowerCase()}-${getConfiguredYear()}.pdf`);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  console.log("Rendo il PDF con Puppeteer...");
  const puppeteer = require("puppeteer");
  const browser = await puppeteer.launch({ headless: "new" });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 120000 });
    await page.pdf({
      path: outputPath,
      printBackground: true,
      preferCSSPageSize: true,
    });
  } finally {
    await browser.close();
  }

  console.log(`✓ PDF generato: ${outputPath}`);
}

// Legge l'anno dell'edizione corrente da src/config/current-edition.ts
// senza dover compilare TypeScript (semplice estrazione testuale della
// riga "year: ####").
function getConfiguredYear() {
  const configPath = path.join(PROJECT_ROOT, "src/config/current-edition.ts");
  const content = fs.readFileSync(configPath, "utf8");
  const match = content.match(/year:\s*(\d{4})/);
  return match ? match[1] : new Date().getFullYear();
}

if (require.main === module) {
  main().catch((err) => {
    console.error("Errore nella generazione del PDF:", err);
    process.exit(1);
  });
}

module.exports = { buildHtml, extractSurname, getConfiguredYear };
