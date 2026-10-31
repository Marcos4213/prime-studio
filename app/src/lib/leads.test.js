import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { draftCommercialMessage, localLeadDraft } from "./ai.js";
import { handleLeads, monthSummary, parseValor, whatsappHandoffUrl } from "./leads.js";

const COUNT = "Mais de 100mil paciêntes";

test("mês vazio não fabrica total e o valor só soma o que foi digitado", () => {
  const now = new Date("2026-10-31T15:00:00Z");
  assert.deepEqual(monthSummary([], now), { vazio: true, leads: 0, fechados: 0, valor_centavos: null });
  const rows = [
    { status: "aberto", valor_centavos: 15000, created_at: "2026-10-02T15:00:00.000Z" },
    { status: "fechado", valor_centavos: null, created_at: "2026-10-03T15:00:00.000Z" },
    { status: "pago", valor_centavos: 20000, created_at: "2026-10-04T15:00:00.000Z" },
    { status: "pago", valor_centavos: 999, created_at: "2026-09-30T15:00:00.000Z" },
  ];
  assert.deepEqual(monthSummary(rows, now), { vazio: false, leads: 3, fechados: 2, valor_centavos: 20000 });
  assert.equal(parseValor("").centavos, null);
  assert.equal(parseValor("1.500,50").centavos, 150050);
  assert.equal(parseValor("nao").ok, false);
});

test("o link abre o WhatsApp da clínica com o texto, sem número e sem API", () => {
  const url = whatsappHandoffUrl("Olá, time");
  assert.match(url, /^https:\/\/wa\.me\/\?text=/);
  assert.equal(url.includes("wa.me/55"), false);
  assert.equal(decodeURIComponent(url.slice("https://wa.me/?text=".length)), "Olá, time");
});

test("sem chave o rascunho usa nome e serviço e não leva a contagem", async () => {
  const draft = await draftCommercialMessage(
    {},
    {
      name: "Ana Lima",
      servico: "avaliação comercial",
      historico: COUNT,
      subject: "follow-up",
      profile: { tom: "sóbrio", provas: COUNT },
    }
  );
  assert.equal(draft.source, "mock");
  assert.match(draft.text, /Ana Lima/);
  assert.match(draft.text, /avaliação comercial/);
  assert.equal(draft.text.includes("100mil"), false);
  assert.equal(/paci[eê]ntes/i.test(draft.text), false);
  assert.equal(JSON.stringify(draft).includes("AIza"), false);
  const local = localLeadDraft({ name: "Ana Lima", servico: "retorno", historico: COUNT, subject: "recuperacao" });
  assert.equal(/paci[eê]ntes|100\s*mil/i.test(local.text), false);
});

test("com chave o pedido não carrega a contagem e o fallback de modelo existe", async () => {
  const prev = globalThis.fetch;
  let body = "";
  let url = "";
  globalThis.fetch = async (target, opts) => {
    url = String(target);
    body = opts.body;
    return new Response(
      JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify({ text: "Aqui é o nosso time. Ana, seguimos a conversa." }) }] } }] }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  };
  try {
    const draft = await draftCommercialMessage(
      { GEMINI_API_KEY: "AIzaTESTKEYSHOULDNOTLEAK123456" },
      { name: "Ana", servico: "conversa", historico: COUNT, subject: "engajamento", profile: { provas: COUNT, cidade: "Curitiba" } }
    );
    assert.equal(draft.source, "ia");
    assert.match(url, /gemini-3\.8-flash:generateContent/);
    assert.equal(body.includes("100mil"), false);
    assert.equal(body.includes("paciêntes"), false);
    assert.equal(body.includes("AIzaTESTKEY"), false);
    assert.match(draft.text, /nosso time/i);
  } finally {
    globalThis.fetch = prev;
  }
});

function memoryDb() {
  const rows = [];
  const sqls = [];
  return {
    sqls,
    rows,
    prepare(sql) {
      sqls.push(sql);
      const state = { sql, binds: [] };
      const api = {
        bind(...args) {
          state.binds = args;
          return api;
        },
        async all() {
          return { results: rows.filter((row) => row.client_id === state.binds[0]) };
        },
        async first() {
          if (state.sql.includes("brand_profiles") || state.sql.includes("clinic_profile")) return null;
          return rows.find((row) => row.id === state.binds[0] && row.client_id === state.binds[1]) || null;
        },
        async run() {
          if (state.sql.startsWith("INSERT INTO commercial_leads")) {
            rows.push({
              id: state.binds[0],
              client_id: state.binds[1],
              name: state.binds[2],
              contact: state.binds[3],
              origin: state.binds[4],
              status: state.binds[5],
              servico: state.binds[6],
              valor_centavos: state.binds[7],
              whatsapp: state.binds[8],
              historico: state.binds[9],
              contatos: "",
              ultimo_contato: null,
              created_at: state.binds[10],
            });
          }
          if (state.sql.includes("SET ultimo_contato")) {
            const row = rows.find((item) => item.id === state.binds[2] && item.client_id === state.binds[3]);
            if (row) {
              row.ultimo_contato = state.binds[0];
              row.contatos = state.binds[1];
            }
          }
          return { meta: { changes: 1 } };
        },
      };
      return api;
    },
  };
}

function req(path, body) {
  return new Request("https://central.test" + path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body || {}),
  });
}

test("gerar o rascunho não registra contato; o botão registra", async () => {
  const db = memoryDb();
  const env = { DB: db };
  const client = { id: "cli_1", name: "Prime" };
  const created = await handleLeads(
    req("/api/leads", { name: "Ana Lima", contact: "11 99999-0000", origin: "balcão", servico: "conversa", valor: "150,00", status: "aberto", whatsapp: "11999990000" }),
    env,
    new URL("https://central.test/api/leads"),
    client
  );
  const item = (await created.json()).item;
  assert.equal(item.ultimo_contato, null);
  assert.equal(item.valor_centavos, 15000);
  const draft = await handleLeads(
    req(`/api/leads/${item.id}/mensagem`, { assunto: "remarcacao" }),
    env,
    new URL(`https://central.test/api/leads/${item.id}/mensagem`),
    client
  );
  const drafted = await draft.json();
  assert.equal(drafted.ok, true);
  assert.equal(drafted.ultimo_contato, null);
  assert.match(drafted.text, /Ana Lima/);
  const hand = await handleLeads(
    req(`/api/leads/${item.id}/whatsapp`, { text: drafted.text, assunto: "remarcacao" }),
    env,
    new URL(`https://central.test/api/leads/${item.id}/whatsapp`),
    client
  );
  const sent = await hand.json();
  assert.match(sent.url, /^https:\/\/wa\.me\/\?text=/);
  assert.equal(typeof sent.ultimo_contato, "string");
  assert.match(sent.item.contatos, /Remarcação/);
  const sql = db.sqls.join("\n");
  assert.equal(/\bDELETE\b/i.test(sql), false);
  assert.equal(sql.includes("DROP"), false);
});

test("a migração do caderno é só aditiva", () => {
  const sql = readFileSync(new URL("../../migrations/0004_commercial_leads.sql", import.meta.url), "utf8");
  assert.match(sql, /CREATE TABLE IF NOT EXISTS commercial_leads/i);
  assert.match(sql, /whatsapp/i);
  assert.match(sql, /ultimo_contato/i);
  assert.match(sql, /valor_centavos/i);
  const body = sql.replace(/--.*$/gm, "");
  assert.doesNotMatch(sql, /\bDROP\s+TABLE\b/i);
  assert.doesNotMatch(sql, /\bDELETE\s+FROM\b/i);
  assert.doesNotMatch(sql, /\bUPDATE\s+\w+\s+SET\b/i);
  assert.doesNotMatch(body, /paciente|queixa|procedimento|prontu[aá]rio/i);
});
