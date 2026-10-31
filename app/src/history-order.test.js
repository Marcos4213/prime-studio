import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("o acervo pede itens em aberto antes da pilha de rascunho", () => {
  const src = readFileSync(new URL("./index.js", import.meta.url), "utf8");
  const start = src.indexOf("SELECT id, format, theme, source, status, created_at FROM pieces");
  assert.ok(start > 0);
  const order = src.slice(start, src.indexOf("LIMIT 100", start));
  const aberto = order.indexOf("status = 'aberto' THEN 0");
  const rascunho = order.indexOf("status = 'rascunho' THEN 1");
  assert.ok(aberto > 0);
  assert.ok(rascunho > aberto);
  assert.match(order, /ELSE 2 END, created_at DESC/);
  assert.doesNotMatch(order, /WHEN status = 'rascunho' THEN 0/);
});
