import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { chooseCopyMethod, copyMethodCatalog, structureForFormat, suggestLine } from "./copy-method.js";
import { completeness, mergeClinicProfile, sanitizeClinicProfile } from "./clinic-profile.js";
import { brandGuard } from "./ai.js";

test("cada estrutura escolhe um método dentro do PRIME", () => {
  const expected = {
    post: "AIDA",
    bio: "4U",
    "link-na-bio": "StoryBrand",
    anuncio: "PAS",
    whatsapp: "PAS",
    site: "StoryBrand",
  };
  for (const [structure, name] of Object.entries(expected)) {
    const method = chooseCopyMethod(structure);
    assert.equal(method.name, name);
    assert.equal(method.structure, structure);
    assert.equal(method.prime, "Método PRIME");
  }
  assert.equal(copyMethodCatalog().length, 6);
  assert.equal(structureForFormat("carousel"), "post");
  assert.equal(structureForFormat("video"), "post");
  assert.equal(chooseCopyMethod("carousel").name, "AIDA");
});

test("a frase sugerida usa o perfil e passa no guarda-corpo", () => {
  const line = suggestLine("post", { cidade: "Curitiba", tom: "sóbrio", diferenciais: "luz natural" });
  assert.match(line.line, /Curitiba/);
  assert.match(line.line, /a gente/i);
  assert.equal(line.name, "AIDA");
  assert.deepEqual(brandGuard({ line: line.line, note: line.note }), []);
});

test("o perfil sanitiza o nicho e mede a completude", () => {
  const clean = sanitizeClinicProfile({ nicho: "odontologia", cidade: "  Santos ", extra: "não entra" });
  assert.equal(clean.nicho, "odonto");
  assert.equal(clean.cidade, "Santos");
  assert.equal(clean.extra, undefined);
  const merged = mergeClinicProfile({ nicho: "estetica", cidade: "Santos" }, { tom: "direto" });
  assert.equal(merged.nicho, "estetica");
  assert.equal(merged.cidade, "Santos");
  assert.equal(merged.tom, "direto");
  const score = completeness(merged);
  assert.equal(score.filled, 3);
  assert.equal(score.total, 10);
  assert.equal(score.percent, 30);
});

test("a migração do perfil é só aditiva", () => {
  const sql = fs.readFileSync(new URL("../../migrations/0003_clinic_profile.sql", import.meta.url), "utf8");
  assert.match(sql, /CREATE TABLE IF NOT EXISTS clinic_profile_versions/i);
  assert.doesNotMatch(sql, /\bDROP\s+TABLE\b/i);
  assert.doesNotMatch(sql, /\bDELETE\s+FROM\b/i);
  assert.doesNotMatch(sql, /\bALTER\s+TABLE\b/i);
});
