import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  sanitizeDraft,
  contentHash,
  editorDraft,
  reviewState,
  readyIssues,
  coversFor,
  emptyDraft,
} from "./model.js";
import { EDITOR_JS } from "./editor-inline.js";

test("rascunho vazio nasce com as quatro portas", () => {
  const draft = emptyDraft("Clínica Luz");
  assert.equal(draft.display_name, "Clínica Luz");
  assert.deepEqual(
    draft.links.map((l) => l.id),
    ["whatsapp", "site", "instagram", "google"]
  );
  assert.equal(draft.cover, "");
  assert.equal(contentHash(draft), contentHash(draft));
});

test("normaliza WhatsApp, Instagram e site sem inventar destino vazio", () => {
  const { errors, draft } = sanitizeDraft({
    display_name: "Clínica Luz",
    line: "A paciente reconhece a clínica num instante.",
    cover: "sala",
    links: [
      { id: "whatsapp", label: "Falar no WhatsApp", url: "(11) 98888-7777", visible: true },
      { id: "instagram", label: "Instagram", url: "@luz.clinica", visible: true },
      { id: "site", label: "Site", url: "luz.exemplo.com.br", visible: true },
      { id: "google", label: "Google", url: "", visible: false },
    ],
    highlights: ["Seg a sex, 9h às 18h", "Jardins", ""],
    alignment: { site: true, instagram: false, google: false },
  });
  assert.equal(errors.length, 0);
  assert.equal(draft.links.find((l) => l.id === "whatsapp").url, "https://wa.me/5511988887777");
  assert.equal(draft.links.find((l) => l.id === "instagram").url, "https://instagram.com/luz.clinica");
  assert.equal(draft.links.find((l) => l.id === "site").url, "https://luz.exemplo.com.br/");
  assert.equal(draft.links.find((l) => l.id === "google").visible, false);
  assert.equal(draft.highlights[2], "");
  const editor = editorDraft(draft);
  assert.equal(editor.links.find((l) => l.id === "whatsapp").url, "(11) 98888-7777");
  assert.equal(editor.links.find((l) => l.id === "instagram").url, "@luz.clinica");
});

test("a segunda passagem do mesmo rascunho não muda o endereço", () => {
  const first = sanitizeDraft({
    display_name: "Clínica Luz",
    links: [
      { id: "whatsapp", url: "11988887777" },
      { id: "instagram", url: "https://instagram.com/luz.clinica/" },
      { id: "site", url: "https://luz.exemplo.com.br" },
    ],
  }).draft;
  const second = sanitizeDraft(first).draft;
  assert.equal(contentHash(first), contentHash(second));
});

test("bloqueia faturamento, antes e depois, percentual, CPF e link perigoso", () => {
  const { errors } = sanitizeDraft({
    display_name: "Resultado de R$ 30 mil",
    line: "Antes e depois da clínica",
    links: [
      { id: "whatsapp", label: "20% off", url: "11988887777" },
      { id: "site", label: "Site", url: "javascript:alert(1)" },
      { id: "instagram", label: "Instagram", url: "não é um @" },
    ],
    highlights: ["CPF 123.456.789-09", "500 pacientes", "laudo"],
  });
  const fields = errors.map((e) => e.field).sort();
  assert.ok(fields.includes("display_name"));
  assert.ok(fields.includes("line"));
  assert.ok(fields.includes("links.whatsapp"));
  assert.ok(fields.includes("links.site"));
  assert.ok(fields.includes("links.instagram"));
  assert.ok(fields.includes("highlights.0"));
  assert.ok(fields.includes("highlights.1"));
  assert.ok(fields.includes("highlights.2"));
});

test("horário e sala com número passam", () => {
  const { errors } = sanitizeDraft({
    display_name: "Clínica Luz",
    line: "Cuidado de perto, no seu tempo.",
    highlights: ["Seg a sex, 9h às 18h", "Sala 2", "Como chegar"],
  });
  assert.equal(errors.length, 0);
});

test("capa desconhecida é descartada e a ordem das portas é respeitada", () => {
  const { draft } = sanitizeDraft({
    cover: "https://exemplo.com/foto.jpg",
    links: [
      { id: "google", label: "Google", url: "https://maps.google.com/?q=luz" },
      { id: "site", label: "Site", url: "https://luz.exemplo.com.br" },
    ],
  });
  assert.equal(draft.cover, "");
  assert.deepEqual(
    draft.links.map((l) => l.id),
    ["google", "site", "whatsapp", "instagram"]
  );
});

test("revisão fica em dia, envelhece em uma semana e marca mudança", () => {
  const now = Date.parse("2026-10-30T12:00:00Z");
  assert.equal(reviewState({ reviewedAt: null, contentHash: "a", reviewedHash: "" }).state, "none");
  assert.equal(
    reviewState({
      reviewedAt: "2026-10-28T12:00:00Z",
      contentHash: "a",
      reviewedHash: "a",
      now,
    }).state,
    "fresh"
  );
  assert.equal(
    reviewState({
      reviewedAt: "2026-10-20T12:00:00Z",
      contentHash: "a",
      reviewedHash: "a",
      now,
    }).state,
    "stale"
  );
  assert.equal(
    reviewState({
      reviewedAt: "2026-10-28T12:00:00Z",
      contentHash: "b",
      reviewedHash: "a",
      now,
    }).state,
    "drift"
  );
});

test("pronta exige revisão em dia, nome e uma porta", () => {
  const draft = emptyDraft("");
  assert.equal(readyIssues(draft, { state: "none" }).length, 3);
  draft.display_name = "Clínica Luz";
  draft.links[1].url = "https://luz.exemplo.com.br/";
  assert.deepEqual(readyIssues(draft, { state: "fresh" }), []);
});

test("o script publicado acompanha editor.js", () => {
  const src = readFileSync(new URL("./editor.js", import.meta.url), "utf8");
  assert.equal(EDITOR_JS, src);
});

test("odontologia vê o consultório primeiro; estética vê a sala", () => {
  assert.equal(coversFor("odontologia")[0].id, "consultorio");
  assert.equal(coversFor("estetica")[0].id, "sala");
  assert.equal(coversFor("saude")[0].id, "recepcao");
  assert.equal(coversFor("estetica").length, 4);
});
