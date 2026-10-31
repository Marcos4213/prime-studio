import assert from "node:assert/strict";
import test from "node:test";
import { pieceEstado, weekBars } from "./hoje.js";

test("a semana só marca o dia que a tela sabe", () => {
  const now = new Date("2026-10-31T15:00:00Z");
  const bars = weekBars(
    [
      { day: "2026-10-31", site: 1, instagram: 0, google: 0, bio: 0 },
      { day: "2026-10-30", site: 0, instagram: 0, google: 0, bio: 0 },
      { day: "2026-10-20", site: 1, instagram: 1, google: 1, bio: 1 },
    ],
    now
  );
  assert.deepEqual(
    bars.map((bar) => bar.label),
    ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
  );
  assert.deepEqual(
    bars.map((bar) => bar.visto),
    [false, false, false, false, false, true, false]
  );
  assert.equal(bars[5].day, "2026-10-31");
  assert.equal("total" in bars[0], false);
});

test("o estado da peça de hoje sai do que está gravado", () => {
  const today = "2026-10-31";
  assert.equal(pieceEstado([], today).label, "Em aberto");
  assert.equal(
    pieceEstado([{ status: "rascunho", created_at: "2026-10-31T15:00:00Z" }], today).label,
    "Pronta para o OK"
  );
  assert.equal(
    pieceEstado([{ status: "aprovado", created_at: "2026-10-31T18:00:00Z" }], today).label,
    "Já vista"
  );
  assert.equal(
    pieceEstado([{ status: "rascunho", created_at: "2026-10-30T15:00:00Z" }], today).label,
    "Em aberto"
  );
});
