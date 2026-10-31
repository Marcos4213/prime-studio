import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { loadFeatures, toMenu, findFeaturesDir } from "./load.js";

async function feature(root, id, json) {
  const dir = path.join(root, id);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "feature.json"), JSON.stringify(json), "utf8");
}

test("ordena por order e pelo título em pt", () => {
  const menu = toMenu([
    { id: "b", title: "Ícone", href: "/icone", order: 2 },
    { id: "a", title: "Aula", href: "/aula", order: 2 },
    { id: "c", title: "Presença", href: "/presenca", order: 1 },
  ]);
  assert.deepEqual(
    menu.map((m) => m.title),
    ["Presença", "Aula", "Ícone"]
  );
});

test("descarta href externo, vazio e com ..", () => {
  const menu = toMenu([
    { title: "Ok", href: "/presenca", order: 1 },
    { title: "Hash", href: "#bio", order: 2 },
    { title: "Externo", href: "https://evil.test" },
    { title: "Proto", href: "//evil.test" },
    { title: "Script", href: "javascript:alert(1)" },
    { title: "Sobe", href: "/ok/../x" },
    { title: "", href: "/vazio" },
    { title: "Sem caminho", href: "" },
  ]);
  assert.deepEqual(
    menu.map((m) => m.href),
    ["/presenca", "#bio"]
  );
});

test("order ausente vai para o fim e order inválido também", () => {
  const menu = toMenu([
    { title: "Sem", href: "/sem" },
    { title: "Ruim", href: "/ruim", order: "nao" },
    { title: "Primeiro", href: "/primeiro", order: 0 },
  ]);
  assert.equal(menu[0].title, "Primeiro");
  assert.equal(menu[1].order, 100);
  assert.equal(menu[2].order, 100);
});

test("lê feature.json das subpastas e ignora o que não é frente", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "prime-features-"));
  try {
    await feature(root, "bio", { title: "Link na bio", href: "/bio", order: 5 });
    await feature(root, "presenca", { title: "Presença", href: "/presenca", order: 20 });
    await feature(root, "quebrado", { title: "X", href: "https://evil.test", order: 1 });
    await mkdir(path.join(root, "sem-json"), { recursive: true });
    await writeFile(path.join(root, "nota.txt"), "nao e pasta", "utf8");
    await mkdir(path.join(root, "json-ruim"), { recursive: true });
    await writeFile(path.join(root, "json-ruim", "feature.json"), "{", "utf8");

    const menu = await loadFeatures(root);
    assert.deepEqual(
      menu.map((m) => m.id),
      ["bio", "presenca"]
    );
    assert.equal(menu[0].title, "Link na bio");
    assert.equal(menu[1].href, "/presenca");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("a pasta real de features resolve e não quebra sem feature.json", async () => {
  const dir = await findFeaturesDir();
  assert.ok(dir && dir.endsWith(`${path.sep}features`));
  const menu = await loadFeatures(dir);
  assert.ok(Array.isArray(menu));
});
