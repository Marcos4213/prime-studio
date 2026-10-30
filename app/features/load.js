// Menu da Central do Cliente.
// Cada frente publica a sua entrada em app/features/<frente>/feature.json:
//   { "title": "Presença", "href": "/presenca", "order": 20 }
// title: nome no menu. href: caminho interno (/presenca ou #presenca).
// order: número — menor aparece primeiro. Este módulo só lê e ordena.
// Não cria tela de frente e não apaga feature.json de ninguém.
import path from "node:path";
import { fileURLToPath } from "node:url";

const HREF_RE = /^(?:#[a-z0-9][a-z0-9_-]*|\/[a-z0-9][a-z0-9/_-]*)$/i;

export function moduleFeaturesDir() {
  return path.dirname(fileURLToPath(import.meta.url));
}

function slugFromHref(href) {
  const raw = href.startsWith("#") ? href.slice(1) : href.replace(/^\//, "");
  return raw.split("/")[0].toLowerCase();
}

// Aceita registros crus (feature.json) ou já normalizados. Descarta href externo.
export function toMenu(records) {
  const items = [];
  for (const raw of records || []) {
    if (!raw || typeof raw !== "object") continue;
    const title = typeof raw.title === "string" ? raw.title.trim().slice(0, 48) : "";
    const href = typeof raw.href === "string" ? raw.href.trim() : "";
    if (!title || !HREF_RE.test(href) || href.includes("..")) continue;
    const orderNum = Number(raw.order);
    const order = Number.isFinite(orderNum) ? Math.min(999, Math.max(0, orderNum)) : 100;
    const idSource = typeof raw.id === "string" ? raw.id.trim() : "";
    const idOk = /^[a-z0-9][a-z0-9_-]{0,39}$/i.test(idSource);
    items.push({
      id: idOk ? idSource : slugFromHref(href),
      title,
      href,
      order,
    });
  }
  items.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "pt"));
  return items;
}

// Devolve a pasta que contém este load.js, se ela existir no disco.
// No Worker publicado o disco do repositório não está lá: aí o caller usa o menu gravado.
export async function findFeaturesDir() {
  const { stat } = await import("node:fs/promises");
  const candidates = [
    process.env.PRIME_FEATURES_DIR,
    moduleFeaturesDir(),
    path.resolve(process.cwd(), "features"),
    path.resolve(process.cwd(), "app", "features"),
  ].filter(Boolean);
  const seen = new Set();
  for (const dir of candidates) {
    const abs = path.resolve(dir);
    if (seen.has(abs)) continue;
    seen.add(abs);
    try {
      const st = await stat(path.join(abs, "load.js"));
      if (st.isFile()) return abs;
    } catch {
      /* tenta o próximo */
    }
  }
  return null;
}

export async function loadFeatures(dir) {
  const root = dir || (await findFeaturesDir());
  if (!root) throw new Error("pasta de features ausente");
  const { readdir, readFile } = await import("node:fs/promises");
  const entries = await readdir(root, { withFileTypes: true });
  const raw = [];
  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    const file = path.join(root, ent.name, "feature.json");
    let text;
    try {
      text = await readFile(file, "utf8");
    } catch (err) {
      if (err && err.code === "ENOENT") continue;
      throw err;
    }
    try {
      const data = JSON.parse(text);
      raw.push({ ...data, id: ent.name });
    } catch {
      console.log(JSON.stringify({ level: "warn", msg: "feature.json invalido", id: ent.name }));
    }
  }
  return toMenu(raw);
}

async function main() {
  const writeAt = process.argv.indexOf("--write");
  const menu = await loadFeatures();
  if (writeAt === -1) {
    console.log(JSON.stringify(menu, null, 2));
    return;
  }
  const dest = process.argv[writeAt + 1];
  if (!dest) {
    console.error("Uso: node features/load.js --write <arquivo.json>");
    process.exit(1);
  }
  const { writeFile } = await import("node:fs/promises");
  await writeFile(path.resolve(dest), JSON.stringify(menu, null, 2) + "\n");
}

const invoked =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invoked) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
