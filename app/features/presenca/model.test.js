import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildView, daysLabel, normalizeAddress, saoPauloDay, summarize } from "./model.js";

test("endereço vazio é ausência, não um link", () => {
  assert.deepEqual(normalizeAddress("site", "  "), { ok: true, value: "", href: null });
});

test("rejeita esquema perigoso e guarda o endereço escrito", () => {
  assert.equal(normalizeAddress("site", "javascript:alert(1)").ok, false);
  assert.equal(normalizeAddress("bio", "data:text/html,hi").ok, false);
  const written = normalizeAddress("google", "Rua da Clínica, 120");
  assert.equal(written.ok, true);
  assert.equal(written.value, "Rua da Clínica, 120");
  assert.equal(written.href, null);
  const note = normalizeAddress("instagram", "perfil com espaço");
  assert.equal(note.ok, true);
  assert.equal(note.href, null);
});

test("aceita site https e perfil @ do Instagram", () => {
  const site = normalizeAddress("site", "https://clinica.example/sobre");
  assert.equal(site.ok, true);
  assert.equal(site.href, "https://clinica.example/sobre");
  const ig = normalizeAddress("instagram", "@Prime.Studio");
  assert.equal(ig.value, "@Prime.Studio");
  assert.equal(ig.href, "https://instagram.com/Prime.Studio");
});

test("o resumo fala as portas vistas e não inventa contagem", () => {
  assert.equal(summarize([]), "Nenhuma porta vista hoje.");
  assert.equal(summarize(["instagram"]), "Você viu o Instagram hoje.");
  assert.equal(summarize(["bio", "site"]), "Você viu o site hoje.");
  assert.equal(summarize(["bio"]), "Nenhuma porta vista hoje.");
  assert.equal(summarize(["site", "instagram", "google", "bio"]), "As três portas vistas hoje.");
  assert.equal(daysLabel(0), "");
  assert.equal(daysLabel(1), "1 dia com olhar registrado.");
  assert.equal(daysLabel(3), "3 dias com olhar registrado.");
});

test("a visão não traz métrica nem número quando nada foi medido", () => {
  const view = buildView({
    profile: { site: "javascript:alert(1)", instagram: "@aura" },
    look: null,
    days: 0,
    clinic: "Aura",
    now: new Date("2026-10-30T15:00:00Z"),
  });
  assert.equal(view.clinic, "Aura");
  assert.equal(view.today.date, "2026-10-30");
  assert.equal(view.days_label, "");
  assert.equal(view.summary, "Nenhuma porta vista hoje.");
  assert.deepEqual(
    view.channels.map((c) => c.id),
    ["site", "instagram", "google"]
  );
  assert.deepEqual(
    view.channels.map((c) => c.reading),
    ["sem_leitura", "sem_leitura", "sem_leitura"]
  );
  assert.equal(view.channels.some((c) => c.id === "bio" || c.title === "Link na bio"), false);
  assert.equal("metric" in view || view.channels.some((c) => "metric" in c || "value" in c), false);
  assert.equal(view.channels[0].href, null);
  assert.equal(view.channels[1].href, "https://instagram.com/aura");
});

test("o link na bio gravado não abre como porta", () => {
  const view = buildView({
    profile: { site: "https://clinica.example", bio: "https://clinica.example/bio" },
    look: { site: 1, instagram: 0, google: 0, bio: 1 },
    days: 2,
    clinic: "Aura",
    now: new Date("2026-10-30T15:00:00Z"),
  });
  assert.deepEqual(
    view.channels.map((c) => c.id),
    ["site", "instagram", "google"]
  );
  assert.equal(JSON.stringify(view.channels).includes("clinica.example/bio"), false);
  assert.equal(view.summary, "Você viu o site hoje.");
});

test("a cópia servida é a mesma tela", () => {
  for (const name of ["client.js", "presenca.css"]) {
    const source = readFileSync(new URL(`./${name}`, import.meta.url));
    const served = readFileSync(new URL(`../../public/presenca/${name}`, import.meta.url));
    assert.deepEqual(source, served);
  }
});

test("o dia da presença segue o fuso de São Paulo", () => {
  assert.equal(saoPauloDay(new Date("2026-10-30T02:30:00Z")), "2026-10-29");
  assert.equal(saoPauloDay(new Date("2026-10-30T15:00:00Z")), "2026-10-30");
});
