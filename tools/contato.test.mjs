import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";

const contatoSrc = readFileSync(new URL("../assets/contato.js", import.meta.url), "utf8");
const sandbox = { globalThis: {}, module: { exports: {} }, console };
sandbox.globalThis = sandbox;
vm.runInNewContext(contatoSrc, sandbox);
const C = sandbox.PRIME_CONTATO;

test("nicho do anúncio", () => {
  assert.equal(C.normNicho("implantes"), "implantes");
  assert.equal(C.normNicho("Lentes"), "lentes");
  assert.equal(C.normNicho("plástica"), "plastica");
  assert.equal(C.normNicho("estetica"), "estetica");
  assert.equal(C.normNicho(""), "");
  assert.equal(C.normNicho("nutricao"), "");
  assert.match(C.NICHOS.implantes, /Implantes/);
  assert.match(C.NICHOS.plastica, /primeira escolha/);
});

test("variante forçada, persistida e 50/50", () => {
  assert.equal(C.normVariante("1"), "1");
  assert.equal(C.normVariante("A"), "1");
  assert.equal(C.normVariante("7"), "7");
  assert.equal(C.normVariante("problema"), "7");
  assert.equal(C.normVariante("3"), "");
  assert.equal(C.assignVariante("7", "1"), "7");
  assert.equal(C.assignVariante("", "1"), "1");
  assert.equal(C.assignVariante("", "", () => 0.1), "1");
  assert.equal(C.assignVariante("", "", () => 0.9), "7");
  assert.equal(C.COPY["1"].h, "Mais pacientes de alto valor, sem depender de indicação. Estrutura pronta em até 7 dias.");
  assert.match(C.COPY["1"].s, /até 7 dias/);
  assert.match(C.COPY["1"].s, /90 dias/);
  assert.doesNotMatch(C.COPY["1"].h, /em 90 dias/);
  assert.match(C.COPY["7"].h, /Quanto custa/);
  assert.equal(C.COPY["1"].h.startsWith("Você"), false);
  assert.equal(C.COPY["7"].h.startsWith("Você"), false);
});

test("faixa ≥ R$ 30 mil qualifica", () => {
  assert.equal(!!C.QUAL["10_30k"], false);
  assert.equal(!!C.QUAL["ate_10k"], false);
  assert.equal(!!C.QUAL["30_80k"], true);
  assert.equal(!!C.QUAL["80_150k"], true);
  assert.equal(!!C.QUAL["acima_150k"], true);
});

function kv() {
  const store = new Map();
  return {
    store,
    LEADS: {
      async put(k, v) { store.set(k, v); },
      async get(k) { return store.get(k); }
    }
  };
}

test("POST /api/lead grava variante, nicho e dispara Lead + SubmitApplication", async () => {
  const calls = [];
  const prev = globalThis.fetch;
  globalThis.fetch = async (url, opts) => {
    calls.push({ url: String(url), body: opts?.body ? JSON.parse(opts.body) : null });
    return new Response(JSON.stringify({ events_received: 1 }), { status: 200, headers: { "content-type": "application/json" } });
  };
  try {
    const { onRequestPost } = await import("../functions/api/lead.js?contato=1");
    const { store, LEADS } = kv();
    const env = { LEADS, META_CAPI_TOKEN: "tok", META_PIXEL_ID: "997004479351209" };
    const body = {
      nome: "Ana Costa", whatsapp: "11988887777", clinica: "Clínica Raiz",
      subnicho: "Implantes", nicho_key: "odonto", nicho_anuncio: "implantes", variante: "7",
      faturamento: "30_80k", origem: "contato", nivel: "quente",
      atribuicao: { utm_source: "meta", utm_campaign: "0211", fbclid: "fb123", nicho: "implantes", variante: "7" },
      pagina: "https://prime.devbrasil.online/contato?nicho=implantes&v=7",
      event_id: "evt-lead-contato-01", event_id_qual: "evt-qual-contato-01"
    };
    const res = await onRequestPost({
      request: new Request("https://prime.devbrasil.online/api/lead", { method: "POST", headers: { "content-type": "application/json", origin: "https://prime.devbrasil.online" }, body: JSON.stringify(body) }),
      env
    });
    const json = await res.json();
    assert.equal(json.ok, true);
    const saved = JSON.parse([...store.values()][0]);
    assert.equal(saved.variante, "7");
    assert.equal(saved.nicho_anuncio, "implantes");
    assert.equal(saved.qualificado, true);
    assert.equal(saved.atribuicao.utm_source, "meta");
    assert.equal(saved.atribuicao.fbclid, "fb123");
    const events = calls.filter(c => String(c.url).includes("graph.facebook.com")).map(c => c.body.data[0]);
    assert.deepEqual(events.map(e => e.event_name).sort(), ["Lead", "SubmitApplication"]);
    assert.equal(events.every(e => e.custom_data.variante === "7"), true);
    assert.equal(events.every(e => e.custom_data.content_name === "contato"), true);
    assert.equal(events.find(e => e.event_name === "Lead").event_id, "evt-lead-contato-01");
    assert.equal(events.find(e => e.event_name === "SubmitApplication").event_id, "evt-qual-contato-01");
    assert.equal(events[0].user_data.ph[0].length, 64);
  } finally {
    globalThis.fetch = prev;
  }
});

test("lead abaixo de R$ 30 mil não dispara SubmitApplication e o quiz segue sem variante", async () => {
  const calls = [];
  const prev = globalThis.fetch;
  globalThis.fetch = async (url, opts) => {
    calls.push({ url: String(url), body: opts?.body ? JSON.parse(opts.body) : null });
    return new Response(JSON.stringify({ events_received: 1 }), { status: 200 });
  };
  try {
    const { onRequestPost } = await import("../functions/api/lead.js?contato=2");
    const env = { ...kv(), META_CAPI_TOKEN: "tok" };
    env.LEADS = env.LEADS;
    const low = await onRequestPost({
      request: new Request("https://prime.devbrasil.online/api/lead", { method: "POST", body: JSON.stringify({
        nome: "Lia", whatsapp: "11977776666", clinica: "Studio", faturamento: "10_30k", origem: "contato", variante: "1",
        event_id: "evt-lead-baixo-0001", event_id_qual: "evt-qual-baixo-0001"
      }) }),
      env: { LEADS: env.LEADS, META_CAPI_TOKEN: "tok" }
    });
    assert.equal((await low.json()).ok, true);
    const names = calls.filter(c => String(c.url).includes("graph.facebook.com")).map(c => c.body.data[0].event_name);
    assert.deepEqual(names, ["Lead"]);

    calls.length = 0;
    const quiz = await onRequestPost({
      request: new Request("https://prime.devbrasil.online/api/lead", { method: "POST", body: JSON.stringify({
        nome: "Rui", whatsapp: "11966665555", clinica: "Odonto", email: "rui@clinica.com", origem: "lp-raio-x",
        faturamento: "80_150k", nota: 42, event_id: "evt-quiz-lead-0001", event_id_qual: "evt-quiz-qual-0001"
      }) }),
      env: { LEADS: env.LEADS, META_CAPI_TOKEN: "tok" }
    });
    assert.equal((await quiz.json()).ok, true);
    const qEvents = calls.filter(c => String(c.url).includes("graph.facebook.com")).map(c => c.body.data[0]);
    assert.deepEqual(qEvents.map(e => e.event_name).sort(), ["Lead", "SubmitApplication"]);
    assert.equal(qEvents[0].custom_data.content_name, "lp-raio-x");
    assert.equal(qEvents[0].custom_data.variante, undefined);
  } finally {
    globalThis.fetch = prev;
  }
});
