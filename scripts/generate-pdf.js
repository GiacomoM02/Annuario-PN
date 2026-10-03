/**
 * scripts/generate-pdf.js
 *
 * Genera il PDF dell'Annuario di un'edizione raccogliendo le foto APPROVATE
 * inviate dalla pagina Archivio (sezione ARCHIVIO), con lo stesso template
 * della prima edizione (public/pdf/annuario-del-pn-2026.pdf):
 * - copertina bianca con titolo, emblema e sottotitolo;
 * - pagina 1 con la premessa (facoltativa) e la legenda delle facoltà;
 * - foto singole in griglia 3x3, ordinate per cognome: foto quadrata, icona
 *   della facoltà, nome su due righe e frase in un'etichetta blu;
 * - foto di gruppo con la didascalia sotto: le verticali sfalsate a
 *   sinistra e a destra, le orizzontali centrate a tutta larghezza;
 * - ogni pagina incorniciata, con l'emblema in alto e il numero in basso.
 *
 * Uso:
 *   npm run generate:pdf
 *   npm run generate:pdf -- --year=2027
 *   npm run generate:pdf -- --year=2027 --subtitle="Seconda edizione" --out=output/prova.pdf
 *
 * Sottotitolo della copertina: di default è l'anno accademico, calcolato
 * dall'anno dell'edizione (2027 -> "Edizione 2026-27").
 *
 * Premessa (pagina 1): il testo di content/premessa-<anno>.txt se esiste,
 * altrimenti quello di content/premessa.txt (la premessa della prima
 * edizione). Un paragrafo per blocco di righe, separati da una riga vuota.
 *
 * Richiede POSTGRES_URL in .env.local (lo stesso usato dal sito) e la
 * dipendenza "puppeteer".
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
  SCIENZE: { label: "Scienze matematiche, informatiche, fisiche e della natura", icon: "SCIENZE.png" },
  INGEGNERIA: { label: "Ingegneria", icon: "INGEGNERIA.png" },
  PERSONALE: { label: "Personale universitario (portineria, bar, ecc.)", icon: "PERSONALE.png" },
  UMANISTICHE: { label: "Discipline umanistiche", icon: "UMANISTICHE.png" },
};

const PROJECT_ROOT = path.resolve(__dirname, "..");

// -----------------------------------------------------------------------
// Argomenti da riga di comando
// -----------------------------------------------------------------------
function parseArgs() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((a) => {
      const [k, ...v] = a.replace(/^--/, "").split("=");
      return [k, v.length ? v.join("=") : true];
    })
  );
  const year = Number(args.year || getConfiguredYear());
  return {
    year,
    // Anno accademico: l'edizione 2027 raccoglie l'anno 2026-27.
    subtitle: args.subtitle || `Edizione ${year - 1}-${String(year).slice(-2)}`,
    out: args.out || null,
  };
}

// -----------------------------------------------------------------------
// Nome e cognome: il cognome è l'ultima parola più le eventuali particelle
// ("Del Valle", "Di Giovannantonio"). Stessa logica di
// src/lib/sort-entries.ts, duplicata per lo stesso motivo delle facoltà.
// -----------------------------------------------------------------------
const SURNAME_PARTICLES = new Set([
  "da", "dal", "dalla", "dalle", "de", "dei", "degli", "del", "della",
  "delle", "dello", "di", "la", "lo", "le", "li", "van", "von", "der",
]);

function splitName(fullName) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return { given: fullName.trim(), surname: "" };
  let start = parts.length - 1;
  while (start > 1 && SURNAME_PARTICLES.has(parts[start - 1].toLowerCase())) {
    start--;
  }
  return { given: parts.slice(0, start).join(" "), surname: parts.slice(start).join(" ") };
}

function extractSurname(names) {
  const firstPerson = (names.split(",")[0] || "").trim();
  return splitName(firstPerson).surname || firstPerson;
}

function fileToDataUri(absPath) {
  const ext = path.extname(absPath).slice(1).toLowerCase();
  const mime = ext === "svg" ? "image/svg+xml" : `image/${ext === "jpg" ? "jpeg" : ext}`;
  const data = fs.readFileSync(absPath).toString("base64");
  return `data:${mime};base64,${data}`;
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function chunk(list, size) {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

// -----------------------------------------------------------------------
// Impaginazione delle foto di gruppo, come nell'edizione storica: la pagina
// è una griglia di 2 colonne x 7 righe. Le foto verticali occupano una
// colonna per 3 righe e si alternano sinistra/destra sfalsate di 2 righe
// (effetto "a zig-zag"); quelle orizzontali sono centrate su tutta la
// larghezza per 2 righe. Quando una foto non entra si passa alla pagina dopo.
// -----------------------------------------------------------------------
const ROWS = 7;

function layoutGroups(groups) {
  const pages = [];
  let page = [];
  let freeFrom = 1; // prima riga libera su entrambe le colonne
  let lastPortrait = null; // { col, start } dell'ultima foto verticale

  const newPage = () => {
    if (page.length) pages.push(page);
    page = [];
    freeFrom = 1;
    lastPortrait = null;
  };

  for (const entry of groups) {
    const wide = (entry.ratio ?? 0.75) >= 1.15;
    for (let attempt = 0; attempt < 2; attempt++) {
      let item;
      if (wide) {
        item = { kind: "wide", col: "1 / span 2", start: freeFrom, span: 2 };
      } else if (lastPortrait && lastPortrait.start + 2 >= freeFrom - 1) {
        // Sfalsata rispetto alla verticale precedente, nell'altra colonna.
        item = { kind: "portrait", col: lastPortrait.col === 1 ? 2 : 1, start: lastPortrait.start + 2, span: 3 };
      } else {
        item = { kind: "portrait", col: lastPortrait && lastPortrait.col === 1 ? 2 : 1, start: freeFrom, span: 3 };
      }
      if (item.start + item.span - 1 <= ROWS) {
        page.push({ entry, kind: item.kind, col: String(item.col), row: `${item.start} / span ${item.span}` });
        freeFrom = Math.max(freeFrom, item.start + item.span);
        lastPortrait = item.kind === "portrait" ? { col: item.col, start: item.start } : null;
        break;
      }
      newPage();
    }
  }
  newPage();
  return pages;
}

// -----------------------------------------------------------------------
// HTML
// -----------------------------------------------------------------------
function buildHtml({ singles, groups, subtitle, premessa, emblem, facultyIcons }) {
  // Pagina con cornice, emblema in alto e numero in basso (a sinistra sulle
  // pagine dispari, a destra sulle pari, come nella prima edizione).
  const framedPage = (number, inner, extraClass = "") => `
    <section class="page framed ${number % 2 === 1 ? "odd" : "even"} ${extraClass}">
      <div class="frame"></div>
      <img class="frame-emblem" src="${emblem}" alt="" />
      <div class="content">${inner}</div>
      <div class="page-number">${number}</div>
    </section>`;

  const legend = `
    <div class="legend">
      <h2>Leggenda area disciplinare</h2>
      <div class="legend-grid">
        ${Object.entries(FACULTIES)
          .map(
            ([key, f]) => `
          <div class="legend-item">
            ${facultyIcons[key] ? `<img src="${facultyIcons[key]}" alt="" />` : ""}
            <span>${escapeHtml(f.label)}</span>
          </div>`
          )
          .join("")}
      </div>
    </div>`;

  const intro = `
    ${
      premessa
        ? `<div class="premessa"><h1>Premessa</h1>${premessa
            .split(/\n\s*\n/)
            .map((p) => `<p>${escapeHtml(p.trim()).replace(/\n/g, "<br/>")}</p>`)
            .join("")}</div>`
        : ""
    }
    ${legend}`;

  const singleCard = (entry) => {
    const { given, surname } = splitName(entry.names);
    const icon = facultyIcons[entry.faculty];
    return `
      <article class="single">
        <div class="single-photo">
          <img class="photo" src="${entry.imageUrl}" alt="" />
          ${icon ? `<img class="faculty" src="${icon}" alt="" />` : ""}
        </div>
        <div class="single-name"><span>${escapeHtml(given)}</span><span>${escapeHtml(surname)}</span></div>
        <div class="single-motto">${escapeHtml(entry.caption)}</div>
      </article>`;
  };

  const groupFigure = ({ entry, kind, col, row }) => `
    <figure class="group ${kind}" style="grid-column: ${col}; grid-row: ${row};">
      <img src="${entry.imageUrl}" alt="" />
      <figcaption><span>${escapeHtml(entry.names)}</span><em>${escapeHtml(entry.caption)}</em></figcaption>
    </figure>`;

  const pages = [intro, ...chunk(singles, 9).map((p) => `<div class="singles">${p.map(singleCard).join("")}</div>`)];
  const groupPages = layoutGroups(groups).map(
    (p) => `<div class="groups">${p.map(groupFigure).join("")}</div>`
  );

  const body = [
    ...pages.map((inner, i) => framedPage(i + 1, inner, i === 0 ? "intro" : "")),
    ...groupPages.map((inner, i) => framedPage(pages.length + i + 1, inner)),
  ].join("\n");

  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8" />
<style>
  @page { size: A4; margin: 0; }
  :root { --navy: #0b2d6b; }
  * { box-sizing: border-box; }
  body { margin: 0; color: var(--navy); font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif; }
  .serif { font-family: "Noto Serif", Georgia, "Times New Roman", serif; }

  .page { position: relative; width: 210mm; height: 297mm; overflow: hidden; page-break-after: always; background: #fff; }

  /* --- Copertina ------------------------------------------------------- */
  .cover { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12mm; text-align: center; }
  .cover h1 { font-family: "Noto Serif", Georgia, serif; font-weight: 700; font-size: 54pt; line-height: 1.05; margin: 0; letter-spacing: 1pt; }
  .cover img { width: 132mm; height: 132mm; border-radius: 50%; }
  .cover h2 { font-family: "Noto Serif", Georgia, serif; font-weight: 700; font-size: 36pt; margin: 0; }

  /* --- Cornice, emblema e numero di pagina --------------------------- */
  .frame { position: absolute; left: 15mm; right: 15mm; top: 17mm; bottom: 16mm; border: 0.6mm solid var(--navy); }
  .frame-emblem { position: absolute; top: 5mm; left: 50%; width: 24mm; height: 24mm; margin-left: -12mm; border-radius: 50%; background: #fff; box-shadow: 0 0 0 6mm #fff; }
  .page-number { position: absolute; bottom: 9mm; width: 14mm; height: 14mm; border-radius: 50%; background: var(--navy); color: #fff; font-size: 12pt; display: flex; align-items: center; justify-content: center; }
  .odd .page-number { left: 8mm; }
  .even .page-number { right: 8mm; }
  .content { position: absolute; left: 15mm; right: 15mm; top: 32mm; bottom: 22mm; }

  /* --- Pagina 1: premessa e legenda ----------------------------------- */
  .intro .content { display: flex; flex-direction: column; justify-content: space-between; padding: 0 5mm; }
  .premessa h1 { font-family: "Noto Serif", Georgia, serif; font-weight: 400; font-size: 21pt; text-align: center; margin: -3mm 0 6mm; color: #111; }
  .premessa p { font-family: "Noto Serif", Georgia, serif; font-size: 11pt; line-height: 1.22; color: #111; margin: 0 0 4.5mm; }
  .legend { margin-top: auto; padding: 0 8mm 4mm; }
  .legend h2 { font-weight: 400; font-size: 17pt; margin: 0 0 6mm; }
  .legend-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm 10mm; }
  .legend-item { display: flex; align-items: center; gap: 4mm; font-size: 9.5pt; line-height: 1.2; }
  .legend-item img { width: 11mm; height: 11mm; border-radius: 50%; flex-shrink: 0; }

  /* --- Foto singole: griglia 3x3 --------------------------------------- */
  .singles { display: grid; grid-template-columns: repeat(3, 42mm); grid-template-rows: repeat(3, 1fr); justify-content: space-evenly; height: 100%; padding-top: 2mm; }
  .single { display: flex; flex-direction: column; align-items: center; }
  .single-photo { position: relative; width: 42mm; height: 42mm; z-index: 2; }
  .single-photo .photo { width: 100%; height: 100%; object-fit: cover; border-radius: 3mm; display: block; }
  .single-photo .faculty { position: absolute; top: -5mm; right: -5mm; width: 11mm; height: 11mm; border-radius: 50%; }
  .single-name { position: relative; z-index: 1; width: 44mm; margin-top: -4mm; padding: 5.5mm 1mm 6.5mm; border: 0.45mm solid var(--navy); border-radius: 3mm; text-align: center; font-size: 10.5pt; line-height: 1.15; display: flex; flex-direction: column; }
  .single-motto { position: relative; z-index: 2; width: 39mm; min-height: 17mm; margin-top: -4.5mm; padding: 2mm 2.5mm; border-radius: 2.5mm; background: var(--navy); color: #fff; font-style: italic; font-size: 7.5pt; line-height: 1.25; text-align: center; display: flex; align-items: center; justify-content: center; }

  /* --- Foto di gruppo: tre per pagina, sfalsate ------------------------ */
  .groups { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: repeat(7, 1fr); height: 100%; padding: 2mm 4mm; column-gap: 6mm; }
  .group { margin: 0; display: table; width: 1px; justify-self: center; align-self: center; }
  .group img { display: block; width: auto; height: auto; border-radius: 3mm 3mm 0 0; }
  .group.portrait img { max-width: 74mm; max-height: 78mm; }
  .group.wide img { max-width: 150mm; max-height: 48mm; }
  .group figcaption { display: table-caption; caption-side: bottom; background: var(--navy); color: #fff; border-radius: 0 0 3mm 3mm; padding: 1.5mm 3mm 2mm; font-size: 9pt; line-height: 1.25; text-align: center; }
  .group figcaption span, .group figcaption em { display: block; }
</style>
</head>
<body>
  <section class="page cover">
    <h1>ANNUARIO<br/>DEL PN</h1>
    <img src="${emblem}" alt="Annuario del PN" />
    <h2>${escapeHtml(subtitle)}</h2>
  </section>
  ${body}
</body>
</html>`;
}

async function main() {
  const { year, subtitle, out } = parseArgs();

  console.log(`Recupero le foto approvate per l'edizione ${year}...`);
  const { rows } = await sql.query(
    // Le colonne del DB sono in snake_case (image_url): l'alias le allinea
    // ai nomi usati da buildHtml (imageUrl), gli stessi del resto del sito.
    `SELECT id, type, faculty, names, caption, image_url AS "imageUrl", created_at AS "createdAt"
       FROM hall_of_fame_entries
      WHERE status = 'APPROVED' AND section = 'ARCHIVIO' AND edition_year = $1`,
    [year]
  );

  if (rows.length === 0) {
    console.error(`Nessuna foto approvata per l'edizione ${year}: niente da generare.`);
    process.exit(1);
  }

  const singles = rows
    .filter((r) => r.type === "SINGLE")
    .sort((a, b) => extractSurname(a.names).localeCompare(extractSurname(b.names), "it", { sensitivity: "base" }));
  const groups = rows
    .filter((r) => r.type === "GROUP")
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  console.log(`${singles.length} foto singole (ordinate per cognome) e ${groups.length} di gruppo.`);

  const emblemPath = path.join(PROJECT_ROOT, "public/brand/cherubino-annuario.jpg");
  const emblem = fs.existsSync(emblemPath) ? fileToDataUri(emblemPath) : "";

  const facultyIcons = {};
  for (const [key, info] of Object.entries(FACULTIES)) {
    const iconPath = path.join(PROJECT_ROOT, "public/icons/facolta", info.icon);
    if (fs.existsSync(iconPath)) facultyIcons[key] = fileToDataUri(iconPath);
  }

  const premessaPath = [`content/premessa-${year}.txt`, "content/premessa.txt"]
    .map((p) => path.join(PROJECT_ROOT, p))
    .find((p) => fs.existsSync(p));
  const premessa = premessaPath ? fs.readFileSync(premessaPath, "utf8") : "";

  const outputPath = out || path.join(PROJECT_ROOT, `output/annuario-del-pn-${year}.pdf`);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  console.log("Rendo il PDF con Puppeteer...");
  const puppeteer = require("puppeteer");
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    // Proporzioni delle foto di gruppo (larghezza/altezza), per decidere
    // se impaginarle come verticali o orizzontali.
    const ratios = await page.evaluate(
      (urls) =>
        Promise.all(
          urls.map(
            (u) =>
              new Promise((r) => {
                const img = new Image();
                img.onload = () => r(img.naturalWidth / img.naturalHeight);
                img.onerror = () => r(0.75);
                img.src = u;
              })
          )
        ),
      groups.map((g) => g.imageUrl)
    );
    groups.forEach((g, i) => (g.ratio = ratios[i]));

    const html = buildHtml({ singles, groups, subtitle, premessa, emblem, facultyIcons });
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 180000 });
    // Aspetta che tutte le foto (scaricate da Vercel Blob) siano pronte.
    await page.evaluate(() =>
      Promise.all(
        Array.from(document.images).map((img) =>
          img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; })
        )
      )
    );
    await page.pdf({ path: outputPath, printBackground: true, preferCSSPageSize: true });
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
  return match ? Number(match[1]) : new Date().getFullYear();
}

if (require.main === module) {
  main().catch((err) => {
    console.error("Errore nella generazione del PDF:", err);
    process.exit(1);
  });
}

module.exports = { buildHtml, layoutGroups, extractSurname, splitName, getConfiguredYear };
