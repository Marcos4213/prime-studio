import assert from "node:assert/strict";
import test from "node:test";
import { provasForPiece, stripPatientCounts } from "./provas.js";

test("a contagem de pacientes sai, inclusive a grafia já gravada", () => {
  assert.equal(stripPatientCounts("Mais de 100mil paciêntes"), "");
  assert.equal(stripPatientCounts("Mais de 100 mil pacientes"), "");
  assert.equal(provasForPiece("Formação em casa. Mais de 100mil paciêntes."), "Formação em casa.");
  assert.doesNotMatch(stripPatientCounts("2.000 pacientes atendidos"), /\d|paci[eê]nte/i);
  assert.doesNotMatch(stripPatientCounts("Tempo de casa, sem número."), /paciente/i);
});
