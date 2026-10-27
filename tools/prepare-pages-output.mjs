#!/usr/bin/env node
/**
 * Monta o diretório que o Cloudflare Pages publica.
 *
 * O `wrangler pages deploy` não lê `.assetsignore`. A lista de exclusão
 * do upload é fixa (functions, node_modules, .git, .wrangler e alguns
 * meta-arquivos). Com `pages_build_output_dir = "."`, a pasta `clientes/`
 * iria para o ar. Este script copia o site para `dist/` sem essa pasta.
 *
 * Uso: node tools/prepare-pages-output.mjs
 */
import { cp, mkdir, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "dist");

/** Não copiar para o output. `clientes` é a exclusão de publicação. */
const skipAtRoot = new Set([
  "clientes",
  ".git",
  "node_modules",
  ".wrangler",
  "dist",
  "_site",
  ".jekyll-cache",
]);

/** Mesma lista fixa de `wrangler pages deploy` (src/pages/validate.ts). */
const pagesIgnoreExact = new Set([
  "_worker.js",
  "_redirects",
  "_headers",
  "_routes.json",
  "functions",
  ".wrangler",
]);

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

for (const entry of await readdir(root, { withFileTypes: true })) {
  if (skipAtRoot.has(entry.name) || entry.isSymbolicLink()) continue;
  await cp(path.join(root, entry.name), path.join(out, entry.name), {
    recursive: true,
  });
}

function ignoredByPages(relativePath) {
  const norm = relativePath.split(path.sep).join("/");
  if (pagesIgnoreExact.has(norm)) return true;
  if (norm === ".git" || norm.startsWith(".git/") || norm.includes("/.git/")) return true;
  if (
    norm === "node_modules" ||
    norm.startsWith("node_modules/") ||
    norm.includes("/node_modules/")
  ) {
    return true;
  }
  if (norm === ".DS_Store" || norm.endsWith("/.DS_Store")) return true;
  return false;
}

async function pagesFileMap(directory, skipTop = new Set()) {
  const files = [];

  async function walk(current) {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const absolute = path.join(current, entry.name);
      const rel = path.relative(directory, absolute);
      if (!rel.includes(path.sep) && skipTop.has(rel)) continue;
      if (ignoredByPages(rel)) continue;
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) {
        await walk(absolute);
        continue;
      }
      const info = await stat(absolute);
      if (!info.isFile()) continue;
      files.push(rel.split(path.sep).join("/"));
    }
  }

  await walk(directory);
  files.sort();
  return files;
}

const published = await pagesFileMap(out);
const onRoot = await pagesFileMap(root, new Set(["dist"]));
const leaked = published.filter((file) => file === "clientes" || file.startsWith("clientes/"));
const onRootClientes = onRoot.filter((file) => file === "clientes" || file.startsWith("clientes/"));
const required = ["index.html", "raio-x.html", "links.html", "guia.html", "assets/style.css"];
const missing = required.filter((file) => !published.includes(file));

console.log(`Output: ${path.relative(root, out) || "."}`);
console.log(`Arquivos que o Pages enviaria a partir de dist/: ${published.length}`);
console.log(`Arquivos de clientes/ na raiz (deploy de .): ${onRootClientes.length}`);
console.log(`Arquivos de clientes/ em dist/: ${leaked.length}`);

if (leaked.length || missing.length) {
  if (leaked.length) console.error(`Vazou: ${leaked.join(", ")}`);
  if (missing.length) console.error(`Faltou no output: ${missing.join(", ")}`);
  process.exit(1);
}

console.log("clientes/ ficou fora do output do Pages.");
