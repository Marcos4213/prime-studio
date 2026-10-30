import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  REWARDS,
  COPY,
  shareText,
  validateIndication,
  whatsappHref,
  referralInsert,
} from "./rewards.js";
import { SALA_WEBP_BASE64 } from "./photo.js";

test("recompensa não inventa mês, percentual, valor nem faturamento", () => {
  assert.equal(/[0-9]/.test(JSON.stringify(REWARDS)), false);
  assert.equal(REWARDS.cliente.desconto, false);
  assert.equal(REWARDS.cliente.servico_extra, null);
  assert.equal(REWARDS.cliente.indicador.meses, null);
  assert.equal(REWARDS.cliente.indicado.meses, null);
  assert.equal(REWARDS.profissional.indicador.percentual, null);
  assert.equal(REWARDS.profissional.indicador.valor, null);
  assert.equal(REWARDS.profissional.indicado.meses, null);
  assert.equal(/faturamento|R\$|%|meses|mês/i.test(JSON.stringify(COPY)), false);
  assert.match(COPY.cliente.nota, /Sem desconto/);
  assert.match(COPY.profissional.indicadorForma, /dinheiro ou permuta/);
});

test("recado de WhatsApp não promete número nem faturamento", () => {
  const text = shareText("Clínica Serra");
  assert.match(text, /Clínica Serra/);
  assert.equal(/faturamento|R\$|%|[0-9]|meses|desconto/i.test(text), false);
  assert.equal(/[0-9]/.test(shareText("")), false);
});

test("validação exige nome, contato e o lado de quem indica", () => {
  assert.equal(validateIndication({ referred_name: "A", referred_contact: "11988887777", referrer_type: "cliente" }).ok, false);
  assert.equal(validateIndication({ referred_name: "Aurora", referred_contact: "123", referrer_type: "cliente" }).ok, false);
  assert.equal(validateIndication({ referred_name: "Aurora", referred_contact: "11988887777", referrer_type: "parceiro" }).ok, false);
  const ok = validateIndication({
    referred_name: "  Clínica Aurora  ",
    referred_contact: " (11) 98888-7777 ",
    referrer_type: "profissional",
  });
  assert.equal(ok.ok, true);
  assert.equal(ok.name, "Clínica Aurora");
  assert.equal(ok.type, "profissional");
});

test("WhatsApp só abre com telefone completo e texto escapado", () => {
  const href = whatsappHref("(11) 98888-7777", "Oi & clínica");
  assert.equal(href.startsWith("https://wa.me/5511988887777?text="), true);
  assert.match(href, /Oi%20%26%20cl%C3%ADnica/);
  assert.equal(whatsappHref("sem-numero", "Oi"), null);
});

test("gravar indicação não mexe em acesso nem em preço", () => {
  const { sql } = referralInsert({
    id: "ind_1",
    clientId: "cli_1",
    name: "Aurora",
    contact: "11988887777",
    type: "cliente",
    created: "2026-10-30T00:00:00.000Z",
  });
  assert.match(sql, /status, created_at/);
  assert.match(sql, /'novo'/);
  assert.equal(/access_until|UPDATE|clients|meses|desconto/i.test(sql), false);
});

test("a foto servida é a sala real do repositório", () => {
  const file = readFileSync(new URL("./media/sala.webp", import.meta.url));
  const decoded = Buffer.from(SALA_WEBP_BASE64, "base64");
  assert.equal(file.equals(decoded), true);
  assert.equal(file.subarray(0, 4).toString(), "RIFF");
});
